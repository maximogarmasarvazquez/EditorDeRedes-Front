import { nodeTypes } from '../data/nodesType.js';

export let map = null;
export let referencePoints = {
  topLeft: { x: 0, y: 0, lat: null, lon: null },
  bottomRight: { x: 0, y: 0, lat: null, lon: null },
};

const mapMarkers = new Map();

// Inicializa Leaflet
export function initMap(lat, lon, zoom) {
  if (!map) {
    map = L.map("map", { zoomAnimation: false }).setView([lat, lon], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.control.scale().addTo(map);
  } else {
    map.invalidateSize();
  }
  return map;
}

// Actualiza puntos de referencia para gpsToCanvas
export function setMapReferencePoints() {
  if (!map) return;

  const bounds = map.getBounds();
  const northLat = bounds.getNorth();
  const westLon = bounds.getWest();
  const southLat = bounds.getSouth();
  const eastLon = bounds.getEast();

  const nwPoint = map.latLngToContainerPoint([northLat, westLon]);
  const sePoint = map.latLngToContainerPoint([southLat, eastLon]);

  referencePoints.topLeft = { x: nwPoint.x, y: nwPoint.y, lat: northLat, lon: westLon };
  referencePoints.bottomRight = { x: sePoint.x, y: sePoint.y, lat: southLat, lon: eastLon };
}

// Agrega o actualiza nodo en Leaflet
export function addNodeToMap(node) {
  if (!map || !node) return;
  const typeConfig = nodeTypes[node.type];
  if (!typeConfig) return;

  if (mapMarkers.has(node._id)) {
    map.removeLayer(mapMarkers.get(node._id));
    mapMarkers.delete(node._id);
  }

  const marker = L.circleMarker([node.lat, node.lon], {
    radius: typeConfig.radius,
    color: "black",
    fillColor: typeConfig.color,
    fillOpacity: 0.9
  }).addTo(map);

  marker.bindPopup(typeConfig.popup(node));
  mapMarkers.set(node._id, marker);
}

// Limpia todos los markers
export function clearMapMarkers() {
  mapMarkers.forEach(marker => map.removeLayer(marker));
  mapMarkers.clear();
}
