import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Desde que implementamos Cóndor, redujimos los rechazos de PAMI un 62% y cobramos 45 días antes. La inversión se pagó sola el primer mes.",
    name: "Dra. Carolina Fernández",
    role: "Directora Médica",
    clinic: "Centro Médico Palermo",
    location: "CABA",
    rating: 5,
    metric: "-62% rechazos",
  },
  {
    quote:
      "Antes perdíamos 3 horas por día verificando coberturas por teléfono. Ahora es instantáneo. Mi equipo administrativo pasó de 4 personas a 2 y facturamos el doble.",
    name: "Dr. Martín Rodríguez",
    role: "Director",
    clinic: "Clínica San Martín",
    location: "Córdoba",
    rating: 5,
    metric: "50% menos staff admin",
  },
  {
    quote:
      "El tracker de inflación nos mostró que estábamos perdiendo $480.000 por mes en demoras de cobro. Con la facturación automática, recuperamos eso y más.",
    name: "Lic. Valeria Torres",
    role: "Gerente Administrativa",
    clinic: "Instituto Diagnóstico del Sur",
    location: "Bahía Blanca",
    rating: 5,
    metric: "+$480K/mes recuperados",
  },
  {
    quote:
      "La auditoría inteligente nos detecta errores de nomenclador ANTES de presentar. Pasamos de 18% de rechazo a menos del 4% con Swiss Medical y OSDE.",
    name: "Dr. Pablo Herrera",
    role: "Responsable Facturación",
    clinic: "Sanatorio del Norte",
    location: "Tucumán",
    rating: 5,
    metric: "18% → 4% rechazos",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonios" className="px-6 py-20 border-t border-border">
      <div className="max-w-[960px] mx-auto">
        <p className="text-[11px] font-bold tracking-[2px] text-celeste uppercase mb-2.5">
          Testimonios
        </p>
        <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-ink mb-4 leading-[1.2]">
          Lo que dicen las clínicas que ya usan Cóndor
        </h2>
        <p className="text-[15px] text-ink-light leading-[1.7] max-w-[600px] mb-10">
          Más de 120 establecimientos en 14 provincias confían en nuestra plataforma para proteger
          sus ingresos.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="border border-border rounded-xl p-6 hover:border-celeste/40 hover:shadow-sm transition"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[14px] text-ink leading-[1.7] mb-4">&ldquo;{t.quote}&rdquo;</p>

              {/* Metric badge */}
              <div className="inline-block px-2.5 py-1 bg-celeste-pale text-celeste-dark text-[11px] font-bold rounded mb-4">
                {t.metric}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <div className="w-10 h-10 rounded-full bg-celeste-pale flex items-center justify-center text-celeste-dark font-bold text-xs shrink-0">
                  {t.name
                    .split(" ")
                    .filter((_, i) => i === 0 || i === t.name.split(" ").length - 1)
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-[11px] text-ink-muted">
                    {t.role} · {t.clinic} · {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
