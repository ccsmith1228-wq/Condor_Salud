import type { MetadataRoute } from "next";

// L-23: Use env var for base URL instead of hardcoding
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://condorsalud.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
    // American travelers (embassy endorsement page)
    {
      url: `${BASE_URL}/acs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
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
}
