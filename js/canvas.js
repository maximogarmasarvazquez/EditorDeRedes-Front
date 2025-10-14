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
  tooltip.add(new Konva.Text({
    text: "",
    fontFamily: "Calibri",
    fontSize: 14,
    padding: 5,
    fill: "white"
  }));
  layer.add(tooltip);
  return tooltip;
}

// Dibuja nodos
export function drawNodes(layer, tooltip, data, type, referencePoints) {
  const typeConfig = nodeTypes[type];
  if (!typeConfig) return;

  const { color, radius } = typeConfig;

  data.forEach(item => {
    const lat = item.latitud ?? item.lat;
    const lon = item.longitud ?? item.lon;
    if (lat == null || lon == null) return;

    const pos = gpsToCanvas(lat, lon, referencePoints);
    if (!pos) return;

    const nodeData = { 
      ...item,
      _id: type + "_" + (item._id || item.id_subestacion || item.id_poste || item.id_cuenta),
      type, lat, lon,
      baseRadius: radius
    };

    const circle = new Konva.Circle({
      x: pos.x,
      y: pos.y,
      radius,
      fill: color,
      stroke: "black",
      strokeWidth: 1,
      draggable: true
    });

    circle.data = nodeData;
    layer.add(circle);
    nodes.push(circle);
  });

  layer.batchDraw();
}

// Actualiza posiciones según referencia
export function updateNodesPositions(referencePoints) {
  nodes.forEach(circle => {
    const pos = gpsToCanvas(circle.data.lat, circle.data.lon, referencePoints);
    if (pos) circle.position({ x: pos.x, y: pos.y });
  });

  if (nodes.length > 0) nodes[0].getLayer()?.batchDraw();
}
