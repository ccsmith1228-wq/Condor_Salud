const entities = [
  { name: "PAMI", desc: "5.5M afiliados" },
  { name: "OSDE", desc: "Prepaga líder" },
  { name: "Swiss Medical", desc: "Grupo médico" },
  { name: "Galeno", desc: "Red nacional" },
  { name: "Medifé", desc: "Obra social" },
  { name: "IOMA", desc: "Prov. Buenos Aires" },
  { name: "Sancor Salud", desc: "Santa Fe" },
  { name: "Omint", desc: "Prepaga premium" },
  { name: "Accord Salud", desc: "Grupo OSDE" },
  { name: "AFIP", desc: "Factura electrónica" },
  { name: "ANMAT", desc: "Medicamentos" },
  { name: "SISA", desc: "Sistema salud" },
];

const integrationTypes = [
  {
    title: "Obras Sociales",
    count: "280+",
    desc: "Padrones, nomencladores y presentación electrónica",
  },
  {
    title: "Prepagas",
    count: "45+",
    desc: "APIs directas, autorización online y liquidación automática",
  },
  {
    title: "Organismos",
    count: "6",
    desc: "AFIP, ANMAT, SISA, REFEPS, receta digital PAMI",
  },
];

export default function Integrations() {
  return (
    <section className="px-6 py-20 bg-celeste-pale/50 border-t border-border">
      <div className="max-w-[900px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          Integraciones
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          Conectado con todo el ecosistema de salud argentino
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[600px] mb-10">
          No necesitás integraciones manuales ni archivos CSV. Cóndor se comunica directamente con
          cada financiador y organismo regulador.
        </p>

        {/* Integration type cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {integrationTypes.map((t) => (
            <div key={t.title} className="bg-white border border-border rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-celeste-dark mb-1">{t.count}</div>
              <h3 className="font-bold text-sm text-ink mb-1">{t.title}</h3>
              <p className="text-[12px] text-ink-light leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Entity grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {entities.map((e) => (
            <div
              key={e.name}
              className="bg-white border border-border/80 rounded-lg py-4 px-3 text-center hover:border-celeste-dark/40 hover:shadow-sm transition"
            >
              <div className="text-sm font-bold text-ink leading-tight">{e.name}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">{e.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
