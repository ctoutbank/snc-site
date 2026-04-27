import type { NextConfig } from "next";

const PORTAL_URL = process.env.PORTAL_PROXY_URL || "https://outbank.cloud";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blog", destination: "/artigos", permanent: true },
      { source: "/blog/:slug", destination: "/artigos/:slug", permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: `${PORTAL_URL}/auth/:path*`,
      },
      {
        source: "/portal/:path*",
        destination: `${PORTAL_URL}/portal/:path*`,
      },
      // REMOVIDO: /_next/static — causava MIDDLEWARE_INVOCATION_FAILED
      // REMOVIDO: /api/:path* — conflitava com /api/contact local
      {
        source: "/icon",
        destination: `${PORTAL_URL}/icon`,
      },
    ];
  },
};

export default nextConfig;
