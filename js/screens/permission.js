// Permiso de ubicación y zona de comparación (solo Paucarpata).

defineScreen("permission", {
  ui: () => ({ granted: false }),

  render: ui => `
    <section class="screen">
      ${StatusBar()}
      <div class="screen__body welcome-body" data-scroll="permission">
        <header class="perm__hero">
          <div class="perm__map">${Icon("map", { size: 44, stroke: 1.6 })}<span class="perm__pin">${Icon("map-pin", { size: 22 })}</span></div>
          <h1 class="perm__title">Encuentra las mejores opciones cerca de ti</h1>
        </header>

        <div class="card card--pad">
          <div class="perm__ask">
            <span class="perm__ask-icon">${Icon("map-pin", { size: 22 })}</span>
            <p><strong>Ca$erIA</strong> necesita tu ubicación para calcular rutas a los establecimientos más cercanos.</p>
          </div>
          <div class="perm__buttons">
            <button class="btn btn--sm btn--grow btn--outline${ui.granted ? " is-on" : ""}" data-action="grant">${ui.granted ? `${Icon("check", { size: 16, stroke: 3 })}Permitido` : "Permitir ubicación"}</button>
            <button class="btn btn--sm btn--grow btn--quiet">Omitir</button>
          </div>
        </div>

        <div class="card card--pad">
          <p class="card__label">Zona de comparación activa</p>
          <div class="zone-option">
            <span class="radio"></span>
            ${Icon("map-pin", { size: 18 })}
            <div>
              <p class="zone-option__name">Paucarpata, Arequipa</p>
              <p class="zone-option__stores">Tottus · Plaza Vea · Franco · Tiendas Mass</p>
            </div>
          </div>
        </div>

        <div class="note note--blue-deep">
          <span class="note__icon">${Icon("info", { size: 18 })}</span>
          <p><strong>Paucarpata</strong> es el distrito de validación actual de Ca$erIA. Próximamente ampliaremos cobertura a otros distritos de Arequipa.</p>
        </div>

        <button class="btn btn--primary btn--lg btn--block" data-action="next">Guardar y continuar${Icon("chevron-right", { size: 20, stroke: 2.4 })}</button>
      </div>
    </section>`,

  actions: {
    grant: ui => { ui.granted = true; },
    next: () => navigate("register"),
  },
});
