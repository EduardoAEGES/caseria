// Scraper de precios de Tottus (tottus.com.pe).
//
// Por cada producto del catálogo de CaserIA busca en /tottus-pe/buscar?Ntt=…,
// lee los resultados del JSON __NEXT_DATA__ que trae la página y elige el que
// mejor coincide (reglas en scraper/common.mjs). Genera js/data/prices-tottus.js
// y data/tottus-catalogo.json.
//
// Uso: node scraper/tottus.mjs   (Node 18+, sin dependencias)

import { HEADERS, runScraper, toNumber } from "./common.mjs";

const BASE = "https://www.tottus.com.pe";

/** Extrae los productos del JSON __NEXT_DATA__ de una página de búsqueda o categoría. */
export function parseResults(html) {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("La página no trae __NEXT_DATA__ (¿cambió el sitio?)");
  const pageProps = JSON.parse(match[1]).props?.pageProps ?? {};
  const results = pageProps.results ?? [];
  return {
    meta: { locationId: pageProps.currentLocationId ?? null },
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
        ownBrand: /tottus/i.test(r.sellerName ?? ""),
        url: r.url,
        image: r.mediaUrls?.[0] ?? null,
      };
    }).filter(item => item.price !== null),
  };
}

async function search(query) {
  const url = `${BASE}/tottus-pe/buscar?Ntt=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return parseResults(await res.text());
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runScraper({ store: "tottus", source: `${BASE}/tottus-pe`, search });
}
