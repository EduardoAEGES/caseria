// Selector del modo de simulación (solo para la demo): primera vez, usuario Free o usuario Premium.

const ACCESS_MODES = [
  {
    action: "firstTime", icon: "sparkles", tone: "blue", title: "Primera vez",
    desc: () => "Como recién instalada: presentación, tutorial y registro con nombre y correo.",
  },
  {
    action: "free", icon: "user", tone: "green", title: "Usuario Free", plan: "Gratis",
    desc: ui => ui.account
      ? `Entra directo al inicio como <strong>${esc(ui.account.name)}</strong>, con el plan gratuito.`
      : "Entra directo al inicio con el usuario de prueba Mateo y el plan gratuito.",
  },
  {
    action: "premium", icon: "crown", tone: "gold", title: "Usuario Premium", plan: "Premium",
    desc: () => "Cuenta de prueba con todas las funciones: escáner IA ilimitado, nutrición y alertas.",
  },
];

defineScreen("mode", {
  ui: () => ({ account: loadAccount() }),

  render: ui => `
    <section class="screen screen--white">
      ${StatusBar()}
      <div class="screen__body mode" data-scroll="mode">
        <header class="mode__header">
          <div class="mode__logo"><img src="img/logo.png" alt="Logo de Ca$erIA"></div>
          <p class="mode__eyebrow">Modo de acceso</p>
          <h1 class="mode__title">¿Cómo quieres entrar a <span class="wordmark">${Wordmark()}</span>?</h1>
          <p class="mode__lead">Elige el tipo de usuario para recorrer la demo.</p>
        </header>

        ${each(ACCESS_MODES, (m, i) => `
          <button class="mode-card mode-card--${m.tone}" data-action="${m.action}">
            <span class="mode-card__icon">${Icon(m.icon, { size: 24 })}</span>
            <div class="mode-card__text">
              <div class="mode-card__head">
                <p class="mode-card__title">${m.title}</p>
                ${m.plan ? `<span class="mode-card__plan">${m.plan}</span>` : ""}
              </div>
              <p class="mode-card__desc">${m.desc(ui)}</p>
            </div>
            <span class="mode-card__arrow">${Icon("chevron-right", { size: 20 })}</span>
          </button>`)}

        ${ui.account ? `
          <div class="mode__saved">
            <p>Cuenta guardada en este dispositivo: <strong>${esc(ui.account.name)}</strong>${ui.account.email ? ` · ${esc(ui.account.email)}` : ""}</p>
            <button class="link-btn" data-action="forget">Borrar</button>
          </div>` : ""}

        <p class="mode__hint">Este selector existe solo para la demo. Una app real sabría sola si ya te registraste y qué plan tienes.</p>
      </div>
    </section>`,

  actions: {
    firstTime: () => {
      startFirstTime();
      navigate("intro");
    },
    free: () => {
      startFree();
      navigate("intro");
    },
    premium: () => {
      startPremium();
      navigate("intro");
    },
    forget: ui => {
      clearAccount();
      ui.account = null;
    },
  },
});
