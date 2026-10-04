// Ficha de un establecimiento (versión estándar).

const STANDARD_PRICES = [
  { item: "Arroz 1kg",    price: "S/ 3.20", unit: "por kg" },
  { item: "Aceite 1lt",   price: "S/ 6.50", unit: "por lt" },
  { item: "Azúcar 1kg",   price: "S/ 2.80", unit: "por kg" },
  { item: "Papa Canchan", price: "S/ 1.90", unit: "por kg" },
  { item: "Huevos x12",   price: "S/ 7.50", unit: "por docena" },
];

defineScreen("stallstandard", {
  nav: true,
  ui: () => ({ saved: false }),

  render: ui => `
    <section class="screen">
      ${StatusBar()}
      ${StallHero({
        tone: "gray",
        emoji: "🏷️",
        name: "Tiendas Mass – Los Andes",
        badge: `<span class="stall-hero__badge">Tienda de descuento</span>`,
        address: "Av. Los Andes 210, Paucarpata",
      })}
      <div class="screen__body" data-scroll="stall-standard">
        <div class="card card--pad">
          <p class="card__label">Información del establecimiento</p>
          ${DetailList([
            ["store", "Establecimiento", "Tiendas Mass – Los Andes"],
            ["map-pin", "Distrito", "Paucarpata, Arequipa"],
            ["map", "Dirección", "Av. Los Andes 210, Paucarpata"],
            ["walk", "Distancia", "~1.1 km · 14 min a pie"],
            ["clock", "Horario", "7:00 – 22:00 (todos los días)"],
          ])}
          <button class="btn btn--outline btn--sm btn--block">${Icon("map-pin", { size: 16 })}Ver ubicación en mapa</button>
        </div>

        <div class="card card--pad">
          <p class="card__label">Precios de referencia</p>
          ${each(STANDARD_PRICES, p => `
            <div class="price-list__row">
              <div>
                <p class="price-list__item">${p.item}</p>
                <p class="price-list__unit">${p.unit}</p>
              </div>
              <span class="price-list__price">${p.price}</span>
            </div>`)}
          ${ReferencePricesNote()}
        </div>

        <div class="card card--pad stall-actions">
          ${SaveFavorite(ui.saved)}
          <button class="btn btn--outline btn--md btn--block">${Icon("navigation", { size: 16 })}Cómo llegar</button>
          <button class="btn btn--muted btn--md btn--block">${Icon("search", { size: 16 })}Ver alternativa más cercana</button>
        </div>
      </div>
    </section>`,

  actions: {
    back: () => navigate("results"),
    save: ui => { ui.saved = true; },
  },
});
