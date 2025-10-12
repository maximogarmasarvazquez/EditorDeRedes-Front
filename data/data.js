// data.js
export async function getSubestaciones() {
  try {
    const response = await fetch("http://localhost:5000/subestaciones");
    if (!response.ok) throw new Error("Error al obtener subestaciones");
    const subestaciones = await response.json();
    return subestaciones;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getPostes() {
  try {
    const response = await fetch("http://localhost:5000/postes");
    if (!response.ok) throw new Error("Error al obtener postes");
    const postes = await response.json();
    return postes;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getServiciosxcuentas() {
  try {
    const response = await fetch("http://localhost:5000/serviciosxcuentas");
    if (!response.ok) throw new Error("Error al obtener serviciosxcuentas");
    const serviciosxcuentas = await response.json();
    return serviciosxcuentas;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getConsumos() {
  try {
    const response = await fetch("http://localhost:5000/consumos");
    if (!response.ok) throw new Error("Error al obtener consumos");
    const consumos = await response.json();
    return consumos;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getCuentas() {
  try {
    const response = await fetch("http://localhost:5000/cuentas");
    if (!response.ok) throw new Error("Error al obtener cuentas");
    const cuentas = await response.json();
    return cuentas;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getAcometidas() {
  try {
    const response = await fetch("http://localhost:5000/acometidas");
    if (!response.ok) throw new Error("Error al obtener acometidas");
    const acometidas = await response.json();
    return acometidas;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// USUARIOS COMPLETOS
export async function getUsuariosCompletos() {
  try {
    const [serviciosxcuenta, cuentas, consumos, acometidas, subestaciones] = await Promise.all([
      getServiciosxcuentas(),
      getCuentas(),
      getConsumos(),
      getAcometidas(),
      getSubestaciones()
    ]);

    // 1️⃣ Agrupar serviciosxcuenta por id_cuenta y quedarnos con el último registro (por demanda o id_servicioxcuenta)
    const serviciosPorCuenta = Object.values(
      serviciosxcuenta.reduce((acc, sxc) => {
        const id = Number(sxc.id_cuenta);
        if (!acc[id] || sxc.demanda > acc[id].demanda) {
          // Tomamos la fila con mayor demanda
          acc[id] = sxc;
        }
        return acc;
      }, {})
    );

    // 2️⃣ Mapear cuentas únicas y agregar consumo, acometida y subestación
    const usuarios = serviciosPorCuenta.map((sxc) => {
      const cuenta = cuentas.find((c) => Number(c.id_cuenta) === Number(sxc.id_cuenta)) || {};

      // Último consumo de esta cuenta
      const consumo = consumos
        .filter((c) => Number(c.id_cuenta) === Number(sxc.id_cuenta))
        .sort((a, b) => b.id_consumo - a.id_consumo)[0];

      // Última acometida de esta cuenta
      const acometida = acometidas
        .filter((a) => Number(a.id_cuenta) === Number(sxc.id_cuenta))
        .sort((a, b) => b.id_acometida - a.id_acometida)[0];

      // Buscar la subestación asociada a la acometida
      const subestacion = subestaciones.find(
        (s) => Number(s.id_subestacion) === Number(acometida?.id_subestacion)
      );

      return {
        id_cuenta: sxc.id_cuenta,
        latitud: sxc.latitud,
        longitud: sxc.longitud,
        demanda: sxc.demanda,
        nombre: cuenta.nombre || "Nombre no registrado",
        calle_postal: cuenta.calle_postal || "Direccion no registrada",
        consumo_facturado: consumo?.consumo_facturado ?? "Consumo no registrado 0",
        fase: acometida?.fase || "Fase no registrada",
        ubicacion_subestacion: subestacion?.ubicacion || "Ubicación no registrada",
      };
    });

    console.log(usuarios);
    return usuarios;
  } catch (err) {
    console.error("Error al combinar datos de usuarios:", err);
    return [];
  }
}
