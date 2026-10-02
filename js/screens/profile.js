// Perfil del comprador: ahorro, plan Premium y funciones con IA.

const PREMIUM_BENEFITS = [
  "✓ Asistente nutricional con IA",
  "✓ Escáner de alimentos ilimitado",
  "✓ Canastas personalizadas",
  "✓ Comparación de precios ilimitada",
  "✓ Alertas de precios y promociones",
  "✓ Historial y análisis de gastos",
];

const PROFILE_MENU = ["📍 Establecimientos Preferidos", "🔔 Notificaciones", "❓ Centro de Ayuda", "🚪 Cerrar Sesión"];

function AiFeatureCard({ emoji, title, desc, locked, canTry }) {
  return `
    <div class="card card--pad ai-feature">
      <div class="icon-box icon-box--lg icon-box--blue">${emoji}</div>
      <div class="ai-feature__body">
        <div class="ai-feature__head">
          <p class="ai-feature__title">${title}</p>
          ${locked
            ? `<span class="pill pill--gray pill--bold">🔒 Premium</span>`
            : state.premium
              ? `<span class="pill pill--super pill--bold">⭐ Ilimitado</span>`
              : `<span class="pill pill--green pill--bold">🎁 1 Prueba Gratis</span>`}
        </div>
        <p class="ai-feature__desc">${desc}</p>
        ${canTry ? `<button class="link-btn" data-action="go" data-to="scanner">Usar prueba gratis →</button>` : state.premium && title.includes("Escáner") ? `<button class="link-btn" data-action="go" data-to="scanner">Abrir escáner →</button>` : ""}
      </div>
    </div>`;
}

defineScreen("buyerprofile", {
  nav: true,

  render() {
    const features = [
      { emoji: "📷", title: "Escáner IA de Frescura", desc: "Analiza calidad y vida útil de tus compras.", locked: !state.premium && state.trialUsed, canTry: !state.premium && !state.trialUsed },
      { emoji: "🥗", title: "IA Nutricional + Especialistas", desc: "Planes de salud y citas con nutricionistas.", locked: !state.premium, canTry: false },
    ];

    return `
      <section class="screen">
        ${StatusBar()}
        <header class="topbar topbar--between">
          <h1 class="topbar__title">Mi Perfil</h1>
          <button class="topbar__icon" aria-label="Ajustes">⚙️</button>
        </header>

        <div class="screen__body" data-scroll="profile">
          <div class="profile-head">
            <div class="avatar avatar--lg">${esc((state.userName[0] || "M").toUpperCase())}</div>
            <div>
              <p class="profile-head__name">${esc(state.userName)}</p>
              <p class="profile-head__email">${state.userEmail ? esc(state.userEmail) : "sin correo registrado"}</p>
              <p class="profile-head__zone">📍 ${getDistrict().label}, Arequipa</p>
            </div>
          </div>

          <div class="impact-card">
            <p class="impact-card__label">🎉 Tu impacto en Ca$erIA</p>
            <p class="impact-card__amount">S/ 142.50 <span>ahorrado</span></p>
            <div class="impact-card__progress">
              <div class="impact-card__track"><div class="impact-card__fill"></div></div>
              <span class="impact-card__level">Ahorrador Experto</span>
            </div>
          </div>

          <div class="premium-card">
            <div class="premium-card__head">
              <div class="premium-card__title"><span>⭐</span><p>Ca$erIA Premium</p></div>
              ${state.premium ? '<div class="premium-card__price"><p>Activo</p></div>' : '<div class="premium-card__price"><p>S/ 9.90</p><span>/mes</span></div>'}
            </div>
            ${each(PREMIUM_BENEFITS, b => `<p class="premium-card__benefit">${b}</p>`)}
            ${!state.premium ? '<button class="btn btn--primary btn--md btn--block premium-card__cta">Obtener Premium</button>' : '<p class="premium-card__benefit" style="text-align:center; font-weight:bold; color:var(--blue); margin-top:12px;">¡Gracias por tu suscripción!</p>'}
          </div>

          <div>
            <p class="profile__section-label">✨ Funciones con IA</p>
            <div class="ai-features">${each(features, AiFeatureCard)}</div>
          </div>

          <div class="card card--clip">
            ${each(PROFILE_MENU, item => {
              const logout = item.includes("Cerrar");
              return `<button class="menu-item${logout ? " menu-item--danger" : ""}"${logout ? ` data-action="logout"` : ""}>${item}${logout ? "" : `<span class="menu-item__chevron">›</span>`}</button>`;
            })}
          </div>
        </div>
      </section>`;
  },

  actions: {
    // La cuenta queda guardada; se vuelve al selector de modo.
    logout: () => navigate("mode"),
  },
});
