// Cómo llegar: ruta desde la ubicación del usuario (GPS) hasta la tienda o tiendas elegidas,
// con tiempo y pasaje aproximados por modo (a pie, combi, taxi) y enlace a Google Maps.
//
// Recibe el destino en state.routeTarget = { storeIds: ["mass", ...], basketTotal, title }.
// El mapa (Leaflet) se crea en enter() y no se vuelve a dibujar: por eso las acciones
// devuelven false y solo actualizan el panel inferior con paintRoutePanel().

/** Ordena las tiendas por cercanía, empezando desde la ubicación del usuario. */
function orderStops(stores, from) {
  const left = [...stores];
  const ordered = [];
  let here = from;
  while (left.length) {
    left.sort((a, b) => haversineKm(here, a) - haversineKm(here, b));
    here = left.shift();
    ordered.push(here);
  }
  return ordered;
}

/** Calcula ruta, opciones de viaje y costos para el estado actual de ui. */
async function computeRoute(ui) {
  const target = state.routeTarget;
  const stores = target.storeIds.map(id => STORES.find(s => s.id === id)).filter(Boolean);
  ui.stops = orderStops(stores, geo.location);
  ui.route = await fetchRoute([geo.location, ...ui.stops]);
  const back = estimateLeg(ui.stops[ui.stops.length - 1], geo.location);
  ui.options = travelOptions(ui.route.legs).map(option => {
    const ret = travelOptions([back]).find(o => o.mode === option.mode) || travelOptions([back]).find(o => o.mode === "bus");
    return { ...option, returnFare: ret.fare };
  });
  if (!ui.options.some(o => o.mode === ui.mode)) ui.mode = ui.options.some(o => o.mode === "walk") ? "walk" : "bus";
}

function RoutePanel(ui) {
  const target = state.routeTarget;
  const located = geo.status === "ok";
  if (!ui.options) {
    return `<div class="route-panel__loading">${Icon("navigation", { size: 18 })} Calculando la ruta…</div>`;
  }
  const option = ui.options.find(o => o.mode === ui.mode);
  const roundTrip = option.fare + option.returnFare;
  const totalKm = ui.route.legs.reduce((sum, leg) => sum + leg.km, 0);

  return `
    <div class="route-origin${located ? " is-gps" : ""}">
      ${Icon(located ? "crosshair" : "map-pin", { size: 16 })}
      <p>${located ? "Desde tu ubicación actual (GPS)" : geo.status === "asking" ? "Buscando tu ubicación…" : "Desde Paucarpata (ubicación aproximada)"}</p>
      ${located ? "" : `<button class="link-btn" data-action="locate">Usar mi GPS</button>`}
    </div>

    <ol class="route-stops">
      ${each(ui.stops, (store, i) => `
        <li class="route-stop">
          <span class="route-stop__num">${i + 1}</span>
          <div class="route-stop__text">
            <p class="route-stop__name">${store.name}</p>
            <p class="route-stop__meta">${store.address} · ${formatKm(ui.route.legs[i].km)}</p>
          </div>
        </li>`)}
    </ol>

    <div class="route-modes">
      ${each(ui.options, o => `
        <button class="route-mode${o.mode === ui.mode ? " is-active" : ""}" data-action="setMode" data-mode="${o.mode}">
          ${Icon(o.icon, { size: 22 })}
          <span class="route-mode__label">${o.label}</span>
          <span class="route-mode__time">${formatMin(o.min)}</span>
          <span class="route-mode__fare">${o.fare ? money(o.fare) : "Gratis"}</span>
        </button>`)}
    </div>

    <div class="route-total">
      <div class="route-total__row"><span>Canasta</span><strong>${money(target.basketTotal)}</strong></div>
      <div class="route-total__row"><span>${option.mode === "walk" ? "Traslado a pie" : `Pasaje ${option.label.toLowerCase()} (ida y vuelta)`}</span><strong>${roundTrip ? money(roundTrip) : "S/ 0.00"}</strong></div>
      <div class="route-total__row route-total__row--sum"><span>Total</span><strong>${money(target.basketTotal + roundTrip)}</strong></div>
      <p class="route-total__hint">${formatKm(totalKm)} de ida · ${formatMin(option.min)} aprox.${ui.stops.length > 1 ? ` · ${ui.stops.length} tiendas` : ""}</p>
    </div>

    <a class="btn btn--primary btn--lg btn--block" href="${googleMapsUrl(geo.location, ui.stops, option.gmaps)}" target="_blank" rel="noopener">
      ${Icon("navigation", { size: 18 })}Abrir ruta en Google Maps
    </a>

    <p class="route-note">${Icon("info", { size: 14 })} Tiempos y pasajes referenciales para Arequipa (combi S/ ${TRAVEL.busFare.toFixed(2)} por tramo; taxi desde S/ ${TRAVEL.taxiMin}).${ui.route.estimated ? " Distancia estimada en línea recta: no se pudo consultar el servicio de rutas." : ""}</p>`;
}

function paintRoutePanel(ui) {
  const panel = document.getElementById("route-panel");
  if (panel) panel.innerHTML = RoutePanel(ui);
}

/** Dibuja (o redibuja) ubicación, tiendas y recorrido en el mapa. */
function paintRouteMap(ui) {
  if (!ui.map || !ui.route) return;
  ui.layer.clearLayers();
  const user = L.circleMarker([geo.location.lat, geo.location.lng], { radius: 8, color: "#FFFFFF", weight: 3, fillColor: "#0B63E5", fillOpacity: 1 })
    .bindTooltip(geo.status === "ok" ? "Estás aquí" : "Paucarpata (aprox.)");
  ui.layer.addLayer(user);
  ui.stops.forEach((store, i) => {
    const icon = L.divIcon({ className: "route-pin", html: `<span>${i + 1}</span>`, iconSize: [30, 30], iconAnchor: [15, 30] });
    ui.layer.addLayer(L.marker([store.lat, store.lng], { icon }).bindTooltip(store.name));
  });
  const line = L.polyline(ui.route.coords, { color: "#0B63E5", weight: 5, opacity: 0.85, dashArray: ui.route.estimated ? "8 8" : null });
  ui.layer.addLayer(line);
  ui.map.fitBounds(line.getBounds(), { padding: [36, 36] });
}

defineScreen("route", {
  nav: true,
  ui: () => ({ mode: null, stops: null, route: null, options: null, map: null, layer: null }),

  render() {
    const target = state.routeTarget;
    const names = target.storeIds.map(id => (STORES.find(s => s.id === id) || {}).name).filter(Boolean);
    return `
      <section class="screen">
        ${StatusBar()}
        <header class="topbar">
          ${BackButton("back")}
          <div class="topbar__text">
            <h1 class="topbar__title">Cómo llegar</h1>
            <p class="topbar__subtitle">${esc(names.join(" + "))}</p>
          </div>
        </header>
        <div class="route-map" id="route-map">
          ${window.L ? "" : `<div class="route-map__fallback">${Icon("map", { size: 28 })}<p>El mapa necesita conexión a internet. Igual puedes abrir la ruta en Google Maps.</p></div>`}
        </div>
        <div class="screen__body route-panel" id="route-panel" data-scroll="route-panel"></div>
      </section>`;
  },

  enter(ui) {
    let alive = true;
    paintRoutePanel(ui);
    if (window.L) {
      ui.map = L.map("route-map", { zoomControl: false, attributionControl: true }).setView([geo.location.lat, geo.location.lng], 14);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(ui.map);
      ui.layer = L.layerGroup().addTo(ui.map);
    }
    const refresh = async () => {
      await computeRoute(ui);
      if (!alive) return;
      paintRouteMap(ui);
      paintRoutePanel(ui);
    };
    // Primero con la ubicación conocida; si aún no se pidió el GPS, se pide y se recalcula.
    refresh().then(() => {
      if (alive && geo.status === "idle") requestLocation().then(() => alive && refresh());
    });
    return () => {
      alive = false;
      if (ui.map) ui.map.remove();
    };
  },

  actions: {
    back: () => { navigate("results"); return false; },
    setMode: (ui, el) => {
      ui.mode = el.dataset.mode;
      paintRoutePanel(ui);
      return false;
    },
    locate: ui => {
      const located = requestLocation();
      paintRoutePanel(ui);
      located.then(async () => {
        if (state.screen !== "route") return;
        await computeRoute(ui);
        paintRouteMap(ui);
        paintRoutePanel(ui);
      });
      return false;
    },
  },
});
