// ─── Geolocation API Route ───────────────────────────────────
// Proxy for geolocation services so browser clients never
// expose the Google API key directly.
//
// GET /api/geolocation?action=reverse-geocode&lat=-34.5875&lng=-58.4096
// GET /api/geolocation?action=nearby&lat=-34.5875&lng=-58.4096&type=doctor&radius=5000

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, sanitizeBody } from "@/lib/security/api-guard";
import { requireAuth } from "@/lib/security/require-auth";
import { logger } from "@/lib/logger";
import { nearbyPlacesSearch, GOOGLE_MAPS_API_KEY } from "@/lib/google";

// ─── Helpers ─────────────────────────────────────────────────

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function parseCoords(url: URL): { lat: number; lng: number } | null {
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lng = parseFloat(url.searchParams.get("lng") ?? "");

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

// ─── Reverse Geocode (coords → neighbourhood name) ──────────

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  // If no Google key configured, fall back to a simple mock
  if (!GOOGLE_MAPS_API_KEY) {
    return estimateLocality(lat, lng);
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("latlng", `${lat},${lng}`);
    url.searchParams.set("result_type", "neighborhood|locality|sublocality");
    url.searchParams.set("language", "es");
    url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) return estimateLocality(lat, lng);

    const data = await res.json();
    if (data.status !== "OK" || !data.results?.length) {
      return estimateLocality(lat, lng);
    }

    // Extract most specific locality
    for (const result of data.results) {
      for (const comp of result.address_components ?? []) {
        if (
          comp.types.includes("sublocality_level_1") ||
          comp.types.includes("neighborhood") ||
          comp.types.includes("locality")
        ) {
          return comp.long_name;
        }
      }
    }

    return data.results[0]?.formatted_address?.split(",")[0] ?? null;
  } catch (err) {
    logger.warn({ error: String(err) }, "Reverse geocode failed");
    return estimateLocality(lat, lng);
  }
}

// ─── Nearby Places — uses shared helper from @/lib/google ───

// ─── Fallback locality estimator (no API key needed) ─────────

function estimateLocality(lat: number, lng: number): string | null {
  // Simple CABA neighbourhood estimator for demo purposes
  const barrios: { name: string; lat: number; lng: number }[] = [
    { name: "Belgrano", lat: -34.5627, lng: -58.4561 },
    { name: "Palermo", lat: -34.5795, lng: -58.4259 },
    { name: "Recoleta", lat: -34.588, lng: -58.3942 },
    { name: "Caballito", lat: -34.6189, lng: -58.4384 },
    { name: "Almagro", lat: -34.6098, lng: -58.4186 },
    { name: "Microcentro", lat: -34.6041, lng: -58.3816 },
    { name: "San Telmo", lat: -34.6216, lng: -58.371 },
    { name: "Núñez", lat: -34.5452, lng: -58.4568 },
    { name: "Villa Crespo", lat: -34.599, lng: -58.438 },
    { name: "Flores", lat: -34.6352, lng: -58.463 },
    { name: "Constitución", lat: -34.6272, lng: -58.383 },
    { name: "Villa Urquiza", lat: -34.571, lng: -58.487 },
  ];

  let closest = barrios[0];
  let minDist = Infinity;

  for (const b of barrios) {
    const d = Math.hypot(b.lat - lat, b.lng - lng);
    if (d < minDist) {
      minDist = d;
      closest = b;
    }
  }

  // Only return if reasonably close (within ~5 km)
  if (!closest) return null;
  return minDist < 0.05 ? closest.name : null;
}

// ─── GET handler ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  // Rate limit: 30 requests per 60 seconds
  const limited = checkRateLimit(req, "geolocation", { limit: 30, windowSec: 60 });
  if (limited) return limited;

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const coords = parseCoords(url);

  if (!coords) {
    return jsonError("Missing or invalid lat/lng parameters", 400);
  }

  switch (action) {
    case "reverse-geocode": {
      const locality = await reverseGeocode(coords.lat, coords.lng);
      return NextResponse.json({
        locality,
        lat: coords.lat,
        lng: coords.lng,
      });
    }

    case "nearby": {
      const type = url.searchParams.get("type") ?? "doctor";
      const radius = Math.min(
        parseInt(url.searchParams.get("radius") ?? "5000", 10),
        50_000, // max 50 km
      );

      const places = await nearbyPlacesSearch(coords.lat, coords.lng, type, radius);
      return NextResponse.json({
        places,
        count: places.length,
        center: { lat: coords.lat, lng: coords.lng },
        radiusMetres: radius,
      });
    }

    default:
      return jsonError("Unknown action. Use 'reverse-geocode' or 'nearby'.", 400);
  }
}
