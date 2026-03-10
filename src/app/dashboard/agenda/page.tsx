"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useDemoAction } from "@/components/DemoModal";

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const horas = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const profesionales = [
  {
    id: 1,
    nombre: "Dr. Martín Rodríguez",
    especialidad: "Cardiología",
    color: "bg-celeste-pale text-celeste-dark border-celeste",
  },
  {
    id: 2,
    nombre: "Dra. Laura Pérez",
    especialidad: "Clínica Médica",
    color: "bg-celeste-pale text-celeste-dark border-celeste-light",
  },
  {
    id: 3,
    nombre: "Dr. Carlos Martínez",
    especialidad: "Ecografía",
    color: "bg-celeste-pale text-celeste-dark border-celeste",
  },
  {
    id: 4,
    nombre: "Dra. Ana Fernández",
    especialidad: "Laboratorio",
    color: "bg-green-50 text-green-700 border-green-300",
  },
];

interface Turno {
  id: number;
  hora: string;
  dia: number;
  paciente: string;
  pacienteId: string;
  profesionalId: number;
  tipo: string;
  estado: "Confirmado" | "Pendiente" | "En espera" | "Atendido" | "Cancelado";
  financiador: string;
}

const turnosMock: Turno[] = [
  {
    id: 1,
    hora: "08:00",
    dia: 0,
    paciente: "González, María Elena",
    pacienteId: "P001",
    profesionalId: 1,
    tipo: "Control",
    estado: "Confirmado",
    financiador: "PAMI",
  },
  {
    id: 2,
    hora: "08:30",
    dia: 0,
    paciente: "López, Juan Carlos",
    pacienteId: "P002",
    profesionalId: 2,
    tipo: "Consulta",
    estado: "Confirmado",
    financiador: "OSDE 310",
  },
  {
    id: 3,
    hora: "09:00",
    dia: 0,
    paciente: "Ramírez, Sofía",
    pacienteId: "P003",
    profesionalId: 1,
    tipo: "Primera vez",
    estado: "Pendiente",
    financiador: "Swiss Medical",
  },
  {
    id: 4,
    hora: "10:00",
    dia: 0,
    paciente: "Díaz, Roberto",
    pacienteId: "P004",
    profesionalId: 3,
    tipo: "Ecografía",
    estado: "En espera",
    financiador: "PAMI",
  },
  {
    id: 5,
    hora: "10:30",
    dia: 0,
    paciente: "Morales, Carolina",
    pacienteId: "P005",
    profesionalId: 4,
    tipo: "Laboratorio",
    estado: "Confirmado",
    financiador: "Galeno",
  },
  {
    id: 6,
    hora: "08:00",
    dia: 1,
    paciente: "Suárez, Héctor",
    pacienteId: "P006",
    profesionalId: 1,
    tipo: "Control",
    estado: "Confirmado",
    financiador: "PAMI",
  },
  {
    id: 7,
    hora: "09:30",
    dia: 1,
    paciente: "Romero, Lucía",
    pacienteId: "P007",
    profesionalId: 2,
    tipo: "Consulta",
    estado: "Pendiente",
    financiador: "Medifé",
  },
  {
    id: 8,
    hora: "11:00",
    dia: 1,
    paciente: "Torres, Miguel",
    pacienteId: "P008",
    profesionalId: 3,
    tipo: "Ecografía",
    estado: "Confirmado",
    financiador: "OSDE 210",
  },
  {
    id: 9,
    hora: "08:30",
    dia: 2,
    paciente: "Herrera, Patricia",
    pacienteId: "P009",
    profesionalId: 1,
    tipo: "Control",
    estado: "Confirmado",
    financiador: "PAMI",
  },
  {
    id: 10,
    hora: "10:00",
    dia: 2,
    paciente: "Castro, Fernando",
    pacienteId: "P010",
    profesionalId: 2,
    tipo: "Consulta",
    estado: "Pendiente",
    financiador: "IOMA",
  },
  {
    id: 11,
    hora: "14:00",
    dia: 2,
    paciente: "Vega, Daniela",
    pacienteId: "P011",
    profesionalId: 4,
    tipo: "Laboratorio",
    estado: "Confirmado",
    financiador: "Swiss Medical",
  },
  {
    id: 12,
    hora: "09:00",
    dia: 3,
    paciente: "Aguirre, Pablo",
    pacienteId: "P012",
    profesionalId: 1,
    tipo: "Primera vez",
    estado: "Pendiente",
    financiador: "Sancor Salud",
  },
  {
    id: 13,
    hora: "15:00",
    dia: 3,
    paciente: "Méndez, Valeria",
    pacienteId: "P001",
    profesionalId: 2,
    tipo: "Control",
    estado: "Confirmado",
    financiador: "PAMI",
  },
  {
    id: 14,
    hora: "08:00",
    dia: 4,
    paciente: "Luna, Ricardo",
    pacienteId: "P002",
    profesionalId: 1,
    tipo: "Consulta",
    estado: "Confirmado",
    financiador: "OSDE 310",
  },
  {
    id: 15,
    hora: "10:30",
    dia: 4,
    paciente: "Ríos, Andrea",
    pacienteId: "P003",
    profesionalId: 3,
    tipo: "Ecografía",
    estado: "Pendiente",
    financiador: "Swiss Medical",
  },
  {
    id: 16,
    hora: "09:00",
    dia: 5,
    paciente: "Ortiz, Sergio",
    pacienteId: "P004",
    profesionalId: 2,
    tipo: "Consulta",
    estado: "Pendiente",
    financiador: "PAMI",
  },
];

const estadoColor: Record<string, string> = {
  Confirmado: "bg-green-50 text-green-700",
  Pendiente: "bg-amber-50 text-amber-700",
  "En espera": "bg-celeste-pale text-celeste-dark",
  Atendido: "bg-border-light text-ink-muted",
  Cancelado: "bg-red-50 text-red-600",
};

export default function AgendaPage() {
  const { showToast } = useToast();
  const { showDemo } = useDemoAction();
  const [vista, setVista] = useState<"semana" | "lista">("semana");
  const [profFilter, setProfFilter] = useState(0);

  const filtered =
    profFilter === 0 ? turnosMock : turnosMock.filter((t) => t.profesionalId === profFilter);

  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));

  const fechasDias = diasSemana.map((_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  const total = filtered.length;
  const confirmados = filtered.filter((t) => t.estado === "Confirmado").length;
  const pendientes = filtered.filter((t) => t.estado === "Pendiente").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Agenda</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Semana del {fechasDias[0]} al {fechasDias[5]}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setVista("semana")}
            className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${vista === "semana" ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
          >
            Semana
          </button>
          <button
            onClick={() => setVista("lista")}
            className={`px-4 py-2 text-sm rounded-[4px] font-medium transition ${vista === "lista" ? "bg-celeste-dark text-white" : "border border-border text-ink-light hover:border-celeste-dark"}`}
          >
            Lista
          </button>
          <button
            onClick={() => showDemo("Nuevo turno")}
            className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
          >
            + Nuevo turno
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Turnos esta semana", value: total, color: "border-celeste" },
          { label: "Confirmados", value: confirmados, color: "border-green-400" },
          { label: "Pendientes", value: pendientes, color: "border-amber-400" },
          {
            label: "Disponibilidad",
            value: `${Math.round((1 - total / (horas.length * 6)) * 100)}%`,
            color: "border-celeste",
          },
        ].map((k) => (
          <div
            key={k.label}
            className={`bg-white border border-border rounded-lg p-4 border-l-[3px] ${k.color}`}
          >
            <p className="text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              {k.label}
            </p>
            <p className="text-xl font-bold text-ink mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Prof filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
          Profesional:
        </span>
        <button
          onClick={() => setProfFilter(0)}
          className={`px-3 py-1.5 text-xs rounded-[4px] transition ${profFilter === 0 ? "bg-ink text-white" : "border border-border text-ink-light hover:border-ink"}`}
        >
          Todos
        </button>
        {profesionales.map((p) => (
          <button
            key={p.id}
            onClick={() => setProfFilter(p.id)}
            className={`px-3 py-1.5 text-xs rounded-[4px] border transition ${profFilter === p.id ? p.color + " border font-semibold" : "border-border text-ink-light hover:border-ink"}`}
          >
            {p.nombre.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {vista === "semana" ? (
        /* Calendar grid */
        <div className="bg-white border border-border rounded-lg overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-16 px-3 py-2 text-[10px] font-bold tracking-wider text-ink-muted uppercase bg-[#F8FAFB]">
                  Hora
                </th>
                {diasSemana.map((d, i) => (
                  <th
                    key={d}
                    className={`px-2 py-2 text-[10px] font-bold tracking-wider uppercase ${i === (hoy.getDay() + 6) % 7 ? "text-celeste-dark bg-celeste-pale/40" : "text-ink-muted bg-[#F8FAFB]"}`}
                  >
                    {d} {fechasDias[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horas.map((hora) => (
                <tr key={hora} className="border-t border-border-light hover:bg-[#FCFCFD]">
                  <td className="px-3 py-1.5 text-[10px] font-mono text-ink-muted text-center">
                    {hora}
                  </td>
                  {diasSemana.map((_, di) => {
                    const turno = filtered.find((t) => t.hora === hora && t.dia === di);
                    if (!turno) return <td key={di} className="px-1 py-1" />;
                    const prof = profesionales.find((p) => p.id === turno.profesionalId);
                    return (
                      <td key={di} className="px-1 py-1">
                        <Link
                          href={`/dashboard/pacientes/${turno.pacienteId}`}
                          className={`block p-1.5 rounded text-[10px] border-l-2 ${prof?.color || ""} hover:shadow-sm transition`}
                        >
                          <div className="font-semibold truncate">{turno.paciente}</div>
                          <div className="text-ink-muted truncate">
                            {turno.tipo} · {turno.financiador}
                          </div>
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* List view */
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-5 py-2.5">Día</th>
                <th className="text-left px-5 py-2.5">Hora</th>
                <th className="text-left px-5 py-2.5">Paciente</th>
                <th className="text-left px-5 py-2.5">Profesional</th>
                <th className="text-left px-5 py-2.5">Tipo</th>
                <th className="text-left px-5 py-2.5">Financiador</th>
                <th className="text-center px-5 py-2.5">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .sort((a, b) => a.dia - b.dia || a.hora.localeCompare(b.hora))
                .map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                  >
                    <td className="px-5 py-3 text-xs font-semibold text-ink">
                      {diasSemana[t.dia]} {fechasDias[t.dia]}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ink">{t.hora}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/pacientes/${t.pacienteId}`}
                        className="text-celeste-dark font-semibold text-xs hover:underline"
                      >
                        {t.paciente}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-light">
                      {profesionales.find((p) => p.id === t.profesionalId)?.nombre}
                    </td>
                    <td className="px-5 py-3 text-xs text-ink-light">{t.tipo}</td>
                    <td className="px-5 py-3 text-xs text-ink-light">{t.financiador}</td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${estadoColor[t.estado]}`}
                      >
                        {t.estado}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-ink-muted">
        {profesionales.map((p) => (
          <div key={p.id} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${p.color.split(" ")[0]}`} />
            <span>
              {p.nombre} — {p.especialidad}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
