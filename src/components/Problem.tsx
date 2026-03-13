import { Building2, HeartPulse, ShieldAlert, Landmark } from "lucide-react";

const problems = [
  {
    icon: Landmark,
    title: "Hospitales Públicos",
    desc: "Sistemas HIS legados de los años 90. Sin APIs, sin interoperabilidad. 1.400 hospitales completamente desconectados del sector privado. Registros en papel que se pierden entre guardias.",
    stats: "1.400 hospitales · SISA desactualizado · 0 APIs públicas",
    accent: "border-celeste",
  },
  {
    icon: Building2,
    title: "Obras Sociales",
    desc: "Más de 300 financiadores, cada uno con su portal web, su formato de presentación (AGFA, formularios propios) y su calendario de auditoría. Tu equipo pierde horas adaptándose a cada uno.",
    stats: "300+ portales · Formatos AGFA · Auditoría manual",
    accent: "border-celeste-light",
  },
  {
    icon: HeartPulse,
    title: "Prepagas",
    desc: "Swiss Medical, OSDE, Galeno — cada prepaga tiene su propia API, su flujo de autorización y sus reglas de cobertura. Una integración diferente por cada contrato. Meses de desarrollo.",
    stats: "45+ prepagas · APIs heterogéneas · Meses de integración",
    accent: "border-celeste",
  },
  {
    icon: ShieldAlert,
    title: "PAMI",
    desc: "El financiador más grande de Argentina con 5.5 millones de afiliados, nomenclador propio que cambia cada mes, receta digital obligatoria y una tasa de rechazo que llega al 25%.",
    stats: "5.5M afiliados · Rechazo 12–25% · Nomenclador mensual",
    accent: "border-celeste-light",
  },
];

const consequences = [
  "Horas de trabajo manual verificando padrones por teléfono",
  "Facturas rechazadas que se descubren 60 días después",
  "Ingresos que se deprecian 8–15% antes de cobrarlos",
  "Personal administrativo saturado con tareas repetitivas",
  "Directivos sin visibilidad del flujo real de ingresos",
  "Riesgo de errores de nomenclador en cada presentación",
];

export default function Problem() {
  return (
    <section id="problema" className="px-6 py-20 border-t border-border">
      <div className="max-w-[960px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          El problema
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          El sistema de salud argentino{" "}
          <em className="not-italic text-celeste-dark">no se habla entre sí</em>
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[640px] mb-10">
          Argentina tiene uno de los sistemas de salud más fragmentados del mundo. Público, obras
          sociales, prepagas y PAMI operan en silos separados. Tu clínica paga las consecuencias.
        </p>

        {/* Problem cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {problems.map((p) => (
            <div
              key={p.title}
              className={`border-l-[3px] ${p.accent} bg-white border border-l-[3px] border-border rounded-lg p-5 hover:shadow-sm transition`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-celeste-pale flex items-center justify-center shrink-0">
                  <p.icon className="w-4 h-4 text-celeste-dark" />
                </div>
                <h3 className="font-bold text-sm text-ink">{p.title}</h3>
              </div>
              <p className="text-[13px] text-ink-light leading-relaxed mb-3">{p.desc}</p>
              <p className="text-[10px] font-medium text-celeste-dark/70 tracking-wide">
                {p.stats}
              </p>
            </div>
          ))}
        </div>

        {/* Consequences */}
        <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-6">
          <h3 className="text-sm font-bold text-ink mb-3">
            ¿El resultado? Tu clínica pierde tiempo y dinero cada día:
          </h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {consequences.map((c) => (
              <div key={c} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                <p className="text-[13px] text-ink-light leading-relaxed">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
