import Link from "next/link";
import { ArrowRight, Shield, Clock, TrendingDown } from "lucide-react";

const highlights = [
  { icon: TrendingDown, text: "Reducí rechazos 40–60%" },
  { icon: Clock, text: "Cobrá 45 días antes" },
  { icon: Shield, text: "14 días gratis, sin tarjeta" },
];

export default function FinalCTA() {
  return (
    <section className="px-6 py-20 bg-gradient-to-b from-celeste-pale/40 to-white border-t border-border">
      <div className="max-w-[800px] mx-auto text-center">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-3">
          Empezá hoy
        </p>
        <h2 className="text-[clamp(24px,3.5vw,40px)] font-bold text-ink mb-4 leading-[1.2]">
          Tu clínica merece cobrar lo que le corresponde.
          <br />
          <em className="not-italic text-celeste-dark">Sin rechazos. Sin demoras.</em>
        </h2>
        <p className="text-[15px] text-ink-muted leading-[1.7] max-w-[560px] mx-auto mb-8">
          Probá gratis durante 14 días y empezá a facturar sin errores desde el primer día.
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {highlights.map((h) => (
            <div key={h.text} className="flex items-center gap-2">
              <h.icon className="w-4 h-4 text-celeste-dark" />
              <span className="text-sm text-ink-muted font-medium">{h.text}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/registro"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-celeste-dark hover:bg-celeste rounded-[4px] transition"
          >
            Crear cuenta gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold text-ink border-[1.5px] border-border hover:border-celeste-dark hover:text-celeste-dark rounded-[4px] transition"
          >
            Ver demo en vivo
          </Link>
        </div>

        <p className="text-xs text-ink-muted mt-5">
          Setup en 2 minutos · Sin tarjeta de crédito · Soporte por WhatsApp
        </p>
      </div>
    </section>
  );
}
