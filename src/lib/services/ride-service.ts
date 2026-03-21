/**
 * Ride Service — v0.17.0
 *
 * Builds pre-filled deep links for Uber, Cabify, and InDrive
 * with the doctor/clinic address as the destination.
 *
 * Also optionally fetches Uber fare estimates using the
 * Uber Price Estimates API (free, no OAuth required).
 *
 * Ported from Express RideService.js → Next.js TypeScript.
 */

import { logger } from "@/lib/logger";

// ─── Types ───────────────────────────────────────────────────

export interface RideOption {
  app: string;
  logo: string;
  color: string;
  textColor?: string;
  deepLink: string;
  webLink: string;
  smartLink: string;
  available: boolean;
  note: string | null;
}

export interface FareEstimate {
  low: number | null;
  high: number | null;
  currency: string;
  duration: number | null; // seconds
  distance: number | null; // km
  display: string | null;
  surge: number | null;
}

export interface RideOptionsResult {
  destination: {
    name: string;
    address: string;
    lat: number | null;
    lng: number | null;
  };
  booking: {
    date: string;
    time: string;
    specialty: string;
  };
  fareEstimate: FareEstimate | null;
  options: RideOption[];
}

interface BuildRideOptionsParams {
  doctorName: string;
  clinicAddress: string;
  clinicLat?: number | null;
  clinicLng?: number | null;
  patientAddress?: string | null;
  patientLat?: number | null;
  patientLng?: number | null;
  specialty?: string;
  bookingDate?: string;
  bookingTime?: string;
}

// ─── Service ─────────────────────────────────────────────────

const uberClientId = process.env.UBER_CLIENT_ID || null;
const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;

/** Build all ride options for a booking destination */
export async function buildRideOptions(params: BuildRideOptionsParams): Promise<RideOptionsResult> {
  const {
    doctorName,
    clinicAddress,
    patientAddress = null,
    patientLat = null,
    patientLng = null,
    specialty = "",
    bookingDate = "",
    bookingTime = "",
  } = params;

  // Geocode clinic address if we don't have coords
  let destLat = params.clinicLat ?? null;
  let destLng = params.clinicLng ?? null;

  if (!destLat || !destLng) {
    const coords = await geocode(clinicAddress);
    destLat = coords?.lat ?? null;
    destLng = coords?.lng ?? null;
  }

  const pickupLat = patientLat ?? null;
  const pickupLng = patientLng ?? null;

  // Note for the ride
  const rideNote = `Consulta ${specialty} con ${doctorName}`.trim();

  const options: RideOption[] = [
    buildUberLink({
      destLat,
      destLng,
      destAddress: clinicAddress,
      pickupLat,
      pickupLng,
      pickupAddress: patientAddress ?? null,
      note: rideNote,
    }),
    buildCabifyLink({
      destLat,
      destLng,
      destAddress: clinicAddress,
      pickupLat,
      pickupLng,
    }),
    buildInDriveLink({
      destAddress: clinicAddress,
      destLat,
      destLng,
      pickupAddress: patientAddress ?? null,
    }),
  ];

  // Optionally fetch Uber fare estimate
  let fareEstimate: FareEstimate | null = null;
  if (uberClientId && pickupLat && pickupLng && destLat && destLng) {
    fareEstimate = await getUberFareEstimate({
      pickupLat,
      pickupLng,
      destLat,
      destLng,
    }).catch(() => null);
  }

  return {
    destination: {
      name: doctorName,
      address: clinicAddress,
      lat: destLat,
      lng: destLng,
    },
    booking: {
      date: bookingDate,
      time: bookingTime,
      specialty,
    },
    fareEstimate,
    options,
  };
}

// ─── Uber deep link ──────────────────────────────────────────

function buildUberLink(p: {
  destLat: number | null;
  destLng: number | null;
  destAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  pickupAddress: string | null;
  note: string;
}): RideOption {
  const params = new URLSearchParams();

  if (p.destLat && p.destLng) {
    params.set("dropoff[latitude]", String(p.destLat));
    params.set("dropoff[longitude]", String(p.destLng));
  }
  if (p.destAddress) {
    params.set("dropoff[nickname]", "Consultorio médico");
    params.set("dropoff[formatted_address]", p.destAddress);
  }

  if (p.pickupLat && p.pickupLng) {
    params.set("action", "setPickup");
    params.set("pickup[latitude]", String(p.pickupLat));
    params.set("pickup[longitude]", String(p.pickupLng));
    if (p.pickupAddress) params.set("pickup[formatted_address]", p.pickupAddress);
  } else {
    params.set("action", "setPickup");
    params.set("pickup", "my_location");
  }

  if (uberClientId) {
    params.set("client_id", uberClientId);
  }

  const query = params.toString();

  return {
    app: "Uber",
    logo: "uber",
    color: "#000000",
    deepLink: `uber://?${query}`,
    webLink: `https://m.uber.com/ul/?${query}`,
    smartLink: `https://m.uber.com/ul/?${query}`,
    available: true,
    note: p.note || null,
  };
}

// ─── Cabify deep link ────────────────────────────────────────

function buildCabifyLink(p: {
  destLat: number | null;
  destLng: number | null;
  destAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
}): RideOption {
  const stops: string[] = [];

  if (p.pickupLat && p.pickupLng) {
    stops.push(`${p.pickupLat},${p.pickupLng},"Mi ubicación"`);
  }

  if (p.destLat && p.destLng) {
    const label = p.destAddress
      ? encodeURIComponent(`"${p.destAddress.replace(/"/g, "")}"`)
      : '"Consultorio"';
    stops.push(`${p.destLat},${p.destLng},${label}`);
  } else if (p.destAddress) {
    stops.push(`0,0,${encodeURIComponent(`"${p.destAddress}"`)}`);
  }

  const stopsQuery = stops.map((s) => `stops[]=${s}`).join("&");

  return {
    app: "Cabify",
    logo: "cabify",
    color: "#7C3AED",
    deepLink: `cabify://route?${stopsQuery}`,
    webLink: `https://cabify.com/ride?${stopsQuery}`,
    smartLink: `https://cabify.com/ride?${stopsQuery}`,
    available: true,
    note: "Popular en Buenos Aires",
  };
}

// ─── InDrive deep link ───────────────────────────────────────

function buildInDriveLink(p: {
  destAddress: string;
  destLat: number | null;
  destLng: number | null;
  pickupAddress: string | null;
}): RideOption {
  const params = new URLSearchParams();

  if (p.destAddress) params.set("destination", p.destAddress);
  if (p.destLat) params.set("dest_lat", String(p.destLat));
  if (p.destLng) params.set("dest_lng", String(p.destLng));
  if (p.pickupAddress) params.set("origin", p.pickupAddress);

  const link = `https://indrive.com/deeplink/go?${params.toString()}`;

  return {
    app: "InDrive",
    logo: "indrive",
    color: "#CCFF00",
    textColor: "#000000",
    deepLink: link,
    webLink: link,
    smartLink: link,
    available: true,
    note: "Negociá el precio",
  };
}

// ─── Uber Price Estimates (no OAuth needed) ──────────────────

async function getUberFareEstimate(p: {
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
}): Promise<FareEstimate | null> {
  if (!process.env.UBER_SERVER_TOKEN) return null;

  const url = new URL("https://api.uber.com/v1.2/estimates/price");
  url.searchParams.set("start_latitude", String(p.pickupLat));
  url.searchParams.set("start_longitude", String(p.pickupLng));
  url.searchParams.set("end_latitude", String(p.destLat));
  url.searchParams.set("end_longitude", String(p.destLng));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Token ${process.env.UBER_SERVER_TOKEN}`,
      "Accept-Language": "es_AR",
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const prices = data.prices || [];

  // Find UberX or cheapest option
  const uberX =
    prices.find(
      (p: { display_name?: string }) =>
        p.display_name?.toLowerCase().includes("x") ||
        p.display_name?.toLowerCase().includes("basic"),
    ) || prices[0];

  if (!uberX) return null;

  return {
    low: uberX.low_estimate ?? null,
    high: uberX.high_estimate ?? null,
    currency: uberX.currency_code || "ARS",
    duration: uberX.duration ?? null,
    distance: uberX.distance ?? null,
    display: uberX.estimate ?? null,
    surge: uberX.surge_multiplier > 1 ? uberX.surge_multiplier : null,
  };
}

// ─── Google Geocoding ────────────────────────────────────────

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!googleMapsKey || !address) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", `${address}, Buenos Aires, Argentina`);
  url.searchParams.set("region", "ar");
  url.searchParams.set("language", "es");
  url.searchParams.set("key", googleMapsKey);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
    const data = await res.json();

    if (data.status !== "OK" || !data.results?.[0]) return null;

    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.warn(`Geocoding failed for "${address}": ${message}`);
    return null;
  }
}
