// ─── Excel Generation API Route ──────────────────────────────
// POST /api/reportes/excel
// Body: { type: "facturacion" | "rechazos" | "nomenclador" | "inventario" | "pacientes", meta: ExcelMeta }
// Returns: .xlsx file with Content-Disposition header.

import { NextRequest, NextResponse } from "next/server";
import {
  generateFacturacionExcel,
  generateRechazosExcel,
  generateNomencladorExcel,
  generateInventarioExcel,
  generatePacientesExcel,
} from "@/lib/services/excel";
import type { ExcelMeta } from "@/lib/services/excel";
import {
  getFacturas,
  getRechazos,
  getNomenclador,
  getInventario,
  getPacientes,
  getFacturacionKPIs,
  getRechazosKPIs,
} from "@/lib/services/data";
import { logger } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";
import { checkRateLimit } from "@/lib/security/api-guard";

const REPORT_TYPES = ["facturacion", "rechazos", "nomenclador", "inventario", "pacientes"] as const;
type ExcelType = (typeof REPORT_TYPES)[number];

export async function POST(request: NextRequest) {
  // Auth check — only authenticated users can generate reports
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  // Rate limit — 5 reports per minute per IP
  const limited = checkRateLimit(request, "report-excel", { limit: 5, windowSec: 60 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const type = body.type as ExcelType;
    const meta: ExcelMeta = body.meta || {
      clinicName: "Clínica Demo",
      periodo: "Marzo 2026",
    };

    if (!REPORT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Tipo inválido. Opciones: ${REPORT_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    let buffer: Buffer;
    let filename: string;
    const slug = meta.periodo.toLowerCase().replace(/\s/g, "-");

    switch (type) {
      case "facturacion": {
        const [facturas, kpis] = await Promise.all([getFacturas(), getFacturacionKPIs()]);
        buffer = await generateFacturacionExcel(facturas, meta, kpis);
        filename = `facturacion-${slug}.xlsx`;
        break;
      }
      case "rechazos": {
        const [rechazos, kpis] = await Promise.all([getRechazos(), getRechazosKPIs()]);
        buffer = await generateRechazosExcel(rechazos, meta, kpis);
        filename = `rechazos-${slug}.xlsx`;
        break;
      }
      case "nomenclador": {
        const entries = await getNomenclador();
        buffer = await generateNomencladorExcel(entries, meta);
        filename = `nomenclador-${slug}.xlsx`;
        break;
      }
      case "inventario": {
        const items = await getInventario();
        buffer = await generateInventarioExcel(items, meta);
        filename = `inventario-${slug}.xlsx`;
        break;
      }
      case "pacientes": {
        const pacientes = await getPacientes();
        buffer = await generatePacientesExcel(pacientes, meta);
        filename = `pacientes-${slug}.xlsx`;
        break;
      }
    }

    logger.info({ route: "reportes/excel", type }, "Excel generated");

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    logger.error({ err, route: "reportes/excel" }, "Excel generation failed");
    return NextResponse.json({ error: "Error generando Excel" }, { status: 500 });
  }
}
