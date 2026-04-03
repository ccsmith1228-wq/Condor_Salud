// ─── SEO Layout for /reservar/[slug] ─────────────────────────
// Server component that fetches clinic data and generates
// rich Open Graph + JSON-LD metadata for social sharing.

import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/env";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

// ─── Dynamic Metadata ────────────────────────────────────────

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://condorsalud.com";

  // Default metadata (used when Supabase is not configured)
  let clinicName = "Clínica";
  let clinicAddress = "";
  let clinicDescription = "";
  let doctorCount = 0;
  let specialties: string[] = [];

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      const { data: clinic } = await sb
        .from("clinics")
        .select("name, address, description")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (clinic) {
        clinicName = clinic.name || clinicName;
        clinicAddress = clinic.address || "";
        clinicDescription = clinic.description || "";
      }

      // Count active doctors + unique specialties
      const { data: doctors } = await sb
        .from("doctors")
        .select("name, specialty")
        .eq("clinic_id", (await sb.from("clinics").select("id").eq("slug", slug).single()).data?.id)
        .eq("active", true);

      if (doctors) {
        doctorCount = doctors.length;
        specialties = Array.from(new Set(doctors.map((d) => d.specialty).filter(Boolean)));
      }
    } catch {
      // Fallback to defaults
    }
  }

  const title = `Reservar Turno — ${clinicName} | Cóndor Salud`;
  const description =
    clinicDescription ||
    (doctorCount > 0
      ? `Reservá tu turno online en ${clinicName}. ${doctorCount} profesionales disponibles${specialties.length > 0 ? ` en ${specialties.slice(0, 5).join(", ")}` : ""}. ${clinicAddress ? `📍 ${clinicAddress}` : ""}`
      : `Reservá tu turno médico online en ${clinicName} a través de Cóndor Salud. Rápido, seguro y sin esperas.`);

  const url = `${baseUrl}/reservar/${slug}`;
  const ogImage = `${baseUrl}/logos/condor-og.png`;

  return {
    title,
    description,
    keywords: [
      "turno médico",
      "reservar turno",
      clinicName,
      "Cóndor Salud",
      "médico online",
      ...specialties.slice(0, 5),
      clinicAddress ? clinicAddress.split(",")[0] : undefined,
    ].filter((k): k is string => Boolean(k)),
    openGraph: {
      title,
      description,
      url,
      siteName: "Cóndor Salud",
      type: "website",
      locale: "es_AR",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Reservar turno en ${clinicName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ─── JSON-LD Structured Data ─────────────────────────────────

async function ClinicJsonLd({ slug }: { slug: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://condorsalud.com";

  let clinicName = "Clínica";
  let clinicAddress = "";
  let clinicPhone = "";

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      const { data: clinic } = await sb
        .from("clinics")
        .select("name, address, phone")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (clinic) {
        clinicName = clinic.name || clinicName;
        clinicAddress = clinic.address || "";
        clinicPhone = clinic.phone || "";
      }
    } catch {
      // fallback
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: clinicName,
    url: `${baseUrl}/reservar/${slug}`,
    ...(clinicAddress && {
      address: {
        "@type": "PostalAddress",
        streetAddress: clinicAddress,
        addressCountry: "AR",
      },
    }),
    ...(clinicPhone && { telephone: clinicPhone }),
    medicalSpecialty: "GeneralPractice",
    availableService: {
      "@type": "MedicalProcedure",
      name: "Reserva de Turno Online",
      description: `Reservá tu turno online en ${clinicName} a través de Cóndor Salud.`,
    },
    potentialAction: {
      "@type": "ReserveAction",
      target: `${baseUrl}/reservar/${slug}`,
      name: "Reservar Turno",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Layout ──────────────────────────────────────────────────

export default async function ReservarSlugLayout({ children, params }: LayoutProps) {
  const { slug } = await params;

  return (
    <>
      <ClinicJsonLd slug={slug} />
      {children}
    </>
  );
}
