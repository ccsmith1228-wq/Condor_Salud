import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth/context";
import { PlanProvider } from "@/lib/plan-context";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cóndor Salud — Volá más alto",
    template: "%s | Cóndor Salud",
  },
  description:
    "Plataforma unificada de inteligencia para el sistema de salud argentino. PAMI, obras sociales, prepagas en un solo dashboard.",
  metadataBase: new URL("https://condor-salud.vercel.app"),
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Cóndor Salud — Volá más alto",
    description: "Conectamos PAMI, obras sociales, prepagas y AFIP en una plataforma unificada.",
    type: "website",
    siteName: "Cóndor Salud",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cóndor Salud — Volá más alto",
    description: "Conectamos PAMI, obras sociales, prepagas y AFIP en una plataforma unificada.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#75AADB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" dir="ltr">
      <body className="bg-white text-ink font-body antialiased">
        <PlanProvider>
          <AuthProvider>
            {children}
            <Chatbot />
          </AuthProvider>
        </PlanProvider>
      </body>
    </html>
  );
}
