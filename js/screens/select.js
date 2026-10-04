// Paso 1 de 2: elegir productos por categoría o búsqueda.

function countSelectedIn(category) {
  return PRODUCTS.filter(p => state.selected.includes(p.id) && (category === "Todos" || p.cat === category)).length;
}

function ProductCard(product) {
  const selected = state.selected.includes(product.id);
  const storesWith = STORES.filter(s => getPrice(s.id, product.id) !== null).length;
  return `
    <button class="product-card${selected ? " is-selected" : ""}" data-action="toggle" data-id="${product.id}">
      <div class="product-card__top">
        <span class="product-card__emoji">${product.emoji}</span>
        ${Check(selected)}
      </div>
      <p class="product-card__name">${product.name}</p>
      <p class="product-card__price">desde <strong>${money(referencePrice(product.id))}</strong>/${product.unit}</p>
      <p class="product-card__stores">En ${storesWith} de ${STORES.length} tiendas</p>
    </button>`;
}

function VariantSheet(productId) {
  const product = findProduct(productId);
  
  // Mock variants for the demo based on product attributes
  let variants = [];
  if (product.cat === "Carnes") {
    variants = ["Corte Estándar", "Troceado", "Fileteado Delgado"];
  } else if (product.cat === "Verduras" || product.cat === "Frutas") {
    variants = ["A granel (Bolsa de papel)", "Malla pre-empacada", "Bandeja Premium"];
  } else if (product.unit === "bolsa" || product.unit === "paquete") {
    variants = ["Empaque Normal", "Empaque Económico", "Tamaño Familiar"];
  } else if (product.unit === "botella") {
    variants = ["Botella de Plástico", "Botella de Vidrio", "Pack x6"];
  } else {
    variants = ["Presentación Clásica", "Presentación Especial", "Caja / Empaque de Regalo"];
  }

  return Sheet("closeVariant", `
    <div class="sheet__handle"></div>
    ${SheetHeader({ eyebrow: product.cat, title: product.name, close: "closeVariant" })}
    <p class="sheet__hint" style="margin-bottom: 16px;">Elige la forma de presentación, medida o tipo de empaque:</p>
    
    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
      ${each(variants, v => `
        <button class="btn btn--outline btn--lg btn--block" style="justify-content: flex-start; text-align: left;" data-action="selectVariant">
          <span style="font-size: 20px; margin-right: 8px;">📦</span> ${v}
        </button>
      `)}
    </div>
  `);
}


defineScreen("select", {
  nav: true,
  ui: () => ({ category: state.startCategory, query: "", activeProduct: null }),

  render(ui) {
    const q = ui.query.trim().toLowerCase();
    const products = PRODUCTS.filter(p => (ui.category === "Todos" || p.cat === ui.category) && (!q || p.name.toLowerCase().includes(q)));
    const tabs = [{ key: "Todos", label: "Todos" }, ...CATEGORIES.map(c => ({ key: c.key, label: `${c.emoji} ${c.key}` }))];

    return `
      <section class="screen">
        ${StatusBar()}
        <header class="topbar topbar--flat">
          ${BackButton()}
          <div class="topbar__text">
            <p class="topbar__eyebrow">Paso 1 de 2</p>
            <h1 class="topbar__title">Elige tus productos</h1>
          </div>
          ${StepBars(1)}
        </header>

        <div class="select__search">
          <label class="search">
            ${Icon("search", { size: 18 })}
            <input id="product-search" class="search__input" data-input="search" placeholder="Buscar producto..." value="${esc(ui.query)}">
            ${ui.query ? `<button class="search__clear" data-action="clearSearch" aria-label="Borrar búsqueda">${Icon("x", { size: 16, stroke: 2.4 })}</button>` : ""}
          </label>
        </div>

        <div class="select__chips hide-scrollbar" data-scroll="select-chips">
          ${each(tabs, tab => {
            const count = countSelectedIn(tab.key);
            return `
              <button class="chip${ui.category === tab.key ? " is-active" : ""}" data-action="setCategory" data-value="${tab.key}">
                ${tab.label}${count > 0 ? `<span class="chip__count">${count}</span>` : ""}
              </button>`;
          })}
        </div>

        <div class="screen__body" data-scroll="select-grid">
          ${products.length === 0 ? `<p class="empty">No encontramos productos con ese nombre.</p>` : ""}
          <div class="product-grid">${each(products, ProductCard)}</div>
        </div>

        ${state.selected.length > 0 && !ui.activeProduct ? `
          <div class="action-footer">
            <button class="btn btn--primary btn--lg btn--block" data-action="next">
              <span class="btn__count">${state.selected.length}</span> productos · Definir cantidades ${Icon("chevron-right", { size: 18, stroke: 2.4 })}
            </button>
          </div>` : ""}

        ${ui.activeProduct ? VariantSheet(ui.activeProduct) : ""}
      </section>`;
  },

  actions: {
    back: () => navigate("home"),
    search: (ui, el) => { ui.query = el.value; },
    clearSearch: ui => { ui.query = ""; },
    setCategory: (ui, el) => { ui.category = el.dataset.value; },
    toggle: (ui, el) => {
      const id = Number(el.dataset.id);
      if (state.selected.includes(id)) {
        toggleProduct(id); // Deseleccionar directo
      } else {
        ui.activeProduct = id; // Abrir modal de presentación
      }
    },
    closeVariant: ui => { ui.activeProduct = null; },
    selectVariant: ui => {
      if (ui.activeProduct) {
        toggleProduct(ui.activeProduct);
        ui.activeProduct = null;
      }
    },
    next: () => navigate("quantities"),
  },
});
