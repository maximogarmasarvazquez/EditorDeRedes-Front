import { initMap, setMapReferencePoints, referencePoints, addNodeToMap, clearMapMarkers } from './js/map.js';
import { nodes as canvasNodes, drawNodes, createTooltip } from './js/canvas.js';
import { getSubestaciones, getPostes, getUsuariosCompletos } from './data/data.js';

// ==============================
// STAGE KONVA
// ==============================
const stage = new Konva.Stage({
  container: "container",
  width: window.innerWidth - 320,
  height: window.innerHeight - 40,
  draggable: true,
});
const layer = new Konva.Layer();
stage.add(layer);

// Tooltip
const tooltip = createTooltip(layer);

// ==============================
// ZOOM
// ==============================
stage.on('wheel', (e) => {
  e.evt.preventDefault();
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();
  const scaleBy = 1.05;
  const direction = e.evt.deltaY > 0 ? 1 / scaleBy : scaleBy;
  const newScale = oldScale * direction;
  if (newScale < 0.2 || newScale > 5) return;
  stage.scale({ x: newScale, y: newScale });
  const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
  stage.position({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  layer.batchDraw();
});

// ==============================
// DATOS Y NODOS
// ==============================
let map = null;
let allNodes = { subestaciones: [], postes: [], usuarios: [] };

async function init() {
  const subestaciones = await getSubestaciones();
  const postes = await getPostes();
  const usuarios = await getUsuariosCompletos();

  allNodes = { subestaciones, postes, usuarios };

  // Si no hay ningún nodo, salir
  if (!subestaciones.length && !postes.length && !usuarios.length) {
    console.warn("No hay nodos para mostrar.");
    return;
  }

  // Combinar y filtrar solo los que tienen coordenadas válidas
  const combined = [...subestaciones, ...postes, ...usuarios].filter(n =>
    typeof n.latitud === 'number' &&
    typeof n.longitud === 'number' &&
    !isNaN(n.latitud) &&
    !isNaN(n.longitud)
  );

  // Si no hay ninguno válido, mostrar advertencia y usar coordenadas por defecto
  if (!combined.length) {
    console.warn("No hay nodos con coordenadas válidas. Centrado por defecto.");
    map = initMap(-31.4167, -64.1833, 15); // Córdoba como fallback
  } else {
    // Promedio de coordenadas válidas
    const avgLat = combined.reduce((sum, n) => sum + n.latitud, 0) / combined.length;
    const avgLon = combined.reduce((sum, n) => sum + n.longitud, 0) / combined.length;
    map = initMap(avgLat, avgLon, 15);
  }

  setMapReferencePoints(stage.width(), stage.height());
  renderAllNodes();

  // Asegurarse de que el mapa esté centrado en algún nodo visible
  const firstValidNode = combined[0];
  if (firstValidNode) {
    map.setView([firstValidNode.latitud, firstValidNode.longitud], 15);
  }
}
// ==============================
// RENDER NODOS KONVA + MAPA
// ==============================
function renderAllNodes(filter = { subestaciones: true, postes: true, usuarios: true }) {
  layer.removeChildren(); 
  if (filter.subestaciones) drawNodes(layer, tooltip, allNodes.subestaciones, "subestacion", referencePoints);
  if (filter.postes) drawNodes(layer, tooltip, allNodes.postes, "poste", referencePoints);
  if (filter.usuarios) drawNodes(layer, tooltip, allNodes.usuarios, "usuario", referencePoints);

  clearMapMarkers();
  if (!map) return;

  function normalizeNode(n, type) {
    const lat = n.latitud ?? n.lat;
    const lon = n.longitud ?? n.lon;
    const id = type + "_" + (n._id || n.id_subestacion || n.id_poste || n.id_cuenta);
    return { ...n, lat, lon, _id: id, type };
  }

function isValidCoord(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon);
}

if (filter.subestaciones)
  allNodes.subestaciones.forEach(n => {
    const node = normalizeNode(n, 'subestacion');
    if (isValidCoord(node.lat, node.lon)) addNodeToMap(node);
  });

if (filter.postes)
  allNodes.postes.forEach(n => {
    const node = normalizeNode(n, 'poste');
    if (isValidCoord(node.lat, node.lon)) addNodeToMap(node);
  });

if (filter.usuarios)
  allNodes.usuarios.forEach(n => {
    const node = normalizeNode(n, 'usuario');
    if (isValidCoord(node.lat, node.lon)) addNodeToMap(node);
  });

}

function toggleFilter(checkboxId, btn) {
  const checkbox = document.getElementById(checkboxId);
  checkbox.checked = !checkbox.checked;
  btn.classList.toggle('active', checkbox.checked);
  applyFilter();
}

// ==============================
// CAMBIO DE VISTA
// ==============================
function switchView(view) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll("#editor-view, #map-view").forEach(v => v.classList.remove("active"));

  if (view === "editor") {
    document.querySelector('button[onclick="switchView(\'editor\')"]').classList.add("active");
    document.getElementById("editor-view").classList.add("active");
  } else if (view === "map") {
    document.querySelector('button[onclick="switchView(\'map\')"]').classList.add("active");
    document.getElementById("map-view").classList.add("active");
    setTimeout(() => map?.invalidateSize({ animate: true }), 50);
  }
}

// ==============================
// ACTUALIZAR REFERENCIA Y RESIZE
// ==============================
function updateReferencePoints() {
  setMapReferencePoints(stage.width(), stage.height());
  renderAllNodes();
}

window.addEventListener("resize", () => {
  stage.width(window.innerWidth - 320);
  stage.height(window.innerHeight - 40);
  updateReferencePoints();
  map?.invalidateSize();
});

// ==============================
// FILTROS DE NODOS
// ==============================
window.addEventListener("load", () => {
  const subCheck = document.getElementById("filter-subestaciones");
  const posteCheck = document.getElementById("filter-postes");
  const userCheck = document.getElementById("filter-usuarios");

  [subCheck, posteCheck, userCheck].forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      renderAllNodes({
        subestaciones: subCheck.checked,
        postes: posteCheck.checked,
        usuarios: userCheck.checked
      });
    });
  });
});

function applyFilter() {
  const filter = {
    subestaciones: document.getElementById("filter-subestaciones").checked,
    postes: document.getElementById("filter-postes").checked,
    usuarios: document.getElementById("filter-usuarios").checked
  };
  renderAllNodes(filter);
}

// ==============================
// EXPOSICIÓN GLOBAL
// ==============================
window.switchView = switchView;
window.updateReferencePoints = updateReferencePoints;
window.applyFilter = applyFilter;
window.toggleFilter = toggleFilter;
window.addEventListener("load", init);
