// Identificador de fruta: qué fruta es y en qué estado está. Todo corre en el navegador.
//
// Camino A (de fábrica): MobileNet v2 de Google (TensorFlow.js, modelo de grafo). Conoce 1000 clases
//   de ImageNet; aquí solo compiten las de fruta o verdura (FRUIT_CLASSES), renormalizadas, y el
//   puntaje se corrige con el color real de la foto. Detalles que hay que respetar:
//     - los píxeles van de 0 a 1 (dividir entre 255), NO de -1 a 1;
//     - la salida son logits: hay que aplicar softmax;
//     - la salida trae 1001 valores: la posición 0 es "fondo" y la clase i de ImageNet está en i + 1.
//   (Control: grace_hopper.jpg da "military uniform" ~89 %; con -1..1 daría "suit" ~32 %.)
// Camino B (modelo propio): Teachable Machine. Clases tipo "mandarina buena" / "mandarina malograda";
//   píxeles de -1 a 1 (dividir entre 127.5 y restar 1) y la salida ya viene con softmax.
// Estado sin modelo propio: se juzga por el color de la cáscara (freshnessByColor). No es un modelo
//   entrenado y así se le dice al usuario.
//
// Las funciones de análisis trabajan con píxeles RGBA ({ data, width, height }) y no dependen del
// navegador, así se pueden probar en Node (scraper/test-fruit-ai.mjs).

const FRUIT_AI = {
  TF_SRC: "vendor/tf.min.js",
  MOBILENET_URL: "https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json",
  CUSTOM_MODEL_KEY: "caseria.fruitModelUrl",
  TECH_MODE_KEY: "caseria.fruitTechMode",
  MIN_FRUIT_MASS: 0.0025,   // si las clases de fruta suman menos de 0,25 %, no hay fruta en la foto
  // Además: si suman menos del 3 % y otra clase (persona, perro…) es 10 veces más probable, tampoco.
  WEAK_FRUIT_MASS: 0.03,
  OTHER_CLASS_RATIO: 10,
  HUE_TOLERANCE: 15,        // grados fuera del rango de la fruta que aún suman parecido parcial
  ANALYSIS_WIDTH: 180,      // ancho de la imagen para el análisis de color
};

// Clases de ImageNet que son fruta o verdura. hue: rangos de matiz en grados (0 rojo, 60 amarillo,
// 120 verde); minSat: saturación media mínima esperada; elongated: forma alargada; brown: peso del
// tono marrón al juzgar el estado (1.45 plátano, 0.30 frutas marrones de por sí, 1.05 el resto).
const FRUIT_CLASSES = [
  { index: 936, name: "Col o repollo", emoji: "🥬" },
  { index: 937, name: "Brócoli", emoji: "🥦" },
  { index: 938, name: "Coliflor", emoji: "🥦" },
  { index: 939, name: "Zapallito italiano", emoji: "🥒" },
  { index: 940, name: "Zapallo", emoji: "🎃" },
  { index: 941, name: "Zapallo", emoji: "🎃" },
  { index: 942, name: "Zapallo", emoji: "🎃" },
  { index: 943, name: "Pepino", emoji: "🥒", hue: [[60, 150]], elongated: true },
  { index: 944, name: "Alcachofa", emoji: "🥬" },
  { index: 945, name: "Pimiento", emoji: "🫑" },
  { index: 946, name: "Cardo", emoji: "🥬" },
  { index: 947, name: "Champiñón", emoji: "🍄", brown: 0.30 },
  { index: 948, name: "Manzana verde", emoji: "🍏", hue: [[62, 150]] },
  { index: 949, name: "Fresa", emoji: "🍓", hue: [[336, 360], [0, 12]], minSat: 0.55 },
  { index: 950, name: "Naranja o mandarina", emoji: "🍊", hue: [[14, 44]], minSat: 0.45 },
  { index: 951, name: "Limón", emoji: "🍋", hue: [[44, 78]] },
  { index: 952, name: "Higo", emoji: "🟣", brown: 0.30 },
  { index: 953, name: "Piña", emoji: "🍍", hue: [[28, 62]], brown: 0.30 },
  { index: 954, name: "Plátano", emoji: "🍌", hue: [[38, 64]], elongated: true, brown: 1.45 },
  { index: 955, name: "Yaca", emoji: "🍈", brown: 0.30 },
  { index: 956, name: "Chirimoya", emoji: "🍈" },
  { index: 957, name: "Granada o manzana roja", emoji: "🍎", hue: [[332, 360], [0, 14]] },
  { index: 987, name: "Choclo", emoji: "🌽", hue: [[38, 68]], elongated: true },
  { index: 988, name: "Bellota", emoji: "🌰", brown: 0.30 },
];

// ── Color: separar la fruta del fondo y medir la cáscara ──────────────────────

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max];
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Separa la fruta del fondo y mide la cáscara. pixels = { data (RGBA), width, height },
 * idealmente de ~180 px de ancho. Devuelve las métricas en porcentaje (0–100).
 */
function analyzeColor(pixels) {
  const { data, width: w, height: h } = pixels;
  const n = w * h;

  // Paso 1: el fondo es la mediana del color del borde; es fruta lo que se aleje más de 74.
  const border = [[], [], []];
  for (let x = 0; x < w; x++) for (const y of [0, 1, h - 2, h - 1]) for (let c = 0; c < 3; c++) border[c].push(data[(y * w + x) * 4 + c]);
  for (let y = 0; y < h; y++) for (const x of [0, 1, w - 2, w - 1]) for (let c = 0; c < 3; c++) border[c].push(data[(y * w + x) * 4 + c]);
  const bg = border.map(median);
  let mask = new Uint8Array(n);
  let count = 0;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const diff = Math.abs(data[o] - bg[0]) + Math.abs(data[o + 1] - bg[1]) + Math.abs(data[o + 2] - bg[2]);
    if (diff > 74) { mask[i] = 1; count++; }
  }
  // Si queda menos del 7 %, no se pudo separar: elipse central del 34 % del ancho y del alto.
  let fallback = false;
  if (count < n * 0.07) {
    fallback = true;
    mask = new Uint8Array(n);
    count = 0;
    const cx = w / 2, cy = h / 2, rx = (w * 0.34) / 2, ry = (h * 0.34) / 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) { mask[y * w + x] = 1; count++; }
    }
  }

  // Paso 2: HSV de cada píxel de fruta.
  const hsv = new Float32Array(n * 3);
  let dark = 0, brown = 0, satSum = 0, valSum = 0;
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let i = 0; i < n; i++) {
    if (!mask[i]) continue;
    const o = i * 4;
    const [hh, s, v] = rgbToHsv(data[o], data[o + 1], data[o + 2]);
    hsv[i * 3] = hh; hsv[i * 3 + 1] = s; hsv[i * 3 + 2] = v;
    if (v < 0.34 && s < 0.60) dark++;
    if (hh >= 12 && hh <= 48 && s >= 0.14 && s <= 0.78 && v >= 0.16 && v <= 0.62) brown++;
    satSum += s; valSum += v;
    const x = i % w, y = (i - x) / w;
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const meanV = valSum / count;
  // Cáscara despareja: bloques de 8x8 con brillo medio < 62 % del brillo medio de la fruta.
  let blocks = 0, dimBlocks = 0;
  for (let by = 0; by < h; by += 8) for (let bx = 0; bx < w; bx += 8) {
    let inBlock = 0, total = 0, vSum = 0;
    for (let y = by; y < Math.min(by + 8, h); y++) for (let x = bx; x < Math.min(bx + 8, w); x++) {
      total++;
      const i = y * w + x;
      if (mask[i]) { inBlock++; vSum += hsv[i * 3 + 2]; }
    }
    if (inBlock < total / 2) continue;
    blocks++;
    if (vSum / inBlock < meanV * 0.62) dimBlocks++;
  }
  const spanX = maxX - minX + 1, spanY = maxY - minY + 1;
  return {
    mask, hsv, width: w, height: h, fruitPixels: count, fallback,
    coverage: (count / n) * 100,
    dark: (dark / count) * 100,
    brown: (brown / count) * 100,
    uneven: blocks ? (dimBlocks / blocks) * 100 : 0,
    vivid: (satSum / count) * 100,
    aspect: Math.max(spanX, spanY) / Math.max(1, Math.min(spanX, spanY)),
  };
}

/** Distancia en grados entre un matiz y un rango (0 si está dentro), en el círculo de 360°. */
function hueDistance(h, [lo, hi]) {
  if (h >= lo && h <= hi) return 0;
  const gap = d => Math.min(Math.abs(d), 360 - Math.abs(d));
  return Math.min(gap(h - lo), gap(h - hi));
}

/** Parecido (0–1) entre el color y la forma de la foto y lo esperado para la fruta. */
function colorSimilarity(fruit, color) {
  if (!fruit.hue) return 0.5;  // sin rango declarado: neutro
  let colored = 0, inRange = 0;
  for (let i = 0; i < color.mask.length; i++) {
    if (!color.mask[i] || color.hsv[i * 3 + 1] < 0.15) continue;  // ignora grises y blancos
    colored++;
    const hh = color.hsv[i * 3];
    // Dentro del rango cuenta entero; cerca del borde (hasta HUE_TOLERANCE grados) cuenta en parte.
    const d = Math.min(...fruit.hue.map(range => hueDistance(hh, range)));
    inRange += Math.max(0, 1 - d / FRUIT_AI.HUE_TOLERANCE);
  }
  let sim = colored ? inRange / colored : 0;
  if (fruit.minSat && color.vivid / 100 < fruit.minSat) sim *= 0.6;
  if (fruit.elongated && color.aspect < 1.45) sim *= 0.55;
  return sim;
}

/**
 * Probabilidades del modelo (softmax de los 1001 valores) → frutas candidatas.
 * Devuelve { noFruit, fruitMass, ranked: [{ name, emoji, fruit, modelProb, colorSim, score }] }.
 */
function rankFruits(probs, color) {
  const fruitMass = FRUIT_CLASSES.reduce((sum, f) => sum + probs[f.index + 1], 0);
  const fruitOutputs = new Set(FRUIT_CLASSES.map(f => f.index + 1));
  let topOther = 0;
  for (let i = 1; i < probs.length; i++) if (!fruitOutputs.has(i) && probs[i] > topOther) topOther = probs[i];
  const noFruit = fruitMass < FRUIT_AI.MIN_FRUIT_MASS
    || (fruitMass < FRUIT_AI.WEAK_FRUIT_MASS && topOther > fruitMass * FRUIT_AI.OTHER_CLASS_RATIO);
  if (noFruit) return { noFruit: true, fruitMass, topOther, ranked: [] };
  const byName = new Map();
  for (const fruit of FRUIT_CLASSES) {
    const p = probs[fruit.index + 1] / fruitMass;  // renormalizado entre las frutas
    const entry = byName.get(fruit.name) || { name: fruit.name, emoji: fruit.emoji, fruit, modelProb: 0 };
    entry.modelProb += p;
    byName.set(fruit.name, entry);
  }
  const ranked = [...byName.values()].map(entry => {
    const colorSim = colorSimilarity(entry.fruit, color);
    return { ...entry, colorSim, score: entry.modelProb ** 0.65 * (0.35 + 0.65 * colorSim) };
  }).sort((a, b) => b.score - a.score);
  const total = ranked.reduce((sum, r) => sum + r.score, 0) || 1;
  ranked.forEach(r => { r.share = r.score / total; });
  return { noFruit: false, fruitMass, topOther, ranked };
}

/** Estado por el color de la cáscara (no es un modelo entrenado). brownWeight según la fruta. */
function freshnessByColor(color, brownWeight = 1.05) {
  let score = 100;
  score -= color.dark * 1.55;
  score -= color.brown * brownWeight;
  score -= color.uneven * 0.75;
  if (color.vivid < 34) score -= (34 - color.vivid) * 1.20;
  score = Math.max(0, Math.min(100, score));

  const complaints = [];
  if (color.dark > 14) complaints.push("tiene bastante mancha oscura");
  else if (color.dark > 6) complaints.push("tiene algunas manchas oscuras");
  if (color.brown > 22) complaints.push("se ve muy marrón");
  else if (color.brown > 10) complaints.push("ya le está saliendo el marrón del golpe");
  if (color.uneven > 22) complaints.push("la cáscara está despareja");
  if (color.vivid < 26) complaints.push("el color está apagado");

  const level = score >= 70 ? "good" : score >= 45 ? "warn" : "bad";
  const list = joinSpanish(complaints);
  let reason;
  if (!complaints.length) reason = "Se ve pareja, sin manchas oscuras y con el color vivo.";
  else if (level === "good") reason = `Se ve bien en general. Lo único: ${list}.`;
  else reason = `${list.charAt(0).toUpperCase()}${list.slice(1)}.`;
  return { level, reason, score, source: "color" };
}

function joinSpanish(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

const FRESHNESS_TEXT = {
  good: "Está en buen estado",
  warn: "Está pasada, revísala",
  bad: "Ya no sirve para vender",
};

// ── Modelo propio de Teachable Machine: "mandarina buena" → fruta + estado ────

const GOOD_WORDS = ["buena", "buen", "bueno", "buenos", "buenas", "fresca", "fresco", "sana", "sano", "apta", "apto", "madura", "maduro"];
const BAD_WORDS = ["malograda", "malogrado", "mala", "malo", "podrida", "podrido", "dañada", "danada", "dañado", "danado", "pasada", "pasado", "vencida", "vencido", "vieja", "viejo"];

const FRUIT_EMOJI = [
  [/mandarin|naranj/, "🍊"], [/palta|aguacate/, "🥑"], [/papaya/, "🍈"], [/mango/, "🥭"], [/uva/, "🍇"],
  [/platan|banan/, "🍌"], [/manzana/, "🍎"], [/fresa|frutilla/, "🍓"], [/limon/, "🍋"], [/pi[ñn]a/, "🍍"],
  [/pera/, "🍐"], [/tomate/, "🍅"], [/sandia/, "🍉"], [/melon/, "🍈"], [/durazno|melocoton/, "🍑"],
  [/cereza/, "🍒"], [/kiwi/, "🥝"], [/coco/, "🥥"], [/papa\b/, "🥔"], [/zanahoria/, "🥕"], [/maracuya|granadilla/, "🟡"],
];

function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** "mandarina malograda" → { name: "Mandarina", state: "bad", emoji: "🍊" }. state null si no dice. */
function parseCustomLabel(label) {
  const words = label.trim().split(/[\s_-]+/);
  let state = null;
  const rest = words.filter(word => {
    const plain = normalizeText(word);
    if (GOOD_WORDS.map(normalizeText).includes(plain)) { state = state || "good"; return false; }
    if (BAD_WORDS.map(normalizeText).includes(plain)) { state = "bad"; return false; }
    return true;
  });
  const name = rest.join(" ") || label;
  const plainName = normalizeText(name);
  const emoji = (FRUIT_EMOJI.find(([re]) => re.test(plainName)) || [null, "🧺"])[1];
  return { name: name.charAt(0).toUpperCase() + name.slice(1), state, emoji };
}

// ── Navegador: cargar TensorFlow.js y los modelos ────────────────────────────

const fruitModels = { tfPromise: null, general: null, custom: null, customUrl: null };

function loadTf() {
  if (window.tf) return Promise.resolve(window.tf);
  if (!fruitModels.tfPromise) {
    fruitModels.tfPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = FRUIT_AI.TF_SRC;
      script.onload = () => resolve(window.tf);
      script.onerror = () => { fruitModels.tfPromise = null; reject(new Error("No se pudo cargar TensorFlow.js")); };
      document.head.appendChild(script);
    });
  }
  return fruitModels.tfPromise;
}

async function loadGeneralModel() {
  const tf = await loadTf();
  if (!fruitModels.general) fruitModels.general = await tf.loadGraphModel(FRUIT_AI.MOBILENET_URL);
  return fruitModels.general;
}

/** Modelo de Teachable Machine: URL que termina en /models/XXXX/ → { model, labels }. */
async function loadCustomModel(url) {
  const base = url.trim().replace(/\/?(model\.json|metadata\.json)?$/, "/");
  if (fruitModels.custom && fruitModels.customUrl === base) return fruitModels.custom;
  const tf = await loadTf();
  const metadata = await (await fetch(base + "metadata.json")).json();
  const model = await tf.loadLayersModel(base + "model.json");
  fruitModels.custom = { model, labels: metadata.labels || [] };
  fruitModels.customUrl = base;
  return fruitModels.custom;
}

function storedSetting(key, fallback = "") {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function saveSetting(key, value) {
  try {
    if (value === "" || value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* sin almacenamiento: se usa solo en esta sesión */ }
}

/** Recorta al cuadrado central y lo escala a size×size en un canvas nuevo. */
function squareCanvas(source, size) {
  const sw = source.videoWidth || source.naturalWidth || source.width;
  const sh = source.videoHeight || source.naturalHeight || source.height;
  const side = Math.min(sw, sh);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d").drawImage(source, (sw - side) / 2, (sh - side) / 2, side, side, 0, 0, size, size);
  return canvas;
}

/**
 * Identifica la fruta de una imagen, video o canvas. Devuelve lo que muestra la pantalla:
 * { noFruit, name, emoji, alternative, level, reason, colorNote, tech }.
 */
async function identifyFruit(source) {
  const tf = await loadTf();
  const colorCanvas = squareCanvas(source, FRUIT_AI.ANALYSIS_WIDTH);
  const pixels = colorCanvas.getContext("2d").getImageData(0, 0, FRUIT_AI.ANALYSIS_WIDTH, FRUIT_AI.ANALYSIS_WIDTH);
  const color = analyzeColor(pixels);
  const input = squareCanvas(source, 224);
  const customUrl = storedSetting(FRUIT_AI.CUSTOM_MODEL_KEY);

  if (customUrl) {
    const { model, labels } = await loadCustomModel(customUrl);
    const probs = tf.tidy(() => model.predict(tf.browser.fromPixels(input).toFloat().div(127.5).sub(1).expandDims(0)).dataSync());
    const order = Array.from(probs).map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]);
    const best = parseCustomLabel(labels[order[0][1]] || "");
    const second = order[1] ? parseCustomLabel(labels[order[1][1]] || "") : null;
    const byColor = freshnessByColor(color);
    const fresh = best.state
      ? { level: best.state, reason: best.state === "good" ? "Tu modelo entrenado la reconoce como buena." : "Tu modelo entrenado la reconoce como malograda.", source: "custom" }
      : byColor;
    return {
      noFruit: false, name: best.name, emoji: best.emoji,
      alternative: second && second.name !== best.name && order[1][0] >= 0.25 ? second.name : null,
      ...fresh, colorNote: fresh.source === "color",
      tech: { model: "Teachable Machine", candidates: order.slice(0, 5).map(([p, i]) => ({ label: labels[i], prob: p })), color, freshness: byColor },
    };
  }

  const model = await loadGeneralModel();
  const probs = tf.tidy(() => tf.softmax(model.predict(tf.browser.fromPixels(input).toFloat().div(255).expandDims(0))).dataSync());
  const ranking = rankFruits(probs, color);
  if (ranking.noFruit) {
    return { noFruit: true, tech: { model: "MobileNet v2", fruitMass: ranking.fruitMass, color } };
  }
  const [best, second] = ranking.ranked;
  const fresh = freshnessByColor(color, best.fruit.brown ?? 1.05);
  return {
    noFruit: false, name: best.name, emoji: best.emoji,
    alternative: second && (second.share >= 0.25 || best.share < 0.55) ? second.name : null,
    ...fresh, colorNote: true,
    tech: { model: "MobileNet v2", fruitMass: ranking.fruitMass, candidates: ranking.ranked.slice(0, 5), color, freshness: fresh },
  };
}
