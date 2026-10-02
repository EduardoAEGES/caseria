// Permiso de ubicación y zona de comparación (solo Paucarpata).

defineScreen("permission", {
  ui: () => ({ granted: false }),

  render: ui => `
    <section class="screen">
      ${StatusBar()}
      <div class="screen__body welcome-body" data-scroll="permission">
        <header class="perm__hero">
          <div class="perm__map">🗺️<span class="perm__pin">📍</span></div>
          <h1 class="perm__title">Encuentra las mejores opciones cerca de ti</h1>
        </header>

        <div class="card card--pad">
          <div class="perm__ask">
            <span class="perm__ask-icon">📍</span>
            <p><strong>Ca$erIA</strong> necesita tu ubicación para calcular rutas a los establecimientos más cercanos.</p>
          </div>
          <div class="perm__buttons">
            <button class="btn btn--sm btn--grow btn--outline${ui.granted ? " is-on" : ""}" data-action="grant">${ui.granted ? "✓ Permitido" : "Permitir Ubicación"}</button>
            <button class="btn btn--sm btn--grow btn--quiet">Omitir</button>
          </div>
        </div>

        <div class="card card--pad">
          <p class="card__label">Zona de comparación activa</p>
          <div class="zone-option">
            <span class="radio"></span>
            <span>📍</span>
            <div>
              <p class="zone-option__name">Paucarpata, Arequipa</p>
              <p class="zone-option__stores">Tottus · Plaza Vea · Franco · Tiendas Mass</p>
            </div>
          </div>
        </div>

        <div class="note note--blue-deep">
          <span class="note__icon">ℹ️</span>
          <p><strong>Paucarpata</strong> es el distrito de validación actual de Ca$erIA. Próximamente ampliaremos cobertura a otros distritos de Arequipa.</p>
        </div>

        <button class="btn btn--primary btn--lg btn--block" data-action="next">Guardar y Continuar →</button>
      </div>
    </section>`,

  actions: {
    grant: ui => { ui.granted = true; },
    next: () => navigate("register"),
  },
});
