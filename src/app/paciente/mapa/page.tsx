"use client";

// ─── Doctor Map Page ─────────────────────────────────────────
// Google Maps integration with doctor pins, specialty filter,
// and doctor info cards. Ported from frontend/src/screens/MapScreen.tsx.

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapPin,
  Search,
  X,
  Star,
  Phone,
  Globe,
  Navigation,
  Loader2,
  Filter,
  ChevronDown,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

interface DoctorPin {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviewCount: number;
  specialty?: string;
  phone?: string | null;
  website?: string | null;
  photoRef?: string | null;
  isOpenNow?: boolean | null;
}

// ─── Constants ───────────────────────────────────────────────

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires
const SPECIALTIES = [
  "Todas",
  "Cardiología",
  "Dermatología",
  "Ginecología",
  "Neurología",
  "Oftalmología",
  "Pediatría",
  "Psicología",
  "Traumatología",
  "Clínica Médica",
  "Odontología",
];

const RADIUS_OPTIONS = [
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];

export default function MapaPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [doctors, setDoctors] = useState<DoctorPin[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorPin | null>(null);
  const [specialty, setSpecialty] = useState("Todas");
  const [radius, setRadius] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  const [showFilters, setShowFilters] = useState(false);

  // ── Get user location ──────────────────────────────────────
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Use default if denied
        },
      );
    }
  }, []);

  // ── Initialize Google Map ──────────────────────────────────
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey || !mapRef.current) return;

    // Load Google Maps script if not already loaded
    if (typeof google === "undefined" || !google.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  function initMap() {
    if (!mapRef.current) return;
    const map = new google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 14,
      styles: [
        { featureType: "poi.medical", stylers: [{ visibility: "on" }] },
        { featureType: "poi.business", stylers: [{ visibility: "off" }] },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // User location marker
    new google.maps.Marker({
      position: userLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#3B82F6",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
      title: "Tu ubicación",
    });

    googleMapRef.current = map;
  }

  // ── Update map markers ─────────────────────────────────────
  const updateMarkers = useCallback(
    function updateMarkersInner(pins: DoctorPin[]) {
      // Clear old markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const map = googleMapRef.current;
      if (!map) return;

      pins.forEach((pin) => {
        if (!pin.lat || !pin.lng) return;
        const marker = new google.maps.Marker({
          position: { lat: pin.lat, lng: pin.lng },
          map,
          title: pin.name,
          icon: {
            url:
              "data:image/svg+xml," +
              encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
              <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" fill="#2563eb"/>
              <circle cx="16" cy="14" r="6" fill="white"/>
            </svg>
          `),
            scaledSize: new google.maps.Size(32, 40),
          },
        });

        marker.addListener("click", () => {
          setSelectedDoctor(pin);
          map.panTo({ lat: pin.lat, lng: pin.lng });
        });

        markersRef.current.push(marker);
      });

      // Fit bounds
      if (pins.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        pins.forEach((p) => {
          if (p.lat && p.lng) bounds.extend({ lat: p.lat, lng: p.lng });
        });
        bounds.extend(userLocation);
        map.fitBounds(bounds);
      }
    },
    [userLocation],
  );

  // ── Search doctors ─────────────────────────────────────────
  const searchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const specialtyParam = specialty === "Todas" ? "Clínica Médica" : specialty;
      const res = await fetch(
        `/api/doctors/search?specialty=${encodeURIComponent(specialtyParam)}&nearby=true&lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`,
      );
      const data = await res.json();
      const pins: DoctorPin[] = (data.doctors || data.results || []).map(
        (d: Record<string, unknown>) => ({
          placeId: d.placeId || d.place_id,
          name: d.name,
          address: d.address || d.formatted_address,
          lat: d.lat || (d.location as Record<string, number>)?.lat,
          lng: d.lng || (d.location as Record<string, number>)?.lng,
          rating: d.rating,
          reviewCount: d.reviewCount || d.user_ratings_total || 0,
          phone: d.phone,
          website: d.website,
          photoRef: d.photoRef,
          isOpenNow: d.isOpenNow,
        }),
      );
      setDoctors(pins);
      updateMarkers(pins);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [specialty, radius, userLocation, updateMarkers]);

  useEffect(() => {
    searchDoctors();
  }, [searchDoctors]);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {/* ── Map container ─────────────────────────────────── */}
      <div ref={mapRef} className="h-full w-full" />

      {/* ── Search / Filter overlay ───────────────────────── */}
      <div className="absolute left-4 right-4 top-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-lg">
          <Search className="ml-2 h-5 w-5 text-gray-400" />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="flex-1 bg-transparent py-2 text-sm outline-none"
            aria-label="Especialidad"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg bg-celeste-50 p-2 text-celeste-dark"
            aria-label="Filtros"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {showFilters && (
          <div className="rounded-xl bg-white p-3 shadow-lg">
            <p className="mb-2 text-xs font-medium text-gray-500">Radio de búsqueda</p>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRadius(r.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    radius === r.value
                      ? "bg-celeste text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Loading indicator ─────────────────────────────── */}
      {loading && (
        <div className="absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-full bg-white px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Buscando médicos cercanos...
          </div>
        </div>
      )}

      {/* ── Results count ─────────────────────────────────── */}
      {!loading && doctors.length > 0 && (
        <div className="absolute bottom-24 left-4 z-10">
          <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow">
            {doctors.length} médico{doctors.length !== 1 ? "s" : ""} encontrado
            {doctors.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* ── Doctor card overlay ───────────────────────────── */}
      {selectedDoctor && (
        <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl bg-white p-4 shadow-xl">
          <button
            onClick={() => setSelectedDoctor(null)}
            className="absolute right-3 top-3 rounded-full bg-gray-100 p-1"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>

          <h3 className="text-base font-bold text-gray-900">{selectedDoctor.name}</h3>

          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{selectedDoctor.address}</span>
          </div>

          {selectedDoctor.rating && (
            <div className="mt-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{selectedDoctor.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({selectedDoctor.reviewCount})</span>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            {selectedDoctor.phone && (
              <a
                href={`tel:${selectedDoctor.phone}`}
                className="flex items-center gap-1.5 rounded-lg bg-celeste-50 px-3 py-2 text-xs font-medium text-celeste-dark"
              >
                <Phone className="h-3.5 w-3.5" /> Llamar
              </a>
            )}
            {selectedDoctor.website && (
              <a
                href={selectedDoctor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700"
              >
                <Globe className="h-3.5 w-3.5" /> Web
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedDoctor.lat},${selectedDoctor.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700"
            >
              <Navigation className="h-3.5 w-3.5" /> Cómo llegar
            </a>
          </div>
        </div>
      )}

      {/* ── No API key fallback ───────────────────────────── */}
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">
              Google Maps no está configurado.
              <br />
              Agregue NEXT_PUBLIC_GOOGLE_MAPS_KEY a las variables de entorno.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
