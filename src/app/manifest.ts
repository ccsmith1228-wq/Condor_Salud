import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cóndor Salud",
    short_name: "Cóndor",
    description: "Plataforma unificada de inteligencia para el sistema de salud argentino",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#75AADB",
    lang: "es",
    dir: "ltr",
    categories: ["medical", "business", "productivity"],
    prefer_related_applications: false,
    icons: [
      { src: "/favicon.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        label: "Dashboard ejecutivo con KPIs en tiempo real",
      },
      {
        src: "/screenshots/mobile.png",
        sizes: "750x1334",
        type: "image/png",
        label: "Vista mobile del panel",
      },
    ] as any,
    shortcuts: [
      {
        name: "Panel",
        short_name: "Panel",
        url: "/dashboard",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Agenda",
        short_name: "Agenda",
        url: "/dashboard/agenda",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Facturación",
        short_name: "Facturación",
        url: "/dashboard/facturacion",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ] as any,
  };
}
