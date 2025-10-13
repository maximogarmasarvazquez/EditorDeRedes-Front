// app.js
import { initMap, setMapReferencePoints, referencePoints, addNodeToMap, clearMapMarkers, map } from './js/map.js'; 
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
// ZOOM (Controlado por Leaflet)
// =========================================================================
// ✅ CORRECCIÓN: El evento de zoom de Konva (wheel) ahora solo mueve Leaflet.
//    La sincronización real se dispara en el 'zoomend' de Leaflet (ver init).
// =========================================================================
stage.on('wheel', (e) => {
  e.evt.preventDefault();
  
  if (!map) return;

  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const currentZoom = map.getZoom();
  const newZoom = currentZoom + direction;
  
  if (newZoom >= map.getMinZoom() && newZoom <= map.getMaxZoom()) {
      const pointer = stage.getPointerPosition();
      
      // Compensar por el arrastre (pan) del Stage
      const mapPointerX = pointer.x - stage.x(); 
      const mapPointerY = pointer.y - stage.y();
      
      const mapLatLng = map.containerPointToLatLng([mapPointerX, mapPointerY]);
      
      // Aplicar zoom. La sincronización de Konva ocurrirá en el evento 'zoomend'.
      map.setView(mapLatLng, newZoom, { animate: false });
  }
});

// ==============================
// PAN (Arrastre del Stage)
// =========================================================================
// ✅ CORRECCIÓN: Tras arrastrar Konva, reseteamos Konva y movemos Leaflet.
//    La sincronización real se dispara en el 'moveend' de Leaflet (ver init).
// =========================================================================
stage.on('dragend', () => {
    if (!map) return;
    
    const stagePos = stage.position();
    const centerPointContainer = { 
        x: stage.width() / 2 - stagePos.x, 
        y: stage.height() / 2 - stagePos.y 
    };
    
    // 1. Mover Leaflet (sin animación para evitar desincronización)
    const newCenter = map.containerPointToLatLng([centerPointContainer.x, centerPointContainer.y]);
    map.setView(newCenter, map.getZoom(), { animate: false });
    
    // 2. Resetear el Stage Konva a (0, 0)
    stage.position({ x: 0, y: 0 });
    
    // 3. Forzar sincronización si 'moveend' no es confiable, pero idealmente se maneja
    //    con los listeners de Leaflet (ver función init).
    // updateReferencePointsAndRedraw(); // Descomentar si solo moveend no funciona.
});

// ==============================
// DATOS E INICIALIZACIÓN
// ==============================
let allNodes = { subestaciones: [], postes: [], usuarios: [] };

async function init() {
  // Asegurarse de que las funciones de data existen (simulación)
  const subestaciones = (typeof getSubestaciones === 'function') ? await getSubestaciones() : [];
  const postes = (typeof getPostes === 'function') ? await getPostes() : [];
  const usuarios = (typeof getUsuariosCompletos === 'function') ? await getUsuariosCompletos() : [];

  allNodes = { subestaciones, postes, usuarios };

  // Lógica de centrado del mapa
  const combined = [...subestaciones, ...postes, ...usuarios].filter(n =>
    typeof n.latitud === 'number' && typeof n.longitud === 'number' && !isNaN(n.latitud) && !isNaN(n.longitud)
  );

  if (!combined.length) {
    initMap(-31.4167, -64.1833, 15); 
  } else {
    const avgLat = combined.reduce((sum, n) => sum + n.latitud, 0) / combined.length;
    const avgLon = combined.reduce((sum, n) => sum + n.longitud, 0) / combined.length;
    initMap(avgLat, avgLon, 15);
  }

  setMapReferencePoints(stage.width(), stage.height());
  
  const firstValidNode = combined[0];
  if (firstValidNode && map) {
    map.setView([firstValidNode.latitud, firstValidNode.longitud], 15);
  }
    
  // CLAVE: Añadir listeners de Leaflet para asegurar la sincronización post-movimiento.
  if (map) {
    map.on('zoomend', () => {
      // Sincronización que se activa solo cuando Leaflet ha terminado el zoom.
      updateReferencePointsAndRedraw(); 
    });
    map.on('moveend', () => {
      // Sincronización que se activa solo cuando Leaflet ha terminado el pan/arrastre.
      updateReferencePointsAndRedraw(); 
    });
  }
    
  // Llamada de render inicial
  updateReferencePointsAndRedraw(); 
}

// ==============================
// FUNCIONES DE RENDER
// ==============================
function drawKonvaNodes(subestaciones, postes, usuarios) {
  layer.destroyChildren(); 
  createTooltip(layer); 
  canvasNodes.length = 0; 
  
  // Se asume que drawNodes usa gpsToCanvas() correctamente con los referencePoints corregidos.
  if (subestaciones && allNodes.subestaciones) drawNodes(layer, tooltip, allNodes.subestaciones, "subestacion", referencePoints);
  if (postes && allNodes.postes) drawNodes(layer, tooltip, allNodes.postes, "poste", referencePoints);
  if (usuarios && allNodes.usuarios) drawNodes(layer, tooltip, allNodes.usuarios, "usuario", referencePoints);
  
  layer.batchDraw();
}

function renderAllNodes(filter = { subestaciones: true, postes: true, usuarios: true }) {
  
  drawKonvaNodes(filter.subestaciones, filter.postes, filter.usuarios);

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

  // Adición de marcadores a Leaflet
  if (filter.subestaciones)
    allNodes.subestaciones.forEach(n => {
      const node = normalizeNode(n, 'subestacion');
      if (isValidCoord(node.lat, node.lon) && typeof addNodeToMap === 'function') addNodeToMap(node);
    });

  if (filter.postes)
    allNodes.postes.forEach(n => {
      const node = normalizeNode(n, 'poste');
      if (isValidCoord(node.lat, node.lon) && typeof addNodeToMap === 'function') addNodeToMap(node);
    });

  if (filter.usuarios)
    allNodes.usuarios.forEach(n => {
      const node = normalizeNode(n, 'usuario');
      if (isValidCoord(node.lat, node.lon) && typeof addNodeToMap === 'function') addNodeToMap(node);
    });
}

// ==============================
// SINCRONIZACIÓN
// ==============================
function updateReferencePointsAndRedraw() {
  // setMapReferencePoints utiliza el map y las dimensiones del stage
  setMapReferencePoints(stage.width(), stage.height()); 
  renderAllNodes();
}

window.addEventListener("resize", () => {
  stage.width(window.innerWidth - 320);
  stage.height(window.innerHeight - 40);
  updateReferencePointsAndRedraw();
  map?.invalidateSize();
});

// ==============================
// EXPOSICIÓN GLOBAL
// ==============================
window.updateReferencePoints = updateReferencePointsAndRedraw; 

// Funciones Auxiliares (mantener la lógica de filtros y vistas)
function toggleFilter(checkboxId, btn) {
  const checkbox = document.getElementById(checkboxId);
  checkbox.checked = !checkbox.checked;
  btn.classList.toggle('active', checkbox.checked);
  applyFilter();
}

function switchView(view) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll("#editor-view, #map-view").forEach(v => v.classList.remove("active"));

  if (view === "editor") {
    document.querySelector('button[onclick="switchView(\'editor\')"]').classList.add("active");
    document.getElementById("editor-view").classList.add("active");
    applyFilter(); 
  } else if (view === "map") {
    document.querySelector('button[onclick="switchView(\'map\')"]').classList.add("active");
    document.getElementById("map-view").classList.add("active");
    setTimeout(() => map?.invalidateSize({ animate: true }), 50);
  }
}

function applyFilter() {
  const filter = {
    subestaciones: document.getElementById("filter-subestaciones")?.checked,
    postes: document.getElementById("filter-postes")?.checked,
    usuarios: document.getElementById("filter-usuarios")?.checked
  };
  renderAllNodes(filter);
}

window.switchView = switchView;
window.applyFilter = applyFilter;
window.toggleFilter = toggleFilter;
window.addEventListener("load", init);