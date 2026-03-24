import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cóndor Salud — Investor Overview",
  description: "Private investor overview for Cóndor Salud.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  openGraph: {
    title: "Cóndor Salud — Investor Overview",
    description: "The all-in-one operating system for Argentine healthcare. Private overview.",
  },
};

export default function SieczkowskiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
