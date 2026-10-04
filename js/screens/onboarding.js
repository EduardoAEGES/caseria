// Onboarding de 3 pasos con ilustraciones hechas solo con CSS.

const ONBOARDING_STEPS = {
  1: { title: "Compara y ahorra", description: "Compara precios entre supermercados y tiendas de Paucarpata y descubre dónde te conviene comprar.", action: "Siguiente" },
  2: { title: "Arma tu canasta por categorías", description: "Elige carnes, verduras, abarrotes y más. Ca$erIA busca tu combinación en cada tienda y te muestra la mejor oferta.", action: "Siguiente" },
  3: { title: "Compra de forma más inteligente", description: "Usa el escáner con IA para reconocer alimentos, agregarlos a tu canasta y encontrar mejores opciones de compra.", action: "Empezar ahora" },
};

function OnboardingCard(side, store, emoji, price) {
  return `
    <div class="ob-card ob-card--${side}">
      <div class="ob-card__head"><span class="ob-card__store">${store}</span><span>${emoji}</span></div>
      <div class="ob-card__bar ob-card__bar--short"></div>
      <div class="ob-card__bar ob-card__bar--long"></div>
      <div class="ob-card__foot">
        <p class="ob-card__label">Tu canasta</p>
        <p class="ob-card__price">${price}</p>
      </div>
    </div>`;
}

function OnboardingArt(step) {
  if (step === 1) {
    return `
      <div class="ob-art" aria-hidden="true">
        ${OnboardingCard("back", "TIENDA MASS", "🏷️", "S/ 76.50")}
        ${OnboardingCard("front", "TOTTUS", "🛒", "S/ 94.00")}
        <div class="ob-cart">🛒</div>
        <div class="ob-link ob-link--left"></div>
        <div class="ob-link ob-link--right"></div>
        <div class="ob-savings">AHORRAS S/ 17.50</div>
      </div>`;
  }

  if (step === 2) {
    return `
      <div class="ob-art" aria-hidden="true">
        <div class="ob-cats">${each(["🥩 Carnes", "🥬 Verduras", "🍚 Abarrotes"], c => `<span class="ob-cats__chip">${c}</span>`)}</div>
        <div class="ob-tile ob-tile--top">🥚</div>
        <div class="ob-tile ob-tile--left">🥬</div>
        <div class="ob-tile ob-tile--right">🍗</div>
        <div class="ob-basket">🛒</div>
        <div class="ob-best">Mejor oferta: Franco · S/ 41.20</div>
      </div>`;
  }

  return `
    <div class="ob-art" aria-hidden="true">
      <div class="ob-phone">
        <div class="ob-phone__screen">
          <div class="ob-phone__frame">
            <span class="ob-phone__emoji">🍅</span>
            <span class="ob-phone__tag">TOMATE DETECTADO</span>
          </div>
        </div>
      </div>
      <div class="ob-spark ob-spark--left">✦</div>
      <div class="ob-spark ob-spark--right">⌁</div>
      <div class="ob-added">
        <span class="ob-added__emoji">🛒</span>
        <div>
          <p class="ob-added__label">AGREGADO A TU CANASTA</p>
          <p class="ob-added__item">Tomate · 1 kg</p>
        </div>
        <span class="ob-added__check">${Icon("check", { size: 16, stroke: 3 })}</span>
      </div>
      <div class="ob-connector"></div>
    </div>`;
}

function OnboardingView(step) {
  const content = ONBOARDING_STEPS[step];
  return `
    <section class="screen onboarding onboarding-enter">
      ${StatusBar(true)}
      <div class="onboarding__body">
        <div class="onboarding__glow onboarding__glow--left"></div>
        <div class="onboarding__glow onboarding__glow--right"></div>
        <div class="onboarding__top"><button class="onboarding__skip" data-action="skip">Saltar</button></div>
        <div class="onboarding__art">${OnboardingArt(step)}</div>
        <div class="onboarding__text">
          <div class="onboarding__accent"></div>
          <h1 class="onboarding__title">${content.title}</h1>
          <p class="onboarding__description">${content.description}</p>
          <div class="onboarding__dots" aria-label="Paso ${step} de 3">
            ${each([1, 2, 3], dot => `<span class="onboarding__dot${dot === step ? " is-active" : ""}"></span>`)}
          </div>
          <button class="onboarding__cta" data-action="next">${content.action}${Icon(step === 3 ? "arrow-right" : "chevron-right", { size: 20, stroke: 2.4 })}</button>
        </div>
      </div>
    </section>`;
}

[1, 2, 3].forEach(step => {
  defineScreen(`onboarding${step}`, {
    render: () => OnboardingView(step),
    actions: {
      next: () => navigate(step < 3 ? `onboarding${step + 1}` : "splash"),
      skip: () => navigate("splash"),
    },
  });
});
