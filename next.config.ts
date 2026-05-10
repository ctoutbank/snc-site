import type { NextConfig } from "next";

// 🔴 IMPORTANTE — IDENTIDADE DO PRODUTO
// O PRODUTO chama-se `consolle.one` (ISOs: snc.consolle.one, bancoprisma.consolle.one, etc).
// `outbank.cloud` é APENAS o hostname técnico/legado onde está hospedado o backend e
// também é usado como domínio de marketing institucional.
// NÃO use "outbank.cloud" para se referir ao SISTEMA — em UI, docs, conversas com o
// usuário, ou comentários descrevendo o produto, use SEMPRE `consolle.one`.
// Aqui aparece apenas como configuração técnica de proxy. Veja CLAUDE.md.
const PORTAL_URL = process.env.PORTAL_PROXY_URL || "https://outbank.cloud";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blog", destination: "/artigos", permanent: true },
      { source: "/blog/:slug", destination: "/artigos/:slug", permanent: true },
      // ⚠️ CRÍTICO — NÃO REINTRODUZIR redirect global de /_next/static/* aqui ⚠️
      //
      // Histórico:
      // - Antes existia um `redirect: /_next/static/:path* → outbank.cloud/_next/static/:path*`
      //   para fazer o /auth/sign-in funcionar (chunks vinham do HTML proxiado).
      // - PROBLEMA: esse redirect global pegava TAMBÉM os chunks LOCAIS do snc-site
      //   (home, artigos, lgpd, /relatorio/snc/exemplo) — todas paginas locais ficavam
      //   sem hidratar React, botões/menus travavam.
      //
      // SOLUÇÃO ATUAL: src/middleware.ts faz a decisão de forma SELETIVA via Referer:
      //   - Chunk veio de página proxiada (auth/portal/relatorio/snc/[id])  →  redireciona
      //   - Chunk veio de página local                                       →  serve local
      //
      // Veja src/middleware.ts e CLAUDE.md.
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
      // Proxy do relatório SNC para outbank-one (inclui /relatorio/snc/exemplo)
      {
        source: "/relatorio/:path*",
        destination: `${PORTAL_URL}/relatorio/:path*`,
      },
    ];
  },
};

export default nextConfig;
