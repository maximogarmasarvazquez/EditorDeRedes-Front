// canvas.js
export const colors = {
  poste: "orange",
  transformador: "blue",
  seccionador: "green",
  subestacion: "red",
  usuario: "lime",
};

export let nodes = [];
export let connections = [];

// ========================
// FUNCIONES DE CONVERSIÓN
// ========================
export function canvasToGPS(x, y, referencePoints) {
  if (!referencePoints.topLeft.lat || !referencePoints.bottomRight.lat) return null;

  const xRatio = (x - referencePoints.topLeft.x) / (referencePoints.bottomRight.x - referencePoints.topLeft.x);
  const yRatio = (y - referencePoints.topLeft.y) / (referencePoints.bottomRight.y - referencePoints.topLeft.y);

  const lat = referencePoints.topLeft.lat + (referencePoints.bottomRight.lat - referencePoints.topLeft.lat) * yRatio;
  const lon = referencePoints.topLeft.lon + (referencePoints.bottomRight.lon - referencePoints.topLeft.lon) * xRatio;

  return { lat, lon };
}

export function gpsToCanvas(lat, lon, referencePoints) {
  if (!referencePoints.topLeft.lat || !referencePoints.bottomRight.lat) return null;

  const xRatio = (lon - referencePoints.topLeft.lon) / (referencePoints.bottomRight.lon - referencePoints.topLeft.lon);
  const yRatio = (lat - referencePoints.topLeft.lat) / (referencePoints.bottomRight.lat - referencePoints.topLeft.lat);

  const x = referencePoints.topLeft.x + (referencePoints.bottomRight.x - referencePoints.topLeft.x) * xRatio;
  const y = referencePoints.topLeft.y + (referencePoints.bottomRight.y - referencePoints.topLeft.y) * yRatio;

  return { x, y };
}
