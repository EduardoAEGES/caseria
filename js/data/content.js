// Contenido fijo de la app: distrito, canastas rápidas y datos de demostración.

const DISTRICT_DATA = {
  paucarpata: { label: "Paucarpata" },
};

const QUICK_BASKETS = [
  { emoji: "🎒", name: "Canasta Estudiante", desc: "Rápida y económica", items: [{ productId: 1, qty: 1 }, { productId: 11, qty: 2 }, { productId: 12, qty: 2 }, { productId: 3, qty: 1 }] },
  { emoji: "💪", name: "Canasta Deportista", desc: "Alta en proteínas",  items: [{ productId: 2, qty: 2 }, { productId: 3, qty: 1 }, { productId: 6, qty: 1 }, { productId: 8, qty: 1 }, { productId: 22, qty: 1 }] },
  { emoji: "🏠", name: "Canasta Roomies",    desc: "Para compartir",     items: [{ productId: 1, qty: 2 }, { productId: 4, qty: 2 }, { productId: 9, qty: 1 }, { productId: 10, qty: 1 }, { productId: 14, qty: 1 }, { productId: 28, qty: 1 }, { productId: 30, qty: 1 }] },
  { emoji: "🕒", name: "Canasta Express",    desc: "Del apuro",          items: [{ productId: 11, qty: 1 }, { productId: 5, qty: 1 }, { productId: 25, qty: 1 }] },
];

// Nombres cortos para las columnas de la tabla de precios.
const STORE_SHORT = { tottus: "Tottus", plazavea: "P. Vea", metro: "Metro", makro: "Makro", mass: "Mass", tambo: "Tambo", oxxo: "OXXO" };

const SAVED_BASKETS = [
  { name: "Canasta Quincenal Gym", count: 5, products: ["🍗 Pollo", "🥚 Huevos", "🌾 Avena", "🥛 Leche", "🍌 Plátano"], lastPrice: "S/ 76.50", saved: "S/ 18.00" },
  { name: "Básicos del Mes",       count: 8, products: ["🍚 Arroz", "🥔 Papa", "🧅 Cebolla", "🍅 Tomate", "🫙 Aceite"], lastPrice: "S/ 124.00", saved: "S/ 31.50" },
];

const FAVORITE_STORES = [
  { name: "Tiendas Mass Paucarpata", type: "Tienda de descuento", address: "Av. Kennedy, Paucarpata",          rating: 4.7, featured: true,  tags: ["Descuento", "Cerca de casa"] },
  { name: "Makro Avelino Cáceres",   type: "Supermayorista",      address: "Av. Avelino Cáceres",              rating: 4.5, featured: false, tags: ["Supermayorista", "Compras grandes"] },
  { name: "Tottus Porongoche",       type: "Supermercado",        address: "C.C. Mall Aventura Porongoche",    rating: 4.6, featured: false, tags: ["Supermercado", "Compra online"] },
];
