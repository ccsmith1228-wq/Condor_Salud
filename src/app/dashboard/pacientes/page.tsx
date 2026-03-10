"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { Card, CardContent, StatusBadge, PageHeader, Input, Select, Button } from "@/components/ui";

const pacientes = [
  {
    id: "P001",
    nombre: "María Elena",
    apellido: "González",
    dni: "27.845.332",
    edad: 67,
    sexo: "F",
    financiador: "PAMI",
    plan: "Básico",
    telefono: "11-4523-8891",
    email: "maria.gonzalez@gmail.com",
    ultimaVisita: "07/03/2026",
    estado: "activo" as const,
    turnos: 3,
  },
  {
    id: "P002",
    nombre: "Jorge Alberto",
    apellido: "Fernández",
    dni: "20.112.485",
    edad: 54,
    sexo: "M",
    financiador: "OSDE 310",
    plan: "310",
    telefono: "11-5567-2234",
    email: "jfernandez@outlook.com",
    ultimaVisita: "05/03/2026",
    estado: "activo" as const,
    turnos: 1,
  },
  {
    id: "P003",
    nombre: "Lucía",
    apellido: "Martínez",
    dni: "35.678.901",
    edad: 32,
    sexo: "F",
    financiador: "Swiss Medical",
    plan: "SMG 30",
    telefono: "11-3345-6789",
    email: "lucia.mtz@gmail.com",
    ultimaVisita: "01/03/2026",
    estado: "activo" as const,
    turnos: 2,
  },
  {
    id: "P004",
    nombre: "Carlos Raúl",
    apellido: "López",
    dni: "14.567.890",
    edad: 72,
    sexo: "M",
    financiador: "PAMI",
    plan: "Básico",
    telefono: "11-4412-3356",
    email: null,
    ultimaVisita: "28/02/2026",
    estado: "activo" as const,
    turnos: 5,
  },
  {
    id: "P005",
    nombre: "Ana Sofía",
    apellido: "Russo",
    dni: "38.901.234",
    edad: 28,
    sexo: "F",
    financiador: "Galeno",
    plan: "Azul",
    telefono: "11-6678-4455",
    email: "anarusso@live.com",
    ultimaVisita: "06/03/2026",
    estado: "activo" as const,
    turnos: 1,
  },
  {
    id: "P006",
    nombre: "Roberto",
    apellido: "Díaz",
    dni: "18.234.567",
    edad: 61,
    sexo: "M",
    financiador: "IOMA",
    plan: "Obligatorio",
    telefono: "221-445-6677",
    email: "rdiaz@yahoo.com.ar",
    ultimaVisita: "04/03/2026",
    estado: "activo" as const,
    turnos: 2,
  },
  {
    id: "P007",
    nombre: "Valentina",
    apellido: "Morales",
    dni: "40.123.456",
    edad: 24,
    sexo: "F",
    financiador: "Swiss Medical",
    plan: "SMG 50",
    telefono: "11-2234-5566",
    email: "vmorales@gmail.com",
    ultimaVisita: "02/03/2026",
    estado: "activo" as const,
    turnos: 0,
  },
  {
    id: "P008",
    nombre: "Héctor Osvaldo",
    apellido: "Pereyra",
    dni: "12.345.678",
    edad: 78,
    sexo: "M",
    financiador: "PAMI",
    plan: "Básico",
    telefono: "11-4456-7788",
    email: null,
    ultimaVisita: "25/02/2026",
    estado: "inactivo" as const,
    turnos: 0,
  },
  {
    id: "P009",
    nombre: "Florencia",
    apellido: "Castro",
    dni: "33.456.789",
    edad: 35,
    sexo: "F",
    financiador: "OSDE 210",
    plan: "210",
    telefono: "11-5578-9900",
    email: "fcastro@gmail.com",
    ultimaVisita: "08/03/2026",
    estado: "activo" as const,
    turnos: 1,
  },
  {
    id: "P010",
    nombre: "Raúl Eduardo",
    apellido: "Sánchez",
    dni: "16.789.012",
    edad: 69,
    sexo: "M",
    financiador: "PAMI",
    plan: "Básico",
    telefono: "11-4433-2211",
    email: "raulsanchez@hotmail.com",
    ultimaVisita: "03/03/2026",
    estado: "activo" as const,
    turnos: 4,
  },
  {
    id: "P011",
    nombre: "Camila",
    apellido: "Torres",
    dni: "42.567.890",
    edad: 21,
    sexo: "F",
    financiador: "Medifé",
    plan: "Bronce",
    telefono: "11-7789-0011",
    email: "ctorres@gmail.com",
    ultimaVisita: "09/03/2026",
    estado: "activo" as const,
    turnos: 1,
  },
  {
    id: "P012",
    nombre: "Miguel Ángel",
    apellido: "Acosta",
    dni: "22.890.123",
    edad: 58,
    sexo: "M",
    financiador: "Sancor Salud",
    plan: "3000",
    telefono: "341-456-7890",
    email: "macosta@empresa.com",
    ultimaVisita: "07/03/2026",
    estado: "activo" as const,
    turnos: 2,
  },
];

const financiadores = [
  { value: "Todos", label: "Todos" },
  { value: "PAMI", label: "PAMI" },
  { value: "OSDE 310", label: "OSDE 310" },
  { value: "OSDE 210", label: "OSDE 210" },
  { value: "Swiss Medical", label: "Swiss Medical" },
  { value: "Galeno", label: "Galeno" },
  { value: "IOMA", label: "IOMA" },
  { value: "Medifé", label: "Medifé" },
  { value: "Sancor Salud", label: "Sancor Salud" },
];

export default function PacientesPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filtroFinanciador, setFiltroFinanciador] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  const filtered = useMemo(() => {
    return pacientes.filter((p) => {
      const matchSearch = `${p.nombre} ${p.apellido} ${p.dni}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchFin = filtroFinanciador === "Todos" || p.financiador === filtroFinanciador;
      const matchEst = filtroEstado === "Todos" || p.estado === filtroEstado;
      return matchSearch && matchFin && matchEst;
    });
  }, [search, filtroFinanciador, filtroEstado]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pacientes"
        description={`${pacientes.length} pacientes registrados`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Pacientes" }]}
        actions={
          <Button onClick={() => showToast("Nuevo paciente — Próximamente")}>
            + Nuevo paciente
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3" role="search" aria-label="Buscar y filtrar pacientes">
        <div className="w-72">
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar paciente"
          />
        </div>
        <Select
          options={financiadores}
          value={filtroFinanciador}
          onChange={(e) => setFiltroFinanciador(e.target.value)}
          aria-label="Filtrar por financiador"
        />
        <Select
          options={[
            { value: "Todos", label: "Todos" },
            { value: "activo", label: "Activo" },
            { value: "inactivo", label: "Inactivo" },
          ]}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
        />
      </div>

      {/* KPI cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Indicadores de pacientes"
      >
        <div className="bg-white border border-border rounded-lg p-4 border-l-[3px] border-l-celeste">
          <div className="text-xs text-ink-muted">Total pacientes</div>
          <div className="text-2xl font-bold text-celeste-dark mt-1">{pacientes.length}</div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 border-l-[3px] border-l-green-400">
          <div className="text-xs text-ink-muted">Activos</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {pacientes.filter((p) => p.estado === "activo").length}
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 border-l-[3px] border-l-celeste-dark">
          <div className="text-xs text-ink-muted">PAMI</div>
          <div className="text-2xl font-bold text-ink mt-1">
            {pacientes.filter((p) => p.financiador === "PAMI").length}
          </div>
        </div>
        <div className="bg-white border border-border rounded-lg p-4 border-l-[3px] border-l-celeste">
          <div className="text-xs text-ink-muted">Con turnos pendientes</div>
          <div className="text-2xl font-bold text-celeste-dark mt-1">
            {pacientes.filter((p) => p.turnos > 0).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Lista de pacientes">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-5 py-3" scope="col">
                  Paciente
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  DNI
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  Financiador
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Edad
                </th>
                <th className="text-left px-5 py-3" scope="col">
                  Última visita
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Turnos
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Estado
                </th>
                <th className="text-center px-5 py-3" scope="col">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                >
                  <td className="px-5 py-3 font-semibold text-ink">
                    {p.apellido}, {p.nombre}
                  </td>
                  <td className="px-5 py-3 text-ink-light font-mono text-xs">{p.dni}</td>
                  <td className="px-5 py-3 text-ink-light">{p.financiador}</td>
                  <td className="px-5 py-3 text-center text-ink-light">{p.edad}</td>
                  <td className="px-5 py-3 text-ink-light">{p.ultimaVisita}</td>
                  <td className="px-5 py-3 text-center">
                    {p.turnos > 0 ? (
                      <span className="bg-celeste-pale text-celeste-dark text-[10px] font-bold px-2 py-0.5 rounded">
                        {p.turnos}
                      </span>
                    ) : (
                      <span className="text-ink-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge
                      variant={p.estado}
                      label={p.estado === "activo" ? "Activo" : "Inactivo"}
                    />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <Link
                      href={`/dashboard/pacientes/${p.id}`}
                      className="text-[10px] text-celeste-dark font-medium hover:underline"
                      aria-label={`Ver ficha de ${p.apellido}, ${p.nombre}`}
                    >
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-ink-muted">
                    No se encontraron pacientes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
