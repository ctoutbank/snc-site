# Precificação SNC — documentação técnica (`consolle.one`)

> Produto: **`consolle.one`** (ISO oficial `snc.consolle.one`).
> `outbank.cloud` é apenas o **hostname técnico/legado do backend** — nunca o nome do produto.

Tela documentada: **`https://snc.consolle.one/portal/admin/precificacao`**
(+ subtela de auditoria `…/precificacao/fechamento`).

---

## 0. ⚠️ Antes de tudo: onde este código mora (cross-repo)

Você provavelmente está lendo isto **dentro do repo `snc-site`**. Atenção:

> **O código da precificação NÃO está no `snc-site`.**
> Ele vive no backend **`outbank-one`**. O `snc-site` apenas faz **proxy** de
> `/portal/*` e `/api/*` para o backend (ver [§6](#6-como-o-snc-site-expõe-a-tela-proxy)).

| O que | Repo | Caminho absoluto |
|---|---|---|
| Esta documentação | `snc-site` | `/Users/denisonzimmerdaluz/Documents/snc-site/docs/precificacao.md` |
| Implementação da tela + lógica de preço | `outbank-one` | `/Users/denisonzimmerdaluz/Documents/outbank-one` |
| Regra de proxy que expõe a tela | `snc-site` | `next.config.ts` (rewrites) |

Todos os caminhos de arquivo neste documento prefixados com `outbank-one/…`
referem-se ao repo backend, **não** ao `snc-site`.

---

## 1. Para que serve

Cada consulta de bureau/dataset tem um **custo de fornecedor** (quanto pagamos ao
provedor de dados). Sobre esse custo o produto aplica **margens** para chegar ao
**preço final em BRL** cobrado do cliente.

- **`/portal/admin/precificacao`** → onde o `super_admin` (e editores delegados)
  **configuram as margens**.
- **`/portal/admin/precificacao/fechamento`** → onde se **audita o faturamento**
  (consultas × custo × margens × receita), filtrável por período/produto.

Modelo de negócio (perfis × usuários × margens): permissão vem da *categoria* do
usuário; participação no preço vem da *margem*. São eixos independentes.

---

## 2. Fornecedores de dados (suppliers)

Hoje existem **dois fornecedores de dados** alimentando as consultas SNC:

| Fornecedor | O que fornece | Cliente (no `outbank-one`) | Como o custo entra no preço |
|---|---|---|---|
| **BigDataCorp (BDC)** | ~70 datasets (cadastral, bureaus, jurídico, ESG, geo…) + bundle `superscore` | `outbank-one/src/server/integrations/bigdatacorp/client.ts` | **Custo por dataset** em `bdc-cost-map.ts` → vira `bdcBaseCost` |
| **ApiBrasil** | `apibrasil_scr_score` — **SCR Bacen + Score** (histórico de crédito no SFN), PF e PJ | `outbank-one/src/server/integrations/apibrasil/client.ts` | Ver [§10](#10-apibrasil-estado-atual-no-pricing-e-o-que-falta) — hoje **não tem custo próprio no catálogo**; cai no fallback |

> ⚠️ Não confundir com a abstração `provider-*`
> (`outbank-one/src/server/integrations/provider-registry.ts`, etc.): aquela é de
> **adquirência/sellers** (Dock, Zoop, Celcoin — onboarding e transações), e **não**
> tem relação com fornecedores de dados de consulta.

### ApiBrasil — cliente de dados

`outbank-one/src/server/integrations/apibrasil/client.ts` → função
`queryApiBrasilScrScore(doc)`:

```
POST https://gateway.apibrasil.io/api/v2/consulta/{cpf|cnpj}/credits
body: { tipo: "scr-bacen-score", cpf|cnpj: <doc>, homolog: <bool> }
Authorization: Bearer <APIBRASIL_BEARER_TOKEN>
```

- Dataset: `apibrasil_scr_score` ("SCR Bacen / Score"), `entity: "both"`, `isDefault: true`.
- Adapter de renderização: `outbank-one/src/features/apibrasil_scr_score/adapter.ts`.
- Roteamento/alias na consulta: `outbank-one/src/app/portal/snc/_components/snc-catch-all.tsx`
  (alias `ApiBrasilScrScore → apibrasil_scr_score`).

---

## 3. Modelo de preço em 3 camadas

Núcleo em `outbank-one/src/server/pricing/resolver.ts`:

```
finalPrice = bdcBaseCost + sncMarginAmount + customMarginAmount
```

| Camada | Origem | Quem edita |
|---|---|---|
| `bdcBaseCost` | custo de fornecedor (soma dos datasets do produto), via `getBdcCost()` | ninguém (fixo no código) |
| `sncMarginAmount` | margem `kind='SNC'` — singleton global | só `super_admin` |
| `customMarginAmount` | margem `kind='CUSTOM'` atribuída ao usuário | `super_admin` + editores delegados |

Cada item de margem é **`FIXED` (R$ absoluto)** ou **`PERCENT`** (decimal sobre o
`bdcBaseCost`; `0.20` = 20%).

`getBdcCost(apiName)` procura o custo nas 5 maps de
`outbank-one/src/server/integrations/bigdatacorp/bdc-cost-map.ts` e, se não achar,
cai em **`BDC_DEFAULT_COST = R$ 0,05`**.

---

## 4. Onde está cada arquivo (no `outbank-one`)

**UI**
- `src/app/portal/admin/precificacao/page.tsx` — server component (auth + carrega overview).
- `src/app/portal/admin/precificacao/_components/precificacao-client.tsx` — tabela
  produtos × margens, edição inline, busca, agrupamento por categoria, gestão de margens.
- `src/app/portal/admin/precificacao/fechamento/page.tsx` — KPIs + 3 tabelas (por margem, por produto, por usuário).

**Domínio / servidor**
- `src/features/pricing/types.ts` — tipos (`MarginRow`, `PricingOverview`, …).
- `src/features/pricing/server/pricing-actions.ts` — server actions (CRUD de margens/itens/usuários/editores) + `getPricingOverview`.
- `src/server/pricing/resolver.ts` — calcula `finalPrice` no momento da consulta.
- `src/server/pricing/products.ts` — catálogo `PRICING_PRODUCTS` + `getBdcBaseCostForProduct`.
- `src/server/pricing/product-labels.ts` — labels PT-BR, `category` e `entity` por dataset.
- `src/lib/auth/pricing-guard.ts` — `isSuperAdmin`, `canEditMargin`, `canViewMargin`.
- `src/lib/db/pricing-fechamento.ts` — agregações do fechamento.

**Fornecedores**
- `src/server/integrations/bigdatacorp/{client.ts,bdc-cost-map.ts}` — BDC.
- `src/server/integrations/apibrasil/client.ts` — ApiBrasil.
- `src/features/apibrasil_scr_score/adapter.ts` — adapter do dataset ApiBrasil.

**Banco**
- `src/drizzle/schema.ts` (a partir da linha ~3909) — as 5 tabelas `pricing_*`.

---

## 5. Configurações / env vars que o dev precisa ter

### 5.1 Backend `outbank-one` (onde a precificação roda de verdade)

| Var | Para quê | Obrigatória |
|---|---|---|
| `DATABASE_URL` | Postgres (tabelas `pricing_*`, usuários, ledger) | ✅ |
| `BIGDATACORP_ACCESS_TOKEN` | Fornecedor BDC — token de acesso | ✅ (p/ consultas BDC) |
| `BIGDATACORP_TOKEN_ID` | Fornecedor BDC — token id | ✅ (p/ consultas BDC) |
| `BIGDATACORP_API_URL` | Base URL BDC (default produção) | opcional |
| `APIBRASIL_BEARER_TOKEN` | **Fornecedor ApiBrasil** — Bearer do gateway SCR/Score | ✅ (p/ `apibrasil_scr_score`) |
| `APIBRASIL_HOMOLOG` | `"true"` = modo homologação ApiBrasil | opcional (default `false`) |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | sessão/auth do portal | ✅ |

> Sem `APIBRASIL_BEARER_TOKEN`, a consulta SCR/Score retorna
> `"APIBRASIL_BEARER_TOKEN não configurado"` e o dataset vem vazio.

### 5.2 Repo `snc-site` (proxy / landing)

| Var | Para quê |
|---|---|
| `PORTAL_PROXY_URL` | Destino do proxy de `/portal/*` e `/api/*` (default `https://outbank.cloud`, o backend) |
| `NEXT_PUBLIC_BASE_URL` | Base pública p/ links (`https://snc.consolle.one`) |
| `APIBRASIL_EMAIL` / `APIBRASIL_PASSWORD` | ⚠️ ApiBrasil **local do snc-site** (CNPJ/CEP/dados públicos na landing e `/relatorio`) — **credenciais e uso diferentes** do backend |
| `RESEND_API_KEY` | E-mail do formulário de contato |

> **Atenção à pegadinha:** o `snc-site` usa ApiBrasil com
> `APIBRASIL_EMAIL`/`APIBRASIL_PASSWORD` (uso institucional local). O dataset de
> precificação `apibrasil_scr_score` é do **backend `outbank-one`** e usa
> `APIBRASIL_BEARER_TOKEN`. São integrações ApiBrasil **distintas**, em repos
> distintos. Não copie um token para a var do outro.

### 5.3 Banco — migrations

As 5 tabelas `pricing_*` precisam existir no Postgres apontado por `DATABASE_URL`.
Schema fonte: `outbank-one/src/drizzle/schema.ts`. Aplique via o fluxo Drizzle do
backend antes de abrir a tela.

---

## 6. Como o `snc-site` expõe a tela (proxy)

Em `snc-site/next.config.ts`:

```ts
const PORTAL_URL = process.env.PORTAL_PROXY_URL || "https://outbank.cloud";

// rewrites():
{ source: "/portal/:path*", destination: `${PORTAL_URL}/portal/:path*?tenant=snc` }
{ source: "/api/:path*",    destination: `${PORTAL_URL}/api/:path*` }   // backend
// exceções servidas LOCALMENTE pelo snc-site:
//   /api/contact, /api/apibrasil/:path*, /relatorio/*
```

Logo, `snc.consolle.one/portal/admin/precificacao` é renderizada pelo `outbank-one`,
com o tenant `snc` injetado via querystring.

> 🚫 **Não** reintroduzir redirect global de `/_next/static/*` nem redirect por
> hostname (`outbank.cloud`) no `next.config.ts`/`middleware.ts` — já quebrou o
> `/auth/sign-in` e as imagens da plataforma no passado (ver `CLAUDE.md`).

---

## 7. Modelo de dados (5 tabelas `pricing_*`)

| Tabela | Papel |
|---|---|
| `pricing_margins` | A margem. `kind ∈ SNC \| CUSTOM`, `name`, `active` (soft delete). |
| `pricing_margin_items` | Uma linha **por produto** dentro da margem: `productCode`, `valueType`, `valueAmount(12,4)`. Único por `(idMargin, productCode)` → upsert. |
| `pricing_margin_users` | Vínculo usuário↔margem. Regra MVP: **1 margem ativa por usuário**. |
| `pricing_margin_editors` | Delegação: quem edita a margem custom sem ser `super_admin`. |
| `pricing_snapshots` | **Registro imutável por consulta** (auditoria). Congela o breakdown e é a fonte exclusiva do `/fechamento`. Único por `idConsultationLog`. |

---

## 8. Permissões

A rota só exige login; **a visibilidade fina é na camada de dados**:

- **`super_admin` (`fullAccess=true`)**: vê/edita tudo. Colunas `Custo`, `Margem SNC`
  e `Final` só aparecem para ele.
- **editor delegado**: edita as margens custom em que está listado.
- **recipient (usuário da margem)**: vê só a sua, read-only.
- **SNC** nunca é visível/editável por não-`super_admin`.
- No `/fechamento`, não-`super_admin` é restrito às **suas próprias** linhas
  (`customMarginId ∈ visíveis` **E** `idUser = user.id`).

---

## 9. Ciclo de vida do preço (snapshot)

1. Usuário faz uma consulta (ex.: SuperScore, ou `apibrasil_scr_score`).
2. `resolveFinalPrice(userId, productCode)` calcula o breakdown
   (custo + margem SNC + margem custom do usuário).
3. O valor é debitado do saldo (`sncCreditLedger`) e **um `pricing_snapshots` é inserido**
   (`outbank-one/src/features/bigdatacorp/server/bigdatacorp-actions.ts`).
4. `/fechamento` agrega os snapshots por margem/produto/usuário.

> Mudar uma margem **não** altera consultas passadas — snapshots são congelados.
> Só afeta consultas futuras.

---

## 10. ApiBrasil: estado atual no pricing e o que falta

**Estado atual (honesto):** a ApiBrasil já é fornecedora **na camada de consulta/dados**
(cliente + adapter + roteamento funcionando), mas **ainda não é um item de primeira
classe no catálogo de preços**:

- `apibrasil_scr_score` **não está** em `bdc-cost-map.ts` → no resolver cai no
  fallback **`BDC_DEFAULT_COST` (R$ 0,05)**.
- `apibrasil_scr_score` **não está** em `product-labels.ts` → **não aparece como linha**
  na tabela da tela de precificação nem no seletor do fechamento.
- O preço exibido no front (`…/consulta-cadastral/_components/_datasets.ts`) é um
  `price: 0.05` **hardcoded no client** (coincide com o fallback, mas não vem do catálogo).

**Checklist para promover ApiBrasil a fornecedor de 1ª classe no pricing:**

1. **Custo real do fornecedor** — adicionar `apibrasil_scr_score` a uma cost map (ou
   criar `apibrasil-cost-map.ts` e somá-la em `getBdcCost`/`getBdcBaseCostForProduct`),
   com o **custo real pago à ApiBrasil** (não o fallback).
2. **Catálogo/labels** — registrar `apibrasil_scr_score` em
   `product-labels.ts` (`label`, `category` p.ex. `MARKETPLACE_PF`/`MARKETPLACE_PJ`,
   `entity: "BOTH"`), para virar linha na tela e opção no fechamento.
3. **Snapshot** — garantir que a consulta `apibrasil_scr_score` grava `pricing_snapshots`
   (como já ocorre para datasets BDC), para entrar no fechamento.
4. **Front** — trocar o `price` hardcoded por leitura do catálogo, evitando divergência.
5. *(Opcional)* generalizar o nome `bdcBaseCost` para um conceito multi-fornecedor
   (`supplierBaseCost`) se o número de fornecedores crescer.

---

## 11. Notas / gotchas

- `valueAmount` PERCENT é **decimal** no banco (`0.20`); a UI mostra/edita em `%`
  (`×100` ao exibir, `÷100` ao salvar).
- Catálogo de produtos BDC é **derivado** de `bdc-cost-map.ts`; datasets novos
  aparecem sozinhos. Há "datasets fantasmas" com custo fallback documentados em
  `products.ts`.
- Inativar margem = soft delete (`active=false`); SNC não pode ser inativada/renomeada.
- A tela está sob `/portal/admin` (app proxiado por `snc.consolle.one`). Mudanças em
  auth/layout/middleware aqui são sensíveis — ler o `CLAUDE.md` de cada repo antes.
