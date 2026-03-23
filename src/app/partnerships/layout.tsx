import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners — Healthcare for Travelers",
  description:
    "Partner with Cóndor Salud to offer your travelers full healthcare access in Argentina. 2,800+ doctors, telemedicine 24/7, pharmacy delivery — USD 30 per traveler.",
  openGraph: {
    title: "Partner With Cóndor Salud",
    description:
      "Offer your travelers healthcare in Argentina. 2,800+ doctors, 45+ specialties, telemedicine 24/7, pharmacy delivery — one-time USD 30 per traveler.",
    url: "https://condorsalud.com/partnerships",
  },
  alternates: { canonical: "https://condorsalud.com/partnerships" },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
