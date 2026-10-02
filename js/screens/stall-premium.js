// Ficha del establecimiento con el mejor precio (destino de "Cómo llegar").

const PREMIUM_PRICES = [
  { item: "Arroz 1kg",        price: "S/ 3.10",  deal: false },
  { item: "Aceite 1lt",       price: "S/ 6.30",  deal: true },
  { item: "Huevos x30",       price: "S/ 15.50", deal: false },
  { item: "Azúcar 1kg",       price: "S/ 2.70",  deal: false },
  { item: "Papa Canchan 1kg", price: "S/ 1.80",  deal: true },
];

defineScreen("stallpremium", {
  nav: true,
  ui: () => ({ saved: false }),

  render: ui => `
    <section class="screen">
      ${StatusBar()}
      ${StallHero({
        tone: "blue",
        emoji: "🏷️🛒",
        name: "Tiendas Mass – Porongoche",
        badge: `<span class="stall-hero__badge stall-hero__badge--best">🏆 Mejor precio</span>`,
        address: "Av. Los Incas 320, Paucarpata",
      })}
      <div class="screen__body" data-scroll="stall-premium">
        <div class="savings-banner">
          <span class="savings-banner__icon">🏆</span>
          <div>
            <p class="savings-banner__title">Opción más económica para tu canasta</p>
            <p class="savings-banner__text">Precios actualizados · Ahorras S/ 23.50 vs. alternativas</p>
          </div>
        </div>

        <div class="stat-chips">
          <span class="stat-chip stat-chip--green">📊 S/ 76.50</span>
          <span class="stat-chip stat-chip--blue">📍 600 m · 8 min</span>
          <span class="stat-chip">🕗 7:00 – 22:00</span>
        </div>

        <div class="card card--pad">
          <p class="card__label">Información del establecimiento</p>
          ${DetailList([
            ["🏪", "Establecimiento", "Tiendas Mass – Porongoche"],
            ["📍", "Distrito", "Paucarpata, Arequipa"],
            ["🗺️", "Dirección", "Av. Los Incas 320, Paucarpata"],
            ["🚶", "Distancia", "~600 m · 8 min a pie"],
          ])}
          <button class="btn btn--outline btn--sm btn--block" data-action="map">📍 Ver ubicación en mapa</button>
        </div>

        <div class="card card--pad">
          <p class="card__label">Precios de referencia</p>
          ${each(PREMIUM_PRICES, p => `
            <div class="price-list__row">
              <p class="price-list__item">${p.item}</p>
              <div class="price-list__right">
                ${p.deal ? `<span class="pill pill--orange pill--strong">Oferta</span>` : ""}
                <span class="price-list__price price-list__price--deal">${p.price}</span>
              </div>
            </div>`)}
          ${ReferencePricesNote()}
        </div>

        <div class="stall-actions">
          ${SaveFavorite(ui.saved)}
          <button class="btn btn--muted btn--md btn--block">🗺️ Cómo llegar</button>
          <button class="btn btn--muted btn--md btn--block">🔍 Ver más ofertas de esta tienda</button>
        </div>
      </div>
    </section>`,

  actions: {
    back: () => navigate("results"),
    map: () => navigate("stallmap"),
    save: ui => { ui.saved = true; },
  },
});
