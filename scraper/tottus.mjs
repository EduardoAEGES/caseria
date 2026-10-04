// Scraper de precios de Tottus (tottus.com.pe).
//
// Por cada producto del catálogo de CaserIA busca en /tottus-pe/buscar?Ntt=…,
// lee los resultados del JSON __NEXT_DATA__ que trae la página y elige el que
// mejor coincide. Genera:
//   - js/data/prices-tottus.js   → precios que usa la app (script global, funciona en file://)
//   - data/tottus-catalogo.json  → todos los resultados vistos: producto, marca, presentación, precio
//
// Uso: node scraper/tottus.mjs            (Node 18+, sin dependencias)
//      node scraper/tottus.mjs --fixture f.html   (prueba el parseo con un HTML guardado)

import { readFile, writeFile, mkdir } from "node:fs/promises";

const BASE = "https://www.tottus.com.pe";
const HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  "accept-language": "es-PE,es;q=0.9",
};
const DELAY_MS = 1500; // pausa entre consultas para no cargar el sitio

// productId de CaserIA → cómo encontrarlo en Tottus.
// start: regex con la que debe EMPEZAR el nombre (sin tildes, minúsculas) · must: palabras obligatorias
// prefer: regex que suman puntos; la primera pesa más (tamaño antes que variedad) · exclude: descartan · kg: preferir venta por kilo.
export const QUERIES = {
  1:  { q: "arroz extra costeño",       start: "arroz (extra )?costeno|arroz costeno", exclude: ["harina", "galleta", "arborio", "parbolizado"], prefer: ["\\b(750\\s?g|1\\s?kg)\\b"] },
  2:  { q: "pollo entero",              start: "pollo entero", kg: true },
  3:  { q: "huevos 30 unidades",        start: "huevos?", prefer: ["\\b30\\b"] },
  4:  { q: "papa canchan",              start: "papa canchan", kg: true },
  5:  { q: "tomate italiano",           start: "tomate", exclude: ["cherry", "seco", "pelado", "pulpa", "triturado"], kg: true },
  6:  { q: "avena 900 g",               start: "avena", prefer: ["\\b900\\s?g"] },
  7:  { q: "leche evaporada gloria",    start: "leche (evaporada )?(entera )?gloria|leche gloria", exclude: ["pack", "six", "x 6", "ninos", "deslactosada", "light"], prefer: ["\\b400\\s?g"] },
  8:  { q: "platano de seda",           start: "platano (de )?seda", kg: true },
  9:  { q: "cebolla roja",              start: "cebolla roja", kg: true },
  10: { q: "aceite vegetal primor",     start: "aceite (vegetal )?primor", exclude: ["1.8", "3 l"], prefer: ["\\b(900\\s?ml|1\\s?l)\\b", "clasico"] },
  11: { q: "spaghetti don vittorio",    start: "(fideo|spaghetti|tallarin|pasta)", must: ["don vittorio"], prefer: ["\\b500\\s?g", "spaghetti|tallarin"] },
  12: { q: "atun florida 170 g",        start: "(trozos de |solido de |filete de )?atun", must: ["florida"], exclude: ["pack", "x 3", "x3"], prefer: ["\\b170\\s?g"] },
  13: { q: "azucar rubia 1 kg",         start: "azucar rubia", prefer: ["\\b1\\s?kg\\b"] },
  14: { q: "carne molida de res",       start: "carne molida", exclude: ["cerdo", "pavo", "pollo"] },
  15: { q: "bistec de res",             start: "bistec|bisteck", exclude: ["molido", "cerdo", "pollo"] },
  16: { q: "chuleta de cerdo",          start: "chuleta", must: ["cerdo"] },
  17: { q: "zanahoria",                 start: "zanahoria", exclude: ["juliana", "rallada", "baby"], kg: true },
  18: { q: "lechuga",                   start: "lechuga" },
  19: { q: "manzana",                   start: "manzana", exclude: ["deshidratada", "trozos"], kg: true },
  20: { q: "naranja",                   start: "naranja", kg: true },
  21: { q: "palta fuerte",              start: "palta fuerte", kg: true },
  22: { q: "yogurt gloria 1 l",         start: "yogurt (bebible )?gloria", exclude: ["zero", "lacto", "griego", "battishake"], prefer: ["\\b1\\s?(l|kg)\\b", "fresa|vainilla"] },
  23: { q: "queso fresco",              start: "queso fresco" },
  24: { q: "mantequilla 200 g",         start: "mantequilla", exclude: ["mani", "galleta"], prefer: ["\\b200\\s?g"] },
  25: { q: "agua san luis 2.5 l",       start: "agua (mineral )?san luis", exclude: ["con gas", "pack", "x 6"], prefer: ["\\b2[.,]5\\s?l\\b"] },
  26: { q: "inca kola 1.5 l",           start: "gaseosa inca kola|inca kola", exclude: ["pack", "x 6", "zero", "sin azucar"], prefer: ["\\b1[.,]5\\s?l\\b"] },
  27: { q: "frugos 1 l",                start: "(bebida |jugo |nectar )?frugos", prefer: ["\\b1\\s?l\\b"] },
  28: { q: "detergente bolivar 750 g",  start: "detergente (en polvo )?bolivar", prefer: ["\\b750\\s?g"] },
  29: { q: "lejia clorox",              start: "lejia", must: ["clorox"], exclude: ["gel"], prefer: ["\\b1\\s?l\\b", "original|tradicional"] },
  30: { q: "papel higienico 4 rollos",  start: "papel higienico", prefer: ["\\b4\\s?(un|und|rollos)\\b|x\\s?4\\b"] },
};

const normalize = text => text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const toNumber = value => Number.parseFloat(String(value).replace(/,/g, ""));

/** Extrae los productos del JSON __NEXT_DATA__ de una página de búsqueda o categoría. */
export function parseResults(html) {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("La página no trae __NEXT_DATA__ (¿cambió el sitio?)");
  const pageProps = JSON.parse(match[1]).props?.pageProps ?? {};
  const results = pageProps.results ?? [];
  return {
    locationId: pageProps.currentLocationId ?? null,
    items: results.map(r => {
      const prices = (r.prices ?? []).map(p => ({ type: p.type, crossed: !!p.crossed, value: toNumber(p.price?.[0]) }));
      const current = prices.filter(p => !p.crossed && p.type !== "cmrPrice" && Number.isFinite(p.value));
      return {
        productId: r.productId,
        name: r.displayName,
        brand: r.brand ?? "",
        presentation: r.measurements?.format ?? "",
        unit: r.measurements?.unit ?? "",
        price: current.length ? Math.min(...current.map(p => p.value)) : null,
        normalPrice: prices.find(p => p.crossed)?.value ?? null,
        cmrPrice: prices.find(p => p.type === "cmrPrice")?.value ?? null,
        seller: r.sellerName ?? "",
        url: r.url,
        image: r.mediaUrls?.[0] ?? null,
      };
    }).filter(item => item.price !== null),
  };
}

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
    if (/tottus/i.test(item.seller)) score += 2;
    if (!best || score > best.score || (score === best.score && item.price < best.item.price)) best = { item, score };
  }
  return best?.item ?? null;
}

async function search(query) {
  const url = `${BASE}/tottus-pe/buscar?Ntt=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return parseResults(await res.text());
}

async function main() {
  const fixtureIndex = process.argv.indexOf("--fixture");
  if (fixtureIndex !== -1) {
    const { items } = parseResults(await readFile(process.argv[fixtureIndex + 1], "utf8"));
    console.table(items.slice(0, 10).map(({ name, presentation, price, normalPrice }) => ({ name, presentation, price, normalPrice })));
    return;
  }

  const prices = {};
  const catalog = new Map();
  let locationId = null;
  let failures = 0;

  for (const [id, rule] of Object.entries(QUERIES)) {
    try {
      const result = await search(rule.q);
      locationId ??= result.locationId;
      for (const item of result.items) catalog.set(item.productId, { ...item, query: rule.q });
      const best = pickBest(result.items, rule);
      if (best) {
        prices[id] = { price: best.price, normalPrice: best.normalPrice, name: best.name, presentation: best.presentation, url: best.url };
        console.log(`✓ ${id.padStart(2)} ${rule.q.padEnd(26)} → S/ ${best.price.toFixed(2)}  ${best.name} (${best.presentation})`);
      } else {
        console.log(`· ${id.padStart(2)} ${rule.q.padEnd(26)} → sin coincidencia en ${result.items.length} resultados`);
      }
    } catch (error) {
      failures++;
      console.log(`✗ ${id.padStart(2)} ${rule.q.padEnd(26)} → ${error.message}`);
    }
    await sleep(DELAY_MS);
  }

  const found = Object.keys(prices).length;
  console.log(`\n${found}/${Object.keys(QUERIES).length} productos con precio · ${catalog.size} productos en el catálogo · ubicación ${locationId ?? "-"}`);
  // Si casi todo falla es que el sitio cambió o bloqueó: no se pisan los datos buenos anteriores.
  if (found < Object.keys(QUERIES).length / 2) {
    console.error("Menos de la mitad de productos encontrados; no se actualizan los archivos.");
    process.exit(1);
  }

  const updatedAt = new Date().toISOString();
  const payload = { store: "tottus", source: `${BASE}/tottus-pe`, updatedAt, locationId, items: prices };
  await writeFile("js/data/prices-tottus.js",
    "// Generado por scraper/tottus.mjs — no editar a mano.\n" +
    "window.SCRAPED_PRICES = window.SCRAPED_PRICES || {};\n" +
    `window.SCRAPED_PRICES.tottus = ${JSON.stringify(payload, null, 2)};\n`);
  await mkdir("data", { recursive: true });
  const rows = [...catalog.values()].sort((a, b) => a.query.localeCompare(b.query) || a.price - b.price);
  await writeFile("data/tottus-catalogo.json", JSON.stringify({ store: "tottus", updatedAt, locationId, count: rows.length, products: rows }, null, 2) + "\n");
  if (failures) console.log(`${failures} consultas con error (ver arriba).`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
