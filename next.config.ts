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
      // Mantém a rota local de contato intocada
      {
        source: "/api/contact",
        destination: "/api/contact",
      },
      // Faz proxy de TODAS as outras rotas da API para o outbank-one
      {
        source: "/api/:path*",
        destination: `${PORTAL_URL}/api/:path*`,
      },
      {
        source: "/icon",
        destination: `${PORTAL_URL}/icon`,
      },
    ];
  },
};

export default nextConfig;
