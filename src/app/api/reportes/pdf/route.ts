// ─── PDF Generation API Route ────────────────────────────────
// POST /api/reportes/pdf
// Body: { type: "facturacion" | "rechazos" | "kpi", meta: ReportMeta }
// Returns: PDF stream with Content-Disposition header.

import { NextRequest, NextResponse } from "next/server";
import {
  renderFacturaPDF,
  renderRechazosPDF,
  renderKPIDashboardPDF,
  renderFinanciadoresPDF,
  renderInflacionPDF,
  renderAgendaPDF,
} from "@/lib/services/pdf";
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
  getFinanciadores,
  getTurnos,
} from "@/lib/services/data";
import { getFinanciadoresExtended } from "@/lib/services/financiadores";
import { getInflacionMensual, getFinanciadoresInflacion } from "@/lib/services/inflacion";
import { logger } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";
import { checkRateLimit } from "@/lib/security/api-guard";

const REPORT_TYPES = [
  "facturacion",
  "rechazos",
  "kpi",
  "financiadores",
  "inflacion",
  "agenda",
] as const;
type ReportType = (typeof REPORT_TYPES)[number];

export async function POST(request: NextRequest) {
  // Auth check — only authenticated users can generate reports
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  // Rate limit — 5 reports per minute per IP
  const limited = checkRateLimit(request, "report-pdf", { limit: 5, windowSec: 60 });
  if (limited) return limited;

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
      case "financiadores": {
        const financiadores = await getFinanciadoresExtended();
        stream = await renderFinanciadoresPDF(financiadores, meta);
        filename = `financiadores-${meta.periodo.toLowerCase().replace(/\s/g, "-")}.pdf`;
        break;
      }
      case "inflacion": {
        const [meses, finInflacion] = await Promise.all([
          getInflacionMensual({ period: "6m" }),
          getFinanciadoresInflacion(),
        ]);
        stream = await renderInflacionPDF(meses, finInflacion, meta);
        filename = `inflacion-${meta.periodo.toLowerCase().replace(/\s/g, "-")}.pdf`;
        break;
      }
      case "agenda": {
        const turnos = await getTurnos();
        stream = await renderAgendaPDF(turnos, meta);
        filename = `agenda-${meta.periodo.toLowerCase().replace(/\s/g, "-")}.pdf`;
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
