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

await probe(`${BASE}/robots.txt`);
await probe(`${BASE}/tottus-pe?kid=shopp1to`);
await probe(`${BASE}/tottus-pe/search?Ntt=arroz%20costeno`);

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
  console.log("\n===== PLAYWRIGHT search");
  await page.goto(`${BASE}/tottus-pe/search?Ntt=arroz%20costeno`, { waitUntil: "networkidle", timeout: 60000 }).catch(e => console.log("goto:", e.message));
  console.log(`title: ${await page.title()}`);
  console.log("respuestas JSON:\n" + seen.slice(0, 40).join("\n"));
  const cookies = await page.context().cookies();
  console.log("cookies: " + cookies.map(c => `${c.name}=${cut(c.value, 80)}`).join(" | "));
  const text = await page.locator("body").innerText().catch(() => "");
  console.log("texto visible:\n" + cut(text, 1500));
  await browser.close();
}
