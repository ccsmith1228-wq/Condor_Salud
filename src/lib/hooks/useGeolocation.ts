// ─── Geolocation Hook ────────────────────────────────────────
// Custom React hook wrapping the browser Geolocation API.
// Provides coordinates, loading/error states, permission handling,
// and localStorage caching for the patient webapp.
//
// Usage:
//   const { coords, loading, error, refresh, permissionState } = useGeolocation();
//   if (coords) console.log(coords.latitude, coords.longitude);

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────

export interface GeoCoords {
  latitude: number;
  longitude: number;
  accuracy: number; // metres
}

export interface GeoLocationInfo extends GeoCoords {
  /** Reverse-geocoded neighbourhood / locality (if resolved) */
  locality?: string;
  /** Timestamp of last successful fix */
  timestamp: number;
}

export interface UseGeolocationReturn {
  /** Current coordinates (null until resolved) */
  coords: GeoLocationInfo | null;
  /** True while actively querying the browser API */
  loading: boolean;
  /** Human-readable error message (null when OK) */
  error: string | null;
  /** Browser permission state: "granted" | "denied" | "prompt" | null */
  permissionState: PermissionState | null;
  /** Manually re-query position */
  refresh: () => void;
  /** True when the position came from cache rather than a live fix */
  fromCache: boolean;
}

// ─── Constants ───────────────────────────────────────────────

const CACHE_KEY = "condor_geolocation";
/** Cache is considered fresh for 10 minutes */
const CACHE_TTL_MS = 10 * 60 * 1000;
/** Browser API timeout */
const GEO_TIMEOUT_MS = 15_000;

// ─── Helpers ─────────────────────────────────────────────────

function readCache(): GeoLocationInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: GeoLocationInfo = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function writeCache(info: GeoLocationInfo): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(info));
  } catch {
    // Quota exceeded — ignore
  }
}

function geoErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Permiso de ubicación denegado. Habilitalo en la configuración de tu navegador.";
    case err.POSITION_UNAVAILABLE:
      return "No se pudo determinar tu ubicación. Intentá de nuevo.";
    case err.TIMEOUT:
      return "La solicitud de ubicación tardó demasiado. Intentá de nuevo.";
    default:
      return "Error desconocido al obtener ubicación.";
  }
}

// ─── Hook ────────────────────────────────────────────────────

export function useGeolocation(options?: {
  /** Skip automatic query on mount (default false) */
  lazy?: boolean;
  /** Enable high-accuracy (GPS) — uses more battery (default false) */
  highAccuracy?: boolean;
}): UseGeolocationReturn {
  const { lazy = false, highAccuracy = false } = options ?? {};

  const [coords, setCoords] = useState<GeoLocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const mounted = useRef(true);

  // ── Permission listener ──────────────────────────────────
  useEffect(() => {
    let permStatus: PermissionStatus | null = null;

    async function checkPermission() {
      try {
        permStatus = await navigator.permissions.query({ name: "geolocation" });
        if (mounted.current) setPermissionState(permStatus.state);

        const onChange = () => {
          if (mounted.current && permStatus) {
            setPermissionState(permStatus.state);
          }
        };
        permStatus.addEventListener("change", onChange);
      } catch {
        // permissions API not supported — leave null
      }
    }

    checkPermission();

    return () => {
      mounted.current = false;
    };
  }, []);

  // ── Query position ───────────────────────────────────────
  const queryPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mounted.current) return;
        const info: GeoLocationInfo = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        setCoords(info);
        setFromCache(false);
        setLoading(false);
        writeCache(info);
      },
      (err) => {
        if (!mounted.current) return;
        setError(geoErrorMessage(err));
        setLoading(false);
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: CACHE_TTL_MS,
      },
    );
  }, [highAccuracy]);

  // ── Auto-query on mount (unless lazy) ────────────────────
  useEffect(() => {
    // Try cache first
    const cached = readCache();
    if (cached) {
      setCoords(cached);
      setFromCache(true);
    }

    if (!lazy) {
      queryPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazy]);

  return {
    coords,
    loading,
    error,
    permissionState,
    refresh: queryPosition,
    fromCache,
  };
}
