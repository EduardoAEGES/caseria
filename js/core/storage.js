// Guarda la cuenta en el navegador (localStorage) para simular que la app
// ya fue instalada y el usuario ya se registró en este dispositivo.
// Si el navegador bloquea el almacenamiento, la app sigue funcionando sin guardar.

const ACCOUNT_KEY = "caseria.account";

function loadAccount() {
  try {
    const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY));
    return account && typeof account.name === "string" ? account : null;
  } catch {
    return null;
  }
}

function saveAccount(account) {
  try {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // Sin almacenamiento disponible: la cuenta solo dura esta sesión.
  }
}

function clearAccount() {
  try {
    localStorage.removeItem(ACCOUNT_KEY);
  } catch {
    // Nada que borrar.
  }
}
