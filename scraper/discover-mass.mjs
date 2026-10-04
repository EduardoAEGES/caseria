// Reconocimiento de tiendasmass.com.pe/precios-mass/: cómo entrega la lista de precios
// (HTML, archivo descargable, iframe, API JSON) y cómo se elige la región (Arequipa).
// Uso: node scraper/discover-mass.mjs   (con PLAYWRIGHT=1 también carga la página en un navegador)

const BASE = "https://www.tiendasmass.com.pe";
const PAGE = `${BASE}/precios-mass/`;
const HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36",
  "accept-language": "es-PE,es;q=0.9",
};
const cut = (s, n = 600) => (s.length > n ? s.slice(0, n) + "…" : s);
const uniq = list => [...new Set(list)];

async function probe(url, show = 600) {
  console.log(`\n===== GET ${url}`);
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    const body = await res.text();
    console.log(`status=${res.status} final=${res.url} type=${res.headers.get("content-type")} bytes=${body.length} server=${res.headers.get("server")}`);
    console.log(cut(body, show));
    return body;
  } catch (error) {
    console.log(`ERROR ${error.message}`);
    return "";
  }
}

// Folletos de Arequipa: la página pide los catálogos por AJAX con un nonce que viene en el HTML.
const page0 = await probe(PAGE, 0);
const nonce = page0.match(/nonce["']?\s*[:=]\s*["']([a-f0-9]{8,})["']/i)?.[1];
console.log("nonce en el HTML: " + nonce);
const ajax = await fetch(`${BASE}/json/admin-ajax.php`, {
  method: "POST",
  headers: { ...HEADERS, "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "x-requested-with": "XMLHttpRequest" },
  body: new URLSearchParams({ action: "cargar_catalogos_por_ciudad", ciudad: "AREQUIPA", nonce: nonce ?? "" }),
}).then(r => r.text()).catch(e => "ERROR " + e.message);
console.log("respuesta ajax: " + cut(ajax, 1500));
const catalogs = uniq([...ajax.replace(/\\\//g, "/").matchAll(/href=\\?"(https:[^"\\]+\/catalogos\/[^"\\]+)/g)].map(m => m[1]));
console.log("catálogos: " + catalogs.join(" | "));

for (const url of catalogs.slice(0, 2)) {
  const html = await probe(url, 0);
  console.log("title: " + (html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "-").trim());
  console.log("iframes: " + uniq([...html.matchAll(/<iframe[^>]+src="([^"]+)"/g)].map(m => m[1])).join(" | "));
  console.log("archivos: " + uniq([...html.matchAll(/(https?:[^"' ]+\.(?:pdf|xlsx?|csv))/gi)].map(m => m[1])).join(" | "));
  const imgs = uniq([...html.matchAll(/(https?:[^"' ]+\/wp-content\/uploads\/[^"' ]+\.(?:jpe?g|png|webp))/gi)].map(m => m[1]));
  console.log(`imágenes de uploads (${imgs.length}):\n  ` + imgs.slice(0, 40).join("\n  "));
  const precios = [...html.matchAll(/.{0,100}S\/\s?\d+[.,]\d{2}.{0,100}/g)].slice(0, 15).map(m => m[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
  console.log(`textos con S/ (${precios.length}):\n  ` + precios.join("\n  "));
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  console.log("texto: " + cut(text, 2500));
  const scripts = uniq([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1])).filter(u => !/cookiebot|gtm|jquery|bootstrap|lazysizes|slick/.test(u));
  console.log("scripts: " + scripts.join(" | "));
}

if (process.env.PLAYWRIGHT) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ userAgent: HEADERS["user-agent"], locale: "es-PE" });
  const seen = [];
  page.on("response", async res => {
    const type = res.headers()["content-type"] ?? "";
    if (!/json|pdf|spreadsheet|excel|csv/.test(type)) return;
    let snippet = "";
    try { snippet = /json/.test(type) ? cut(await res.text(), 500) : `(${type})`; } catch {}
    seen.push(`${res.request().method()} ${res.status()} ${cut(res.url(), 250)}\n    ${snippet}`);
  });
  console.log("\n===== PLAYWRIGHT");
  const all = [];
  page.on("request", req => { if (req.method() === "POST" || /ajax|json|catalog|public|pdf/i.test(req.url())) all.push(`${req.method()} ${cut(req.url(), 250)} ${cut(req.postData() ?? "", 300)}`); });
  await page.goto(PAGE, { waitUntil: "networkidle", timeout: 60000 }).catch(e => console.log("goto:", e.message));
  await page.selectOption("#selector-ciudad", "AREQUIPA");
  await page.getByText("Ver publicaciones").first().click().catch(e => console.log("click:", e.message));
  await page.waitForTimeout(3000);
  const href = await page.locator("#lista-catalogos a").first().getAttribute("href").catch(() => null);
  console.log("abriendo catálogo: " + href);
  seen.length = 0;
  const loaded = [];
  page.on("response", res => { const t = res.headers()["content-type"] ?? ""; if (/image|pdf|json|octet/.test(t)) loaded.push(`${res.status()} ${t.split(";")[0]} ${cut(res.url(), 200)}`); });
  if (href) await page.goto(href, { waitUntil: "networkidle", timeout: 60000 }).catch(e => console.log("goto:", e.message));
  await page.waitForTimeout(4000);
  console.log("recursos cargados por el catálogo:\n  " + loaded.filter(l => !/cookiebot|google|facebook|clarity|mass_logo|libroRecl/.test(l)).slice(0, 60).join("\n  "));
  const frames = page.frames().map(f => f.url()).filter(u => u && u !== "about:blank");
  console.log("frames: " + frames.join(" | "));
  await browser.close();
}
