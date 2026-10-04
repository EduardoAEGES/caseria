# Ca$erIA

App solo para celular que compara precios de canastas en Paucarpata (Arequipa) y traza la ruta a la tienda.
HTML, CSS y JavaScript puros: sin frameworks, sin build y sin `npm install`.

## Cómo ejecutarlo

Abrir `index.html` con doble clic, o servir la carpeta con cualquier servidor estático
(p. ej. Live Server de VS Code, o `python -m http.server`).

Los scripts son `<script>` normales (no módulos ES) a propósito, para que funcione
también desde `file://`. Todas las funciones y constantes son globales y se cargan
en el orden declarado en `index.html`: datos → núcleo → componentes → pantallas → `main.js`.

## Flujo al abrir y modos de simulación

1. `mode` — selector de demo: **Primera vez**, **Usuario Free** o **Usuario Premium**.
2. `intro` — presentación de carga; se muestra siempre.
3. Primera vez: `onboarding1-3` → `splash` (nombre y correo) → `permission` → `register` → `home`.
   Al terminar el registro la cuenta se guarda en `localStorage` (`js/core/storage.js`).
4. Usuario Free: directo a `home` con la cuenta guardada (o "Mateo") y plan gratuito.
   Usuario Premium: directo a `home` con la cuenta de prueba "Valeria" (no toca la cuenta guardada).

"Cerrar Sesión" en el perfil vuelve al selector de modo (la cuenta queda guardada).

## Solo para celular

- La app ocupa toda la pantalla (`.phone` a 100dvh). En tablet o computadora se ve como una columna
  centrada de 480px, sin marco de teléfono. No hay barra de estado simulada: `StatusBar()` devuelve "".
- `css/responsive.css` (cargado al final) respeta las zonas seguras (`env(safe-area-inset-*)`) y ajusta
  celulares angostos.
- `manifest.webmanifest` permite agregarla a la pantalla de inicio como app (requiere servirla por http/https).

## Tiendas, ubicación y rutas

- Tiendas en `STORES` (`js/data/catalog.js`): Mass, Tambo, OXXO (Paucarpata), Metro Lambramani, Makro
  Avelino Cáceres, Tottus Porongoche y Plaza Vea, con `lat`/`lng` aproximados (editar ahí si se conocen los exactos).
- Precios: Tottus y Metro reales (scrapers); Mass real solo en lo que trae su folleto; Plaza Vea, Makro,
  Tambo y OXXO usan precios referenciales inventados (`PRICE_ROWS`).
- `js/core/geo.js`: pide la ubicación al GPS (`requestLocation`; sin permiso usa Paucarpata aproximada),
  calcula la distancia a cada tienda, pide la ruta por calles a OSRM (OpenStreetMap; sin conexión estima en
  línea recta) y estima tiempo y pasaje por modo con los supuestos de `TRAVEL` (combi S/ 1.50 por tramo,
  taxi desde S/ 6, a pie hasta 2.5 km). `googleMapsUrl` abre la ruta en Google Maps.
- `js/screens/route.js` (pantalla `route`): mapa Leaflet con la ruta, opciones de viaje y total canasta + pasaje.
  Recibe el destino en `state.routeTarget = { storeIds, basketTotal }`; sus acciones devuelven `false` y solo
  repintan el panel para no destruir el mapa.

## Estructura

- `index.html` — marco del celular (`#phone`, `#screen`, `#overlay`) y carga de CSS/JS
- `css/base.css` — variables de diseño (colores, sombras), reset, marco del celular, animaciones
- `css/components.css` — botones, tarjetas, pills, pestañas, barra inferior, hojas y modales
- `css/screens/*.css` — estilos propios de cada grupo de pantallas
- `css/responsive.css` — ajustes para celulares (siempre el último CSS)
- `js/data/catalog.js` — productos, tiendas, tabla de precios y `searchBestOffers`
- `js/data/prices-<tienda>.js` — precios reales de Tottus, Metro y Mass (generados por los scrapers, no editar)
- `scraper/` — scrapers (Node 18+, sin dependencias): `common.mjs` (reglas de coincidencia y escritura),
  `tottus.mjs`, `metro.mjs`, `mass.mjs` y `discover-*.mjs` (reconocimiento); `data/<tienda>-catalogo.json` guarda todo lo visto
- `data/mass-folleto.json` — productos y precios del folleto vigente de Mass Arequipa (lo usa `scraper/mass.mjs`)
- `js/components/icons.js` — íconos SVG de línea: `Icon("chevron-left")`; usar en vez de flechas de texto o emojis de interfaz
- `js/data/content.js` — distrito, canastas rápidas y datos de demostración
- `js/core/storage.js` — guardar/leer la cuenta en `localStorage`
- `js/core/state.js` — estado global (`state`), modos de sesión y helpers de la canasta
- `js/core/router.js` — `defineScreen`, `navigate`, `render` y delegación de eventos
- `js/core/utils.js` — `esc`, `money`, `each`
- `js/core/geo.js` — GPS, distancias, rutas (OSRM) y costo del viaje
- `js/components/` — piezas de HTML reutilizables (BottomNav, Sheet, modales…)
- `js/screens/` — una pantalla por archivo
- `img/logo.png` — logo
- `docs/` — notas de diseño originales

## Cómo funciona una pantalla

```js
defineScreen("nombre", {
  nav: true,                       // muestra la barra inferior
  ui: () => ({ tab: "a" }),        // estado local, se reinicia al entrar
  render: ui => `<section class="screen">…</section>`,
  actions: {                       // clic en [data-action] o input en [data-input]
    setTab: (ui, el) => { ui.tab = el.dataset.value; },
  },
  enter(ui) { /* timers */ return () => { /* limpieza */ }; },
});
```

Tras cada acción la pantalla se redibuja sola (conservando scroll y foco de los
elementos con `data-scroll` / `id`). Una acción que devuelve `false` no redibuja.

## Convenciones

- CSS con clases semánticas estilo BEM (`.bloque__elemento--modificador`, estados con `.is-*`).
  Los colores salen de las variables de `:root` en `css/base.css`.
- Todo texto ingresado por el usuario se escapa con `esc()` antes de insertarlo en el HTML.
- Usar comillas dobles en strings con apóstrofos.

## Precios reales (scrapers)

- `.github/workflows/prices.yml` ejecuta `scraper/tottus.mjs`, `scraper/metro.mjs` y `scraper/mass.mjs` todos los días
  (6:17 a. m. de Perú, o a mano desde la pestaña Actions) y guarda los cambios en el repo.
  Cada tienda corre aparte: si una falla, las otras se guardan igual.
- Tottus: busca en `tottus.com.pe/tottus-pe/buscar?Ntt=…` y lee el JSON `__NEXT_DATA__`.
- Metro: API pública de VTEX `metro.pe/api/catalog_system/pub/products/search?ft=…`, con la región
  del código postal 04008 (Paucarpata).
- Mass: no tiene tienda online; publica un folleto en imágenes por ciudad (`/precios-mass/`, AJAX
  `cargar_catalogos_por_ciudad` con `ciudad=AREQUIPA`). Si el folleto es el mismo de `data/mass-folleto.json`
  se reutiliza; si es nuevo se lee con Claude (`claude-opus-5-5`, secreto `ANTHROPIC_API_KEY` en GitHub).
  Sin la clave se mantienen los precios del folleto anterior y la tarea avisa. Los precios de Mass son
  parciales (`partial: true`): lo que no sale en el folleto sigue con la tabla de ejemplo.
  `node scraper/mass.mjs --offline` recalcula los precios desde `data/mass-folleto.json` sin internet.
- Las reglas de `QUERIES` en `scraper/common.mjs` (`q`, `qBy`, `byStore`, `start`, `must`, `prefer`, `exclude`, `kg`)
  deciden qué resultado corresponde a cada producto de la app. Para ajustar una coincidencia, editar su regla.
- `.github/workflows/discover.yml` corre un `scraper/discover-<tienda>.mjs` para estudiar una tienda nueva.
- `catalog.js` usa `window.SCRAPED_PRICES[tienda]` cuando existe; si no, la tabla de ejemplo.
- Si un scraper encuentra menos de la mitad de productos no sobrescribe los datos anteriores.
