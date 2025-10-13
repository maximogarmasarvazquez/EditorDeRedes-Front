// canvasUtils.js

import { referencePoints } from '../map.js';

// Convertir coordenadas de canvas a GPS
export function canvasToGPS(x, y) {
    const { topLeft, bottomRight } = referencePoints;
    if (!topLeft.lat || !bottomRight.lat) return null;

    const xRatio = (x - topLeft.x) / (bottomRight.x - topLeft.x);
    const yRatio = (y - topLeft.y) / (bottomRight.y - topLeft.y);

    const lat = topLeft.lat + (bottomRight.lat - topLeft.lat) * yRatio;
    const lon = topLeft.lon + (bottomRight.lon - topLeft.lon) * xRatio;

    return { lat, lon };
}

// Convertir coordenadas GPS a canvas
export function gpsToCanvas(lat, lon) {
    const { topLeft, bottomRight } = referencePoints;
    if (!topLeft.lat || !bottomRight.lat) return null;

    const xRatio = (lon - topLeft.lon) / (bottomRight.lon - topLeft.lon);
    const yRatio = (lat - topLeft.lat) / (bottomRight.lat - topLeft.lat);

    const x = topLeft.x + (bottomRight.x - topLeft.x) * xRatio;
    // Corregido: Usa topLeft.y
    const y = topLeft.y + (bottomRight.y - topLeft.y) * yRatio; 

    return { x, y };
}