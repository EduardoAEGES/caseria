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
  { key: "Snacks",    emoji: "🍿" },
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
  { id: 28, name: "Galletas Casino 6pk",        unit: "paquete", cat: "Snacks",    emoji: "🍪" },
  { id: 29, name: "Chocolate Sublime 30g",      unit: "unidad",  cat: "Snacks",    emoji: "🍫" },
  { id: 30, name: "Papas Lays Clásicas 140g",   unit: "bolsa",   cat: "Snacks",    emoji: "🥔" },
  { id: 31, name: "Barra Cereal Bar x6",        unit: "caja",    cat: "Snacks",    emoji: "🌾" },
  { id: 32, name: "Frutos secos surtidos 150g", unit: "bolsa",   cat: "Snacks",    emoji: "🥜" },
  { id: 33, name: "Doritos Mega Queso 150g",    unit: "bolsa",   cat: "Snacks",    emoji: "🧀" },
];

// type: "super" | "wholesale" | "discount" | "convenience" · freshnessLevel: "ok" | "warn" | "bad"
// lat/lng: ubicación aproximada del local (editar aquí si se conoce la exacta).
// distance, distMin, x, y se calculan desde la ubicación del usuario (js/core/geo.js).
const STORES = [
  { id: "tottus",   name: "Tottus Porongoche",       type: "super",       badge: "Supermercado",   zone: "Porongoche",           address: "C.C. Mall Aventura Porongoche, Av. Porongoche",  lat: -16.4166, lng: -71.5089, updated: "Precio referencial", freshnessLevel: "warn", url: "https://www.tottus.com.pe/tottus-pe" },
  { id: "plazavea", name: "Plaza Vea",               type: "super",       badge: "Supermercado",   zone: "Cercano a Paucarpata", address: "Av. Avelino Cáceres, José Luis Bustamante y Rivero", lat: -16.4228, lng: -71.5203, updated: "Precio referencial", freshnessLevel: "warn", url: "https://www.plazavea.com.pe" },
  { id: "metro",    name: "Metro Lambramani",        type: "super",       badge: "Supermercado",   zone: "Lambramani",           address: "C.C. Lambramani, Av. Lambramani",                lat: -16.4139, lng: -71.5196, updated: "Precio referencial", freshnessLevel: "warn", url: "https://www.metro.pe" },
  { id: "makro",    name: "Makro Avelino Cáceres",   type: "wholesale",   badge: "Supermayorista", zone: "Avelino Cáceres",      address: "Av. Avelino Cáceres, José Luis Bustamante y Rivero", lat: -16.4192, lng: -71.5258, updated: "Precio referencial", freshnessLevel: "warn", url: "https://www.makro.pe" },
  { id: "mass",     name: "Tiendas Mass Paucarpata", type: "discount",    badge: "Descuento",      zone: "Paucarpata",           address: "Av. Kennedy, Paucarpata",                        lat: -16.4241, lng: -71.5021, updated: "Precio referencial", freshnessLevel: "warn", url: "https://www.tiendasmass.com.pe" },
  { id: "tambo",    name: "Tambo Paucarpata",        type: "convenience", badge: "Conveniencia",   zone: "Paucarpata",           address: "Av. Jesús, Paucarpata",                          lat: -16.4207, lng: -71.5108, updated: "Precio referencial", freshnessLevel: "warn", url: "https://www.tambo.pe" },
  { id: "oxxo",     name: "OXXO Paucarpata",         type: "convenience", badge: "Conveniencia",   zone: "Paucarpata",           address: "Av. Porongoche, Paucarpata",                     lat: -16.4222, lng: -71.5074, updated: "Precio referencial", freshnessLevel: "warn", url: "https://www.oxxo.pe" },
];

// Tabla de precios de ejemplo: productId → precio por tienda, en el orden de STORES.
// null = la tienda no tiene el producto. Las tiendas con precios extraídos (Tottus, Metro) la ignoran;
// Mass la usa solo para lo que no sale en su folleto. Plaza Vea, Makro, Tambo y OXXO: precios referenciales.
//          tottus plazavea metro  makro  mass  tambo  oxxo
const PRICE_ROWS = {
  1:  [ 4.20,  3.90,  null,  3.50,  3.50,  4.60,  4.80],
  2:  [10.90, 11.20,  null, 10.20, 10.50,  null,  null],
  3:  [17.50, 16.90,  null, 15.40, 15.90, 19.80, 20.80],
  4:  [ 2.40,  2.20,  null,  2.00,  2.30,  null,  null],
  5:  [ 3.20,  2.90,  null,  2.60,  3.10,  null,  null],
  6:  [ 4.60,  4.50,  null,  4.10,  4.10,  5.30,  5.49],
  7:  [ 4.10,  3.90,  null,  3.50,  3.70,  4.60,  4.80],
  8:  [ 2.20,  1.90,  null,  1.70,  null,  2.20,  2.30],
  9:  [ 2.60,  2.40,  null,  2.20,  2.50,  null,  null],
  10: [ 9.90,  9.50,  null,  8.60,  8.90, 11.10, 11.70],
  11: [ 3.60,  3.40,  null,  3.10,  3.20,  4.00,  4.20],
  12: [ 6.90,  6.50,  null,  5.90,  6.30,  7.60,  7.99],
  13: [ 4.50,  4.30,  null,  3.90,  3.90,  5.00,  5.30],
  14: [21.90, 20.90,  null, 18.99,  null,  null,  null],
  15: [32.90, 31.50,  null, 28.70,  null,  null,  null],
  16: [19.90, 18.90,  null, 17.20,  null,  null,  null],
  17: [ 2.80,  2.50,  null,  2.30,  2.60,  null,  null],
  18: [ 2.50,  2.30,  null,  2.10,  null,  null,  null],
  19: [ 6.90,  6.50,  null,  5.90,  6.20,  7.60,  null],
  20: [ 4.50,  4.20,  null,  3.80,  4.30,  null,  null],
  21: [ 9.90,  9.50,  null,  8.60,  null,  null,  null],
  22: [ 7.90,  7.50,  null,  6.80,  6.90,  8.80,  9.20],
  23: [18.90, 17.90,  null, 16.30,  null,  null,  null],
  24: [ 8.50,  8.20,  null,  7.49,  7.90,  9.60, 10.10],
  25: [ 3.90,  3.70,  null,  3.40,  3.30,  4.30,  4.60],
  26: [ 7.50,  7.20,  null,  6.60,  6.90,  8.40,  8.90],
  27: [ 4.90,  4.70,  null,  4.30,  4.40,  5.49,  5.80],
  28: [ 4.80,  4.90,  5.10,  4.20,  4.30,  5.50,  5.60],
  29: [ 2.50,  2.60,  2.70,  2.20,  2.30,  3.00,  3.20],
  30: [ 6.90,  7.20,  7.50,  6.20,  6.50,  7.90,  8.20],
  31: [ 5.90,  6.20,  6.40,  5.20,  5.40,  6.80,  7.00],
  32: [ 8.50,  8.90,  9.20,  7.50,  7.80,  9.90, 10.20],
  33: [ 6.80,  7.00,  7.30,  6.00,  6.30,  7.90,  8.10],
};

function findProduct(productId) {
  return PRODUCTS.find(product => product.id === productId);
}

// Precios reales extraídos por los scrapers (scraper/*.mjs → js/data/prices-<tienda>.js).
// Si una tienda tiene datos extraídos, se usan en lugar de PRICE_ROWS; un producto
// que el scraper no encontró queda como no disponible en esa tienda.
const SCRAPED = window.SCRAPED_PRICES || {};

function scrapedData(storeId) {
  return SCRAPED[storeId];
}

/** Precio extraído: el ítem, null si la tienda no lo tiene, o undefined si se usa la tabla de ejemplo. */
function scrapedItem(storeId, productId) {
  const data = scrapedData(storeId);
  if (!data) return undefined;
  // Los productos de Snacks (>= 28) usan la tabla comparativa de precios
  if (productId >= 28) return undefined;
  // Datos parciales (folletos): lo que no aparece sigue con la tabla de ejemplo.
  return data.items[productId] || (data.partial ? undefined : null);
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
  const data = scrapedData(store.id);
  if (!data) continue;
  const days = Math.floor((Date.now() - new Date(data.updatedAt)) / 86400000);
  store.updated = data.label || (days <= 0 ? "Precio web de hoy" : days === 1 ? "Precio web de ayer" : `Precio web hace ${days} días`);
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
