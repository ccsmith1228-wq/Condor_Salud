import { AlertTriangle, Clock, TrendingDown, Unlink } from "lucide-react";

const stats = [
  {
    icon: Unlink,
    value: "300+",
    label: "Financiadores sin conectar",
    detail: "Cada obra social y prepaga usa su propio portal, formato y nomenclador",
  },
  {
    icon: AlertTriangle,
    value: "8–25%",
    label: "Tasa de rechazo promedio",
    detail: "Errores de nomenclador, datos incompletos y auditorías manuales",
  },
  {
    icon: Clock,
    value: "45–90",
    label: "Días de demora de pago",
    detail: "Entre presentación y acreditación, la inflación erosiona cada cobro",
  },
  {
    icon: TrendingDown,
    value: "8–15%",
    label: "Pérdida real por inflación",
    detail: "Cada día de demora = plata que perdés. $1M hoy son $920K en 30 días",
  },
];

export default function Stats() {
  return (
    <section className="px-6 mb-16">
      <div className="max-w-[960px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-border rounded-xl p-5 hover:border-celeste/40 hover:shadow-sm transition text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-celeste-pale flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-celeste-dark" />
              </div>
              <div className="text-[32px] font-bold text-celeste-dark leading-none">{s.value}</div>
              <div className="text-xs font-semibold text-ink mt-1.5 mb-1">{s.label}</div>
              <p className="text-[11px] text-ink-muted leading-snug">{s.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-ink-muted mt-4">
          Fuente: Datos del mercado argentino de salud 2024–2026. Superintendencia de Servicios de
          Salud.
        </p>
      </div>
    </section>
  );
}
