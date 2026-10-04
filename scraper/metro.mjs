// Scraper de precios de Metro (metro.pe, plataforma VTEX).
//
// Usa la API pública de catálogo de VTEX (/api/catalog_system/pub/products/search),
// que devuelve JSON con nombre, marca, unidad y ofertas por vendedor. Los precios se
// piden para la región de Paucarpata (código postal 04008) obtenida de
// /api/checkout/pub/regions. Reglas de coincidencia en scraper/common.mjs.
// Genera js/data/prices-metro.js y data/metro-catalogo.json.
//
// Uso: node scraper/metro.mjs   (Node 18+, sin dependencias)

import { HEADERS, runScraper } from "./common.mjs";

const BASE = "https://www.metro.pe";
const POSTAL_CODE = "04008"; // Paucarpata, Arequipa
const PAGE_SIZE = 50;        // la API devuelve como máximo 50 productos por consulta

async function getJson(url) {
  const res = await fetch(url, { headers: { ...HEADERS, accept: "application/json" } });
  if (!res.ok && res.status !== 206) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

/** Región VTEX de Paucarpata; si falla se usan los precios generales de la web. */
async function getRegionId() {
  try {
    const regions = await getJson(`${BASE}/api/checkout/pub/regions?country=PER&postalCode=${POSTAL_CODE}`);
    return regions[0]?.id ?? null;
  } catch (error) {
    console.log(`No se pudo obtener la región de ${POSTAL_CODE}: ${error.message}`);
    return null;
  }
}

/** Metro pone la presentación en el nombre ("Arroz Costeño Extra 3kg"): se extrae para mostrarla aparte. */
function sizeFromName(name) {
  const match = name.match(/(?:x\s?)?\d+(?:[.,]\d+)?\s?(?:kg|g|gr|l|lt|ml|un|und|unid|rollos)\b|x\s?\d+\b/i);
  return match ? match[0] : "";
}

/** Convierte un producto VTEX al formato común; null si no hay oferta disponible. */
export function toItem(product) {
  const item = product.items?.[0];
  if (!item) return null;
  const offers = (item.sellers ?? [])
    .map(seller => seller.commertialOffer)
    .filter(offer => offer && offer.Price > 0 && (offer.AvailableQuantity > 0 || offer.IsAvailable));
  if (!offers.length) return null;
  const best = offers.reduce((a, b) => (b.Price < a.Price ? b : a));
  const unit = (item.measurementUnit ?? "").toLowerCase();
  return {
    productId: product.productId,
    name: product.productName,
    brand: product.brand ?? "",
    presentation: unit === "kg" ? "x kg" : sizeFromName(product.productName),
    unit: unit.toUpperCase(),
    // Precio de la unidad de venta (para productos por peso, el precio por kg que muestra la web).
    price: Math.round(best.Price * 100) / 100,
    normalPrice: best.ListPrice > best.Price ? best.ListPrice : null,
    ean: item.ean ?? null,
    category: product.categories?.[0] ?? "",
    ownBrand: /metro|cuisine|bells/i.test(product.brand ?? ""),
    url: product.link,
    image: item.images?.[0]?.imageUrl ?? null,
  };
}

const regionId = await getRegionId();

async function search(query) {
  // Los espacios van como %20: con "+" (URLSearchParams) la API responde 400 en búsquedas de varias palabras.
  let url = `${BASE}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}&_from=0&_to=${PAGE_SIZE - 1}`;
  if (regionId) url += `&regionId=${encodeURIComponent(regionId)}`;
  const products = await getJson(url);
  return {
    meta: { postalCode: POSTAL_CODE, regionId },
    items: products.map(toItem).filter(Boolean),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await runScraper({ store: "metro", source: BASE, search });
}
