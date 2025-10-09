import { initMap, setMapReferencePoints, addNodeToMap, updateMapWithNodes, referencePoints } from './js/map.js';
import { nodes, colors, gpsToCanvas } from './js/canvas.js';
import { getSubestaciones, getPostes, getServiciosxcuentas } from './data/data.js';
import { nodeTypes } from './data/nodesType.js'; // importa tu configuración

// ========================
// MAPA GLOBAL
// ========================
let map = null;

// ========================
// STAGE KONVA
// ========================
const stage = new Konva.Stage({
  container: "container",
  width: window.innerWidth - 320,
  height: window.innerHeight - 40,
  draggable: true,
});

const layer = new Konva.Layer();
stage.add(layer);

// Tooltip
const tooltip = new Konva.Label({ opacity: 0.8, visible: false });
tooltip.add(new Konva.Tag({ fill: "black", pointerDirection: "down", pointerWidth: 10, pointerHeight: 10, lineJoin: "round" }));
tooltip.add(new Konva.Text({ text: "", fontFamily: "Calibri", fontSize: 14, padding: 5, fill: "white" }));
layer.add(tooltip);


// ========================
// FUNCIÓN GENÉRICA PARA DIBUJAR NODOS
// ========================
function drawNodes(data, type) {
  if (!nodeTypes[type]) {
    console.warn(`Tipo de nodo desconocido: ${type}`);
    return;
  }

  const { color, radius, tooltip: tooltipFn } = nodeTypes[type];

  data.forEach((item) => {
    // Obtener coordenadas
    const lat = item.latitud ?? item.lat;
    const lon = item.longitud ?? item.lon;
    if (lat == null || lon == null) {
      console.warn("Nodo sin coordenadas:", item);
      return;
    }

    const pos = gpsToCanvas(lat, lon, referencePoints);

    // Crear nodo genérico con ID único
    const nodeData = { ...item, _id: type + "_" + (item._id || item.id_subestacion || item.id_poste || item.id_cuenta),
       type, lat, lon   
    };

    // Círculo Konva
    const circle = new Konva.Circle({
      x: pos?.x || 0,
      y: pos?.y || 0,
      radius,
      fill: color,
      stroke: "black",
      strokeWidth: 1,
    });

    // Guardamos nodeData en el círculo
    circle.data = nodeData;

    // Tooltip dinámico
    circle.on("mouseover", () => {
      tooltip.getText().text(tooltipFn(nodeData));
      tooltip.position({ x: circle.x() + 10, y: circle.y() - 10 });
      tooltip.show();
      layer.draw();
    });

    circle.on("mouseout", () => {
      tooltip.hide();
      layer.draw();
    });

    // Agregamos círculo a Konva y a la lista de nodos
    layer.add(circle);
    nodes.push(circle);

    // Agregamos nodo al mapa Leaflet
    addNodeToMap(nodeData);
  });

  layer.draw();
}


// ========================
// INICIALIZACIÓN
// ========================
async function init() {
  try {
    const subestaciones = await getSubestaciones();
    const postes = await getPostes();
    const usuarios = await getServiciosxcuentas();

    if (!subestaciones.length && !postes.length && !usuarios.length) return;

    // Centrar mapa
    const avgLat = subestaciones.reduce((sum, s) => sum + s.latitud, 0) / subestaciones.length;
    const avgLon = subestaciones.reduce((sum, s) => sum + s.longitud, 0) / subestaciones.length;

    map = initMap(avgLat, avgLon);
    setMapReferencePoints(stage.width(), stage.height());

    // Dibujar nodos
    drawNodes(subestaciones, "subestacion");
    drawNodes(postes, "poste");
    drawNodes(usuarios, "usuario");

    layer.draw();
  } catch (err) {
    console.error(err);
  }
}

// ========================
// CAMBIO DE VISTA
// ========================
function switchView(view) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  document.querySelectorAll("#editor-view, #map-view").forEach((v) => v.classList.remove("active"));

  if (view === "editor") {
    document.querySelector(".tab:nth-child(1)").classList.add("active");
    document.getElementById("editor-view").classList.add("active");
  } else if (view === "map") {
    document.querySelector(".tab:nth-child(2)").classList.add("active");
    const mapView = document.getElementById("map-view");
    mapView.classList.add("active");

    if (map) {
      map.invalidateSize();
      updateMapWithNodes();
    }
  }
}

window.addEventListener("load", init);
window.addEventListener("resize", () => {
  stage.width(window.innerWidth - 320);
  stage.height(window.innerHeight - 40);
  layer.batchDraw();
  if (map) map.invalidateSize();
});

window.switchView = switchView;
