// Interfaz de "Tu bolsillo": ventana del presupuesto, robot asistente y barra de saldo.
// Los cálculos están en js/core/budget.js.

const BUDGET_SUGGESTIONS = [20, 50, 100, 150];

/** Carita del robot asistente (SVG propio, con los colores de la marca). */
function RobotFace(size = 30) {
  return `
    <svg class="robot-face" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M20 5v5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="20" cy="4.5" r="2.8" fill="#FF9800"/>
      <path d="M4 19v6M36 19v6" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <rect x="7" y="10" width="26" height="22" rx="8" fill="#fff"/>
      <rect x="11" y="15" width="18" height="11" rx="5.5" fill="#0F172A"/>
      <circle class="robot-face__eye" cx="16" cy="20.5" r="2.1" fill="#5EEAD4"/>
      <circle class="robot-face__eye" cx="24" cy="20.5" r="2.1" fill="#5EEAD4"/>
      <path d="M16.5 28.5q3.5 2 7 0" stroke="#0B63E5" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </svg>`;
}

/** Ventana "¿Cuánto dinero tienes para esta compra?" (state.modal.type === "budget"). */
function BudgetModal({ draft = "", error = "" }) {
  return `
    <div class="backdrop backdrop--center" data-backdrop="budgetSkip">
      <div class="modal budget-modal slide-up" role="dialog" aria-modal="true" aria-labelledby="budget-title">
        <div class="modal__top">
          <button class="close-btn close-btn--round" data-action="budgetSkip" aria-label="Cerrar">${Icon("x", { size: 18, stroke: 2.4 })}</button>
        </div>
        <div class="modal__body">
          <div class="budget-modal__bot">${RobotFace(44)}</div>
          <p class="budget-modal__eyebrow">${Icon("wallet", { size: 14, stroke: 2.4 })} Tu bolsillo</p>
          <h2 id="budget-title" class="modal__title">¿Cuánto dinero tienes para esta compra?</h2>
          <p class="modal__text">Te ayudaré a encontrar la mejor opción y te diré cuánto te queda.</p>

          <label class="field budget-field" for="budget-input">
            <span class="budget-field__prefix">S/</span>
            <input id="budget-input" class="field__input field__input--strong" inputmode="decimal" autocomplete="off"
              placeholder="0.00" value="${esc(draft)}" data-input="budgetInput" data-enter="budgetSave"
              aria-label="Presupuesto en soles" aria-describedby="budget-error">
          </label>
          <p id="budget-error" class="budget-modal__error" role="alert">${esc(error)}</p>

          <div class="budget-modal__quick">
            ${each(BUDGET_SUGGESTIONS, value => `<button class="chip" data-action="budgetQuick" data-value="${value}">S/ ${value}</button>`)}
          </div>

          <button class="btn btn--primary btn--lg btn--block" data-action="budgetSave">Continuar</button>
          <button class="btn btn--link-muted btn--block" data-action="budgetSkip">Ahora no</button>
        </div>
      </div>
    </div>`;
}

/** Abre la ventana del presupuesto y pone el cursor en el campo. */
function openBudgetModal() {
  state.modal = { type: "budget", draft: state.budget != null ? state.budget.toFixed(2) : "", error: "" };
  requestAnimationFrame(() => {
    const input = document.getElementById("budget-input");
    if (input) input.focus();
  });
}

/**
 * Robot flotante con globo de diálogo. Va como último hijo de un contenedor con scroll
 * (.screen__body): queda pegado abajo a la derecha sin tapar la barra inferior ni los botones fijos.
 * El globo se puede cerrar y volver a abrir tocando el robot; se reabre solo cuando cambia el mensaje.
 */
function BudgetAssistant(message) {
  if (!message) return "";
  const assistant = state.assistant;
  if (assistant.key !== message.key) Object.assign(assistant, { key: message.key, open: true, fresh: true });
  const animate = assistant.fresh;
  assistant.fresh = false;

  return `
    <div class="assistant">
      ${assistant.open ? `
        <div class="assistant__bubble${animate ? " assistant__bubble--enter" : ""}" role="status">
          <button class="assistant__close" data-action="closeAssistant" aria-label="Cerrar mensaje">${Icon("x", { size: 14, stroke: 2.6 })}</button>
          <p class="assistant__text">${message.text}</p>
          ${message.action ? `<button class="assistant__cta" data-action="${message.action.name}">${message.action.label}${Icon("chevron-right", { size: 14, stroke: 2.6 })}</button>` : ""}
        </div>` : ""}
      <button class="assistant__bot${assistant.open ? " is-open" : ""}" data-action="toggleAssistant"
        aria-label="${assistant.open ? "Ocultar mensaje del asistente" : "Ver mensaje del asistente"}" aria-expanded="${assistant.open}">
        ${RobotFace(30)}
        ${assistant.open ? "" : `<span class="assistant__dot"></span>`}
      </button>
    </div>`;
}

/** Barra "Tu bolsillo" para las pantallas donde se arma la canasta. */
function BudgetBar() {
  if (state.budget == null) {
    return `
      <button class="budget-bar budget-bar--empty" data-action="openBudget">
        <span class="budget-bar__icon">${Icon("wallet", { size: 18 })}</span>
        <span class="budget-bar__text">
          <span class="budget-bar__label">Tu bolsillo</span>
          <span class="budget-bar__value">¿Cuánto tienes para esta compra?</span>
        </span>
        <span class="budget-bar__edit">Ingresar</span>
      </button>`;
  }

  const cart = getCart();
  const analysis = cart.length ? analyzeBudget(state.budget, cart) : null;
  let detail = "";
  if (analysis && analysis.recommended) {
    detail = `<span class="budget-bar__state is-${analysis.status}">${analysis.status === "exact" ? "Te alcanza justo" : `Te quedarían ${money(analysis.left)}`}</span>`;
  } else if (analysis && analysis.status === "over") {
    detail = `<span class="budget-bar__state is-over">Te faltan ${money(analysis.short)}</span>`;
  } else if (analysis && analysis.status === "incomplete") {
    detail = `<span class="budget-bar__state is-over">Hay productos que ninguna tienda tiene</span>`;
  }

  return `
    <div class="budget-bar">
      <span class="budget-bar__icon">${Icon("wallet", { size: 18 })}</span>
      <span class="budget-bar__text">
        <span class="budget-bar__label">Tu bolsillo · ${money(state.budget)}</span>
        <span class="budget-bar__value">${detail || "Elige productos para ver cuánto te queda"}</span>
      </span>
      <button class="budget-bar__edit" data-action="openBudget">Cambiar</button>
    </div>`;
}

// Acciones disponibles en cualquier pantalla.
Object.assign(globalActions, {
  openBudget: () => { openBudgetModal(); },

  // Al escribir no se redibuja (el campo perdería el foco): solo se guarda el borrador.
  budgetInput: (ui, el) => {
    state.modal.draft = el.value;
    state.modal.error = "";
    document.getElementById("budget-error").textContent = "";
    return false;
  },
  budgetQuick: (ui, el) => {
    state.modal.draft = el.dataset.value;
    state.modal.error = "";
  },
  budgetSave: () => {
    const value = parseBudget(state.modal.draft);
    if (value === null) {
      state.modal.error = `Ingresa un monto válido en soles, por ejemplo 50 o 50.50 (máximo S/ ${BUDGET_MAX}).`;
      requestAnimationFrame(() => document.getElementById("budget-input")?.focus());
      return;
    }
    state.budget = value;
    state.budgetAsked = true;
    state.modal = null;
  },
  budgetSkip: () => {
    state.budgetAsked = true;
    state.modal = null;
  },

  toggleAssistant: () => {
    state.assistant.open = !state.assistant.open;
    state.assistant.fresh = state.assistant.open;
  },
  closeAssistant: () => { state.assistant.open = false; },
});
