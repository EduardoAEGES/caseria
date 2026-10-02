// Modales globales: se muestran encima de cualquier pantalla según state.modal.

function Modal() {
  if (!state.modal) return "";
  if (state.modal.type === "district") return DistrictModal();
  if (state.modal.type === "web") return WebRedirectModal(state.modal.name);
  return "";
}

// Distrito activo (por ahora solo Paucarpata).
function DistrictModal() {
  return `
    <div class="backdrop backdrop--modal" data-backdrop="closeModal">
      <div class="sheet district-sheet slide-up">
        <div class="sheet__handle"></div>
        <h2 class="district-sheet__title">Distrito activo</h2>
        <p class="district-sheet__sub">Zona de validación actual de Ca$erIA.</p>
        <div class="district-option">
          <span class="district-option__icon">📍</span>
          <div class="district-option__text">
            <p class="district-option__name">Paucarpata, Arequipa</p>
            <p class="district-option__stores">Tottus · Plaza Vea · Franco · Tiendas Mass</p>
          </div>
          ${Check(true, "check--sm")}
        </div>
        <div class="note note--gray">
          <span>🕐</span>
          <p>Próximamente ampliaremos cobertura a otros distritos de Arequipa.</p>
        </div>
        <button class="btn btn--primary btn--md btn--block" data-action="closeModal">Entendido</button>
      </div>
    </div>`;
}

function WebRedirectModal(name) {
  const storeName = esc(name);
  return `
    <div class="backdrop backdrop--center" data-backdrop="closeModal">
      <div class="modal slide-up">
        <div class="modal__top">
          <button class="close-btn close-btn--round" data-action="closeModal" aria-label="Cerrar">✕</button>
        </div>
        <div class="modal__body">
          <div class="modal__icon">🌐</div>
          <h2 class="modal__title">Redirección a tienda externa</h2>
          <p class="modal__text">
            Te redirigiremos a la página web oficial de <strong>${storeName}</strong> para realizar tu compra online.
            Tu lista en Ca$erIA se guardará automáticamente.
          </p>
          <div class="modal__store">
            <span class="modal__store-icon">🏢</span>
            <div>
              <p class="modal__store-label">Establecimiento</p>
              <p class="modal__store-name">${storeName}</p>
            </div>
            <span class="modal__online"></span>
          </div>
          <div class="note note--amber">
            <span>ℹ️</span>
            <p>Los precios en la web pueden diferir de los comparados por Ca$erIA. Se abrirá en tu navegador.</p>
          </div>
          <button class="btn btn--primary btn--lg btn--block" data-action="closeModal">Ir a la Web Externa ↗</button>
          <button class="btn btn--link-muted btn--block" data-action="closeModal">Volver a Ca$erIA</button>
        </div>
      </div>
    </div>`;
}
