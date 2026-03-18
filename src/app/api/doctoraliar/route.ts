import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/security/require-auth";
import { checkRateLimit, logger } from "@/lib/security/api-guard";
import {
  isDoctoraliarConfigured,
  getFacilities,
  getDoctors,
  getDoctor,
  getAddresses,
  getSlots,
  bookSlot,
  getBookings,
  cancelBooking,
  getInsuranceProviders,
  getAddressServices,
  getAddressInsuranceProviders,
  DoctoraliarError,
  type BookSlotPayload,
} from "@/lib/doctoraliar";

// ── GET /api/doctoraliar?resource=facilities|doctors|slots|bookings|insurances|services
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "doctoraliar-read", { limit: 60, windowSec: 60 });
  if (limited) return limited;

  if (!isDoctoraliarConfigured()) {
    return NextResponse.json(
      {
        error:
          "Doctoraliar no configurado. Agregue DOCTORALIAR_CLIENT_ID y DOCTORALIAR_CLIENT_SECRET.",
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource") || "facilities";

  try {
    switch (resource) {
      // ── List Facilities ────────────────────────────
      case "facilities": {
        const data = await getFacilities();
        return NextResponse.json({ facilities: data });
      }

      // ── List Doctors in a Facility ─────────────────
      case "doctors": {
        const facilityId = searchParams.get("facility_id");
        if (!facilityId) {
          return NextResponse.json({ error: "facility_id requerido" }, { status: 400 });
        }
        const withProfile = searchParams.get("with_profile") === "1";
        const withSpecs = searchParams.get("with_specializations") === "1";
        const data = await getDoctors(facilityId, {
          withProfileUrl: withProfile,
          withSpecializations: withSpecs,
        });
        return NextResponse.json({ doctors: data });
      }

      // ── Single Doctor Detail ───────────────────────
      case "doctor": {
        const facilityId = searchParams.get("facility_id");
        const doctorId = searchParams.get("doctor_id");
        if (!facilityId || !doctorId) {
          return NextResponse.json(
            { error: "facility_id y doctor_id requeridos" },
            { status: 400 },
          );
        }
        const data = await getDoctor(facilityId, doctorId, {
          withProfileUrl: true,
          withAddresses: true,
          withOnlineOnly: true,
          withInsuranceSupport: true,
        });
        return NextResponse.json({ doctor: data });
      }

      // ── Addresses for a Doctor ─────────────────────
      case "addresses": {
        const facilityId = searchParams.get("facility_id");
        const doctorId = searchParams.get("doctor_id");
        if (!facilityId || !doctorId) {
          return NextResponse.json(
            { error: "facility_id y doctor_id requeridos" },
            { status: 400 },
          );
        }
        const data = await getAddresses(facilityId, doctorId, {
          withOnlineOnly: true,
          withInsuranceSupport: true,
        });
        return NextResponse.json({ addresses: data });
      }

      // ── Services at an Address ─────────────────────
      case "services": {
        const facilityId = searchParams.get("facility_id");
        const doctorId = searchParams.get("doctor_id");
        const addressId = searchParams.get("address_id");
        if (!facilityId || !doctorId || !addressId) {
          return NextResponse.json(
            { error: "facility_id, doctor_id y address_id requeridos" },
            { status: 400 },
          );
        }
        const data = await getAddressServices(facilityId, doctorId, addressId);
        return NextResponse.json({ services: data });
      }

      // ── Available Slots ────────────────────────────
      case "slots": {
        const facilityId = searchParams.get("facility_id");
        const doctorId = searchParams.get("doctor_id");
        const addressId = searchParams.get("address_id");
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        if (!facilityId || !doctorId || !addressId || !start || !end) {
          return NextResponse.json(
            { error: "facility_id, doctor_id, address_id, start y end requeridos" },
            { status: 400 },
          );
        }
        const data = await getSlots(facilityId, doctorId, addressId, start, end, {
          withServices: searchParams.get("with_services") === "1",
        });
        return NextResponse.json({ slots: data });
      }

      // ── Bookings List ──────────────────────────────
      case "bookings": {
        const facilityId = searchParams.get("facility_id");
        const doctorId = searchParams.get("doctor_id");
        const addressId = searchParams.get("address_id");
        const start = searchParams.get("start");
        const end = searchParams.get("end");
        if (!facilityId || !doctorId || !addressId || !start || !end) {
          return NextResponse.json(
            { error: "facility_id, doctor_id, address_id, start y end requeridos" },
            { status: 400 },
          );
        }
        const data = await getBookings(facilityId, doctorId, addressId, start, end, {
          withPatient: true,
          withService: true,
        });
        return NextResponse.json({ bookings: data });
      }

      // ── Insurance Providers (global) ───────────────
      case "insurances": {
        const data = await getInsuranceProviders();
        return NextResponse.json({ insuranceProviders: data });
      }

      // ── Insurance Providers for an Address ─────────
      case "address-insurances": {
        const facilityId = searchParams.get("facility_id");
        const doctorId = searchParams.get("doctor_id");
        const addressId = searchParams.get("address_id");
        if (!facilityId || !doctorId || !addressId) {
          return NextResponse.json(
            { error: "facility_id, doctor_id y address_id requeridos" },
            { status: 400 },
          );
        }
        const data = await getAddressInsuranceProviders(facilityId, doctorId, addressId);
        return NextResponse.json({ insuranceProviders: data });
      }

      default:
        return NextResponse.json({ error: `Recurso desconocido: ${resource}` }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof DoctoraliarError) {
      logger.error({ status: err.status, message: err.apiMessage }, "Doctoraliar API error");
      return NextResponse.json(
        { error: err.apiMessage },
        { status: err.status >= 500 ? 502 : err.status },
      );
    }
    logger.error(err, "Doctoraliar unexpected error");
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ── POST /api/doctoraliar — book slot or cancel booking
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const limited = checkRateLimit(req, "doctoraliar-write", { limit: 10, windowSec: 60 });
  if (limited) return limited;

  if (!isDoctoraliarConfigured()) {
    return NextResponse.json({ error: "Doctoraliar no configurado" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const action = body.action as string;

    switch (action) {
      // ── Book a Slot ──────────────────────────────
      case "book": {
        const { facility_id, doctor_id, address_id, slot_start, booking } = body;
        if (!facility_id || !doctor_id || !address_id || !slot_start || !booking) {
          return NextResponse.json(
            { error: "facility_id, doctor_id, address_id, slot_start y booking requeridos" },
            { status: 400 },
          );
        }
        const result = await bookSlot(
          facility_id,
          doctor_id,
          address_id,
          slot_start,
          booking as BookSlotPayload,
        );
        logger.info({ bookingId: result.id, doctor: doctor_id }, "Doctoraliar slot booked");
        return NextResponse.json({ booking: result }, { status: 201 });
      }

      // ── Cancel a Booking ─────────────────────────
      case "cancel": {
        const { facility_id, doctor_id, address_id, booking_id, reason } = body;
        if (!facility_id || !doctor_id || !address_id || !booking_id) {
          return NextResponse.json(
            { error: "facility_id, doctor_id, address_id y booking_id requeridos" },
            { status: 400 },
          );
        }
        await cancelBooking(facility_id, doctor_id, address_id, booking_id, reason);
        logger.info({ bookingId: booking_id }, "Doctoraliar booking canceled");
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Accion desconocida: ${action}` }, { status: 400 });
    }
  } catch (err) {
    if (err instanceof DoctoraliarError) {
      logger.error({ status: err.status, message: err.apiMessage }, "Doctoraliar API error");
      return NextResponse.json(
        { error: err.apiMessage },
        { status: err.status >= 500 ? 502 : err.status },
      );
    }
    logger.error(err, "Doctoraliar unexpected error");
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
