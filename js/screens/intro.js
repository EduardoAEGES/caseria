// Pantalla de presentación: se muestra siempre al abrir la app.
// La primera vez sigue al tutorial y registro; si ya hay cuenta, va directo al inicio.

defineScreen("intro", {
  ui: () => ({ dot: 0 }),

  render: ui => `
    <section class="screen screen--white intro">
      <div></div>
      <div class="intro__center">
        <div class="intro__logo"><img src="img/logo.png" alt="Ca$erIA logo"></div>
        <div class="intro__brand">
          <p class="wordmark intro__wordmark"><span>Ca</span><span class="wordmark__dollar">$</span><span>erIA</span></p>
          <p class="intro__tagline">Haz rendir tu dinero.</p>
        </div>
        <div class="intro__emojis">${each(["🛒", "🥬", "🏪", "💰", "🍗"], e => `<span>${e}</span>`)}</div>
      </div>
      <div class="intro__dots">
        ${each([0, 1, 2], i => `<span class="intro__dot${i === ui.dot ? " is-active" : ""}"></span>`)}
      </div>
    </section>`,

  enter(ui) {
    // Se cambia la clase a mano (sin redibujar) para que se vea la transición.
    const dots = document.querySelectorAll(".intro__dot");
    const dotTimer = setInterval(() => {
      ui.dot = (ui.dot + 1) % 3;
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === ui.dot));
    }, 500);
    const nextTimer = setTimeout(() => navigate(state.registered ? "home" : "onboarding1"), 2400);

    return () => {
      clearInterval(dotTimer);
      clearTimeout(nextTimer);
    };
  },
});
