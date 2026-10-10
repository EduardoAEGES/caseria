Create a high-fidelity mobile app prototype design system and wireframes for "Ca$erIA", an AI-powered smart grocery shopping, budget management, and basket comparison app in Arequipa, Peru.

---

### 🎨 DESIGN SYSTEM & BRAND IDENTIFICATION
- Target Device: Mobile (iPhone 14/15 Pro frame size: 393 x 852 px).
- Visual Style: Clean, modern, trustworthy, high contrast. Light mode default.
- Palette:
  * Primary: Smart Trust Blue (#0B63E5) – UI buttons, active tabs, header.
  * Neutral Dark: Slate Black (#1E293B) – typography, dark containers.
  * Neutral Light: Pure White (#FFFFFF) & Light Gray (#F8FAFC).
  * Accents: Success Green (#22C55E), Highlight Orange (#FF9800).

---

### 📱 ONBOARDING & DISTRICT SELECTION

#### Screen 1: Splash & Onboarding
- Logo: Ca$erIA logo + slogan "Más que una APP, tu compañero de bolsillo".
- Hero Illustration: Young adult managing food budget smartly.
- Primary Button: "Empezar".

#### Screen 2: Role Selection
- Card A: "Soy Comprador" - "Quiero armar mi canasta y hacer rendir mi presupuesto."
- Card B: "Soy Vendedor" - "Tengo un puesto o bodega y quiero publicar mis precios."
- Primary Button: "Continuar".

#### Screen 2.5: Buyer District Personalization (NUEVA PANTALLA)
- Header: "¿En qué distrito realizarás tus compras?"
- Subtitle: "Personalizaremos los mercados y supermercados según tu ubicación."
- Option Card 1: "📍 Cerro Colorado"
  * Subtext: "Incluye Mercado Río Seco, Zamácola, Metro Arequipa Center, Plaza Vea Aviación."
- Option Card 2: "📍 Paucarpata"
  * Subtext: "Incluye Mercado Central de Paucarpata, Mercado Miguel Grau, Plaza Vea, Franco Supermercados."
- Primary CTA: "Guardar y ver ofertas de mi distrito".

---

### 🛍️ BUYER FLOW (COMPRADORES) - Con Menú Visible

#### Screen 3: Buyer Home Dashboard
- Top Header: "¡Hola, Mateo!" + Location Chip "📍 [Distrito Seleccionado: Cerro Colorado o Paucarpata]" (Tappable to switch district).
- Widget 1: Presupuesto Mensual (Donut Chart showing S/ 120.00 available out of S/ 300.00 + Breakdown bars).
- Section 2: Carousel of Lifestyle Baskets (Estudiante, Deportista, Roomies, Express).
- Section 3: District Local Catalogs (Tabs: [Mercados Tradicionales] | [Supermercados]).
- VISIBLE BOTTOM NAVIGATION BAR: 
  * [ 🏠 Inicio (Active) | 🛒 Canasta | 📋 Mis Listas | 👤 Perfil ]

#### Screen 4: Step 1 - Product Selection
- Search bar + Product Grid (Arroz, Pollo, Huevos, Papa, Tomate, Avena).
- Floating Bottom CTA: "5 productos seleccionados ➔".
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta (Active) | 📋 Mis Listas | 👤 Perfil ]

#### Screen 5: Step 2 - Quantities Adjustment (Volume Trigger)
- Stepper controls (- / +) for quantities (e.g., 1 plancha de huevos, 2kg pollo).
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta (Active) | 📋 Mis Listas | 👤 Perfil ]

#### Screen 6: Step 3 - Budget Input
- Big Number Field: "S/ 100.00" + CTA "🚀 Calcular Mejor Canasta Total".
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta (Active) | 📋 Mis Listas | 👤 Perfil ]

#### Screen 7: Results Dashboard (District Personalized)
- Winner Card: Best option based on user's district selection (e.g., "🏆 Mercado Mayorista Río Seco" for Cerro Colorado OR "🏆 Mercado Central" for Paucarpata).
- Comparison list vs Supermarkets (Metro / Plaza Vea / Franco).
- CTA Buttons: "Ver puestos exactos" | "Ir a comprar".
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta (Active) | 📋 Mis Listas | 👤 Perfil ]

---

### 🔄 REDIRECTION MODALS (POPUP OVERLAYS)

#### Screen 8A: WhatsApp Redirection Overlay (Traditional Market Seller)
- Background: Dimmed screen overlay over the market stall detail.
- Modal Card Container: Centered White Card with rounded corners and shadow.
- Top Right Corner: Prominent "✕" Close Icon Button.
- Header: "💬 Redirección a WhatsApp"
- Body Text: "Te redirigiremos a WhatsApp. Tu progreso en Ca$erIA se guardará."
- Vendor Info: "Coordinando con: Don José (Puesto 112 - Mercado Río Seco / Paucarpata)".
- Primary Button: "Continuar a WhatsApp" (Blue #0B63E5 button).

#### Screen 8B: Supermarket Web Redirection Overlay (Retail Store)
- Background: Dimmed screen overlay over the supermarket option.
- Modal Card Container: Centered White Card with rounded corners and shadow.
- Top Right Corner: Prominent "✕" Close Icon Button.
- Header: "🌐 Redirección a tienda externa"
- Body Text: "Te redirigiremos a la página web del establecimiento. Tu progreso en Ca$erIA se guardará."
- Supermarket Info: "Establecimiento: Metro / Plaza Vea".
- Primary Button: "Ir a comprar en la Web" (Blue #0B63E5 button).

---

### 👤 PROFILE & PREVIEW FEATURES

#### Screen 9: Buyer Profile & Settings
- Avatar + Name: "Mateo Silva" | "📍 Cerro Colorado / Paucarpata".
- Gamified Savings Banner: "🎉 Has ahorrado S/ 142.50 con Ca$erIA".
- Featured Card: "⭐ Ca$erIA Premium (S/ 9.90 / mes)".
- Teasers Section: "🚀 PRÓXIMAMENTE EN CASERIA"
  * Card 1: "📷 Escáner IA de Alimentos" [Badge: Próximamente]
  * Card 2: "🥗 IA Nutricional" [Badge: Próximamente]
- VISIBLE BOTTOM NAVIGATION BAR: [ 🏠 Inicio | 🛒 Canasta | 📋 Mis Listas | 👤 Perfil (Active) ]

---

### 🏪 SELLER FLOW (VENDEDORES)

#### Screen 10: Seller Setup & Dashboard
- Dropdown: Select District [ Cerro Colorado | Paucarpata ].
- Dropdown: Select Market [ Río Seco | Zamácola | Mercado Central Paucarpata | Bodega Local ].
- Pricing Update Table & Sales Analytics.
- Featured Card: "CaserIA Vendedores Premium (S/ 29.90 / mes)".
- Bottom Navigation Bar (Vendedor): [ 📊 Inicio / Precios | 💰 Ventas | 📋 Reservas | 👤 Mi Puesto ]