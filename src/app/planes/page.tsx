"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { whatsappUrl } from "@/lib/utils";
import { usePlan } from "@/lib/plan-context";
import {
  MODULES,
  CATEGORIES,
  PRESETS,
  getModule,
  getBaseModules,
  calcSubtotal,
  calcPresetPrice,
  calcPresetSubtotal,
  formatARS,
  type ModuleId,
  type PresetId,
  type CategoryId,
} from "@/lib/plan-config";
import { Check, ChevronDown, ChevronUp, Lock, Zap } from "lucide-react";

// ─── Preset Tier Card ────────────────────────────────────────

function TierCard({
  presetId,
  active,
  onSelect,
}: {
  presetId: PresetId;
  active: boolean;
  onSelect: (id: PresetId) => void;
}) {
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const price = calcPresetPrice(preset);
  const subtotal = calcPresetSubtotal(preset);
  const hasDiscount = preset.discount > 0;
  const isPro = preset.popular;

  // Modules ONLY in this tier (not in the tier below)
  const presetIdx = PRESETS.findIndex((p) => p.id === presetId);
  const prevModules = presetIdx > 0 ? (PRESETS[presetIdx - 1]?.modules ?? []) : [];
  const ownModules = preset.modules.filter((m) => !prevModules.includes(m));
  const inheritedLabel = presetIdx > 0 ? `Todo en ${PRESETS[presetIdx - 1]?.name ?? ""}` : null;

  return (
    <div
      className={`relative flex flex-col rounded-xl border-2 p-6 transition ${
        isPro
          ? "border-celeste bg-celeste-pale/40 scale-[1.02] shadow-lg"
          : active
            ? "border-celeste-dark bg-white shadow-md"
            : "border-border bg-white hover:border-celeste-200"
      }`}
    >
      {/* Popular badge */}
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-celeste-dark text-white rounded-full">
            Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-ink">{preset.name}</h3>
        <p className="text-xs text-ink-muted mt-0.5">{preset.tagline}</p>
      </div>

      {/* Price */}
      <div className="mb-5">
        {hasDiscount && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-ink-muted line-through">{formatARS(subtotal)}</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded">
              {Math.round(preset.discount * 100)}% dto.
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${isPro ? "text-celeste-dark" : "text-ink"}`}>
            {formatARS(price)}
          </span>
          <span className="text-sm text-ink-muted">/mes</span>
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 space-y-2 mb-6">
        {inheritedLabel && (
          <p className="text-xs font-semibold text-celeste-dark mb-2">{inheritedLabel}, mas:</p>
        )}
        {ownModules.map((modId) => {
          const mod = getModule(modId);
          return (
            <div key={modId} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-celeste-dark mt-0.5 shrink-0" />
              <span className="text-xs text-ink leading-snug">{mod.label}</span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-auto space-y-2">
        <button
          onClick={() => onSelect(preset.id)}
          className={`w-full py-2.5 text-xs font-semibold rounded-[4px] transition ${
            isPro || active
              ? "bg-celeste-dark text-white hover:bg-celeste"
              : "border border-celeste-dark text-celeste-dark hover:bg-celeste-pale"
          }`}
        >
          {active ? "Plan seleccionado" : "Elegir plan"}
        </button>
        <p className="text-center text-[10px] text-ink-muted">
          {preset.modules.length} módulos incluidos
          {preset.annual ? " · Contrato anual disponible" : ""}
        </p>
      </div>
    </div>
  );
}

// ─── Category Accordion ──────────────────────────────────────

function CategoryAccordion({
  categoryId,
  selectedModules,
  onToggle,
}: {
  categoryId: CategoryId;
  selectedModules: ModuleId[];
  onToggle: (id: ModuleId) => void;
}) {
  const [open, setOpen] = useState(true);
  const cat = CATEGORIES.find((c) => c.id === categoryId)!;
  const catModules = cat.modules.map((id) => getModule(id));
  const selectedCount = catModules.filter((m) => selectedModules.includes(m.id)).length;
  const baseIds = getBaseModules();

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white hover:bg-surface/50 transition"
        aria-expanded={open ? "true" : "false"}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink">{cat.label}</span>
          <span className="text-[10px] font-medium text-ink-muted bg-surface px-2 py-0.5 rounded-full">
            {selectedCount}/{catModules.length}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-ink-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ink-muted" />
        )}
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {catModules.map((mod) => {
            const isBase = baseIds.includes(mod.id);
            const isSelected = selectedModules.includes(mod.id);
            return (
              <label
                key={mod.id}
                className={`flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-surface/30 transition ${
                  isBase ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(mod.id)}
                  disabled={isBase}
                  className="w-4 h-4 rounded border-gray-300 text-celeste-dark focus:ring-celeste accent-celeste-dark"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{mod.label}</span>
                    {isBase && <Lock className="w-3 h-3 text-ink-muted" />}
                    {mod.phase > 1 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 rounded">
                        Fase {mod.phase}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">{mod.desc}</p>
                  {mod.deps && mod.deps.length > 0 && (
                    <p className="text-[10px] text-celeste-dark mt-0.5">
                      Requiere: {mod.deps.map((d) => getModule(d).label).join(", ")}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-ink">{formatARS(mod.price)}</span>
                  <span className="text-[10px] text-ink-muted block">/mes</span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── FAQ Accordion ───────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí, podés agregar o quitar módulos desde Configuración. Los cambios se aplican en tu próxima facturación.",
  },
  {
    q: "¿Hay contratos de permanencia?",
    a: "No, pagás mes a mes. Podés cancelar cuando quieras sin penalidad.",
  },
  {
    q: "¿Qué pasa con los módulos en Fase 2/3?",
    a: "Al seleccionarlos hoy accedés sin costo adicional cuando estén disponibles. Reservás el precio actual.",
  },
  {
    q: "¿Cómo funciona el ajuste por IPC?",
    a: "Los precios se actualizan mensualmente según el IPC publicado por INDEC. Recibís aviso 15 días antes.",
  },
  {
    q: "¿Hay descuento por contrato anual?",
    a: "Sí, consultanos por WhatsApp para planes anuales con descuento adicional.",
  },
  {
    q: "¿Las dependencias significan que pago doble?",
    a: "No, los módulos requeridos son necesarios para que el módulo que elegiste funcione correctamente. Solo pagás una vez por cada módulo.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
        aria-expanded={open ? "true" : "false"}
      >
        <span className="text-sm font-medium text-ink group-hover:text-celeste-dark transition pr-4">
          {q}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-ink-muted shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ink-muted shrink-0" />
        )}
      </button>
      {open && <p className="text-sm text-ink-muted leading-relaxed pb-4 pr-8">{a}</p>}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function PlanesPage() {
  return (
    <Suspense>
      <PlanesContent />
    </Suspense>
  );
}

function PlanesContent() {
  const plan = usePlan();
  const searchParams = useSearchParams();
  const router = useRouter();
  const customRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [mobileBar, setMobileBar] = useState(false);

  // Auto-select tier from URL query param (?tier=esencial|profesional|enterprise)
  const urlTier = searchParams.get("tier") as PresetId | null;
  useEffect(() => {
    if (urlTier && PRESETS.find((p) => p.id === urlTier)) {
      plan.applyPreset(urlTier);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTier]);

  const handleSelectPreset = (id: PresetId) => {
    plan.applyPreset(id);
    // Update URL to reflect selected tier (shallow, no scroll)
    router.replace(`/planes?tier=${id}`, { scroll: false });
    // Scroll to custom section to show checked modules
    setTimeout(() => {
      customRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleToggle = (id: ModuleId) => {
    plan.toggleModule(id);
  };

  const subtotal = calcSubtotal(plan.selectedModules);
  const discountAmount = subtotal - plan.total;
  const activePresetDef = plan.activePreset
    ? PRESETS.find((p) => p.id === plan.activePreset)
    : null;

  // L-08: Removed dead typeof window check (no-op in "use client" component)

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border px-6 lg:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/condor.png"
            alt="Cóndor Salud"
            width={36}
            height={36}
            className="w-9 h-9 object-contain"
          />
          <div className="font-display font-bold text-lg">
            <span className="text-celeste-dark">CÓNDOR </span>
            <span className="text-gold">SALUD</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-medium text-ink-muted hover:text-ink transition hidden sm:inline"
          >
            Inicio
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-xs font-semibold text-white bg-celeste-dark hover:bg-celeste rounded-[4px] transition"
          >
            Ir al Dashboard
          </Link>
        </div>
      </nav>

      {/* ── Section A: Hero ──────────────────────────────── */}
      <section className="px-6 pt-16 pb-12 text-center">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-3">
          Planes y Precios
        </p>
        <h1 className="text-[clamp(28px,4vw,42px)] font-bold text-ink leading-tight">
          El plan <span className="text-celeste-dark">perfecto</span> para tu clínica
        </h1>
        <p className="text-sm text-ink-muted mt-3 max-w-lg mx-auto leading-relaxed">
          Elegí un plan prediseñado o armá el tuyo a medida. Sin contratos de permanencia. Ajuste
          mensual IPC.
        </p>
      </section>

      {/* ── Section B: Preset Tier Cards ─────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-[960px] mx-auto grid md:grid-cols-3 gap-6 items-start">
          {PRESETS.map((preset) => (
            <TierCard
              key={preset.id}
              presetId={preset.id}
              active={plan.activePreset === preset.id}
              onSelect={handleSelectPreset}
            />
          ))}
        </div>
      </section>

      {/* ── Section C: Divider ───────────────────────────── */}
      <div id="custom" ref={customRef} className="max-w-[960px] mx-auto px-6 py-2">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-ink-muted whitespace-nowrap flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-celeste" />o armá tu propio plan
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </div>

      {/* ── Section D + E: Custom Builder + Summary ──────── */}
      <section className="max-w-[960px] mx-auto px-6 py-10">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
          {/* Module Picker */}
          <div className="space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-ink">Armá tu plan a medida</h2>
              <p className="text-sm text-ink-muted mt-1">
                Seleccioná los módulos que necesitás. Las dependencias se agregan automáticamente.
              </p>
            </div>
            {CATEGORIES.map((cat) => (
              <CategoryAccordion
                key={cat.id}
                categoryId={cat.id}
                selectedModules={plan.selectedModules}
                onToggle={handleToggle}
              />
            ))}
          </div>

          {/* Sticky Summary Sidebar (desktop) */}
          <div className="hidden lg:block">
            <div
              ref={summaryRef}
              className="sticky top-20 border border-border rounded-xl p-6 bg-white"
            >
              <h3 className="text-sm font-bold text-ink mb-4">Resumen del plan</h3>

              {activePresetDef && (
                <div className="mb-4 px-3 py-2 bg-celeste-pale rounded-lg">
                  <p className="text-xs font-semibold text-celeste-dark">
                    Plan {activePresetDef.name} activo
                  </p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Módulos</span>
                  <span className="font-semibold text-ink">{plan.selectedModules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="text-ink">{formatARS(subtotal)}/mes</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({Math.round(plan.discount * 100)}%)</span>
                    <span>-{formatARS(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-bold text-ink">Total</span>
                  <span className="text-lg font-bold text-celeste-dark">
                    {formatARS(plan.total)}/mes
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Link
                  href="/dashboard"
                  className="block w-full py-2.5 text-center text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
                >
                  Comenzar con este plan
                </Link>
                <a
                  href={whatsappUrl("Hola, quiero consultar sobre planes de Cóndor Salud.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 text-center text-xs font-medium border border-border text-ink-muted rounded-[4px] hover:border-celeste-dark hover:text-celeste-dark transition"
                >
                  Hablar con un asesor
                </a>
              </div>

              <p className="text-[10px] text-ink-muted text-center mt-4 leading-snug">
                Precios en ARS. Ajuste mensual IPC.
                <br />
                IVA no incluido.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Bottom Bar ────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-ink-muted">
              {plan.selectedModules.length} módulos
              {activePresetDef ? ` · ${activePresetDef.name}` : ""}
            </p>
            <p className="text-lg font-bold text-celeste-dark">{formatARS(plan.total)}/mes</p>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-xs font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition whitespace-nowrap"
          >
            Comenzar
          </Link>
        </div>
      </div>

      {/* ── Section F: FAQ ───────────────────────────────── */}
      <section className="max-w-[640px] mx-auto px-6 py-16 pb-32 lg:pb-16">
        <h2 className="text-xl font-bold text-ink mb-6 text-center">Preguntas frecuentes</h2>
        <div className="border-t border-border">
          {FAQ_ITEMS.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="text-xs text-ink-muted">
          Cóndor Salud — Plataforma para el sistema de salud argentino
        </p>
      </footer>
    </div>
  );
}
