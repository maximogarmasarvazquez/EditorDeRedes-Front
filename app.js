import { initMap, setMapReferencePoints, addNodeToMap, clearMapMarkers, map, referencePoints } from './js/map.js'; 
import { nodes as canvasNodes, drawNodes, createTooltip, updateNodesPositions } from './js/canvas.js'; 
import { getSubestaciones, getPostes, getUsuariosCompletos } from './data/data.js';

// Konva stage
const stage = new Konva.Stage({
  container: "container",
  width: window.innerWidth - 320,
  height: window.innerHeight - 40,
  draggable: true, 
});
const layer = new Konva.Layer();
stage.add(layer);

const tooltip = createTooltip(layer);

stage.on('wheel', (e) => {
  e.evt.preventDefault();
  if (!map) return;

  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const currentZoom = map.getZoom();
  const newZoom = currentZoom + direction;

  if (newZoom >= map.getMinZoom() && newZoom <= map.getMaxZoom()) {
    const pointer = stage.getPointerPosition();
    // Posición del puntero en coordenadas del contenedor (necesario para el mapa)
    const mapPointerX = (pointer.x - stage.x()); 
    const mapPointerY = (pointer.y - stage.y());

    let mapLatLng = null;
    let newMapPoint = null; // Para compensar el Stage Konva

    // 1. Convertir punto de pantalla a Lat/Lng (Manejo de Leaflet/Mapbox)
    if (map.containerPointToLatLng) { // Leaflet
      mapLatLng = map.containerPointToLatLng([mapPointerX, mapPointerY]);
    } else if (map.unproject) { // Mapbox GL JS
      const lngLat = map.unproject([mapPointerX, mapPointerY]).toArray(); 
      mapLatLng = { lat: lngLat[1], lng: lngLat[0] }; 
    }

    if (mapLatLng) {
      // 2. Aplicar zoom al mapa
      if (map.setZoomAround) { // Leaflet
        map.setZoomAround(mapLatLng, newZoom, { animate: false });
        newMapPoint = map.latLngToContainerPoint(mapLatLng);
      } else if (map.setZoom && map.setCenter) { // Mapbox
        map.setCenter([mapLatLng.lng, mapLatLng.lat], { animate: false }); 
        map.setZoom(newZoom, { animate: false }); 
        newMapPoint = map.project([mapLatLng.lng, mapLatLng.lat]);
      }

      // 3. Compensar el desplazamiento de Konva para mantener la vista estable
      if (newMapPoint) {
          const deltaX = newMapPoint.x - mapPointerX;
          const deltaY = newMapPoint.y - mapPointerY;
          
          stage.x(stage.x() - deltaX);
          stage.y(stage.y() - deltaY);
          updateReferencePointsAndNodes(); // Asegura la actualización de los nodos Konva
      }
    }
  }
});

let currentMapType = 'openstreet';  

document.getElementById('toggle-map-btn').addEventListener('click', () => {
  // Alternar tipo de mapa
  const newMapType = currentMapType === 'openstreet' ? 'mapbox' : 'openstreet';

  if (!map) return;

  // Guardar referencia al mapa actual antes de cambiar
  const oldMap = map;
  const zoom = oldMap.getZoom();

  // 🔹 Calcular centro visual compensando desplazamiento del stage
  const stageOffsetX = stage.x();
  const stageOffsetY = stage.y();
  const containerCenter = [
    (stage.width() / 2) - stageOffsetX,
    (stage.height() / 2) - stageOffsetY
  ];

  let centerLatLng;

  if (oldMap.containerPointToLatLng) {
    // Mapa antiguo era Leaflet
    centerLatLng = oldMap.containerPointToLatLng(containerCenter);
  } else if (oldMap.unproject) {
    // Mapa antiguo era Mapbox
    const lngLat = oldMap.unproject(containerCenter).toArray();
    centerLatLng = { lat: lngLat[1], lng: lngLat[0] };
  } else {
    // Fallback por si algo falla
    centerLatLng = oldMap.getCenter ? oldMap.getCenter() : { lat: -31.417, lng: -64.183 };
  }

  // 🔹 Inicializar el mapa nuevo con centro compensado
  currentMapType = newMapType;
  initMap(centerLatLng.lat, centerLatLng.lng, zoom, currentMapType);

  // 🔄 Reasignar referencias y renderizar nodos después de cargar el mapa
  if (map) {
    setTimeout(() => {
      setMapReferencePoints();
      renderAllNodes(currentFilter);

      // Reasignar eventos de zoom/move
      if (map.on) {
        map.on('zoomend', updateReferencePointsAndNodes);
        map.on('moveend', updateReferencePointsAndNodes);
      }
    }, 500); // esperar a que el mapa termine de renderizar
  }
});

// Datos
let allNodes = { subestaciones: [], postes: [], usuarios: [] };
let currentFilter = { subestaciones: true, postes: true, usuarios: true };

// Normaliza nodo
function normalizeNode(n, type) {
  const lat = n.latitud ?? n.lat;
  const lon = n.longitud ?? n.lon;
  const id = type + "_" + (n._id || n.id_subestacion || n.id_poste || n.id_cuenta);
  return { ...n, lat, lon, _id: id, type };
}

function isValidCoord(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon);
}

// Init
async function init() {
  const subestaciones = await getSubestaciones();
  const postes = await getPostes();
  const usuarios = await getUsuariosCompletos();

  allNodes = { subestaciones, postes, usuarios };

  const combined = [...subestaciones, ...postes, ...usuarios]
    .map(n => normalizeNode(n, n.type || 'unknown'))
    .filter(n => isValidCoord(n.lat, n.lon));

  let initialLat = -31.4167;
  let initialLon = -64.1833;
  if (combined.length) {
    initialLat = combined.reduce((sum, n) => sum + n.lat, 0) / combined.length;
    initialLon = combined.reduce((sum, n) => sum + n.lon, 0) / combined.length;
  }

  initMap(initialLat, initialLon, 15);

  map.whenReady(() => {
    setMapReferencePoints();
    renderAllNodes(currentFilter);

    map.on('zoomend', updateReferencePointsAndNodes);
    map.on('moveend', updateReferencePointsAndNodes);
  });
}

// Render
function drawKonvaNodes(subestaciones, postes, usuarios) {
  layer.destroyChildren(); 
  canvasNodes.length = 0; 

  if (subestaciones) drawNodes(layer, tooltip, allNodes.subestaciones, "subestacion", referencePoints);
  if (postes) drawNodes(layer, tooltip, allNodes.postes, "poste", referencePoints);
  if (usuarios) drawNodes(layer, tooltip, allNodes.usuarios, "usuario", referencePoints);

  layer.batchDraw();
}

function renderAllNodes(filter = currentFilter) {
  drawKonvaNodes(filter.subestaciones, filter.postes, filter.usuarios);

  clearMapMarkers();
  if (!map) return;

  if (filter.subestaciones)
    allNodes.subestaciones.forEach(n => {
      const node = normalizeNode(n, 'subestacion');
      if (isValidCoord(node.lat, node.lon)) addNodeToMap(node);
    });

  if (filter.postes)
    allNodes.postes.forEach(n => {
      const node = normalizeNode(n, 'poste');
      if (isValidCoord(node.lat, node.lon)) addNodeToMap(node);
    });

  if (filter.usuarios)
    allNodes.usuarios.forEach(n => {
      const node = normalizeNode(n, 'usuario');
      if (isValidCoord(node.lat, node.lon)) addNodeToMap(node);
    });
}

// Sincronización
function updateReferencePointsAndNodes() {
  setMapReferencePoints();
  updateNodesPositions(referencePoints);
}

window.addEventListener("resize", () => {
  stage.width(window.innerWidth - 320);
  stage.height(window.innerHeight - 40);
  updateReferencePointsAndNodes();

  if (!map) return;

  if (currentMapType === "openstreet") {
    map.invalidateSize();
  } else if (currentMapType === "mapbox") {
    map.resize();
  }
});

// Filtros y vistas
function toggleFilter(checkboxId, btn) {
  const checkbox = document.getElementById(checkboxId);
  checkbox.checked = !checkbox.checked;
  btn.classList.toggle('active', checkbox.checked);
  applyFilter();
}

function applyFilter() {
  currentFilter = {
    subestaciones: document.getElementById("filter-subestaciones")?.checked ?? true,
    postes: document.getElementById("filter-postes")?.checked ?? true,
    usuarios: document.getElementById("filter-usuarios")?.checked ?? true
  };
  renderAllNodes(currentFilter);
}

function switchView(view) {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll("#editor-view, #map-view").forEach(v => v.classList.remove("active"));

  if (view === "editor") {
    document.querySelector('button[onclick="switchView(\'editor\')"]').classList.add("active");
    document.getElementById("editor-view").classList.add("active");
    applyFilter(); 
  } else if (view === "map") {
    document.querySelector('button[onclick="switchView(\'map\')"]').classList.add("active");
    document.getElementById("map-view").classList.add("active");
    setTimeout(() => {
      if (currentMapType === "openstreet") map?.invalidateSize({ animate: true });
      else if (currentMapType === "mapbox") map?.resize();
    }, 50);
  }
}

// Exposición global
window.updateReferencePoints = updateReferencePointsAndNodes; 
window.switchView = switchView;
window.applyFilter = applyFilter;
window.toggleFilter = toggleFilter;
window.addEventListener("load", init);
