// canvasUtils.js
import { referencePoints } from '../map.js';

// ================================
// Canvas → GPS
// ================================
export function canvasToGPS(x, y) {
  const { topLeft, bottomRight } = referencePoints;
  if (!topLeft.lat || !bottomRight.lat) return null;

  const xRatio = (x - topLeft.x) / (bottomRight.x - topLeft.x);
  const yRatio = (y - topLeft.y) / (bottomRight.y - topLeft.y);

  const lon = topLeft.lon + xRatio * (bottomRight.lon - topLeft.lon);
  const lat = topLeft.lat - yRatio * (topLeft.lat - bottomRight.lat); 

  return { lat, lon };
}

// ================================
// GPS → Canvas
// ================================
export function gpsToCanvas(lat, lon) {
  const { topLeft, bottomRight } = referencePoints;
  if (!topLeft.lat || !bottomRight.lat) return null;

  const xRatio = (lon - topLeft.lon) / (bottomRight.lon - topLeft.lon);
  const yRatio = (topLeft.lat - lat) / (topLeft.lat - bottomRight.lat); 

  const x = topLeft.x + xRatio * (bottomRight.x - topLeft.x);
  const y = topLeft.y + yRatio * (bottomRight.y - topLeft.y);

  return { x, y };
}
