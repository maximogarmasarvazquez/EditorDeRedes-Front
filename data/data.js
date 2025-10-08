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