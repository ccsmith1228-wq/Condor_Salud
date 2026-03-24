import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/services/doctor-profiles";

// L-23: Use env var for base URL instead of hardcoding
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://condorsalud.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    // Public marketing pages
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    // Q-06: Include /planes page
    {
      url: `${BASE_URL}/planes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Partners page (B2B travel partnership)
    {
      url: `${BASE_URL}/partnerships`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Health Club membership plans
    {
      url: `${BASE_URL}/club`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // American travelers (embassy endorsement page)
    {
      url: `${BASE_URL}/acs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Public doctor directory
    {
      url: `${BASE_URL}/medicos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    // L-24: Removed /auth/* pages (not useful for SEO crawlers)
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terminos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic doctor profile pages
  let doctorPages: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllSlugs();
    doctorPages = slugs.map((slug) => ({
      url: `${BASE_URL}/medicos/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // If DB not available yet, skip dynamic pages
  }

  return [...staticPages, ...doctorPages];
}
