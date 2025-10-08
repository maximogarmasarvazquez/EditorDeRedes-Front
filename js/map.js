import { nodes, colors } from './canvas.js';

let map = null;
let mapMarkers = {};
let mapLines = {};

export let referencePoints = {
  topLeft: { x: 0, y: 0, lat: null, lon: null },
  bottomRight: { x: 0, y: 0, lat: null, lon: null },
};

// ========================
// INICIALIZAR MAPA
// ========================
export function initMap(lat, lon, zoom = 15) {
  if (!map) {
    map = L.map("map").setView([lat, lon], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.control.scale().addTo(map);
  }

  map.invalidateSize();
  return map;
}

export function getMap() {
  return map;
}

// ========================
// PUNTOS DE REFERENCIA Y SINCRONIZACIÓN
// ========================
export function setMapReferencePoints(stageWidth, stageHeight) {
  if (!map) return;

  const bounds = map.getBounds();
  referencePoints.topLeft = { x: 0, y: 0, lat: bounds.getNorth(), lon: bounds.getWest() };
  referencePoints.bottomRight = { x: stageWidth, y: stageHeight, lat: bounds.getSouth(), lon: bounds.getEast() };

  // Guardar dentro de map por compatibilidad con app.js
  map._referencePoints = referencePoints;

  syncCanvasToMap();
}

function syncCanvasToMap() {
  if (!map) return;

  nodes.forEach((node) => {
    if (typeof node.x !== "function") return;

    const x = node.x();
    const y = node.y();

    const coords = {
      lat: referencePoints.topLeft.lat + (referencePoints.bottomRight.lat - referencePoints.topLeft.lat) * ((y - referencePoints.topLeft.y) / (referencePoints.bottomRight.y - referencePoints.topLeft.y)),
      lon: referencePoints.topLeft.lon + (referencePoints.bottomRight.lon - referencePoints.topLeft.lon) * ((x - referencePoints.topLeft.x) / (referencePoints.bottomRight.x - referencePoints.topLeft.x))
    };

    node.lat = coords.lat;
    node.lon = coords.lon;
    addNodeToMap(node);
  });

  updateConnectionsOnMap();
}

// ========================
// FUNCIONES PARA NODOS
// ========================
export function addNodeToMap(node) {
  if (!map) return;

  if (mapMarkers[node._id]) map.removeLayer(mapMarkers[node._id]);

  const marker = L.circleMarker([node.lat, node.lon], {
    radius: 6,
    color: "black",
    fillColor: colors[node.type],
    fillOpacity: 0.9,
  }).addTo(map);

  marker.bindPopup(
    `<b>${node.ubicacion}</b><br>Potencia: ${node.potencia}<br>${node.lat.toFixed(6)}, ${node.lon.toFixed(6)}`
  );

  mapMarkers[node._id] = marker;
}

export function updateConnectionsOnMap() {
  // Para líneas eléctricas
}

export function updateMapWithNodes() {
  if (!map) return;

  for (const id in mapMarkers) map.removeLayer(mapMarkers[id]);
  mapMarkers = {};

  nodes.forEach((node) => {
    if (node.lat && node.lon) addNodeToMap(node);
  });

  updateConnectionsOnMap();
}
