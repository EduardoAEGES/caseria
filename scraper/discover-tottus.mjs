// Reconocimiento de tottus.com.pe: imprime cómo entrega la página sus productos
// (HTML con __NEXT_DATA__, llamadas a API, cookies de zona) para diseñar el scraper.
// Uso: node scraper/discover-tottus.mjs   (con PLAYWRIGHT=1 también captura la red)

const BASE = "https://www.tottus.com.pe";
const HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  "accept-language": "es-PE,es;q=0.9",
};

const cut = (s, n = 600) => (s.length > n ? s.slice(0, n) + "…" : s);

function findProductArrays(node, path = "$", out = []) {
  if (Array.isArray(node)) {
    const sample = node[0];
    if (sample && typeof sample === "object" && !Array.isArray(sample)) {
      const keys = Object.keys(sample);
      if (keys.some(k => /price/i.test(k)) && keys.some(k => /name|title/i.test(k))) out.push({ path, length: node.length, keys });
    }
    node.slice(0, 3).forEach((child, i) => findProductArrays(child, `${path}[${i}]`, out));
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) findProductArrays(v, `${path}.${k}`, out);
  }
  return out;
}

function get(obj, path) {
  return path.replace(/^\$\.?/, "").split(/\.|\[(\d+)\]/).filter(Boolean).reduce((o, k) => o?.[k], obj);
}

async function probe(url) {
  console.log(`\n===== GET ${url}`);
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    const body = await res.text();
    console.log(`status=${res.status} final=${res.url} type=${res.headers.get("content-type")} bytes=${body.length}`);
    console.log(`set-cookie: ${cut(res.headers.get("set-cookie") ?? "-", 400)}`);
    console.log(`title: ${body.match(/<title>(.*?)<\/title>/)?.[1] ?? "-"}`);
    const next = body.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!next) { console.log("sin __NEXT_DATA__; inicio del cuerpo:\n" + cut(body, 1200)); return; }
    const data = JSON.parse(next[1]);
    console.log(`__NEXT_DATA__ page=${data.page} buildId=${data.buildId}`);
    console.log(`pageProps keys: ${Object.keys(data.props?.pageProps ?? {}).join(", ")}`);
    const arrays = findProductArrays(data);
    console.log(`arreglos con precio+nombre: ${JSON.stringify(arrays.slice(0, 8))}`);
    for (const a of arrays.slice(0, 2)) console.log(`muestra ${a.path}[0]:\n${cut(JSON.stringify(get(data, a.path)?.[0]), 2500)}`);
  } catch (error) {
    console.log(`ERROR ${error.message}`);
  }
}

// Portada: configuración pública y enlaces a categorías / búsqueda
{
  const res = await fetch(`${BASE}/tottus-pe?kid=shopp1to`, { headers: HEADERS });
  const html = await res.text();
  const data = JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const props = data.props.pageProps;
  console.log("\n===== portada");
  const cfgEntries = Object.entries(props.publicRuntimeConfig ?? {}).filter(([k, v]) => typeof v === "string" && /url|api|search|host|zone|region/i.test(k));
  console.log("publicRuntimeConfig (urls):\n" + cfgEntries.map(([k, v]) => `  ${k}=${cut(v, 150)}`).join("\n"));
  console.log("store: " + cut(JSON.stringify(props.store), 500));
  console.log("serverData keys: " + Object.keys(props.serverData ?? {}).join(", "));
  const hrefs = [...new Set([...html.matchAll(/href="(\/tottus-pe\/[^"?#]+)/g)].map(m => m[1]))];
  console.log(`enlaces /tottus-pe/ (${hrefs.length}):\n  ` + hrefs.slice(0, 40).join("\n  "));
  const apis = [...new Set([...html.matchAll(/https?:\/\/[a-z0-9.-]+\/(?:s|api)\/[a-z0-9/_-]+/gi)].map(m => m[0]))];
  console.log("urls tipo api en el html:\n  " + apis.slice(0, 20).join("\n  "));
  const zones = [...new Set([...html.matchAll(/"(?:zones?|politicalId|priceGroup|pgid)"\s*:\s*("[^"]*"|\[[^\]]*\]|\d+)/gi)].map(m => m[0]))];
  console.log("zonas: " + zones.slice(0, 15).join(" | "));
}

// Sitemap de categorías → primera categoría de alimentos
{
  console.log("\n===== sitemap categorías");
  const index = await (await fetch(`${BASE}/static/site/sitemaps/categories/categories_pe_TO_COM-index.xml`, { headers: HEADERS })).text();
  const maps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  console.log("sitemaps: " + maps.join(" "));
  if (maps[0]) {
    const xml = await (await fetch(maps[0], { headers: HEADERS })).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    console.log(`categorías (${urls.length}):\n  ` + urls.filter(u => /arroz|abarrote|leche|aceite|despensa/i.test(u)).slice(0, 15).join("\n  ") + "\n  …\n  " + urls.slice(0, 10).join("\n  "));
    const target = urls.find(u => /arroz/i.test(u)) ?? urls[0];
    if (target) await probe(target);
  }
}

for (const path of ["/tottus-pe/buscar?Ntt=arroz", "/tottus-pe/search/?Ntt=arroz", "/search?Ntt=arroz"]) await probe(`${BASE}${path}`);

if (process.env.PLAYWRIGHT) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: HEADERS["user-agent"], locale: "es-PE" });
  const seen = [];
  page.on("response", async res => {
    const type = res.headers()["content-type"] ?? "";
    if (!type.includes("json")) return;
    let snippet = "";
    try { snippet = cut(await res.text(), 300); } catch {}
    seen.push(`${res.request().method()} ${res.status()} ${cut(res.url(), 300)}\n    ${snippet}`);
  });
  console.log("\n===== PLAYWRIGHT portada");
  await page.goto(`${BASE}/tottus-pe?kid=shopp1to`, { waitUntil: "networkidle", timeout: 60000 }).catch(e => console.log("goto:", e.message));
  console.log(`title: ${await page.title()}`);
  console.log("respuestas JSON:\n" + seen.slice(0, 40).join("\n"));
  const cookies = await page.context().cookies();
  console.log("cookies: " + cookies.map(c => `${c.name}=${cut(c.value, 80)}`).join(" | "));
  const text = await page.locator("body").innerText().catch(() => "");
  console.log("texto visible:\n" + cut(text, 1500));
  await browser.close();
}
