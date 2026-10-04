// Scraper de precios de Tiendas Mass (tiendasmass.com.pe/precios-mass/).
//
// Mass no tiene tienda online: publica un folleto por ciudad como imágenes JPG.
//   1. Pide los folletos de AREQUIPA al mismo endpoint que usa la web
//      (admin-ajax.php, acción cargar_catalogos_por_ciudad, con el nonce de la página).
//   2. Si el folleto es el mismo que data/mass-folleto.json, reutiliza sus productos.
//      Si es nuevo y existe ANTHROPIC_API_KEY, le pide a Claude que lea las imágenes.
//      Si es nuevo y no hay clave, avisa y conserva el folleto anterior.
//   3. Cruza los productos del folleto con los de CaserIA (reglas byStore.mass de common.mjs)
//      y escribe js/data/prices-mass.js. Es "parcial": los productos que no salen en el
//      folleto siguen con la tabla de ejemplo de la app.
//
// Uso: node scraper/mass.mjs            (consulta la web)
//      node scraper/mass.mjs --offline  (solo recalcula desde data/mass-folleto.json)

import { readFile, writeFile } from "node:fs/promises";
import { HEADERS, QUERIES, pickBest, ruleFor, writeStoreFiles } from "./common.mjs";

const BASE = "https://www.tiendasmass.com.pe";
const CITY = "AREQUIPA";
const FOLLETO_FILE = "data/mass-folleto.json";
const MODEL = "claude-opus-5-5";

const uniq = list => [...new Set(list)];
const decode = s => s.replace(/\\\//g, "/").replace(/\\"/g, '"').replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
const stripTags = s => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function getText(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { ...HEADERS, ...init.headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}

/** Folleto vigente de la ciudad: URL, título, vigencia e imágenes de sus páginas. */
async function getCurrentCatalog() {
  const page = await getText(`${BASE}/precios-mass/`);
  const nonce = page.match(/nonce["']?\s*[:=]\s*["']([a-f0-9]{8,})["']/i)?.[1];
  if (!nonce) throw new Error("No se encontró el nonce en /precios-mass/ (¿cambió la web?)");
  const json = JSON.parse(await getText(`${BASE}/json/admin-ajax.php`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "x-requested-with": "XMLHttpRequest" },
    body: new URLSearchParams({ action: "cargar_catalogos_por_ciudad", ciudad: CITY, nonce }),
  }));
  const html = decode(json.data?.html ?? "");
  const catalogUrl = html.match(/href="(https:[^"]+\/catalogos\/[^"]+)"/)?.[1];
  if (!catalogUrl) throw new Error(`No hay folletos activos para ${CITY}`);
  const title = stripTags(html.match(/class="cat-titulo[^"]*">([\s\S]*?)<\/p>/)?.[1] ?? "");
  const validFrom = stripTags(html.match(/class="cat-fecha[^"]*">([\s\S]*?)<\/p>/)?.[1] ?? "");

  const catalogHtml = await getText(catalogUrl);
  // Páginas del folleto: imágenes subidas cuyo nombre contiene FOLLETO, en orden de aparición.
  const pages = uniq([...catalogHtml.matchAll(/(https?:[^"' ]+\/wp-content\/uploads\/[^"' ]+\.(?:jpe?g|png|webp))/gi)]
    .map(m => m[1]).filter(url => /folleto/i.test(url)));
  if (!pages.length) throw new Error(`El folleto ${catalogUrl} no tiene páginas reconocibles`);
  return { catalogUrl, title, validFrom, pages };
}

/** Lee las páginas del folleto con Claude y devuelve [{ page, name, brand, presentation, price, previousPrice }]. */
async function extractWithClaude(pages) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const images = [];
  for (const url of pages) {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
    const type = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0];
    images.push({ type: "image", source: { type: "base64", media_type: type, data: Buffer.from(await res.arrayBuffer()).toString("base64") } });
  }
  const schema = {
    type: "object",
    properties: {
      products: {
        type: "array",
        items: {
          type: "object",
          properties: {
            page: { type: "integer" },
            name: { type: "string" },
            brand: { type: "string" },
            presentation: { type: "string" },
            price: { type: "number" },
            previousPrice: { type: "number" },
          },
          required: ["page", "name", "brand", "presentation", "price", "previousPrice"],
          additionalProperties: false,
        },
      },
    },
    required: ["products"],
    additionalProperties: false,
  };
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema } },
    messages: [{
      role: "user",
      content: [
        ...images,
        {
          type: "text",
          text: "Estas imágenes son, en orden, las páginas de un folleto de precios de Tiendas Mass (Perú). " +
            "Extrae cada producto que tenga precio. Para cada uno: page (número de página, empezando en 1), " +
            "name (tipo de producto seguido de la marca y la variedad, tal como lo escribe el folleto, p. ej. \"Arroz extra Valle Blanco\"), " +
            "brand (marca, o \"\" si no tiene), presentation (envase y tamaño, p. ej. \"bl x 4 kg\"), " +
            "price (precio actual en soles, número) y previousPrice (precio de \"antes\", o 0 si no figura). " +
            "No inventes productos ni precios: si un precio no se lee con claridad, omite ese producto.",
        },
      ],
    }],
  });
  if (response.stop_reason === "refusal") throw new Error("Claude rechazó la extracción del folleto");
  if (response.stop_reason === "max_tokens") throw new Error("La respuesta de Claude se cortó (max_tokens)");
  const text = response.content.filter(block => block.type === "text").map(block => block.text).join("");
  const { products } = JSON.parse(text);
  return products.map(p => ({ ...p, previousPrice: p.previousPrice > 0 ? p.previousPrice : null }));
}

/** "Desde el 15 de setiembre del 2026" → "Folleto 15 set." (etiqueta corta para la app). */
function shortLabel(validFrom) {
  const match = validFrom.match(/(\d{1,2}) de ([a-záéíóú]+)/i);
  return match ? `Folleto ${match[1]} ${match[2].slice(0, 3).toLowerCase()}.` : "Folleto vigente";
}

/** Cruza el folleto con los productos de CaserIA y escribe js/data/prices-mass.js. */
async function writePrices(folleto) {
  const items = folleto.products.map((p, i) => ({
    productId: `p${p.page}-${i}`, name: p.name, brand: p.brand, presentation: p.presentation,
    unit: "", price: p.price, normalPrice: p.previousPrice, url: folleto.catalogUrl,
  }));
  const prices = {};
  for (const [id, rule] of Object.entries(QUERIES)) {
    const best = pickBest(items, ruleFor(rule, "mass"));
    if (!best) continue;
    prices[id] = { price: best.price, normalPrice: best.normalPrice, name: best.name, presentation: best.presentation, url: best.url };
    console.log(`✓ ${id.padStart(2)} → S/ ${best.price.toFixed(2)}  ${best.name} (${best.presentation})`);
  }
  console.log(`${Object.keys(prices).length} productos de CaserIA en el folleto (${folleto.products.length} productos con precio).`);
  await writeStoreFiles({
    store: "mass",
    source: folleto.catalogUrl,
    meta: { partial: true, city: folleto.city, title: folleto.title, validFrom: folleto.validFrom, label: shortLabel(folleto.validFrom) },
    prices,
  });
}

const saved = JSON.parse(await readFile(FOLLETO_FILE, "utf8").catch(() => "null"));

if (process.argv.includes("--offline")) {
  if (!saved) throw new Error(`No existe ${FOLLETO_FILE}`);
  await writePrices(saved);
} else {
  const current = await getCurrentCatalog();
  console.log(`Folleto vigente en ${CITY}: ${current.title} · ${current.validFrom} · ${current.pages.length} páginas\n${current.catalogUrl}`);
  const same = saved && saved.catalogUrl === current.catalogUrl && saved.pages.join() === current.pages.join();
  if (same) {
    console.log(`Es el mismo folleto de ${FOLLETO_FILE}; se reutilizan sus productos.`);
    await writePrices(saved);
  } else if (process.env.ANTHROPIC_API_KEY) {
    console.log(`Folleto nuevo: leyendo las páginas con ${MODEL}…`);
    const products = await extractWithClaude(current.pages);
    const folleto = { store: "mass", city: CITY, ...current, extractedAt: new Date().toISOString().slice(0, 10), extractedBy: MODEL, products };
    await writeFile(FOLLETO_FILE, JSON.stringify(folleto, null, 2) + "\n");
    await writePrices(folleto);
  } else {
    // Sin clave no se puede leer el folleto nuevo: se mantienen los precios anteriores y se avisa.
    console.log(`::warning::Hay un folleto nuevo de Mass (${current.title}, ${current.validFrom}) pero falta ANTHROPIC_API_KEY para leerlo. Se mantienen los precios del folleto anterior.`);
    if (saved) await writePrices(saved);
  }
}
