import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cóndor Health Club — Membership Plans",
  description:
    "Join Cóndor Health Club for prescription discounts up to 30%, unlimited teleconsultas, priority AI triage with Cora, and medication delivery. Plans from $5 USD/month.",
  openGraph: {
    title: "Cóndor Health Club — Prescription Discounts & Teleconsulta",
    description:
      "Membership plans starting at $5 USD/month. Up to 30% off prescriptions, teleconsultas, medication delivery, and 24/7 AI triage.",
    url: "https://condorsalud.com/club",
    type: "website",
  },
  alternates: { canonical: "https://condorsalud.com/club" },
};

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
