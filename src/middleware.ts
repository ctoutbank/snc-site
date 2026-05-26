import { NextRequest, NextResponse } from "next/server";

// 🔴 CRÍTICO — NÃO REMOVER 🔴
//
// Decide se o chunk /_next/static/* deve ser servido localmente (snc-site)
// ou redirecionado para outbank.cloud (onde está o backend do consolle.one).
//
// Por que isso existe:
// - snc.consolle.one (snc-site) tem páginas LOCAIS (home, artigos, lgpd, /relatorio/snc/*)
//   cujos chunks JS estão em SEU build (snc-site/.next/static).
// - snc.consolle.one TAMBÉM proxia /auth, /portal do backend (outbank-one),
//   cujo HTML referencia chunks /_next/static/* que vivem no outbank-one.
// - Se redirecionarmos TODOS os /_next/static/* para outbank.cloud, quebramos as páginas locais.
// - Se NÃO redirecionarmos nada, /auth/sign-in não hidrata.
//
// Solução: usar o Referer para distinguir.
// - Referer = /auth ou /portal  →  redireciona para outbank.cloud
// - Referer = qualquer outra coisa (ou ausente)  →  serve local
//
// NOTA: /relatorio/* é totalmente LOCAL — não proxy. Não inclua aqui.

const PORTAL = process.env.PORTAL_PROXY_URL || "https://outbank.cloud";

// Regex de paths que são proxiados do backend
const PROXIED_PATHS = /\/(auth|portal)(\/|$)/;

export function middleware(req: NextRequest) {
  const refererHeader = req.headers.get("referer") || "";

  if (!refererHeader) return NextResponse.next();

  // Extrai apenas o pathname do Referer (ignorando origin/query)
  let refererPath = "";
  try {
    refererPath = new URL(refererHeader).pathname;
  } catch {
    return NextResponse.next();
  }

  if (PROXIED_PATHS.test(refererPath)) {
    // Chunk veio de uma página proxiada → vai buscar no outbank-one
    const target = new URL(req.nextUrl.pathname + req.nextUrl.search, PORTAL);
    return NextResponse.redirect(target, 307);
  }

  // Chunk veio de uma página LOCAL do snc-site → serve normal
  return NextResponse.next();
}

export const config = {
  // Apenas chunks JS/CSS estáticos do Next.js
  matcher: "/_next/static/:path*",
};
