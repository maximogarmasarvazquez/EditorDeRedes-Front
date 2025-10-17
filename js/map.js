// map.js (Completo)

import { nodeTypes } from '../data/nodesType.js';
import { MAPBOX_TOKEN } from '../config.js';

export let map = null;
export let referencePoints = {
  topLeft: { x: 0, y: 0, lat: null, lon: null },
  bottomRight: { x: 0, y: 0, lat: null, lon: null },
};

const mapMarkers = new Map();
let currentMapType = "openstreet"; // por defecto

/**
 * Inicializa el mapa según el tipo seleccionado
 */
export function initMap(lat, lon, zoom, type = "openstreet") {
  currentMapType = type;
  const mapDiv = document.getElementById("map");
  mapDiv.innerHTML = "";

  // 🔄 eliminar mapa previo
  if (map) {
    if (map.remove) map.remove();
    map = null;
  }

  // === MAPBOX ===
  if (type === "mapbox") {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lon, lat],
      zoom,
      pitch: 0,
      bearing: 0,
      antialias: true
    });

    map.on('load', () => {
      console.log("🗺️ Mapbox listo");
      setMapReferencePoints();
      // Nota: El renderizado inicial de Konva se maneja en app.js/init() o por el toggle.
    });

    // Ajustar referencias al mover/zoom
    map.on('moveend', setMapReferencePoints);
    map.on('zoomend', setMapReferencePoints);

  } else {
    // === OPENSTREETMAP (Leaflet) ===
    // @ts-ignore
    map = L.map("map", { zoomAnimation: false }).setView([lat, lon], zoom);

    // @ts-ignore
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // @ts-ignore
    L.control.scale().addTo(map);

    setMapReferencePoints();

    map.on('moveend', setMapReferencePoints);
    map.on('zoomend', setMapReferencePoints);
  }

  return map;
}

/**
 * Actualiza puntos de referencia para gpsToCanvas (CORREGIDO Mapbox)
 */
export function setMapReferencePoints() {
  if (!map) return;

  if (currentMapType === "openstreet" && map.getBounds) {
    // Leaflet
    // @ts-ignore
    const bounds = map.getBounds();
    const northLat = bounds.getNorth();
    const westLon = bounds.getWest();
    const southLat = bounds.getSouth();
    const eastLon = bounds.getEast();

    // @ts-ignore
    const nwPoint = map.latLngToContainerPoint([northLat, westLon]);
    // @ts-ignore
    const sePoint = map.latLngToContainerPoint([southLat, eastLon]);

    referencePoints.topLeft = { x: nwPoint.x, y: nwPoint.y, lat: northLat, lon: westLon };
    referencePoints.bottomRight = { x: sePoint.x, y: sePoint.y, lat: southLat, lon: eastLon };
  } else if (currentMapType === "mapbox" && map.getBounds) {
    // Mapbox (Corrección: [lon, lat] para project)
    // @ts-ignore
    const bounds = map.getBounds();
    const northLat = bounds.getNorth();
    const westLon = bounds.getWest();
    const southLat = bounds.getSouth();
    const eastLon = bounds.getEast();

    // @ts-ignore
    const nw = map.project([westLon, northLat]); 
    // @ts-ignore
    const se = map.project([eastLon, southLat]); 

    referencePoints.topLeft = { x: nw.x, y: nw.y, lat: northLat, lon: westLon };
    referencePoints.bottomRight = { x: se.x, y: se.y, lat: southLat, lon: eastLon };
  }
}

/**
 * Agrega o actualiza un nodo en el mapa (Marcadores nativos)
 */
export function addNodeToMap(node) {
  if (!map || !node) return;
  const typeConfig = nodeTypes[node.type];
  if (!typeConfig) return;

  // Eliminar marcador previo si existe
  if (mapMarkers.has(node._id)) {
    const existing = mapMarkers.get(node._id);
    // @ts-ignore
    if (currentMapType === "openstreet") map.removeLayer(existing);
    else existing.remove();
    mapMarkers.delete(node._id);
  }

  let marker;

  if (currentMapType === "openstreet") {
    // === Leaflet marker ===
    // @ts-ignore
      marker = L.circleMarker([node.lat, node.lon], {
        radius: typeConfig.radius,
        color: "black",       
        weight: 1.5,            
        opacity: 1,         
        fillColor: typeConfig.color,
        fillOpacity: 0.9
      }).addTo(map);

    marker.bindPopup(typeConfig.popup(node));
  } else {
   // === Mapbox marker ===
const el = document.createElement('div');
el.style.width = `${typeConfig.radius * 2}px`;
el.style.height = `${typeConfig.radius * 2}px`;
el.style.backgroundColor = typeConfig.color;
el.style.border = '2px solid black';
el.style.borderRadius = '50%';

// Crear popup con corrección de accesibilidad
const popup = new mapboxgl.Popup({ offset: 25 })
  .setHTML(typeConfig.popup(node))
  .on('open', () => {
    // Esperamos un ciclo para asegurarnos de que el DOM del popup esté listo
    requestAnimationFrame(() => {
      const popupEls = document.querySelectorAll('.mapboxgl-popup');
      popupEls.forEach(p => p.removeAttribute('aria-hidden')); // ❌ elimina aria-hidden de todos los popups activos

      // También eliminamos el foco del botón de cerrar
      popupEls.forEach(p => {
        const btn = p.querySelector('.mapboxgl-popup-close-button');
        if (btn) btn.blur();
      });
    });
  });

// Crear marcador y asociar popup
marker = new mapboxgl.Marker(el)
  .setLngLat([node.lon, node.lat])
  .setPopup(popup)
  .addTo(map);

  }

  mapMarkers.set(node._id, marker);
}

/**
 * Limpia todos los markers del mapa
 */
export function clearMapMarkers() {
  mapMarkers.forEach(marker => {
    // @ts-ignore
    if (currentMapType === "openstreet") map.removeLayer(marker);
    else marker.remove();
  });
  mapMarkers.clear();
}