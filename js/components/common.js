// Piezas de interfaz reutilizables. Cada función devuelve un trozo de HTML.

function StatusBar(dark = false) {
  return `
    <div class="status-bar${dark ? " status-bar--dark" : ""}">
      <span>9:41</span>
      <div class="status-bar__icons">${Icon("signal", { size: 15 })}${Icon("wifi", { size: 15 })}${Icon("battery", { size: 22, stroke: 1.6 })}</div>
    </div>`;
}

function Wordmark() {
  return `Ca<span class="wordmark__dollar">$</span>erIA`;
}

function BackButton(action = "back") {
  return `<button class="back-btn" data-action="${action}" aria-label="Volver">${Icon("chevron-left", { size: 24, stroke: 2.4 })}</button>`;
}

/** Indicador "Paso X de 2" con dos barritas. */
function StepBars(done) {
  return `<div class="steps">${each([1, 2], i => `<span class="steps__bar${i <= done ? " is-done" : ""}"></span>`)}</div>`;
}

function Check(on, modifiers = "") {
  return `<span class="check ${modifiers}${on ? " is-on" : ""}">${on ? Icon("check", { size: 14, stroke: 3 }) : ""}</span>`;
}

/** Selector segmentado: options = [{ value, label }]. */
function Segmented(options, current, action) {
  return `
    <div class="segmented">
      ${each(options, o => `<button class="segmented__btn${o.value === current ? " is-active" : ""}" data-action="${action}" data-value="${o.value}">${o.label}</button>`)}
    </div>`;
}

/** Pestañas subrayadas: options = [{ value, label }]. */
function Tabs(options, current, action) {
  return `
    <div class="tabs">
      ${each(options, o => `<button class="tabs__btn${o.value === current ? " is-active" : ""}" data-action="${action}" data-value="${o.value}">${o.label}</button>`)}
    </div>`;
}

function CloseButton(action) {
  return `<button class="close-btn" data-action="${action}" aria-label="Cerrar">${Icon("x", { size: 18, stroke: 2.4 })}</button>`;
}

/** Hoja inferior que se cierra al tocar el fondo oscuro. */
function Sheet(closeAction, content) {
  return `
    <div class="backdrop" data-backdrop="${closeAction}">
      <div class="sheet slide-up hide-scrollbar">${content}</div>
    </div>`;
}

function SheetHeader({ eyebrow, title, tone = "", close = "closeSheet" }) {
  return `
    <div class="sheet__header">
      <div>
        <p class="sheet__eyebrow${tone ? ` sheet__eyebrow--${tone}` : ""}">${eyebrow}</p>
        <h2 class="sheet__title">${title}</h2>
      </div>
      ${CloseButton(close)}
    </div>`;
}

function ReferencePricesNote() {
  return `
    <div class="note note--amber">
      ${Icon("info", { size: 18 })}
      <p>Los precios son referenciales. Pueden variar según disponibilidad en tienda.</p>
    </div>`;
}

// ── Barra de navegación inferior ────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Inicio",     icon: "home", to: "home",         activeOn: ["home"] },
  { label: "Categorías", icon: "grid", to: "select",       activeOn: ["select", "quantities", "loading"] },
  { label: "Listas",     icon: "list", to: "mislistas",    activeOn: ["mislistas"] },
  { label: "Comparar",   icon: "chart", to: "results",      activeOn: ["results", "stallstandard", "stallpremium", "stallmap"] },
  { label: "Perfil",     icon: "user", to: "buyerprofile", activeOn: ["buyerprofile", "scanner"] },
];

function BottomNav(current) {
  return `
    <nav class="bottom-nav">
      ${each(NAV_ITEMS, item => {
        const active = item.activeOn.includes(current);
        return `
          <button class="bottom-nav__item${active ? " is-active" : ""}" data-action="go" data-to="${item.to}">
            <span class="bottom-nav__icon">${Icon(item.icon, { size: 24, stroke: active ? 2.3 : 1.8 })}</span>
            <span class="bottom-nav__label">${item.label}</span>
          </button>`;
      })}
    </nav>`;
}
