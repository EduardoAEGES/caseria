import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Idealmente el service_role_key para bypass RLS

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan credenciales de Supabase en el archivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de supermercados a scrapear
const STORE_PLAZA_VEA = 'plazavea';
// Puedes agregar 'tottus', 'franco', etc., aquí en el futuro.

async function scrapePlazaVea(browser, productName) {
  const page = await browser.newPage();
  let price = null;

  try {
    console.log(`Buscando "${productName}" en Plaza Vea...`);
    // Navegar a la página de búsqueda
    const searchUrl = `https://www.plazavea.com.pe/search/?_query=${encodeURIComponent(productName)}`;
    
    // Interceptar y bloquear imágenes/estilos para acelerar la carga
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Esperar a que carguen los resultados (la clase específica puede cambiar con el tiempo)
    // Plaza Vea suele usar clases como '.Showcase__salePrice' o similares
    await page.waitForSelector('.Showcase__salePrice, .price, .product-price', { timeout: 10000 });

    // Extraer el precio del primer resultado
    price = await page.evaluate(() => {
      const priceEl = document.querySelector('.Showcase__salePrice, .price, .product-price');
      if (!priceEl) return null;
      
      const rawText = priceEl.innerText || '';
      // Limpiar texto (ej. "S/ 4.20" -> 4.20)
      const match = rawText.match(/[\d,.]+/);
      if (match) {
        return parseFloat(match[0].replace(',', '.'));
      }
      return null;
    });

    if (price) {
      console.log(`✅ Precio encontrado: S/ ${price}`);
    } else {
      console.log(`⚠️ No se pudo extraer el precio.`);
    }

  } catch (err) {
    console.error(`❌ Error scrapeando "${productName}":`, err.message);
  } finally {
    await page.close();
  }

  return price;
}

async function runScraper() {
  console.log('🚀 Iniciando Scraper de Ca$erIA...\n');

  // 1. Obtener productos activos de la base de datos
  const { data: products, error } = await supabase
    .from('productos')
    .select('id, name')
    .eq('is_active', true);

  if (error) {
    console.error('Error obteniendo productos:', error);
    return;
  }

  console.log(`📦 Se encontraron ${products.length} productos para buscar.`);

  // 2. Iniciar navegador oculto
  const browser = await puppeteer.launch({
    headless: "new", // Usar el nuevo modo headless
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 3. Procesar cada producto
  for (const product of products) {
    // Escrapear Plaza Vea
    const pricePV = await scrapePlazaVea(browser, product.name);

    if (pricePV !== null) {
      // 4. Guardar en Supabase (Upsert en la tabla 'precios')
      const { error: upsertError } = await supabase
        .from('precios')
        .upsert(
          { 
            store_id: STORE_PLAZA_VEA, 
            product_id: product.id, 
            price: pricePV,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'store_id,product_id' }
        );

      if (upsertError) {
        console.error(`❌ Error guardando precio para ${product.name}:`, upsertError.message);
      } else {
        console.log(`💾 Precio guardado en Supabase para ${product.name}.`);
      }
    }
    
    // Pequeña pausa para no saturar el servidor del supermercado (Anti-Bot)
    await new Promise(r => setTimeout(r, 2000));
  }

  await browser.close();
  console.log('\n✅ Scrapeo finalizado.');
}

runScraper();
