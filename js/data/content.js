// Contenido fijo de la app: distrito, canastas rápidas y datos de demostración.

const DISTRICT_DATA = {
  paucarpata: {
    label: "Paucarpata",
    supermarkets: [
      { name: "Tottus Porongoche",    tag: "Supermercado", emoji: "🛒" },
      { name: "Plaza Vea",            tag: "Supermercado", emoji: "🏬" },
      { name: "Franco Supermercados", tag: "Supermercado", emoji: "🏪" },
      { name: "Metro",                tag: "Supermercado · compra online", emoji: "🏬" },
    ],
    minimarkets: [
      { name: "Tiendas Mass – Porongoche", tag: "Tienda de descuento", emoji: "🏷️" },
      { name: "Tiendas Mass – Los Andes",  tag: "Tienda de descuento", emoji: "🏷️" },
    ],
  },
};

const QUICK_BASKETS = [
  { emoji: "🎒", name: "Canasta Estudiante", desc: "Rápida y económica", items: [{ productId: 1, qty: 1 }, { productId: 11, qty: 2 }, { productId: 12, qty: 2 }, { productId: 3, qty: 1 }] },
  { emoji: "💪", name: "Canasta Deportista", desc: "Alta en proteínas",  items: [{ productId: 2, qty: 2 }, { productId: 3, qty: 1 }, { productId: 6, qty: 1 }, { productId: 8, qty: 1 }, { productId: 22, qty: 1 }] },
  { emoji: "🏠", name: "Canasta Roomies",    desc: "Para compartir",     items: [{ productId: 1, qty: 2 }, { productId: 4, qty: 2 }, { productId: 9, qty: 1 }, { productId: 10, qty: 1 }, { productId: 14, qty: 1 }, { productId: 28, qty: 1 }, { productId: 30, qty: 1 }] },
  { emoji: "🕒", name: "Canasta Express",    desc: "Del apuro",          items: [{ productId: 11, qty: 1 }, { productId: 5, qty: 1 }, { productId: 25, qty: 1 }] },
];

// Nombres cortos para las columnas de la tabla de precios.
const STORE_SHORT = { tottus: "Tottus", plazavea: "P. Vea", franco: "Franco", massporo: "Mass P.", metro: "Metro", massande: "Mass A." };

// Establecimientos del mapa (x, y en el sistema 0–100 del SVG).
const MAP_ESTABLISHMENTS = [
  { id: 0, name: "Tiendas Mass – Porongoche", type: "Tienda de descuento", total: "S/ 76.50/canasta", rating: 4.7, featured: true,  x: 28, y: 38, address: "Av. Los Incas 320",  distance: "600 m · 8 min" },
  { id: 1, name: "Tiendas Mass – Los Andes",  type: "Tienda de descuento", total: "S/ 78.00/canasta", rating: 4.4, featured: false, x: 20, y: 60, address: "Av. Los Andes 210",  distance: "1.1 km · 14 min" },
  { id: 2, name: "Franco Supermercados",      type: "Supermercado",        total: "S/ 82.00/canasta", rating: 4.5, featured: false, x: 62, y: 28, address: "Av. Porongoche 450", distance: "900 m · 12 min" },
  { id: 3, name: "Plaza Vea",                 type: "Supermercado",        total: "S/ 87.50/canasta", rating: 4.3, featured: false, x: 45, y: 55, address: "C.C. Porongoche",    distance: "1.4 km · 17 min" },
  { id: 4, name: "Tottus Porongoche",         type: "Supermercado",        total: "S/ 94.00/canasta", rating: 4.6, featured: false, x: 70, y: 45, address: "C.C. Real Plaza",    distance: "1.8 km · 22 min" },
];

const SAVED_BASKETS = [
  { name: "Canasta Quincenal Gym", count: 5, products: ["🍗 Pollo", "🥚 Huevos", "🌾 Avena", "🥛 Leche", "🍌 Plátano"], lastPrice: "S/ 76.50", saved: "S/ 18.00" },
  { name: "Básicos del Mes",       count: 8, products: ["🍚 Arroz", "🥔 Papa", "🧅 Cebolla", "🍅 Tomate", "🫙 Aceite"], lastPrice: "S/ 124.00", saved: "S/ 31.50" },
];

const FAVORITE_STORES = [
  { name: "Tiendas Mass – Porongoche", type: "Tienda de descuento", address: "Av. Los Incas 320",  rating: 4.7, featured: true,  tags: ["Descuento", "Mejor precio"] },
  { name: "Franco Supermercados",      type: "Supermercado",        address: "Av. Porongoche 450", rating: 4.5, featured: false, tags: ["Supermercado", "Tiene todo"] },
  { name: "Tottus Porongoche",         type: "Supermercado",        address: "C.C. Real Plaza",    rating: 4.6, featured: false, tags: ["Supermercado", "Compra online"] },
];
