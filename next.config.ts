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
      // ⚠️ CRÍTICO — NÃO REMOVER ⚠️
      // O HTML proxiado de /auth, /portal e /relatorio (vindo do outbank-one)
      // referencia chunks JS/CSS via paths absolutos `/_next/static/...`.
      // Esses chunks NÃO existem no build do snc-site (só existem no outbank-one).
      // Sem este redirect, /auth/sign-in carrega o HTML mas o JS faz 404 →
      // hidratação falha → o formulário de login não aparece.
      //
      // Usamos REDIRECT 302 (não rewrite) porque rewrite de /_next/static
      // dispara MIDDLEWARE_INVOCATION_FAILED no edge runtime do Vercel.
      // Cross-origin é seguro: os assets já servem com Access-Control-Allow-Origin: *.
      //
      // Histórico: removido no commit efb4cc6, restaurado após bug do auth/sign-in.
      {
        source: "/_next/static/:path*",
        destination: `${PORTAL_URL}/_next/static/:path*`,
        permanent: false,
      },
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
