const problems = [
  {
    title: "Hospitales Públicos",
    desc: "HIS legados, SISA, sin APIs. 1.400 hospitales desconectados del privado.",
    accent: "bg-celeste",
  },
  {
    title: "Obras Sociales",
    desc: "300+ financiadores con portales propios. Formatos AGFA, auditorías manuales.",
    accent: "bg-celeste-light",
  },
  {
    title: "Prepagas",
    desc: "APIs heterogéneas. Cada prepaga requiere una integración diferente.",
    accent: "bg-celeste",
  },
  {
    title: "PAMI",
    desc: "5.5M afiliados, nomenclador propio, tasa de rechazo 12–25%.",
    accent: "bg-celeste-light",
  },
];

export default function Problem() {
  return (
    <section id="problema" className="px-6 py-20 border-t border-border">
      <div className="max-w-[900px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          El problema
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          El sistema de salud argentino no se habla entre sí
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {problems.map((p) => (
            <div key={p.title} className="border border-border">
              <div className={`h-[3px] ${p.accent}`} />
              <div className="p-5">
                <h3 className="font-bold text-sm text-ink mb-2">{p.title}</h3>
                <p className="text-[13px] text-ink-light leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
