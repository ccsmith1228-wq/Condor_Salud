import Link from "next/link";
import {
  Search,
  FileText,
  ShieldCheck,
  TrendingUp,
  Plug,
  BarChart3,
  Calendar,
  Pill,
  Video,
  Stethoscope,
} from "lucide-react";

const coreFeatures = [
  {
    icon: Search,
    title: "Verificación Tiempo Real",
    desc: "Verificá cobertura de PAMI, obras sociales y prepagas antes de atender al paciente. Padrón actualizado, copago estimado y autorización online en segundos.",
    highlight: "Ahorrá 3hs/día en llamadas",
    celeste: true,
  },
  {
    icon: FileText,
    title: "Facturación Unificada",
    desc: "Nomenclador SSS + PAMI + arancelarios de cada prepaga en una sola interfaz. Liquidación automática por financiador con validación preventiva de errores.",
    highlight: "Facturá 3x más rápido",
    celeste: false,
  },
  {
    icon: ShieldCheck,
    title: "Auditoría Inteligente",
    desc: "El sistema revisa cada línea de facturación contra las reglas de cada financiador ANTES de presentar. Detecta códigos incorrectos, combinaciones inválidas y datos faltantes.",
    highlight: "Reduce rechazos 40–60%",
    celeste: true,
  },
  {
    icon: TrendingUp,
    title: "Tracker de Inflación",
    desc: "Visualizá el valor real vs. nominal de cada cobro. Sabé exactamente cuánto perdés por cada día de demora y compará rendimiento entre financiadores ajustado por IPC.",
    highlight: "Visibilidad peso x peso",
    celeste: false,
  },
  {
    icon: Plug,
    title: "Integración Total",
    desc: "AFIP factura electrónica, receta digital PAMI, SISA, REFEPS y conexión directa con Swiss Medical, OSDE, IOMA, Galeno, Medifé y más de 280 obras sociales.",
    highlight: "330+ integraciones",
    celeste: true,
  },
  {
    icon: BarChart3,
    title: "Dashboard Directivo",
    desc: "Ingresos, rechazos, demoras y rendimiento por financiador en una sola vista. Alertas automáticas cuando algo se desvía. Exportá reportes en PDF y Excel.",
    highlight: "Decisiones con datos reales",
    celeste: false,
  },
];

const extraModules = [
  {
    icon: Calendar,
    title: "Agenda inteligente",
    desc: "Turnos con verificación automática de cobertura",
  },
  { icon: Pill, title: "Farmacia Online", desc: "Receta digital + cobertura PAMI integrada" },
  { icon: Video, title: "Telemedicina", desc: "Videoconsulta con facturación automática" },
  {
    icon: Stethoscope,
    title: "Triage IA",
    desc: "Clasificación de urgencias con inteligencia artificial",
  },
];

export default function Features() {
  return (
    <section id="producto" className="px-6 py-20 bg-celeste-pale/50">
      <div className="max-w-[960px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          El producto
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          Todo lo que tu clínica necesita.{" "}
          <em className="not-italic text-celeste-dark">Una sola base de datos.</em>
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
          19 módulos integrados que cubren desde la verificación de cobertura hasta el reporte
          directivo. Sin módulos sueltos, sin integraciones extra, sin costos ocultos.
        </p>

        {/* Core feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {coreFeatures.map((f) => (
            <div
              key={f.title}
              className={`border-l-[3px] rounded-lg p-5 hover:shadow-sm transition ${
                f.celeste ? "border-celeste bg-celeste-pale/60" : "border-celeste-light bg-white"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/80 border border-celeste/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-celeste-dark" />
                </div>
                <h3 className="font-bold text-sm text-ink">{f.title}</h3>
              </div>
              <p className="text-[13px] text-ink-light leading-relaxed mb-3">{f.desc}</p>
              <span className="inline-block text-[10px] font-bold text-celeste-dark bg-celeste-pale px-2 py-0.5 rounded">
                {f.highlight}
              </span>
            </div>
          ))}
        </div>

        {/* Extra modules */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h3 className="text-sm font-bold text-ink mb-1">Y mucho más incluido en tu plan</h3>
          <p className="text-[12px] text-ink-muted mb-5">
            19 módulos totales — todos integrados entre sí, sin costo adicional
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {extraModules.map((m) => (
              <div key={m.title} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded bg-celeste-pale flex items-center justify-center shrink-0 mt-0.5">
                  <m.icon className="w-3.5 h-3.5 text-celeste-dark" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">{m.title}</p>
                  <p className="text-[11px] text-ink-muted leading-snug">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-celeste-dark border border-celeste-dark rounded-[4px] hover:bg-celeste-pale transition"
          >
            Explorá el demo completo
          </Link>
        </div>
      </div>
    </section>
  );
}
