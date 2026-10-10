Create a high-fidelity mobile app prototype design system and wireframes for "Ca$erIA", an AI-powered smart grocery shopping, budget management, and basket comparison app in Arequipa, Peru.

---

### 🎨 DESIGN SYSTEM & BRAND IDENTIFICATION
- Target Device: Mobile (iPhone 14/15 Pro frame size: 393 x 852 px).
- Visual Style: Clean, modern, trustworthy, Gen-Z friendly, high contrast. Light mode default.
- Brand Color Palette (Based on Logo):
  * Primary Brand Color: Smart Trust Blue (#0B63E5) – main UI buttons, headers, active tabs, primary brand elements.
  * Neutral Dark: Slate Black (#1E293B) – typography, dark card elements.
  * Neutral Light: Pure White (#FFFFFF) & Light Background (#F8FAFC).
  * Semantic Accents:
    - Success / Savings Green (#22C55E) – savings badges, positive budget indicators, freshness tags.
    - Highlight / Premium Orange (#FF9800) – "Best Deal" trophies, Premium Badges, "Próximamente" teasers, liquidation alerts.
- Typography: Modern Sans-Serif (Inter / Roboto). High contrast and hierarchy.

### 📍 TARGET AUDIENCE & GEOGRAPHIC SCOPE
- Target Audience: Young adults (18-30 years old) managing their own food budget (students, roomies, young professionals, athletes) in Arequipa.
- Geographic Scope: Initial Validation Model covering "Cerro Colorado" (Río Seco, Zamácola, Metro Arequipa Center) and "Paucarpata" (Mercado Central de Paucarpata, Plaza Vea, local minimarkets).

---

### 📱 FULL APP SCREEN ARCHITECTURE (16 SCREENS)

#### Screen 1: Splash & Onboarding
- Logo: Ca$erIA logo + tagline "Más que una APP, tu compañero del ahorro".
- Hero Illustration: Young adult managing food budget smartly.
- Headline: "Tu presupuesto. Tus reglas. Tu comida."
- Subtext: "Arma tu canasta, compara mercados y supermercados en Cerro Colorado y Paucarpata, y haz que tu dinero rinda."
- Action Buttons: Primary Blue Button "Empezar" | Secondary Link "Ya tengo cuenta".

#### Screen 2: Quick Registration & Role Selection
- Header: "Bienvenido a Ca$erIA"
- Form Inputs: [ Nombre completo ] | [ Correo electrónico o Celular ]
- Selection Card A (Primary Focus): "Soy Comprador" - "Quiero armar mi canasta, controlar mi presupuesto y ahorrar en comida." (Icon: Shopping Cart).
- Selection Card B: "Soy Vendedor / Comercio" - "Tengo un puesto en el mercado o bodega en Cerro Colorado / Paucarpata y quiero publicar mis precios." (Icon: Storefront).
- Primary Button: "Crear cuenta y continuar" (Solid Blue #0B63E5).

---

### 🛍️ BUYER FLOW (COMPRADORES: JÓVENES 18-30)

#### Screen 3: Buyer Home Dashboard (Presupuesto + Canastas)
- Top Bar: Greeting "¡Hola, Mateo!" + Location Selector "📍 Cerro Colorado / Paucarpata".
- Widget 1: "Presupuesto Mensual" (Donut Chart & Category Spend)
  * Left side: Large bold text "S/ 120.00" (Disponible) + Subtext "de S/ 300.00 total". Badge "🎉 S/ 35.00 Ahorrados en CaserIA" (Green #22C55E).
  * Right side: Donut chart showing 60% spent (Blue #0B63E5) and 40% remaining (Light Slate).
  * Mini Breakdown Bars: 🥩 Carnes/Gym (45%) | 🍚 Abarrotes (30%) | 🥬 Verduras (25%).
  * AI Micro-Tip Banner: "💡 Tip IA: Comprar tu pollo en Río Seco esta semana te dará S/ 15 extra para tu presupuesto."
- Search Bar: "🔎 ¿Qué vas a comprar hoy?".
- Section 2: "⭐ Canastas Rápidas (Estilos de Vida)" - Horizontal Carousel:
  * Card 1: "🎒 Canasta Estudiante" (S/ 50) - Rápida y económica.
  * Card 2: "💪 Canasta Deportista" (S/ 80) - Alta en proteínas.
  * Card 3: "🏠 Canasta Roomies" (S/ 150) - Para compartir gastos.
  * Card 4: "🕒 Canasta Express" (S/ 30) - Para salir del apuro.
- Section 3: Banner "🛒 ¿Prefieres armar tu propia lista?" -> Button "+ Crear Canasta Nueva".
- Bottom Navigation Bar (Comprador): [ 🏠 Inicio | 🛒 Canasta | 📋 Mis Listas | 👤 Perfil ].

#### Screen 4: Step 1 - Product Selection
- Step Header: "Paso 1: ¿Qué necesitas comprar?"
- Category Filter Chips: All | 🍎 Frutas | 🥬 Verduras | 🥩 Carnes | 🥛 Lácteos | 🍚 Abarrotes.
- Search & Product Grid (Arroz 1kg, Pollo, Huevos x30, Papa Canchan, Tomate, Avena). Each item has a "+" button.
- Bottom Bar: "5 productos en tu lista" -> CTA "Definir Cantidades ➔".

#### Screen 5: Step 2 - Quantities Adjustment (Volume Trigger)
- Step Header: "Paso 2: Ajusta las cantidades"
- Info Banner: "💡 Pista: Si llevas mayores cantidades (ej. planchas o sacos), evaluaremos precios al por mayor."
- Itemized List with Stepper Control (- / +):
  * Pollo: [ - ] 2 kg [ + ]
  * Huevos: [ - ] 30 und (1 plancha) [ + ]
  * Avena: [ - ] 1 kg [ + ]
- Action: "✏️ Modificar o agregar productos".
- Primary CTA: "Continuar a Presupuesto ➔".

#### Screen 6: Step 3 - Budget Input
- Step Header: "Paso 3: Tu presupuesto"
- Prompt: "¿Cuánto planeas gastar en esta compra?"
- Large Number Input Field: "S/ 100.00"
- Quick Preset Chips: [ S/ 50 ] [ S/ 100 ] [ S/ 150 ]
- Checkbox: "☑ Ajustar recomendación a mi presupuesto exacto".
- Primary CTA: "🚀 Calcular Mejor Canasta Total".

#### Screen 7: Loading State (AI Radar)
- Central Graphic: Radar animation scanning Cerro Colorado & Paucarpata maps.
- Title: "🤖 Analizando opciones para tu compra..."
- Status Checks:
  * [✓] Evaluando precios en Mercado Río Seco y Zamácola (Cerro Colorado)...
  * [✓] Comparando con Mercado Central y tiendas de Paucarpata...
  * [⏳] Calculando la canasta con mayor ahorro...

#### Screen 8: Basket Results & Comparison Dashboard
- Header Summary: "Tu Canasta (5 productos) | Presupuesto: S/ 100"
- Toggle Filter: [ 🛍️ Comprar todo en 1 lugar ] vs [ 💰 Máximo Ahorro (Combinado) ]
- Highlight Winner Card (Gold/Orange Border & Trophy Badge):
  * "🏆 MEJOR OPCIÓN (PRECIO MAYORISTA): Mercado Mayorista Río Seco"
  * AI Insight Badge: "💡 Por llevar 1 plancha de huevos y 2kg de pollo, el precio mayorista te da el máximo ahorro."
  * Total Price: "S/ 76.50" (Green #22C55E text)
  * Savings badge: "🎉 Ahorras S/ 23.50 vs Supermercados"
  * Location: "📍 Cerro Colorado | ⏱️ A 10 min"
  * Button: "Ver puestos exactos y ruta ➔"
- Secondary Options Cards:
  * "🥈 Mercado Central de Paucarpata": Total S/ 82.00 | 📍 Paucarpata
  * "🥉 Supermercado Metro / Plaza Vea": Total S/ 94.00 

#### Screen 9: Basket Breakdown & Smart Route (Exact Stalls)
- Header: "Mercado Río Seco - Total Canasta: S/ 76.50"
- Breakdown Item List (Product | Quantity | Price | Stall Location):
  * Huevos (1 plancha): S/ 16.00 ➔ 📍 Avícola El Sol (Puesto 112, Zona Carnes) `👑 Premium`
  * Pollo (2 kg): S/ 21.00 ➔ 📍 Carnes Doña Julia (Puesto 45)
  * Abarrotes: S/ 39.50 ➔ 📍 Distribuidora Gómez (Puesto 20)
- Action Buttons:
  * Primary Button: "⚡ Reservar y Recoger en Puesto Premium"
  * Secondary Button: "🗺️ Ver Mapa e Iniciar Ruta"

#### Screen 10: Click & Collect Setup ("Reserva y Recoge")
- Header: "Configura tu Reserva"
- Section 1: Itemized summary + "Notas para el vendedor" (e.g., "Pollo picado en 8 presas").
- Section 2: Time Slot Selector: [ 5:00 PM - 5:30 PM ] [ 5:30 PM - 6:00 PM ].
- Section 3: Payment Method at pickup: (•) Yape / Plin | ( ) Efectivo.
- Primary CTA: "Confirmar Reserva" (Blue #0B63E5 button).

#### Screen 11: Digital Ticket & Indoor Navigation Map
- Ticket Container: White card with dashed borders, QR Code, and Order #C-8492.
- Status Pill: "🟢 ¡Listo para recoger en Puesto 112!".
- Map Graphic: Illustrated 2D layout of Mercado Río Seco showing "Puerta 3", a blue dashed path, and destination pin "Puesto 112".
- Action Buttons: [ 💬 WhatsApp del Vendedor ] | [ ✅ ¡Ya recogí mi pedido! ].

#### Screen 12: Buyer Profile & Premium Upsell
- Header: Profile Title + Settings Icon.
- User Info: Avatar + "Mateo Silva (22 años)" + "📍 Cerro Colorado, Arequipa".
- Gamified Impact Banner: "🎉 Has ahorrado S/ 142.50 con CaserIA | Nivel: Ahorrador Experto".
- Featured Upsell Card: "⭐ Ca$erIA Premium" (Gold/Orange Border #FF9800)
  * Price: "S/ 9.90 / mes"
  * Benefits: "✓ IA Nutricional Ilimitada", "✓ Alertas y personalización avanzada", "✓ Cero comisiones en Reserva y Recoge".
  * Primary Button: "Obtener Premium" (Blue #0B63E5 button).
- Teaser Section: "🚀 PRÓXIMAMENTE EN CASERIA"
  * Teaser 1: "📷 Escáner IA de Alimentos (Escanea la frescura y vida útil de tus compras con la cámara)." [Badge: Próximamente]
  * Teaser 2: "🥗 IA Nutricional (Recibe orientación general sobre alimentación y recomendaciones relacionadas con tus productos y preferencias)." [Badge: Próximamente]
- Settings Group: Métodos de Pago, Mercados Preferidos (Río Seco, Zamácola, Paucarpata), Cerrar Sesión.

---

### 🏪 SELLER FLOW (VENDEDORES / COMERCIANTES)

#### Screen 13: Seller Registration & Onboarding
- Header: "Ca$erIA Vendedores - Cono Norte y Paucarpata"
- Setup Form:
  * Dropdown: "Selecciona tu Distrito" [ Cerro Colorado | Paucarpata ]
  * Dropdown: "Selecciona tu Mercado / Tipo" [ Mercado Río Seco | Mercado Zamácola | Mercado Central Paucarpata | Bodega / Minimarket ]
  * Input Field: "Número de Puesto / Local" (Ej. Puesto 112)
  * Category Checkboxes: [ 🥩 Carnes/Aves ] [ 🍎 Frutas/Verduras ] [ 🍚 Abarrotes ] [ 🥛 Lácteos ]
- Primary CTA: "Registrar mi Puesto".

#### Screen 14: Seller Main Dashboard (Gestión de Precios)
- Header: "Puesto 112 - Avícola El Sol" | Status Toggle: [🟢 Abierto / Recibiendo Canastas].
- Quick Pricing Update Table (Wholesale vs Retail logic):
  * Item 1: "Pollo Entero (Kilo)" -> Input Price [ S/ 10.50 ] -> Toggle [Disponible].
  * Item 2: "Huevos (Plancha 30 und)" -> Input Price [ S/ 16.00 ] -> Toggle [Disponible].
- Stats Banner: "👁️ 120 jóvenes vieron tu puesto hoy en Cerro Colorado y Paucarpata."
- Bottom Navigation Bar (Vendedor): [ 📊 Inicio / Precios | 💰 Ventas | 📋 Reservas / Listas | 👤 Mi Puesto ].

#### Screen 15: Sales Metrics & Customer Interactions ("Listas")
- Header: "Métricas y Rendimiento del Puesto"
- Stat Cards Grid:
  * Card 1: "S/ 480.00" (Ventas estimadas este mes mediante CaserIA).
  * Card 2: "32" (Canastas reservadas y completadas).
  * Card 3: "48" (Jóvenes que guardaron tu puesto en sus Listas Favoritas).
- Active Customer Reservations List:
  * Customer 1: "Mateo S. - Pedido #C-8492 (S/ 40.25)" -> Status: [ 🟢 Listo ] -> Button: [ 💬 WhatsApp ].

#### Screen 16: Seller Premium Upsell (CaserIA Vendedores Premium)
- Header: "Potencia tu Puesto con CaserIA Premium"
- Price Badge: "S/ 29.90 / mes" (Subtext: "Menos de S/ 1.00 al día").
- Feature Highlight Cards:
  * 🚨 "Alerta de Remate": Liquida perecibles enviando notificaciones push instantáneas a jóvenes cercanos.
  * 📊 "Radar de Precios": Mira el precio promedio de tu competencia en Río Seco o Paucarpata en tiempo real.
  * 🛍️ "Reserva y Recoge": Permite que los jóvenes aparten su compra y paguen al recoger.
  * ⭐ "Posicionamiento Destacado": Aparece en el 1er lugar cuando un usuario busque tu categoría.
- Primary CTA Button: "Probar 30 Días Gratis de Premium" (Blue #0B63E5 button).