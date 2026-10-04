// Reconocimiento de metro.pe: robots.txt, API pública de catálogo VTEX y regionalización.
// Uso: node scraper/discover-metro.mjs

const BASE = "https://www.metro.pe";
const HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  "accept-language": "es-PE,es;q=0.9",
  accept: "application/json, text/html;q=0.9",
};
const cut = (s, n = 600) => (s.length > n ? s.slice(0, n) + "…" : s);

async function probe(path, show = 800) {
  const url = path.startsWith("http") ? path : BASE + path;
  console.log(`\n===== GET ${url}`);
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    const body = await res.text();
    console.log(`status=${res.status} final=${res.url} type=${res.headers.get("content-type")} bytes=${body.length}`);
    console.log(`resources: ${res.headers.get("resources") ?? "-"} · server: ${res.headers.get("server") ?? "-"}`);
    console.log(cut(body, show));
    return { res, body };
  } catch (error) {
    console.log(`ERROR ${error.message}`);
    return null;
  }
}

await probe("/robots.txt", 1500);
await probe("/", 300);

// API de catálogo VTEX
const search = await probe("/api/catalog_system/pub/products/search?ft=arroz%20costeno&_from=0&_to=4", 200);
if (search?.res.ok) {
  try {
    const products = JSON.parse(search.body);
    console.log(`productos: ${products.length}`);
    for (const p of products.slice(0, 4)) {
      const item = p.items?.[0];
      const offer = item?.sellers?.[0]?.commertialOffer;
      console.log(JSON.stringify({
        productId: p.productId, name: p.productName, brand: p.brand, link: p.link,
        itemName: item?.name, measurementUnit: item?.measurementUnit, unitMultiplier: item?.unitMultiplier,
        ean: item?.ean, seller: item?.sellers?.[0]?.sellerName,
        price: offer?.Price, listPrice: offer?.ListPrice, available: offer?.AvailableQuantity, isAvailable: offer?.IsAvailable,
        categories: p.categories?.slice(0, 2),
      }));
    }
    console.log("claves del producto: " + Object.keys(products[0] ?? {}).join(", "));
  } catch (error) { console.log("no es JSON: " + error.message); }
}

// Intelligent Search (VTEX IO)
await probe("/api/io/_v/api/intelligent-search/product_search/?query=arroz%20costeno&count=3", 1200);

// Regionalización: canales de venta y región por código postal (Paucarpata 04008)
await probe("/api/catalog_system/pub/saleschannel/list", 1200);
await probe("/api/checkout/pub/regions?country=PER&postalCode=04008", 800);
await probe("/api/sessions?items=public.regionId,store.channel", 600);
