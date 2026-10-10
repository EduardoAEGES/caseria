Create a high-fidelity mobile app prototype design system and wireframes for "Ca$erIA", an AI-powered smart grocery shopping, budget management, and basket comparison app in Arequipa, Peru.

---

### 🎨 DESIGN SYSTEM & BRAND IDENTIFICATION
- Target Device: Mobile (iPhone 14/15 Pro frame size: 393 x 852 px).
- Visual Style: Clean, modern, trustworthy, high contrast. Light mode default.
- Color Palette:
  * Primary: Smart Trust Blue (#0B63E5) – UI buttons, active tabs, header elements.
  * Neutral Dark: Slate Black (#1E293B) – typography, main dark containers.
  * Neutral Light: Pure White (#FFFFFF) & Light Background (#F8FAFC).
  * Accents: Success Green (#22C55E), Highlight Orange (#FF9800).

---

### 📱 ONBOARDING, REGISTRATION & PERMISSIONS

#### Screen 1: Splash & Quick Registration (With Terms & Conditions Acceptance)
- Logo: Ca$erIA logo + slogan "Más que una APP, tu compañero de bolsillo".
- Registration Form Inputs:
  * [ 👤 Tu Nombre ]
  * [ ✉️ Tu Correo Electrónico ]
- Legal Acceptance Component:
  * Checkbox Component: "[✓] Acepto los Términos y Condiciones y la Política de Privacidad (Protección de Datos Ley N° 29733)."
  * Subtext / Link: "Ver términos sobre precios referenciales en mercados e IA."
- Subtext: "Personalizaremos tu experiencia de ahorro en Arequipa."
- Primary Button: "Empezar" (Solid Blue #0B63E5 button, disabled until terms checkbox is checked).

#### Screen 1.5: Location Permission & District Scope
- Illustration: Interactive Map Pin over Arequipa.
- Headline: "Encuentra las canastas más baratas cerca de ti"
- Location Permission Box: "Ca$erIA necesita tu ubicación para calcular rutas a mercados cercanos." -> Buttons: [ Permitir Ubicación ] | [ Omitir ].
- District Selector Options:
  * (•) 📍 Cerro Colorado
  * ( ) 📍 Paucarpata
- Notice Callout Banner: "ℹ️ Cerro Colorado y Paucarpata son actualmente los únicos distritos disponibles en Arequipa. Próximamente nos expandiremos a más zonas."
- Primary CTA: "Guardar y Continuar ➔".

#### Screen 2: Role Selection
- Option Card A: "Soy Comprador" - "Quiero armar mi canasta, controlar mi presupuesto y ahorrar."
- Option Card B: "Soy Vendedor / Comerciante" - "Tengo un puesto en el mercado y quiero publicar mis precios."
- Primary CTA: "Continuar".

---

### 🛍️ BUYER FLOW (COMPRADORES)

#### Screen 3: Buyer Home Dashboard
- Dynamic Top Bar:
  * Left: Greeting "¡Hola, [Nombre ingresado en Reg]!" (e.g., "¡Hola, Mateo!").
  * Right: Location Selector "📍 Cerro Colorado" or "📍 Paucarpata".
- Widget 1: "Presupuesto Mensual" (Donut Chart with S/ 120.00 available + category spend bars).
- Trial Banner: "✨ ¡Tienes 1 PRUEBA GRATIS de Escáner IA y Nutrición!" -> Button "Probar".
- Catalog Tabs: [ 🏪 Mercados Tradicionales ] | [ 🏢 Supermercados ] | [ 🏬 Minimarkets (Tiendas Mass) ]. (No bodegas).
- Section 2: Carousel of Lifestyle Baskets (Estudiante, Deportista, Roomies, Express).
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio (Active) | 🛒 Canasta | 📋 Mis Listas | 👤 Perfil ].

#### Screen 4: Step 1 - Product Selection
- Search Bar + Category Chips (Carnes, Verduras, Abarrotes, Lácteos).
- Product Grid with "+" buttons.
- Floating Bottom CTA: "5 productos seleccionados" -> "Definir Cantidades ➔".
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta (Active) | 📋 Mis Listas | 👤 Perfil ].

#### Screen 5: Step 2 & 3 - Quantities & Budget Input
- Stepper controls (- / +) for quantities.
- Budget Input Field: "S/ 100.00" -> CTA "🚀 Calcular Mejor Canasta Total".
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta (Active) | 📋 Mis Listas | 👤 Perfil ].

#### Screen 6: Basket Results & Interactive Map Toggle (Up to 5 Options)
- Header: "Resultados para tu Canasta | Presupuesto: S/ 100"
- View Switcher Tabs: [ 📋 Vista Lista ] | [ 🗺️ Vista Mapa ].
- LIST VIEW (Shows 5 Ranked Basket Options):
  * Option 1 (Gold Winner): "🏆 Mercado Mayorista Río Seco / Central Paucarpata" - S/ 76.50 (Ahorras S/ 23.50).
  * Option 2: "🥈 Mercado Zonal Zamácola / Miguel Grau" - S/ 81.20.
  * Option 3: "🥉 Minimarkets Tiendas Mass" - S/ 86.00.
  * Option 4: "4️⃣ Supermercado Metro / Plaza Vea" - S/ 92.50.
  * Option 5: "5️⃣ Franco Supermercados" - S/ 95.00.
- MAP VIEW: Map of Cerro Colorado / Paucarpata displaying 5 numbered pins matching the basket options.
- CTA Button: "Ver puestos exactos y ruta ➔".
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta (Active) | 📋 Mis Listas | 👤 Perfil ].

#### Screen 7: Stall Detail - NON-PREMIUM SELLER (Estoy Interesado)
- Vendor Header: "Carnes Doña Julia - Puesto 45 (Mercado Río Seco / Paucarpata)".
- Badge: "⚪ Comerciante Estándar".
- Action Component:
  * Primary Button: "👍 Estoy Interesado"
  * Rating Popup (on click): Scale [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] to indicate buying intent.
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta | 📋 Mis Listas | 👤 Perfil ].

#### Screen 8: Stall Detail - PREMIUM SELLER (Reserva y Recoge)
- Vendor Header: "Avícola El Sol - Puesto 112".
- Badge: "👑 Vendedor Verificado Premium".
- Action Component:
  * Primary Button: "⚡ Reserva y Recoge en Puesto".
  * Secondary Button: "💬 Contactar por WhatsApp".
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta | 📋 Mis Listas | 👤 Perfil ].

#### Screen 9: "Mis Listas" Screen (Saved Baskets & Favorites)
- Header: "Mis Listas y Canastas Guardadas"
- Tab 1: "🛒 Canastas Frecuentes"
  * Saved Basket 1: "Canasta Quincenal Gym" (5 productos) -> Button: "🔄 Recalcular Precios Hoy".
  * Saved Basket 2: "Básicos del Mes" (8 productos) -> Button: "🔄 Recalcular Precios Hoy".
- Tab 2: "⭐ Puestos Favoritos"
  * List of saved stalls in Río Seco / Paucarpata with quick contact buttons.
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta | 📋 Mis Listas (Active) | 👤 Perfil ].

#### Screen 10: Buyer Profile (No Payment Methods section)
- User Info: Avatar + "[Nombre ingresado]" + "[Correo ingresado]" + "📍 Cerro Colorado / Paucarpata".
- Impact Banner: "🎉 Has ahorrado S/ 142.50 con Ca$erIA".
- Featured Upsell: "⭐ Ca$erIA Premium (S/ 9.90 / mes)".
- AI Freemium Section:
  * "📷 Escáner IA de Frescura" [Badge: 🎁 1 Prueba Gratis / 🔒 Premium].
  * "🥗 IA Nutricional" [Badge: 🎁 1 Prueba Gratis / 🔒 Premium].
- Settings Group: Mercados Preferidos, Notificaciones, Centro de Ayuda, Cerrar Sesión. (NO payment methods option).
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta | 📋 Mis Listas | 👤 Perfil (Active) ].

#### Screen 11: AI Scanner Demo (1 Free Trial)
- Camera scanning food item + Freshness rating overlay ("🟢 95% Fresco").
- Banner: "🎉 Gastaste tu prueba gratis. Suscríbete a Ca$erIA Premium por S/ 9.90/mes para uso ilimitado."

---

### 🏪 SELLER FLOW (VENDEDORES - MERCADOS ÚNICAMENTE)

#### Screen 12: Seller Onboarding & Stall Setup
- Header: "Registra tu Puesto de Mercado"
- Form Inputs:
  * [ Nombre completo ] | [ Correo electrónico ]
  * Dropdown: "Distrito donde laboras" [ Cerro Colorado | Paucarpata ].
  * Dropdown: "Mercado donde laboras" [ Mercado Río Seco | Mercado Zamácola | Mercado Central Paucarpata | Mercado Miguel Grau ].
  * Input Field: "Número de Puesto" [ Ej. Puesto 112 ].
  * Category: [ Carnes / Aves | Frutas / Verduras | Abarrotes | Lácteos ].
- Info Banner: "ℹ️ La cuenta gratuita te permite registrar 1 puesto. Con CaserIA Premium podrás agregar más puestos."
- Primary CTA: "Crear Puesto Gratis".

#### Screen 13: Seller Dashboard & Multi-Stall Management (Free vs Premium)
- Store Header: "Puesto 112 - Avícola El Sol (Mercado Río Seco)" | Toggle [🟢 Abierto].
- Quick Pricing Table.
- Free Seller Alert (Upgrade Push):
  * "🔥 15 jóvenes marcaron 5/5 en 'Estoy Interesado' en tu puesto hoy. Pásate a Premium (S/ 29.90/mes) para permitirles 'Reserva y Recoge' y agregar más puestos de venta."
- Multi-Stall Selector Box:
  * Current Stall: "Puesto 112 (Activo)"
  * Disabled Card: "➕ Agregar Puesto 2" -> [🔒 Desbloquear con CaserIA Premium].
- Bottom Navigation Bar (Vendedor): [ 📊 Precios | 💰 Ventas | 📋 Intereses/Reservas | 👤 Mi Puesto ].

#### Screen 14: Seller Premium Upgrade Screen
- Header: "CaserIA Vendedores Premium"
- Price: "S/ 29.90 / mes"
- Feature List:
  * "✓ Administra múltiples puestos de venta en el mercado desde 1 sola cuenta."
  * "✓ Activa 'Reserva y Recoge' para asegurar ventas de jóvenes compradores."
  * "✓ Envía 'Alertas de Remate' para liquidar mermas al final del día."
  * "✓ Posicionamiento destacado en búsquedas."
- Primary CTA: "Probar 30 Días Gratis de Premium".