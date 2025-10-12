// app.js
import { initMap, setMapReferencePoints, updateMapWithNodes, referencePoints } from './js/map.js';
import { nodes as canvasNodes, drawNodes, createTooltip } from './js/canvas.js';
import { getSubestaciones, getPostes, getUsuariosCompletos } from './data/data.js';
// STAGE KONVA
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

// ZOOM
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

// INICIALIZACIÓN
let map = null;
async function init() {
  const subestaciones = await getSubestaciones();
  const postes = await getPostes();
  const usuarios = await getUsuariosCompletos();
  
  if (!subestaciones.length && !postes.length && !usuarios.length) return;

  const avgLat = subestaciones.reduce((sum, s) => sum + s.latitud, 0) / subestaciones.length;
  const avgLon = subestaciones.reduce((sum, s) => sum + s.longitud, 0) / subestaciones.length;

  map = initMap(avgLat, avgLon);
  setMapReferencePoints(stage.width(), stage.height());

  drawNodes(layer, tooltip, subestaciones, "subestacion", referencePoints);
  drawNodes(layer, tooltip, postes, "poste", referencePoints);
  drawNodes(layer, tooltip, usuarios, "usuario", referencePoints);
}

// CAMBIO DE VISTA
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

// ACTUALIZAR REFERENCIA
function updateReferencePoints() {
  setMapReferencePoints(stage.width(), stage.height());
  updateMapWithNodes();
}

window.switchView = switchView;
window.updateReferencePoints = updateReferencePoints;
window.addEventListener("load", init);
window.addEventListener("resize", () => {
  stage.width(window.innerWidth - 320);
  stage.height(window.innerHeight - 40);
  layer.batchDraw();
  map?.invalidateSize();
});
