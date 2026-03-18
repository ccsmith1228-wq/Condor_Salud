"use client";
import Link from "next/link";
import { useDemoAction } from "@/components/DemoModal";

const paciente = {
  id: "P001",
  nombre: "María Elena",
  apellido: "González",
  dni: "27.845.332",
  cuil: "27-27845332-4",
  fechaNac: "15/04/1958",
  edad: 67,
  sexo: "Femenino",
  telefono: "11-4523-8891",
  email: "maria.gonzalez@gmail.com",
  direccion: "Av. Rivadavia 4520, Piso 3°B, CABA",
  financiador: "PAMI",
  plan: "Básico",
  nroAfiliado: "27845332-00",
  estado: "Activo",
  grupoSanguineo: "A+",
  alergias: ["Penicilina", "AINEs"],
  medicacionCronica: ["Enalapril 10mg", "Metformina 850mg", "Levotiroxina 50mcg"],
  antecedentes: ["Hipertensión arterial", "Diabetes tipo 2", "Hipotiroidismo"],
};

const historial = [
  {
    fecha: "07/03/2026",
    tipo: "Consulta",
    profesional: "Dr. Rodríguez",
    descripcion: "Control cardiológico. TA 130/85. Ajuste medicación.",
    codigo: "420101",
    financiador: "PAMI",
    estado: "Facturada",
  },
  {
    fecha: "21/02/2026",
    tipo: "Laboratorio",
    profesional: "Dra. Pérez",
    descripcion: "Hemograma completo + TSH + HbA1c. Resultados normales.",
    codigo: "660101",
    financiador: "PAMI",
    estado: "Cobrada",
  },
  {
    fecha: "14/02/2026",
    tipo: "Consulta",
    profesional: "Dr. Rodríguez",
    descripcion: "Seguimiento diabetes. HbA1c 6.8%. Mantener tratamiento.",
    codigo: "420101",
    financiador: "PAMI",
    estado: "Cobrada",
  },
  {
    fecha: "30/01/2026",
    tipo: "Ecografía",
    profesional: "Dr. Martínez",
    descripcion: "Eco abdominal. Sin hallazgos patológicos.",
    codigo: "810101",
    financiador: "PAMI",
    estado: "Rechazada",
  },
  {
    fecha: "10/01/2026",
    tipo: "Consulta",
    profesional: "Dr. Rodríguez",
    descripcion: "Control mensual. Ajuste levotiroxina.",
    codigo: "420101",
    financiador: "PAMI",
    estado: "Cobrada",
  },
  {
    fecha: "20/02/2026",
    tipo: "Laboratorio",
    profesional: "Dra. Pérez",
    descripcion: "Perfil tiroideo completo.",
    codigo: "660201",
    financiador: "PAMI",
    estado: "Cobrada",
  },
];

const turnos = [
  {
    fecha: "12/03/2026",
    hora: "10:00",
    profesional: "Dr. Rodríguez",
    tipo: "Consulta",
    estado: "Confirmado",
  },
  {
    fecha: "19/03/2026",
    hora: "08:30",
    profesional: "Dra. Pérez",
    tipo: "Laboratorio",
    estado: "Pendiente",
  },
  {
    fecha: "02/04/2026",
    hora: "11:00",
    profesional: "Dr. Rodríguez",
    tipo: "Control",
    estado: "Pendiente",
  },
];

const facturacion = [
  { periodo: "Mar 2026", facturas: 1, total: "$18.500", cobrado: "$0", pendiente: "$18.500" },
  { periodo: "Feb 2026", facturas: 3, total: "$52.200", cobrado: "$33.700", pendiente: "$18.500" },
  { periodo: "Ene 2026", facturas: 2, total: "$36.400", cobrado: "$36.400", pendiente: "$0" },
  { periodo: "Feb 2026", facturas: 1, total: "$15.800", cobrado: "$15.800", pendiente: "$0" },
];

export default function PacienteDetailPage() {
  const { showDemo } = useDemoAction();
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Link href="/dashboard/pacientes" className="hover:text-celeste-dark transition">
          Pacientes
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">
          {paciente.apellido}, {paciente.nombre}
        </span>
      </div>

      {/* Header */}
      <div className="bg-white border border-border rounded-lg p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-celeste-pale flex items-center justify-center text-celeste-dark font-bold text-xl">
              {paciente.nombre[0]}
              {paciente.apellido[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink">
                {paciente.apellido}, {paciente.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-ink-light">
                <span>DNI {paciente.dni}</span>
                <span className="w-1 h-1 bg-ink-muted rounded-full" />
                <span>
                  {paciente.edad} años · {paciente.sexo}
                </span>
                <span className="w-1 h-1 bg-ink-muted rounded-full" />
                <span className="font-semibold text-celeste-dark">{paciente.financiador}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/agenda"
              className="px-4 py-2 text-sm font-medium border border-border rounded-[4px] text-ink-light hover:border-celeste-dark hover:text-celeste-dark transition"
            >
              Agendar turno
            </Link>
            <button
              onClick={() =>
                showDemo("Editar paciente: " + paciente.apellido + ", " + paciente.nombre)
              }
              className="px-4 py-2 text-sm font-semibold bg-celeste-dark text-white rounded-[4px] hover:bg-celeste transition"
            >
              Editar paciente
            </button>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Datos personales */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
            Datos Personales
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-ink-muted">CUIL:</span>{" "}
              <span className="text-ink font-mono">{paciente.cuil}</span>
            </div>
            <div>
              <span className="text-ink-muted">Nacimiento:</span>{" "}
              <span className="text-ink">{paciente.fechaNac}</span>
            </div>
            <div>
              <span className="text-ink-muted">Teléfono:</span>{" "}
              <span className="text-ink">{paciente.telefono}</span>
            </div>
            <div>
              <span className="text-ink-muted">Email:</span>{" "}
              <span className="text-ink">{paciente.email}</span>
            </div>
            <div>
              <span className="text-ink-muted">Dirección:</span>{" "}
              <span className="text-ink">{paciente.direccion}</span>
            </div>
            <div>
              <span className="text-ink-muted">Grupo sanguíneo:</span>{" "}
              <span className="text-ink font-semibold">{paciente.grupoSanguineo}</span>
            </div>
          </div>
        </div>

        {/* Cobertura */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
            Cobertura
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-ink-muted">Financiador:</span>{" "}
              <span className="text-ink font-semibold">{paciente.financiador}</span>
            </div>
            <div>
              <span className="text-ink-muted">Plan:</span>{" "}
              <span className="text-ink">{paciente.plan}</span>
            </div>
            <div>
              <span className="text-ink-muted">Nro. Afiliado:</span>{" "}
              <span className="text-ink font-mono">{paciente.nroAfiliado}</span>
            </div>
            <div>
              <span className="text-ink-muted">Estado:</span>{" "}
              <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded">
                {paciente.estado}
              </span>
            </div>
            <Link
              href="/dashboard/verificacion"
              className="block text-celeste-dark text-xs font-medium hover:underline mt-2"
            >
              Verificar cobertura
            </Link>
          </div>
        </div>

        {/* Clínico */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase mb-4">
            Información Clínica
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-ink-muted block mb-1">Alergias:</span>
              <div className="flex flex-wrap gap-1">
                {paciente.alergias.map((a) => (
                  <span
                    key={a}
                    className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-ink-muted block mb-1">Antecedentes:</span>
              <div className="flex flex-wrap gap-1">
                {paciente.antecedentes.map((a) => (
                  <span
                    key={a}
                    className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-ink-muted block mb-1">Medicación crónica:</span>
              <ul className="space-y-1">
                {paciente.medicacionCronica.map((m) => (
                  <li key={m} className="text-xs text-ink">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Turnos próximos */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Turnos Próximos
          </h3>
          <Link
            href="/dashboard/agenda"
            className="text-xs text-celeste-dark font-medium hover:underline"
          >
            Ver agenda
          </Link>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {turnos.map((t, i) => (
              <tr
                key={i}
                className="border-t border-border-light first:border-t-0 hover:bg-celeste-pale/30 transition"
              >
                <td className="px-5 py-3 font-mono text-xs text-ink-light">{t.fecha}</td>
                <td className="px-5 py-3 font-semibold text-ink">{t.hora}</td>
                <td className="px-5 py-3 text-ink-light">{t.profesional}</td>
                <td className="px-5 py-3 text-ink-light">{t.tipo}</td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${t.estado === "Confirmado" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                  >
                    {t.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Historial clínico */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">
            Historial de Atenciones
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                <th className="text-left px-5 py-2.5">Fecha</th>
                <th className="text-left px-5 py-2.5">Tipo</th>
                <th className="text-left px-5 py-2.5">Profesional</th>
                <th className="text-left px-5 py-2.5">Descripción</th>
                <th className="text-left px-5 py-2.5">Código</th>
                <th className="text-center px-5 py-2.5">Estado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h, i) => (
                <tr
                  key={i}
                  className="border-t border-border-light hover:bg-celeste-pale/30 transition"
                >
                  <td className="px-5 py-3 font-mono text-xs text-ink-light whitespace-nowrap">
                    {h.fecha}
                  </td>
                  <td className="px-5 py-3 font-semibold text-ink text-xs">{h.tipo}</td>
                  <td className="px-5 py-3 text-ink-light text-xs">{h.profesional}</td>
                  <td className="px-5 py-3 text-ink-light text-xs max-w-xs">{h.descripcion}</td>
                  <td className="px-5 py-3 font-mono text-[10px] text-ink-muted">{h.codigo}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        h.estado === "Cobrada"
                          ? "bg-green-50 text-green-700"
                          : h.estado === "Rechazada"
                            ? "bg-red-50 text-red-600"
                            : "bg-celeste-pale text-celeste-dark"
                      }`}
                    >
                      {h.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facturación del paciente */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wider text-ink-muted uppercase">Facturación</h3>
          <Link
            href="/dashboard/facturacion"
            className="text-xs text-celeste-dark font-medium hover:underline"
          >
            Ver todo
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8FAFB] text-[10px] font-bold tracking-wider text-ink-muted uppercase">
              <th className="text-left px-5 py-2.5">Período</th>
              <th className="text-center px-5 py-2.5">Facturas</th>
              <th className="text-right px-5 py-2.5">Total</th>
              <th className="text-right px-5 py-2.5">Cobrado</th>
              <th className="text-right px-5 py-2.5">Pendiente</th>
            </tr>
          </thead>
          <tbody>
            {facturacion.map((f, i) => (
              <tr key={i} className="border-t border-border-light">
                <td className="px-5 py-3 font-semibold text-ink text-xs">{f.periodo}</td>
                <td className="px-5 py-3 text-center text-ink-light">{f.facturas}</td>
                <td className="px-5 py-3 text-right text-ink">{f.total}</td>
                <td className="px-5 py-3 text-right text-green-600">{f.cobrado}</td>
                <td className="px-5 py-3 text-right font-semibold text-celeste-dark">
                  {f.pendiente === "$0" ? "—" : f.pendiente}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
