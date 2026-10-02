// Selector del modo de simulación (solo para la demo): primera instalación o usuario registrado.

defineScreen("mode", {
  ui: () => ({ account: loadAccount() }),

  render: ui => `
    <section class="screen screen--white">
      ${StatusBar()}
      <div class="screen__body mode" data-scroll="mode">
        <header class="mode__header">
          <div class="mode__logo"><img src="img/logo.png" alt="Ca$erIA logo"></div>
          <p class="mode__eyebrow">Modo de simulación</p>
          <h1 class="mode__title">¿Cómo quieres abrir <span class="wordmark">${Wordmark()}</span>?</h1>
          <p class="mode__lead">Prueba la app como alguien que la acaba de instalar o como un usuario que ya tiene cuenta.</p>
        </header>

        <button class="mode-card" data-action="firstTime">
          <span class="mode-card__icon">✨</span>
          <div class="mode-card__text">
            <p class="mode-card__title">Primera vez</p>
            <p class="mode-card__desc">Como recién instalada: presentación, tutorial y registro con nombre y correo.</p>
          </div>
          <span class="mode-card__arrow">›</span>
        </button>

        <button class="mode-card mode-card--returning" data-action="returning">
          <span class="mode-card__icon">👤</span>
          <div class="mode-card__text">
            <p class="mode-card__title">Ya tengo cuenta</p>
            <p class="mode-card__desc">${ui.account
              ? `Entra directo al inicio como <strong>${esc(ui.account.name)}</strong>.`
              : "Entra directo al inicio con un usuario de prueba (Mateo)."}</p>
          </div>
          <span class="mode-card__arrow">›</span>
        </button>

        <button class="mode-card mode-card--returning" data-action="premium">
          <span class="mode-card__icon">⭐</span>
          <div class="mode-card__text">
            <p class="mode-card__title">Ya tengo cuenta (Premium)</p>
            <p class="mode-card__desc">Entra con una cuenta Premium de prueba para evaluar las funciones exclusivas y escáner IA sin límites.</p>
          </div>
          <span class="mode-card__arrow">›</span>
        </button>

        ${ui.account ? `
          <div class="mode__saved">
            <p>💾 Cuenta guardada en este dispositivo: <strong>${esc(ui.account.name)}</strong>${ui.account.email ? ` · ${esc(ui.account.email)}` : ""}</p>
            <button class="link-btn" data-action="forget">Borrar</button>
          </div>` : ""}

        <p class="mode__hint">Este selector existe solo para la demo. Una app real decidiría sola si mostrar el registro según si ya te registraste.</p>
      </div>
    </section>`,

  actions: {
    firstTime: () => {
      startFirstTime();
      navigate("intro");
    },
    returning: () => {
      startReturning();
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
