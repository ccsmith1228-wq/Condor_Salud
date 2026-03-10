const features = [
  {
    title: "Verificación Tiempo Real",
    desc: "Padrón PAMI, obras sociales y prepagas. Cobertura verificada antes de la consulta.",
    celeste: true,
  },
  {
    title: "Facturación Unificada",
    desc: "Nomenclador SSS + PAMI + arancelarios. Liquidación automática por financiador.",
    celeste: false,
  },
  {
    title: "Auditoría Inteligente",
    desc: "Detección preventiva de errores antes de presentar. Reduce rechazos 40–60%.",
    celeste: true,
  },
  {
    title: "Tracker de Inflación",
    desc: "Valor real vs. nominal de cada cobro. Cuánto perdés por día de demora.",
    celeste: false,
  },
  {
    title: "Integración Total",
    desc: "AFIP, receta digital PAMI, SISA, Swiss Medical, OSDE, IOMA, Galeno.",
    celeste: true,
  },
  {
    title: "Dashboard Directivo",
    desc: "Ingresos, rechazos, demoras, rendimiento por financiador en una vista.",
    celeste: false,
  },
];

export default function Features() {
  return (
    <section id="producto" className="px-6 py-20 bg-celeste-pale">
      <div className="max-w-[900px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          El producto
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          Todo lo que tu clínica necesita.{" "}
          <em className="not-italic text-celeste-dark">Una sola base de datos.</em>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {features.map((f) => (
            <div
              key={f.title}
              className={`border-l-[3px] p-5 ${
                f.celeste ? "border-celeste bg-celeste-pale" : "border-celeste-light bg-white"
              }`}
            >
              <h3 className="font-bold text-sm text-ink mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-ink-light leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
