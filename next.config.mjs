import { withSentryConfig } from "@sentry/nextjs";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  output: process.env.DOCKER === "true" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
    ],
  },
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
          // SH-07: CSP is now set dynamically by middleware with per-request nonces.
          // Do NOT add a static CSP header here — it would conflict with the nonce-based one.
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
