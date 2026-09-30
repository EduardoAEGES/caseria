Create a high-fidelity mobile app prototype design system and wireframes for "Ca$erIA", an AI-powered smart grocery shopping and basket comparison app. 

### 🎯 CONTEXT & TARGET AUDIENCE
- Target Audience: Young adults (18-30 years old) who manage their own food budget (students, roommates, young professionals, athletes) in Arequipa, Peru.
- Geographic Focus: Hyper-local in "Cerro Colorado / Cono Norte" (featuring local wholesale markets like Río Seco, traditional markets like Zamácola, and local supermarkets).
- Core Value: It calculates the total basket cost (Retail vs. Wholesale) and gives exact stall locations so young buyers don't get lost in huge traditional markets.

### 🎨 DESIGN SYSTEM & STYLING GUIDELINES
- Target Device: Mobile (iPhone 14/15 Pro frame size: 393 x 852 px).
- Visual Style: Clean, modern, intuitive, Gen-Z friendly but highly functional. Light mode default.
- Color Palette:
  * Primary: Fresh Vibrant Green (#2E7D32) – savings, fresh food.
  * Secondary / Accent: Warm Yellow/Orange (#FF9800) – smart badges, "Best Deal" awards.
  * Neutral Dark: Deep Slate Gray (#1E293B) – crisp typography.
  * Neutral Light: Off-White (#F8FAFC) – background.
- UI Components: Rounded cards (border-radius: 12px), full-width CTA buttons, pill-shaped chips, intuitive steppers for quantities.

---

### 📲 USER FLOW & SCREEN ARCHITECTURE (12 KEY SCREENS)

#### Screen 1: Splash & Onboarding (Bienvenida)
- Header: Ca$erIA logo.
- Hero Illustration: A young person confidently holding a smart grocery bag. 
- Main Text: "Tu presupuesto. Tus reglas. Tu comida."
- Subtext: "No necesitas ser un experto para comprar bien. Arma tu canasta, compara precios entre mercados y supermercados, y haz que tu dinero rinda."
- Primary Action: Button "Empezar" / Text Link "Ya tengo una cuenta".

#### Screen 2: User Role Selection (Selección de Perfil)
- Title: "¿Cómo usarás Ca$erIA?"
- Option Card A (Primary): "Soy Comprador" - "Quiero armar mi canasta y saber dónde comprar más barato en el Cono Norte."
- Option Card B: "Soy Comerciante" - "Tengo un puesto o bodega en Cerro Colorado y quiero subir mis precios."
- Action Button: "Continuar".

#### Screen 3: Home / Main Dashboard - Buyer (Inicio Comprador)
- Top Bar: Greeting "¡Hola, Mateo!" + Location chip "📍 Cerro Colorado, AQP".
- Search Bar: "🔎 ¿Qué vas a comprar hoy?".
- Section 1: "⭐ Canastas Rápidas (Para tu estilo de vida)" - Horizontal Carousel:
  * Card 1: "🎒 Canasta Estudiante" (S/ 50) - Básicos y rápidos.
  * Card 2: "💪 Canasta Deportista" (S/ 80) - Alta en proteínas.
  * Card 3: "🏠 Canasta Roomies" (S/ 150) - Cantidades para compartir.
  * Card 4: "🕒 Canasta Express" (S/ 30) - Para salir del apuro.
- Section 2: Banner "🛒 ¿Prefieres armar tu propia lista?" -> Button "+ Crear Canasta Nueva".

#### Screen 4: Step 1 - Product Selection (¿Qué necesitas?)
- Title: "Paso 1: Selecciona tus productos"
- Filter chips: All | 🍎 Frutas | 🥬 Verduras | 🥩 Carnes | 🥛 Lácteos | 🍚 Abarrotes.
- Grid List: Arroz, Pollo, Huevos, Papa, Tomate, Avena. (Each with a "+" add button).
- Floating Bottom Bar: "5 productos" -> CTA "Definir Cantidades ➔".

#### Screen 5: Step 2 - Quantities (¿Cuánto necesitas?)
- Title: "Paso 2: Ajusta las cantidades"
- Info Banner: "💡 Pista: Si llevas mayores cantidades, buscaremos precios al por mayor."
- Itemized List with Stepper Control (- / +):
  * Pollo: [ - ] 2 kg [ + ]
  * Huevos: [ - ] 30 und (1 plancha) [ + ]
  * Avena: [ - ] 1 kg [ + ]
- Primary CTA: "Continuar a Presupuesto ➔".

#### Screen 6: Step 3 - Budget Input (Presupuesto)
- Title: "Paso 3: Tu presupuesto"
- Prompt: "¿Cuánto planeas gastar en esta compra?"
- Large Number Input Field: "S/ 100.00"
- Quick Preset Chips: [ S/ 50 ] [ S/ 100 ] [ S/ 150 ] 
- Primary CTA: "🚀 Calcular Mejor Canasta".

#### Screen 7: Loading State (Generando tu Canasta AI)
- Central Visual: Smooth animated radar scanning a map.
- Title: "🤖 Analizando mercados en Cerro Colorado..."
- Dynamic text: "Evaluando precios al por mayor y menor..." / "Buscando en Mercado Río Seco y supermercados cercanos..."

#### Screen 8: Results & Comparison Dashboard (Comparación de Canastas)
- Header: "Tu Canasta: 5 productos | Presupuesto: S/ 100"
- Highlight Winner Card (Gold Border & Trophy Badge):
  * "🏆 MEJOR OPCIÓN (PRECIO MAYORISTA): Mercado Río Seco"
  * AI Insight Badge: "💡 Por la cantidad de huevos y pollo que llevas, te conviene comprar al por mayor aquí."
  * Total Price: "S/ 76.50" (Green text)
  * Savings badge: "🎉 Ahorras S/ 23.50 vs Supermercados"
  * Button: "Ver puestos exactos ➔"
- Secondary Options Cards:
  * "🥈 Supermercado Metro - Arequipa Center": Total S/ 94.00 
  * "🥉 Mercado Zonal Zamácola": Total S/ 88.20 

#### Screen 9: Basket Breakdown & Smart Route (Ruta de Compra)
- Header: "Mercado Mayorista Río Seco - S/ 76.50"
- Map graphic showing stall locations inside the market.
- Breakdown List (Product | Price | Exact Stall):
  * Huevos (1 plancha): S/ 16.00 ➔ 📍 Avícola El Sol (Puesto 112)
  * Pollo (2 kg): S/ 21.00 ➔ 📍 Carnes Doña Julia (Puesto 45)
  * Abarrotes: S/ 39.50 ➔ 📍 Distribuidora Gómez (Puesto 20)
- Primary Action CTA: "🗺️ Iniciar Ruta en el Mercado".

#### Screen 10: Store / Market Detail (Perfil del Puesto)
- Store Header Image: "Avícola El Sol - Mercado Río Seco"
- Info Chips: ⭐ 4.8 | 📍 Puesto 112, Zona Carnes.
- Price List: "Pollo Entero S/ 10.50 kg" | "Huevos Plancha S/ 16.00".
- Action Buttons: [ 📞 WhatsApp ] [ 🗺️ Ubicar Puesto ].

#### Screen 11: Merchant Redirection (Conexión)
- Modal Pop-up Card:
  * Title: "¿Quieres comprar en línea?"
  * Text: "Estás saliendo de Ca$erIA para ir a la web de Supermercado Metro / WhatsApp del vendedor."
  * Button: "Continuar".

#### Screen 12: Seller Dashboard (Panel del Comerciante Local)
- Header: "Ca$erIA Vendedores - Cono Norte"
- Store Setup Form: "Ubicación: Mercado Río Seco" | "Puesto: 112".
- Quick Pricing Update (Wholesale vs Retail logic):
  * "Huevos (Plancha 30 und)": Input box [ S/ 16.00 ] -> Toggle [Disponible].
  * "Huevos (Kilo)": Input box [ S/ 8.00 ] -> Toggle [Disponible].
- Stats Banner: "👁️ 120 jóvenes vieron tu puesto hoy porque ofreces el mejor precio mayorista."
- Action Button: "Actualizar Precios".