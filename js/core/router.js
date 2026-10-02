// Navegación entre pantallas y manejo de eventos.
//
// Cada pantalla se registra con defineScreen(nombre, { ... }):
//   ui()       → estado local inicial de la pantalla (se reinicia cada vez que entras)
//   render(ui) → devuelve el HTML de la pantalla como texto
//   actions    → funciones que se ejecutan al hacer clic en [data-action="nombre"]
//                o al escribir en [data-input="nombre"]
//   enter(ui)  → se ejecuta al entrar (timers); puede devolver una función de limpieza
//   nav: true  → muestra la barra de navegación inferior
//
// Después de cada acción la pantalla se vuelve a dibujar, salvo que la acción
// devuelva false (porque ya actualizó el DOM a mano, p. ej. para animar).

const screens = {};
const router = { ui: {}, cleanup: null, visits: 0 };

function defineScreen(name, definition) {
  screens[name] = definition;
}

function navigate(name) {
  if (router.cleanup) router.cleanup();
  router.cleanup = null;
  router.visits++;

  const screen = screens[name];
  state.screen = name;
  router.ui = screen.ui ? screen.ui() : {};
  render({ fresh: true });
  if (screen.enter) router.cleanup = screen.enter(router.ui) || null;
}

function render({ fresh = false } = {}) {
  const screen = screens[state.screen];
  const root = document.getElementById("screen");
  const view = fresh ? null : captureView(root);

  root.innerHTML = screen.render(router.ui) + (screen.nav ? BottomNav(state.screen) : "");
  root.classList.toggle("has-nav", Boolean(screen.nav));
  document.getElementById("overlay").innerHTML = Modal();

  if (view) restoreView(root, view);
}

// Guarda scroll y foco antes de redibujar para que la pantalla no "salte".
// Los contenedores con scroll se marcan con data-scroll="nombre-único".
function captureView(root) {
  const scroll = {};
  root.querySelectorAll("[data-scroll]").forEach(el => {
    scroll[el.dataset.scroll] = { top: el.scrollTop, left: el.scrollLeft };
  });
  const active = document.activeElement;
  const focus = active && active.id && root.contains(active)
    ? { id: active.id, start: active.selectionStart, end: active.selectionEnd }
    : null;
  return { scroll, focus };
}

function restoreView(root, { scroll, focus }) {
  root.querySelectorAll("[data-scroll]").forEach(el => {
    const saved = scroll[el.dataset.scroll];
    if (saved) {
      el.scrollTop = saved.top;
      el.scrollLeft = saved.left;
    }
  });
  if (focus) {
    const el = document.getElementById(focus.id);
    if (el) {
      el.focus();
      if (focus.start != null) el.setSelectionRange(focus.start, focus.end);
    }
  }
}

// Acciones disponibles en cualquier pantalla.
const globalActions = {
  go: (ui, el) => {
    if (el.dataset.to !== state.screen) navigate(el.dataset.to);
  },
  openDistrict: () => { state.modal = { type: "district" }; },
  openWeb: (ui, el) => { state.modal = { type: "web", name: el.dataset.name }; },
  closeModal: () => { state.modal = null; },
};

function runAction(name, el, event) {
  const screen = screens[state.screen];
  const handler = (screen.actions && screen.actions[name]) || globalActions[name];
  if (!handler) return;

  const visits = router.visits;
  const result = handler(router.ui, el, event);
  if (result !== false && router.visits === visits) render();
}

// Un solo listener para toda la app (delegación de eventos).
function bindEvents(container) {
  container.addEventListener("click", event => {
    // Clic en el fondo oscuro de una hoja/modal (no en su contenido) → cerrar.
    const backdrop = event.target.closest("[data-backdrop]");
    if (backdrop && event.target === backdrop) {
      runAction(backdrop.dataset.backdrop, backdrop, event);
      return;
    }
    const el = event.target.closest("[data-action]");
    if (el) runAction(el.dataset.action, el, event);
  });

  container.addEventListener("input", event => {
    const el = event.target.closest("[data-input]");
    if (el) runAction(el.dataset.input, el, event);
  });
}
