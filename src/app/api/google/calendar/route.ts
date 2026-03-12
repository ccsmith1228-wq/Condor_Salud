import { NextRequest, NextResponse } from "next/server";
import { listCalendarEvents, createCalendarEvent } from "@/lib/google";

/* ── GET: Fetch upcoming calendar events ─────────────────── */
export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get("condor_google_session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Not authenticated with Google" }, { status: 401 });
    }

    const { googleAccessToken } = JSON.parse(session);
    if (!googleAccessToken) {
      return NextResponse.json({ error: "No Google access token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const events = await listCalendarEvents(
      googleAccessToken,
      now.toISOString(),
      future.toISOString(),
    );

    // Map to our internal format
    const mappedEvents = events.map((e) => ({
      id: e.id,
      title: e.summary,
      description: e.description,
      start: e.start.dateTime || e.start.date,
      end: e.end.dateTime || e.end.date,
      attendees: (e.attendees || []).map((a) => ({
        email: a.email,
        name: a.displayName,
        status: a.responseStatus,
      })),
      meetLink: e.hangoutLink,
      status: e.status,
    }));

    return NextResponse.json({ events: mappedEvents });
  } catch (err) {
    console.error("Calendar sync error:", err);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}

/* ── POST: Create a new calendar event (appointment) ─────── */
export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get("condor_google_session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Not authenticated with Google" }, { status: 401 });
    }

    const { googleAccessToken } = JSON.parse(session);
    if (!googleAccessToken) {
      return NextResponse.json({ error: "No Google access token" }, { status: 401 });
    }

    const body = await req.json();
    const { patientName, patientEmail, doctorName, date, startTime, endTime, type } = body;

    if (!patientName || !date || !startTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await createCalendarEvent(googleAccessToken, {
      summary: `Turno: ${patientName} — ${type || "Consulta"}`,
      description: [
        `Paciente: ${patientName}`,
        `Profesional: ${doctorName || "Sin asignar"}`,
        `Tipo: ${type || "Consulta médica"}`,
        "",
        "Turno agendado desde Cóndor Salud.",
        "Centro Médico Sur — Av. San Martín 1520, CABA",
      ].join("\n"),
      start: { dateTime: `${date}T${startTime}:00-03:00` },
      end: { dateTime: `${date}T${endTime || incrementTime(startTime, 30)}:00-03:00` },
      attendees: patientEmail ? [{ email: patientEmail }] : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 60 },
          { method: "email", minutes: 1440 }, // 24h before
        ],
      },
    });

    return NextResponse.json({
      success: true,
      eventId: event.id,
      meetLink: event.hangoutLink,
    });
  } catch (err) {
    console.error("Calendar create error:", err);
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 500 });
  }
}

function incrementTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
