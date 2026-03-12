import { cn } from "@/lib/utils";
import type { KPI } from "@/lib/types";

interface KPICardProps {
  kpi: KPI;
  className?: string;
}

const colorMap: Record<string, string> = {
  celeste: "border-l-celeste-dark",
  gold: "border-l-celeste",
  red: "border-l-red-500",
  green: "border-l-success-500",
};

export function KPICard({ kpi, className }: KPICardProps) {
  return (
    <article
      className={cn(
        "bg-white p-4 rounded-[4px] border border-border border-l-4 shadow-sm",
        colorMap[kpi.color] || colorMap.celeste,
        className,
      )}
      role="group"
      aria-label={`${kpi.label}: ${kpi.value}`}
    >
      <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">
        {kpi.label}
      </p>
      <p className="text-2xl font-bold text-ink mt-1">{kpi.value}</p>
      <p
        className={cn("text-xs font-medium mt-1", kpi.up ? "text-success-600" : "text-red-500")}
        aria-label={`Cambio: ${kpi.change}`}
      >
        <span className="inline-flex items-center gap-0.5">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            {kpi.up ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            )}
          </svg>
          {kpi.change}
        </span>
      </p>
    </article>
  );
}

interface KPIGridProps {
  kpis: KPI[];
  className?: string;
}

export function KPIGrid({ kpis, className }: KPIGridProps) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
      role="region"
      aria-label="Indicadores clave"
    >
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}
