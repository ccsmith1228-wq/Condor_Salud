"use client";
import Link from "next/link";
import { useDemoAction } from "@/components/DemoModal";

export default function ClinicaConfigPage() {
  const { showDemo } = useDemoAction();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/configuracion" className="hover:text-celeste-dark transition">
          Configuración
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Mi Clínica</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-ink">Mi Clínica</h1>
        <p className="text-sm text-ink-muted mt-0.5">Datos generales del centro médico</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* General info */}
        <div className="bg-white border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Información General
          </h3>
          {[
            { label: "Nombre", value: "Centro Médico San Martín" },
            { label: "Razón social", value: "Centro Médico San Martín SRL" },
            { label: "CUIT", value: "30-71234567-8", mono: true },
            { label: "Matrícula de establecimiento", value: "44.521", mono: true },
            { label: "Director médico", value: "Dr. Martín Rodríguez — MN 45.231" },
            { label: "Categoría", value: "Clínica Ambulatoria con Diagnóstico" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex justify-between items-center py-2 border-b border-border-light last:border-0"
            >
              <span className="text-xs text-ink-muted">{f.label}</span>
              <span className={`text-xs font-semibold text-ink ${f.mono ? "font-mono" : ""}`}>
                {f.value}
              </span>
            </div>
          ))}
          <button
            onClick={() => showDemo("Editar información de la clínica")}
            className="text-xs text-celeste-dark font-medium hover:underline mt-2"
          >
            Editar información
          </button>
        </div>

        {/* Contact */}
        <div className="bg-white border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Contacto y Ubicación
          </h3>
          {[
            { label: "Dirección", value: "Av. San Martín 1520, Piso 2°, CABA" },
            { label: "Teléfono", value: "(011) 4523-8800" },
            { label: "Email", value: "admin@centrosanmartin.com" },
            { label: "Web", value: "www.centrosanmartin.com" },
            { label: "Horario atención", value: "Lun-Vie 08:00–18:00, Sáb 08:00–13:00" },
            { label: "Zona", value: "CABA — Comuna 7 (Flores)" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex justify-between items-center py-2 border-b border-border-light last:border-0"
            >
              <span className="text-xs text-ink-muted">{f.label}</span>
              <span className="text-xs font-semibold text-ink text-right">{f.value}</span>
            </div>
          ))}
          <button
            onClick={() => showDemo("Editar contacto")}
            className="text-xs text-celeste-dark font-medium hover:underline mt-2"
          >
            Editar contacto
          </button>
        </div>

        {/* Specialties */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
            Especialidades
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Cardiología",
              "Clínica Médica",
              "Diagnóstico por Imágenes",
              "Laboratorio",
              "Kinesiología",
              "Fonoaudiología",
            ].map((e) => (
              <span
                key={e}
                className="px-3 py-1.5 text-xs font-medium bg-celeste-pale text-celeste-dark rounded-[4px]"
              >
                {e}
              </span>
            ))}
          </div>
          <button
            onClick={() => showDemo("Agregar especialidad")}
            className="text-xs text-celeste-dark font-medium hover:underline mt-3 block"
          >
            + Agregar especialidad
          </button>
        </div>

        {/* Financiadores habilitados */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
            Financiadores Habilitados
          </h3>
          <div className="space-y-2">
            {[
              { nombre: "PAMI", nroPrestador: "800-12345-6", estado: "Activo" },
              { nombre: "OSDE", nroPrestador: "PRE-45678", estado: "Activo" },
              { nombre: "Swiss Medical", nroPrestador: "SM-2024-1122", estado: "Activo" },
              { nombre: "Galeno", nroPrestador: "GAL-8899", estado: "Activo" },
              { nombre: "Medifé", nroPrestador: "MED-3344", estado: "En trámite" },
              { nombre: "IOMA", nroPrestador: "—", estado: "Pendiente" },
            ].map((f) => (
              <div
                key={f.nombre}
                className="flex items-center justify-between py-1.5 border-b border-border-light last:border-0"
              >
                <span className="text-xs font-semibold text-ink">{f.nombre}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-ink-muted">{f.nroPrestador}</span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded ${f.estado === "Activo" ? "bg-green-50 text-green-700" : "bg-gold-pale text-[#B8860B]"}`}
                  >
                    {f.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/financiadores"
            className="text-xs text-celeste-dark font-medium hover:underline mt-3 block"
          >
            Ver analisis de financiadores
          </Link>
        </div>
      </div>
    </div>
  );
}
