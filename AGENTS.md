# Ca$erIA

Prototipo de app móvil para comparar precios de canastas en Paucarpata (Arequipa).
HTML, CSS y JavaScript puros: sin frameworks, sin build y sin `npm install`.

## Cómo ejecutarlo

Abrir `index.html` con doble clic, o servir la carpeta con cualquier servidor estático
(p. ej. Live Server de VS Code, o `python -m http.server`).

Los scripts son `<script>` normales (no módulos ES) a propósito, para que funcione
también desde `file://`. Todas las funciones y constantes son globales y se cargan
en el orden declarado en `index.html`: datos → núcleo → componentes → pantallas → `main.js`.

## Flujo al abrir y modos de simulación

1. `mode` — selector de demo: **Primera vez** o **Ya tengo cuenta**.
2. `intro` — presentación de carga; se muestra siempre.
3. Primera vez: `onboarding1-3` → `splash` (nombre y correo) → `permission` → `register` → `home`.
   Al terminar el registro la cuenta se guarda en `localStorage` (`js/core/storage.js`).
4. Ya tengo cuenta: directo a `home` con la cuenta guardada, o con el usuario de prueba "Mateo".

"Cerrar Sesión" en el perfil vuelve al selector de modo (la cuenta queda guardada).

## Responsive

- En computadora la app se ve dentro de un marco de celular que se achica si la ventana es baja.
- En pantallas de hasta 500px (`css/responsive.css`, cargado al final) ocupa toda la pantalla,
  oculta la muesca y la hora falsas y respeta las zonas seguras (`env(safe-area-inset-*)`).
- `manifest.webmanifest` permite agregarla a la pantalla de inicio como app (requiere servirla por http/https).

## Estructura

- `index.html` — marco del celular (`#phone`, `#screen`, `#overlay`) y carga de CSS/JS
- `css/base.css` — variables de diseño (colores, sombras), reset, marco del celular, animaciones
- `css/components.css` — botones, tarjetas, pills, pestañas, barra inferior, hojas y modales
- `css/screens/*.css` — estilos propios de cada grupo de pantallas
- `css/responsive.css` — ajustes para celulares (siempre el último CSS)
- `js/data/catalog.js` — productos, tiendas, tabla de precios y `searchBestOffers`
- `js/data/prices-tottus.js` — precios reales de Tottus (generado por el scraper, no editar)
- `scraper/tottus.mjs` — scraper de Tottus (Node 18+, sin dependencias); `data/tottus-catalogo.json` guarda todo lo visto
- `js/data/content.js` — distrito, canastas rápidas y datos de demostración
- `js/core/storage.js` — guardar/leer la cuenta en `localStorage`
- `js/core/state.js` — estado global (`state`), modos de sesión y helpers de la canasta
- `js/core/router.js` — `defineScreen`, `navigate`, `render` y delegación de eventos
- `js/core/utils.js` — `esc`, `money`, `each`
- `js/components/` — piezas de HTML reutilizables (StatusBar, BottomNav, Sheet, modales…)
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

- `.github/workflows/tottus-prices.yml` ejecuta `node scraper/tottus.mjs` todos los días
  (6:17 a. m. de Perú, o a mano desde la pestaña Actions) y guarda los cambios en el repo.
- El scraper busca cada producto en `tottus.com.pe/tottus-pe/buscar?Ntt=…`, lee el JSON
  `__NEXT_DATA__` y elige el resultado según las reglas de `QUERIES` (`start`, `must`,
  `prefer`, `exclude`, `kg`). Para ajustar una coincidencia, editar su regla.
- `catalog.js` usa `window.SCRAPED_PRICES[tienda]` cuando existe; si no, la tabla de ejemplo.
- Si encuentra menos de la mitad de productos no sobrescribe los datos anteriores.
