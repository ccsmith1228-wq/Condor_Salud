import { NextRequest, NextResponse } from "next/server";
import {
  getNubixStudies,
  getNubixStudy,
  getNubixReport,
  getNubixReports,
  getNubixDeliveries,
  sendNubixResults,
  getNubixViewerConfig,
  getNubixAppointments,
  upsertNubixAppointment,
  getNubixKPIs,
} from "@/lib/services/nubix";
import { checkRateLimit, sanitizeBody, logger } from "@/lib/security/api-guard";
import type { NubixStudyFilters, NubixAppointmentFilters } from "@/lib/nubix/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource") || "studies";

  try {
    switch (resource) {
      case "studies": {
        const filters: NubixStudyFilters = {
          patientName: searchParams.get("patientName") ?? undefined,
          patientDni: searchParams.get("patientDni") ?? undefined,
          modality: (searchParams.get("modality") as NubixStudyFilters["modality"]) ?? undefined,
          specialty: (searchParams.get("specialty") as NubixStudyFilters["specialty"]) ?? undefined,
          status: (searchParams.get("status") as NubixStudyFilters["status"]) ?? undefined,
          financiador: searchParams.get("financiador") ?? undefined,
          dateFrom: searchParams.get("dateFrom") ?? undefined,
          dateTo: searchParams.get("dateTo") ?? undefined,
        };
        return NextResponse.json(await getNubixStudies(filters));
      }

      case "study": {
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing study id" }, { status: 400 });
        const study = await getNubixStudy(id);
        if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });
        return NextResponse.json(study);
      }

      case "report": {
        const studyId = searchParams.get("studyId");
        if (!studyId) return NextResponse.json({ error: "Missing studyId" }, { status: 400 });
        const report = await getNubixReport(studyId);
        if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
        return NextResponse.json(report);
      }

      case "reports":
        return NextResponse.json(await getNubixReports());

      case "deliveries": {
        const studyId = searchParams.get("studyId") ?? undefined;
        return NextResponse.json(await getNubixDeliveries(studyId));
      }

      case "viewer": {
        const studyId = searchParams.get("studyId");
        if (!studyId) return NextResponse.json({ error: "Missing studyId" }, { status: 400 });
        const config = await getNubixViewerConfig(studyId);
        if (!config) return NextResponse.json({ error: "Viewer unavailable" }, { status: 503 });
        return NextResponse.json(config);
      }

      case "appointments": {
        const filters: NubixAppointmentFilters = {
          dateFrom: searchParams.get("dateFrom") ?? undefined,
          dateTo: searchParams.get("dateTo") ?? undefined,
          modality:
            (searchParams.get("modality") as NubixAppointmentFilters["modality"]) ?? undefined,
          status: (searchParams.get("status") as NubixAppointmentFilters["status"]) ?? undefined,
          room: searchParams.get("room") ?? undefined,
        };
        return NextResponse.json(await getNubixAppointments(filters));
      }

      case "kpis":
        return NextResponse.json(await getNubixKPIs());

      default:
        return NextResponse.json({ error: "Unknown resource" }, { status: 400 });
    }
  } catch (err) {
    logger.error({ err, route: "nubix", resource }, "Nubix GET error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // ── Rate limit: 10 req / 60s per IP ──
  const limited = checkRateLimit(req, "nubix", { limit: 10, windowSec: 60 });
  if (limited) return limited;

  try {
    const rawBody = await req.json();
    const body = sanitizeBody(rawBody);
    const { action } = body;

    switch (action) {
      case "send-results": {
        const { studyId, channel, recipientContact } = body;
        if (!studyId || !channel || !recipientContact) {
          return NextResponse.json(
            { error: "Missing studyId, channel, or recipientContact" },
            { status: 400 },
          );
        }
        const delivery = await sendNubixResults(
          studyId as string,
          channel as "whatsapp" | "email" | "portal" | "sms",
          recipientContact as string,
        );
        return NextResponse.json(delivery);
      }

      case "upsert-appointment": {
        const { appointmentId, data } = body;
        const appointment = await upsertNubixAppointment(data, appointmentId as string | undefined);
        return NextResponse.json(appointment);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    logger.error({ err, route: "nubix" }, "Nubix POST error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
