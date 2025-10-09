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
// CONVERSIÓN COORDENADAS
// ========================
export function gpsToCanvas(lat, lon, referencePoints) {
  if (!referencePoints.topLeft.lat || !referencePoints.bottomRight.lat) return null;

  const xRatio = (lon - referencePoints.topLeft.lon) / (referencePoints.bottomRight.lon - referencePoints.topLeft.lon);
  const yRatio = (lat - referencePoints.topLeft.lat) / (referencePoints.bottomRight.lat - referencePoints.topLeft.lat);

  const x = referencePoints.topLeft.x + (referencePoints.bottomRight.x - referencePoints.topLeft.x) * xRatio;
  const y = referencePoints.topLeft.y + (referencePoints.bottomRight.y - referencePoints.topLeft.y) * yRatio;

  return { x, y };
}

export function canvasToGPS(x, y, referencePoints) {
  if (!referencePoints.topLeft.lat || !referencePoints.bottomRight.lat) return null;

  const lat = referencePoints.topLeft.lat + (referencePoints.bottomRight.lat - referencePoints.topLeft.lat) * ((y - referencePoints.topLeft.y) / (referencePoints.bottomRight.y - referencePoints.topLeft.y));
  const lon = referencePoints.topLeft.lon + (referencePoints.bottomRight.lon - referencePoints.topLeft.lon) * ((x - referencePoints.topLeft.x) / (referencePoints.bottomRight.x - referencePoints.topLeft.x));

  return { lat, lon };
}
