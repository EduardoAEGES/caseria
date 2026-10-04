// Piezas compartidas por las fichas de establecimiento.

/** Cabecera con degradado, botón de volver y nombre de la tienda. */
function StallHero({ tone, emoji, name, badge, address }) {
  return `
    <div class="stall-hero stall-hero--${tone}">
      <div class="stall-hero__emoji">${emoji}</div>
      <button class="stall-hero__back" data-action="back" aria-label="Volver">${Icon("chevron-left", { size: 24, stroke: 2.4 })}</button>
      <div class="stall-hero__caption">
        <div class="stall-hero__title-row">
          <h1 class="stall-hero__name">${name}</h1>
          ${badge}
        </div>
        <p class="stall-hero__address">${address}</p>
      </div>
    </div>`;
}

/** Lista "Establecimiento / Distrito / Dirección...": rows = [[ícono, etiqueta, valor]]. */
function DetailList(rows) {
  return `
    <ul class="detail-list">
      ${each(rows, ([icon, label, value]) => `<li><span class="detail-list__icon">${Icon(icon, { size: 16 })}</span><span><strong>${label}:</strong> ${value}</span></li>`)}
    </ul>`;
}

/** Botón "Guardar como favorita" que cambia a un aviso de guardado. */
function SaveFavorite(saved) {
  return saved
    ? `<div class="saved-box"><span class="saved-box__icon">${Icon("check", { size: 18, stroke: 3 })}</span><p>Guardado en tus establecimientos favoritos</p></div>`
    : `<button class="btn btn--primary btn--md btn--block" data-action="save">${Icon("bookmark", { size: 18 })}Guardar como opción favorita</button>`;
}

/** Color del pin según el tipo de establecimiento del mapa. */
function establishmentColor(establishment) {
  if (establishment.featured) return "#F59E0B";
  return establishment.type === "Tienda de descuento" ? "#22C55E" : "#0B63E5";
}
