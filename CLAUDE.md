@AGENTS.md

# 🚨 REGRA INVIOLÁVEL — LER ANTES DE QUALQUER MUDANÇA 🚨

## snc.consolle.one é a alma do projeto

Os seguintes recursos **NUNCA podem ser sacrificados, quebrados ou ficar fora do ar** por nenhum comando, refactor, simplificação, "limpeza" ou qualquer outra mudança:

1. **`https://snc.consolle.one/`** — landing page institucional do SNC
2. **`https://snc.consolle.one/auth/sign-in`** — área de login (proxiada para outbank-one)
3. **Qualquer rota proxiada que afeta o login**: `/auth/*`, `/portal/*`, `/api/*`, `/_next/static/*`

## Antes de qualquer mudança que possa afetar esses recursos, PARE e AVISE o usuário

Mudanças que **exigem aviso explícito antes de executar** (mesmo que pareçam triviais):

- Editar `next.config.ts` (rewrites, redirects, headers, env vars)
- Editar/remover middleware.ts em snc-site OU outbank-one
- Editar `src/app/auth/**`, `src/app/portal/**`, `src/app/relatorio/**` em outbank-one
- Mudar variáveis de ambiente `PORTAL_PROXY_URL`, `NEXTAUTH_URL`, ou similares
- Atualizar Next.js, mudar `output`, `assetPrefix`, `basePath`
- Renomear/mover arquivos sob `src/app/auth` em qualquer dos dois repos
- Qualquer mudança em `src/lib/auth.ts` ou helpers de autenticação no outbank-one
- Deletar ou modificar redirects de `/_next/static/*` no `next.config.ts` do snc-site

## Smoke test obrigatório após mudanças

Antes de fechar qualquer task que tocou nos itens acima, rodar:

```bash
./scripts/smoke-test-auth.sh https://snc.consolle.one
```

Esse teste verifica end-to-end que `/auth/sign-in` carrega HTML + chunks JS sem 404.

## Histórico de quebras (para não repetir)

- **abr/2026** — commit `efb4cc6` removeu rewrite `/_next/static/*` por causa de `MIDDLEWARE_INVOCATION_FAILED`. Quebrou silenciosamente `/auth/sign-in` (HTML carregava, JS dava 404, formulário não aparecia). Restaurado em `84423a6` como redirect 302 (não rewrite).

## Arquitetura crítica (resumo)

- `snc-site` (este repo) → serve `snc.consolle.one`. Landing page Next.js standalone.
- `outbank-one` (`/Users/denisonzimmerdaluz/Documents/outbank-one`) → serve `outbank.cloud`. Tem o app real (auth, portal, banco de dados, relatórios).
- `snc-site` proxia `/auth`, `/portal`, `/api`, `/_next/static`, `/relatorio` para `outbank-one`.
- O domínio oficial do produto é `consolle.one` e seus ISOs (`snc.consolle.one` é um deles). `outbank.cloud` é apenas um nome de domínio do mesmo backend.
