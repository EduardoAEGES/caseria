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

// Código del tema que maneja el selector de ciudad
for (const js of ["global.js", "carrusel.js"]) {
  const code = await probe(`${BASE}/wp-content/themes/mass/js/${js}`, 0);
  const hits = [...code.matchAll(/.{0,300}(ciudad|ajax|catalog|publicac|action\s*:).{0,300}/gi)].slice(0, 12).map(m => m[0].replace(/\s+/g, " "));
  console.log(`fragmentos de ${js}:\n  ` + hits.join("\n  "));
}
const html = await probe(PAGE, 0);
const inline = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).filter(c => /ciudad|ajax|catalog|publicac/i.test(c));
console.log("scripts en línea relevantes:\n" + inline.map(c => cut(c.replace(/\s+/g, " "), 2500)).join("\n---\n"));
const form = html.match(/<form[\s\S]*?selector-ciudad[\s\S]*?<\/form>/)?.[0] ?? html.match(/[\s\S]{0,800}selector-ciudad[\s\S]{0,1500}/)?.[0] ?? "";
console.log("HTML del selector:\n" + cut(form.replace(/\s+/g, " "), 2500));

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
  await page.waitForTimeout(6000);
  console.log("URL tras elegir ciudad: " + page.url());
  console.log("peticiones:\n  " + all.slice(0, 40).join("\n  "));
  console.log("respuestas JSON/archivos:\n" + seen.slice(0, 40).join("\n"));
  const links = await page.$$eval("a[href], iframe[src], img[src], embed[src], object[data]", els => els
    .map(el => `${el.tagName.toLowerCase()} ${el.getAttribute("href") || el.getAttribute("src") || el.getAttribute("data")} ${(el.innerText || el.alt || "").trim().slice(0, 50)}`)
    .filter(t => !/facebook|instagram|tiktok|youtube|legales|libro-de|conoceme|ubicame|aprende|ofrece|mailto|cookiebot|gtm/i.test(t)));
  console.log("enlaces/imágenes/iframes tras elegir ciudad:\n  " + links.slice(0, 60).join("\n  "));
  const text = await page.locator("main, #content, body").first().innerText().catch(() => "");
  console.log("texto visible:\n" + cut(text, 3500));
  await browser.close();
}
