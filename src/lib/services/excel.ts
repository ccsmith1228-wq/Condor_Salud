// ─── Excel Export Service ─────────────────────────────────────
// Server-side Excel workbook generation using ExcelJS.
// Generates: Facturación, Rechazos, Nomenclador, Inventario, KPI.
//
// Usage (API route):
//   import { generateFacturacionExcel } from "@/lib/services/excel";
//   const buffer = await generateFacturacionExcel(facturas, meta);
//   return new Response(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } });

import ExcelJS from "exceljs";
import type { Factura, Rechazo, Financiador, KPI } from "@/lib/types";
import type { InventarioItem, NomencladorEntry, Paciente } from "@/lib/services/data";

// ─── Brand palette ───────────────────────────────────────────
const CELESTE = "4A90C4";
const GOLD = "F6B40E";
const RED = "DC2626";
const GREEN = "16A34A";
const SURFACE = "F8FAFB";
const INK = "1A1A1A";

// ─── Helpers ─────────────────────────────────────────────────
function fmtARS(n: number): string {
  return (
    "$ " +
    n.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

interface ExcelMeta {
  clinicName: string;
  periodo: string;
  cuit?: string;
}

function applyHeaderStyle(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: CELESTE },
    };
    cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 10 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: CELESTE } },
    };
  });
  row.height = 28;
}

function addTitleSheet(ws: ExcelJS.Worksheet, title: string, meta: ExcelMeta) {
  ws.mergeCells("A1:F1");
  const titleCell = ws.getCell("A1");
  titleCell.value = `Cóndor Salud — ${title}`;
  titleCell.font = { bold: true, size: 16, color: { argb: CELESTE } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  ws.getRow(1).height = 36;

  ws.mergeCells("A2:F2");
  const metaCell = ws.getCell("A2");
  metaCell.value = `${meta.clinicName} — Período: ${meta.periodo} — Generado: ${new Date().toLocaleDateString("es-AR")}`;
  metaCell.font = { size: 9, color: { argb: "6B7280" } };
  ws.getRow(2).height = 22;

  // Empty row as separator
  ws.getRow(3).height = 10;
}

function autoWidth(ws: ExcelJS.Worksheet) {
  ws.columns.forEach((col) => {
    if (!col.values) return;
    let maxLen = 10;
    col.values.forEach((v) => {
      if (v) {
        const len = String(v).length;
        if (len > maxLen) maxLen = len;
      }
    });
    col.width = Math.min(maxLen + 4, 40);
  });
}

// ─── 1. Facturación Excel ────────────────────────────────────
export async function generateFacturacionExcel(
  facturas: Factura[],
  meta: ExcelMeta,
  kpis?: KPI[],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cóndor Salud";
  wb.created = new Date();

  // ── KPI Summary Sheet ──
  if (kpis && kpis.length > 0) {
    const ws = wb.addWorksheet("Resumen KPIs");
    addTitleSheet(ws, "KPIs de Facturación", meta);

    const headerRow = ws.addRow(["Indicador", "Valor", "Variación", "Tendencia"]);
    applyHeaderStyle(headerRow);

    kpis.forEach((k) => {
      const row = ws.addRow([k.label, k.value, k.change, k.up ? "▲ Sube" : "▼ Baja"]);
      row.getCell(4).font = {
        color: { argb: k.up ? GREEN : RED },
        bold: true,
      };
    });
    autoWidth(ws);
  }

  // ── Detail Sheet ──
  const ws = wb.addWorksheet("Facturas");
  addTitleSheet(ws, "Detalle de Facturación", meta);

  const headerRow = ws.addRow([
    "Número",
    "Fecha",
    "Financiador",
    "Paciente",
    "Prestación",
    "Código",
    "Monto",
    "Estado",
    "Fecha Presentación",
    "Fecha Cobro",
    "CAE",
  ]);
  applyHeaderStyle(headerRow);

  facturas.forEach((f, i) => {
    const row = ws.addRow([
      f.numero,
      f.fecha,
      f.financiador,
      f.paciente,
      f.prestacion,
      f.codigoNomenclador,
      f.monto,
      f.estado.charAt(0).toUpperCase() + f.estado.slice(1),
      f.fechaPresentacion || "",
      f.fechaCobro || "",
      f.cae || "",
    ]);
    // ARS format for monto column
    row.getCell(7).numFmt = '"$ "#,##0';
    // Alternate row colors
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SURFACE } };
      });
    }
    // Color-coded estado
    const estadoCell = row.getCell(8);
    const color = f.estado === "cobrada" ? GREEN : f.estado === "rechazada" ? RED : GOLD;
    estadoCell.font = { bold: true, color: { argb: color } };
  });

  // Summary row
  ws.addRow([]);
  const total = facturas.reduce((s, f) => s + f.monto, 0);
  const summRow = ws.addRow(["", "", "", "", "", "TOTAL", total, ""]);
  summRow.getCell(6).font = { bold: true, size: 11 };
  summRow.getCell(7).numFmt = '"$ "#,##0';
  summRow.getCell(7).font = { bold: true, size: 11 };
  autoWidth(ws);

  // ── By Financiador Pivot Sheet ──
  const pws = wb.addWorksheet("Por Financiador");
  addTitleSheet(pws, "Facturación por Financiador", meta);

  const pivotHeader = pws.addRow([
    "Financiador",
    "Total Facturado",
    "Cobrado",
    "Pendiente",
    "Rechazado",
    "Cantidad",
  ]);
  applyHeaderStyle(pivotHeader);

  const grouped: Record<
    string,
    { total: number; cobrado: number; rechazado: number; count: number }
  > = {};
  facturas.forEach((f) => {
    const g =
      grouped[f.financiador] ??
      (grouped[f.financiador] = { total: 0, cobrado: 0, rechazado: 0, count: 0 });
    g.total += f.monto;
    g.count++;
    if (f.estado === "cobrada") g.cobrado += f.monto;
    if (f.estado === "rechazada") g.rechazado += f.monto;
  });
  Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([fin, d]) => {
      const row = pws.addRow([
        fin,
        d.total,
        d.cobrado,
        d.total - d.cobrado - d.rechazado,
        d.rechazado,
        d.count,
      ]);
      [2, 3, 4, 5].forEach((c) => {
        row.getCell(c).numFmt = '"$ "#,##0';
      });
    });
  autoWidth(pws);

  return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
}

// ─── 2. Rechazos Excel ───────────────────────────────────────
export async function generateRechazosExcel(
  rechazos: Rechazo[],
  meta: ExcelMeta,
  kpis?: KPI[],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cóndor Salud";

  // KPI sheet
  if (kpis && kpis.length > 0) {
    const ws = wb.addWorksheet("Resumen KPIs");
    addTitleSheet(ws, "KPIs de Rechazos", meta);
    const h = ws.addRow(["Indicador", "Valor", "Variación", "Tendencia"]);
    applyHeaderStyle(h);
    kpis.forEach((k) => {
      const row = ws.addRow([k.label, k.value, k.change, k.up ? "▲ Sube" : "▼ Baja"]);
      row.getCell(4).font = { color: { argb: k.up ? GREEN : RED }, bold: true };
    });
    autoWidth(ws);
  }

  // Detail sheet
  const ws = wb.addWorksheet("Rechazos");
  addTitleSheet(ws, "Detalle de Rechazos", meta);

  const h = ws.addRow([
    "Factura",
    "Financiador",
    "Paciente",
    "Prestación",
    "Monto",
    "Motivo",
    "Detalle",
    "Fecha Rechazo",
    "Reprocesable",
    "Estado",
  ]);
  applyHeaderStyle(h);

  rechazos.forEach((r, i) => {
    const row = ws.addRow([
      r.facturaNumero,
      r.financiador,
      r.paciente,
      r.prestacion,
      r.monto,
      r.motivo.replace(/_/g, " "),
      r.motivoDetalle,
      r.fechaRechazo,
      r.reprocesable ? "Sí" : "No",
      r.estado.charAt(0).toUpperCase() + r.estado.slice(1),
    ]);
    row.getCell(5).numFmt = '"$ "#,##0';
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SURFACE } };
      });
    }
  });

  // By motivo pivot
  const pws = wb.addWorksheet("Por Motivo");
  addTitleSheet(pws, "Rechazos por Motivo", meta);
  const ph = pws.addRow(["Motivo", "Cantidad", "Monto Total", "% del Total"]);
  applyHeaderStyle(ph);

  const totalMonto = rechazos.reduce((s, r) => s + r.monto, 0);
  const byMotivo: Record<string, { count: number; monto: number }> = {};
  rechazos.forEach((r) => {
    const m = byMotivo[r.motivo] ?? (byMotivo[r.motivo] = { count: 0, monto: 0 });
    m.count++;
    m.monto += r.monto;
  });
  Object.entries(byMotivo)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([m, d]) => {
      const row = pws.addRow([
        m.replace(/_/g, " "),
        d.count,
        d.monto,
        totalMonto > 0 ? `${((d.monto / totalMonto) * 100).toFixed(1)}%` : "0%",
      ]);
      row.getCell(3).numFmt = '"$ "#,##0';
    });
  autoWidth(pws);

  return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
}

// ─── 3. Nomenclador Excel ────────────────────────────────────
export async function generateNomencladorExcel(
  entries: NomencladorEntry[],
  meta: ExcelMeta,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cóndor Salud";

  const ws = wb.addWorksheet("Nomenclador");
  addTitleSheet(ws, "Nomenclador de Prestaciones", meta);

  const h = ws.addRow([
    "Código",
    "Descripción",
    "Capítulo",
    "Valor OSDE",
    "Valor Swiss Medical",
    "Valor PAMI",
    "Valor Galeno",
    "Vigente",
    "Última Actualización",
  ]);
  applyHeaderStyle(h);

  entries.forEach((e, i) => {
    const row = ws.addRow([
      e.codigo,
      e.descripcion,
      e.capitulo,
      e.valorOSDE,
      e.valorSwiss,
      e.valorPAMI,
      e.valorGaleno,
      e.vigente ? "Sí" : "No",
      e.ultimaActualizacion,
    ]);
    [4, 5, 6, 7].forEach((c) => {
      row.getCell(c).numFmt = '"$ "#,##0';
    });
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SURFACE } };
      });
    }
  });
  autoWidth(ws);

  return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
}

// ─── 4. Inventario Excel ─────────────────────────────────────
export async function generateInventarioExcel(
  items: InventarioItem[],
  meta: ExcelMeta,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cóndor Salud";

  const ws = wb.addWorksheet("Inventario");
  addTitleSheet(ws, "Inventario Clínico", meta);

  const h = ws.addRow([
    "Nombre",
    "Categoría",
    "Stock",
    "Mínimo",
    "Unidad",
    "Precio Unit.",
    "Proveedor",
    "Vencimiento",
    "Lote",
    "Estado",
  ]);
  applyHeaderStyle(h);

  items.forEach((it, i) => {
    const estado = it.stock <= it.minimo * 0.5 ? "Crítico" : it.stock <= it.minimo ? "Bajo" : "OK";
    const row = ws.addRow([
      it.nombre,
      it.categoria,
      it.stock,
      it.minimo,
      it.unidad,
      it.precio,
      it.proveedor,
      it.vencimiento || "",
      it.lote || "",
      estado,
    ]);
    row.getCell(6).numFmt = '"$ "#,##0';
    const estadoCell = row.getCell(10);
    estadoCell.font = {
      bold: true,
      color: { argb: estado === "OK" ? GREEN : estado === "Bajo" ? GOLD : RED },
    };
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SURFACE } };
      });
    }
  });
  autoWidth(ws);

  return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
}

// ─── 5. Pacientes Excel ──────────────────────────────────────
export async function generatePacientesExcel(
  pacientes: Paciente[],
  meta: ExcelMeta,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cóndor Salud";

  const ws = wb.addWorksheet("Pacientes");
  addTitleSheet(ws, "Listado de Pacientes", meta);

  const h = ws.addRow([
    "Nombre",
    "DNI",
    "Financiador",
    "Plan",
    "Última Visita",
    "Estado",
    "Email",
    "Teléfono",
  ]);
  applyHeaderStyle(h);

  pacientes.forEach((p, i) => {
    const row = ws.addRow([
      p.nombre,
      p.dni,
      p.financiador,
      p.plan,
      p.ultimaVisita,
      p.estado.charAt(0).toUpperCase() + p.estado.slice(1),
      p.email,
      p.telefono,
    ]);
    const estadoCell = row.getCell(6);
    estadoCell.font = {
      bold: true,
      color: { argb: p.estado === "activo" ? GREEN : RED },
    };
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SURFACE } };
      });
    }
  });
  autoWidth(ws);

  return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
}

// ─── Export types ────────────────────────────────────────────
export type { ExcelMeta };
