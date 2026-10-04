// Animación de "radar" mientras se arma la comparación.

const LOADING_STEPS = [
  "Consultando precios en Mass, Tambo y OXXO...",
  "Comparando con Metro, Makro, Tottus y Plaza Vea...",
  "Calculando la mejor oferta para tu canasta...",
];

function LoadingSteps(step) {
  return each(LOADING_STEPS, (text, i) => {
    const status = i < step ? "done" : i === step ? "current" : "pending";
    const bullet = { done: Icon("check", { size: 12, stroke: 3 }), current: Icon("clock", { size: 12, stroke: 2.6 }), pending: "" }[status];
    return `
      <div class="loading-step${i < step ? " is-done" : ""}">
        <span class="loading-step__bullet loading-step__bullet--${status}">${bullet}</span>
        <p class="loading-step__text">${text}</p>
      </div>`;
  });
}

defineScreen("loading", {
  nav: true,
  ui: () => ({ step: 0 }),

  render: ui => `
    <section class="screen screen--dark loading">
      <div class="loading__brand">
        <div class="loading__cart">🛒</div>
        <span class="wordmark loading__wordmark">${Wordmark()}</span>
      </div>

      <div class="radar">
        <div class="radar__ring radar-ring"></div>
        <div class="radar__ring radar-ring-2"></div>
        <div class="radar__ring radar-ring-3"></div>
        <div class="radar__circle radar__circle--outer"></div>
        <div class="radar__circle radar__circle--inner"></div>
        <div class="radar__core">${Icon("bot", { size: 30 })}</div>
        <span class="radar__blip radar__blip--orange"></span>
        <span class="radar__blip radar__blip--green"></span>
      </div>

      <div class="loading__status">
        <h2 class="loading__title">Analizando opciones en ${getDistrict().label}...</h2>
        <div id="loading-steps" class="loading__steps">${LoadingSteps(ui.step)}</div>
        <div class="typing-dots"><span class="pulse-1"></span><span class="pulse-2"></span><span class="pulse-3"></span></div>
      </div>
    </section>`,

  enter(ui) {
    // Solo se redibuja la lista de pasos, así el radar no reinicia su animación.
    const setStep = step => {
      ui.step = step;
      document.getElementById("loading-steps").innerHTML = LoadingSteps(step);
    };
    const timers = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 2600),
      setTimeout(() => setStep(3), 4000),
      setTimeout(() => navigate("results"), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  },
});
