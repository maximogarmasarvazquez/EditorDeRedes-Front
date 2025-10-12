import { nodeTypes } from '../data/nodesType.js';
import { gpsToCanvas } from './utils/canvasUtils.js';

export const nodes = [];

// Crear tooltip
export function createTooltip(layer) {
  const tooltip = new Konva.Label({ opacity: 0.8, visible: false });
  tooltip.add(new Konva.Tag({
    fill: "black",
    pointerDirection: "down",
    pointerWidth: 10,
    pointerHeight: 10,
    lineJoin: "round"
  }));
  tooltip.add(new Konva.Text({ text: "", fontFamily: "Calibri", fontSize: 14, padding: 5, fill: "white" }));
  layer.add(tooltip);
  return tooltip;
}

// Función genérica para dibujar nodos
export function drawNodes(layer, tooltip, data, type, referencePoints) {
  if (!nodeTypes[type]) {
    console.warn(`Tipo de nodo desconocido: ${type}`);
    return;
  }

  const { color, radius, tooltip: tooltipFn } = nodeTypes[type];

  data.forEach(item => {
    const lat = item.latitud ?? item.lat;
    const lon = item.longitud ?? item.lon;
    if (lat == null || lon == null) return;

    const pos = gpsToCanvas(lat, lon, referencePoints);

    const nodeData = { 
      ...item, 
      _id: type + "_" + (item._id || item.id_subestacion || item.id_poste || item.id_cuenta), 
      type, lat, lon 
    };

    const circle = new Konva.Circle({
      x: pos?.x || 0,
      y: pos?.y || 0,
      radius,
      fill: color,
      stroke: "black",
      strokeWidth: 1,
    });

    circle.data = nodeData;

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

    layer.add(circle);
    nodes.push(circle);

    // NO agregamos al mapa aquí
  });

  layer.draw();
}
