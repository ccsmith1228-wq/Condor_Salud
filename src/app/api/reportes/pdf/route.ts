// ─── PDF Generation API Route ────────────────────────────────
// POST /api/reportes/pdf
// Body: { type: "facturacion" | "rechazos" | "kpi", meta: ReportMeta }
// Returns: PDF stream with Content-Disposition header.

import { NextRequest, NextResponse } from "next/server";
import { renderFacturaPDF, renderRechazosPDF, renderKPIDashboardPDF } from "@/lib/services/pdf";
import type { ReportMeta } from "@/lib/services/pdf";
import {
  getFacturas,
  getRechazos,
  getDashboardKPIs,
  getFacturacionKPIs,
  getRechazosKPIs,
  getPacientesKPIs,
  getAgendaKPIs,
  getInventarioKPIs,
} from "@/lib/services/data";
import { logger } from "@/lib/security/api-guard";

const REPORT_TYPES = ["facturacion", "rechazos", "kpi"] as const;
type ReportType = (typeof REPORT_TYPES)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type as ReportType;
    const meta: ReportMeta = body.meta || {
      clinicName: "Clínica Demo",
      periodo: "Marzo 2026",
    };

    if (!REPORT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Tipo inválido. Opciones: ${REPORT_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    let stream: NodeJS.ReadableStream;
    let filename: string;

    switch (type) {
      case "facturacion": {
        const [facturas, kpis] = await Promise.all([getFacturas(), getFacturacionKPIs()]);
        stream = await renderFacturaPDF(facturas, meta, kpis);
        filename = `facturacion-${meta.periodo.toLowerCase().replace(/\s/g, "-")}.pdf`;
        break;
      }
      case "rechazos": {
        const [rechazos, kpis] = await Promise.all([getRechazos(), getRechazosKPIs()]);
        stream = await renderRechazosPDF(rechazos, meta, kpis);
        filename = `rechazos-${meta.periodo.toLowerCase().replace(/\s/g, "-")}.pdf`;
        break;
      }
      case "kpi": {
        const [dashboard, facturacion, rechazos, pacientes, agenda, inventario] = await Promise.all(
          [
            getDashboardKPIs(),
            getFacturacionKPIs(),
            getRechazosKPIs(),
            getPacientesKPIs(),
            getAgendaKPIs(),
            getInventarioKPIs(),
          ],
        );
        const sections = [
          { title: "Dashboard General", kpis: dashboard },
          { title: "Facturación", kpis: facturacion },
          { title: "Rechazos", kpis: rechazos },
          { title: "Pacientes", kpis: pacientes },
          { title: "Agenda", kpis: agenda },
          { title: "Inventario", kpis: inventario },
        ];
        stream = await renderKPIDashboardPDF(sections, meta);
        filename = `kpi-ejecutivo-${meta.periodo.toLowerCase().replace(/\s/g, "-")}.pdf`;
        break;
      }
    }

    logger.info({ route: "reportes/pdf", type }, "PDF generated");

    // Convert Node.js stream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
        stream.on("end", () => controller.close());
        stream.on("error", (err: Error) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    logger.error({ err, route: "reportes/pdf" }, "PDF generation failed");
    return NextResponse.json({ error: "Error generando PDF" }, { status: 500 });
  }
}
