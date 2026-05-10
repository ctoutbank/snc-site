#!/usr/bin/env bash
# Smoke test: garante que /auth/sign-in funciona end-to-end.
#
# O proxy serve o HTML de /auth/sign-in com chunks /_next/static que vivem no
# outbank-one. Se o redirect /_next/static/* for removido por engano, esse
# script detecta IMEDIATAMENTE — basta rodar antes de cada deploy.
#
# Uso: ./scripts/smoke-test-auth.sh [https://snc.consolle.one]
set -euo pipefail

BASE="${1:-https://snc.consolle.one}"
echo "🔍 Smoke test em: $BASE"

# 1. /auth/sign-in retorna HTML com referência a chunks
HTML=$(curl -sf "$BASE/auth/sign-in") || { echo "❌ /auth/sign-in não respondeu 2xx"; exit 1; }
CHUNK=$(echo "$HTML" | grep -oE 'src="/_next/static/chunks/[^"]+\.js"' | head -1 | sed 's/src="//;s/"//')

if [ -z "$CHUNK" ]; then
  echo "❌ HTML de /auth/sign-in não contém referências a /_next/static — proxy /auth quebrou"
  exit 1
fi
echo "  ✓ HTML carregou com chunk: $CHUNK"

# 2. O chunk DEVE carregar (via redirect para outbank-one)
HTTP=$(curl -sLo /dev/null -w "%{http_code}" "$BASE$CHUNK")
if [ "$HTTP" != "200" ]; then
  echo "❌ $CHUNK retornou $HTTP — falta o redirect /_next/static/* no next.config.ts"
  echo "   Veja o comentário no arquivo: ⚠️ CRÍTICO — NÃO REMOVER ⚠️"
  exit 1
fi
echo "  ✓ Chunk carregou (200) — auth/sign-in deve hidratar corretamente"

echo "✅ Smoke test passou"
