// Funciones de ayuda para armar HTML.

/** Escapa texto escrito por el usuario antes de meterlo en el HTML. */
function esc(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value).replace(/[&<>"']/g, char => entities[char]);
}

/** Formatea un monto en soles: 12.5 → "S/ 12.50". */
function money(amount) {
  return `S/ ${amount.toFixed(2)}`;
}

/** Convierte una lista en HTML: each(items, item => `<li>${item}</li>`). */
function each(items, template) {
  return items.map(template).join("");
}
