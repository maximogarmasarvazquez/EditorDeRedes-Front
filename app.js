import { initMap, setMapReferencePoints, addNodeToMap, updateMapWithNodes, referencePoints } from './js/map.js';
import { nodes, colors, gpsToCanvas } from './js/canvas.js';
import { getSubestaciones } from './data/data.js';
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
// INICIALIZACIÓN
// ========================
async function init() {
  try {
    const subestaciones = await getSubestaciones();
     if (!subestaciones.length) return;

    // Centrar mapa
    const avgLat = subestaciones.reduce((sum, s) => sum + s.latitud, 0) / subestaciones.length;
    const avgLon = subestaciones.reduce((sum, s) => sum + s.longitud, 0) / subestaciones.length;

    map = initMap(avgLat, avgLon);
    setMapReferencePoints(stage.width(), stage.height());

    // Dibujar subestaciones en canvas y mapa
    subestaciones.forEach((s) => {
      const { latitud, longitud, ubicacion, potencia, id_subestacion } = s;
      const pos = gpsToCanvas(latitud, longitud, referencePoints);

      const circle = new Konva.Circle({
        x: pos?.x || 0,
        y: pos?.y || 0,
        radius: 8,
        fill: colors.subestacion,
        stroke: "black",
        strokeWidth: 1,
      });

      circle.type = "subestacion";
      circle.ubicacion = ubicacion || `Subestación ${id_subestacion}`;
      circle.potencia = potencia || "N/A";
      circle.lat = latitud;
      circle.lon = longitud;

      circle.on("mouseover", () => {
        tooltip.getText().text(`${circle.ubicacion}\nPotencia: ${circle.potencia}\nGPS: ${circle.lat.toFixed(6)}, ${circle.lon.toFixed(6)}`);
        tooltip.position({ x: circle.x() + 10, y: circle.y() - 10 });
        tooltip.show();
        layer.draw();
      });
      circle.on("mouseout", () => { tooltip.hide(); layer.draw(); });

      layer.add(circle);
      nodes.push(circle);
      addNodeToMap(circle);
    });

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

// Exportamos para poder llamarlo desde HTML
window.switchView = switchView;
