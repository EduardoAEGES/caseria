// Registro: nombre, correo y aceptación de términos.

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function canStart(ui) {
  return ui.terms && ui.name.trim().length > 0 && isValidEmail(ui.email);
}

defineScreen("splash", {
  ui: () => ({ name: "", email: "", terms: false }),

  render: ui => `
    <section class="screen screen--white">
      ${StatusBar()}
      <div class="screen__body splash" data-scroll="splash">
        <header class="splash__brand">
          <div class="splash__brand-row">
            <div class="splash__cart">🛒</div>
            <span class="wordmark splash__wordmark">${Wordmark()}</span>
          </div>
          <p class="splash__slogan">Más que una APP, tu compañero de bolsillo</p>
        </header>

        <div class="splash__logo"><img src="img/logo.png" alt="Ca$erIA logo"></div>

        <div class="splash__about">
          <p class="splash__about-title">¿Qué hace Ca$erIA?</p>
          <p>Arma tu canasta por categorías y <strong>compara opciones de compra</strong> en supermercados y tiendas de Paucarpata.</p>
        </div>

        <div class="splash__fields">
          <label class="field">
            <span class="field__icon">👤</span>
            <input id="splash-name" class="field__input field__input--strong" data-input="setName" placeholder="Tu Nombre" value="${esc(ui.name)}">
          </label>
          <label class="field">
            <span class="field__icon">✉️</span>
            <input id="splash-email" class="field__input" type="email" data-input="setEmail" placeholder="Tu Correo Electrónico" value="${esc(ui.email)}">
          </label>
        </div>

        <div class="splash__terms-group">
          <button class="splash__terms" data-action="toggleTerms">
            ${Check(ui.terms, "check--sm check--square splash__checkbox")}
            <p>Acepto los <span class="splash__link">Términos y Condiciones</span> y la <span class="splash__link">Política de Privacidad</span> (Protección de Datos Ley N° 29733).</p>
          </button>
          <button class="splash__terms-more">Ver términos sobre precios referenciales e IA.</button>
        </div>

        <div class="splash__actions">
          <button id="splash-start" class="btn btn--primary btn--xl btn--block" data-action="start"${canStart(ui) ? "" : " disabled"}>Empezar 🚀</button>
          <button class="btn btn--link" data-action="login">Ya tengo cuenta</button>
        </div>
      </div>
    </section>`,

  actions: {
    // Al escribir no se redibuja: solo se activa/desactiva el botón.
    setName: (ui, el) => {
      ui.name = el.value;
      document.getElementById("splash-start").disabled = !canStart(ui);
      return false;
    },
    setEmail: (ui, el) => {
      ui.email = el.value;
      document.getElementById("splash-start").disabled = !canStart(ui);
      return false;
    },
    toggleTerms: ui => { ui.terms = !ui.terms; },
    start: ui => {
      state.userName = ui.name.trim() || "Mateo";
      state.userEmail = ui.email.trim();
      navigate("permission");
    },
    login: () => {
      startReturning();
      navigate("home");
    },
  },
});
