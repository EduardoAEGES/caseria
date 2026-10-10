// Estado global de la app (lo que antes eran los useState de App.tsx).

// Usuario de prueba para el modo "Ya tengo cuenta" cuando no hay cuenta guardada.
const DEMO_ACCOUNT = { name: "Mateo", email: "", trialUsed: false, premium: false };
const DEMO_PREMIUM = { name: "Valeria", email: "valeria@caseria.pe", trialUsed: false, premium: true };

const state = {
  screen: "mode",
  mode: null,                          // "firstTime" | "free" | "premium" (modo de acceso elegido)
  registered: false,                   // true cuando ya existe una cuenta en este dispositivo
  userName: DEMO_ACCOUNT.name,
  userEmail: DEMO_ACCOUNT.email,
  trialUsed: DEMO_ACCOUNT.trialUsed,   // prueba gratis del escáner IA
  premium: DEMO_ACCOUNT.premium,       // usuario premium
  district: "paucarpata",
  selected: [],                        // ids de productos en la canasta
  quantities: {},                      // productId → cantidad
  startCategory: "Todos",              // categoría con la que se abre "Elige tus productos"
  modal: null,                         // null | { type: "district" } | { type: "web", name }
  budget: null                         // presupuesto ingresado por el usuario (S/)
};

function getDistrict() {
  return DISTRICT_DATA[state.district];
}

// ── Sesión y cuenta ─────────────────────────────────────────────────────────

/** Empieza una sesión nueva con los datos de la cuenta y la canasta de ejemplo. */
function resetSession(account) {
  state.userName = account.name;
  state.userEmail = account.email;
  state.trialUsed = account.trialUsed;
  state.premium = account.premium || false;
  state.selected = [2, 3, 6];
  state.quantities = { 2: 2, 3: 1, 6: 1 };
  state.startCategory = "Todos";
  state.modal = null;
}

function currentAccount() {
  return { name: state.userName, email: state.userEmail, trialUsed: state.trialUsed, premium: state.premium };
}

/** Modo "Primera vez": como si la app se acabara de instalar. */
function startFirstTime() {
  state.mode = "firstTime";
  state.registered = false;
  resetSession(DEMO_ACCOUNT);
}

/** Modo "Usuario Free": usa la cuenta guardada (o la de prueba) con el plan gratuito. */
function startFree() {
  state.mode = "free";
  state.registered = true;
  resetSession({ ...(loadAccount() || DEMO_ACCOUNT), premium: false });
  saveAccount(currentAccount());
}

/** Modo "Usuario Premium": cuenta de prueba con plan de pago. No toca la cuenta guardada. */
function startPremium() {
  state.mode = "premium";
  state.registered = true;
  resetSession(DEMO_PREMIUM);
}

/** Fin del registro: desde ahora la app ya no vuelve a pedir nombre y correo. */
function completeRegistration() {
  state.registered = true;
  saveAccount(currentAccount());
}

function useScannerTrial() {
  state.trialUsed = true;
  if (state.registered && state.mode !== "premium") saveAccount(currentAccount());
}

// ── Canasta ─────────────────────────────────────────────────────────────────

/** Canasta actual como [{ productId, qty }]. */
function getCart() {
  return state.selected.map(productId => ({ productId, qty: state.quantities[productId] ?? 1 }));
}

function toggleProduct(id) {
  state.selected = state.selected.includes(id)
    ? state.selected.filter(p => p !== id)
    : [...state.selected, id];
}

function changeQty(id, delta) {
  state.quantities[id] = Math.max(1, (state.quantities[id] ?? 1) + delta);
}

function removeProduct(id) {
  state.selected = state.selected.filter(p => p !== id);
}

function loadBasket(items) {
  state.selected = items.map(item => item.productId);
  state.quantities = Object.fromEntries(items.map(item => [item.productId, item.qty]));
}
