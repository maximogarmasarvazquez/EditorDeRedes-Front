const BASE_URL = "http://localhost:5000";

// ==========================
// FUNCIONES BASE
// ==========================

// Subestaciones
export async function getSubestaciones() {
  return fetchData("/subestaciones");
}

export async function getSubestacionById(id) {
  return fetchData(`/subestaciones/${id}`);
}

// Postes
export async function getPostes() {
  return fetchData("/postes");
}

export async function getPosteById(id) {
  return fetchData(`/postes/${id}`);
}

// Servicios por cuenta
export async function getServiciosxcuentas() {
  return fetchData("/serviciosxcuentas");
}

export async function getServiciosxcuentaById(id) {
  return fetchData(`/serviciosxcuentas/${id}`);
}

// Consumos
export async function getConsumos() {
  return fetchData("/consumos");
}

export async function getConsumoById(id) {
  return fetchData(`/consumos/${id}`);
}

export async function getConsumoByCuenta(idCuenta) {
  return fetchData(`/consumos/cuenta/${idCuenta}`);
}

// Cuentas
export async function getCuentas() {
  return fetchData("/cuentas");
}

export async function getCuentaById(id) {
  return fetchData(`/cuentas/${id}`);
}

// Acometidas
export async function getAcometidas() {
  return fetchData("/acometidas");
}

export async function getAcometidaById(id) {
  return fetchData(`/acometidas/${id}`);
}

export async function getAcometidaByCuenta(idCuenta) {
  return fetchData(`/acometidas/cuenta/${idCuenta}`);
}

// ==========================
// FUNCIONES UTILITARIAS
// ==========================

async function fetchData(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`Error al obtener ${endpoint}`);
    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// ==========================
// FUNCIÓN PRINCIPAL
// ==========================
export async function getUsuariosCompletos() {
  try {
    const [serviciosxcuenta, cuentas] = await Promise.all([
      getServiciosxcuentas(),
      getCuentas(),
    ]);

    // 1️⃣ Agrupar serviciosxcuenta por id_cuenta y quedarnos con el último (mayor demanda)
    const serviciosPorCuenta = Object.values(
      serviciosxcuenta.reduce((acc, sxc) => {
        const id = Number(sxc.id_cuenta);
        if (!acc[id] || sxc.demanda > acc[id].demanda) {
          acc[id] = sxc;
        }
        return acc;
      }, {})
    );

    // 2️⃣ Construir usuarios combinando datos con llamadas por ID de cuenta
    const usuarios = await Promise.all(
      serviciosPorCuenta.map(async (sxc) => {
        const idCuenta = sxc.id_cuenta;

        const [cuenta, consumos, acometidas] = await Promise.all([
          getCuentaById(idCuenta),
          getConsumoByCuenta(idCuenta),
          getAcometidaByCuenta(idCuenta),
        ]);

        const consumoObj = consumos[0] || null;
        const acometidaObj = acometidas[0] || null;

        const subestacion =
          acometidaObj?.id_subestacion &&
          (await getSubestacionById(acometidaObj.id_subestacion));

        return {
          id_cuenta: idCuenta,
          latitud: sxc.latitud,
          longitud: sxc.longitud,
          demanda: sxc.demanda,
          nombre: cuenta?.nombre || "No registrado",
          calle_postal: cuenta?.calle_postal || "No registrada",
          consumo_facturado: consumoObj?.consumo_facturado ?? "No registrado",
          fase: acometidaObj?.fase || "No registrada",
          ubicacion_subestacion: subestacion?.ubicacion || "No registrada",
        };
      })
    );

    console.log(usuarios);
    return usuarios;
  } catch (err) {
    console.error("Error al combinar datos de usuarios:", err);
    return [];
  }
}
