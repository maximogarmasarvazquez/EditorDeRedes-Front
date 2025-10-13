// canvas.js
import { nodeTypes } from '../data/nodesType.js';
import { gpsToCanvas, canvasToGPS } from './utils/canvasUtils.js'; 

export const nodes = [];

// Crear tooltip (Usa la variable global Konva)
export function createTooltip(layer) {
  const tooltip = new Konva.Label({ opacity: 0.8, visible: false });
  tooltip.add(new Konva.Tag({
    fill: "black",
    pointerDirection: "down",
    pointerWidth: 10,
    pointerHeight: 10,
    lineJoin: "round"
  }));
  tooltip.add(new Konva.Text({ text: "", fontFamily: "Calibri", fontSize: 14, padding: 5, fill: "white" }));
  layer.add(tooltip);
  return tooltip;
}

// Función genérica para dibujar nodos (Usa la variable global Konva)
export function drawNodes(layer, tooltip, data, type, referencePoints) { 
  if (!nodeTypes[type]) {
    console.warn(`Tipo de nodo desconocido: ${type}`);
    return;
  }

  const { color, radius, tooltip: tooltipFn } = nodeTypes[type];
  
  data.forEach(item => {
    const lat = item.latitud ?? item.lat;
    const lon = item.longitud ?? item.lon;
    if (lat == null || lon == null) return;

    // Obtiene la posición x, y con la nueva corrección de referencia
    const pos = gpsToCanvas(lat, lon, referencePoints); 

    const nodeData = { 
      ...item, 
      _id: type + "_" + (item._id || item.id_subestacion || item.id_poste || item.id_cuenta), 
      type, lat, lon, 
      baseRadius: radius 
    };

    const circle = new Konva.Circle({ // Usa Konva global
      x: pos?.x || 0,
      y: pos?.y || 0,
      // Radio y Stroke son FIJOS (tamaño de píxel constante)
      radius: radius, 
      fill: color,
      stroke: "black",
      strokeWidth: 1, 
      draggable: true
    });

    circle.data = nodeData;

    circle.on("mouseover", function() {
      tooltip.getText().text(tooltipFn(this.data));
      tooltip.position({ x: this.x() + 10, y: this.y() - 10 }); 
      tooltip.show();
      layer.draw();
    });

    circle.on("mouseout", () => {
      tooltip.hide();
      layer.draw();
    });
    
    // Manejo de arrastre para actualizar la posición GPS
    circle.on('dragmove', function() {
        // Utiliza la función corregida de conversión
        const coords = canvasToGPS(this.x(), this.y(), referencePoints); 
        if (coords) {
            this.data.lat = coords.lat;
            this.data.lon = coords.lon;
            
            // 💡 Nota: La actualización del marcador en el mapa debe hacerse
            //    idealmente aquí o en app.js usando la nueva lat/lon.
        }
        layer.batchDraw();
    });

    layer.add(circle);
    nodes.push(circle);
  });
}