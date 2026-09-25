import type { NextConfig } from "next";

/**
 * The bucket's public host, derived from R2_PUBLIC_URL rather than hardcoded.
 *
 * That variable is the single source of truth for where files are served from,
 * so moving from the r2.dev development subdomain to cdn.matildecrisp.com is
 * an env change with no code edit — and there is no wildcard here that would
 * let the optimizer fetch from hosts we do not control.
 */
const storageHost = (() => {
  const url = process.env.R2_PUBLIC_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    throw new Error(`R2_PUBLIC_URL is not a valid URL: ${url}`);
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // R2 keys are never reused, so a replaced file is always a new URL and a
    // one-year cache needs no invalidation story.
    minimumCacheTTL: 31536000,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(storageHost
        ? [
            {
              protocol: "https" as const,
              hostname: storageHost,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
