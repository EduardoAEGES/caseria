// Paso 2 de 2: ajustar cantidades antes de buscar la mejor oferta.

defineScreen("quantities", {
  nav: true,

  render() {
    const products = PRODUCTS.filter(p => state.selected.includes(p.id));

    return `
      <section class="screen">
        ${StatusBar()}
        <header class="topbar">
          ${BackButton()}
          <div class="topbar__text">
            <p class="topbar__eyebrow">Paso 2 de 2</p>
            <h1 class="topbar__title">Ajusta las cantidades</h1>
          </div>
          ${StepBars(2)}
        </header>

        <div class="screen__body" data-scroll="quantities">
          <div class="note note--blue-text">
            <span class="note__icon">🤖</span>
            <p>Buscaremos esta combinación exacta en la base de precios de cada tienda y te mostraremos la mejor oferta.</p>
          </div>

          ${products.length === 0 ? `<p class="empty">Tu canasta está vacía. Vuelve y elige productos.</p>` : ""}

          <div class="qty-list">
            ${each(products, product => {
              const qty = state.quantities[product.id] ?? 1;
              return `
                <div class="qty-row">
                  <span class="qty-row__emoji">${product.emoji}</span>
                  <div class="qty-row__info">
                    <p class="qty-row__name">${product.name}</p>
                    <p class="qty-row__meta">${product.cat} · ${qty} ${product.unit}</p>
                  </div>
                  <div class="stepper">
                    <button class="stepper__btn" data-action="minus" data-id="${product.id}" aria-label="${qty === 1 ? "Quitar" : "Restar"}">${qty === 1 ? "🗑" : "−"}</button>
                    <span class="stepper__value">${qty}</span>
                    <button class="stepper__btn stepper__btn--plus" data-action="plus" data-id="${product.id}" aria-label="Sumar">+</button>
                  </div>
                </div>`;
            })}
          </div>

          <button class="btn btn--dashed btn--md btn--block" data-action="back">+ Agregar más productos</button>
        </div>

        <div class="action-footer">
          <button class="btn btn--primary btn--lg btn--block" data-action="next"${products.length === 0 ? " disabled" : ""}>🔍 Buscar la mejor oferta</button>
        </div>
      </section>`;
  },

  actions: {
    back: () => navigate("select"),
    minus: (ui, el) => {
      const id = Number(el.dataset.id);
      if ((state.quantities[id] ?? 1) === 1) removeProduct(id);
      else changeQty(id, -1);
    },
    plus: (ui, el) => { changeQty(Number(el.dataset.id), 1); },
    next: () => navigate("loading"),
  },
});
