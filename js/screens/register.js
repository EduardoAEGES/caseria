// Último paso del registro: confirmar el tipo de usuario.

defineScreen("register", {
  render: () => `
    <section class="screen">
      ${StatusBar()}
      <div class="register">
        <div>
          <p class="register__eyebrow">Último paso</p>
          <h1 class="register__title">Configura tu<br>experiencia</h1>
        </div>

        <p class="register__lead">
          Ca$erIA está diseñada para ayudarte a armar tu canasta por categorías y comparar opciones de compra en Paucarpata.
        </p>

        <div class="register__options">
          <div class="role-card">
            <div class="role-card__icon">🛒</div>
            <div class="role-card__text">
              <div class="role-card__head">
                <span class="role-card__name">Soy comprador</span>
                ${Check(true, "check--sm")}
              </div>
              <p class="role-card__desc">Quiero comparar opciones, organizar mi compra y ahorrar.</p>
            </div>
          </div>

          <div class="note note--blue">
            <span class="note__icon">${Icon("map-pin", { size: 18 })}</span>
            <div>
              <p class="note__title">Zona de comparación: Paucarpata</p>
              <p>Compara entre Tottus Porongoche, Plaza Vea, Franco Supermercados y Tiendas Mass.</p>
            </div>
          </div>
        </div>

        <button class="btn btn--primary btn--xl btn--block" data-action="next">Continuar${Icon("chevron-right", { size: 20, stroke: 2.4 })}</button>
      </div>
    </section>`,

  actions: {
    next: () => {
      completeRegistration();
      navigate("home");
    },
  },
});
