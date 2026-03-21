/**
 * RideQuickLinks — Lightweight inline ride buttons
 *
 * Renders Uber / Cabify / InDrive pill buttons for any place
 * with an address. Builds deep links client-side (no API call).
 *
 * Use this for quick "how do I get there" links on any card
 * that shows a location (doctors, pharmacies, health centers).
 */

"use client";

import { useMemo } from "react";
import { Car } from "lucide-react";

interface Props {
  /** Destination display name */
  name: string;
  /** Full address string */
  address: string;
  /** Latitude (improves accuracy but optional) */
  lat?: number | null;
  /** Longitude (improves accuracy but optional) */
  lng?: number | null;
  /** Optional label override, default "Cómo llegar:" */
  label?: string;
  /** Show the car icon prefix */
  showIcon?: boolean;
}

interface QuickLink {
  app: string;
  url: string;
  className: string;
}

function buildLinks(address: string, lat?: number | null, lng?: number | null): QuickLink[] {
  // ── Uber
  const uberParams = new URLSearchParams();
  uberParams.set("action", "setPickup");
  uberParams.set("pickup", "my_location");
  if (lat && lng) {
    uberParams.set("dropoff[latitude]", String(lat));
    uberParams.set("dropoff[longitude]", String(lng));
  }
  if (address) {
    uberParams.set("dropoff[nickname]", "Consultorio");
    uberParams.set("dropoff[formatted_address]", address);
  }

  // ── Cabify
  const destLabel = encodeURIComponent(`"${address.replace(/"/g, "")}"`);
  const cabifyStops =
    lat && lng ? `stops[]=${lat},${lng},${destLabel}` : `stops[]=0,0,${destLabel}`;

  // ── InDrive
  const indriveParams = new URLSearchParams();
  indriveParams.set("destination", address);
  if (lat) indriveParams.set("dest_lat", String(lat));
  if (lng) indriveParams.set("dest_lng", String(lng));

  return [
    {
      app: "Uber",
      url: `https://m.uber.com/ul/?${uberParams.toString()}`,
      className: "bg-black text-white hover:bg-gray-800",
    },
    {
      app: "Cabify",
      url: `https://cabify.com/ride?${cabifyStops}`,
      className: "bg-violet-600 text-white hover:bg-violet-500",
    },
    {
      app: "InDrive",
      url: `https://indrive.com/deeplink/go?${indriveParams.toString()}`,
      className: "bg-[#CCFF00] text-black hover:bg-[#d4ff33]",
    },
  ];
}

export default function RideQuickLinks({ name, address, lat, lng, label, showIcon = true }: Props) {
  const links = useMemo(() => buildLinks(address, lat, lng), [address, lat, lng]);

  if (!address) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {showIcon && <Car className="w-3.5 h-3.5 text-ink-300 shrink-0" />}
      <span className="text-[11px] text-ink-400 shrink-0">{label ?? "Ir con:"}</span>
      {links.map((link) => (
        <a
          key={link.app}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${link.className}`}
          title={`Ir a ${name} con ${link.app}`}
        >
          {link.app}
        </a>
      ))}
    </div>
  );
}
