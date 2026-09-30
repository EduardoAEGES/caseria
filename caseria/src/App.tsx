import { useState, useEffect } from "react";
import caseriLogo from "@/imports/annotation-reference.png";

type Screen =
  | "intro" | "onboarding1" | "onboarding2" | "onboarding3" | "splash" | "permission" | "register" | "home"
  | "monthlybudget" | "purchasebudget" | "select" | "quantbudget" | "budget" | "loading" | "results"
  | "stallstandard" | "stallpremium" | "stallmap"
  | "mislistas" | "buyerprofile" | "scanner";

type District = "paucarpata";

const PRODUCTS = [
  { id: 1, name: "Arroz 1kg",    unit: "kg",      cat: "Abarrotes", emoji: "🍚", price: 3.5  },
  { id: 2, name: "Pollo",        unit: "kg",      cat: "Carnes",    emoji: "🍗", price: 10.5 },
  { id: 3, name: "Huevos x30",   unit: "plancha", cat: "Lácteos",   emoji: "🥚", price: 16.0 },
  { id: 4, name: "Papa Canchan", unit: "kg",      cat: "Verduras",  emoji: "🥔", price: 2.0  },
  { id: 5, name: "Tomate",       unit: "kg",      cat: "Verduras",  emoji: "🍅", price: 2.8  },
  { id: 6, name: "Avena",        unit: "kg",      cat: "Abarrotes", emoji: "🌾", price: 4.2  },
  { id: 7, name: "Leche",        unit: "lt",      cat: "Lácteos",   emoji: "🥛", price: 3.0  },
  { id: 8, name: "Plátano",      unit: "kg",      cat: "Frutas",    emoji: "🍌", price: 1.5  },
  { id: 9, name: "Cebolla",      unit: "kg",      cat: "Verduras",  emoji: "🧅", price: 2.2  },
  { id: 10,name: "Aceite",       unit: "lt",      cat: "Abarrotes", emoji: "🫙", price: 7.0  },
  { id: 11,name: "Fideos",       unit: "paquete", cat: "Abarrotes", emoji: "🍝", price: 4.8  },
  { id: 12,name: "Atún",         unit: "lata",    cat: "Abarrotes", emoji: "🥫", price: 6.5  },
  { id: 13,name: "Azúcar",       unit: "kg",      cat: "Abarrotes", emoji: "🍬", price: 4.0  },
];

const CATEGORIES = ["Todos", "🥩 Carnes", "🥬 Verduras", "🍚 Abarrotes", "🥛 Lácteos", "🍎 Frutas"];

type CompareOption = {
  rank: string; name: string; total: string; totalNum: number;
  badge: string; type: string; savings?: string;
  distance: string; distMin: number;
  freshness: string; freshnessLevel: "ok" | "warn" | "bad";
  available: boolean; allProducts: boolean;
  address: string; district: string;
  x: number; y: number;
};

type Purchase = { date: string; store: string; amount: number };

type DistrictInfo = {
  label: string;
  supermarkets: { name: string; tag: string; emoji: string }[];
  minimarkets:  { name: string; tag: string; emoji: string }[];
  options: CompareOption[];
};

const DISTRICT_DATA: Record<District, DistrictInfo> = {
  paucarpata: {
    label: "Paucarpata",
    supermarkets: [
      { name: "Tottus Porongoche",    tag: "Supermercado",        emoji: "🛒" },
      { name: "Plaza Vea",            tag: "Supermercado",        emoji: "🏬" },
      { name: "Franco Supermercados", tag: "Supermercado",        emoji: "🏪" },
    ],
    minimarkets: [
      { name: "Tiendas Mass – Porongoche", tag: "Tienda de descuento", emoji: "🏷️" },
      { name: "Tiendas Mass – Los Andes",  tag: "Tienda de descuento", emoji: "🏷️" },
    ],
    options: [
      { rank: "🏆", name: "Tiendas Mass – Porongoche", total: "S/ 76.50", totalNum: 76.50, badge: "Descuento", type: "discount", savings: "S/ 23.50", distance: "600 m · 8 min",   distMin: 8,  freshness: "Actualizado hoy",  freshnessLevel: "ok",   available: true, allProducts: true,  address: "Av. Los Incas 320, Paucarpata",          district: "Paucarpata", x: 28, y: 38 },
      { rank: "🥈", name: "Tiendas Mass – Los Andes",  total: "S/ 78.00", totalNum: 78.00, badge: "Descuento", type: "discount",               distance: "1.1 km · 14 min", distMin: 14, freshness: "Actualizado hoy",  freshnessLevel: "ok",   available: true, allProducts: false, address: "Av. Los Andes 210, Paucarpata",          district: "Paucarpata", x: 20, y: 60 },
      { rank: "🥉", name: "Franco Supermercados",       total: "S/ 82.00", totalNum: 82.00, badge: "Super",     type: "super",                  distance: "900 m · 12 min",  distMin: 12, freshness: "Actualizado hoy",  freshnessLevel: "ok",   available: true, allProducts: true,  address: "Av. Porongoche 450, Paucarpata",         district: "Paucarpata", x: 62, y: 28 },
      { rank: "4",  name: "Plaza Vea",                  total: "S/ 87.50", totalNum: 87.50, badge: "Super",     type: "super",                  distance: "1.4 km · 17 min", distMin: 17, freshness: "Actualizado ayer", freshnessLevel: "warn", available: true, allProducts: true,  address: "C.C. Porongoche, Paucarpata",            district: "Paucarpata", x: 45, y: 55 },
      { rank: "5",  name: "Tottus Porongoche",          total: "S/ 94.00", totalNum: 94.00, badge: "Super",     type: "super",                  distance: "1.8 km · 22 min", distMin: 22, freshness: "Actualizado ayer", freshnessLevel: "warn", available: true, allProducts: true,  address: "C.C. Real Plaza Porongoche, Paucarpata", district: "Paucarpata", x: 70, y: 45 },
    ],
  },
};

const STORE_PRICE_FACTORS: Record<string, number[]> = {
  "Tottus Porongoche": [1.08, 0.98, 1.04, 1.06, 1.03, 1.04, 1.02, 1.05, 1.02, 1.06, 1.04, 1.03, 1.02],
  "Plaza Vea": [1.00, 1.05, 0.99, 1.02, 0.97, 1.03, 0.98, 1.01, 1.04, 1.00, 0.98, 1.02, 1.04],
  "Franco Supermercados": [0.97, 0.94, 0.96, 0.98, 1.01, 0.95, 0.99, 0.97, 0.95, 0.99, 1.01, 0.96, 0.98],
  "Tiendas Mass – Porongoche": [0.93, 1.03, 0.98, 1.04, 1.05, 0.97, 0.95, 0.94, 0.96, 0.92, 0.93, 1.04, 0.94],
};

function comparisonTotal(store: string, selected: number[], quantities: Record<number, number>) {
  const factors = STORE_PRICE_FACTORS[store];
  return PRODUCTS.filter(product => selected.includes(product.id)).reduce((total, product) => total + product.price * (quantities[product.id] ?? 1) * factors[product.id - 1], 0);
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold ${dark ? "text-white/60" : "text-[#1E293B]"}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1.5"><span>●●●●</span><span>WiFi</span><span>🔋</span></div>
    </div>
  );
}
function GreenBadge({ label }: { label: string }) {
  return <span className="text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded-full">{label}</span>;
}
function OrangeBadge({ label }: { label: string }) {
  return <span className="text-xs font-bold text-[#C05621] bg-[#FFF3E0] px-2.5 py-1 rounded-full">{label}</span>;
}
function BudgetDonut({ budgetVal, estimatedCost }: { budgetVal: number; estimatedCost: number }) {
  const r = 52, circ = 2 * Math.PI * r;
  const usedPct = budgetVal > 0 ? (estimatedCost / budgetVal) * 100 : 0;
  const pct = Math.min(usedPct / 100, 1);
  const arc = circ * pct;
  const available = budgetVal - estimatedCost;
  const isOver = estimatedCost > budgetVal;
  const isTight = !isOver && budgetVal > 0 && available < budgetVal * 0.1;
  const arcColor = isOver ? "#EF4444" : isTight ? "#F59E0B" : "#22C55E";
  const centerColor = isOver ? "#EF4444" : "#1E293B";
  const trackColor = isOver ? "#FEE2E2" : "#E2E8F0";
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke={trackColor} strokeWidth="14" />
      {budgetVal > 0 && (
        <circle cx="70" cy="70" r={r} fill="none" stroke={arcColor} strokeWidth="14"
          strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round"
          transform="rotate(-90 70 70)" />
      )}
      <text x="70" y="63" textAnchor="middle" fill={centerColor} fontSize="13" fontWeight="800" fontFamily="Inter">
        {budgetVal > 0 ? `${Math.round(usedPct)}%` : "S/ —"}
      </text>
      <text x="70" y="78" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="Inter">
        {budgetVal > 0 ? "del presupuesto" : "sin definir"}
      </text>
    </svg>
  );
}

function BudgetEditorSheet({ budget, onSave, onClose }: { budget: string; onSave: (value: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(budget);
  const validAmount = Number.parseFloat(draft) > 0;

  const save = () => {
    if (!validAmount) return;
    onSave(draft);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div className="w-full rounded-t-3xl bg-white px-6 pb-7 pt-3 shadow-2xl slide-up" onClick={event => event.stopPropagation()}>
        <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-[#E2E8F0]" />
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-[#1E293B]">Define tu presupuesto</h2>
            <p className="mt-1 text-sm text-[#64748B]">¿Cuánto deseas gastar en esta compra?</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9] font-bold text-[#64748B]">✕</button>
        </div>
        <label className="mb-4 flex items-center gap-2 rounded-2xl border-2 border-[#0B63E5]/25 bg-[#EEF4FF]/40 px-4 py-3 focus-within:border-[#0B63E5]">
          <span className="text-2xl font-black text-[#0B63E5]">S/</span>
          <input
            autoFocus
            inputMode="decimal"
            type="number"
            min="0"
            step="0.01"
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="0.00"
            className="min-w-0 flex-1 bg-transparent text-3xl font-black text-[#1E293B] outline-none"
          />
        </label>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#64748B]">Montos rápidos</p>
        <div className="mb-6 grid grid-cols-4 gap-2">
          {["50", "100", "150", "200"].map(amount => (
            <button key={amount} onClick={() => setDraft(amount)} className={`rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95 ${draft === amount ? "bg-[#0B63E5] text-white shadow shadow-[#0B63E5]/30" : "bg-[#F1F5F9] text-[#475569]"}`}>
              S/ {amount}
            </button>
          ))}
        </div>
        <button onClick={save} disabled={!validAmount} className="w-full rounded-2xl bg-[#0B63E5] py-4 text-base font-bold text-white shadow-lg shadow-[#0B63E5]/25 transition-transform active:scale-95 disabled:opacity-40">
          Guardar presupuesto
        </button>
      </div>
    </div>
  );
}
function HomeDonut({ usedPct, isOver }: { usedPct: number; isOver: boolean }) {
  const r = 30, circ = 2 * Math.PI * r;
  const arc = circ * Math.min(usedPct / 100, 1);
  const color = isOver ? "#EF4444" : usedPct > 90 ? "#F59E0B" : "#22C55E";
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke={isOver ? "#FEE2E2" : "#E2E8F0"} strokeWidth="9" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" transform="rotate(-90 36 36)" />
      <text x="36" y="33" textAnchor="middle" fill={color} fontSize="11" fontWeight="800" fontFamily="Inter">
        {Math.round(Math.min(usedPct, 999))}%
      </text>
      <text x="36" y="44" textAnchor="middle" fill="#94A3B8" fontSize="7.5" fontFamily="Inter">usado</text>
    </svg>
  );
}

function MonthlyDonut({ monthlyBudget, spent }: { monthlyBudget: number; spent: number }) {
  const r = 58, circ = 2 * Math.PI * r;
  const rawPct = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;
  const pct = Math.min(rawPct, 100);
  const remaining = monthlyBudget - spent;
  const over = spent > monthlyBudget;
  const tight = !over && monthlyBudget > 0 && remaining < monthlyBudget * 0.2;
  const color = over ? "#EF4444" : tight ? "#F59E0B" : "#0B63E5";
  return (
    <div className="flex flex-col items-center">
      <svg width="164" height="164" viewBox="0 0 164 164">
        <circle cx="82" cy="82" r={r} fill="none" stroke={over ? "#FEE2E2" : "#E2E8F0"} strokeWidth="15" />
        <circle cx="82" cy="82" r={r} fill="none" stroke={color} strokeWidth="15" strokeLinecap="round"
          strokeDasharray={`${circ * pct / 100} ${circ - circ * pct / 100}`} transform="rotate(-90 82 82)" />
        <text x="82" y="78" textAnchor="middle" fill={color} fontSize="24" fontWeight="800" fontFamily="Inter">{Math.round(rawPct)}%</text>
        <text x="82" y="98" textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="Inter">utilizado este mes</text>
      </svg>
      <p className={`-mt-2 text-sm font-black ${over ? "text-[#EF4444]" : "text-[#15803D]"}`}>{over ? `Excede S/ ${Math.abs(remaining).toFixed(2)}` : `S/ ${remaining.toFixed(2)} disponibles`}</p>
    </div>
  );
}

function PurchaseBudgetScreen({ monthlyAvailable, budget, setBudget, onNext, onBack }: { monthlyAvailable: number; budget: string; setBudget: (value: string) => void; onNext: () => void; onBack: () => void }) {
  const value = Number.parseFloat(budget) || 0;
  const exceedsMonth = value > monthlyAvailable;
  return <div className="flex h-full flex-col overflow-hidden bg-[#F8FAFC]">
    <StatusBar />
    <div className="flex items-center gap-3 border-b border-[#E2E8F0] bg-white px-6 pb-4 pt-3"><button onClick={onBack} className="text-lg text-[#1E293B]">←</button><div><p className="text-xs font-medium text-[#94A3B8]">Nueva canasta</p><h1 className="text-base font-bold text-[#1E293B]">Define tu compra</h1></div></div>
    <div className="flex-1 overflow-y-auto px-6 py-5 hide-scrollbar">
      <div className="mb-5 rounded-2xl border border-[#0B63E5]/15 bg-[#EEF4FF] p-4"><p className="text-xs font-semibold text-[#0B63E5]">Disponible este mes</p><p className="mt-1 text-2xl font-black text-[#1E293B]">S/ {monthlyAvailable.toFixed(2)}</p><p className="mt-1 text-xs text-[#64748B]">Este monto solo se descuenta cuando confirmes una compra real.</p></div>
      <div className="rounded-2xl border-2 border-[#0B63E5]/20 bg-white p-5 shadow-sm"><p className="mb-4 text-center text-sm font-bold text-[#475569]">¿Cuánto deseas gastar en esta compra?</p><label className="mb-3 flex items-center justify-center gap-2 border-b-4 border-[#0B63E5]/25 pb-2 focus-within:border-[#0B63E5]"><span className="text-3xl font-black text-[#0B63E5]">S/</span><input type="number" min="0" step="0.01" inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)} className="w-44 bg-transparent text-center text-5xl font-black text-[#1E293B] outline-none" placeholder="0" /></label><p className="mb-5 text-center text-xs text-[#94A3B8]">Presupuesto para esta compra</p><div className="grid grid-cols-4 gap-2">{["50","100","150","200"].map(amount => <button key={amount} onClick={() => setBudget(amount)} className={`rounded-xl py-2.5 text-sm font-bold ${budget===amount ? "bg-[#0B63E5] text-white" : "bg-[#F1F5F9] text-[#475569]"}`}>S/ {amount}</button>)}</div></div>
      {exceedsMonth && <div className="mt-4 rounded-2xl border border-[#F59E0B]/25 bg-[#FFF3E0] p-4 text-sm font-semibold text-[#92400E]">Tu presupuesto para esta compra supera los S/ {monthlyAvailable.toFixed(2)} disponibles este mes.</div>}
    </div>
    <div className="border-t border-[#E2E8F0] bg-white px-6 pb-2 pt-3"><button disabled={value <= 0} onClick={onNext} className="w-full rounded-2xl bg-[#0B63E5] py-4 font-bold text-white shadow-lg shadow-[#0B63E5]/25 disabled:opacity-40">Elegir productos →</button></div>
  </div>;
}

function MonthlyBudgetScreen({ monthlyBudget, spent, purchases, setMonthlyBudget, onBack }: { monthlyBudget: string; spent: number; purchases: Purchase[]; setMonthlyBudget: (value: string) => void; onBack: () => void }) {
  const [editing, setEditing] = useState(false);
  const value = Number.parseFloat(monthlyBudget) || 0;
  const available = value - spent;
  return <div className="flex h-full flex-col overflow-hidden bg-[#F8FAFC]"><StatusBar /><div className="flex items-center gap-3 border-b border-[#E2E8F0] bg-white px-6 pb-4 pt-3"><button onClick={onBack} className="text-lg text-[#1E293B]">←</button><div><p className="text-xs text-[#94A3B8]">Control mensual</p><h1 className="text-base font-bold text-[#1E293B]">Mi presupuesto</h1></div></div><div className="flex-1 overflow-y-auto px-6 py-5 hide-scrollbar"><div className="rounded-3xl bg-white p-5 shadow-sm border border-[#E2E8F0]"><p className="text-xs font-bold uppercase tracking-wide text-[#475569]">Mi presupuesto de alimentos</p><div className="my-4 flex justify-center"><MonthlyDonut monthlyBudget={value} spent={spent} /></div><div className="space-y-3 border-t border-[#F1F5F9] pt-4 text-sm"><div className="flex justify-between"><span className="text-[#64748B]">Presupuesto mensual</span><strong>S/ {value.toFixed(2)}</strong></div><div className="flex justify-between"><span className="text-[#64748B]">Gastado este mes</span><strong>S/ {spent.toFixed(2)}</strong></div><div className="flex justify-between"><span className="text-[#64748B]">Disponible</span><strong className={available < 0 ? "text-[#EF4444]" : "text-[#15803D]"}>{available < 0 ? `Excede S/ ${Math.abs(available).toFixed(2)}` : `S/ ${available.toFixed(2)}`}</strong></div></div><button onClick={() => setEditing(true)} className="mt-5 w-full rounded-2xl border-2 border-[#0B63E5] py-3 text-sm font-bold text-[#0B63E5]">Editar presupuesto mensual</button></div><div className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-4"><div className="mb-3 flex items-center justify-between"><p className="font-bold text-[#1E293B]">Compras de este mes</p><span className="text-xs font-semibold text-[#0B63E5]">S/ {spent.toFixed(2)}</span></div>{purchases.length ? purchases.map((purchase, i) => <div key={`${purchase.date}-${i}`} className="flex items-center justify-between border-t border-[#F1F5F9] py-3"><div><p className="text-sm font-semibold text-[#1E293B]">{purchase.store}</p><p className="text-xs text-[#94A3B8]">{purchase.date}</p></div><strong className="text-sm">S/ {purchase.amount.toFixed(2)}</strong></div>) : <p className="text-sm text-[#64748B]">Aún no registras compras este mes.</p>}</div></div>{editing && <BudgetEditorSheet budget={monthlyBudget} onSave={setMonthlyBudget} onClose={() => setEditing(false)} />}</div>;
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BuyerNav({ screen, onNav }: { screen: Screen; onNav: (s: Screen) => void }) {
  const items = [
    { label: "Inicio", icon: "🏠", s: "home" as Screen },
    { label: "Presupuesto", icon: "💰", s: "monthlybudget" as Screen },
    { label: "Mi canasta", icon: "🛒", s: "purchasebudget" as Screen },
    { label: "Comparar", icon: "📊", s: "results" as Screen },
    { label: "Perfil", icon: "👤", s: "buyerprofile" as Screen },
  ];
  const isActive = (s: Screen) =>
    s === "home"    ? screen === "home" :
    s === "monthlybudget" ? screen === "monthlybudget" :
    s === "purchasebudget" ? ["purchasebudget","select","quantbudget","budget","loading"].includes(screen) :
    s === "results" ? ["results","stallstandard","stallpremium","stallmap","mislistas"].includes(screen) :
    ["buyerprofile","scanner"].includes(screen);

  return (
    <div className="flex-shrink-0 bg-white border-t border-[#E2E8F0] px-2 pb-5 pt-2 flex items-center justify-around">
      {items.map(n => (
        <button key={n.label} onClick={() => onNav(n.s)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${isActive(n.s) ? "text-[#0B63E5]" : "text-[#94A3B8]"}`}>
          <span className="text-xl">{n.icon}</span>
          <span className="text-xs font-semibold">{n.label}</span>
          {isActive(n.s) && <div className="w-1 h-1 rounded-full bg-[#0B63E5]" />}
        </button>
      ))}
    </div>
  );
}

// ─── Web Redirect Modal ───────────────────────────────────────────────────────
function WebRedirectModal({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={onClose}>
      <div className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div />
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] font-bold text-base">✕</button>
        </div>
        <div className="flex flex-col items-center px-5 pb-5">
          <div className="w-20 h-20 rounded-2xl bg-[#EEF4FF] border border-[#0B63E5]/15 flex items-center justify-center mb-4 shadow-sm">
            <span className="text-4xl">🌐</span>
          </div>
          <h2 className="text-lg font-black text-[#1E293B] text-center mb-2">Redirección a tienda externa</h2>
          <p className="text-xs text-[#64748B] text-center leading-relaxed mb-4">
            Te redirigiremos a la página web oficial de{" "}
            <span className="font-bold text-[#1E293B]">{name}</span> para realizar tu compra online. Tu lista en Ca$erIA se guardará automáticamente.
          </p>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 mb-5 w-full">
            <span className="text-lg">🏢</span>
            <div>
              <p className="text-xs text-[#94A3B8] font-medium">Establecimiento</p>
              <p className="text-sm font-bold text-[#1E293B]">{name}</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-[#22C55E]" />
          </div>
          <div className="flex items-start gap-2 bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-xl px-3 py-2.5 mb-5 w-full">
            <span className="text-sm flex-shrink-0">ℹ️</span>
            <p className="text-xs text-[#92400E] leading-relaxed">
              Los precios en la web pueden diferir de los comparados por Ca$erIA. Se abrirá en tu navegador.
            </p>
          </div>
          <button onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[#0B63E5] text-white font-bold text-base shadow-lg shadow-[#0B63E5]/25 active:scale-95 transition-transform mb-2 flex items-center justify-center gap-2">
            Ir a la Web Externa ↗
          </button>
          <button onClick={onClose}
            className="w-full py-3 rounded-2xl text-[#64748B] font-semibold text-sm active:scale-95 transition-transform">
            Volver a Ca$erIA
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── District Modal (simplificado — solo Paucarpata) ──────────────────────────
function DistrictModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl p-6 slide-up" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-black text-[#1E293B] mb-1">Distrito activo</h2>
        <p className="text-xs text-[#94A3B8] mb-4">Zona de validación actual de Ca$erIA.</p>
        <div className="p-4 rounded-2xl border-2 border-[#0B63E5] bg-[#EEF4FF] flex items-center gap-3 mb-4">
          <span className="text-xl">📍</span>
          <div className="flex-1">
            <p className="font-bold text-[#1E293B] text-sm">Paucarpata, Arequipa</p>
            <p className="text-xs text-[#0B63E5]">Tottus · Plaza Vea · Franco · Tiendas Mass</p>
          </div>
          <div className="w-5 h-5 rounded-full bg-[#0B63E5] flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
        <div className="flex items-start gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 mb-5">
          <span className="text-sm flex-shrink-0">🕐</span>
          <p className="text-xs text-[#64748B] leading-relaxed">Próximamente ampliaremos cobertura a otros distritos de Arequipa.</p>
        </div>
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl bg-[#0B63E5] text-white font-bold text-sm active:scale-95 transition-transform">
          Entendido
        </button>
      </div>
    </div>
  );
}

// ─── Intro Splash ─────────────────────────────────────────────────────────────
function IntroScreen({ onNext }: { onNext: () => void }) {
  const [dotIdx, setDotIdx] = useState(0);

  useEffect(() => {
    const dot = setInterval(() => setDotIdx(i => (i + 1) % 3), 500);
    const go  = setTimeout(onNext, 2400);
    return () => { clearInterval(dot); clearTimeout(go); };
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-between bg-white py-16 px-8">
      <div />
      <div className="flex flex-col items-center gap-6">
        <div className="w-44 h-44 rounded-full bg-white border-4 border-[#E2E8F0] shadow-2xl shadow-[#0B63E5]/10 overflow-hidden flex items-center justify-center">
          <img src={caseriLogo} alt="Ca$erIA logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-5xl font-black text-[#1E293B] tracking-tight">Ca</span>
            <span className="text-5xl font-black text-[#FF9800] tracking-tight">$</span>
            <span className="text-5xl font-black text-[#1E293B] tracking-tight">erIA</span>
          </div>
          <p className="text-base font-semibold text-[#475569] tracking-wide mt-1">Haz rendir tu dinero.</p>
        </div>
        <div className="flex items-center gap-5 mt-2 opacity-30">
          {["🛒","🥬","🏪","💰","🍗"].map((e, i) => (
            <span key={i} className="text-2xl">{e}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 pb-4">
        {[0,1,2].map(i => (
          <div key={i} className={`rounded-full transition-all duration-300 ${i === dotIdx ? "w-6 h-2.5 bg-[#0B63E5]" : "w-2.5 h-2.5 bg-[#CBD5E1]"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
type OnboardingStep = 1 | 2 | 3;

function OnboardingIllustration({ step }: { step: OnboardingStep }) {
  if (step === 1) {
    return (
      <div className="relative h-72 w-full max-w-[320px]" aria-hidden="true">
        <div className="absolute left-2 top-12 h-44 w-36 rotate-[-7deg] rounded-[26px] border border-white/15 bg-[#123E82]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold tracking-wider text-blue-200">TIENDA MASS</span><span className="text-base">🏷️</span></div>
          <div className="mb-2 h-2 w-16 rounded-full bg-white/20" />
          <div className="mb-4 h-2 w-24 rounded-full bg-white/10" />
          <div className="border-t border-white/10 pt-3"><p className="text-[11px] text-blue-100">Tu canasta</p><p className="text-xl font-black text-white">S/ 76.50</p></div>
        </div>
        <div className="absolute right-1 top-5 z-10 h-48 w-40 rotate-[7deg] rounded-[28px] border border-white/25 bg-white p-4 shadow-2xl shadow-[#04142F]/60">
          <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold tracking-wider text-[#0B63E5]">TOTTUS</span><span className="text-base">🛒</span></div>
          <div className="mb-2 h-2 w-20 rounded-full bg-slate-100" />
          <div className="mb-4 h-2 w-24 rounded-full bg-slate-100" />
          <div className="border-t border-slate-100 pt-3"><p className="text-[11px] text-slate-400">Tu canasta</p><p className="text-xl font-black text-[#10254A]">S/ 94.00</p></div>
        </div>
        <div className="absolute bottom-1 left-1/2 z-20 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-[28px] border border-[#8CD5FF]/50 bg-gradient-to-br from-[#29B6F6] to-[#0B63E5] text-4xl shadow-xl shadow-[#061D49]/70">🛒</div>
        <div className="absolute bottom-8 left-[22%] h-px w-14 rotate-[28deg] bg-[#78C9FF]/70" />
        <div className="absolute bottom-9 right-[21%] h-px w-14 -rotate-[28deg] bg-[#78C9FF]/70" />
        <div className="absolute bottom-0 left-[45%] rounded-full bg-[#19C56B] px-3 py-1 text-[10px] font-extrabold text-[#062D24] shadow-lg">AHORRAS S/ 17.50</div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="relative h-72 w-full max-w-[320px]" aria-hidden="true">
        <div className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full border border-[#8DD8FF]/35 bg-[#0D3A7B]/80 px-5 py-2 text-sm font-black tracking-wide text-white shadow-xl shadow-black/20">S/ 100.00</div>
        <div className="absolute left-1/2 top-12 h-24 w-24 -translate-x-1/2 rounded-full border-[9px] border-[#123E82] border-t-[#35BDF8] border-r-[#35BDF8] bg-[#071D43] shadow-[0_0_38px_rgba(40,180,255,0.3)]"><span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">68%</span></div>
        <div className="absolute left-7 top-[125px] flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/15 bg-[#123E82]/80 text-4xl shadow-xl">🥬</div>
        <div className="absolute right-7 top-[125px] flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/15 bg-[#123E82]/80 text-4xl shadow-xl">🍗</div>
        <div className="absolute bottom-4 left-1/2 flex h-28 w-40 -translate-x-1/2 items-end justify-center rounded-b-[32px] border-[6px] border-t-0 border-[#70C8FF] bg-[#0A4FB5]/35 pb-3 text-5xl shadow-[0_15px_30px_rgba(0,0,0,0.25)]">🛒</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-[#21C879]/30 bg-[#0B3A39] px-3 py-1 text-[10px] font-bold text-[#79F2B2]">S/ 32.00 disponibles</div>
      </div>
    );
  }

  return (
    <div className="relative h-72 w-full max-w-[320px]" aria-hidden="true">
      <div className="absolute left-1/2 top-2 h-48 w-36 -translate-x-1/2 rounded-[30px] border-[5px] border-[#8DCAFF] bg-[#061C42] p-2 shadow-2xl shadow-black/50">
        <div className="h-full rounded-[20px] bg-gradient-to-b from-[#207CCB] to-[#0B3D91] p-3">
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-white/35"><span className="text-6xl drop-shadow-lg">🍅</span><span className="mt-3 rounded-full bg-white/15 px-2 py-1 text-[8px] font-bold text-white">TOMATE DETECTADO</span></div>
        </div>
      </div>
      <div className="absolute left-3 top-20 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7DD5FF]/45 bg-[#0B63E5] text-xl shadow-lg">✦</div>
      <div className="absolute right-3 top-20 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7DD5FF]/45 bg-[#0B63E5] text-xl shadow-lg">⌁</div>
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/20 bg-[#113B79]/90 px-4 py-3 shadow-xl"><span className="text-xl">🛒</span><div><p className="text-[9px] font-bold text-blue-200">AGREGADO A TU CANASTA</p><p className="text-xs font-extrabold text-white">Tomate · 1 kg</p></div><span className="ml-1 text-[#72F0A6]">✓</span></div>
      <div className="absolute bottom-[88px] left-1/2 h-8 w-px -translate-x-1/2 bg-[#76CFFF]" />
    </div>
  );
}

function OnboardingScreen({ step, onNext, onSkip }: { step: OnboardingStep; onNext: () => void; onSkip: () => void }) {
  const content = {
    1: { title: "Compara y ahorra", description: "Compara precios entre supermercados y tiendas de Paucarpata y descubre dónde te conviene comprar.", action: "Siguiente" },
    2: { title: "Compra según tu presupuesto", description: "Ingresa cuánto deseas gastar y Ca$erIA te ayuda a organizar una canasta que se adapte a tu dinero.", action: "Siguiente" },
    3: { title: "Compra de forma más inteligente", description: "Usa el escáner con IA para reconocer alimentos, agregarlos a tu canasta y encontrar mejores opciones de compra.", action: "Empezar ahora" },
  }[step];

  return (
    <div className="onboarding-enter flex h-full flex-col overflow-hidden bg-[#04132D] text-white">
      <StatusBar dark />
      <div className="relative flex flex-1 flex-col overflow-hidden px-6 pb-7 pt-2">
        <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#0B63E5]/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-1/3 h-72 w-72 rounded-full bg-[#19A7E8]/20 blur-3xl" />
        <div className="relative flex justify-end"><button onClick={onSkip} className="rounded-full px-3 py-2 text-sm font-bold text-blue-100 transition-colors hover:bg-white/10 active:scale-95">Saltar</button></div>
        <div className="relative flex flex-1 flex-col items-center justify-center pt-1"><OnboardingIllustration step={step} /></div>
        <div className="relative">
          <div className="mb-4 h-1 w-10 rounded-full bg-[#FF9800]" />
          <h1 className="max-w-[320px] text-[31px] font-black leading-[1.08] tracking-[-0.04em]">{content.title}</h1>
          <p className="mt-4 min-h-[62px] max-w-[335px] text-[15px] font-medium leading-relaxed text-slate-300">{content.description}</p>
          <div className="mt-5 flex items-center gap-2" aria-label={`Paso ${step} de 3`}>
            {[1, 2, 3].map(dot => <span key={dot} className={`h-2 rounded-full transition-all duration-300 ${dot === step ? "w-7 bg-white" : "w-2 bg-white/35"}`} />)}
          </div>
          <button onClick={onNext} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0952C6] via-[#0B63E5] to-[#1597ED] py-4 text-base font-extrabold shadow-lg shadow-[#0B63E5]/40 transition-transform active:scale-[0.98]">
            {content.action}<span>{step === 3 ? "→" : "›"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Splash + Registration ────────────────────────────────────────────────────
function SplashScreen({ onNext }: { onNext: (name: string, email: string) => void }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const canContinue = terms && name.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-white">
      <StatusBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-4 pb-10 flex flex-col">
        <div className="flex flex-col items-center gap-1 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-[#0B63E5] flex items-center justify-center shadow-lg shadow-[#0B63E5]/30">
              <span className="text-white text-2xl">🛒</span>
            </div>
            <span className="text-4xl font-black tracking-tight text-[#1E293B]">Ca<span className="text-[#FF9800]">$</span>erIA</span>
          </div>
          <p className="text-xs text-[#94A3B8] font-medium">Más que una APP, tu compañero de bolsillo</p>
        </div>

        <div className="flex justify-center mb-5">
          <div className="w-48 h-48 rounded-full bg-white flex items-center justify-center border-2 border-[#E2E8F0] shadow-md overflow-hidden">
            <img src={caseriLogo} alt="Ca$erIA logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="bg-[#EEF4FF] border border-[#0B63E5]/15 rounded-2xl px-4 py-3 mb-5">
          <p className="text-xs font-bold text-[#0B63E5] text-center mb-1.5">¿Qué hace Ca$erIA?</p>
          <p className="text-xs text-[#475569] text-center leading-relaxed">Organiza tu presupuesto, crea tu canasta y <span className="font-semibold text-[#1E293B]">compara opciones de compra</span> en supermercados y tiendas de Paucarpata.</p>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-3 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl px-4 py-3.5 focus-within:border-[#0B63E5] transition-colors">
            <span className="text-lg flex-shrink-0">👤</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu Nombre"
              className="flex-1 bg-transparent outline-none text-base font-semibold text-[#1E293B] placeholder-[#CBD5E1]" />
          </div>
          <div className="flex items-center gap-3 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl px-4 py-3.5 focus-within:border-[#0B63E5] transition-colors">
            <span className="text-lg flex-shrink-0">✉️</span>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Tu Correo Electrónico" type="email"
              className="flex-1 bg-transparent outline-none text-base text-[#1E293B] placeholder-[#CBD5E1]" />
          </div>
        </div>

        <button onClick={() => setTerms(t => !t)} className="flex items-start gap-3 mb-1 text-left">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${terms ? "border-[#0B63E5] bg-[#0B63E5]" : "border-[#CBD5E1]"}`}>
            {terms && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Acepto los <span className="text-[#0B63E5] font-semibold">Términos y Condiciones</span> y la <span className="text-[#0B63E5] font-semibold">Política de Privacidad</span> (Protección de Datos Ley N° 29733).
          </p>
        </button>
        <button className="text-xs text-[#0B63E5] ml-8 mb-5 text-left">Ver términos sobre precios referenciales e IA.</button>

        <button onClick={() => onNext(name.trim() || "Mateo", email.trim())}
          disabled={!canContinue}
          className="w-full py-4 rounded-2xl bg-[#0B63E5] text-white font-bold text-lg shadow-lg shadow-[#0B63E5]/30 disabled:opacity-40 active:scale-95 transition-transform">
          Empezar 🚀
        </button>
        <button className="text-[#0B63E5] font-semibold text-sm py-3 text-center">Ya tengo cuenta</button>
      </div>
    </div>
  );
}

// ─── Permission Screen (Paucarpata único) ─────────────────────────────────────
function PermissionScreen({ onNext }: { onNext: () => void }) {
  const [locationGranted, setLocationGranted] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <StatusBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-5 pb-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-3xl bg-[#EEF4FF] border border-[#0B63E5]/20 flex items-center justify-center mb-4 relative">
            <span className="text-5xl">🗺️</span>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0B63E5] rounded-full flex items-center justify-center shadow-lg shadow-[#0B63E5]/40"><span className="text-white text-base">📍</span></div>
          </div>
          <h1 className="text-xl font-black text-[#1E293B] text-center leading-tight">Encuentra las mejores opciones cerca de ti</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-xl flex-shrink-0">📍</span>
            <p className="text-xs text-[#475569] leading-relaxed"><span className="font-bold text-[#1E293B]">Ca$erIA</span> necesita tu ubicación para calcular rutas a los establecimientos más cercanos.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setLocationGranted(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${locationGranted ? "bg-[#0B63E5] text-white border-[#0B63E5]" : "border-[#0B63E5] text-[#0B63E5]"}`}>
              {locationGranted ? "✓ Permitido" : "Permitir Ubicación"}
            </button>
            <button className="flex-1 py-2.5 rounded-xl text-xs font-bold border-2 border-[#E2E8F0] text-[#94A3B8]">Omitir</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
          <p className="text-xs font-bold text-[#475569] uppercase tracking-wide mb-3">Zona de comparación activa</p>
          <div className="flex items-center gap-3 py-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#0B63E5] flex items-center justify-center flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0B63E5]" />
            </div>
            <span className="text-sm">📍</span>
            <div>
              <p className="font-semibold text-[#1E293B] text-sm">Paucarpata, Arequipa</p>
              <p className="text-xs text-[#94A3B8]">Tottus · Plaza Vea · Franco · Tiendas Mass</p>
            </div>
          </div>
        </div>

        <div className="bg-[#EEF4FF] border border-[#0B63E5]/20 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-base flex-shrink-0">ℹ️</span>
            <p className="text-xs text-[#1E40AF] leading-relaxed">
              <span className="font-bold">Paucarpata</span> es el distrito de validación actual de Ca$erIA. Próximamente ampliaremos cobertura a otros distritos de Arequipa.
            </p>
          </div>
        </div>

        <button onClick={onNext}
          className="w-full py-4 rounded-2xl bg-[#0B63E5] text-white font-bold text-base shadow-lg shadow-[#0B63E5]/25 active:scale-95 transition-transform">
          Guardar y Continuar →
        </button>
      </div>
    </div>
  );
}

// ─── Configure Screen (reemplaza rol-selección) ───────────────────────────────
function RegisterScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <StatusBar />
      <div className="flex-1 flex flex-col px-6 pt-6 pb-10">
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">Último paso</p>
          <h1 className="text-2xl font-black text-[#1E293B] leading-tight">Configura tu<br />experiencia</h1>
        </div>

        <p className="text-sm text-[#475569] leading-relaxed mb-6">
          Ca$erIA está diseñada para ayudarte a organizar tu presupuesto, crear tu canasta y comparar opciones de compra en Paucarpata.
        </p>

        <div className="flex-1 flex flex-col gap-4">
          <div className="w-full p-5 rounded-2xl border-2 border-[#0B63E5] bg-[#0B63E5]/5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0B63E5] flex items-center justify-center text-2xl flex-shrink-0">
                🛒
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#1E293B] text-base">Soy comprador</span>
                  <div className="w-5 h-5 rounded-full bg-[#0B63E5] flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
                <p className="text-sm text-[#64748B] leading-snug">Quiero comparar opciones, organizar mi compra y ahorrar.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#EEF4FF] border border-[#0B63E5]/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">📍</span>
              <div>
                <p className="text-xs font-bold text-[#0B63E5] mb-1">Zona de comparación: Paucarpata</p>
                <p className="text-xs text-[#475569] leading-relaxed">Compara entre Tottus Porongoche, Plaza Vea, Franco Supermercados y Tiendas Mass.</p>
              </div>
            </div>
          </div>

          <div className="mt-auto" />
        </div>

        <button onClick={onNext}
          className="w-full py-4 rounded-2xl bg-[#0B63E5] text-white font-bold text-lg shadow-lg shadow-[#0B63E5]/25 active:scale-95 transition-transform mt-6">
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({ name, district, trialUsed, monthlyBudget, monthlySpent, onDistrictSwitch, onBasket, onBudget, onScanner }: {
  name: string; district: District; trialUsed: boolean;
  monthlyBudget: string; monthlySpent: number;
  onDistrictSwitch: () => void; onBasket: () => void; onBudget: () => void; onScanner: () => void;
}) {
  const [catalogTab, setCatalogTab] = useState<"super"|"mass">("super");
  const budgetVal = parseFloat(monthlyBudget) || 0;
  const available = +(budgetVal - monthlySpent).toFixed(2);
  const usedPct = budgetVal > 0 ? Math.min((monthlySpent / budgetVal) * 100, 999) : 0;
  const isOver = budgetVal > 0 && monthlySpent > budgetVal;
  const d = DISTRICT_DATA[district];
  const baskets = [
    { emoji: "🎒", name: "Canasta Estudiante", price: "S/ 50",  desc: "Rápida y económica" },
    { emoji: "💪", name: "Canasta Deportista", price: "S/ 80",  desc: "Alta en proteínas"  },
    { emoji: "🏠", name: "Canasta Roomies",    price: "S/ 150", desc: "Para compartir"     },
    { emoji: "🕒", name: "Canasta Express",    price: "S/ 30",  desc: "Del apuro"          },
  ];
  const catalog = catalogTab === "super" ? d.supermarkets : d.minimarkets;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <StatusBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-2">
        <div className="px-6 pt-2 pb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#94A3B8]">¡Bienvenido de nuevo 👋</p>
            <h1 className="text-xl font-black text-[#1E293B]">¡Hola, {name}!</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onDistrictSwitch} className="flex items-center gap-1.5 bg-[#EEF4FF] border border-[#0B63E5]/20 px-3 py-1.5 rounded-full">
              <span className="text-xs">📍</span>
              <span className="text-xs font-semibold text-[#0B63E5]">{d.label}</span>
              <span className="text-xs text-[#0B63E5]">▾</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#0B63E5] flex items-center justify-center text-white font-bold text-sm">{name[0]?.toUpperCase() ?? "M"}</div>
          </div>
        </div>

        {/* Comparison banner */}
        <div className="mx-6 mb-4 bg-gradient-to-r from-[#EEF4FF] to-[#DBEAFE] rounded-2xl p-4 border border-[#0B63E5]/15 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📊</span>
          <div>
            <p className="text-xs font-bold text-[#0B63E5] mb-0.5">Compara opciones en Paucarpata</p>
            <p className="text-xs text-[#475569] leading-snug">Encuentra alternativas entre Tottus, Plaza Vea, Franco Supermercados y Tiendas Mass.</p>
          </div>
        </div>

        {/* Budget mini-widget */}
        <div className="mx-6 mb-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-[#F1F5F9] flex items-center justify-between">
            <p className="text-xs font-bold text-[#475569] uppercase tracking-wide">Mi presupuesto</p>
            <button onClick={onBudget} className="flex items-center gap-1 text-xs font-semibold text-[#0B63E5]">
              Ver presupuesto →
            </button>
          </div>

          {budgetVal > 0 ? (
            <>
              <div className="px-4 pt-3 pb-3 flex items-center gap-3">
                <HomeDonut usedPct={usedPct} isOver={isOver} />
                <div className="flex-1">
                  <p className="text-xl font-black text-[#1E293B]">S/ {budgetVal.toFixed(2)}</p>
                  <p className="text-xs text-[#94A3B8] mb-2">Presupuesto mensual</p>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748B]">Gastado este mes</span>
                    <span className="font-bold text-[#1E293B]">S/ {monthlySpent.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(usedPct, 100)}%`, background: isOver ? "#EF4444" : usedPct > 90 ? "#F59E0B" : "#22C55E" }} />
                  </div>
                  <p className={`mt-2 text-xs font-bold ${isOver ? "text-[#EF4444]" : usedPct > 90 ? "text-[#A16207]" : "text-[#15803D]"}`}>
                    {isOver ? `Excede S/ ${Math.abs(available).toFixed(2)}` : `Disponible: S/ ${available.toFixed(2)}`}
                  </p>
                </div>
              </div>
              <div className="px-4 py-2.5 flex items-center gap-2 bg-[#EEF4FF]">
                <span className="text-sm">💡</span>
                <p className="text-xs text-[#0B63E5] font-medium leading-snug">
                  Tu presupuesto mensual solo cambia cuando confirmas una compra real.
                </p>
              </div>
            </>
          ) : (
            <button onClick={onBudget}
              className="w-full px-4 py-5 flex items-center justify-center gap-2 text-[#0B63E5] font-semibold text-sm active:opacity-70">
              <span className="text-lg">💰</span>
              <span>+ Definir presupuesto mensual</span>
            </button>
          )}
        </div>

        {!trialUsed && (
          <div className="mx-6 mb-4 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">✨</span>
            <div className="flex-1">
              <p className="text-white font-bold text-sm leading-tight">¡Tienes 1 PRUEBA GRATIS de Escáner IA y Nutrición!</p>
            </div>
            <button onClick={onScanner} className="flex-shrink-0 bg-white text-[#4F46E5] font-bold text-xs px-3 py-2 rounded-xl active:scale-95 transition-transform">Probar</button>
          </div>
        )}

        <div className="mx-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-4">
          <div className="flex border-b border-[#F1F5F9]">
            {([
              { key: "super" as const, label: "🏢 Supermercados" },
              { key: "mass"  as const, label: "🏷️ Tiendas Mass"  },
            ]).map(t => (
              <button key={t.key} onClick={() => setCatalogTab(t.key)}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all ${catalogTab === t.key ? "border-[#0B63E5] text-[#0B63E5]" : "border-transparent text-[#94A3B8]"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="px-4 py-3 flex flex-col gap-2.5">
            {catalog.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xl flex-shrink-0">{m.emoji}</div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1E293B] text-sm">{m.name}</p>
                  <p className="text-xs text-[#94A3B8]">{m.tag}</p>
                </div>
                <span className="text-[#CBD5E1]">›</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between px-6 mb-2">
            <p className="text-sm font-bold text-[#1E293B]">⭐ Canastas Rápidas</p>
            <span className="text-xs text-[#0B63E5] font-semibold">Ver todas</span>
          </div>
          <div className="flex gap-3 px-6 overflow-x-auto hide-scrollbar pb-1">
            {baskets.map(b => (
              <button key={b.name} onClick={onBasket} style={{ width: 126 }}
                className="flex-shrink-0 bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm text-left active:scale-95 transition-transform">
                <span className="text-3xl block mb-2">{b.emoji}</span>
                <p className="text-xs font-bold text-[#1E293B] leading-tight mb-0.5">{b.name}</p>
                <p className="text-xs text-[#94A3B8] mb-2">{b.desc}</p>
                <span className="text-sm font-black text-[#0B63E5]">{b.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6">
          <div className="bg-gradient-to-r from-[#0B63E5] to-[#1D4ED8] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/70 mb-0.5">🛒 Personaliza tu compra</p>
              <p className="font-bold text-white text-sm">¿Armas tu propia canasta?</p>
            </div>
            <button onClick={onBasket} className="bg-white text-[#0B63E5] font-bold text-sm px-4 py-2.5 rounded-xl active:scale-95 transition-transform">+ Crear</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Selection ────────────────────────────────────────────────────────
function SelectScreen({ selected, onToggle, onNext, onBack }: {
  selected: number[]; onToggle: (id: number) => void; onNext: () => void; onBack: () => void;
}) {
  const [cat, setCat] = useState("Todos");
  const filtered = cat === "Todos" ? PRODUCTS
    : PRODUCTS.filter(p => p.cat.toLowerCase().includes(cat.replace(/^[^\w\s]+\s*/, "").toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <StatusBar />
      <div className="px-6 pt-3 pb-4 bg-white border-b border-[#E2E8F0] flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-[#1E293B] text-lg">←</button>
        <div className="flex-1">
          <p className="text-xs text-[#94A3B8] font-medium">Paso 1 de 3</p>
          <h1 className="text-base font-bold text-[#1E293B]">¿Qué necesitas comprar?</h1>
        </div>
        <div className="flex gap-1">
          {[1,2,3].map(i => <div key={i} className={`w-6 h-1.5 rounded-full ${i===1 ? "bg-[#0B63E5]" : "bg-[#E2E8F0]"}`} />)}
        </div>
      </div>
      <div className="flex gap-2 px-6 py-3 overflow-x-auto hide-scrollbar bg-white border-b border-[#E2E8F0]">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${cat===c ? "bg-[#0B63E5] text-white" : "bg-[#F1F5F9] text-[#64748B]"}`}>{c}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(p => {
            const sel = selected.includes(p.id);
            return (
              <button key={p.id} onClick={() => onToggle(p.id)} className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${sel ? "border-[#0B63E5] bg-[#EEF4FF]" : "border-[#E2E8F0] bg-white"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{p.emoji}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${sel ? "border-[#0B63E5] bg-[#0B63E5]" : "border-[#CBD5E1]"}`}>
                    {sel && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
                <p className="font-bold text-[#1E293B] text-sm">{p.name}</p>
                <p className="text-xs text-[#94A3B8]">S/ {p.price}/{p.unit}</p>
              </button>
            );
          })}
        </div>
      </div>
      {selected.length > 0 && (
        <div className="px-6 pt-3 pb-1 bg-white border-t border-[#E2E8F0]">
          <button onClick={onNext} className="w-full py-4 rounded-2xl bg-[#0B63E5] text-white font-bold text-base shadow-lg shadow-[#0B63E5]/25 active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{selected.length}</span>
            productos seleccionados → Definir Cantidades
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Quantities (Paso 2 de 3) ─────────────────────────────────────────────────
function QuantBudgetScreen({ selected, quantities, budget, onQty, onNext, onBack }: {
  selected: number[]; quantities: Record<number, number>;
  budget: string;
  onQty: (id: number, delta: number) => void;
  onNext: () => void; onBack: () => void;
}) {
  const prods = PRODUCTS.filter(p => selected.includes(p.id));
  const subtotal = prods.reduce((s, p) => s + p.price * (quantities[p.id] ?? 1), 0);
  const purchaseBudget = Number.parseFloat(budget) || 0;
  const remaining = purchaseBudget - subtotal;
  const over = subtotal > purchaseBudget;
  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <StatusBar />
      <div className="px-6 pt-3 pb-4 bg-white border-b border-[#E2E8F0] flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-[#1E293B] text-lg">←</button>
        <div className="flex-1">
          <p className="text-xs text-[#94A3B8] font-medium">Paso 2 de 3</p>
          <h1 className="text-base font-bold text-[#1E293B]">Ajusta las cantidades</h1>
        </div>
        <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className={`w-6 h-1.5 rounded-full ${i<=2 ? "bg-[#0B63E5]" : "bg-[#E2E8F0]"}`} />)}</div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">
        <div className="bg-[#FFF3E0] border border-[#FF9800]/20 rounded-2xl p-3 mb-4 flex items-start gap-2">
          <span className="text-base flex-shrink-0">💡</span>
          <p className="text-xs text-[#92400E] font-medium leading-relaxed">Total provisional basado en precios de referencia. La comparación usará exactamente estos productos y cantidades.</p>
        </div>
        <div className="flex flex-col gap-2.5 mb-4">
          {prods.map(p => {
            const qty = quantities[p.id] ?? 1;
            return (
              <div key={p.id} className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-sm flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1E293B] text-sm truncate">{p.name}</p>
                  <p className="text-xs text-[#94A3B8]">S/ {(p.price * qty).toFixed(2)} estimado</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button onClick={() => onQty(p.id,-1)} className="w-7 h-7 rounded-full bg-[#F1F5F9] flex items-center justify-center font-bold text-[#1E293B] active:scale-90 text-sm">−</button>
                  <span className="w-10 text-center font-bold text-[#1E293B] text-sm">{qty}</span>
                  <button onClick={() => onQty(p.id,1)}  className="w-7 h-7 rounded-full bg-[#0B63E5] flex items-center justify-center font-bold text-white active:scale-90 text-sm">+</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] px-4 py-3">
          <div className="flex items-center justify-between"><p className="text-sm font-semibold text-[#475569]">Total provisional</p><p className="text-lg font-black text-[#1E293B]">S/ {subtotal.toFixed(2)}</p></div>
          <p className={`mt-2 text-xs font-bold ${over ? "text-[#EF4444]" : "text-[#15803D]"}`}>{over ? `Sobrepasaste tu presupuesto en S/ ${Math.abs(remaining).toFixed(2)}.` : `Te quedan S/ ${remaining.toFixed(2)} de tu presupuesto para esta compra.`}</p>
        </div>
        {over && <div className="mt-3 rounded-2xl border border-[#EF4444]/20 bg-[#FEE2E2] p-3"><p className="text-xs text-[#B91C1C]">Puedes quitar un producto, reducir una cantidad o dejar que CaSerIA busque opciones más económicas.</p><div className="mt-3 flex gap-2"><button onClick={onBack} className="flex-1 rounded-xl border border-[#EF4444] py-2 text-xs font-bold text-[#B91C1C]">Ajustar mi canasta</button><button onClick={onNext} className="flex-1 rounded-xl bg-[#0B63E5] py-2 text-xs font-bold text-white">Buscar opciones más económicas</button></div></div>}
      </div>
      <div className="px-6 pt-3 pb-1 bg-white border-t border-[#E2E8F0]">
        <button onClick={onNext}
          className="w-full py-4 rounded-2xl bg-[#0B63E5] text-white font-bold text-base shadow-lg shadow-[#0B63E5]/25 active:scale-95 transition-transform">
          Comparar mi canasta →
        </button>
      </div>
    </div>
  );
}

// ─── Budget (Paso 3 de 3) ─────────────────────────────────────────────────────
function BudgetScreen({ selected, quantities, budget, setBudget, onNext, onBack }: {
  selected: number[]; quantities: Record<number, number>;
  budget: string; setBudget: (v: string) => void;
  onNext: () => void; onBack: () => void;
}) {
  const budgetVal = parseFloat(budget) || 0;
  const estimatedCost = PRODUCTS
    .filter(p => selected.includes(p.id))
    .reduce((sum, p) => sum + p.price * (quantities[p.id] ?? 1), 0);
  const available = budgetVal - estimatedCost;
  const usedPct = budgetVal > 0 ? (estimatedCost / budgetVal) * 100 : 0;
  const isOver = estimatedCost > budgetVal && budgetVal > 0;
  const isTight = !isOver && budgetVal > 0 && available < budgetVal * 0.1;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <StatusBar />
      <div className="px-6 pt-3 pb-4 bg-white border-b border-[#E2E8F0] flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-[#1E293B] text-lg">←</button>
        <div className="flex-1">
          <p className="text-xs text-[#94A3B8] font-medium">Paso 3 de 3</p>
          <h1 className="text-base font-bold text-[#1E293B]">Define tu presupuesto</h1>
          <p className="text-xs text-[#94A3B8]">Indica cuánto deseas gastar en esta compra.</p>
        </div>
        <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className="w-6 h-1.5 rounded-full bg-[#0B63E5]" />)}</div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-5">
        {/* Large budget input */}
        <div className="bg-white rounded-2xl border-2 border-[#0B63E5]/20 shadow-sm overflow-hidden mb-4">
          <div className="px-5 pt-5 pb-4">
            <p className="text-xs font-bold text-[#475569] uppercase tracking-wide text-center mb-4">Tu presupuesto para esta compra</p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-4xl font-black text-[#0B63E5]">S/</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="text-6xl font-black text-[#1E293B] bg-transparent outline-none w-44 text-center border-b-4 border-[#0B63E5]/30 focus:border-[#0B63E5] transition-colors pb-1"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-[#94A3B8] text-center mb-5">Soles peruanos (S/)</p>
            <div className="grid grid-cols-4 gap-2">
              {["50","100","150","200"].map(p => (
                <button key={p} onClick={() => setBudget(p)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${budget===p ? "bg-[#0B63E5] text-white shadow shadow-[#0B63E5]/30" : "bg-[#F1F5F9] text-[#475569]"}`}>
                  S/{p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Donut + summary card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-4">
          <div className="px-4 pt-3 pb-2 border-b border-[#F1F5F9]">
            <p className="text-xs font-bold text-[#475569] uppercase tracking-wide">Resumen de tu compra</p>
          </div>
          <div className="px-4 pt-4 pb-4 flex items-center gap-4">
            <div className="flex flex-col items-center">
              <BudgetDonut budgetVal={budgetVal} estimatedCost={estimatedCost} />
              {isOver && <p className="-mt-1 text-xs font-bold text-[#EF4444]">Excede S/ {Math.abs(available).toFixed(2)}</p>}
            </div>
            <div className="flex-1 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#64748B]">Presupuesto</p>
                <p className="text-sm font-black text-[#1E293B]">{budgetVal > 0 ? `S/ ${budgetVal.toFixed(2)}` : "—"}</p>
              </div>
              <div className="h-px bg-[#F1F5F9]" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#64748B]">Costo estimado</p>
                <p className="text-sm font-black text-[#1E293B]">S/ {estimatedCost.toFixed(2)}</p>
              </div>
              <div className="h-px bg-[#F1F5F9]" />
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#64748B]">{isOver ? "Te faltan" : "Te quedan"}</p>
                <p className={`text-sm font-black ${isOver ? "text-[#EF4444]" : "text-[#15803D]"}`}>
                  {budgetVal > 0 ? `S/ ${Math.abs(available).toFixed(2)}` : "—"}
                </p>
              </div>
              {budgetVal > 0 && (
                <>
                  <div className="h-px bg-[#F1F5F9]" />
                  <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(usedPct, 100)}%`, background: isOver ? "#EF4444" : isTight ? "#F59E0B" : "#22C55E" }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic state feedback */}
        {budgetVal > 0 && (
          <div className={`rounded-2xl p-4 flex items-start gap-3 mb-2 ${isOver ? "bg-[#FEE2E2] border border-[#EF4444]/20" : isTight ? "bg-[#FEF9C3] border border-[#F59E0B]/20" : "bg-[#DCFCE7] border border-[#22C55E]/20"}`}>
            <span className="text-xl flex-shrink-0">{isOver ? "🔴" : isTight ? "🟡" : "🟢"}</span>
            <div>
              {isOver ? (
                <>
                  <p className="text-sm font-black text-[#991B1B] mb-0.5">Tu selección supera el presupuesto</p>
                  <p className="text-xs text-[#B91C1C] leading-snug">Te faltan <strong>S/ {Math.abs(available).toFixed(2)}</strong>. CaSerIA buscará alternativas para acercar tu compra al monto disponible.</p>
                </>
              ) : isTight ? (
                <>
                  <p className="text-sm font-black text-[#92400E] mb-0.5">Presupuesto muy ajustado</p>
                  <p className="text-xs text-[#A16207] leading-snug">Te quedan <strong>S/ {available.toFixed(2)}</strong> de margen. CaSerIA buscará alternativas para ayudarte a aprovechar mejor tu presupuesto.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-black text-[#15803D] mb-0.5">¡Presupuesto suficiente!</p>
                  <p className="text-xs text-[#166534] leading-snug">Te quedan <strong>S/ {available.toFixed(2)}</strong>. CaSerIA buscará alternativas para ayudarte a aprovechar mejor tu presupuesto.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pt-3 pb-1 bg-white border-t border-[#E2E8F0]">
        <button onClick={onNext} disabled={!budget || parseFloat(budget) <= 0}
          className="w-full py-4 rounded-2xl bg-[#0B63E5] text-white font-bold text-base shadow-lg shadow-[#0B63E5]/25 disabled:opacity-40 active:scale-95 transition-transform">
          Buscar mejores opciones
        </button>
        <p className="text-xs text-[#94A3B8] text-center mt-2 mb-1">Compararemos opciones disponibles en Paucarpata.</p>
      </div>
    </div>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingScreen({ district, onNext }: { district: District; onNext: () => void }) {
  const [step, setStep] = useState(0);
  const d = DISTRICT_DATA[district];
  useEffect(() => {
    const ts = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 2600),
      setTimeout(() => setStep(3), 4000),
      setTimeout(onNext, 5000),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <div className="flex flex-col h-full bg-[#0F172A] items-center justify-center gap-10 px-6">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-[#0B63E5] flex items-center justify-center shadow-lg shadow-[#0B63E5]/40"><span className="text-white text-lg">🛒</span></div>
        <span className="text-2xl font-black text-white">Ca<span className="text-[#FF9800]">$</span>erIA</span>
      </div>
      <div className="relative w-52 h-52 flex items-center justify-center">
        <div className="radar-ring absolute w-28 h-28 rounded-full border-2 border-[#0B63E5]/60" />
        <div className="radar-ring-2 absolute w-28 h-28 rounded-full border-2 border-[#0B63E5]/60" />
        <div className="radar-ring-3 absolute w-28 h-28 rounded-full border-2 border-[#0B63E5]/60" />
        <div className="absolute w-36 h-36 rounded-full border border-[#0B63E5]/15" />
        <div className="absolute w-24 h-24 rounded-full border border-[#0B63E5]/25" />
        <div className="w-16 h-16 rounded-full bg-[#0B63E5]/20 border-2 border-[#0B63E5] flex items-center justify-center z-10"><span className="text-2xl">🤖</span></div>
        <div className="absolute top-7 left-9 w-3 h-3 rounded-full bg-[#FF9800] shadow-lg shadow-[#FF9800]/60" />
        <div className="absolute bottom-10 right-7 w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-lg shadow-[#22C55E]/60" />
      </div>
      <div className="w-full">
        <h2 className="text-white font-bold text-base text-center mb-5">🤖 Analizando opciones en {d.label}...</h2>
        <div className="flex flex-col gap-3">
          {[
            "Consultando precios en Franco Supermercados y Tiendas Mass...",
            "Comparando con Plaza Vea y Tottus Porongoche...",
            "Calculando la mejor opción para tu presupuesto...",
          ].map((c, i) => (
            <div key={i} className={`flex items-center gap-3 transition-opacity duration-500 ${i<step?"opacity-100":"opacity-30"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${i<step?"bg-[#22C55E] text-white":i===step?"bg-[#FF9800] text-white":"bg-white/10 text-white/30"}`}>
                {i<step?"✓":i===step?"⏳":"○"}
              </div>
              <p className="text-xs text-white/70 leading-snug">{c}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-[#0B63E5] pulse-1" />
          <div className="w-2 h-2 rounded-full bg-[#0B63E5] pulse-2" />
          <div className="w-2 h-2 rounded-full bg-[#0B63E5] pulse-3" />
        </div>
      </div>
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
type CompareCriteria = "ahorro" | "lugar" | "cerca";

function FreshnessTag({ level, label }: { level: "ok"|"warn"|"bad"; label: string }) {
  const styles = {
    ok:   "text-[#15803D] bg-[#DCFCE7]",
    warn: "text-[#92400E] bg-[#FEF9C3]",
    bad:  "text-[#991B1B] bg-[#FEE2E2]",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[level]}`}>{label}</span>;
}

function ResultsScreen({ district, budget, selected, quantities, onRegisterPurchase, onStallStandard, onStallPremium, onWebRedirect, onBack }: {
  district: District; onStallStandard: () => void; onStallPremium: () => void;
  budget: string;
  selected: number[]; quantities: Record<number, number>; onRegisterPurchase: (store: string, amount: number) => void;
  onWebRedirect: (name: string) => void; onBack: () => void;
}) {
  const [view,     setView]     = useState<"list"|"map">("list");
  const [pinSel,   setPinSel]   = useState<number | null>(null);
  const [criteria, setCriteria] = useState<CompareCriteria>("ahorro");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStore, setSelectedStore] = useState<CompareOption | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [realAmount, setRealAmount] = useState("");
  const d = DISTRICT_DATA[district];

  const calculatedOptions = ["Tottus Porongoche", "Plaza Vea", "Franco Supermercados", "Tiendas Mass – Porongoche"].map(name => d.options.find(option => option.name === name)!).map(option => {
    const totalNum = comparisonTotal(option.name, selected, quantities);
    return { ...option, totalNum, total: `S/ ${totalNum.toFixed(2)}`, allProducts: true };
  });
  const sorted = [...calculatedOptions].sort((a, b) =>
    criteria === "ahorro" ? a.totalNum - b.totalNum :
    criteria === "cerca"  ? a.distMin  - b.distMin  :
    a.totalNum - b.totalNum
  );
  const opts = criteria === "lugar"
    ? sorted.filter(o => o.allProducts)
    : sorted;
  const nearest = [...calculatedOptions].sort((a, b) => a.distMin - b.distMin)[0];
  const combinedTotal = PRODUCTS.filter(product => selected.includes(product.id)).reduce((sum, product) => {
    const unitPrice = Math.min(...Object.values(STORE_PRICE_FACTORS).map(factors => product.price * factors[product.id - 1]));
    return sum + unitPrice * (quantities[product.id] ?? 1);
  }, 0);
  const purchaseBudget = Number.parseFloat(budget) || 0;

  const typeColor: Record<string, string> = {
    discount: "#22C55E",
    super:    "#0B63E5",
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <StatusBar />
      <div className="px-6 pt-3 pb-4 bg-white border-b border-[#E2E8F0] flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-[#1E293B] text-lg">←</button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-[#1E293B]">Resultados para tu Canasta</h1>
          <p className="text-xs text-[#94A3B8]">Presupuesto: S/ {(Number.parseFloat(budget) || 0).toFixed(2)} · <span className="text-[#0B63E5] font-semibold">{d.label}</span></p>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-b border-[#E2E8F0] flex flex-col gap-2">
        <div className="flex gap-1.5">
          {([
            { key: "ahorro" as const, label: "💰 Máx. ahorro" },
            { key: "lugar"  as const, label: "🏪 Todo en 1 lugar" },
            { key: "cerca"  as const, label: "📍 Más cerca" },
          ]).map(c => (
            <button key={c.key} onClick={() => setCriteria(c.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${criteria===c.key ? "border-[#0B63E5] bg-[#EEF4FF] text-[#0B63E5]" : "border-[#E2E8F0] text-[#94A3B8]"}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex bg-[#F1F5F9] rounded-xl p-1">
          <button onClick={() => setView("list")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${view==="list" ? "bg-white text-[#1E293B] shadow" : "text-[#94A3B8]"}`}>📋 Lista</button>
          <button onClick={() => setView("map")}  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${view==="map"  ? "bg-white text-[#1E293B] shadow" : "text-[#94A3B8]"}`}>🗺️ Mapa</button>
        </div>
      </div>

      {view === "list" ? (
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 flex flex-col gap-3">
          <div className="rounded-2xl border border-[#0B63E5]/15 bg-[#EEF4FF] p-3">
            <p className="text-xs font-bold text-[#0B63E5]">Comparación basada en tu canasta</p>
            <p className="mt-1 text-xs text-[#475569]">{selected.length} productos · presupuesto de compra: S/ {purchaseBudget.toFixed(2)}</p>
          </div>
          {opts.map((opt, i) => {
            const isBest = i === 0;
            return (
              <div key={opt.name} className={`rounded-2xl border-2 overflow-hidden transition-all ${isBest ? "border-[#F59E0B] shadow-lg shadow-[#F59E0B]/10" : "border-[#E2E8F0] shadow-sm"}`}>
                {isBest && (
                  <div className="bg-[#F59E0B] px-4 py-1.5 flex items-center justify-between">
                    <span className="text-white text-xs font-black">🏆 Más económica · Mejor precio total</span>
                    {opt.savings && <span className="text-white text-xs font-bold">Ahorras {opt.savings}</span>}
                  </div>
                )}
                <div className={`px-4 py-3 ${isBest ? "bg-gradient-to-br from-[#FFFBEB] to-white" : "bg-white"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-base flex-shrink-0">{opt.rank}</span>
                      <p className="font-bold text-[#1E293B] text-sm leading-tight">{opt.name}</p>
                    </div>
                    <p className={`text-lg font-black flex-shrink-0 ml-2 ${isBest ? "text-[#22C55E]" : "text-[#1E293B]"}`}>{opt.total}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: typeColor[opt.type] ?? "#0B63E5", background: (typeColor[opt.type] ?? "#0B63E5") + "18" }}>{opt.badge}</span>
                    <FreshnessTag level={opt.freshnessLevel} label={opt.freshness} />
                    {!opt.allProducts
                      ? <span className="text-xs font-semibold text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-full">⚠ Disponibilidad parcial</span>
                      : <span className="text-xs font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">✓ Disponible</span>
                    }
                  </div>
                  <div className="flex items-center gap-3 mb-2.5 text-xs text-[#64748B]">
                    <span>📍 {opt.district}</span>
                    <span className="w-px h-3 bg-[#E2E8F0]" />
                    <span>🚶 {opt.distance}</span>
                    <span className="w-px h-3 bg-[#E2E8F0]" />
                    <span className="truncate text-[#94A3B8]">{opt.address}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedStore(opt); setRealAmount(opt.totalNum.toFixed(2)); }} className={`flex-1 py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-transform ${i === 0 ? "bg-[#0B63E5] text-white shadow shadow-[#0B63E5]/25" : "border-2 border-[#0B63E5] text-[#0B63E5]"}`}>Elegir esta opción</button>
                    <button onClick={() => setShowDetail(true)} className="rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-xs font-bold text-[#64748B]">Ver detalle</button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="rounded-2xl border border-[#22C55E]/25 bg-[#DCFCE7]/50 p-4"><p className="text-xs font-black text-[#15803D]">💰 MÁXIMO AHORRO COMBINADO</p><p className="mt-1 text-lg font-black text-[#1E293B]">S/ {combinedTotal.toFixed(2)}</p><p className="mt-1 text-xs text-[#166534]">Ahorras S/ {(sorted[0].totalNum - combinedTotal).toFixed(2)} adicionales, pero tendrás que comprar en más de un establecimiento.</p></div>
          {nearest && <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4"><p className="text-xs font-black text-[#0B63E5]">📍 MÁS CERCANA</p><p className="mt-1 text-sm font-bold text-[#1E293B]">{nearest.name}</p><p className="text-xs text-[#64748B]">{nearest.totalNum === sorted[0].totalNum ? `${nearest.distance} · Mejor precio y más cercana.` : `${nearest.distance} · S/ ${(nearest.totalNum - sorted[0].totalNum).toFixed(2)} más que la opción económica.`}</p></div>}
        </div>
      ) : (
        <div className="flex-1 flex flex-col px-6 py-4 gap-4">
          <div className="flex-1 bg-[#EEF4FF] rounded-2xl border border-[#0B63E5]/15 relative overflow-hidden min-h-0">
            <svg className="absolute inset-0 w-full h-full opacity-10">
              {Array.from({length:6}).map((_,i) => (
                <line key={`v${i}`} x1={`${i*20}%`} y1="0%" x2={`${i*20}%`} y2="100%" stroke="#0B63E5" strokeWidth="1" />
              ))}
              {Array.from({length:5}).map((_,i) => (
                <line key={`h${i}`} x1="0%" y1={`${i*25}%`} x2="100%" y2={`${i*25}%`} stroke="#0B63E5" strokeWidth="1" />
              ))}
            </svg>
            <svg className="absolute inset-0 w-full h-full">
              <path d="M 0% 50% Q 50% 40% 100% 50%" stroke="#CBD5E1" strokeWidth="3" fill="none" />
              <path d="M 45% 0% L 45% 100%" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />
              <path d="M 0% 70% L 100% 65%" stroke="#CBD5E1" strokeWidth="2" fill="none" />
            </svg>
            <div className="absolute top-2 left-3 bg-white/80 rounded-lg px-2 py-1">
              <p className="text-xs font-bold text-[#0B63E5]/60">{d.label} — Opciones de compra</p>
            </div>
            {opts.map((opt, i) => (
              <button key={i}
                onClick={() => setPinSel(pinSel === i ? null : i)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all"
                style={{ left: `${opt.x}%`, top: `${opt.y}%` }}>
                <div className={`w-9 h-9 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm font-black text-white transition-all ${pinSel===i ? "scale-125" : ""}`}
                  style={{ background: i===0 ? "#F59E0B" : (typeColor[opt.type] ?? "#0B63E5") }}>
                  {i+1}
                </div>
                {pinSel === i && (
                  <div className="absolute -bottom-12 bg-white rounded-xl px-2 py-1.5 shadow-lg border border-[#E2E8F0] whitespace-nowrap z-10">
                    <p className="text-xs font-bold text-[#1E293B]">{opt.name}</p>
                    <p className={`text-xs font-black ${i===0?"text-[#22C55E]":"text-[#1E293B]"}`}>{opt.total}</p>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 flex-shrink-0">
            <div className="flex flex-wrap gap-2">
              {[
                { color: "#F59E0B", label: "1 · Mejor precio" },
                { color: "#22C55E", label: "Tiendas Mass" },
                { color: "#0B63E5", label: "Supermercados" },
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <span className="text-xs text-[#475569] font-medium">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onStallPremium} className="w-full py-4 rounded-2xl bg-[#0B63E5] text-white font-bold text-sm shadow-lg shadow-[#0B63E5]/25 active:scale-95 transition-transform flex-shrink-0">
            Ver establecimientos y cómo llegar →
          </button>
        </div>
      )}
      {showDetail && <div className="absolute inset-0 z-40 flex items-end bg-black/50" onClick={() => setShowDetail(false)}><div className="max-h-[78%] w-full overflow-y-auto rounded-t-3xl bg-white p-5 slide-up" onClick={e => e.stopPropagation()}><div className="mb-4 flex items-center justify-between"><div><h2 className="font-black text-[#1E293B]">Detalle de precios</h2><p className="text-xs text-[#64748B]">El menor precio de cada producto está en verde.</p></div><button onClick={() => setShowDetail(false)} className="rounded-full bg-[#F1F5F9] px-3 py-1.5 font-bold text-[#64748B]">✕</button></div>{PRODUCTS.filter(product => selected.includes(product.id)).map(product => { const prices = ["Tottus Porongoche", "Plaza Vea", "Franco Supermercados", "Tiendas Mass – Porongoche"].map(store => product.price * STORE_PRICE_FACTORS[store][product.id - 1]); const min = Math.min(...prices); return <div key={product.id} className="border-t border-[#F1F5F9] py-3"><p className="mb-2 text-sm font-bold text-[#1E293B]">{product.name}</p><div className="grid grid-cols-4 gap-1">{prices.map((price, index) => <span key={index} className={`rounded-lg px-1 py-1.5 text-center text-[10px] ${price === min ? "bg-[#DCFCE7] font-black text-[#15803D]" : "bg-[#F8FAFC] text-[#64748B]"}`}>S/{price.toFixed(2)}</span>)}</div></div>; })}</div></div>}
      {selectedStore && <div className="absolute inset-0 z-40 flex items-end bg-black/50" onClick={() => setSelectedStore(null)}><div className="w-full rounded-t-3xl bg-white p-6 slide-up" onClick={e => e.stopPropagation()}>{!confirming ? <><h2 className="text-lg font-black text-[#1E293B]">¿Realizaste esta compra?</h2><p className="mt-1 text-sm text-[#64748B]">{selectedStore.name}</p><p className="my-4 text-3xl font-black text-[#1E293B]">S/ {selectedStore.totalNum.toFixed(2)}</p><button onClick={() => setConfirming(true)} className="w-full rounded-2xl bg-[#0B63E5] py-4 font-bold text-white">Sí, registrar compra</button><button onClick={() => setSelectedStore(null)} className="mt-2 w-full py-3 text-sm font-bold text-[#64748B]">Todavía no</button></> : <><h2 className="text-lg font-black text-[#1E293B]">¿Este fue el monto final que pagaste?</h2><label className="my-5 flex items-center gap-2 rounded-2xl border-2 border-[#0B63E5]/20 px-4 py-3"><span className="text-xl font-black text-[#0B63E5]">S/</span><input type="number" min="0" step="0.01" value={realAmount} onChange={e => setRealAmount(e.target.value)} className="min-w-0 flex-1 bg-transparent text-2xl font-black outline-none" /></label><button onClick={() => { const amount = Number.parseFloat(realAmount); if (amount > 0) { onRegisterPurchase(selectedStore.name, amount); setSelectedStore(null); setConfirming(false); } }} className="w-full rounded-2xl bg-[#0B63E5] py-4 font-bold text-white">Sí, registrar S/ {Number.parseFloat(realAmount || "0").toFixed(2)}</button><button onClick={() => setConfirming(false)} className="mt-2 w-full py-3 text-sm font-bold text-[#64748B]">Editar monto real</button></>}</div></div>}
    </div>
  );
}

// ─── Establishment Detail — Standard ─────────────────────────────────────────
function StallStandardScreen({ onBack }: { onBack: () => void }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <StatusBar />
      <div className="relative h-36 bg-gradient-to-br from-[#475569] to-[#1E293B] flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-5xl">🏷️</span></div>
        <button onClick={onBack} className="absolute top-3 left-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white">←</button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-black text-base">Tiendas Mass – Los Andes</h1>
            <span className="text-xs font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded-full">Tienda de descuento</span>
          </div>
          <p className="text-white/70 text-xs">Av. Los Andes 210, Paucarpata</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
          <p className="text-xs font-bold text-[#475569] uppercase tracking-wide mb-3">Información del establecimiento</p>
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-[#475569]"><span>🏪</span><span><span className="font-semibold text-[#1E293B]">Establecimiento:</span> Tiendas Mass – Los Andes</span></div>
            <div className="flex items-center gap-2 text-xs text-[#475569]"><span>📍</span><span><span className="font-semibold text-[#1E293B]">Distrito:</span> Paucarpata, Arequipa</span></div>
            <div className="flex items-center gap-2 text-xs text-[#475569]"><span>🗺️</span><span><span className="font-semibold text-[#1E293B]">Dirección:</span> Av. Los Andes 210, Paucarpata</span></div>
            <div className="flex items-center gap-2 text-xs text-[#475569]"><span>🚶</span><span><span className="font-semibold text-[#1E293B]">Distancia:</span> ~1.1 km · 14 min a pie</span></div>
            <div className="flex items-center gap-2 text-xs text-[#475569]"><span>🕗</span><span><span className="font-semibold text-[#1E293B]">Horario:</span> 7:00 – 22:00 (todos los días)</span></div>
          </div>
          <button className="w-full py-2.5 rounded-xl border-2 border-[#0B63E5] text-[#0B63E5] font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-2">
            📍 Ver ubicación en mapa
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
          <p className="text-xs font-bold text-[#475569] uppercase tracking-wide mb-3">Precios de referencia</p>
          {[
            { item: "Arroz 1kg",       price: "S/ 3.20", unit: "por kg" },
            { item: "Aceite 1lt",      price: "S/ 6.50", unit: "por lt" },
            { item: "Azúcar 1kg",      price: "S/ 2.80", unit: "por kg" },
            { item: "Papa Canchan",    price: "S/ 1.90", unit: "por kg" },
            { item: "Huevos x12",      price: "S/ 7.50", unit: "por docena" },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
              <div><p className="font-semibold text-[#1E293B] text-sm">{p.item}</p><p className="text-xs text-[#94A3B8]">{p.unit}</p></div>
              <span className="font-black text-[#1E293B] text-base">{p.price}</span>
            </div>
          ))}
          <div className="mt-3 flex items-start gap-2 bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-xl px-3 py-2">
            <span className="text-xs">ℹ️</span>
            <p className="text-xs text-[#92400E]">Los precios son referenciales. Pueden variar según disponibilidad en tienda.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="p-4 flex flex-col gap-3">
            {!saved ? (
              <button onClick={() => setSaved(true)}
                className="w-full py-3.5 rounded-xl bg-[#0B63E5] text-white font-bold text-sm active:scale-95 transition-transform shadow shadow-[#0B63E5]/25 flex items-center justify-center gap-2">
                ⭐ Guardar como opción favorita
              </button>
            ) : (
              <div className="bg-[#DCFCE7] border border-[#22C55E]/30 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-lg">✅</span>
                <p className="text-xs font-semibold text-[#15803D]">Guardado en tus establecimientos favoritos</p>
              </div>
            )}
            <button className="w-full py-3.5 rounded-xl border-2 border-[#0B63E5] text-[#0B63E5] font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
              🗺️ Cómo llegar
            </button>
            <button className="w-full py-3.5 rounded-xl border-2 border-[#E2E8F0] text-[#475569] font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
              🔍 Ver alternativa más cercana
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Establishment Detail — Mejor opción ─────────────────────────────────────
function StallPremiumScreen({ onBack, onMap }: { onBack: () => void; onMap?: () => void }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <StatusBar />
      <div className="relative h-36 bg-gradient-to-br from-[#0B63E5] to-[#1E3A8A] flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-5xl">🏷️🛒</span></div>
        <button onClick={onBack} className="absolute top-3 left-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white">←</button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-black text-base">Tiendas Mass – Porongoche</h1>
            <span className="text-xs font-bold text-[#FF9800] bg-[#FF9800]/20 px-2 py-0.5 rounded-full">🏆 Mejor precio</span>
          </div>
          <p className="text-white/70 text-xs">Av. Los Incas 320, Paucarpata</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">
        <div className="bg-gradient-to-r from-[#22C55E]/10 to-[#DCFCE7] border border-[#22C55E]/30 rounded-2xl p-3 mb-4 flex items-center gap-3">
          <span className="text-xl">🏆</span>
          <div>
            <p className="font-bold text-[#15803D] text-sm">Opción más económica para tu canasta</p>
            <p className="text-xs text-[#166534]">Precios actualizados · Ahorras S/ 23.50 vs. alternativas</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1 bg-[#DCFCE7] px-3 py-1.5 rounded-full border border-[#22C55E]/30"><span className="text-sm">📊</span><span className="text-xs font-bold text-[#15803D]">S/ 76.50</span></div>
          <div className="flex items-center gap-1 bg-[#EEF4FF] px-3 py-1.5 rounded-full"><span className="text-xs">📍</span><span className="text-xs font-semibold text-[#1E293B]">600 m · 8 min</span></div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] px-3 py-1.5 rounded-full"><span className="text-xs">🕗</span><span className="text-xs font-semibold text-[#1E293B]">7:00 – 22:00</span></div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
          <p className="text-xs font-bold text-[#475569] uppercase tracking-wide mb-3">Información del establecimiento</p>
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-[#475569]"><span>🏪</span><span><span className="font-semibold text-[#1E293B]">Establecimiento:</span> Tiendas Mass – Porongoche</span></div>
            <div className="flex items-center gap-2 text-xs text-[#475569]"><span>📍</span><span><span className="font-semibold text-[#1E293B]">Distrito:</span> Paucarpata, Arequipa</span></div>
            <div className="flex items-center gap-2 text-xs text-[#475569]"><span>🗺️</span><span><span className="font-semibold text-[#1E293B]">Dirección:</span> Av. Los Incas 320, Paucarpata</span></div>
            <div className="flex items-center gap-2 text-xs text-[#475569]"><span>🚶</span><span><span className="font-semibold text-[#1E293B]">Distancia:</span> ~600 m · 8 min a pie</span></div>
          </div>
          <button onClick={onMap} className="w-full py-2.5 rounded-xl border-2 border-[#0B63E5] text-[#0B63E5] font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-2">
            📍 Ver ubicación en mapa
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
          <p className="text-xs font-bold text-[#475569] uppercase tracking-wide mb-3">Precios de referencia</p>
          {[
            { item: "Arroz 1kg",         price: "S/ 3.10", badge: null },
            { item: "Aceite 1lt",        price: "S/ 6.30", badge: "Oferta" },
            { item: "Huevos x30",        price: "S/ 15.50",badge: null },
            { item: "Azúcar 1kg",        price: "S/ 2.70", badge: null },
            { item: "Papa Canchan 1kg",  price: "S/ 1.80", badge: "Oferta" },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
              <p className="font-semibold text-[#1E293B] text-sm">{p.item}</p>
              <div className="flex items-center gap-2">
                {p.badge && <OrangeBadge label={p.badge} />}
                <span className="font-black text-[#22C55E] text-base">{p.price}</span>
              </div>
            </div>
          ))}
          <div className="mt-3 flex items-start gap-2 bg-[#FFFBEB] border border-[#F59E0B]/20 rounded-xl px-3 py-2">
            <span className="text-xs">ℹ️</span>
            <p className="text-xs text-[#92400E]">Los precios son referenciales. Pueden variar según disponibilidad en tienda.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {!saved ? (
            <button onClick={() => setSaved(true)}
              className="w-full py-3.5 rounded-2xl bg-[#0B63E5] text-white font-bold text-sm active:scale-95 transition-transform shadow shadow-[#0B63E5]/25 flex items-center justify-center gap-2">
              ⭐ Guardar como opción favorita
            </button>
          ) : (
            <div className="bg-[#DCFCE7] border border-[#22C55E]/30 rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-lg">✅</span>
              <p className="text-xs font-semibold text-[#15803D]">Guardado en tus establecimientos favoritos</p>
            </div>
          )}
          <button className="w-full py-3.5 rounded-2xl border-2 border-[#E2E8F0] text-[#475569] font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
            🗺️ Cómo llegar
          </button>
          <button className="w-full py-3.5 rounded-2xl border-2 border-[#E2E8F0] text-[#475569] font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2">
            🔍 Buscar por presupuesto específico
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Establishment Map ────────────────────────────────────────────────────────
function StallMapScreen({ onBack }: { onBack: () => void }) {
  const [selectedIdx,    setSelectedIdx]    = useState(0);
  const [sheetExpanded,  setSheetExpanded]  = useState(false);
  const [zoom,           setZoom]           = useState(1);
  const [view,           setView]           = useState<"map"|"list">("map");

  const establishments = [
    { id: 0, name: "Tiendas Mass – Porongoche", type: "Tienda de descuento", total: "S/ 76.50/canasta", product: "Canasta básica", rating: 4.7, featured: true,  x: 28, y: 38, address: "Av. Los Incas 320",   distance: "600 m · 8 min"   },
    { id: 1, name: "Tiendas Mass – Los Andes",  type: "Tienda de descuento", total: "S/ 78.00/canasta", product: "Canasta básica", rating: 4.4, featured: false, x: 20, y: 60, address: "Av. Los Andes 210",  distance: "1.1 km · 14 min" },
    { id: 2, name: "Franco Supermercados",       type: "Supermercado",        total: "S/ 82.00/canasta", product: "Canasta básica", rating: 4.5, featured: false, x: 62, y: 28, address: "Av. Porongoche 450", distance: "900 m · 12 min"  },
    { id: 3, name: "Plaza Vea",                  type: "Supermercado",        total: "S/ 87.50/canasta", product: "Canasta básica", rating: 4.3, featured: false, x: 45, y: 55, address: "C.C. Porongoche",    distance: "1.4 km · 17 min" },
    { id: 4, name: "Tottus Porongoche",          type: "Supermercado",        total: "S/ 94.00/canasta", product: "Canasta básica", rating: 4.6, featured: false, x: 70, y: 45, address: "C.C. Real Plaza",    distance: "1.8 km · 22 min" },
  ];

  const sel = establishments[selectedIdx];
  const userX = 15, userY = 78;

  return (
    <div className="flex flex-col h-full bg-[#F0F4F8] overflow-hidden">
      <StatusBar />
      <div className="bg-white border-b border-[#E2E8F0] px-4 pt-1 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-[#1E293B] text-lg flex-shrink-0">←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-[#1E293B]">Mapa de Establecimientos</h1>
            <p className="text-xs text-[#94A3B8] truncate">Opciones de compra en Paucarpata</p>
          </div>
        </div>
        <div className="flex bg-[#F1F5F9] rounded-xl p-1">
          <button onClick={() => setView("map")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${view==="map" ? "bg-white text-[#1E293B] shadow" : "text-[#94A3B8]"}`}>🗺️ Vista Mapa</button>
          <button onClick={() => setView("list")} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${view==="list" ? "bg-white text-[#1E293B] shadow" : "text-[#94A3B8]"}`}>📋 Vista Lista</button>
        </div>
      </div>

      {view === "list" ? (
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 flex flex-col gap-3">
          {establishments.map((e, i) => (
            <button key={e.id} onClick={() => { setSelectedIdx(i); setView("map"); }}
              className={`w-full bg-white rounded-2xl p-4 border-2 text-left transition-all shadow-sm active:scale-95 ${i === selectedIdx ? "border-[#0B63E5]" : "border-[#E2E8F0]"}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white ${e.featured ? "bg-[#F59E0B]" : e.type === "Tienda de descuento" ? "bg-[#22C55E]" : "bg-[#0B63E5]"}`}>
                    {i + 1}
                  </div>
                  <p className="font-bold text-[#1E293B] text-sm">{e.name}</p>
                </div>
                <div className="flex items-center gap-1"><span className="text-xs">⭐</span><span className="text-xs font-bold">{e.rating}</span></div>
              </div>
              <p className="text-xs text-[#94A3B8] ml-10 mb-1">{e.type} · {e.address}</p>
              <div className="ml-10 flex items-center gap-2">
                <span className="text-xs font-black text-[#22C55E]">{e.total}</span>
                <span className="text-xs text-[#64748B]">· {e.distance}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform 0.2s" }}>

            <rect x="2" y="2" width="96" height="96" rx="3" fill="#E8EFF5" stroke="#CBD5E1" strokeWidth="0.3" />
            <rect x="8" y="10" width="84" height="78" rx="2" fill="#F8FAFC" stroke="#0B63E5" strokeWidth="0.4" strokeDasharray="2 1" />
            <text x="50" y="8.5" textAnchor="middle" fill="#0B63E5" fontSize="2.5" fontWeight="bold" fontFamily="Inter">Paucarpata — Zona de comparación</text>

            {/* Streets */}
            <rect x="8" y="48" width="84" height="3" rx="0.5" fill="#E2E8F0" />
            <text x="10" y="50.7" fill="#94A3B8" fontSize="1.6" fontFamily="Inter">Av. Porongoche</text>
            <rect x="42" y="10" width="3" height="78" rx="0.5" fill="#E2E8F0" />
            <text x="43.5" y="72" fill="#94A3B8" fontSize="1.6" fontFamily="Inter" transform="rotate(-90 43.5 72)">Av. Los Incas</text>

            {/* Zone blocks */}
            {[
              { x: 12, y: 12, w: 28, h: 34 }, { x: 47, y: 12, w: 43, h: 34 },
              { x: 12, y: 53, w: 28, h: 33 }, { x: 47, y: 53, w: 43, h: 33 },
            ].map((b, i) => (
              <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="1" fill="#EEF4FF" stroke="#CBD5E1" strokeWidth="0.2" />
            ))}

            {/* Route polyline */}
            <polyline
              points={`${userX},${userY} ${userX},${sel.y} ${sel.x},${sel.y}`}
              fill="none" stroke="#0B63E5" strokeWidth="0.8"
              strokeDasharray="1.5 1" strokeLinecap="round" />
            <circle cx={sel.x} cy={sel.y} r="1.2" fill="#0B63E5" opacity="0.3" />

            {/* Non-selected pins */}
            {establishments.filter((_, i) => i !== selectedIdx).map((e) => (
              <g key={e.id} onClick={() => setSelectedIdx(e.id)} style={{ cursor: "pointer" }}>
                <circle cx={e.x} cy={e.y} r="3.2" fill="white"
                  stroke={e.type === "Tienda de descuento" ? "#22C55E" : "#0B63E5"} strokeWidth="0.5" opacity="0.85" />
                <text x={e.x} y={e.y + 0.9} textAnchor="middle"
                  fill={e.type === "Tienda de descuento" ? "#15803D" : "#1D4ED8"}
                  fontSize="2" fontWeight="bold" fontFamily="Inter">{e.id + 1}</text>
              </g>
            ))}

            {/* Selected pin */}
            <g>
              <circle cx={sel.x} cy={sel.y + 0.5} r="4.5" fill="black" opacity="0.12" />
              <circle cx={sel.x} cy={sel.y} r="4.5" fill={sel.featured ? "#F59E0B" : sel.type === "Tienda de descuento" ? "#22C55E" : "#0B63E5"} />
              <circle cx={sel.x} cy={sel.y} r="3.5" fill="white" />
              <text x={sel.x} y={sel.y + 1} textAnchor="middle" fill={sel.featured ? "#F59E0B" : sel.type === "Tienda de descuento" ? "#22C55E" : "#0B63E5"} fontSize="2.5" fontWeight="bold" fontFamily="Inter">{sel.id + 1}</text>
              <rect x={sel.x - 10} y={sel.y - 10} width="20" height="5.5" rx="1.2" fill="white" stroke={sel.featured ? "#F59E0B" : "#0B63E5"} strokeWidth="0.4" />
              <text x={sel.x} y={sel.y - 7.5} textAnchor="middle" fill="#1E293B" fontSize="1.8" fontWeight="bold" fontFamily="Inter">{sel.name.split(" ").slice(0, 3).join(" ")}</text>
              <text x={sel.x} y={sel.y - 5.5} textAnchor="middle" fill="#22C55E" fontSize="1.6" fontWeight="bold" fontFamily="Inter">{sel.total.split("/")[0]}</text>
            </g>

            {/* User location */}
            <circle cx={userX} cy={userY} r="4" fill="#0B63E5" opacity="0.12" className="gps-pulse" />
            <circle cx={userX} cy={userY} r="3.2" fill="#0B63E5" opacity="0.15" className="gps-pulse-2" />
            <circle cx={userX} cy={userY} r="2" fill="#0B63E5" />
            <circle cx={userX} cy={userY} r="0.9" fill="white" />
            <text x={userX + 3} y={userY - 2} fill="#0B63E5" fontSize="2" fontWeight="bold" fontFamily="Inter">Tu ubicación</text>
          </svg>

          <div className="absolute top-3 left-3 bg-white/95 rounded-xl px-3 py-2 shadow-lg border border-[#E2E8F0] flex items-center gap-2">
            <span className="text-sm">⏱️</span>
            <div>
              <p className="text-xs font-black text-[#1E293B]">{sel.distance}</p>
              <p className="text-xs text-[#94A3B8]">{sel.address}</p>
            </div>
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button className="w-10 h-10 bg-white/95 rounded-xl shadow-lg border border-[#E2E8F0] flex items-center justify-center text-lg active:scale-90 transition-transform">🎯</button>
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
              className="w-10 h-10 bg-white/95 rounded-xl shadow-lg border border-[#E2E8F0] flex items-center justify-center text-xl font-black text-[#1E293B] active:scale-90 transition-transform">+</button>
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.7))}
              className="w-10 h-10 bg-white/95 rounded-xl shadow-lg border border-[#E2E8F0] flex items-center justify-center text-xl font-black text-[#94A3B8] active:scale-90 transition-transform">−</button>
          </div>

          <div className="absolute bottom-44 left-0 right-0 px-3">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {establishments.map((e, i) => (
                <button key={e.id} onClick={() => setSelectedIdx(i)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all shadow-sm ${i === selectedIdx ? "bg-[#0B63E5] text-white border-[#0B63E5]" : "bg-white text-[#475569] border-[#E2E8F0]"}`}>
                  <span>{e.featured ? "🏆" : e.type === "Tienda de descuento" ? "🏷️" : "🏢"}</span>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ${sheetExpanded ? "h-72" : "h-44"}`}>
            <button onClick={() => setSheetExpanded(e => !e)} className="w-full pt-3 pb-2 flex flex-col items-center">
              <div className="w-10 h-1 bg-[#E2E8F0] rounded-full" />
            </button>
            <div className="px-5 overflow-hidden">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`px-2 py-0.5 rounded-lg text-xs font-black text-white ${sel.featured ? "bg-[#F59E0B]" : sel.type === "Tienda de descuento" ? "bg-[#22C55E]" : "bg-[#0B63E5]"}`}>
                      {sel.id + 1}
                    </div>
                    <p className="font-black text-[#1E293B] text-sm truncate">{sel.name}</p>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-snug">{sel.type}</p>
                  <p className="text-xs text-[#94A3B8]">Paucarpata, Arequipa</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <span className="text-sm">⭐</span>
                  <span className="text-sm font-black text-[#1E293B]">{sel.rating}</span>
                  <span className="text-xs text-[#94A3B8]">/5</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#DCFCE7] border border-[#22C55E]/30 rounded-xl px-3 py-2 mb-3">
                <span className="text-sm">🟢</span>
                <p className="text-xs font-bold text-[#15803D] leading-snug">
                  {sel.total} — <span className="font-black">{sel.distance}</span>
                </p>
              </div>
              {sheetExpanded && (
                <div className="flex flex-col gap-2 slide-up">
                  <button className="w-full py-3 rounded-xl bg-[#0B63E5] text-white font-bold text-sm shadow shadow-[#0B63E5]/25 active:scale-95 transition-transform flex items-center justify-center gap-2">
                    🗺️ Cómo llegar
                  </button>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 rounded-xl border-2 border-[#E2E8F0] text-[#1E293B] font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1">
                      💰 Ver precios
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl border-2 border-[#0B63E5] text-[#0B63E5] font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1">
                      🌐 Ir a Web
                    </button>
                  </div>
                </div>
              )}
              {!sheetExpanded && (
                <div className="flex gap-2">
                  <button className="flex-1 py-3 rounded-xl bg-[#0B63E5] text-white font-bold text-xs shadow shadow-[#0B63E5]/25 active:scale-95 transition-transform flex items-center justify-center gap-1">
                    🗺️ Cómo llegar
                  </button>
                  <button className="w-12 h-11 rounded-xl border-2 border-[#0B63E5] flex items-center justify-center text-lg active:scale-95 transition-transform">💰</button>
                  <button className="w-12 h-11 rounded-xl border-2 border-[#E2E8F0] flex items-center justify-center text-lg active:scale-95 transition-transform">🌐</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mis Listas ───────────────────────────────────────────────────────────────
function MisListasScreen({ district }: { district: District }) {
  const [tab, setTab] = useState<"canastas"|"favoritos">("canastas");

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <StatusBar />
      <div className="px-6 pt-3 pb-4 bg-white border-b border-[#E2E8F0]">
        <h1 className="text-base font-bold text-[#1E293B]">Mis Listas y Canastas Guardadas</h1>
      </div>
      <div className="flex bg-white border-b border-[#E2E8F0]">
        <button onClick={() => setTab("canastas")} className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${tab==="canastas" ? "border-[#0B63E5] text-[#0B63E5]" : "border-transparent text-[#94A3B8]"}`}>
          🛒 Canastas Frecuentes
        </button>
        <button onClick={() => setTab("favoritos")} className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${tab==="favoritos" ? "border-[#0B63E5] text-[#0B63E5]" : "border-transparent text-[#94A3B8]"}`}>
          ⭐ Establecimientos Favoritos
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">
        {tab === "canastas" ? (
          <div className="flex flex-col gap-4">
            {[
              { name: "Canasta Quincenal Gym", count: 5,  products: ["🍗 Pollo","🥚 Huevos","🌾 Avena","🥛 Leche","🍌 Plátano"], lastPrice: "S/ 76.50", saved: "S/ 18.00" },
              { name: "Básicos del Mes",        count: 8,  products: ["🍚 Arroz","🥔 Papa","🧅 Cebolla","🍅 Tomate","🫙 Aceite"],  lastPrice: "S/ 124.00",saved: "S/ 31.50" },
            ].map((basket, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-black text-[#1E293B] text-base">{basket.name}</p>
                      <p className="text-xs text-[#94A3B8]">{basket.count} productos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#22C55E] text-base">{basket.lastPrice}</p>
                      <p className="text-xs text-[#94A3B8]">último precio</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {basket.products.map((p, j) => (
                      <span key={j} className="text-xs bg-[#F1F5F9] text-[#475569] px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                  </div>
                  <GreenBadge label={`✓ Ahorraste ${basket.saved} la última vez`} />
                </div>
                <div className="border-t border-[#F8FAFC] px-4 py-3 flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl bg-[#0B63E5] text-white font-bold text-xs active:scale-95 transition-transform shadow shadow-[#0B63E5]/25">
                    🔄 Recalcular Precios Hoy
                  </button>
                  <button className="w-10 h-10 rounded-xl border border-[#E2E8F0] flex items-center justify-center text-lg">✏️</button>
                </div>
              </div>
            ))}
            <button className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#CBD5E1] text-[#94A3B8] font-semibold text-sm flex items-center justify-center gap-2">
              + Guardar canasta actual como lista
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[
              { name: "Tiendas Mass – Porongoche", type: "Tienda de descuento", address: "Av. Los Incas 320",   rating: 4.7, featured: true,  tags: ["🏷️ Descuento","🏆 Mejor precio"] },
              { name: "Franco Supermercados",       type: "Supermercado",        address: "Av. Porongoche 450", rating: 4.5, featured: false, tags: ["🏢 Super","✓ Completo"]        },
              { name: "Tottus Porongoche",          type: "Supermercado",        address: "C.C. Real Plaza",    rating: 4.6, featured: false, tags: ["🏢 Super","🌐 Compra Online"]   },
            ].map((est, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#F1F5F9] flex items-center justify-center text-xl flex-shrink-0">
                    {est.type === "Tienda de descuento" ? "🏷️" : "🏢"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-[#1E293B] text-sm">{est.name}</p>
                      {est.featured && <OrangeBadge label="🏆" />}
                    </div>
                    <p className="text-xs text-[#94A3B8]">{est.type} · {est.address}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {est.tags.map((t, j) => <span key={j} className="text-xs bg-[#F1F5F9] text-[#475569] px-1.5 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 mb-2"><span className="text-xs">⭐</span><span className="text-xs font-bold text-[#1E293B]">{est.rating}</span></div>
                    <button className="bg-[#0B63E5] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">🗺️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Buyer Profile ────────────────────────────────────────────────────────────
function BuyerProfileScreen({ name, email, district, trialUsed, onScanner }: {
  name: string; email: string; district: District; trialUsed: boolean; onScanner: () => void;
}) {
  const d = DISTRICT_DATA[district];
  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <StatusBar />
      <div className="px-6 pt-3 pb-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between">
        <h1 className="text-base font-bold text-[#1E293B]">Mi Perfil</h1>
        <button className="text-xl">⚙️</button>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0B63E5] flex items-center justify-center text-white text-2xl font-black">{name[0]?.toUpperCase() ?? "M"}</div>
          <div>
            <p className="font-black text-[#1E293B] text-base">{name}</p>
            <p className="text-xs text-[#94A3B8]">{email || "sin correo registrado"}</p>
            <p className="text-xs text-[#0B63E5] font-semibold mt-0.5">📍 {d.label}, Arequipa</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#0B63E5] to-[#1D4ED8] rounded-2xl p-4 mb-4 text-white">
          <p className="text-xs opacity-75 mb-1">🎉 Tu impacto en Ca$erIA</p>
          <p className="text-2xl font-black mb-0.5">S/ 142.50 <span className="text-sm font-medium opacity-80">ahorrado</span></p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-[#22C55E] rounded-full" />
            </div>
            <span className="text-xs font-bold bg-[#22C55E] px-2 py-0.5 rounded-full">Ahorrador Experto</span>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-[#FF9800] bg-gradient-to-br from-[#FFF3E0] to-white p-4 mb-4 shadow shadow-[#FF9800]/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-xl">⭐</span><p className="font-black text-[#1E293B] text-base">Ca$erIA Premium</p></div>
            <div className="text-right"><p className="font-black text-[#FF9800]">S/ 9.90</p><p className="text-xs text-[#94A3B8]">/mes</p></div>
          </div>
          {["✓ Asistente nutricional con IA","✓ Escáner de alimentos ilimitado","✓ Canastas personalizadas","✓ Personalización de presupuesto","✓ Alertas de precios y promociones","✓ Historial y análisis de gastos"].map((b,i) => (
            <p key={i} className="text-xs text-[#475569] mb-1">{b}</p>
          ))}
          <button className="w-full mt-3 py-3 rounded-xl bg-[#0B63E5] text-white font-bold text-sm active:scale-95 transition-transform shadow shadow-[#0B63E5]/25">Obtener Premium</button>
        </div>

        <div className="mb-4">
          <p className="text-xs font-black text-[#1E293B] uppercase tracking-wide mb-3">✨ Funciones con IA</p>
          <div className="flex flex-col gap-3">
            {[
              { emoji: "📷", title: "Escáner IA de Frescura",        desc: "Analiza calidad y vida útil de tus compras.", used: trialUsed, action: !trialUsed ? onScanner : null },
              { emoji: "🥗", title: "IA Nutricional + Especialistas", desc: "Planes de salud y citas con nutricionistas.",  used: false,     action: null },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-start gap-3 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-[#EEF4FF] flex items-center justify-center text-2xl flex-shrink-0">{f.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-[#1E293B] text-sm">{f.title}</p>
                    {f.used
                      ? <span className="text-xs font-bold text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded-full">🔒 Premium</span>
                      : <span className="text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">🎁 1 Prueba Gratis</span>
                    }
                  </div>
                  <p className="text-xs text-[#64748B] leading-snug mb-1">{f.desc}</p>
                  {f.action && <button onClick={f.action} className="text-xs text-[#0B63E5] font-bold">Usar prueba gratis →</button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          {["📍 Establecimientos Preferidos","🔔 Notificaciones","❓ Centro de Ayuda","🚪 Cerrar Sesión"].map((item, i, arr) => (
            <button key={i} className={`w-full px-4 py-3.5 flex items-center justify-between text-sm font-medium text-left ${item.includes("Cerrar") ? "text-red-500" : "text-[#1E293B]"} ${i < arr.length-1 ? "border-b border-[#F1F5F9]" : ""}`}>
              {item}
              {!item.includes("Cerrar") && <span className="text-[#CBD5E1]">›</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI Scanner ───────────────────────────────────────────────────────────────
function ScannerScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const done = progress >= 100;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(interval); return 100; } return p + 4; });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0F172A] overflow-hidden">
      <StatusBar dark />
      <div className="px-4 pt-2 pb-3 flex items-center gap-3">
        <button onClick={onDone} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white">←</button>
        <div>
          <p className="text-white font-bold text-sm">📷 Escáner IA de Frescura</p>
          <p className="text-white/50 text-xs">Prueba gratis · 1 uso disponible</p>
        </div>
        <div className="ml-auto"><span className="text-xs font-bold text-[#FF9800] bg-[#FF9800]/20 px-2 py-1 rounded-full">🎁 Gratis</span></div>
      </div>

      <div className="flex-1 relative mx-4 mb-4 rounded-3xl overflow-hidden border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center">
          <span className="text-9xl" style={{ filter: "drop-shadow(0 0 20px rgba(34,197,94,0.4))" }}>🍅</span>
        </div>
        {[["top-8 left-8","border-t-4 border-l-4"],["top-8 right-8","border-t-4 border-r-4"],["bottom-24 left-8","border-b-4 border-l-4"],["bottom-24 right-8","border-b-4 border-r-4"]].map(([pos,border],i) => (
          <div key={i} className={`absolute ${pos} w-8 h-8 ${border} border-[#22C55E] rounded-sm`} />
        ))}
        {!done && (
          <div className="absolute left-8 right-8 h-0.5 bg-[#22C55E] shadow-lg shadow-[#22C55E]/80"
            style={{ top: `${8 + (progress/100)*60}%`, transition: "top 0.08s linear" }} />
        )}
        <div className="absolute bottom-6 left-8 right-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#22C55E] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-white/60 text-xs">{progress}%</span>
          </div>
          <p className="text-white/60 text-xs text-center">{done ? "¡Análisis completado!" : "Analizando frescura con IA..."}</p>
        </div>
        {done && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center px-6 slide-up">
            <div className="bg-white rounded-3xl p-5 w-full shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                <span className="text-sm font-black text-[#1E293B]">🟢 Frescura: 95% — Excelente Estado</span>
              </div>
              <p className="text-xs text-[#475569] mb-1">📅 <span className="font-semibold">Vida útil:</span> 5 días en refrigeración.</p>
              <p className="text-xs text-[#475569] mb-3">💰 <span className="font-semibold">Precio sugerido:</span> S/ 3.50/kg en establecimientos de Paucarpata.</p>
              <GreenBadge label="✓ Apto para compra" />
            </div>
          </div>
        )}
      </div>

      {done && (
        <div className="mx-4 mb-6 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] rounded-2xl p-4 slide-up">
          <p className="text-white font-bold text-sm mb-1">🎉 Gastaste tu prueba gratis.</p>
          <p className="text-white/70 text-xs mb-3">Suscríbete a Ca$erIA Premium (S/ 9.90/mes) para uso ilimitado.</p>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-white text-[#4F46E5] font-bold text-xs active:scale-95 transition-transform">Obtener Premium</button>
            <button onClick={onDone} className="flex-1 py-2.5 rounded-xl bg-white/20 text-white font-bold text-xs active:scale-95 transition-transform">Continuar gratis</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
const BUYER_NAV_SCREENS: Screen[] = ["home","monthlybudget","purchasebudget","select","quantbudget","budget","loading","results","stallstandard","stallpremium","stallmap","mislistas","buyerprofile","scanner"];

export default function App() {
  const [screen,     setScreen]     = useState<Screen>("intro");
  const [userName,   setUserName]   = useState("Mateo");
  const [userEmail,  setUserEmail]  = useState("");
  const [district]                  = useState<District>("paucarpata");
  const [selected,   setSelected]   = useState<number[]>([2,3,6]);
  const [quantities, setQuantities] = useState<Record<number,number>>({ 2:2, 3:30, 6:1 });
  const [budget,     setBudget]     = useState("100");
  const [monthlyBudget, setMonthlyBudget] = useState("500");
  const [purchases, setPurchases] = useState<Purchase[]>([{ date: "12 septiembre", store: "Franco Supermercados", amount: 200 }]);
  const [trialUsed,  setTrialUsed]  = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [webModalName,     setWebModalName]     = useState<string | null>(null);

  const toggleProduct = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const changeQty = (id: number, delta: number) =>
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }));

  const estimatedCost = PRODUCTS
    .filter(p => selected.includes(p.id))
    .reduce((sum, p) => sum + p.price * (quantities[p.id] ?? 1), 0);
  const monthlySpent = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const monthlyAvailable = (Number.parseFloat(monthlyBudget) || 0) - monthlySpent;
  const registerPurchase = (store: string, amount: number) => {
    setPurchases(previous => [...previous, { date: "29 septiembre", store, amount }]);
    setScreen("monthlybudget");
  };

  const showBuyerNav = BUYER_NAV_SCREENS.includes(screen);

  return (
    <div className="h-full flex items-center justify-center bg-[#CBD5E1]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="relative flex flex-col bg-[#F8FAFC] overflow-hidden shadow-2xl"
        style={{ width: 393, height: 852, borderRadius: 44 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#0F172A] rounded-b-2xl z-50" />

        <div className="flex-1 flex flex-col overflow-hidden mt-7">
          {screen === "intro" && (
            <IntroScreen onNext={() => setScreen("onboarding1")} />
          )}
          {screen === "onboarding1" && (
            <OnboardingScreen step={1} onNext={() => setScreen("onboarding2")} onSkip={() => setScreen("splash")} />
          )}
          {screen === "onboarding2" && (
            <OnboardingScreen step={2} onNext={() => setScreen("onboarding3")} onSkip={() => setScreen("splash")} />
          )}
          {screen === "onboarding3" && (
            <OnboardingScreen step={3} onNext={() => setScreen("splash")} onSkip={() => setScreen("splash")} />
          )}
          {screen === "splash" && (
            <SplashScreen onNext={(n, e) => { setUserName(n); setUserEmail(e); setScreen("permission"); }} />
          )}
          {screen === "permission" && (
            <PermissionScreen onNext={() => setScreen("register")} />
          )}
          {screen === "register" && (
            <RegisterScreen onNext={() => setScreen("home")} />
          )}
          {screen === "home" && (
            <HomeScreen name={userName} district={district} trialUsed={trialUsed}
              monthlyBudget={monthlyBudget} monthlySpent={monthlySpent}
              onDistrictSwitch={() => setShowDistrictModal(true)}
              onBasket={() => setScreen("purchasebudget")}
              onBudget={() => setScreen("monthlybudget")}
              onScanner={() => setScreen("scanner")} />
          )}
          {screen === "monthlybudget" && <MonthlyBudgetScreen monthlyBudget={monthlyBudget} spent={monthlySpent} purchases={purchases} setMonthlyBudget={setMonthlyBudget} onBack={() => setScreen("home")} />}
          {screen === "purchasebudget" && <PurchaseBudgetScreen monthlyAvailable={monthlyAvailable} budget={budget} setBudget={setBudget} onNext={() => setScreen("select")} onBack={() => setScreen("home")} />}
          {screen === "select" && (
            <SelectScreen selected={selected} onToggle={toggleProduct}
              onNext={() => setScreen("quantbudget")} onBack={() => setScreen("purchasebudget")} />
          )}
          {screen === "quantbudget" && (
            <QuantBudgetScreen selected={selected} quantities={quantities} budget={budget} onQty={changeQty}
              onNext={() => setScreen("loading")} onBack={() => setScreen("select")} />
          )}
          {screen === "budget" && (
            <BudgetScreen selected={selected} quantities={quantities}
              budget={budget} setBudget={setBudget}
              onNext={() => setScreen("loading")} onBack={() => setScreen("quantbudget")} />
          )}
          {screen === "loading" && (
            <LoadingScreen district={district} onNext={() => setScreen("results")} />
          )}
          {screen === "results" && (
            <ResultsScreen district={district} budget={budget} selected={selected} quantities={quantities} onRegisterPurchase={registerPurchase}
              onStallStandard={() => setScreen("stallstandard")}
              onStallPremium={() => setScreen("stallpremium")}
              onWebRedirect={name => setWebModalName(name)}
              onBack={() => setScreen("home")} />
          )}
          {screen === "stallstandard" && (
            <StallStandardScreen onBack={() => setScreen("results")} />
          )}
          {screen === "stallpremium" && (
            <StallPremiumScreen onBack={() => setScreen("results")} onMap={() => setScreen("stallmap")} />
          )}
          {screen === "stallmap" && (
            <StallMapScreen onBack={() => setScreen("stallpremium")} />
          )}
          {screen === "mislistas" && <MisListasScreen district={district} />}
          {screen === "buyerprofile" && (
            <BuyerProfileScreen name={userName} email={userEmail} district={district}
              trialUsed={trialUsed} onScanner={() => setScreen("scanner")} />
          )}
          {screen === "scanner" && (
            <ScannerScreen onDone={() => { setTrialUsed(true); setScreen("buyerprofile"); }} />
          )}

          {showBuyerNav && <BuyerNav screen={screen} onNav={setScreen} />}
        </div>

        {showDistrictModal && (
          <DistrictModal onClose={() => setShowDistrictModal(false)} />
        )}
        {webModalName && (
          <WebRedirectModal name={webModalName} onClose={() => setWebModalName(null)} />
        )}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-[#1E293B]/15 rounded-full" />
      </div>
    </div>
  );
}
