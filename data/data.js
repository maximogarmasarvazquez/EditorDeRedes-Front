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