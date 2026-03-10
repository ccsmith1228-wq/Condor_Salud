"use client";
import Link from "next/link";
import { useDemoAction } from "@/components/DemoModal";

const miembros = [
  {
    id: 1,
    nombre: "Dr. Martín Rodríguez",
    email: "m.rodriguez@centrosanmartin.com",
    rol: "Administrador",
    especialidad: "Cardiología",
    matricula: "MN 45.231",
    estado: "Activo",
    ultimoAcceso: "07/03/2026 15:30",
  },
  {
    id: 2,
    nombre: "Dra. Laura Pérez",
    email: "l.perez@centrosanmartin.com",
    rol: "Médico",
    especialidad: "Clínica Médica",
    matricula: "MN 52.118",
    estado: "Activo",
    ultimoAcceso: "07/03/2026 12:45",
  },
  {
    id: 3,
    nombre: "Carlos García",
    email: "c.garcia@centrosanmartin.com",
    rol: "Facturación",
    especialidad: "—",
    matricula: "—",
    estado: "Activo",
    ultimoAcceso: "07/03/2026 17:00",
  },
  {
    id: 4,
    nombre: "Ana López",
    email: "a.lopez@centrosanmartin.com",
    rol: "Recepción",
    especialidad: "—",
    matricula: "—",
    estado: "Activo",
    ultimoAcceso: "06/03/2026 18:20",
  },
];

const roles = [
  {
    nombre: "Administrador",
    permisos: "Acceso total a todas las funcionalidades",
    usuarios: 1,
    color: "bg-red-50 text-red-600",
  },
  {
    nombre: "Médico",
    permisos: "Pacientes, Agenda, Verificación, Nomenclador, Reportes",
    usuarios: 1,
    color: "bg-celeste-pale text-celeste-dark",
  },
  {
    nombre: "Facturación",
    permisos: "Facturación, Rechazos, Financiadores, Auditoría, Reportes",
    usuarios: 1,
    color: "bg-gold-pale text-[#B8860B]",
  },
  {
    nombre: "Recepción",
    permisos: "Pacientes, Agenda, Verificación, Inventario",
    usuarios: 1,
    color: "bg-green-50 text-green-700",
  },
];

const invitaciones = [
  { email: "dr.martinez@gmail.com", rol: "Médico", enviada: "05/03/2026", estado: "Pendiente" },
];

export default function EquipoPage() {
  const { showDemo } = useDemoAction();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/configuracion" className="hover:text-celeste-dark transition">
          Configuración
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">Equipo</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Equipo</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {miembros.length} miembros activos · {invitaciones.length} invitación pendiente
          </p>
        </div>
        <button
          onClick={() => showDemo("Invitar miembro al equipo")}
          className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
        >
          + Invitar miembro
        </button>
      </div>

      {/* Team table */}
      <div className="bg-white border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Miembro</th>
              <th className="text-left px-5 py-2.5">Rol</th>
              <th className="text-left px-5 py-2.5">Especialidad</th>
              <th className="text-left px-5 py-2.5">Matrícula</th>
              <th className="text-center px-5 py-2.5">Estado</th>
              <th className="text-right px-5 py-2.5">Último acceso</th>
            </tr>
          </thead>
          <tbody>
            {miembros.map((m) => (
              <tr
                key={m.id}
                className="border-t border-border-light hover:bg-celeste-pale/30 transition"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-celeste-pale flex items-center justify-center text-celeste-dark text-xs font-bold">
                      {m.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink">{m.nombre}</p>
                      <p className="text-[10px] text-ink-muted">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${roles.find((r) => r.nombre === m.rol)?.color}`}
                  >
                    {m.rol}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-ink-light">{m.especialidad}</td>
                <td className="px-5 py-3 font-mono text-[10px] text-ink-muted">{m.matricula}</td>
                <td className="px-5 py-3 text-center">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-700">
                    {m.estado}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-[10px] text-ink-muted">
                  {m.ultimoAcceso}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending invitations */}
      {invitaciones.length > 0 && (
        <div className="bg-gold-pale/30 border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-3">
            Invitaciones Pendientes
          </h3>
          {invitaciones.map((inv, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-semibold text-ink">{inv.email}</p>
                <p className="text-[10px] text-ink-muted">
                  Rol: {inv.rol} · Enviada: {inv.enviada}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => showDemo("Reenviar invitación")}
                  className="px-3 py-1.5 text-xs font-medium text-celeste-dark border border-celeste rounded-[4px] hover:bg-celeste-pale transition"
                >
                  Reenviar
                </button>
                <button
                  onClick={() => showDemo("Cancelar invitación")}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-[4px] hover:bg-red-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Roles */}
      <div className="bg-white border border-border rounded-lg p-5">
        <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
          Roles y Permisos
        </h3>
        <div className="space-y-3">
          {roles.map((r) => (
            <div
              key={r.nombre}
              className="flex items-center gap-4 py-2 border-b border-border-light last:border-0"
            >
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded w-28 text-center ${r.color}`}
              >
                {r.nombre}
              </span>
              <p className="text-xs text-ink-light flex-1">{r.permisos}</p>
              <span className="text-xs text-ink-muted">
                {r.usuarios} usuario{r.usuarios > 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
