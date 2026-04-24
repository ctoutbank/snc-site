import type { NextConfig } from "next";

// Outbank-One internal Vercel URL (sem custom domain, para proxy seguro)
const PORTAL_URL = process.env.PORTAL_PROXY_URL || "https://outbank-one.vercel.app";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /blog → /artigos (301 permanente para SEO)
      { source: "/blog", destination: "/artigos", permanent: true },
      { source: "/blog/:slug", destination: "/artigos/:slug", permanent: true },
    ];
  },
  async rewrites() {
    return [
      // Portal de autenticação — mantém snc.consolle.one/auth/sign-in funcionando
      {
        source: "/auth/:path*",
        destination: `${PORTAL_URL}/auth/:path*`,
      },
      // Portal principal — snc.consolle.one/portal/*
      {
        source: "/portal/:path*",
        destination: `${PORTAL_URL}/portal/:path*`,
      },
      // APIs do portal
      {
        source: "/api/:path*",
        destination: `${PORTAL_URL}/api/:path*`,
      },
      // Favicon dinâmico do tenant
      {
        source: "/icon",
        destination: `${PORTAL_URL}/icon`,
      },
      // Assets estáticos do portal (_next/static do outbank-one)
      {
        source: "/_next/static/:path*",
        destination: `${PORTAL_URL}/_next/static/:path*`,
      },
    ];
  },
};

export default nextConfig;
