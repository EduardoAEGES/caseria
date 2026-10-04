// Identificador de fruta: qué fruta es y en qué estado está (buena / pasada / ya no sirve).
// Todo corre en el navegador (js/core/fruit-ai.js); la foto no sale del celular.
// Dos pasos en la misma pantalla: captura (#fruit-capture) y resultado (#fruit-result).
// Las acciones devuelven false y actualizan el DOM a mano para no destruir el <video>.

const FRUIT_LEVEL_ICON = { good: "check", warn: "alert", bad: "x" };

function scannerLocked() {
  return !state.premium && state.trialUsed;
}

function fruitEl(id) {
  return document.getElementById(id);
}

function setFruitStatus(text, tone = "") {
  const el = fruitEl("fruit-status");
  if (!el) return;
  el.textContent = text;
  el.className = `fruit-status${tone ? ` fruit-status--${tone}` : ""}`;
  el.hidden = !text;
}

function setFruitBusy(text) {
  const busy = fruitEl("fruit-busy");
  if (!busy) return;
  busy.hidden = !text;
  fruitEl("fruit-busy-text").textContent = text || "";
  document.querySelectorAll(".fruit-actions button, .fruit-actions input").forEach(el => { el.disabled = Boolean(text); });
  if (!text) syncFruitButtons(router.ui);
}

function syncFruitButtons(ui) {
  const cam = fruitEl("fruit-cam-btn");
  if (!cam) return;
  cam.disabled = !window.isSecureContext || !navigator.mediaDevices;
  cam.hidden = Boolean(ui.stream);
  fruitEl("fruit-scan-btn").disabled = !ui.stream && !ui.photoUrl;
  fruitEl("fruit-flip-btn").hidden = !ui.stream;
}

/** Muestra la cámara o la foto subida en el visor. */
function showFruitSource(ui, kind) {
  const video = fruitEl("fruit-video");
  const photo = fruitEl("fruit-photo");
  if (!video) return;
  video.hidden = kind !== "camera";
  photo.hidden = kind !== "photo";
  fruitEl("fruit-guide").classList.toggle("is-empty", !kind);
  syncFruitButtons(ui);
}

/** El paso de captura está a la vista (para pegar o soltar una foto). */
function fruitCaptureOpen(ui) {
  const capture = fruitEl("fruit-capture");
  return Boolean(capture && !capture.hidden && !ui.busy);
}

function stopFruitCamera(ui) {
  if (ui.stream) ui.stream.getTracks().forEach(track => track.stop());
  ui.stream = null;
  const video = fruitEl("fruit-video");
  if (video) video.srcObject = null;
}

function clearFruitPhoto(ui) {
  if (ui.photoUrl) URL.revokeObjectURL(ui.photoUrl);
  ui.photoUrl = null;
  const photo = fruitEl("fruit-photo");
  if (photo) photo.removeAttribute("src");
}

async function startFruitCamera(ui) {
  if (!window.isSecureContext || !navigator.mediaDevices) {
    setFruitStatus("La cámara solo abre si la app se abre desde https:// (o localhost). Mientras tanto, sube una foto.", "warn");
    return;
  }
  stopFruitCamera(ui);
  setFruitStatus("");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: ui.facing }, audio: false });
    if (!router.ui.alive || router.ui !== ui) { stream.getTracks().forEach(track => track.stop()); return; }
    ui.stream = stream;
    clearFruitPhoto(ui);
    const video = fruitEl("fruit-video");
    video.srcObject = stream;
    await video.play().catch(() => {});
    showFruitSource(ui, "camera");
  } catch (error) {
    const denied = error && (error.name === "NotAllowedError" || error.name === "SecurityError");
    setFruitStatus(denied
      ? "No diste permiso para usar la cámara. Actívalo en el navegador o sube una foto."
      : "No se encontró una cámara disponible. Sube una foto de la fruta.", "warn");
    showFruitSource(ui, null);
  }
}

function loadFruitFile(ui, file) {
  if (!file || !file.type.startsWith("image/")) {
    setFruitStatus("Ese archivo no es una imagen. Elige una foto de la fruta.", "warn");
    return;
  }
  stopFruitCamera(ui);
  clearFruitPhoto(ui);
  ui.photoUrl = URL.createObjectURL(file);
  const photo = fruitEl("fruit-photo");
  photo.onload = () => scanFruit(ui);
  photo.onerror = () => setFruitStatus("No se pudo abrir la foto. Prueba con otra.", "warn");
  photo.src = ui.photoUrl;
  setFruitStatus("");
  showFruitSource(ui, "photo");
}

/** Toma la imagen del visor (cuadro de la cámara o foto) y la identifica. */
async function scanFruit(ui) {
  if (ui.busy) return;
  let source;
  if (ui.stream) {
    const video = fruitEl("fruit-video");
    if (!video.videoWidth) { setFruitStatus("La cámara aún está encendiéndose. Espera un segundo.", "warn"); return; }
    source = document.createElement("canvas");
    source.width = video.videoWidth;
    source.height = video.videoHeight;
    source.getContext("2d").drawImage(video, 0, 0);
  } else if (ui.photoUrl) {
    source = fruitEl("fruit-photo");
  } else {
    setFruitStatus("Primero enciende la cámara o sube una foto.", "warn");
    return;
  }

  ui.busy = true;
  const custom = storedSetting(FRUIT_AI.CUSTOM_MODEL_KEY);
  const firstTime = custom ? !fruitModels.custom : !fruitModels.general;
  setFruitStatus("");
  setFruitBusy(firstTime ? "Preparando el reconocedor (solo la primera vez)…" : "Mirando la fruta…");
  try {
    const result = await identifyFruit(source);
    if (router.ui !== ui || !ui.alive) return;
    if (!result.noFruit && !state.premium) {
      ui.usedTrial = true;
      useScannerTrial();
    }
    ui.result = result;
    paintFruitResult(ui);
  } catch (error) {
    console.error("Identificador de fruta:", error);
    if (router.ui === ui) {
      setFruitStatus(custom
        ? "No se pudo usar tu modelo propio. Revisa el enlace en «Mejorar el reconocimiento» o quítalo."
        : "No se pudo cargar el reconocedor. Revisa tu conexión a internet e inténtalo de nuevo.", "error");
    }
  } finally {
    ui.busy = false;
    if (router.ui === ui) setFruitBusy("");
  }
}

function paintFruitResult(ui) {
  const result = fruitEl("fruit-result");
  if (!result) return;
  result.innerHTML = FruitResult(ui.result, ui);
  fruitEl("fruit-capture").hidden = true;
  result.hidden = false;
  if (ui.stream) fruitEl("fruit-video").pause();
  const body = fruitEl("fruit-body");
  if (body) body.scrollTop = 0;
}

// ── Piezas de HTML ───────────────────────────────────────────────────────────

function FruitResult(result, ui) {
  const tech = storedSetting(FRUIT_AI.TECH_MODE_KEY) === "1";
  const trialNote = ui.usedTrial
    ? `<p class="fruit-note fruit-note--trial">${Icon("gift", { size: 14 })}<span>Esta fue tu prueba gratis. Con Premium escaneas todas las frutas que quieras.</span></p>`
    : "";

  if (result.noFruit) {
    return `
      <div class="fruit-card fruit-card--empty slide-up">
        <span class="fruit-card__emoji" aria-hidden="true">🔍</span>
        <p class="fruit-card__name">No parece una fruta</p>
        <p class="fruit-card__text">Acércate más, deja una sola fruta en el cuadro y ponla sobre un fondo liso.</p>
      </div>
      ${FruitResultButtons()}
      ${tech ? FruitTech(result.tech) : ""}`;
  }

  return `
    <div class="fruit-card slide-up">
      <span class="fruit-card__emoji" aria-hidden="true">${result.emoji}</span>
      <p class="fruit-card__name">${esc(result.name)}</p>
      ${result.alternative ? `<p class="fruit-card__alt">también podría ser ${esc(result.alternative)}</p>` : ""}
      <div class="fruit-verdict fruit-verdict--${result.level}">
        <p class="fruit-verdict__title">${Icon(FRUIT_LEVEL_ICON[result.level], { size: 18, stroke: 2.6 })}${FRESHNESS_TEXT[result.level]}</p>
        <p class="fruit-verdict__reason">${esc(result.reason)}</p>
      </div>
      ${result.colorNote ? `<p class="fruit-note">${Icon("info", { size: 14 })}<span>El estado se calculó por el color de la cáscara, no con un modelo entrenado. Acierta mejor con plátano, manzana, fresa y cítricos.</span></p>` : ""}
      ${result.tech.color && result.tech.color.fallback ? `<p class="fruit-note">${Icon("info", { size: 14 })}<span>No pude separar la fruta del fondo y miré solo el centro de la foto. Con un fondo liso sale mejor.</span></p>` : ""}
    </div>
    ${trialNote}
    ${FruitResultButtons()}
    ${tech ? FruitTech(result.tech) : ""}`;
}

function FruitResultButtons() {
  return `
    <div class="fruit-result-actions">
      <button class="btn btn--primary btn--lg btn--block" data-action="scanAgain">${Icon("scan", { size: 20 })} Escanear otra fruta</button>
      <button class="btn btn--muted btn--lg btn--block" data-action="goHome">${Icon("home", { size: 20 })} Volver al inicio</button>
    </div>`;
}

/** Detalle para el modo técnico (apagado por omisión). */
function FruitTech(tech) {
  const pct = value => `${(value * 100).toFixed(1)} %`;
  const color = tech.color || {};
  const rows = [
    ["Modelo", tech.model],
    tech.fruitMass != null ? ["Probabilidad total de fruta", pct(tech.fruitMass)] : null,
    ["Manchas oscuras", `${(color.dark ?? 0).toFixed(1)} %`],
    ["Tono marrón", `${(color.brown ?? 0).toFixed(1)} %`],
    ["Cáscara despareja", `${(color.uneven ?? 0).toFixed(1)} %`],
    ["Color vivo", `${(color.vivid ?? 0).toFixed(1)} %`],
    ["Fruta separada del fondo", color.fallback ? "no (elipse central)" : `sí (${(color.coverage ?? 0).toFixed(0)} % de la foto)`],
    tech.freshness ? ["Puntaje de estado por color", `${Math.round(tech.freshness.score)} / 100`] : null,
  ].filter(Boolean);
  const candidates = (tech.candidates || []).map(c => c.label != null
    ? `<li><span>${esc(c.label)}</span><strong>${pct(c.prob)}</strong></li>`
    : `<li><span>${c.emoji} ${esc(c.name)}</span><strong>${pct(c.share)}</strong><small>modelo ${pct(c.modelProb)} · color ${(c.colorSim * 100).toFixed(0)}</small></li>`).join("");
  return `
    <div class="fruit-tech">
      <p class="fruit-tech__title">${Icon("settings", { size: 14 })} Modo técnico</p>
      ${candidates ? `<ol class="fruit-tech__list">${candidates}</ol>` : ""}
      <dl class="fruit-tech__grid">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(String(v))}</dd>`).join("")}</dl>
    </div>`;
}

function FruitLocked() {
  return `
    <div class="fruit-locked slide-up">
      <span class="fruit-locked__icon">${Icon("lock", { size: 28 })}</span>
      <p class="fruit-locked__title">Ya usaste tu prueba gratis</p>
      <p class="fruit-locked__text">Con Ca$erIA Premium (S/ 9.90 al mes) puedes revisar todas las frutas que quieras antes de comprarlas.</p>
      <button class="btn btn--primary btn--lg btn--block" data-action="goProfile">Ver Premium</button>
      <button class="btn btn--link-muted" data-action="goHome">Volver al inicio</button>
    </div>`;
}

function FruitCustomModel() {
  const url = storedSetting(FRUIT_AI.CUSTOM_MODEL_KEY);
  return `
    <details class="fruit-more"${url ? " open" : ""}>
      <summary>${Icon("sparkles", { size: 16 })} Mejorar el reconocimiento</summary>
      <div class="fruit-more__body">
        <p>El reconocedor de fábrica <strong>no conoce mandarina, palta, papaya, mango ni uva</strong>: una mandarina sale como «Naranja o mandarina». Para que las distinga, entrena gratis tu propio modelo:</p>
        <ol>
          <li>Entra a <a href="https://teachablemachine.withgoogle.com/train/image" target="_blank" rel="noopener">Teachable Machine</a> → Proyecto de imagen estándar.</li>
          <li>Crea una clase por fruta y estado: «mandarina buena», «mandarina malograda», «palta buena»…</li>
          <li>Sube de 80 a 150 fotos de celular por clase y pulsa Entrenar.</li>
          <li>Exportar modelo → TensorFlow.js → Subir, y pega aquí el enlace.</li>
        </ol>
        <label class="field fruit-more__field">
          <span class="field__icon">${Icon("external", { size: 18 })}</span>
          <input class="field__input" id="fruit-model-url" type="url" inputmode="url" placeholder="https://teachablemachine.withgoogle.com/models/…/" value="${esc(url)}" />
        </label>
        <div class="fruit-more__actions">
          <button class="btn btn--outline btn--sm btn--grow" data-action="saveModel">Guardar</button>
          ${url ? `<button class="btn btn--muted btn--sm btn--grow" data-action="removeModel">Quitar</button>` : ""}
        </div>
        <p class="fruit-more__state" id="fruit-model-state">${url ? "Usando tu modelo propio." : "Usando el reconocedor de fábrica."}</p>
        <label class="fruit-switch">
          <input type="checkbox" data-input="toggleTech"${storedSetting(FRUIT_AI.TECH_MODE_KEY) === "1" ? " checked" : ""} />
          <span class="fruit-switch__track"></span>
          <span>Modo técnico <small>(muestra porcentajes y mediciones)</small></span>
        </label>
      </div>
    </details>`;
}

defineScreen("scanner", {
  nav: true,
  ui: () => ({ facing: "environment", stream: null, photoUrl: null, busy: false, result: null, usedTrial: false, alive: true }),

  render(ui) {
    const locked = scannerLocked();
    const secure = window.isSecureContext && navigator.mediaDevices;
    return `
      <section class="screen">
        ${StatusBar()}
        <header class="topbar">
          ${BackButton("goHome")}
          <div class="topbar__text">
            <h1 class="topbar__title">Identificador de fruta</h1>
            <p class="topbar__subtitle">${state.premium ? "Premium · sin límite" : locked ? "Prueba gratis usada" : "Prueba gratis · 1 uso"}</p>
          </div>
          <span class="fruit-badge${state.premium ? " fruit-badge--premium" : ""}">${state.premium ? `${Icon("crown", { size: 12, stroke: 2.4 })} Premium` : `${Icon("gift", { size: 12, stroke: 2.4 })} Gratis`}</span>
        </header>
        <div class="screen__body fruit" id="fruit-body" data-scroll="fruit-body">
          ${locked ? FruitLocked() : `
          <div id="fruit-capture" class="fruit__step">
            <div class="fruit-viewport" id="fruit-drop">
              <video id="fruit-video" playsinline muted hidden></video>
              <img id="fruit-photo" alt="Foto de la fruta" hidden />
              <div class="fruit-viewport__guide is-empty" id="fruit-guide"><span>Pon una sola fruta aquí dentro</span></div>
              <div class="fruit-viewport__busy" id="fruit-busy" hidden>
                <span class="fruit-spinner"></span>
                <p id="fruit-busy-text"></p>
              </div>
            </div>
            <p class="fruit-status" id="fruit-status" hidden></p>
            <div class="fruit-actions">
              <button class="btn btn--primary btn--md" id="fruit-cam-btn" data-action="startCamera"${secure ? "" : " disabled"}>${Icon("camera", { size: 18 })} Encender cámara</button>
              <button class="btn btn--primary btn--md" id="fruit-scan-btn" data-action="scan" disabled>${Icon("scan", { size: 18 })} Escanear</button>
              <button class="btn btn--muted btn--md" id="fruit-flip-btn" data-action="flipCamera" hidden>${Icon("refresh", { size: 18 })} Voltear cámara</button>
              <label class="btn btn--muted btn--md fruit-upload">
                ${Icon("upload", { size: 18 })} Subir una foto
                <input type="file" accept="image/*" data-input="pickFile" />
              </label>
            </div>
            ${secure ? "" : `<p class="fruit-note fruit-note--warn">${Icon("alert", { size: 14 })}<span>La cámara solo abre si la app se abre desde https:// o localhost. Puedes subir una foto igual.</span></p>`}
            <p class="fruit-hint">También puedes arrastrar una foto aquí o pegarla. La foto no sale de tu celular.</p>
            ${FruitCustomModel()}
          </div>
          <div id="fruit-result" class="fruit__step" hidden></div>`}
        </div>
      </section>`;
  },

  enter(ui) {
    if (scannerLocked()) return () => { ui.alive = false; };

    const onPaste = event => {
      const item = [...(event.clipboardData?.items || [])].find(i => i.type.startsWith("image/"));
      if (!item || !fruitCaptureOpen(ui)) return;
      event.preventDefault();
      loadFruitFile(ui, item.getAsFile());
    };
    const onDragOver = event => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      fruitEl("fruit-drop")?.classList.add("is-drop");
    };
    const onDragLeave = event => {
      if (!event.relatedTarget) fruitEl("fruit-drop")?.classList.remove("is-drop");
    };
    const onDrop = event => {
      if (!event.dataTransfer?.files.length) return;
      event.preventDefault();
      fruitEl("fruit-drop")?.classList.remove("is-drop");
      if (fruitCaptureOpen(ui)) loadFruitFile(ui, event.dataTransfer.files[0]);
    };
    document.addEventListener("paste", onPaste);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("dragleave", onDragLeave);
    document.addEventListener("drop", onDrop);

    // Se adelanta la descarga del reconocedor mientras el usuario encuadra la fruta.
    if (!storedSetting(FRUIT_AI.CUSTOM_MODEL_KEY)) loadGeneralModel().catch(() => {});

    return () => {
      ui.alive = false;
      stopFruitCamera(ui);
      clearFruitPhoto(ui);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("dragleave", onDragLeave);
      document.removeEventListener("drop", onDrop);
    };
  },

  actions: {
    startCamera: ui => { startFruitCamera(ui); return false; },
    flipCamera: ui => {
      ui.facing = ui.facing === "environment" ? "user" : "environment";
      startFruitCamera(ui);
      return false;
    },
    scan: ui => { scanFruit(ui); return false; },
    pickFile: (ui, el) => {
      const file = el.files && el.files[0];
      el.value = "";
      if (file) loadFruitFile(ui, file);
      return false;
    },
    scanAgain: ui => {
      ui.result = null;
      if (scannerLocked()) {
        stopFruitCamera(ui);
        clearFruitPhoto(ui);
        render();
        return false;
      }
      clearFruitPhoto(ui);
      fruitEl("fruit-result").hidden = true;
      fruitEl("fruit-result").innerHTML = "";
      fruitEl("fruit-capture").hidden = false;
      setFruitStatus("");
      if (ui.stream) {
        fruitEl("fruit-video").play().catch(() => {});
        showFruitSource(ui, "camera");
      } else {
        showFruitSource(ui, null);
      }
      return false;
    },
    saveModel: ui => {
      const input = fruitEl("fruit-model-url");
      const url = input.value.trim();
      const stateEl = fruitEl("fruit-model-state");
      if (!/^https:\/\/\S+$/.test(url)) {
        stateEl.textContent = "Pega el enlace completo que te dio Teachable Machine (empieza con https://).";
        return false;
      }
      stateEl.textContent = "Probando tu modelo…";
      loadCustomModel(url).then(() => {
        saveSetting(FRUIT_AI.CUSTOM_MODEL_KEY, url);
        if (router.ui !== ui) return;
        stopFruitCamera(ui);
        clearFruitPhoto(ui);
        render();
      }).catch(error => {
        console.error("Modelo propio:", error);
        if (router.ui === ui && fruitEl("fruit-model-state")) {
          fruitEl("fruit-model-state").textContent = "No se pudo abrir ese modelo. Revisa que el enlace termine en /models/…/ y que tengas internet.";
        }
      });
      return false;
    },
    removeModel: ui => {
      saveSetting(FRUIT_AI.CUSTOM_MODEL_KEY, "");
      fruitModels.custom = null;
      fruitModels.customUrl = null;
      stopFruitCamera(ui);
      clearFruitPhoto(ui);
      render();
      return false;
    },
    toggleTech: (ui, el) => {
      saveSetting(FRUIT_AI.TECH_MODE_KEY, el.checked ? "1" : "");
      return false;
    },
    goHome: () => navigate("home"),
    goProfile: () => navigate("buyerprofile"),
  },
});
