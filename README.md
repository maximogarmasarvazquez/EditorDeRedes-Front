# Frontend Editor Eléctrico con GPS

Este proyecto es un **frontend en HTML, CSS y JS** que permite visualizar y editar una red eléctrica en un **mapa interactivo con GPS** y un canvas para dibujar elementos de la red. Utiliza **Konva.js** para el canvas y **Leaflet.js** para el mapa.

---

## Tecnologías

* HTML5
* CSS3
* JavaScript (ES Modules)
* Konva.js
* Leaflet.js

---

## Instalación

1. Clonar el repositorio:

```bash
git clone <url-del-repositorio>
cd <nombre-del-proyecto>
```

2. Abrir `index.html` en un navegador moderno o servirlo con un servidor local (recomendado para módulos ES):

```bash
npx live-server
```

3. Asegurarse de que el backend esté corriendo en `http://localhost:5000` para obtener los datos de subestaciones y otros elementos.

---

## Uso

1. Abrir el frontend en el navegador.
2. Cambiar entre vistas usando los botones de la sección "Vistas":

   * `📐 Editor de Red` → Canvas interactivo para editar la red.
   * `🗺 Mapa GPS` → Visualización georreferenciada de los elementos.
3. Herramientas disponibles:

   * `🟠 Poste`, `🔵 Transformador`, `🟢 Seccionador`, `🔴 Subestación`, `🔺 Usuario` → Agregar elementos.
   * `📏 Conectar` → Conectar elementos en el editor.
   * `📍 Obtener GPS Actual` → Obtener posición GPS.
   * `🎯 Establecer Puntos de Referencia` → Configurar coordenadas de referencia para la conversión GPS → Canvas.
4. Hover sobre elementos en el canvas muestra tooltip con información como ubicación, potencia y coordenadas GPS.

---

## Estructura del Proyecto

* `index.html` → HTML principal.
* `css/styles.css` → Estilos del proyecto.
* `js/map.js` → Funciones para inicializar y actualizar el mapa.
* `js/canvas.js` → Funciones para el canvas de Konva.
* `data/data.js` → Simulación o fetch de datos de subestaciones.
* `app.js` → Lógica principal de inicialización y cambio de vistas.

