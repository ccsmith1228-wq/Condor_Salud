import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Healthcare for American Travelers in Argentina | Cóndor Salud",
  description:
    "Cóndor Salud provides American tourists in Argentina with immediate access to 2,800+ doctors, 24/7 telemedicine in English, pharmacy delivery, and emergency coordination — all for a one-time fee of USD 30.",
  openGraph: {
    title: "Healthcare for American Travelers in Argentina | Cóndor Salud",
    description:
      "Immediate healthcare access for U.S. citizens visiting Argentina. 2,800+ doctors, English-first telemedicine, pharmacy delivery. USD 30 one-time.",
    url: "https://condorsalud.com/acs",
    type: "website",
  },
  alternates: {
    canonical: "https://condorsalud.com/acs",
  },
};

export default function AmericanTravelersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
