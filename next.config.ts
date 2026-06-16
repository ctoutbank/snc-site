import type { NextConfig } from "next";

// 🔴 IMPORTANTE — IDENTIDADE DO PRODUTO
// O PRODUTO chama-se `consolle.one`.
// - snc.consolle.one  → site institucional (este projeto)
// - app.consolle.one  → sistema/portal (snc-autoscore-next)
// NÃO misture os dois. O site não faz proxy para o sistema.
// Veja CLAUDE.md.

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blog", destination: "/artigos", permanent: true },
      { source: "/blog/:slug", destination: "/artigos/:slug", permanent: true },
      // Redireciona rotas antigas de login para o sistema
      { source: "/login", destination: "https://app.consolle.one/portal/login", permanent: false },
      { source: "/auth/:path*", destination: "https://app.consolle.one/portal/login", permanent: false },
    ];
  },
};

export default nextConfig;
