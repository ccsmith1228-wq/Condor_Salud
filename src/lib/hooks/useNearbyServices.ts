// ─── Nearby Services Hook ────────────────────────────────────
// Combines geolocation with service/provider data to return
// results sorted by proximity. Provides distance calculations
// and "near me" filtering for the patient webapp.
//
// Usage:
//   const { services, loading, locationName } = useNearbyServices();

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useGeolocation, type GeoCoords } from "./useGeolocation";

// ─── Types ───────────────────────────────────────────────────

export interface NearbyProvider {
  id: string;
  name: string;
  specialty: string;
  address: string;
  /** Known lat/lng for this provider (null = no geo data) */
  lat: number;
  lng: number;
  /** Distance from user in km (computed at query time) */
  distanceKm: number;
  phone?: string;
  teleconsulta: boolean;
  rating: number;
  availableToday: boolean;
  nextSlot?: string;
}

export interface NearbyPharmacy {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  phone?: string;
  open24h: boolean;
  hasDelivery: boolean;
}

export interface NearbyCenter {
  id: string;
  name: string;
  type: "hospital" | "clinica" | "laboratorio" | "guardia" | "centro_salud";
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  phone?: string;
  emergency: boolean;
}

export type NearbyServiceType = "providers" | "pharmacies" | "centers";

export interface NearbyResult {
  providers: NearbyProvider[];
  pharmacies: NearbyPharmacy[];
  centers: NearbyCenter[];
}

export interface UseNearbyServicesReturn {
  /** Nearby results grouped by type */
  results: NearbyResult;
  /** Whether geolocation or data is loading */
  loading: boolean;
  /** Error message (geo or data) */
  error: string | null;
  /** User's resolved neighbourhood/locality */
  locationName: string | null;
  /** Current coordinates */
  coords: GeoCoords | null;
  /** Refresh geolocation and re-sort */
  refresh: () => void;
  /** Max radius in km (default 10) */
  radiusKm: number;
  /** Update search radius */
  setRadiusKm: (km: number) => void;
}

// ─── Haversine distance ──────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Mock data (demo) ────────────────────────────────────────
// In production these come from the API / Supabase.

const DEMO_PROVIDERS: Omit<NearbyProvider, "distanceKm">[] = [
  {
    id: "doc-1",
    name: "Dra. Laura Méndez",
    specialty: "Clínica Médica",
    address: "Av. Cabildo 2040, Belgrano",
    lat: -34.5605,
    lng: -58.4563,
    teleconsulta: true,
    rating: 4.9,
    availableToday: true,
    nextSlot: "Hoy 14:30",
    phone: "+5491140001111",
  },
  {
    id: "doc-2",
    name: "Dr. Carlos Ruiz",
    specialty: "Cardiología",
    address: "Av. Santa Fe 3200, Palermo",
    lat: -34.5875,
    lng: -58.4096,
    teleconsulta: true,
    rating: 4.8,
    availableToday: false,
    nextSlot: "Mié 15:00",
    phone: "+5491140002222",
  },
  {
    id: "doc-3",
    name: "Dra. Sofía Peralta",
    specialty: "Dermatología",
    address: "Gorriti 4800, Palermo",
    lat: -34.588,
    lng: -58.428,
    teleconsulta: false,
    rating: 4.7,
    availableToday: true,
    nextSlot: "Hoy 16:00",
  },
  {
    id: "doc-4",
    name: "Dra. Valentina Castro",
    specialty: "Pediatría",
    address: "Av. Rivadavia 5200, Caballito",
    lat: -34.6186,
    lng: -58.4381,
    teleconsulta: true,
    rating: 4.9,
    availableToday: true,
    nextSlot: "Hoy 15:30",
    phone: "+5491140003333",
  },
];

const DEMO_PHARMACIES: Omit<NearbyPharmacy, "distanceKm">[] = [
  {
    id: "pharm-1",
    name: "Farmacity Belgrano",
    address: "Av. Cabildo 1900, Belgrano",
    lat: -34.561,
    lng: -58.455,
    phone: "+5491140004444",
    open24h: true,
    hasDelivery: true,
  },
  {
    id: "pharm-2",
    name: "Farmacia del Pueblo",
    address: "Av. Corrientes 3500, Almagro",
    lat: -34.605,
    lng: -58.415,
    phone: "+5491140005555",
    open24h: false,
    hasDelivery: true,
  },
  {
    id: "pharm-3",
    name: "Farmacia Suizo Argentina",
    address: "Av. Santa Fe 2100, Recoleta",
    lat: -34.595,
    lng: -58.396,
    phone: "+5491140006666",
    open24h: true,
    hasDelivery: false,
  },
];

const DEMO_CENTERS: Omit<NearbyCenter, "distanceKm">[] = [
  {
    id: "ctr-1",
    name: "Hospital Italiano",
    type: "hospital",
    address: "Tte. Gral. Juan D. Perón 4190, Almagro",
    lat: -34.6047,
    lng: -58.4215,
    phone: "+541149590200",
    emergency: true,
  },
  {
    id: "ctr-2",
    name: "Centro Médico Belgrano",
    type: "clinica",
    address: "Av. Cabildo 2500, Belgrano",
    lat: -34.558,
    lng: -58.461,
    phone: "+541147880100",
    emergency: false,
  },
  {
    id: "ctr-3",
    name: "Laboratorio Hidalgo",
    type: "laboratorio",
    address: "Av. Córdoba 3200, Palermo",
    lat: -34.599,
    lng: -58.41,
    phone: "+541148001234",
    emergency: false,
  },
  {
    id: "ctr-4",
    name: "Guardia SAME",
    type: "guardia",
    address: "Av. Entre Ríos 1200, Constitución",
    lat: -34.629,
    lng: -58.387,
    phone: "107",
    emergency: true,
  },
];

// ─── Reverse geocode (simple) ────────────────────────────────

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    // Use our API proxy so we don't expose the Google API key
    const res = await fetch(`/api/geolocation?action=reverse-geocode&lat=${lat}&lng=${lng}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.locality ?? null;
  } catch {
    return null;
  }
}

// ─── Hook ────────────────────────────────────────────────────

export function useNearbyServices(): UseNearbyServicesReturn {
  const geo = useGeolocation();
  const [radiusKm, setRadiusKm] = useState(10);
  const [locationName, setLocationName] = useState<string | null>(null);

  // Resolve locality name when coords change
  const coordLat = geo.coords?.latitude;
  const coordLng = geo.coords?.longitude;

  useEffect(() => {
    if (coordLat == null || coordLng == null) return;
    let cancelled = false;

    reverseGeocode(coordLat, coordLng).then((name) => {
      if (!cancelled && name) setLocationName(name);
    });

    return () => {
      cancelled = true;
    };
  }, [coordLat, coordLng]);

  // Compute distances and filter within radius
  const results = useMemo<NearbyResult>(() => {
    if (!geo.coords) {
      return { providers: [], pharmacies: [], centers: [] };
    }

    const { latitude: uLat, longitude: uLng } = geo.coords;

    function withDistance<T extends { lat: number; lng: number }>(
      items: Omit<T & { distanceKm: number }, "distanceKm">[],
    ): (T & { distanceKm: number })[] {
      return (items as (T & { distanceKm?: number })[])
        .map((item) => ({
          ...item,
          distanceKm: Math.round(haversineKm(uLat, uLng, item.lat, item.lng) * 10) / 10,
        }))
        .filter((item) => item.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm) as (T & { distanceKm: number })[];
    }

    return {
      providers: withDistance<NearbyProvider>(DEMO_PROVIDERS as NearbyProvider[]),
      pharmacies: withDistance<NearbyPharmacy>(DEMO_PHARMACIES as NearbyPharmacy[]),
      centers: withDistance<NearbyCenter>(DEMO_CENTERS as NearbyCenter[]),
    };
  }, [geo.coords, radiusKm]);

  return {
    results,
    loading: geo.loading,
    error: geo.error,
    locationName,
    coords: geo.coords,
    refresh: geo.refresh,
    radiusKm,
    setRadiusKm,
  };
}

// ─── Distance formatting helper ──────────────────────────────

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
