Com certeza\! Aqui está o arquivo `README.md` modificado para o seu projeto **Frontend Editor Eléctrico con GPS**, incluindo as etapas detalhadas sobre como usar Node.js e configurar o Mapbox, conforme solicitado.

-----

# Frontend Editor Eléctrico con GPS ⚡🗺️

Este proyecto es un **frontend interactivo** diseñado para visualizar y editar una red eléctrica. Combina un editor de diagramas basado en **Canvas** (utilizando Konva.js) con una visualización geográfica en un **Mapa Interactivo** (utilizando Leaflet.js).

La funcionalidad clave es el **Georreferenciamiento**, que permite sincronizar la posición de los elementos dibujados en el Canvas con coordenadas GPS reales en el mapa.

-----

## Tecnologías

  * **HTML5**
  * **CSS3**
  * **JavaScript (ES Modules)**
  * **Konva.js** (Para el Canvas del Editor)
  * **Leaflet.js** (Para el Mapa Interactivo)
  * **Node.js / Express** (Para servir el proyecto localmente y simular el backend)

-----

## 🛠️ Instalación y Configuración (Importante)

Para ejecutar este proyecto, necesitará **Node.js** y configurar una clave de API de **Mapbox** (se asume que usará Mapbox para mapas base, embora o Leaflet seja usado).

### Paso 1: Configurar Node.js

1.  **Descargar e Instalar Node.js:** Si aún no lo tiene, instale la versión LTS (Recomendada) de Node.js desde su sitio web oficial.
2.  **Verificar Instalación:** Abra su terminal o Símbolo del Sistema y ejecute:
    ```bash
    node -v
    npm -v
    ```

### Paso 2: Clonar y Configurar el Repositorio

1.  **Clonar el Repositorio:**

    ```bash
    git clone <url-del-repositorio>
    cd <nombre-del-proyecto>
    ```

2.  **Instalar Dependencias:** Asumiendo que el proyecto tiene un `package.json` para el servidor local (p. ej., con `express` o `live-server`):

    ```bash
    npm install
    ```

### Paso 3: Configuración de la API Key (Mapbox)

Este proyecto necesita una clave de API para cargar los mapas base (asumiendo que usa Mapbox para mapas con estilo).

1.  **Crear el Archivo de Configuración:**

      * En la raíz del proyecto, renombre el archivo de ejemplo `config.example.js` a **`config.js`**.

    <!-- end list -->

    ```bash
    mv example.config.js config.js
    ```

2.  **Obtener y Añadir el Token de Mapbox:**

      * Regístrese en **Mapbox** y obtenga su **Token de Acceso Público**.
      * Abra el nuevo archivo **`config.js`** y reemplace el marcador de posición con su token:

    <!-- end list -->

    ```javascript
    // config.js
    export const MAPBOX_TOKEN = "SU_TOKEN_DE_ACCESO_PUBLICO_AQUI"; // <--- CAMBIAR ESTO
    // export const BACKEND_URL = "http://localhost:5000"; 
    ```

-----

## ▶️ Uso y Ejecución del Proyecto

### Paso 4: Iniciar el Servidor Local

Ejecute el servidor del proyecto. Esto es necesario para manejar las rutas y los **Módulos ES** (`import`/`export`) correctamente en el navegador, y para simular la conexión al backend.

```bash
# Si usa un script de npm como 'start' con Express:
npm start

node server
```

### Flujo de Trabajo

1.  Abrir el frontend en el navegador (generalmente en `http://localhost:3000` o `http://127.0.0.1:8080`).
2.  **Editor de Red (Konva):** Use las herramientas para añadir y conectar elementos.
3.  **Configuración GPS Inicial (Crucial):** Para que la sincronización funcione correctamente, vaya a la vista `🗺 Mapa GPS` y use el botón:
      * **`🎯 Establecer Puntos de Referencia`**: Esto calibra el Canvas, mapeando las coordenadas de píxel a las coordenadas GPS de lo que está viendo actualmente en el mapa.
4.  **Georreferenciamiento:**
      * Mueva un nodo en el Editor: su posición GPS se recalcula automáticamente y el marcador del mapa se mueve.
      * Seleccione un nodo y use **`📍 Obtener GPS Actual`**: Asigna la ubicación real del dispositivo al nodo, y este se mueve en el Canvas para coincidir con el mapa.
5.  **Persistencia:** Use **`💾 Guardar Datos`** para almacenar el estado actual de la red.

-----

## Estructura del Proyecto

  * `index.html` → HTML principal del frontend.
  * `config.js` → Archivo de configuración local para tokens de API.
  * `css/`
      * `styles.css` → Estilos generales del proyecto.
  * `js/`
      * `map.js` → Lógica de inicialización y actualización del mapa Leaflet.
      * `canvas.js` → Funciones para la manipulación y eventos de Konva.
      * `data.js` → Simulación o *fetch* de datos de subestaciones y elementos.
      * `app.js` → Lógica principal (inicialización, cambio de vistas, coordinación entre módulos).
  * `server/` (Asumiendo que existe una carpeta para el servidor local)
      * `server.js` → Archivo para levantar el servidor Node.js/Express.