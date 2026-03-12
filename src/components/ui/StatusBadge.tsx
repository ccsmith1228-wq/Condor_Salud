import { cn } from "@/lib/utils";

type Variant =
  | "cobrada"
  | "presentada"
  | "rechazada"
  | "pendiente"
  | "en_observacion"
  | "activo"
  | "inactivo"
  | "confirmado"
  | "cancelado"
  | "atendido"
  | "alta"
  | "media"
  | "baja"
  | "reprocesado"
  | "descartado"
  | "revisado"
  | "resuelto"
  | "celeste"
  | "gold"
  | "default";

const variantStyles: Record<Variant, string> = {
  cobrada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  presentada: "bg-celeste-pale text-celeste-dark border-celeste-light",
  rechazada: "bg-red-50 text-red-700 border-red-200",
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  en_observacion: "bg-amber-50 text-amber-700 border-amber-200",
  activo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactivo: "bg-gray-100 text-gray-500 border-gray-200",
  confirmado: "bg-celeste-pale text-celeste-dark border-celeste-light",
  cancelado: "bg-red-50 text-red-700 border-red-200",
  atendido: "bg-emerald-50 text-emerald-700 border-emerald-200",
  alta: "bg-red-50 text-red-700 border-red-200",
  media: "bg-amber-50 text-amber-700 border-amber-200",
  baja: "bg-celeste-pale text-celeste-dark border-celeste-light",
  reprocesado: "bg-celeste-pale text-celeste-dark border-celeste-light",
  descartado: "bg-gray-100 text-gray-500 border-gray-200",
  revisado: "bg-amber-50 text-amber-700 border-amber-200",
  resuelto: "bg-emerald-50 text-emerald-700 border-emerald-200",
  celeste: "bg-celeste-pale text-celeste-dark border-celeste-light",
  gold: "bg-celeste-pale text-celeste-dark border-celeste-light",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

const LABELS: Partial<Record<Variant, string>> = {
  cobrada: "Cobrada",
  presentada: "Presentada",
  rechazada: "Rechazada",
  pendiente: "Pendiente",
  en_observacion: "En observación",
  activo: "Activo",
  inactivo: "Inactivo",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  atendido: "Atendido",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
  reprocesado: "Reprocesado",
  descartado: "Descartado",
  revisado: "Revisado",
  resuelto: "Resuelto",
};

interface StatusBadgeProps {
  variant: Variant;
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const displayLabel = label || LABELS[variant] || variant;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded border",
        variantStyles[variant] || variantStyles.default,
        className,
      )}
      role="status"
    >
      {displayLabel}
    </span>
  );
}
