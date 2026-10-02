// Inicio: categorías, canastas rápidas y tiendas del distrito.

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
              <p class="home__welcome">¡Bienvenido de nuevo 👋</p>
              <h1 class="home__hello">¡Hola, ${name}!</h1>
            </div>
            <div class="home__header-actions">
              <button class="district-btn" data-action="openDistrict">
                <span>📍</span><span class="district-btn__label">${district.label}</span><span>▾</span>
              </button>
              <div class="avatar">${initial}</div>
            </div>
          </header>

          <div class="home__section">
            <div class="home-banner">
              <span class="home-banner__icon">📊</span>
              <div>
                <p class="home-banner__title">Encuentra la mejor oferta en Paucarpata</p>
                <p class="home-banner__text">Elige tus productos y buscamos tu combinación en Tottus, Plaza Vea, Franco Supermercados y Tiendas Mass.</p>
              </div>
            </div>
          </div>

          <div class="home__section">
            <div class="section-head">
              <p class="section-title">🗂️ Compra por categoría</p>
              <button class="link-btn" data-action="openCategory" data-cat="Todos">Ver todo →</button>
            </div>
            <div class="category-grid">
              ${each(CATEGORIES, c => `
                <button class="category-tile" data-action="openCategory" data-cat="${c.key}">
                  <span class="category-tile__emoji">${c.emoji}</span>
                  <span class="category-tile__name">${c.key}</span>
                  <span class="category-tile__count">${PRODUCTS.filter(p => p.cat === c.key).length} prod.</span>
                </button>`)}
              <button class="category-tile category-tile--all" data-action="openCategory" data-cat="Todos">
                <span class="category-tile__emoji">🛒</span>
                <span class="category-tile__name">Todos</span>
              </button>
            </div>
          </div>

          ${state.trialUsed ? "" : `
            <div class="home__section">
              <div class="promo-banner">
                <span class="promo-banner__icon">✨</span>
                <p class="promo-banner__text">¡Tienes 1 PRUEBA GRATIS de Escáner IA y Nutrición!</p>
                <button class="promo-banner__btn" data-action="go" data-to="scanner">Probar</button>
              </div>
            </div>`}

          <div>
            <div class="section-head home__section">
              <p class="section-title">⭐ Canastas Rápidas</p>
            </div>
            <div class="basket-strip hide-scrollbar" data-scroll="home-baskets">
              ${each(QUICK_BASKETS, (basket, i) => {
                const best = searchBestOffers(basket.items).bestSingle;
                return `
                  <button class="basket-tile" data-action="quickBasket" data-index="${i}">
                    <span class="basket-tile__emoji">${basket.emoji}</span>
                    <p class="basket-tile__name">${basket.name}</p>
                    <p class="basket-tile__desc">${basket.items.length} productos · ${basket.desc}</p>
                    ${best ? `<span class="basket-tile__price">desde ${money(best.total)}</span>` : ""}
                  </button>`;
              })}
            </div>
          </div>

          <div class="home__section">
            <div class="card card--clip">
              <div class="store-tabs">
                ${each([{ value: "super", label: "🏢 Supermercados" }, { value: "mass", label: "🏷️ Tiendas Mass" }], t => `
                  <button class="store-tabs__btn${ui.catalogTab === t.value ? " is-active" : ""}" data-action="setCatalog" data-value="${t.value}">${t.label}</button>`)}
              </div>
              <div class="store-list">
                ${each(catalog, store => `
                  <div class="store-list__row">
                    <div class="icon-box">${store.emoji}</div>
                    <div class="store-list__text">
                      <p class="store-list__name">${store.name}</p>
                      <p class="store-list__tag">${store.tag}</p>
                    </div>
                    <span class="store-list__chevron">›</span>
                  </div>`)}
              </div>
            </div>
          </div>

          <div class="home__section">
            <div class="create-banner">
              <div>
                <p class="create-banner__eyebrow">🛒 Personaliza tu compra</p>
                <p class="create-banner__title">¿Armas tu propia canasta?</p>
              </div>
              <button class="create-banner__btn" data-action="openCategory" data-cat="Todos">+ Crear</button>
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
