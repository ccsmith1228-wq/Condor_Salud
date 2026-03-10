"use client";
import Link from "next/link";
import { useDemoAction } from "@/components/DemoModal";

export default function FacturacionConfigPage() {
  const { showDemo } = useDemoAction();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/configuracion" className="hover:text-celeste-dark transition">
          Configuración
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Facturación & Plan</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-ink">Facturación & Plan</h1>
        <p className="text-sm text-ink-muted mt-0.5">Tu suscripción y datos de facturación</p>
      </div>

      {/* Current plan */}
      <div className="bg-white border-2 border-celeste rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-celeste-pale text-celeste-dark rounded">
              Plan Actual
            </span>
            <h2 className="text-2xl font-bold text-ink mt-3">Pro</h2>
            <p className="text-sm text-ink-muted mt-1">
              Ideal para clínicas de 3-10 profesionales. Incluye auditoría automática, integraciones
              con financiadores y soporte prioritario.
            </p>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-3xl font-bold text-ink">$75.000</span>
              <span className="text-sm text-ink-muted">/mes</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              Próx. facturación
            </p>
            <p className="text-sm font-semibold text-ink mt-0.5">01/04/2026</p>
            <p className="text-[10px] text-ink-muted mt-1">Ciclo mensual · Tarjeta •••• 4532</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <button
            onClick={() => showDemo("Upgrade a Enterprise")}
            className="px-4 py-2 text-sm font-semibold bg-gold text-white rounded-[4px] hover:bg-gold-dark transition"
          >
            Upgrade a Enterprise
          </button>
          <button
            onClick={() => showDemo("Cambiar plan")}
            className="px-4 py-2 text-sm font-medium border border-border text-ink-light rounded-[4px] hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Cambiar plan
          </button>
          <button
            onClick={() => showDemo("Cancelar suscripción")}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:underline"
          >
            Cancelar suscripción
          </button>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
          Uso del Plan
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Usuarios", used: 4, limit: 10, unit: "" },
            { label: "Pacientes", used: 847, limit: 5000, unit: "" },
            { label: "Facturas/mes", used: 342, limit: 1000, unit: "" },
            { label: "Almacenamiento", used: 2.4, limit: 10, unit: "GB" },
          ].map((u) => (
            <div key={u.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-ink-light">{u.label}</span>
                <span className="font-bold text-ink">
                  {u.used}
                  {u.unit} / {u.limit}
                  {u.unit}
                </span>
              </div>
              <div className="h-2 bg-border-light rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(u.used / u.limit) * 100}%`,
                    backgroundColor:
                      u.used / u.limit > 0.8
                        ? "#ef4444"
                        : u.used / u.limit > 0.5
                          ? "#F6B40E"
                          : "#4A7FAF",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Comparar Planes
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Característica</th>
              <th className="text-center px-5 py-2.5">
                Starter
                <br />
                <span className="text-celeste-dark font-normal normal-case">$25K/mes</span>
              </th>
              <th className="text-center px-5 py-2.5 bg-celeste-pale/30">
                Pro
                <br />
                <span className="text-celeste-dark font-normal normal-case">$75K/mes</span>
              </th>
              <th className="text-center px-5 py-2.5">
                Enterprise
                <br />
                <span className="text-celeste-dark font-normal normal-case">$180K/mes</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { feat: "Usuarios", s: "2", p: "10", e: "Ilimitados" },
              { feat: "Pacientes", s: "500", p: "5.000", e: "Ilimitados" },
              { feat: "Facturas/mes", s: "200", p: "1.000", e: "Ilimitadas" },
              { feat: "Financiadores", s: "3", p: "Todos", e: "Todos + custom" },
              { feat: "Auditoria auto.", s: "—", p: "Si", e: "Si + IA" },
              { feat: "Integraciones", s: "PAMI", p: "6+", e: "Todas + API" },
              { feat: "Reportes", s: "Básicos", p: "Avanzados", e: "Custom + BI" },
              { feat: "Soporte", s: "Email", p: "Prioritario", e: "Dedicado + SLA" },
            ].map((row) => (
              <tr key={row.feat} className="border-t border-border-light">
                <td className="px-5 py-2.5 text-xs font-semibold text-ink">{row.feat}</td>
                <td className="px-5 py-2.5 text-xs text-center text-ink-light">{row.s}</td>
                <td className="px-5 py-2.5 text-xs text-center font-semibold text-celeste-dark bg-celeste-pale/30">
                  {row.p}
                </td>
                <td className="px-5 py-2.5 text-xs text-center text-ink-light">{row.e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice history */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Historial de Pagos
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Fecha</th>
              <th className="text-left px-5 py-2.5">Concepto</th>
              <th className="text-right px-5 py-2.5">Monto</th>
              <th className="text-center px-5 py-2.5">Estado</th>
              <th className="text-right px-5 py-2.5">Comprobante</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                fecha: "01/03/2026",
                concepto: "Plan Pro — Marzo 2026",
                monto: "$75.000",
                estado: "Pagado",
              },
              {
                fecha: "01/02/2026",
                concepto: "Plan Pro — Febrero 2026",
                monto: "$68.000",
                estado: "Pagado",
              },
              {
                fecha: "01/01/2026",
                concepto: "Plan Pro — Enero 2026",
                monto: "$68.000",
                estado: "Pagado",
              },
              {
                fecha: "01/12/2025",
                concepto: "Plan Pro — Diciembre 2025",
                monto: "$62.000",
                estado: "Pagado",
              },
              {
                fecha: "01/11/2025",
                concepto: "Plan Pro — Noviembre 2025",
                monto: "$62.000",
                estado: "Pagado",
              },
            ].map((p, i) => (
              <tr key={i} className="border-t border-border-light">
                <td className="px-5 py-3 font-mono text-[10px] text-ink-muted">{p.fecha}</td>
                <td className="px-5 py-3 text-xs font-semibold text-ink">{p.concepto}</td>
                <td className="px-5 py-3 text-right text-xs font-bold text-ink">{p.monto}</td>
                <td className="px-5 py-3 text-center">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-700">
                    {p.estado}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => showDemo("Descargar comprobante")}
                    className="text-xs text-celeste-dark font-medium hover:underline"
                  >
                    Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment method */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
          Método de Pago
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-celeste-dark rounded flex items-center justify-center text-white text-[9px] font-bold">
              VISA
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Visa •••• 4532</p>
              <p className="text-[10px] text-ink-muted">Vence 08/2027 · Dr. Martín Rodríguez</p>
            </div>
          </div>
          <button
            onClick={() => showDemo("Cambiar tarjeta")}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
          >
            Cambiar tarjeta
          </button>
        </div>
      </div>

      {/* Billing info */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
          Datos de Facturación
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-ink-muted text-xs">Razón social:</span>{" "}
            <span className="text-ink font-semibold text-xs"> Centro Médico San Martín SRL</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs">CUIT:</span>{" "}
            <span className="text-ink font-mono text-xs"> 30-71234567-8</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs">Condición IVA:</span>{" "}
            <span className="text-ink text-xs"> Responsable Inscripto</span>
          </div>
          <div>
            <span className="text-ink-muted text-xs">Domicilio fiscal:</span>{" "}
            <span className="text-ink text-xs"> Av. San Martín 1520, CABA</span>
          </div>
        </div>
        <button
          onClick={() => showDemo("Editar datos fiscales")}
          className="mt-3 text-xs text-celeste-dark font-medium hover:underline"
        >
          Editar datos fiscales
        </button>
      </div>
    </div>
  );
}
