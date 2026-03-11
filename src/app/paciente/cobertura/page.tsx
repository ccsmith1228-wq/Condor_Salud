"use client";

import {
  Shield,
  CreditCard,
  FileText,
  Phone,
  Globe,
  CheckCircle2,
  AlertCircle,
  Download,
  ChevronRight,
  Heart,
  Stethoscope,
  Pill,
  Eye,
  Baby,
  Brain,
} from "lucide-react";

/* ── demo data ────────────────────────────────────────── */
const planInfo = {
  name: "OSDE 310",
  memberId: "08-29384756-3",
  group: "Individual",
  status: "Activo",
  validUntil: "31/12/2025",
  monthlyFee: "$185.400",
  lastPayment: "01/03/2025",
  phone: "0800-555-6733",
  web: "www.osde.com.ar",
};

const coverageItems = [
  {
    category: "Consultas médicas",
    coverage: "100%",
    copay: "$0",
    icon: Stethoscope,
    included: true,
  },
  { category: "Laboratorio", coverage: "100%", copay: "$0", icon: FileText, included: true },
  {
    category: "Medicamentos PMO",
    coverage: "70%",
    copay: "30% a cargo",
    icon: Pill,
    included: true,
  },
  { category: "Internación", coverage: "100%", copay: "$0", icon: Heart, included: true },
  {
    category: "Oftalmología",
    coverage: "100%",
    copay: "Coseguro $3.500",
    icon: Eye,
    included: true,
  },
  { category: "Maternidad", coverage: "100%", copay: "$0", icon: Baby, included: true },
  {
    category: "Salud mental",
    coverage: "100%",
    copay: "Coseguro $5.000",
    icon: Brain,
    included: true,
  },
  {
    category: "Odontología",
    coverage: "50%",
    copay: "50% a cargo",
    icon: CheckCircle2,
    included: true,
  },
];

const recentClaims = [
  {
    id: 1,
    date: "12/03/2025",
    description: "Consulta - Clínica Médica",
    amount: "$0",
    status: "aprobado",
  },
  {
    id: 2,
    date: "05/03/2025",
    description: "Laboratorio - Hemograma completo",
    amount: "$0",
    status: "aprobado",
  },
  {
    id: 3,
    date: "28/02/2025",
    description: "Farmacia - Losartán 50mg",
    amount: "$4.200",
    status: "aprobado",
  },
  {
    id: 4,
    date: "20/02/2025",
    description: "Consulta - Cardiología",
    amount: "$0",
    status: "aprobado",
  },
  {
    id: 5,
    date: "15/02/2025",
    description: "Imagen - Eco Doppler",
    amount: "$0",
    status: "pendiente",
  },
];

const documents = [
  { name: "Credencial digital", type: "PDF" },
  { name: "Cartilla médica 2025", type: "PDF" },
  { name: "Programa Materno Infantil", type: "PDF" },
  { name: "Vademécum 2025", type: "PDF" },
];

export default function CoberturaPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Mi Cobertura</h1>
        <p className="text-sm text-ink-muted mt-0.5">Información de tu obra social y plan médico</p>
      </div>

      {/* Plan card */}
      <div className="bg-gradient-to-br from-celeste-dark to-celeste-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-7 h-7" />
              <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
                {planInfo.status}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{planInfo.name}</h2>
            <p className="text-sm opacity-80 mt-1">N° afiliado: {planInfo.memberId}</p>
            <p className="text-sm opacity-80">Grupo: {planInfo.group}</p>
            <p className="text-sm opacity-80">Vigencia: hasta {planInfo.validUntil}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 min-w-[180px]">
            <p className="text-xs opacity-70">Cuota mensual</p>
            <p className="text-2xl font-bold mt-0.5">{planInfo.monthlyFee}</p>
            <p className="text-xs opacity-70 mt-1">Último pago: {planInfo.lastPayment}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/20 text-sm">
          <span className="flex items-center gap-1.5 opacity-80">
            <Phone className="w-3.5 h-3.5" /> {planInfo.phone}
          </span>
          <span className="flex items-center gap-1.5 opacity-80">
            <Globe className="w-3.5 h-3.5" /> {planInfo.web}
          </span>
        </div>
      </div>

      {/* Coverage grid */}
      <div className="bg-white rounded-2xl border border-border-light">
        <div className="px-5 py-4 border-b border-border-light">
          <h2 className="text-sm font-bold text-ink">Detalle de cobertura</h2>
        </div>
        <div className="divide-y divide-border-light">
          {coverageItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.category} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-9 h-9 rounded-lg bg-celeste-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-celeste-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{item.category}</p>
                  <p className="text-xs text-ink-muted">{item.copay}</p>
                </div>
                <div className="shrink-0">
                  <span className="text-sm font-bold text-emerald-600">{item.coverage}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent claims */}
        <div className="bg-white rounded-2xl border border-border-light">
          <div className="px-5 py-4 border-b border-border-light">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-celeste-dark" />
              Últimas prestaciones
            </h2>
          </div>
          <div className="divide-y divide-border-light">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{claim.description}</p>
                  <p className="text-xs text-ink-muted">{claim.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-sm font-medium text-ink">{claim.amount}</span>
                  {claim.status === "aprobado" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-border-light">
          <div className="px-5 py-4 border-b border-border-light">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-celeste-dark" />
              Documentos
            </h2>
          </div>
          <div className="divide-y divide-border-light">
            {documents.map((doc) => (
              <button
                key={doc.name}
                className="flex items-center justify-between px-5 py-3 w-full hover:bg-surface/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-ink">{doc.name}</p>
                    <p className="text-[11px] text-ink-muted">{doc.type}</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-ink-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
