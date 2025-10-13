// map.js
import { nodeTypes } from '../data/nodesType.js';

export let map = null;
export let referencePoints = {
  topLeft: { x: 0, y: 0, lat: null, lon: null },
  bottomRight: { x: 0, y: 0, lat: null, lon: null },
};

// Guardamos los markers del mapa
const mapMarkers = {};

// Inicializa el mapa Leaflet
export function initMap(lat, lon, zoom) {
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

  //  Obtener los límites geográficos actuales del mapa visible
  const bounds = map.getBounds();
  const northLat = bounds.getNorth();
  const westLon = bounds.getWest();
  const southLat = bounds.getSouth();
  const eastLon = bounds.getEast();

  //  Convertir las coordenadas GPS de las esquinas (NorthWest y SouthEast)
  //    a coordenadas de PÍXEL RELATIVAS al contenedor Leaflet.
  
  // CLAVE: map.latLngToContainerPoint() nos da la posición (x, y) de la coordenada GPS
  // DENTRO del div #map. Esto SINCERIZA el origen Konva/Leaflet.
  const nwPoint = map.latLngToContainerPoint([northLat, westLon]);
  const sePoint = map.latLngToContainerPoint([southLat, eastLon]);


  // Actualizar los puntos de referencia
  // Las coordenadas X/Y de Konva deben reflejar las coordenadas de contenedor de Leaflet.
  referencePoints.topLeft = { 
    x: nwPoint.x, 
    y: nwPoint.y, 
    lat: northLat, 
    lon: westLon 
  };
  referencePoints.bottomRight = { 
    x: sePoint.x, 
    y: sePoint.y, 
    lat: southLat, 
    lon: eastLon 
  };
}

// Agrega un nodo al mapa Leaflet
export function addNodeToMap(node) {
  if (!map || !node) return;

  const typeConfig = nodeTypes[node.type];
  if (!typeConfig) return;

  // Remueve marker previo si existe
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

// Limpia todos los markers del mapa
export function clearMapMarkers() {
  Object.values(mapMarkers).forEach(marker => map.removeLayer(marker));
  Object.keys(mapMarkers).forEach(key => delete mapMarkers[key]);
}

