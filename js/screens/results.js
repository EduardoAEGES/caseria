// Resultados: busca la canasta en cada tienda y muestra la mejor oferta.

// Diferencias menores a medio céntimo se consideran empate.
const SAVINGS_THRESHOLD = 0.005;

function BestOfferCard(best, priciest, savings) {
  if (!best) {
    return `
      <div class="alert-box">
        <p class="alert-box__title">⚠ Ninguna tienda tiene toda tu canasta</p>
        <p class="alert-box__text">La mejor oferta es combinar tiendas (abajo).</p>
      </div>`;
  }
  const saves = savings > SAVINGS_THRESHOLD;
  return `
    <article class="best-offer">
      <div class="best-offer__ribbon">
        <span class="best-offer__ribbon-title">🏆 MEJOR OFERTA · TODO EN 1 TIENDA</span>
        ${saves ? `<span class="best-offer__savings">Ahorras ${money(savings)}</span>` : ""}
      </div>
      <div class="best-offer__body">
        <div class="best-offer__head">
          <div>
            <p class="best-offer__name">${best.store.name}</p>
            <p class="best-offer__meta">🚶 ${best.store.distance} · ${best.store.address}</p>
          </div>
          <p class="best-offer__total">${money(best.total)}</p>
        </div>
        ${saves && priciest ? `<p class="best-offer__compare">Frente a ${priciest.store.name} (${money(priciest.total)}).</p>` : ""}
        <div class="best-offer__actions">
          <button class="btn btn--primary btn--sm btn--grow" data-action="openList" data-store="${best.store.id}">Ver mi lista de compra</button>
          <button class="btn btn--subtle btn--sm" data-action="directions">🗺️ Cómo llegar</button>
        </div>
      </div>
    </article>`;
}

function CombinedCard(best, combined, savings) {
  if (combined.stops.length <= 1 && best) {
    return `
      <div class="combo-card combo-card--compact">
        <p>✓ ${best.store.name} tiene el precio más bajo en todos tus productos. No necesitas ir a otra tienda.</p>
      </div>`;
  }
  const text = best && savings > SAVINGS_THRESHOLD
    ? `Ahorras <strong>${money(savings)}</strong> más que en ${best.store.name}, comprando en ${combined.stops.length} tiendas.`
    : "Compra cada producto donde está más barato.";
  return `
    <button class="combo-card" data-action="openCombined">
      <div class="combo-card__head">
        <div>
          <p class="combo-card__title">💰 MÁXIMO AHORRO COMBINANDO TIENDAS</p>
          <p class="combo-card__stores">${combined.stops.map(s => s.store.name).join(" + ")}</p>
        </div>
        <p class="combo-card__total">${money(combined.total)}</p>
      </div>
      <p class="combo-card__text">${text}<span class="combo-card__link">Ver reparto →</span></p>
    </button>`;
}

function StoreOfferCard(offer, index, isBest) {
  const { store } = offer;
  return `
    <article class="store-card">
      <div class="store-card__head">
        <div class="store-card__name-row">
          <span class="store-card__rank">${index + 1}</span>
          <p class="store-card__name">${store.name}</p>
        </div>
        <div class="store-card__price">
          <p class="store-card__total${isBest ? " is-best" : ""}">${money(offer.total)}</p>
          ${offer.complete ? "" : `<p class="store-card__missing">sin ${offer.missing.length} prod.</p>`}
        </div>
      </div>
      <div class="store-card__tags">
        <span class="pill pill--${store.type}">${store.badge}</span>
        <span class="pill pill--fresh-${store.freshnessLevel}">${store.updated}</span>
        ${offer.complete
          ? `<span class="pill pill--green">✓ Tiene todo</span>`
          : `<span class="pill pill--amber pill--wrap">⚠ Falta: ${offer.missing.map(p => p.name).join(", ")}</span>`}
      </div>
      <p class="store-card__meta">🚶 ${store.distance} · <span>${store.address}</span></p>
      <div class="store-card__actions">
        <button class="btn btn--outline btn--xs btn--grow" data-action="openList" data-store="${store.id}">Ver lista</button>
        <button class="btn btn--subtle btn--xs" data-action="directions">🗺️ Cómo llegar</button>
      </div>
    </article>`;
}

function ResultsList(result, sorted) {
  const { offers, bestSingle, combined } = result;
  const priciestComplete = offers.filter(o => o.complete).at(-1);
  const singleSavings = bestSingle && priciestComplete ? priciestComplete.total - bestSingle.total : 0;
  const combinedSavings = bestSingle ? bestSingle.total - combined.total : 0;

  return `
    <div class="screen__body screen__body--tight" data-scroll="results">
      ${BestOfferCard(bestSingle, priciestComplete, singleSavings)}
      ${CombinedCard(bestSingle, combined, combinedSavings)}
      <div class="results__list-head">
        <p class="section-title">Todas las tiendas</p>
        <button class="link-btn" data-action="openTable">Comparar precio por producto →</button>
      </div>
      ${each(sorted, (offer, i) => StoreOfferCard(offer, i, offer === bestSingle))}
    </div>`;
}

function ResultsMap(result, sorted, pin) {
  const gridLines =
    each([0, 1, 2, 3, 4, 5], i => `<line x1="${i * 20}%" y1="0%" x2="${i * 20}%" y2="100%" />`) +
    each([0, 1, 2, 3, 4], i => `<line x1="0%" y1="${i * 25}%" x2="100%" y2="${i * 25}%" />`);

  const pins = each(sorted, (offer, i) => {
    const isBest = offer === result.bestSingle;
    const open = pin === i;
    const tone = isBest ? "best" : offer.store.type;
    return `
      <button class="map-pin${open ? " is-open" : ""}" style="left: ${offer.store.x}%; top: ${offer.store.y}%" data-action="pin" data-index="${i}">
        <span class="map-pin__dot map-pin__dot--${tone}${open ? " is-open" : ""}">${i + 1}</span>
        ${open ? `
          <span class="map-pin__tooltip">
            <span class="map-pin__name">${offer.store.name}</span>
            <span class="map-pin__price${isBest ? " is-best" : ""}">${money(offer.total)}${offer.complete ? "" : " (incompleta)"}</span>
          </span>` : ""}
      </button>`;
  });

  const legend = [
    { tone: "best", label: "Mejor oferta" },
    { tone: "discount", label: "Tiendas Mass" },
    { tone: "super", label: "Supermercados" },
  ];

  return `
    <div class="results-map">
      <div class="results-map__canvas">
        <svg class="results-map__grid">${gridLines}</svg>
        <div class="results-map__label">${getDistrict().label} — Tiendas consultadas</div>
        ${pins}
      </div>
      <div class="map-legend">
        ${each(legend, l => `<span class="map-legend__item"><span class="map-legend__dot map-legend__dot--${l.tone}"></span>${l.label}</span>`)}
      </div>
      <button class="btn btn--primary btn--md btn--block" data-action="directions">Ver establecimientos y cómo llegar →</button>
    </div>`;
}

// ── Hojas inferiores ────────────────────────────────────────────────────────

function PriceTableSheet(cart) {
  const products = cart.map(item => findProduct(item.productId)).filter(Boolean);
  return `
    <div class="sheet__header sheet__header--center">
      <div>
        <h2 class="sheet__title">Precio por producto</h2>
        <p class="sheet__hint">Precio unitario. El más bajo está en verde; — = no disponible.</p>
      </div>
      ${CloseButton("closeSheet")}
    </div>
    <div class="price-grid price-grid--head">${each(STORES, s => `<span>${STORE_SHORT[s.id]}</span>`)}</div>
    ${each(products, product => {
      const prices = STORES.map(s => getPrice(s.id, product.id));
      const available = prices.filter(price => price !== null);
      const min = available.length ? Math.min(...available) : null;
      return `
        <div class="price-row">
          <p class="price-row__name">${product.emoji} ${product.name}</p>
          <div class="price-grid">
            ${each(prices, price => price === null
              ? `<span class="price-cell is-missing">—</span>`
              : `<span class="price-cell${price === min ? " is-best" : ""}">S/${price.toFixed(2)}</span>`)}
          </div>
        </div>`;
    })}`;
}

function ShoppingListSheet(offer) {
  return `
    ${SheetHeader({ eyebrow: "Lista de compra", title: offer.store.name })}
    ${each(offer.lines, line => `
      <div class="sheet-line">
        <div>
          <p class="sheet-line__name">${line.product.emoji} ${line.product.name}</p>
          <p class="sheet-line__meta">${line.qty} × ${money(line.unitPrice)}</p>
        </div>
        <strong>${money(line.subtotal)}</strong>
      </div>`)}
    ${each(offer.missing, product => `
      <div class="sheet-line sheet-line--missing">
        <p>${product.emoji} ${product.name}</p>
        <span class="sheet-line__na">No disponible</span>
      </div>`)}
    <div class="sheet-total">
      <span class="sheet-total__label">Total</span>
      <span class="sheet-total__value">${money(offer.total)}</span>
    </div>
    <button class="btn btn--primary btn--md btn--block results__sheet-cta" data-action="directions">🗺️ Cómo llegar</button>`;
}

function CombinedPlanSheet(combined) {
  return `
    ${SheetHeader({ eyebrow: "Máximo ahorro", title: "Qué comprar en cada tienda", tone: "green" })}
    ${each(combined.stops, stop => `
      <div class="stop-card">
        <div class="stop-card__head">
          <p class="stop-card__name">${stop.store.name}</p>
          <strong>${money(stop.subtotal)}</strong>
        </div>
        <p class="stop-card__meta">🚶 ${stop.store.distance}</p>
        ${each(stop.lines, line => `
          <div class="stop-card__line">
            <span class="stop-card__item">${line.product.emoji} ${line.product.name} · ${line.qty} × ${money(line.unitPrice)}</span>
            <span class="stop-card__subtotal">${money(line.subtotal)}</span>
          </div>`)}
      </div>`)}
    ${combined.missing.length > 0 ? `<p class="sheet__warn">No encontrado en ninguna tienda: ${combined.missing.map(p => p.name).join(", ")}</p>` : ""}
    <div class="sheet-total sheet-total--green">
      <span class="sheet-total__label">Total combinado</span>
      <span class="sheet-total__value">${money(combined.total)}</span>
    </div>`;
}

function ResultsSheet(ui, result, cart) {
  if (ui.sheet === "table") return Sheet("closeSheet", PriceTableSheet(cart));
  if (ui.sheet === "combined") return Sheet("closeSheet", CombinedPlanSheet(result.combined));
  if (ui.sheet === "list") {
    const offer = result.offers.find(o => o.store.id === ui.listStoreId);
    return offer ? Sheet("closeSheet", ShoppingListSheet(offer)) : "";
  }
  return "";
}

// ── Pantalla ────────────────────────────────────────────────────────────────

defineScreen("results", {
  nav: true,
  // sheet: null | "table" | "list" | "combined"
  ui: () => ({ view: "list", criteria: "precio", pin: null, sheet: null, listStoreId: null }),

  render(ui) {
    const cart = getCart();
    const result = searchBestOffers(cart);
    const sorted = ui.criteria === "precio"
      ? result.offers
      : [...result.offers].sort((a, b) => a.store.distMin - b.store.distMin);

    return `
      <section class="screen">
        ${StatusBar()}
        <header class="topbar">
          ${BackButton()}
          <div class="topbar__text">
            <h1 class="topbar__title">Mejor oferta para tu canasta</h1>
            <p class="topbar__subtitle">${cart.length} productos · ${STORES.length} tiendas consultadas · <span class="topbar__highlight">${getDistrict().label}</span></p>
          </div>
        </header>

        <div class="results__controls">
          ${Segmented([{ value: "precio", label: "💰 Precio" }, { value: "cerca", label: "📍 Cercanía" }], ui.criteria, "setCriteria")}
          ${Segmented([{ value: "list", label: "📋 Lista" }, { value: "map", label: "🗺️ Mapa" }], ui.view, "setView")}
        </div>

        ${ui.view === "list" ? ResultsList(result, sorted) : ResultsMap(result, sorted, ui.pin)}
        ${ResultsSheet(ui, result, cart)}
      </section>`;
  },

  actions: {
    back: () => navigate("quantities"),
    setCriteria: (ui, el) => { ui.criteria = el.dataset.value; },
    setView: (ui, el) => { ui.view = el.dataset.value; },
    pin: (ui, el) => {
      const index = Number(el.dataset.index);
      ui.pin = ui.pin === index ? null : index;
    },
    openTable: ui => { ui.sheet = "table"; },
    openCombined: ui => { ui.sheet = "combined"; },
    openList: (ui, el) => {
      ui.sheet = "list";
      ui.listStoreId = el.dataset.store;
    },
    closeSheet: ui => { ui.sheet = null; },
    directions: () => navigate("stallpremium"),
  },
});
