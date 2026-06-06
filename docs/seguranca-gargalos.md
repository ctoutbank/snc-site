# Levantamento de Segurança — snc-site & plataforma consolle.one

> **Documento interno restrito.** Mapeia fragilidades de segurança. Não publicar, não
> indexar e, idealmente, manter em repositório/local de acesso controlado.
> Última auditoria: **2026-06-03**. Revisar a cada release de borda.

Classificação de severidade: **🔴 CRÍTICO** · **🟠 ALTO** · **🟡 MÉDIO** · **⚪ BAIXO**

---

## Parte 1 — Gargalos atuais do snc-site

| ID | Severidade | Gargalo | Evidência |
|----|-----------|---------|-----------|
| G1 | 🔴 CRÍTICO | **23 rotas `/api/apibrasil/*` públicas sem autenticação.** Qualquer pessoa na internet consulta SCR Bacen, dados veiculares, proprietário, débitos, RENAJUD, gravame, CSV completa de **terceiros**. | `src/app/api/apibrasil/*/route.ts` (nenhuma com check de sessão); `next.config.ts` mantém `/api/apibrasil/*` local |
| G2 | 🔴 CRÍTICO | **Zero rate-limit / captcha / anti-bot** em todas as rotas. Permite ataque em massa, scraping, enumeração e exaustão de créditos. | grep por `rateLimit\|captcha\|turnstile` = nenhum match real |
| G3 | 🔴 CRÍTICO | **Sem verificação de posse/identidade do solicitante.** Não há prova de que quem consulta um CPF/placa tem relação legítima com o titular. É a "espionagem por terceiro desautorizado". | `consulta/route.ts:101`, `veiculo/route.ts:101` |
| G4 | 🟠 ALTO | **Proxy aberto e pago.** O token mestre `APIBRASIL_BEARER_TOKEN` é usado por rotas sem auth — qualquer request anônimo gasta créditos pagos da empresa. | `src/lib/apibrasil.ts:getToken()` + G1 |
| G5 | 🟠 ALTO | **`_raw` (payload bruto da APIBrasil) vazado em 15 rotas.** Devolve mais dados do que a UI usa — viola minimização (LGPD Art. 6º, III). | 15 arquivos em `src/app/api/apibrasil/` retornam `_raw: raw` |
| G6 | 🟠 ALTO | **`logs_recentes.json` (39 KB) versionado no git.** Arquivo de log no controle de versão — risco de vazamento de dados/PII e ruído. | `git ls-files` lista o arquivo na raiz |
| G7 | 🟠 ALTO | **Página `/lgpd` afirma controles inexistentes** (finalidade obrigatória, log de acesso, AES-256 em repouso, ISO 27001/SOC 2 "Ativos"). Vira prova contra a empresa em fiscalização + publicidade enganosa (CDC Art. 37). | `src/app/lgpd/page.tsx` (PRINCIPIOS, certificações) |
| G8 | 🟡 MÉDIO | **Validação de input fraca.** Só checa presença/length; sem dígito verificador de CPF nem regex de placa Mercosul. Desperdiça créditos e abre porta a abuso/lixo. | `consulta/route.ts` (só `length !== 11`), `veiculo/route.ts` (só `!placa`) |
| G9 | 🟡 MÉDIO | **Sem headers de segurança na borda.** Falta CSP, HSTS, Referrer-Policy, Permissions-Policy. | `next.config.ts` sem bloco `headers()` |
| G10 | 🟡 MÉDIO | **Rota de teste em produção:** `api/test-email-autoscore`. Endpoints de teste não devem ser deployados. | `src/app/api/test-email-autoscore/route.ts` |
| G11 | 🟡 MÉDIO | **Sem banner/registro de consentimento de cookies.** Transparência (LGPD Art. 8º/9º); cookies não-essenciais exigem opt-in. | nenhum componente de consent no `layout.tsx` |
| G12 | ⚪ BAIXO | **Roteamento de borda via `Referer` é frágil** (header pode faltar/ser forjado). Funciona, mas já causou quebras históricas. | `src/middleware.ts:28` |

> Gargalos correlatos no backend `outbank-one` (auditados em sessão anterior): backdoor
> hardcoded `cto@outbank.com.br`; cron de retenção `drp-cleanup` não agendado; hash de
> integridade não resistente a insider; finalidade/base legal nunca capturadas.

---

## Parte 2 — Levantamento de hardening (defesa em profundidade)

### A. Controle de acesso — impedir o terceiro desautorizado  *(resolve G1, G3)*
- **Exigir sessão autenticada** em toda rota que toque dado de terceiro. Mover `/api/apibrasil/*` para trás do auth do portal, ou validar token de sessão na borda.
- **Busca pública (isca de venda)** — escolher um modelo:
  - **A) Gate leve**: login + finalidade declarada + rate-limit + captcha antes de revelar o resultado.
  - **B) "Consulte o seu próprio score"**: só o próprio CPF, com prova de posse (OTP no telefone do titular / gov.br).
  - **C) Demo fictícia**: relatório-exemplo (`/relatorio/snc/exemplo`) com dado sintético.
- **API keys por tenant** (não o token mestre), com escopo de datasets e cota por cliente *(resolve G4)*.
- **Menor privilégio**: cada operador só acessa os datasets que sua função exige.

### B. Anti-ataque em massa / anti-abuso  *(resolve G2)*
- **Rate-limiting** em três eixos: por IP, por usuário e por documento consultado (ex.: Upstash Ratelimit ou Vercel Firewall). Defina tetos (req/min, req/dia) e backoff progressivo.
- **WAF + proteção DDoS** na frente (Cloudflare ou Vercel Firewall): regras de bot, challenge, bloqueio por reputação de IP/ASN.
- **Bot mitigation** na busca pública: Cloudflare Turnstile / hCaptcha / reCAPTCHA v3.
- **Anti-enumeração**: bloquear varredura sequencial de placas/CPFs; throttle ao detectar muitos documentos distintos por conta/hora.
- **Detecção de anomalia**: alerta quando volume/padrão foge da linha de base (ex.: 100 documentos distintos/hora numa conta de vendedor) — sinal de desvio de finalidade.

### C. Certeza de "usuário real" vs. mal-intencionado  *(resolve G3)*
- **Onboarding verificado**: confirmação de e-mail + **OTP por SMS/WhatsApp** no telefone; validação de CPF do cadastrante.
- **KYB do lojista**: CNPJ ativo, situação cadastral, vínculo do operador com a empresa.
- **MFA/2FA obrigatório** para perfis que consultam dado de terceiro.
- **Prova de posse/titularidade** no modelo "consulte seu próprio score" (OTP no telefone do CPF, ou gov.br).
- **KYC/liveness** (selfie + documento) proporcional ao risco da conta, para contas que acessam dado financeiro sensível.
- **Device fingerprinting + risk scoring** de sessão; *step-up* de autenticação em ações de risco.

### D. Proteção de código e estrutura  *(resolve G5, G6, G8, G10)*
- **Allow-list de saída**: remover `_raw` das respostas; devolver só os campos que a UI consome.
- **Validação forte de input**: dígito verificador de CPF/CNPJ; regex de placa (antiga + Mercosul); sanitização e rejeição precoce.
- **Secrets**: somente em env/secret manager; nunca no client; **rotação** periódica de tokens; `gitleaks`/secret-scanning no CI.
- **Tirar `logs_recentes.json` do git**, reforçar `.gitignore`, e auditar o histórico (purgar se contiver PII).
- **Remover endpoints de teste/debug** do build de produção (ou protegê-los por flag + auth).
- **SAST no CI** (CodeQL ou Semgrep) + **SCA** (Dependabot/Snyk, `npm audit`), lockfile fixo.
- **Não vazar stack traces** ao cliente; respostas de erro genéricas + log interno detalhado.
- **Branch protection** + revisão obrigatória + assinatura de commits.

### E. Proteção de campos e dados  *(resolve G5)*
- **Cifragem de campo (envelope encryption)** para PII em repouso, com chave em **KMS** (não no banco). Resolve o "AES-256 em repouso" que a página já promete.
- **Mascaramento por padrão**; desmascaramento sob clique, com finalidade e log.
- **Minimização**: por finalidade, só os campos necessários (poda na entrada e na saída).
- **Tokenização** de documentos onde o valor em claro não for necessário.
- **Retenção em duas camadas**: PII com retenção curta (cofre) + metadados de auditoria com retenção longa (prazo legal). Automatizar expurgo.

### F. Trilha de auditoria e accountability  *(LGPD Art. 37, 48)*
- **Log de acesso imutável**: quem, quando, documento mascarado, finalidade, base legal, IP/agente — incluindo **leituras**, não só criação.
- **Integridade forte**: hash-chain (cada registro encadeia o anterior) + **HMAC com chave em KMS** fora do banco.
- **ROPA** (registro de operações) e **RIPD/DPIA** reais e versionados.
- **Plano de resposta a incidente** + fluxo de notificação à ANPD (Art. 48) em até 2 dias úteis.

### G. Certificados e selos  *(resolve G7)*
- **TLS**: já há certificado de transporte (Vercel). Adicionar **HSTS** (preload) e desabilitar protocolos fracos.
- **Certificações organizacionais (ISO 27001 / SOC 2)**: **não reivindicar "Ativo" sem auditoria emitida por organismo acreditado** — hoje é publicidade enganosa. Caminho honesto: *readiness* (CIS Controls → ISO 27001), pentest de terceiro, e só então o selo.
- **Selos honestos disponíveis já**: relatório de pentest independente, RIPD publicado, política de privacidade condizente.
- **Assinatura digital de relatórios** (ICP-Brasil / e-CNPJ) para validade jurídica — evolução do hash SHA-256 atual.

### H. Infra e borda  *(resolve G9, G12)*
- **Headers de segurança** no `next.config.ts`: CSP estrita, HSTS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, X-Frame-Options, COOP/COEP.
- **WAF/CDN** (Cloudflare) à frente do proxy, com bot management e regras de rate.
- **Segregação de ambientes** (prod/homolog) e de credenciais; observabilidade de erro, latência e **custo de API** (alerta de pico = abuso).
- **Substituir o roteamento por `Referer`** por mecanismo determinístico quando viável (cookie de origem, header próprio).

---

## Parte 3 — Roadmap priorizado

### 🔴 P0 — Contenção imediata (dias)
1. **Fechar/proteger `/api/apibrasil/*`** (auth obrigatório) — escolher modelo A/B/C para a busca pública. *(G1, G3, G4)*
2. **Rate-limit + captcha** na busca pública e WAF na frente. *(G2)*
3. **Remover `_raw`** das respostas. *(G5)*
4. **Tirar `logs_recentes.json` do git** e auditar histórico. *(G6)*
5. **Alinhar a página `/lgpd` à realidade** (remover certificações não comprovadas e as afirmações técnicas falsas). *(G7)*
6. **Remover `test-email-autoscore` de produção.** *(G10)*

### 🟠 P1 — Estrutura de conformidade (semanas)
7. Finalidade + base legal por consulta; log de acesso imutável (hash-chain + HMAC/KMS). *(F)*
8. Validação forte de input; headers de segurança; SAST/SCA/secret-scanning no CI. *(D, H)*
9. Onboarding verificado (OTP), MFA para perfis de risco, KYB do lojista. *(C)*
10. Retenção em duas camadas + expurgo automatizado.

### 🟡 P2 — Robustez e maturidade (trimestre)
11. Cifragem de campo (KMS); tokenização; mascaramento progressivo. *(E)*
12. KYC/liveness + risk scoring + device fingerprint. *(C)*
13. Readiness ISO 27001 / pentest de terceiro / RIPD; assinatura ICP-Brasil de relatórios. *(G)*
14. Detecção de anomalia/uso indevido; banner de consentimento de cookies. *(B, G11)*

---

## Tensão "segurança × venda do veículo"
A busca pública é, provavelmente, isca de conversão. Os controles acima preservam a venda:
finalidade em **1 clique** (default por perfil), base legal pré-mapeada, mascaramento que mostra
**score e decisão na hora** mas esconde dado sensível, e tudo *fire-and-forget* para não travar a UX.
O atrito recai sobre o **anônimo mal-intencionado**, não sobre o vendedor legítimo.
