// Base de datos local de productos, tiendas y precios.
// Cada tabla imita una tabla de base de datos (productos, tiendas, precios),
// así se puede reemplazar por una API o Supabase sin tocar las pantallas:
// solo hay que reimplementar `searchBestOffers` contra la fuente real.

const CATEGORIES = [
  { key: "Carnes",    emoji: "🥩" },
  { key: "Verduras",  emoji: "🥬" },
  { key: "Frutas",    emoji: "🍎" },
  { key: "Abarrotes", emoji: "🍚" },
  { key: "Lácteos",   emoji: "🥛" },
  { key: "Bebidas",   emoji: "🧃" },
  { key: "Limpieza",  emoji: "🧼" },
];

const PRODUCTS = [
  { id: 1,  name: "Arroz Costeño 1kg",        unit: "bolsa",   cat: "Abarrotes", emoji: "🍚" },
  { id: 2,  name: "Pollo entero",             unit: "kg",      cat: "Carnes",    emoji: "🍗" },
  { id: 3,  name: "Huevos x30",               unit: "plancha", cat: "Lácteos",   emoji: "🥚" },
  { id: 4,  name: "Papa Canchán",             unit: "kg",      cat: "Verduras",  emoji: "🥔" },
  { id: 5,  name: "Tomate",                   unit: "kg",      cat: "Verduras",  emoji: "🍅" },
  { id: 6,  name: "Avena 900g",               unit: "bolsa",   cat: "Abarrotes", emoji: "🌾" },
  { id: 7,  name: "Leche Gloria 400g",        unit: "lata",    cat: "Lácteos",   emoji: "🥛" },
  { id: 8,  name: "Plátano de seda",          unit: "kg",      cat: "Frutas",    emoji: "🍌" },
  { id: 9,  name: "Cebolla roja",             unit: "kg",      cat: "Verduras",  emoji: "🧅" },
  { id: 10, name: "Aceite Primor 1L",         unit: "botella", cat: "Abarrotes", emoji: "🫙" },
  { id: 11, name: "Fideos Don Vittorio 500g", unit: "paquete", cat: "Abarrotes", emoji: "🍝" },
  { id: 12, name: "Atún Florida 170g",        unit: "lata",    cat: "Abarrotes", emoji: "🥫" },
  { id: 13, name: "Azúcar rubia 1kg",         unit: "bolsa",   cat: "Abarrotes", emoji: "🍬" },
  { id: 14, name: "Carne molida",             unit: "kg",      cat: "Carnes",    emoji: "🥩" },
  { id: 15, name: "Bistec de res",            unit: "kg",      cat: "Carnes",    emoji: "🥩" },
  { id: 16, name: "Chuleta de cerdo",         unit: "kg",      cat: "Carnes",    emoji: "🍖" },
  { id: 17, name: "Zanahoria",                unit: "kg",      cat: "Verduras",  emoji: "🥕" },
  { id: 18, name: "Lechuga",                  unit: "unidad",  cat: "Verduras",  emoji: "🥬" },
  { id: 19, name: "Manzana",                  unit: "kg",      cat: "Frutas",    emoji: "🍎" },
  { id: 20, name: "Naranja",                  unit: "kg",      cat: "Frutas",    emoji: "🍊" },
  { id: 21, name: "Palta fuerte",             unit: "kg",      cat: "Frutas",    emoji: "🥑" },
  { id: 22, name: "Yogurt Gloria 1L",         unit: "botella", cat: "Lácteos",   emoji: "🥛" },
  { id: 23, name: "Queso fresco",             unit: "kg",      cat: "Lácteos",   emoji: "🧀" },
  { id: 24, name: "Mantequilla 200g",         unit: "barra",   cat: "Lácteos",   emoji: "🧈" },
  { id: 25, name: "Agua San Luis 2.5L",       unit: "botella", cat: "Bebidas",   emoji: "💧" },
  { id: 26, name: "Gaseosa Inca Kola 1.5L",   unit: "botella", cat: "Bebidas",   emoji: "🥤" },
  { id: 27, name: "Jugo Frugos 1L",           unit: "caja",    cat: "Bebidas",   emoji: "🧃" },
  { id: 28, name: "Detergente Bolívar 750g",  unit: "bolsa",   cat: "Limpieza",  emoji: "🧺" },
  { id: 29, name: "Lejía Clorox 1L",          unit: "botella", cat: "Limpieza",  emoji: "🧴" },
  { id: 30, name: "Papel higiénico x4",       unit: "paquete", cat: "Limpieza",  emoji: "🧻" },
];

// type: "super" | "discount" · freshnessLevel: "ok" | "warn" | "bad"
// x, y: posición (en %) del pin en el mapa de resultados.
const STORES = [
  { id: "tottus",   name: "Tottus Porongoche",         type: "super",    badge: "Super",     address: "C.C. Real Plaza Porongoche, Paucarpata", district: "Paucarpata", distance: "1.8 km · 22 min", distMin: 22, updated: "Actualizado ayer", freshnessLevel: "warn", x: 70, y: 45 },
  { id: "plazavea", name: "Plaza Vea",                 type: "super",    badge: "Super",     address: "C.C. Porongoche, Paucarpata",            district: "Paucarpata", distance: "1.4 km · 17 min", distMin: 17, updated: "Actualizado ayer", freshnessLevel: "warn", x: 45, y: 55 },
  { id: "franco",   name: "Franco Supermercados",      type: "super",    badge: "Super",     address: "Av. Porongoche 450, Paucarpata",         district: "Paucarpata", distance: "900 m · 12 min",  distMin: 12, updated: "Actualizado hoy",  freshnessLevel: "ok",   x: 62, y: 28 },
  { id: "massporo", name: "Tiendas Mass – Porongoche", type: "discount", badge: "Descuento", address: "Av. Los Incas 320, Paucarpata",          district: "Paucarpata", distance: "600 m · 8 min",   distMin: 8,  updated: "Actualizado hoy",  freshnessLevel: "ok",   x: 28, y: 38 },
  { id: "metro",    name: "Metro",                     type: "super",    badge: "Super",     address: "metro.pe · precio web para Paucarpata (04008)", district: "Arequipa", distance: "Compra online", distMin: 40, updated: "Sin datos", freshnessLevel: "bad", x: 84, y: 72 },
  { id: "massande", name: "Tiendas Mass – Los Andes",  type: "discount", badge: "Descuento", address: "Av. Los Andes 210, Paucarpata",          district: "Paucarpata", distance: "1.1 km · 14 min", distMin: 14, updated: "Actualizado hoy",  freshnessLevel: "ok",   x: 20, y: 60 },
];

// Tabla de precios de ejemplo: productId → precio por tienda, en el orden de STORES.
// null = la tienda no tiene el producto (o no hay ejemplo). Se ignora para las tiendas con precios extraídos.
//          tottus plazavea franco massporo massande
const PRICE_ROWS = {
  1:  [ 4.20,  3.90,  3.80,  3.50,  null,  3.50],
  2:  [10.90, 11.20,  9.90, 10.50,  null,  null],
  3:  [17.50, 16.90, 16.50, 15.90,  null, 15.90],
  4:  [ 2.40,  2.20,  1.90,  2.30,  null,  2.30],
  5:  [ 3.20,  2.90,  2.80,  3.10,  null,  null],
  6:  [ 4.60,  4.50,  4.30,  4.10,  null,  4.10],
  7:  [ 4.10,  3.90,  4.00,  3.70,  null,  3.70],
  8:  [ 2.20,  1.90,  1.70,  null,  null,  null],
  9:  [ 2.60,  2.40,  2.10,  2.50,  null,  2.50],
  10: [ 9.90,  9.50,  9.80,  8.90,  null,  8.90],
  11: [ 3.60,  3.40,  3.50,  3.20,  null,  3.20],
  12: [ 6.90,  6.50,  6.70,  6.30,  null,  6.30],
  13: [ 4.50,  4.30,  4.20,  3.90,  null,  3.90],
  14: [21.90, 20.90, 19.50,  null,  null,  null],
  15: [32.90, 31.50, 29.90,  null,  null,  null],
  16: [19.90, 18.90, 18.50,  null,  null,  null],
  17: [ 2.80,  2.50,  2.20,  2.60,  null,  null],
  18: [ 2.50,  2.30,  1.90,  null,  null,  null],
  19: [ 6.90,  6.50,  5.90,  6.20,  null,  6.20],
  20: [ 4.50,  4.20,  3.80,  4.30,  null,  null],
  21: [ 9.90,  9.50,  8.50,  null,  null,  null],
  22: [ 7.90,  7.50,  7.60,  6.90,  null,  6.90],
  23: [18.90, 17.90, 16.50,  null,  null,  null],
  24: [ 8.50,  8.20,  8.40,  7.90,  null,  7.90],
  25: [ 3.90,  3.70,  3.80,  3.30,  null,  3.30],
  26: [ 7.50,  7.20,  7.40,  6.90,  null,  6.90],
  27: [ 4.90,  4.70,  4.80,  4.40,  null,  4.40],
  28: [ 9.90,  9.50,  9.70,  8.90,  null,  8.90],
  29: [ 4.50,  4.30,  4.40,  3.90,  null,  3.90],
  30: [ 6.90,  6.50,  6.70,  5.90,  null,  5.90],
};

function findProduct(productId) {
  return PRODUCTS.find(product => product.id === productId);
}

// Precios reales extraídos por los scrapers (scraper/*.mjs → js/data/prices-<tienda>.js).
// Si una tienda tiene datos extraídos, se usan en lugar de PRICE_ROWS; un producto
// que el scraper no encontró queda como no disponible en esa tienda.
const SCRAPED = window.SCRAPED_PRICES || {};

function scrapedItem(storeId, productId) {
  return SCRAPED[storeId] ? SCRAPED[storeId].items[productId] || null : undefined;
}

function getPrice(storeId, productId) {
  const scraped = scrapedItem(storeId, productId);
  if (scraped !== undefined) return scraped ? scraped.price : null;
  const index = STORES.findIndex(store => store.id === storeId);
  const row = PRICE_ROWS[productId];
  return row ? row[index] ?? null : null;
}

/** Precio de referencia: el más bajo disponible entre todas las tiendas. */
function referencePrice(productId) {
  const prices = STORES.map(store => getPrice(store.id, productId)).filter(price => price !== null);
  return prices.length ? Math.min(...prices) : 0;
}

// Fecha de actualización real para las tiendas con precios extraídos.
for (const store of STORES) {
  const data = SCRAPED[store.id];
  if (!data) continue;
  const days = Math.floor((Date.now() - new Date(data.updatedAt)) / 86400000);
  store.updated = days <= 0 ? "Precio web de hoy" : days === 1 ? "Precio web de ayer" : `Precio web hace ${days} días`;
  store.freshnessLevel = days <= 1 ? "ok" : days <= 7 ? "warn" : "bad";
  store.scraped = true;
}

/**
 * Busca en la tabla de precios de cada tienda y arma la mejor oferta para la canasta.
 * cart: [{ productId, qty }]
 * Devuelve:
 *   offers     → oferta por tienda: primero las que tienen más productos, luego por precio total
 *   bestSingle → tienda más barata que tiene toda la canasta (o null)
 *   combined   → comprando cada producto donde está más barato, agrupado por tienda
 */
function searchBestOffers(cart) {
  const items = cart
    .map(({ productId, qty }) => ({ product: findProduct(productId), qty }))
    .filter(item => item.product !== undefined);

  const offers = STORES.map(store => {
    const lines = [];
    const missing = [];
    for (const { product, qty } of items) {
      const unitPrice = getPrice(store.id, product.id);
      if (unitPrice === null) missing.push(product);
      else lines.push({ product, qty, unitPrice, subtotal: unitPrice * qty });
    }
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
    return { store, total, lines, missing, complete: missing.length === 0 };
  }).sort((a, b) => a.missing.length - b.missing.length || a.total - b.total);

  const bestSingle = offers.find(offer => offer.complete) || null;

  const stopsByStore = new Map();
  const combinedMissing = [];
  for (const { product, qty } of items) {
    let best = null;
    for (const store of STORES) {
      const unitPrice = getPrice(store.id, product.id);
      // Si empatan en precio, se prefiere la tienda más cercana.
      if (unitPrice !== null && (!best || unitPrice < best.unitPrice || (unitPrice === best.unitPrice && store.distMin < best.store.distMin))) {
        best = { store, unitPrice };
      }
    }
    if (!best) { combinedMissing.push(product); continue; }
    const stop = stopsByStore.get(best.store.id) || { store: best.store, lines: [], subtotal: 0 };
    const subtotal = best.unitPrice * qty;
    stop.lines.push({ product, qty, unitPrice: best.unitPrice, subtotal });
    stop.subtotal += subtotal;
    stopsByStore.set(best.store.id, stop);
  }
  const stops = [...stopsByStore.values()].sort((a, b) => b.subtotal - a.subtotal);
  const combined = { total: stops.reduce((sum, stop) => sum + stop.subtotal, 0), stops, missing: combinedMissing };

  return { offers, bestSingle, combined };
}
