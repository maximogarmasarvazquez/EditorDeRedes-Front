// map.js
import { nodes } from './canvas.js';
import { nodeTypes } from '../data/nodesType.js';

let map = null;
export let referencePoints = {
  topLeft: { x: 0, y: 0, lat: null, lon: null },
  bottomRight: { x: 0, y: 0, lat: null, lon: null },
};

const mapMarkers = {};

export function initMap(lat, lon, zoom = 15) {
  if (!map) {
    map = L.map("map").setView([lat, lon], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.control.scale().addTo(map);
  }

  map.invalidateSize();
  return map;
}

export function setMapReferencePoints(stageWidth, stageHeight) {
  if (!map) return;

  const bounds = map.getBounds();
  referencePoints.topLeft = { x: 0, y: 0, lat: bounds.getNorth(), lon: bounds.getWest() };
  referencePoints.bottomRight = { x: stageWidth, y: stageHeight, lat: bounds.getSouth(), lon: bounds.getEast() };
}

export function addNodeToMap(node) {
  if (!map || !node) return;

  const typeConfig = nodeTypes[node.type];
  if (!typeConfig) return;

  if (mapMarkers[node._id]) map.removeLayer(mapMarkers[node._id]);

  const marker = L.circleMarker([node.lat, node.lon], {
    radius: typeConfig.radius,
    color: "black",
    fillColor: typeConfig.color,
    fillOpacity: 0.9
  }).addTo(map);

  marker.bindPopup(typeConfig.popup(node));
  mapMarkers[node._id] = marker;
}

export function updateMapWithNodes() {
  if (!map) return;
  Object.values(mapMarkers).forEach(m => map.removeLayer(m));
  nodes.forEach(node => node.lat && node.lon && addNodeToMap(node.data));
}
