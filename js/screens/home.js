// Inicio: buscador, categorías, canastas rápidas y tiendas del distrito.

// Color de fondo de cada categoría (clase category-chip--<tono>).
const CATEGORY_TONES = { Carnes: "red", Verduras: "green", Frutas: "orange", Abarrotes: "amber", Lácteos: "sky", Bebidas: "violet", Limpieza: "teal" };

defineScreen("home", {
  nav: true,
  ui: () => ({ catalogTab: "super" }),

  render(ui) {
    const district = getDistrict();
    const catalog = ui.catalogTab === "super" ? district.supermarkets : district.minimarkets;
    const name = esc(state.userName);
    const initial = esc((state.userName[0] || "M").toUpperCase());

    return `
      <section class="screen">
        ${StatusBar()}
        <div class="screen__body home" data-scroll="home">
          <header class="home__header">
            <div>
              <button class="district-btn" data-action="openDistrict">
                ${Icon("map-pin", { size: 16 })}<span class="district-btn__label">${district.label}, Arequipa</span>${Icon("chevron-down", { size: 16 })}
              </button>
              <h1 class="home__hello">Hola, ${name}</h1>
            </div>
            <button class="avatar${state.premium ? " avatar--premium" : ""}" data-action="go" data-to="buyerprofile" aria-label="Perfil">
              ${initial}
              ${state.premium ? `<span class="avatar__badge">${Icon("crown", { size: 11, stroke: 2.5 })}</span>` : ""}
            </button>
          </header>

          <div class="home__section">
            <button class="search-box" data-action="openCategory" data-cat="Todos">
              ${Icon("search", { size: 20 })}
              <span class="search-box__placeholder">Buscar producto, marca o categoría</span>
            </button>
          </div>

          <div class="home__section">
            <div class="home-banner">
              <div class="home-banner__text-wrap">
                <p class="home-banner__eyebrow">Compara y ahorra</p>
                <p class="home-banner__title">Tu canasta al mejor precio de Paucarpata</p>
                <p class="home-banner__text">Tottus, Plaza Vea, Franco y Tiendas Mass en una sola búsqueda.</p>
              </div>
              <span class="home-banner__icon">${Icon("cart", { size: 30, stroke: 1.8 })}</span>
            </div>
          </div>

          <div class="home__section">
            <div class="section-head">
              <div>
                <p class="section-title">Categorías</p>
                <p class="section-sub">Elige y arma tu canasta</p>
              </div>
              <button class="link-btn link-btn--icon" data-action="openCategory" data-cat="Todos">Ver todo${Icon("chevron-right", { size: 16 })}</button>
            </div>
            <div class="category-grid">
              ${each(CATEGORIES, c => `
                <button class="category-chip" data-action="openCategory" data-cat="${c.key}">
                  <span class="category-chip__circle category-chip--${CATEGORY_TONES[c.key] || "sky"}">${c.emoji}</span>
                  <span class="category-chip__name">${c.key}</span>
                </button>`)}
              <button class="category-chip" data-action="openCategory" data-cat="Todos">
                <span class="category-chip__circle category-chip--blue">${Icon("grid", { size: 22 })}</span>
                <span class="category-chip__name">Todo</span>
              </button>
            </div>
          </div>

          ${state.premium ? `
            <div class="home__section">
              <div class="promo-banner promo-banner--premium">
                <span class="promo-banner__icon">${Icon("crown", { size: 22 })}</span>
                <p class="promo-banner__text">Premium activo · escáner IA y nutrición sin límites</p>
                <button class="promo-banner__btn" data-action="go" data-to="scanner">Escanear</button>
              </div>
            </div>` : state.trialUsed ? "" : `
            <div class="home__section">
              <div class="promo-banner">
                <span class="promo-banner__icon">${Icon("sparkles", { size: 22 })}</span>
                <p class="promo-banner__text">Tienes 1 prueba gratis del escáner IA y nutrición</p>
                <button class="promo-banner__btn" data-action="go" data-to="scanner">Probar</button>
              </div>
            </div>`}

          <div>
            <div class="section-head home__section">
              <div>
                <p class="section-title">Canastas rápidas</p>
                <p class="section-sub">Listas para comparar en un toque</p>
              </div>
            </div>
            <div class="basket-strip hide-scrollbar" data-scroll="home-baskets">
              ${each(QUICK_BASKETS, (basket, i) => {
                const best = searchBestOffers(basket.items).bestSingle;
                return `
                  <button class="basket-tile" data-action="quickBasket" data-index="${i}">
                    <span class="basket-tile__emoji">${basket.emoji}</span>
                    <p class="basket-tile__name">${basket.name}</p>
                    <p class="basket-tile__desc">${basket.items.length} productos · ${basket.desc}</p>
                    ${best ? `<p class="basket-tile__price"><span>desde</span> ${money(best.total)}</p>` : ""}
                  </button>`;
              })}
            </div>
          </div>

          <div class="home__section">
            <div class="section-head">
              <div>
                <p class="section-title">Tiendas cerca de ti</p>
                <p class="section-sub">Donde buscamos tus precios</p>
              </div>
            </div>
            <div class="card card--clip">
              <div class="store-tabs">
                ${each([{ value: "super", label: "Supermercados" }, { value: "mass", label: "Tiendas de descuento" }], t => `
                  <button class="store-tabs__btn${ui.catalogTab === t.value ? " is-active" : ""}" data-action="setCatalog" data-value="${t.value}">${t.label}</button>`)}
              </div>
              <div class="store-list">
                ${each(catalog, store => `
                  <div class="store-list__row">
                    <span class="icon-chip">${Icon(ui.catalogTab === "super" ? "store" : "tag", { size: 20 })}</span>
                    <div class="store-list__text">
                      <p class="store-list__name">${store.name}</p>
                      <p class="store-list__tag">${store.tag}</p>
                    </div>
                    <span class="store-list__chevron">${Icon("chevron-right", { size: 18 })}</span>
                  </div>`)}
              </div>
            </div>
          </div>

          <div class="home__section">
            <div class="create-banner">
              <div>
                <p class="create-banner__eyebrow">Personaliza tu compra</p>
                <p class="create-banner__title">¿Armas tu propia canasta?</p>
              </div>
              <button class="create-banner__btn" data-action="openCategory" data-cat="Todos">${Icon("plus", { size: 18, stroke: 2.5 })}Crear</button>
            </div>
          </div>
        </div>
      </section>`;
  },

  actions: {
    setCatalog: (ui, el) => { ui.catalogTab = el.dataset.value; },
    openCategory: (ui, el) => {
      state.startCategory = el.dataset.cat;
      navigate("select");
    },
    quickBasket: (ui, el) => {
      loadBasket(QUICK_BASKETS[Number(el.dataset.index)].items);
      navigate("quantities");
    },
  },
});
