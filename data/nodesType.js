// ==============================
// Colores por tipo de nodo
// ==============================
export const colors = {
  poste: "orange",
  transformador: "blue",
  seccionador: "green",
  subestacion: "red",
  usuario: "lime",
};

// ==============================
// Configuración de nodos
// ==============================
export const nodeTypes = {
  subestacion: {
    color: colors.subestacion,
    radius: 8,
    popup: (node) =>
      `<b>${node.ubicacion}</b><br>Potencia: ${node.potencia}<br>${node.lat.toFixed(6)}, ${node.lon.toFixed(6)}`,
    tooltip: (node) =>
      `Ubicación: ${node.ubicacion}\nPotencia: ${node.potencia}\nGPS: ${node.lat.toFixed(6)}, ${node.lon.toFixed(6)}`
  },

  poste: {
    color: colors.poste,
    radius: 6,
    popup: (node) =>
      `<b>Serie: ${node.serie}</b><br>Tipo: ${node.tipo}<br>${node.lat.toFixed(6)}, ${node.lon.toFixed(6)}`,
    tooltip: (node) =>
      `Serie: ${node.serie}\nTipo: ${node.tipo}\nGPS: ${node.lat.toFixed(6)}, ${node.lon.toFixed(6)}`
  },

  usuario: { 
    color: colors.usuario,
    radius: 5,
    popup: (node) =>
      `<b>Usuario ${node.id_cuenta}</b><br>
      Nombre: ${node.nombre}<br>
      Calle: ${node.calle_postal}<br>
      Ultimo consumo facturado: ${node.consumo_facturado} kWh<br>
      Fase: ${node.fase}<br>
      Demanda: ${node.demanda} kW<br>
      Ubicacion de Subestacion:  ${node.ubicacion_subestacion} <br>
      GPS: ${node.latitud.toFixed(6)}, ${node.longitud.toFixed(6)}`,
    tooltip: (node) =>
      `Usuario: ${node.id_cuenta}
  Nombre: ${node.nombre}
  Calle: ${node.calle_postal}
  Ultimo consumo facturado: ${node.consumo_facturado} 
  Fase: ${node.fase}
  Demanda: ${node.demanda} kW
  Ubicacion de Subestacion:  ${node.ubicacion_subestacion} <br>
  GPS: ${node.latitud.toFixed(6)}, ${node.longitud.toFixed(6)}`
  }
};
