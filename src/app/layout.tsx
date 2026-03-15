import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import { PlanProvider } from "@/lib/plan-context";
import { SWRProvider } from "@/lib/swr";
import Chatbot from "@/components/Chatbot";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://condorsalud.com";

export const metadata: Metadata = {
  title: {
    default: "Cóndor Salud — Volá más alto",
    template: "%s | Cóndor Salud",
  },
  description:
    "Plataforma unificada de inteligencia para el sistema de salud argentino. PAMI, obras sociales, prepagas en un solo dashboard.",
  metadataBase: new URL(baseUrl),
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Cóndor Salud — Volá más alto",
    description: "Conectamos PAMI, obras sociales, prepagas y AFIP en una plataforma unificada.",
    type: "website",
    siteName: "Cóndor Salud",
    locale: "es_AR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cóndor Salud" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cóndor Salud — Volá más alto",
    description: "Conectamos PAMI, obras sociales, prepagas y AFIP en una plataforma unificada.",
    images: ["/og-image.png"],
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
    <html lang="es" dir="ltr" className={dmSans.variable}>
      <body className="bg-white text-ink font-body antialiased">
        <SWRProvider>
          <PlanProvider>
            <AuthProvider>
              {children}
              <Chatbot />
            </AuthProvider>
          </PlanProvider>
        </SWRProvider>
      </body>
    </html>
  );
}
