// Ubicación del usuario (GPS), distancias a las tiendas, rutas y costo del viaje.
//
// - La ubicación se pide con el GPS del celular (navigator.geolocation). Si el usuario no da
//   permiso o falla, se usa un punto aproximado de Paucarpata.
// - La ruta por calles se pide al servicio público de OSRM (OpenStreetMap). Sin internet o si
//   falla, se estima con la distancia en línea recta × 1.35.
// - Tiempos y pasajes son referenciales para Arequipa (ver TRAVEL abajo).

const DEFAULT_LOCATION = { lat: -16.4268, lng: -71.5063, approximate: true, label: "Paucarpata (aproximada)" };

// Supuestos de viaje en Arequipa (referenciales, editar aquí).
const TRAVEL = {
  walkKmh: 4.8,          // a pie
  carKmh: 22,            // velocidad media urbana en auto si no hay ruta de OSRM
  busFactor: 1.7,        // la combi tarda ~1.7 veces lo que un auto (paradas y desvíos)
  busWaitMin: 7,         // espera promedio en el paradero
  busFare: 1.5,          // pasaje urbano en combi/bus (S/)
  taxiBase: 4.5,         // taxi: bandera + S/ por km, mínimo S/ 6
  taxiPerKm: 1.6,
  taxiMin: 6,
  maxWalkKm: 2.5,        // más lejos de esto no se sugiere ir caminando
};

const geo = {
  location: { ...DEFAULT_LOCATION },
  status: "idle",        // "idle" | "asking" | "ok" | "denied" | "unavailable"
};

/** Pide la ubicación al GPS del celular. Siempre resuelve: si falla, queda la ubicación aproximada. */
function requestLocation() {
  if (!navigator.geolocation) {
    geo.status = "unavailable";
    return Promise.resolve(geo.location);
  }
  geo.status = "asking";
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        geo.location = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, approximate: false, label: "Tu ubicación" };
        geo.status = "ok";
        updateStoreDistances();
        resolve(geo.location);
      },
      error => {
        geo.status = error.code === error.PERMISSION_DENIED ? "denied" : "unavailable";
        resolve(geo.location);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

function haversineKm(a, b) {
  const rad = d => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function formatKm(km) {
  return km < 1 ? `${Math.round(km * 1000 / 10) * 10} m` : `${km.toFixed(1)} km`;
}

function formatMin(min) {
  const m = Math.max(1, Math.round(min));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** Distancia por calles estimada (sin OSRM) y su tiempo en auto. */
function estimateLeg(a, b) {
  const km = haversineKm(a, b) * 1.35;
  return { km, carMin: (km / TRAVEL.carKmh) * 60 };
}

/** Recalcula distance/distMin de cada tienda y su posición (x, y en %) para el mapa de resultados. */
function updateStoreDistances() {
  const here = geo.location;
  for (const store of STORES) {
    const { km } = estimateLeg(here, store);
    const trip = travelOptions([{ km, carMin: (km / TRAVEL.carKmh) * 60 }]);
    const best = trip.find(t => t.mode === "walk") || trip.find(t => t.mode === "bus");
    store.km = km;
    store.distMin = Math.round(best.min);
    store.distance = `${formatKm(km)} · ${formatMin(best.min)} ${best.mode === "walk" ? "a pie" : "en combi"}`;
  }
  // Posición relativa para el mapa esquemático de resultados (10–90 %).
  const points = [here, ...STORES];
  const lats = points.map(p => p.lat), lngs = points.map(p => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  for (const store of STORES) {
    store.x = 10 + ((store.lng - minLng) / (maxLng - minLng || 1)) * 80;
    store.y = 10 + ((maxLat - store.lat) / (maxLat - minLat || 1)) * 80;
  }
}

/**
 * Opciones de viaje para un recorrido de varios tramos (ida): [{ km, carMin }].
 * Devuelve [{ mode, label, icon, min, fare }] con el pasaje total de la ida.
 */
function travelOptions(legs) {
  const km = legs.reduce((sum, leg) => sum + leg.km, 0);
  const carMin = legs.reduce((sum, leg) => sum + leg.carMin, 0);
  const taxiFare = legs.reduce((sum, leg) => sum + Math.max(TRAVEL.taxiMin, TRAVEL.taxiBase + TRAVEL.taxiPerKm * leg.km), 0);
  const options = [
    { mode: "bus", label: "Combi / bus", icon: "bus", min: carMin * TRAVEL.busFactor + TRAVEL.busWaitMin * legs.length, fare: TRAVEL.busFare * legs.length, gmaps: "transit" },
    { mode: "taxi", label: "Taxi", icon: "car", min: carMin + 3 * legs.length, fare: Math.ceil(taxiFare * 2) / 2, gmaps: "driving" },
  ];
  if (legs.every(leg => leg.km <= TRAVEL.maxWalkKm)) {
    options.unshift({ mode: "walk", label: "A pie", icon: "walk", min: (km / TRAVEL.walkKmh) * 60, fare: 0, gmaps: "walking" });
  }
  return options;
}

/**
 * Ruta por calles que pasa por los puntos en orden, con OSRM (servicio público de OpenStreetMap).
 * Devuelve { legs: [{ km, carMin }], coords: [[lat, lng], ...], estimated }.
 */
async function fetchRoute(points) {
  const coords = points.map(p => `${p.lng},${p.lat}`).join(";");
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    const route = data.routes && data.routes[0];
    if (!route) throw new Error(data.code || "sin ruta");
    return {
      legs: route.legs.map(leg => ({ km: leg.distance / 1000, carMin: leg.duration / 60 })),
      coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      estimated: false,
    };
  } catch (error) {
    const legs = points.slice(1).map((p, i) => estimateLeg(points[i], p));
    return { legs, coords: points.map(p => [p.lat, p.lng]), estimated: true };
  }
}

/** Enlace para abrir la ruta en Google Maps (abre la app en el celular). */
function googleMapsUrl(origin, stops, travelmode = "transit") {
  const fmt = p => `${p.lat},${p.lng}`;
  // Google Maps no admite paradas intermedias en transporte público: con varias tiendas se abre en auto.
  const mode = stops.length > 1 && travelmode === "transit" ? "driving" : travelmode;
  const params = new URLSearchParams({ api: "1", origin: fmt(origin), destination: fmt(stops[stops.length - 1]), travelmode: mode });
  if (stops.length > 1) params.set("waypoints", stops.slice(0, -1).map(fmt).join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
}

updateStoreDistances();
