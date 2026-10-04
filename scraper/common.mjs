// Lógica compartida por los scrapers de tiendas (scraper/<tienda>.mjs):
// reglas de coincidencia de los productos de CaserIA, elección del mejor
// resultado y escritura de los archivos que usa la app.

import { writeFile, mkdir } from "node:fs/promises";

export const HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  "accept-language": "es-PE,es;q=0.9",
};
const DELAY_MS = 1500; // pausa entre consultas para no cargar los sitios

// productId de CaserIA → cómo encontrarlo en las tiendas.
// q: texto a buscar (qBy: { tienda: "texto" } lo cambia para una tienda)
// byStore: { tienda: { ...campos } } reemplaza campos de la regla para una tienda (p. ej. marcas propias de Mass).
// start: regex con la que debe EMPEZAR el nombre (sin tildes, minúsculas) · must: palabras obligatorias
// prefer: regex que suman puntos; la primera pesa más (tamaño antes que variedad) · exclude: descartan · kg: preferir venta por kilo.
export const QUERIES = {
  1:  { q: "arroz extra costeño",       start: "arroz (extra )?costeno|arroz costeno", exclude: ["harina", "galleta", "arborio", "parbolizado"], prefer: ["\\b(750\\s?g|1\\s?kg)\\b"],
        byStore: { mass: { start: "arroz", prefer: [] } } },
  2:  { q: "pollo entero",              start: "pollo entero", kg: true },
  3:  { q: "huevos 30 unidades",        qBy: { metro: "huevos pardos" }, start: "huevos?", prefer: ["\\b30\\s?(un|und|unid|unidades)?\\b"] },
  4:  { q: "papa canchan",              start: "papa canchan", kg: true },
  5:  { q: "tomate italiano",           start: "tomate", exclude: ["cherry", "seco", "pelado", "pulpa", "triturado"], kg: true },
  6:  { q: "avena 900 g",               start: "avena", prefer: ["\\b900\\s?g"] },
  7:  { q: "leche evaporada gloria",    start: "leche (evaporada )?(entera )?gloria|leche gloria", exclude: ["pack", "six", "x 6", "ninos", "deslactosada", "light"], prefer: ["\\b400\\s?g"] },
  8:  { q: "platano de seda",           start: "platano (de )?seda", kg: true },
  9:  { q: "cebolla roja",              start: "cebolla roja", kg: true },
  10: { q: "aceite vegetal primor",     start: "aceite (vegetal )?primor", exclude: ["1.8", "3 l"], prefer: ["\\b(900\\s?ml|1\\s?l)\\b", "clasico"] },
  11: { q: "spaghetti don vittorio",    start: "(fideo|spaghetti|tallarin|pasta)", must: ["don vittorio"], prefer: ["\\b500\\s?g", "spaghetti|tallarin"] ,
        byStore: { mass: { start: "(fideo|spaghetti|tallarin|pasta)", must: [], prefer: ["\\b500\\s?g"] } } },
  12: { q: "atun florida 170 g",        start: "(trozos de |solido de |filete de )?atun", must: ["florida"], exclude: ["pack", "x 3", "x3"], prefer: ["\\b170\\s?g"] ,
        byStore: { mass: { start: "(trozos de |solido de |filete de )?atun", must: [], prefer: [] } } },
  13: { q: "azucar rubia 1 kg",         start: "azucar rubia", prefer: ["\\b1\\s?kg\\b"] ,
        byStore: { mass: { prefer: [] } } },
  14: { q: "carne molida de res",       start: "carne molida", exclude: ["cerdo", "pavo", "pollo"] },
  15: { q: "bistec de res",             start: "bistec|bisteck", exclude: ["molido", "cerdo", "pollo", "apanado"] },
  16: { q: "chuleta de cerdo",          start: "chuleta", must: ["cerdo"] },
  17: { q: "zanahoria",                 start: "zanahoria", exclude: ["juliana", "rallada", "baby"], kg: true },
  18: { q: "lechuga",                   start: "lechuga" },
  19: { q: "manzana",                   start: "manzana", exclude: ["deshidratada", "trozos"], kg: true },
  20: { q: "naranja",                   start: "naranja", kg: true },
  21: { q: "palta fuerte",              start: "palta fuerte", kg: true },
  22: { q: "yogurt gloria 1 l",         start: "yogurt", must: ["gloria"], exclude: ["zero", "lacto", "griego", "batti"], prefer: ["\\b1\\s?(l|kg)\\b", "fresa|vainilla"] },
  23: { q: "queso fresco",              start: "queso fresco" },
  24: { q: "mantequilla 200 g",         start: "mantequilla", exclude: ["mani", "galleta"], prefer: ["\\b200\\s?g"] ,
        byStore: { mass: { prefer: [] } } },
  25: { q: "agua san luis 2.5 l",       start: "agua", must: ["san luis"], exclude: ["con gas", "sabor", "bidon", "pack", "x 6"], prefer: ["\\b(2[.,]5|3)\\s?l\\b"] },
  26: { q: "inca kola 1.5 l",           start: "gaseosa inca kola|inca kola", exclude: ["pack", "x 6", "zero", "sin azucar"], prefer: ["\\b1[.,]5\\s?l\\b"] },
  27: { q: "frugos 1 l",                start: "(bebida |jugo |nectar )?frugos", prefer: ["\\b1\\s?l\\b"] ,
        byStore: { mass: { prefer: ["\\b(1\\s?l|970\\s?ml)\\b"] } } },
  28: { q: "detergente bolivar 750 g",  start: "detergente (en polvo )?bolivar", prefer: ["\\b750\\s?g"] },
  29: { q: "lejia clorox",              start: "lejia", must: ["clorox"], exclude: ["gel"], prefer: ["\\b1\\s?l\\b", "original|tradicional"] },
  30: { q: "papel higienico 4 rollos",  start: "papel higienico", prefer: ["\\b4\\s?(un|und|rollos)\\b|x\\s?4\\b"] },
};

export const normalize = text => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
export const toNumber = value => Number.parseFloat(String(value).replace(/,/g, ""));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Elige el resultado que mejor coincide con la regla; empate → el más barato. */
export function pickBest(items, rule) {
  const start = rule.start ? new RegExp(`^(${rule.start})\\b`) : null;
  let best = null;
  for (const item of items) {
    const name = normalize(item.name).trim();
    const text = normalize(`${item.name} ${item.brand} ${item.presentation}`);
    if (start && !start.test(name)) continue;
    if (!(rule.must ?? []).every(word => text.includes(normalize(word)))) continue;
    if ((rule.exclude ?? []).some(word => text.includes(normalize(word)))) continue;
    const prefer = rule.prefer ?? [];
    let score = prefer.reduce((sum, re, i) => sum + (new RegExp(re, "i").test(text) ? (prefer.length - i) * 10 : 0), 0);
    if (rule.kg && /kg/i.test(item.unit)) score += 5;
    if (item.ownBrand) score += 2;
    if (!best || score > best.score || (score === best.score && item.price < best.item.price)) best = { item, score };
  }
  return best?.item ?? null;
}

/** Regla de un producto con los ajustes propios de la tienda (byStore). */
export function ruleFor(rule, store) {
  return { ...rule, ...(rule.byStore?.[store] ?? {}) };
}

/**
 * Escribe js/data/prices-<store>.js (lo que lee la app) y, si se pasa catalog,
 * data/<store>-catalogo.json con todos los productos vistos.
 */
export async function writeStoreFiles({ store, source, meta = {}, prices, catalog = null }) {
  const updatedAt = new Date().toISOString();
  const payload = { store, source, updatedAt, ...meta, items: prices };
  await writeFile(`js/data/prices-${store}.js`,
    `// Generado por scraper/${store}.mjs — no editar a mano.\n` +
    "window.SCRAPED_PRICES = window.SCRAPED_PRICES || {};\n" +
    `window.SCRAPED_PRICES[${JSON.stringify(store)}] = ${JSON.stringify(payload, null, 2)};\n`);
  if (catalog) {
    await mkdir("data", { recursive: true });
    await writeFile(`data/${store}-catalogo.json`, JSON.stringify({ store, updatedAt, ...meta, count: catalog.length, products: catalog }, null, 2) + "\n");
  }
}

/**
 * Busca cada producto de QUERIES con search(texto) → { items, meta } y escribe
 *   js/data/prices-<store>.js  (precios que usa la app) y data/<store>-catalogo.json (todo lo visto).
 * items: [{ productId, name, brand, presentation, unit, price, normalPrice, url, ownBrand? }]
 */
export async function runScraper({ store, source, search }) {
  const prices = {};
  const catalog = new Map();
  let meta = {};
  let failures = 0;

  for (const [id, rule] of Object.entries(QUERIES)) {
    const query = rule.qBy?.[store] ?? rule.q;
    try {
      const result = await search(query);
      meta = { ...result.meta, ...meta };
      for (const item of result.items) catalog.set(item.productId, { ...item, query });
      const best = pickBest(result.items, ruleFor(rule, store));
      if (best) {
        prices[id] = { price: best.price, normalPrice: best.normalPrice, name: best.name, presentation: best.presentation, url: best.url };
        console.log(`✓ ${id.padStart(2)} ${query.padEnd(26)} → S/ ${best.price.toFixed(2)}  ${best.name} (${best.presentation})`);
      } else {
        console.log(`· ${id.padStart(2)} ${query.padEnd(26)} → sin coincidencia en ${result.items.length} resultados`);
      }
    } catch (error) {
      failures++;
      console.log(`✗ ${id.padStart(2)} ${query.padEnd(26)} → ${error.message}`);
    }
    await sleep(DELAY_MS);
  }

  const total = Object.keys(QUERIES).length;
  const found = Object.keys(prices).length;
  console.log(`\n${found}/${total} productos con precio · ${catalog.size} productos en el catálogo · ${JSON.stringify(meta)}`);
  // Si casi todo falla es que el sitio cambió o bloqueó: no se pisan los datos buenos anteriores.
  if (found < total / 2) {
    console.error("Menos de la mitad de productos encontrados; no se actualizan los archivos.");
    process.exit(1);
  }

  const rows = [...catalog.values()].sort((a, b) => a.query.localeCompare(b.query) || a.price - b.price);
  await writeStoreFiles({ store, source, meta, prices, catalog: rows });
  if (failures) console.log(`${failures} consultas con error (ver arriba).`);
}
