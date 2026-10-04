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

await probe(`${BASE}/robots.txt`, 1500);
const html = await probe(PAGE, 400);
if (html) {
  console.log("\n===== análisis del HTML");
  console.log("title: " + (html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "-").trim());
  console.log("generator: " + (html.match(/<meta name="generator" content="([^"]+)"/)?.[1] ?? "-"));
  console.log("__NEXT_DATA__: " + /__NEXT_DATA__/.test(html) + " · wp-content: " + /wp-content/.test(html) + " · vtex: " + /vtex/i.test(html) + " · shopify: " + /shopify/i.test(html));
  console.log("iframes: " + uniq([...html.matchAll(/<iframe[^>]+src="([^"]+)"/g)].map(m => m[1])).join(" | "));
  console.log("archivos: " + uniq([...html.matchAll(/href="([^"]+\.(?:pdf|xlsx?|csv)(?:\?[^"]*)?)"/gi)].map(m => m[1])).join(" | "));
  console.log("selects: " + [...html.matchAll(/<select[^>]*>([\s\S]*?)<\/select>/g)].map(m => cut(m[0].replace(/\s+/g, " "), 400)).join("\n  "));
  console.log("menciones Arequipa: " + [...html.matchAll(/.{0,120}arequipa.{0,120}/gi)].slice(0, 6).map(m => m[0].replace(/\s+/g, " ")).join("\n  "));
  console.log("urls api/json: " + uniq([...html.matchAll(/["'](https?:\/\/[^"']*(?:api|json|graphql|ajax)[^"']*)["']/gi)].map(m => m[1])).slice(0, 25).join("\n  "));
  console.log("scripts: " + uniq([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1])).slice(0, 25).join("\n  "));
  const precios = [...html.matchAll(/.{0,80}S\/\s?\d+[.,]\d{2}.{0,80}/g)].slice(0, 12).map(m => m[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
  console.log(`textos con S/ (${precios.length}):\n  ` + precios.join("\n  "));
  // Texto visible aproximado alrededor de la lista
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  console.log("texto (inicio): " + cut(text, 2500));
}

// API típicas de WordPress por si el sitio las expone
await probe(`${BASE}/wp-json/`, 300);

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
  await page.goto(PAGE, { waitUntil: "networkidle", timeout: 60000 }).catch(e => console.log("goto:", e.message));
  await page.waitForTimeout(3000);
  console.log(`title: ${await page.title()}`);
  console.log("respuestas JSON/archivos:\n" + seen.slice(0, 40).join("\n"));
  const controls = await page.$$eval("select, [role=combobox], [role=listbox], button, a", els => els
    .map(el => `${el.tagName.toLowerCase()} ${(el.innerText || el.value || "").trim().replace(/\s+/g, " ").slice(0, 60)} ${el.getAttribute("href") ?? ""}`)
    .filter(t => /arequipa|regi|ciudad|tienda|descarg|pdf|excel|precio|lima|provincia/i.test(t)).slice(0, 40));
  console.log("controles relevantes:\n  " + controls.join("\n  "));
  const options = await page.$$eval("select", sels => sels.map(s => [...s.options].map(o => `${o.value}=${o.text}`).join(", ")));
  console.log("opciones de select: " + options.join("\n  "));
  const text = await page.locator("body").innerText().catch(() => "");
  console.log("texto visible:\n" + cut(text, 4000));
  await browser.close();
}
