// "Tu bolsillo": vista de la pantalla de resultados, junto a "Precio" y "Cercanía".
// Compara el presupuesto con las opciones de la canasta y da consejos (cálculos en js/core/budget.js).

function qtyLabel(n, unit) {
  if (unit === "kg") return `${n} kg`;
  if (n === 1) return `1 ${unit}`;
  return `${n} ${unit}${/[aeiou]$/.test(unit) ? "s" : "es"}`;
}

/** Etiqueta "Te quedan / Te alcanza justo / Te faltan" para un total. */
function PocketPill(budget, total) {
  const status = budgetStatus(budget, total);
  if (status === "under") return `<span class="pocket-pill is-under">${Icon("check", { size: 12, stroke: 3 })} Te quedan ${money(budget - total)}</span>`;
  if (status === "exact") return `<span class="pocket-pill is-exact">${Icon("check", { size: 12, stroke: 3 })} Te alcanza justo</span>`;
  return `<span class="pocket-pill is-over">${Icon("alert", { size: 12, stroke: 2.6 })} Te faltan ${money(total - budget)}</span>`;
}

function PocketSummary(budget, cart, analysis) {
  const ref = analysis.recommended || analysis.cheapest;
  const total = ref ? ref.total : analysis.status === "incomplete" ? analysis.partialTotal : 0;
  const status = budgetStatus(budget, total);
  const percent = Math.min(100, Math.round((total / budget) * 100));
  const refLabel = analysis.recommended ? "Opción recomendada" : analysis.status === "incomplete" ? "Sin los productos que faltan" : "Opción más económica";

  return `
    <section class="pocket-card">
      <div class="pocket-card__head">
        <p class="pocket-card__eyebrow">${Icon("wallet", { size: 16, stroke: 2.2 })} Tu bolsillo</p>
        <button class="pocket-card__edit" data-action="openBudget">Cambiar</button>
      </div>
      <p class="pocket-card__amount">${money(budget)}</p>
      <p class="pocket-card__sub">para esta compra · ${cart.length} producto${cart.length === 1 ? "" : "s"} en tu canasta</p>
      ${cart.length ? `
        <div class="pocket-meter${status === "over" ? " is-over" : ""}" role="img" aria-label="La canasta usa el ${percent}% de tu presupuesto">
          <span style="width: ${percent}%"></span>
        </div>
        <div class="pocket-card__rows">
          <div class="pocket-card__row"><span>${refLabel}</span><strong>${money(total)}</strong></div>
          <div class="pocket-card__row pocket-card__row--${status}">
            <span>${status === "over" ? "Te faltan" : "Te quedan"}</span>
            <strong>${money(Math.abs(budget - total))}</strong>
          </div>
        </div>` : ""}
    </section>`;
}

function PocketAsk() {
  return `
    <section class="pocket-ask">
      <div class="pocket-ask__bot">${RobotFace(40)}</div>
      <p class="pocket-ask__title">¿Cuánto dinero tienes para esta compra?</p>
      <p class="pocket-ask__text">Ingresa tu presupuesto y te diré qué opción te conviene y cuánto te queda.</p>
      <button class="btn btn--primary btn--md btn--block" data-action="openBudget">${Icon("wallet", { size: 18 })}Ingresar mi presupuesto</button>
    </section>`;
}

function PocketOption(option, budget, recommended) {
  const storeIds = option.stores.map(store => store.id);
  return `
    <article class="pocket-option${recommended ? " is-recommended" : ""}">
      <div class="pocket-option__head">
        <div>
          <p class="pocket-option__title">${recommended ? `<span class="pocket-option__badge">${Icon("star", { size: 11, stroke: 2.6 })} Recomendada</span>` : ""}${option.title}</p>
          <p class="pocket-option__stores">${storeNames(option.stores)}</p>
        </div>
        <p class="pocket-option__total">${money(option.total)}</p>
      </div>
      ${budget != null ? PocketPill(budget, option.total) : ""}
      ${option.complete ? "" : `<p class="pocket-option__missing">${Icon("alert", { size: 13 })} Sin ${option.missing.map(p => p.name).join(", ")} (ninguna tienda lo tiene)</p>`}
      <div class="pocket-option__actions">
        ${option.key === "combined"
          ? `<button class="btn btn--outline btn--xs btn--grow" data-action="openCombined">Ver reparto</button>`
          : `<button class="btn btn--outline btn--xs btn--grow" data-action="openList" data-store="${storeIds[0]}">Ver lista</button>`}
        ${DirectionsButton(storeIds, option.total, "btn btn--subtle btn--xs")}
      </div>
    </article>`;
}

function PocketTips(tips) {
  return `
    <section>
      <p class="section-title pocket-section-title">Consejos para tu bolsillo</p>
      <ul class="pocket-tips">
        ${each(tips, tip => `
          <li class="pocket-tip${tip.tone ? ` is-${tip.tone}` : ""}">
            <span class="pocket-tip__icon">${Icon(tip.icon, { size: 16 })}</span>
            <p>${tip.text}</p>
          </li>`)}
      </ul>
    </section>`;
}

function PocketPlan(budget, plan) {
  if (!plan) return "";
  if (plan.empty) {
    return `
      <section class="pocket-plan pocket-plan--empty">
        <p class="pocket-plan__title">${Icon("info", { size: 16 })} Ningún ajuste alcanza</p>
        <p class="pocket-plan__text">Con ${money(budget)} no alcanza ni para uno de los productos de tu canasta. Mira las canastas rápidas de abajo o revisa tu presupuesto.</p>
      </section>`;
  }
  // Con la canasta ajustada se vuelve a buscar dónde conviene comprarla.
  const after = analyzeBudget(budget, plan.cart).recommended;
  const where = !after ? "" : after.key === "combined"
    ? ` combinando ${storeNames(after.stores)}`
    : ` en ${after.stores[0].name}`;
  const total = after ? after.total : plan.total;
  return `
    <section class="pocket-plan">
      <p class="pocket-plan__title">${Icon("sparkles", { size: 16 })} Para que te alcance</p>
      <ul class="pocket-plan__steps">
        ${each(plan.steps, step => `<li>${step.to === 0
          ? `Quitar <strong>${step.product.name}</strong>`
          : `Bajar <strong>${step.product.name}</strong> de ${qtyLabel(step.from, step.product.unit)} a ${qtyLabel(step.to, step.product.unit)}`}</li>`)}
      </ul>
      <p class="pocket-plan__text">Así podrías comprarla${where} por ${money(total)} y te quedarían <strong>${money(budget - total)}</strong>.</p>
      <button class="btn btn--primary btn--sm btn--block" data-action="applyPlan">${Icon("check", { size: 16, stroke: 2.6 })}Ajustar mi canasta</button>
    </section>`;
}

function PocketBaskets(budget) {
  const { fitting, cheapest } = quickBasketsForBudget(budget);
  return `
    <section>
      <p class="section-title pocket-section-title">Canastas rápidas que entran en tu bolsillo</p>
      ${fitting.length ? `
        <div class="card card--clip pocket-list">
          ${each(fitting, b => `
            <div class="pocket-basket">
              <span class="pocket-basket__emoji">${b.basket.emoji}</span>
              <div class="pocket-basket__text">
                <p class="pocket-basket__name">${b.basket.name}</p>
                <p class="pocket-basket__meta">Desde ${money(b.total)} en ${b.store.name} · te quedan ${money(b.left)}</p>
              </div>
              <button class="btn btn--outline btn--xs" data-action="useBasket" data-index="${b.index}">Usar</button>
            </div>`)}
        </div>`
        : `<p class="pocket-note">${cheapest
          ? `Ninguna canasta rápida entra en ${money(budget)}: la más económica, ${cheapest.basket.name}, cuesta desde ${money(cheapest.total)}.`
          : "Por ahora no hay canastas rápidas con precio en todas sus tiendas."}</p>`}
    </section>`;
}

/** Ofertas reales (precio web rebajado) de tu canasta y otras que entran en lo que te queda. */
function PocketDeals(left) {
  const seen = new Set();
  const deals = realDeals().filter(deal => !seen.has(deal.product.id) && seen.add(deal.product.id));
  const inCart = deals.filter(deal => state.selected.includes(deal.product.id)).slice(0, 3);
  const fits = left != null && left > CENT
    ? deals.filter(deal => !state.selected.includes(deal.product.id) && deal.price <= left + CENT).slice(0, 3)
    : [];
  if (!inCart.length && !fits.length) return "";

  const row = (deal, owned) => `
    <div class="pocket-deal">
      <div class="pocket-deal__text">
        <p class="pocket-deal__name">${deal.product.emoji} ${esc(deal.item.name)}</p>
        <p class="pocket-deal__meta">${deal.store.name} · <s>${money(deal.normalPrice)}</s> <strong>${money(deal.price)}</strong></p>
      </div>
      ${owned
        ? `<span class="tag tag--sm">En tu canasta</span>`
        : `<button class="btn btn--outline btn--xs" data-action="addDeal" data-id="${deal.product.id}">Agregar</button>`}
    </div>`;

  return `
    <section>
      <p class="section-title pocket-section-title">Ofertas reales</p>
      <p class="pocket-note pocket-note--top">Precios web rebajados de Tottus, Metro y Mass según la última actualización.</p>
      <div class="card card--clip pocket-list">
        ${each(inCart, deal => row(deal, true))}
        ${each(fits, deal => row(deal, false))}
      </div>
    </section>`;
}

function BolsilloView() {
  const cart = getCart();
  const budget = state.budget;
  const result = searchBestOffers(cart);

  if (budget == null) {
    return `
      <div class="screen__body screen__body--tight pocket" data-scroll="bolsillo">
        ${PocketAsk()}
        ${cart.length ? `<p class="section-title pocket-section-title">Opciones para tu canasta</p>${each(budgetOptions(result), o => PocketOption(o, null, false))}` : ""}
        ${BudgetAssistant(assistantMessage("bolsillo"))}
      </div>`;
  }

  const analysis = analyzeBudget(budget, cart);
  const plan = analysis.status === "over" ? reductionPlan(budget, cart) : null;
  const message = assistantMessage("bolsillo");
  if (message.action && message.action.name === "applyPlan" && (!plan || plan.empty)) message.action = null;
  const needsAlternatives = ["over", "incomplete", "empty"].includes(analysis.status);

  return `
    <div class="screen__body screen__body--tight pocket" data-scroll="bolsillo">
      ${PocketSummary(budget, cart, analysis)}
      ${analysis.options.length ? `
        <p class="section-title pocket-section-title">Opciones para tu canasta</p>
        ${each(analysis.options, o => PocketOption(o, budget, o === analysis.recommended))}` : ""}
      ${PocketTips(budgetTips(budget, analysis))}
      ${PocketPlan(budget, plan)}
      ${needsAlternatives ? PocketBaskets(budget) : ""}
      ${PocketDeals(analysis.left)}
      <p class="pocket-note">Calculado con los precios de Ca$erIA: web de Tottus, Metro y Mass; referenciales en las demás tiendas. Pasajes referenciales de ida.</p>
      ${BudgetAssistant(message)}
    </div>`;
}

// Acciones de la vista (se suman a las de la pantalla de resultados).
const BOLSILLO_ACTIONS = {
  showBolsillo: ui => { ui.criteria = "bolsillo"; },
  applyPlan: () => {
    const plan = state.budget != null ? reductionPlan(state.budget, getCart()) : null;
    if (!plan || plan.empty) return;
    loadBasket(plan.cart);
  },
  useBasket: (ui, el) => { loadBasket(QUICK_BASKETS[Number(el.dataset.index)].items); },
  addDeal: (ui, el) => {
    const id = Number(el.dataset.id);
    if (state.selected.includes(id)) return;
    toggleProduct(id);
    state.quantities[id] = 1;
  },
};
