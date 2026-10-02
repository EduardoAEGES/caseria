// Mis listas: canastas guardadas y establecimientos favoritos.

function SavedBasketCard(basket) {
  return `
    <div class="card card--clip">
      <div class="saved-basket">
        <div class="saved-basket__head">
          <div>
            <p class="saved-basket__name">${basket.name}</p>
            <p class="saved-basket__count">${basket.count} productos</p>
          </div>
          <div class="saved-basket__price">
            <p class="saved-basket__amount">${basket.lastPrice}</p>
            <p class="saved-basket__count">último precio</p>
          </div>
        </div>
        <div class="saved-basket__tags">${each(basket.products, p => `<span class="tag">${p}</span>`)}</div>
        <span class="pill pill--green pill--strong">✓ Ahorraste ${basket.saved} la última vez</span>
      </div>
      <div class="saved-basket__footer">
        <button class="btn btn--primary btn--sm btn--grow">🔄 Recalcular Precios Hoy</button>
        <button class="btn btn--icon" aria-label="Editar">✏️</button>
      </div>
    </div>`;
}

function FavoriteStoreCard(store) {
  return `
    <div class="card card--pad fav-store">
      <div class="icon-box icon-box--lg">${store.type === "Tienda de descuento" ? "🏷️" : "🏢"}</div>
      <div class="fav-store__info">
        <div class="fav-store__title">
          <p class="fav-store__name">${store.name}</p>
          ${store.featured ? `<span class="pill pill--orange pill--strong">🏆</span>` : ""}
        </div>
        <p class="fav-store__sub">${store.type} · ${store.address}</p>
        <div class="fav-store__tags">${each(store.tags, t => `<span class="tag tag--sm">${t}</span>`)}</div>
      </div>
      <div class="fav-store__side">
        <p class="fav-store__rating">⭐ <strong>${store.rating}</strong></p>
        <button class="fav-store__map" aria-label="Ver en mapa">🗺️</button>
      </div>
    </div>`;
}

defineScreen("mislistas", {
  nav: true,
  ui: () => ({ tab: "canastas" }),

  render: ui => `
    <section class="screen">
      ${StatusBar()}
      <header class="topbar">
        <h1 class="topbar__title">Mis Listas y Canastas Guardadas</h1>
      </header>
      ${Tabs([
        { value: "canastas", label: "🛒 Canastas Frecuentes" },
        { value: "favoritos", label: "⭐ Establecimientos Favoritos" },
      ], ui.tab, "setTab")}
      <div class="screen__body${ui.tab === "favoritos" ? " lists--favorites" : ""}" data-scroll="lists">
        ${ui.tab === "canastas"
          ? each(SAVED_BASKETS, SavedBasketCard) + `<button class="btn btn--dashed btn--md btn--block lists__add">+ Guardar canasta actual como lista</button>`
          : each(FAVORITE_STORES, FavoriteStoreCard)}
      </div>
    </section>`,

  actions: {
    setTab: (ui, el) => { ui.tab = el.dataset.value; },
  },
});
