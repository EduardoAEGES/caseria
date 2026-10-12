// "Tu bolsillo": compara el presupuesto del usuario con las opciones de compra de su canasta
// y arma consejos con reglas simples (sin servicios externos).
//
// Solo usa datos que ya existen en la app: precios de catalog.js (web de Tottus, Metro y Mass;
// referenciales en el resto), canastas rápidas de content.js, ofertas reales de los scrapers
// (realDeals) y pasajes referenciales de geo.js. No inventa precios, ofertas ni descuentos.

const CENT = 0.005;          // diferencias menores a medio céntimo se consideran empate
const BUDGET_MAX = 10000;    // tope razonable para una compra de canasta

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** "50", "50.5", "50,50" o "S/ 50" → 50.5. Devuelve null si no es un monto válido. */
function parseBudget(text) {
  let clean = String(text ?? "").trim().replace(/^s\/\s*/i, "").replace(/\s/g, "");
  if (clean.includes(",") && !clean.includes(".")) clean = clean.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const value = Number(clean);
  return value > 0 && value <= BUDGET_MAX ? round2(value) : null;
}

/** "under" (te sobra), "exact" (alcanza justo) u "over" (no alcanza). */
function budgetStatus(budget, total) {
  const gap = budget - total;
  return gap > CENT ? "under" : gap < -CENT ? "over" : "exact";
}

function storeNames(stores) {
  const names = stores.map(s => s.name);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} y ${names.at(-1)}` : names[0];
}

/**
 * Opciones de compra para la canasta, a partir de searchBestOffers:
 *   cheapest → la tienda más barata que tiene todo
 *   nearest  → la tienda más cercana que tiene todo (si no es la misma)
 *   combined → cada producto donde está más barato (si conviene ir a más de una tienda)
 */
function budgetOptions(result) {
  const { bestSingle, combined } = result;
  const nearest = result.offers.filter(o => o.complete).sort((a, b) => a.store.distMin - b.store.distMin)[0];
  const options = [];

  if (bestSingle) {
    options.push({
      key: "cheapest", title: nearest === bestSingle ? "Más económica y más cercana" : "Más económica en 1 tienda",
      stores: [bestSingle.store], total: bestSingle.total, complete: true,
    });
  }
  if (nearest && nearest !== bestSingle) {
    options.push({ key: "nearest", title: "Más cercana con todo", stores: [nearest.store], total: nearest.total, complete: true });
  }
  const combinedSaves = !bestSingle || combined.total < bestSingle.total - CENT;
  if ((combined.stops.length > 1 && combinedSaves) || (!bestSingle && combined.stops.length)) {
    options.push({
      key: "combined", title: combined.stops.length > 1 ? `Combinando ${combined.stops.length} tiendas` : "Lo que sí se encuentra",
      stores: combined.stops.map(stop => stop.store), total: combined.total,
      complete: combined.missing.length === 0, missing: combined.missing,
    });
  }
  return options;
}

/** Lo menos que cuesta la canasta (completa si se puede; si no, sin los productos que nadie vende). */
function cheapestCost(cart) {
  const result = searchBestOffers(cart);
  const totals = [];
  if (result.bestSingle) totals.push(result.bestSingle.total);
  if (result.combined.stops.length && !result.combined.missing.length) totals.push(result.combined.total);
  return totals.length ? Math.min(...totals) : result.combined.total;
}

/**
 * Compara el presupuesto con la canasta.
 * status: "empty" (sin productos) | "incomplete" (algún producto no lo vende nadie) | "under" | "exact" | "over"
 * recommended: opción sugerida (la de una sola tienda más barata que entra; si no, combinando)
 * left: lo que queda con la recomendada · short: lo que falta con la más barata
 */
function analyzeBudget(budget, cart) {
  const result = searchBestOffers(cart);
  const options = budgetOptions(result);
  const complete = options.filter(o => o.complete);
  const cheapest = complete.length ? complete.reduce((a, b) => (b.total < a.total ? b : a)) : null;
  const fitting = complete.filter(o => budgetStatus(budget, o.total) !== "over");
  const singles = fitting.filter(o => o.key !== "combined");
  const recommended = singles.length ? singles.reduce((a, b) => (b.total < a.total ? b : a)) : fitting[0] || null;

  let status = "over";
  if (!cart.length) status = "empty";
  else if (!cheapest) status = "incomplete";
  else if (recommended) status = budgetStatus(budget, recommended.total);

  return {
    result, options, cheapest, recommended, status,
    left: recommended ? round2(budget - recommended.total) : null,
    short: cheapest ? round2(cheapest.total - budget) : null,
    partialTotal: result.combined.total,
    missing: result.combined.missing,
  };
}

/** Forma más barata de llegar (solo ida) a esas tiendas, con los supuestos de TRAVEL. */
function cheapestTrip(stores) {
  const points = [geo.location, ...stores];
  const legs = points.slice(1).map((point, i) => estimateLeg(points[i], point));
  const options = travelOptions(legs);
  const trip = options.find(o => o.mode === "walk") || options.find(o => o.mode === "bus");
  return { ...trip, km: legs.reduce((sum, leg) => sum + leg.km, 0) };
}

/**
 * Plan para que la canasta entre en el presupuesto: primero baja cantidades y, si no basta,
 * quita productos. En cada paso elige el cambio más pequeño que ya alcanza; si ninguno alcanza,
 * el que más ahorra. Devuelve { steps: [{ product, from, to }], cart, total, empty } o null.
 */
function reductionPlan(budget, cart) {
  let work = cart.map(item => ({ ...item }));
  let total = cheapestCost(work);
  if (total <= budget + CENT) return null;

  while (total > budget + CENT && work.length) {
    const reductions = work.filter(item => item.qty > 1)
      .map(item => work.map(w => (w === item ? { ...w, qty: w.qty - 1 } : w)));
    const removals = work.map(item => work.filter(w => w !== item));
    const candidates = (reductions.length ? reductions : removals).map(next => ({ next, total: cheapestCost(next) }));
    const enough = candidates.filter(c => c.total <= budget + CENT).sort((a, b) => b.total - a.total);
    const pick = enough[0] || candidates.sort((a, b) => a.total - b.total)[0];
    work = pick.next;
    total = pick.total;
  }

  const steps = cart
    .map(item => ({ product: findProduct(item.productId), from: item.qty, to: (work.find(w => w.productId === item.productId) || { qty: 0 }).qty }))
    .filter(step => step.product && step.from !== step.to);
  return { steps, cart: work, total: round2(total), empty: work.length === 0 };
}

/** Canastas rápidas (content.js) que entran en el presupuesto, de la más barata a la más cara. */
function quickBasketsForBudget(budget) {
  const priced = QUICK_BASKETS.map((basket, index) => {
    const best = searchBestOffers(basket.items).bestSingle;
    return best ? { basket, index, total: best.total, store: best.store, left: round2(budget - best.total) } : null;
  }).filter(Boolean).sort((a, b) => a.total - b.total);
  return { fitting: priced.filter(b => b.total <= budget + CENT), cheapest: priced[0] || null };
}

/** Consejos en texto (HTML) para la situación de la canasta. */
function budgetTips(budget, analysis) {
  const tips = [];
  const { status, recommended, cheapest, options } = analysis;
  const nearest = options.find(o => o.key === "nearest");
  const combined = options.find(o => o.key === "combined" && o.complete);

  if (status === "empty") {
    tips.push({ icon: "cart", text: "Agrega productos a tu canasta para calcular cuánto te queda." });
    return tips;
  }

  if (status === "incomplete") {
    const names = analysis.missing.map(p => p.name).join(", ");
    const partial = budgetStatus(budget, analysis.partialTotal);
    tips.push({ icon: "alert", tone: "warn", text: `Ninguna tienda consultada tiene <strong>${names}</strong>, así que no hay una opción con toda tu canasta.` });
    tips.push({
      icon: "wallet",
      text: `Sin ese producto, la canasta cuesta desde ${money(analysis.partialTotal)}: ${partial === "over"
        ? `te faltarían <strong>${money(analysis.partialTotal - budget)}</strong>.`
        : `te quedarían <strong>${money(budget - analysis.partialTotal)}</strong>.`}`,
    });
    return tips;
  }

  if (status === "under" || status === "exact") {
    const where = recommended.key === "combined"
      ? `Combina <strong>${storeNames(recommended.stores)}</strong>`
      : `Compra todo en <strong>${recommended.stores[0].name}</strong>`;
    tips.push({
      icon: "check", tone: "good",
      text: status === "exact"
        ? `${where} por ${money(recommended.total)}: te alcanza justo, no te sobra nada.`
        : `${where} por ${money(recommended.total)}: te quedarán <strong>${money(analysis.left)}</strong>.`,
    });

    if (combined && recommended.key !== "combined" && combined.total < recommended.total - CENT && budgetStatus(budget, combined.total) !== "over") {
      tips.push({
        icon: "wallet",
        text: `Si combinas ${combined.stores.length} tiendas (${storeNames(combined.stores)}) pagas ${money(combined.total)} y te quedarían ${money(budget - combined.total)}, pero tendrías que hacer ${combined.stores.length} paradas.`,
      });
    }

    if (nearest && nearest !== recommended) {
      const nearStatus = budgetStatus(budget, nearest.total);
      const store = nearest.stores[0];
      tips.push({
        icon: "map-pin",
        text: nearStatus === "over"
          ? `La más cercana, ${store.name} (${formatKm(store.km)}), cuesta ${money(nearest.total)}: se pasa de tu presupuesto por ${money(nearest.total - budget)}.`
          : `La más cercana, ${store.name} (${formatKm(store.km)}), cuesta ${money(nearest.total)}: te quedarían ${money(budget - nearest.total)}.`,
      });
    }

    const trip = cheapestTrip(recommended.stores);
    if (trip.mode === "walk") {
      tips.push({ icon: "walk", text: `Queda a ${formatKm(trip.km)}: puedes ir a pie y no gastas en pasaje.` });
    } else {
      const afterFare = analysis.left - trip.fare;
      tips.push({
        icon: "bus", tone: afterFare < -CENT ? "warn" : "",
        text: afterFare < -CENT
          ? `Ojo: la ida en combi cuesta ${money(trip.fare)} (pasaje referencial) y con eso ya no te alcanzaría. Elige una tienda más cercana o baja alguna cantidad.`
          : `La ida en combi cuesta ${money(trip.fare)} (pasaje referencial): después del pasaje te quedarían ${money(afterFare)}.`,
      });
    }

    if (status === "exact") {
      tips.push({ icon: "info", text: "Como te alcanza justo, deja un pequeño margen: si un precio sube en la tienda ya no te alcanzaría." });
    }
    return tips;
  }

  // status === "over": ninguna opción completa entra en el presupuesto.
  const cheapestWhere = cheapest.key === "combined" ? `combinando ${storeNames(cheapest.stores)}` : cheapest.stores[0].name;
  tips.push({ icon: "alert", tone: "warn", text: `La opción más económica (${cheapestWhere}) cuesta ${money(cheapest.total)}: te faltan <strong>${money(analysis.short)}</strong>.` });
  const nearOrSingle = nearest || options.find(o => o.key === "cheapest" && o !== cheapest);
  if (nearOrSingle) {
    const label = nearOrSingle.key === "nearest" ? "La más cercana" : "Comprando todo en una tienda, la más barata";
    tips.push({ icon: "map-pin", text: `${label}, ${nearOrSingle.stores[0].name}, cuesta ${money(nearOrSingle.total)}: también supera tu presupuesto.` });
  }
  tips.push({ icon: "list", text: "Revisa tus productos: ¿necesitas todos hoy? Puedes quitar algunos o comprarlos en otra salida." });
  tips.push({ icon: "refresh", text: "Vuelve a consultar más tarde: los precios web de Tottus, Metro y Mass se actualizan cada día." });
  return tips;
}

/** Mensaje del robot asistente según la pantalla y la situación del presupuesto. */
function assistantMessage(where) {
  if (state.budget == null) {
    return {
      key: "ask",
      text: "¿Cuánto dinero tienes para esta compra? Te ayudaré a encontrar la mejor opción.",
      action: { label: "Ingresar mi presupuesto", name: "openBudget" },
    };
  }
  const cart = getCart();
  if (!cart.length) {
    return { key: "empty", text: `Tienes ${money(state.budget)} para esta compra. Elige tus productos y te diré cuánto te queda.` };
  }

  const analysis = analyzeBudget(state.budget, cart);
  const building = where === "select" || where === "quantities";
  const toPocket = where === "results" ? { label: "Ver Tu bolsillo", name: "showBolsillo" } : null;

  if (analysis.status === "under") {
    return {
      key: "under",
      text: building
        ? `Vas bien: tu canasta cuesta desde ${money(analysis.recommended.total)}. Te quedarían ${money(analysis.left)}.`
        : `¡Encontramos una opción para ti! Te quedarán ${money(analysis.left)}.`,
      action: toPocket,
    };
  }
  if (analysis.status === "exact") {
    return { key: "exact", text: `¡Te alcanza justo! La canasta cuesta ${money(analysis.recommended.total)} y no te sobra nada.`, action: toPocket };
  }
  if (analysis.status === "incomplete") {
    return { key: "incomplete", text: "Hay productos que ninguna tienda tiene. Revisa tu canasta y te digo cuánto te queda.", action: toPocket };
  }
  return {
    key: "over",
    text: building
      ? `Tu canasta ya supera tu presupuesto por ${money(analysis.short)}. Revisa cantidades o productos.`
      : "Esta canasta supera tu presupuesto. Revisemos otras alternativas.",
    action: where === "bolsillo" ? { label: "Ajustar mi canasta", name: "applyPlan" } : toPocket,
  };
}
