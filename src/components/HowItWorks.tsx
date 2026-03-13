import { UserPlus, Settings2, Zap } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Creá tu cuenta en 2 minutos",
    desc: "Registrá tu clínica, cargá el CUIT y seleccioná los financiadores con los que trabajás. Sin contratos ni tarjeta de crédito.",
  },
  {
    icon: Settings2,
    step: "02",
    title: "Conectamos tus financiadores",
    desc: "Cóndor Salud se integra automáticamente con PAMI, obras sociales y prepagas. Verificamos padrones y configuramos nomencladores.",
  },
  {
    icon: Zap,
    step: "03",
    title: "Facturá y cobrá más rápido",
    desc: "Verificá cobertura en tiempo real, facturá sin errores y hacé seguimiento de cada peso. Reducí rechazos desde el primer día.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 py-20 border-t border-border">
      <div className="max-w-[900px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          Cómo funciona
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          Arrancá en minutos, <em className="not-italic text-celeste-dark">no en meses</em>
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[600px] mb-12">
          Otras plataformas tardan semanas en implementarse. Con Cóndor, estás operativo el mismo
          día.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-celeste-pale flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-celeste-dark" />
                </div>
                <span className="text-[11px] font-bold tracking-wider text-celeste-dark/60 uppercase">
                  Paso {s.step}
                </span>
              </div>
              <h3 className="font-bold text-base text-ink mb-2">{s.title}</h3>
              <p className="text-[13px] text-ink-light leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Connector line (desktop only) */}
        <div className="hidden md:block relative -mt-[106px] mb-[62px] mx-[60px]">
          <div className="h-px bg-celeste/30 w-full" />
        </div>
      </div>
    </section>
  );
}
