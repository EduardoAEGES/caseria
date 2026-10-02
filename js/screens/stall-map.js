// Mapa de establecimientos con ruta desde la ubicación del usuario.

const USER_POSITION = { x: 15, y: 78 };

const MAP_BLOCKS = [
  { x: 12, y: 12, w: 28, h: 34 }, { x: 47, y: 12, w: 43, h: 34 },
  { x: 12, y: 53, w: 28, h: 33 }, { x: 47, y: 53, w: 43, h: 33 },
];

function StallMapSvg(selected, zoom) {
  const { x: ux, y: uy } = USER_POSITION;
  const color = establishmentColor(selected);

  const otherPins = each(MAP_ESTABLISHMENTS.filter(e => e.id !== selected.id), e => {
    const discount = e.type === "Tienda de descuento";
    return `
      <g class="stall-map__pin" data-action="select" data-index="${e.id}">
        <circle cx="${e.x}" cy="${e.y}" r="3.2" fill="white" stroke="${discount ? "#22C55E" : "#0B63E5"}" stroke-width="0.5" opacity="0.85" />
        <text x="${e.x}" y="${e.y + 0.9}" text-anchor="middle" fill="${discount ? "#15803D" : "#1D4ED8"}" font-size="2" font-weight="bold">${e.id + 1}</text>
      </g>`;
  });

  return `
    <svg id="stall-map-svg" class="stall-map__svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style="transform: scale(${zoom})">
      <rect x="2" y="2" width="96" height="96" rx="3" fill="#E8EFF5" stroke="#CBD5E1" stroke-width="0.3" />
      <rect x="8" y="10" width="84" height="78" rx="2" fill="#F8FAFC" stroke="#0B63E5" stroke-width="0.4" stroke-dasharray="2 1" />
      <text x="50" y="8.5" text-anchor="middle" fill="#0B63E5" font-size="2.5" font-weight="bold">Paucarpata — Zona de comparación</text>

      <!-- Calles -->
      <rect x="8" y="48" width="84" height="3" rx="0.5" fill="#E2E8F0" />
      <text x="10" y="50.7" fill="#94A3B8" font-size="1.6">Av. Porongoche</text>
      <rect x="42" y="10" width="3" height="78" rx="0.5" fill="#E2E8F0" />
      <text x="43.5" y="72" fill="#94A3B8" font-size="1.6" transform="rotate(-90 43.5 72)">Av. Los Incas</text>

      <!-- Manzanas -->
      ${each(MAP_BLOCKS, b => `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="1" fill="#EEF4FF" stroke="#CBD5E1" stroke-width="0.2" />`)}

      <!-- Ruta -->
      <polyline points="${ux},${uy} ${ux},${selected.y} ${selected.x},${selected.y}" fill="none" stroke="#0B63E5" stroke-width="0.8" stroke-dasharray="1.5 1" stroke-linecap="round" />
      <circle cx="${selected.x}" cy="${selected.y}" r="1.2" fill="#0B63E5" opacity="0.3" />

      ${otherPins}

      <!-- Pin seleccionado -->
      <g>
        <circle cx="${selected.x}" cy="${selected.y + 0.5}" r="4.5" fill="black" opacity="0.12" />
        <circle cx="${selected.x}" cy="${selected.y}" r="4.5" fill="${color}" />
        <circle cx="${selected.x}" cy="${selected.y}" r="3.5" fill="white" />
        <text x="${selected.x}" y="${selected.y + 1}" text-anchor="middle" fill="${color}" font-size="2.5" font-weight="bold">${selected.id + 1}</text>
        <rect x="${selected.x - 10}" y="${selected.y - 10}" width="20" height="5.5" rx="1.2" fill="white" stroke="${selected.featured ? "#F59E0B" : "#0B63E5"}" stroke-width="0.4" />
        <text x="${selected.x}" y="${selected.y - 7.5}" text-anchor="middle" fill="#1E293B" font-size="1.8" font-weight="bold">${selected.name.split(" ").slice(0, 3).join(" ")}</text>
        <text x="${selected.x}" y="${selected.y - 5.5}" text-anchor="middle" fill="#22C55E" font-size="1.6" font-weight="bold">${selected.total.split("/")[0]}</text>
      </g>

      <!-- Ubicación del usuario -->
      <circle cx="${ux}" cy="${uy}" r="4" fill="#0B63E5" opacity="0.12" class="gps-pulse" />
      <circle cx="${ux}" cy="${uy}" r="3.2" fill="#0B63E5" opacity="0.15" class="gps-pulse-2" />
      <circle cx="${ux}" cy="${uy}" r="2" fill="#0B63E5" />
      <circle cx="${ux}" cy="${uy}" r="0.9" fill="white" />
      <text x="${ux + 3}" y="${uy - 2}" fill="#0B63E5" font-size="2" font-weight="bold">Tu ubicación</text>
    </svg>`;
}

function EstablishmentListView(selectedIndex) {
  return `
    <div class="screen__body screen__body--tight" data-scroll="stall-map-list">
      ${each(MAP_ESTABLISHMENTS, (e, i) => `
        <button class="est-card${i === selectedIndex ? " is-selected" : ""}" data-action="pick" data-index="${i}">
          <div class="est-card__head">
            <div class="est-card__title">
              <span class="est-card__number" style="background: ${establishmentColor(e)}">${i + 1}</span>
              <p class="est-card__name">${e.name}</p>
            </div>
            <span class="est-card__rating">⭐ <strong>${e.rating}</strong></span>
          </div>
          <p class="est-card__sub">${e.type} · ${e.address}</p>
          <div class="est-card__foot">
            <span class="est-card__total">${e.total}</span>
            <span class="est-card__distance">· ${e.distance}</span>
          </div>
        </button>`)}
    </div>`;
}

function EstablishmentMapView(ui) {
  const selected = MAP_ESTABLISHMENTS[ui.selected];
  const webButton = (className, label) =>
    `<button class="${className}" data-action="openWeb" data-name="${esc(selected.name)}">${label}</button>`;

  return `
    <div class="stall-map">
      ${StallMapSvg(selected, ui.zoom)}

      <div class="map-eta">
        <span>⏱️</span>
        <div>
          <p class="map-eta__time">${selected.distance}</p>
          <p class="map-eta__address">${selected.address}</p>
        </div>
      </div>

      <div class="map-zoom">
        <button class="map-zoom__btn map-zoom__btn--emoji" aria-label="Centrar">🎯</button>
        <button class="map-zoom__btn" data-action="zoomIn" aria-label="Acercar">+</button>
        <button class="map-zoom__btn map-zoom__btn--muted" data-action="zoomOut" aria-label="Alejar">−</button>
      </div>

      <div class="map-chips">
        <div class="map-chips__track hide-scrollbar" data-scroll="stall-map-chips">
          ${each(MAP_ESTABLISHMENTS, (e, i) => `
            <button class="map-chip${i === ui.selected ? " is-active" : ""}" data-action="select" data-index="${i}">
              <span>${e.featured ? "🏆" : e.type === "Tienda de descuento" ? "🏷️" : "🏢"}</span>${i + 1}
            </button>`)}
        </div>
      </div>

      <div id="map-sheet" class="map-sheet${ui.expanded ? " is-expanded" : ""}">
        <button class="map-sheet__handle" data-action="toggleSheet" aria-label="Expandir"><span></span></button>
        <div class="map-sheet__body">
          <div class="map-sheet__head">
            <div class="map-sheet__info">
              <div class="map-sheet__title-row">
                <span class="map-sheet__number" style="background: ${establishmentColor(selected)}">${selected.id + 1}</span>
                <p class="map-sheet__name">${selected.name}</p>
              </div>
              <p class="map-sheet__meta">${selected.type}</p>
              <p class="map-sheet__meta">Paucarpata, Arequipa</p>
            </div>
            <div class="map-sheet__rating">⭐ <strong>${selected.rating}</strong><span>/5</span></div>
          </div>

          <div class="map-sheet__status">
            <span>🟢</span>
            <p>${selected.total} — <strong>${selected.distance}</strong></p>
          </div>

          <!-- Ambos grupos de botones existen; el CSS muestra uno según .is-expanded -->
          <div class="map-sheet__actions map-sheet__actions--expanded slide-up">
            <button class="btn btn--primary btn--md btn--block">🗺️ Cómo llegar</button>
            <div class="map-sheet__row">
              <button class="btn btn--muted btn--sm btn--grow map-sheet__dark-text">💰 Ver precios</button>
              ${webButton("btn btn--outline btn--sm btn--grow", "🌐 Ir a Web")}
            </div>
          </div>
          <div class="map-sheet__actions map-sheet__actions--collapsed">
            <button class="btn btn--primary btn--sm btn--grow map-sheet__go">🗺️ Cómo llegar</button>
            <button class="map-sheet__icon-btn map-sheet__icon-btn--blue" aria-label="Ver precios">💰</button>
            ${webButton("map-sheet__icon-btn", "🌐")}
          </div>
        </div>
      </div>
    </div>`;
}

defineScreen("stallmap", {
  nav: true,
  ui: () => ({ selected: 0, expanded: false, zoom: 1, view: "map" }),

  render: ui => `
    <section class="screen screen--map">
      ${StatusBar()}
      <header class="map-header">
        <div class="map-header__row">
          ${BackButton()}
          <div class="topbar__text">
            <h1 class="map-header__title">Mapa de Establecimientos</h1>
            <p class="topbar__subtitle">Opciones de compra en Paucarpata</p>
          </div>
        </div>
        ${Segmented([{ value: "map", label: "🗺️ Vista Mapa" }, { value: "list", label: "📋 Vista Lista" }], ui.view, "setView")}
      </header>
      ${ui.view === "list" ? EstablishmentListView(ui.selected) : EstablishmentMapView(ui)}
    </section>`,

  actions: {
    back: () => navigate("stallpremium"),
    setView: (ui, el) => { ui.view = el.dataset.value; },
    pick: (ui, el) => {
      ui.selected = Number(el.dataset.index);
      ui.view = "map";
    },
    select: (ui, el) => { ui.selected = Number(el.dataset.index); },

    // Zoom y hoja se actualizan sin redibujar para conservar las transiciones CSS.
    zoomIn: ui => {
      ui.zoom = Math.min(ui.zoom + 0.2, 2);
      document.getElementById("stall-map-svg").style.transform = `scale(${ui.zoom})`;
      return false;
    },
    zoomOut: ui => {
      ui.zoom = Math.max(ui.zoom - 0.2, 0.7);
      document.getElementById("stall-map-svg").style.transform = `scale(${ui.zoom})`;
      return false;
    },
    toggleSheet: ui => {
      ui.expanded = !ui.expanded;
      document.getElementById("map-sheet").classList.toggle("is-expanded", ui.expanded);
      return false;
    },
  },
});
