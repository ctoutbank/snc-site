#!/usr/bin/env bash
# Smoke test: garante que /auth/sign-in funciona end-to-end.
#
# A página /auth/sign-in é proxiada do backend (outbank-one). Os chunks JS
# referenciados no HTML vêm de /_next/static/* — esses chunks NÃO existem
# no build do snc-site, devem ser servidos pelo backend.
#
# O middleware (src/middleware.ts) decide via Referer se um chunk deve ser
# redirecionado para o backend. Este smoke test simula um browser real
# enviando o Referer correto.
#
# Uso: ./scripts/smoke-test-auth.sh [https://snc.consolle.one]
set -euo pipefail

BASE="${1:-https://snc.consolle.one}"
echo "🔍 Smoke test em: $BASE"

# 1. /auth/sign-in retorna HTML com referência a chunks
HTML=$(curl -sf "$BASE/auth/sign-in") || { echo "❌ /auth/sign-in não respondeu 2xx"; exit 1; }
CHUNK=$(echo "$HTML" | grep -oE '/_next/static/chunks/[^"\\]+\.js' | head -1)

if [ -z "$CHUNK" ]; then
  echo "❌ HTML de /auth/sign-in não contém referências a /_next/static — proxy /auth quebrou"
  exit 1
fi
echo "  ✓ HTML carregou com chunk: $CHUNK"

# 2. O chunk DEVE carregar (via middleware → redirect para backend)
# Simula um browser real: envia Referer da página /auth/sign-in
HTTP=$(curl -sLo /dev/null -w "%{http_code}" \
  -H "Referer: $BASE/auth/sign-in" \
  "$BASE$CHUNK")

if [ "$HTTP" != "200" ]; then
  echo "❌ $CHUNK retornou $HTTP (com Referer de /auth/sign-in)"
  echo "   O middleware em src/middleware.ts deveria ter redirecionado para o backend."
  echo "   Verifique se PROXIED_PATHS no middleware ainda casa com /auth/."
  exit 1
fi
echo "  ✓ Chunk carregou (200) via middleware → backend"

# 3. Verificação adicional: chunk LOCAL com Referer da home deve servir 200 local
HOME_HTML=$(curl -sf "$BASE/") || { echo "❌ Home / não respondeu 2xx"; exit 1; }
LOCAL_CHUNK=$(echo "$HOME_HTML" | grep -oE '/_next/static/chunks/[^"\\]+\.js' | head -1)

if [ -n "$LOCAL_CHUNK" ]; then
  HTTP_LOCAL=$(curl -so /dev/null -w "%{http_code}" \
    -H "Referer: $BASE/" \
    "$BASE$LOCAL_CHUNK")
  if [ "$HTTP_LOCAL" != "200" ]; then
    echo "❌ Chunk local $LOCAL_CHUNK retornou $HTTP_LOCAL (esperado 200, sem redirect)"
    echo "   O middleware está redirecionando chunks da home indevidamente."
    exit 1
  fi
  echo "  ✓ Chunk local da home serve 200 (sem redirect indevido)"
fi

echo "✅ Smoke test passou"
