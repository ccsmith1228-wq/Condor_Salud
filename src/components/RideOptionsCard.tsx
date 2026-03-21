/**
 * RideOptionsCard — Web component (ported from React Native)
 *
 * Shows Uber, Cabify, InDrive deep links pre-filled
 * with the doctor's address. Includes fare estimate badge.
 */

"use client";

import { useEffect } from "react";
import { useRideOptions, type RideOption } from "@/hooks/useRideOptions";
import { Car, Loader2, ExternalLink } from "lucide-react";

const APP_LOGOS: Record<string, string> = {
  uber: "U",
  cabify: "C",
  indrive: "iD",
};

const APP_COLORS: Record<string, string> = {
  uber: "bg-black text-white",
  cabify: "bg-violet-600 text-white",
  indrive: "bg-[#CCFF00] text-black",
};

interface Props {
  doctor: {
    name: string;
    address: string;
    lat?: number;
    lng?: number;
  };
  booking: {
    specialty?: string;
    date?: string;
    time?: string;
  };
  compact?: boolean;
}

export default function RideOptionsCard({ doctor, booking, compact = false }: Props) {
  const { rideOptions, loading, error, fetchOptions } = useRideOptions();

  useEffect(() => {
    fetchOptions({
      doctorName: doctor.name,
      address: doctor.address,
      destLat: doctor.lat,
      destLng: doctor.lng,
      specialty: booking.specialty,
      bookingDate: booking.date,
      bookingTime: booking.time,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor.address]);

  const openRide = (option: RideOption) => {
    // On web, always use webLink (deep links are mobile-only)
    window.open(option.webLink || option.smartLink, "_blank", "noopener");
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.round(seconds / 60);
    return `~${mins} min`;
  };

  // ── Compact version (inline bar) ──────────────────────────
  if (compact) {
    if (loading) {
      return (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-celeste-dark" />
          <span className="text-xs text-ink-muted">Cargando transporte...</span>
        </div>
      );
    }
    if (!rideOptions?.options) return null;

    const available = rideOptions.options.filter((o) => o.available);
    return (
      <div className="flex flex-wrap items-center gap-2 py-2">
        <span className="text-xs font-medium text-ink-500">Llegá al consultorio:</span>
        {available.map((option) => (
          <button
            key={option.app}
            onClick={() => openRide(option)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition hover:opacity-80 ${APP_COLORS[option.logo] || "bg-ink-100 text-ink"}`}
          >
            {option.app}
          </button>
        ))}
      </div>
    );
  }

  // ── Full card ─────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-border-light overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-light">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-celeste-dark" />
          <h3 className="text-sm font-semibold text-ink">¿Cómo llegás al consultorio?</h3>
        </div>
        <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{doctor.address}</p>
      </div>

      {/* Fare estimate badge */}
      {rideOptions?.fareEstimate && (
        <div className="px-4 py-2.5 bg-success-50 border-b border-border-light">
          <p className="text-xs font-medium text-success-700">
            Uber estimado: {rideOptions.fareEstimate.display}
            {rideOptions.fareEstimate.duration
              ? `  ·  ${formatDuration(rideOptions.fareEstimate.duration)}`
              : ""}
          </p>
          {rideOptions.fareEstimate.surge && (
            <p className="text-[11px] text-amber-600 mt-0.5">
              ⚡ Demanda alta ×{rideOptions.fareEstimate.surge.toFixed(1)}
            </p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 px-4 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-celeste-dark" />
          <span className="text-xs text-ink-muted">Preparando opciones...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && <p className="text-xs text-red-600 px-4 py-3">{error}</p>}

      {/* Ride options grid */}
      {!loading && rideOptions?.options && (
        <div className="divide-y divide-border-light">
          {rideOptions.options
            .filter((o) => o.available)
            .map((option) => (
              <button
                key={option.app}
                onClick={() => openRide(option)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface/50 transition text-left"
                style={{ borderLeftWidth: 3, borderLeftColor: option.color }}
              >
                {/* Logo circle */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: option.color }}
                >
                  <span className="text-xs font-bold" style={{ color: option.textColor || "#fff" }}>
                    {APP_LOGOS[option.logo] || option.app[0]}
                  </span>
                </div>

                {/* App name + note */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{option.app}</p>
                  {option.note && <p className="text-[11px] text-ink-muted">{option.note}</p>}
                </div>

                {/* Arrow */}
                <ExternalLink className="w-3.5 h-3.5 text-ink-200 shrink-0" />
              </button>
            ))}
        </div>
      )}

      {/* Footer */}
      {booking.date && (
        <div className="px-4 py-2.5 bg-surface text-center">
          <p className="text-xs font-medium text-ink-500">
            Turno: {booking.date} a las {booking.time}
          </p>
          <p className="text-[11px] text-ink-muted">
            La dirección del consultorio ya está precargada
          </p>
        </div>
      )}
    </div>
  );
}
