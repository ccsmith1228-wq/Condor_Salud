import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  output: process.env.DOCKER === "true" ? "standalone" : undefined,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(self), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // unsafe-inline required by Next.js hydration; strict-dynamic overrides it in CSP3 browsers
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://o4507.ingest.sentry.io https://*.daily.co wss://*.daily.co https://api.mercadopago.com https://*.upstash.io https://api.anthropic.com https://www.googleapis.com https://accounts.google.com https://*.posthog.com https://us.i.posthog.com https://*.sentry.io https://www.doctoraliar.com",
              "frame-src 'self' https://*.daily.co",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
              "report-uri /api/csp-report",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

// Wrap with Sentry only if DSN is configured
const sentryConfig = {
  // Suppresses source map upload logs during build
  silent: true,
  // Upload source maps for production builds
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only upload source maps when auth token is available
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
  // Prevents Sentry from erroring during build when DSN is not set
  widenClientFileUpload: true,
};

const analyzed = withBundleAnalyzer(nextConfig);

export default process.env.SENTRY_DSN
  ? withSentryConfig(analyzed, sentryConfig)
  : analyzed;
