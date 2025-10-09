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
      `<b>Usuario ${node.id_cuenta}</b><br>Consumo: ${node.demanda} kW<br>${node.latitud.toFixed(6)}, ${node.longitud.toFixed(6)}`,
    tooltip: (node) =>
      `Usuario: ${node.id_cuenta}\nConsumo: ${node.demanda} kW\nGPS: ${node.latitud.toFixed(6)}, ${node.longitud.toFixed(6)}`
  }
};
