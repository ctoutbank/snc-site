/**
 * APIBrasil — Cliente REST (snc-site)
 *
 * Referência oficial:
 *   POST https://gateway.apibrasil.io/api/v2/consulta/cpf/credits
 *   Body: { tipo: "scr-bacen-score", cpf: "...", homolog: false }
 *   Header: Authorization: Bearer <APIBRASIL_BEARER_TOKEN>
 *
 * Configuração via variáveis de ambiente (.env.local):
 *   APIBRASIL_BEARER_TOKEN  — token JWT (prioridade)
 *   APIBRASIL_EMAIL         — fallback: e-mail de login
 *   APIBRASIL_PASSWORD      — fallback: senha de login
 *   APIBRASIL_HOMOLOG       — "true" para ambiente de testes
 */

// ─── Configuração ────────────────────────────────────────

const BASE_URL = "https://gateway.apibrasil.io";
const REQUEST_TIMEOUT_MS = 120_000; // 120s (alinhado com o --max-time 120 da APIBrasil)

// ─── Cache de token (login dinâmico) ────────────────────

let _cachedToken: string | null = null;
let _tokenExpiry: number | null = null;

async function getToken(): Promise<string> {
  // 1ª prioridade: token estático configurado no ambiente
  const staticToken = process.env.APIBRASIL_BEARER_TOKEN;
  if (staticToken) return staticToken;

  // 2ª prioridade: login dinâmico (reusa enquanto válido)
  const now = Date.now();
  if (_cachedToken && _tokenExpiry && now < _tokenExpiry) return _cachedToken;

  const email = process.env.APIBRASIL_EMAIL;
  const password = process.env.APIBRASIL_PASSWORD;

  if (!email || !password) {
    throw new APIBrasilError(
      "Configure APIBRASIL_BEARER_TOKEN ou APIBRASIL_EMAIL + APIBRASIL_PASSWORD.",
      0
    );
  }

  const res = await fetchWithTimeout(`${BASE_URL}/api/oauth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseResponse<{ token?: string; access_token?: string; data?: { token?: string } }>(res);
  const token = data.token ?? data.access_token ?? data.data?.token;

  if (!token) throw new APIBrasilError("Token não encontrado na resposta de autenticação.", 0);

  _cachedToken = token;
  _tokenExpiry = now + 55 * 60 * 1000; // 55 min de margem
  return token;
}

// ─── Helpers ─────────────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout após ${REQUEST_TIMEOUT_MS / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new APIBrasilError(`Resposta não-JSON (${res.status}): ${text.slice(0, 200)}`, res.status);
  }

  if (!res.ok) {
    const err = json as Record<string, unknown>;
    const message =
      (typeof err?.message === "string" ? err.message : null) ??
      (typeof err?.error === "string" ? err.error : null) ??
      `HTTP ${res.status}`;
    throw new APIBrasilError(message, res.status, err);
  }

  return json as T;
}

// ─── Erro tipado ──────────────────────────────────────────

export class APIBrasilError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(`[SNC] ${message}`);
    this.name = "APIBrasilError";
  }
}

// ─── Fetch autenticado ────────────────────────────────────

async function apiFetch<TBody, TResponse>(
  path: string,
  method: "GET" | "POST",
  body?: TBody
): Promise<TResponse> {
  const token = await getToken();

  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return parseResponse<TResponse>(res);
}

// ─────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────

// ── CNPJ ─────────────────────────────────────────────────

export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  situacao_cadastral?: string;
  data_situacao_cadastral?: string;
  natureza_juridica?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  atividade_principal?: { code: string; text: string }[];
  atividades_secundarias?: { code: string; text: string }[];
  capital_social?: string;
  [key: string]: unknown;
}

// ── CEP ──────────────────────────────────────────────────

export interface CEPData {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  ddd?: string;
  [key: string]: unknown;
}

// ── SCR Bacen + Score ─────────────────────────────────────

/** Payload enviado para o endpoint de crédito CPF */
export interface SCRScorePayload {
  tipo: "scr-bacen-score";
  cpf: string;
  homolog: boolean;
}

/** Dados de modalidade SCR */
export interface SCRModalidade {
  modalidade: string;
  vencido?: number;
  aVencer?: number;
  prejuizo?: number;
  total?: number;
}

/** Bloco SCR Bacen dentro da resposta */
export interface SCRData {
  nome?: string;
  totalVencido?: number;
  totalAVencer?: number;
  totalPrejuizo?: number;
  totalResponsabilidade?: number;
  quantidadeInstituicoes?: number;
  dataReferencia?: string;
  modalidades?: SCRModalidade[];
  [key: string]: unknown;
}

/** Bloco Score dentro da resposta */
export interface ScoreData {
  score?: number;
  scoreLabel?: string;
  faixa?: string;
  probabilidadeInadimplencia?: number;
  fatoresNegativos?: string[];
  fatoresPositivos?: string[];
  dataConsulta?: string;
  [key: string]: unknown;
}

/** Resposta completa do endpoint /api/v2/consulta/cpf/credits */
export interface SCRScoreResponse {
  status?: number | string;
  message?: string;
  data?: {
    scr?: SCRData;
    score?: ScoreData;
    [key: string]: unknown;
  };
  scr?: SCRData;
  score?: ScoreData;
  [key: string]: unknown;
}

// ─────────────────────────────────────────────────────────
// CONSULTAS
// ─────────────────────────────────────────────────────────

/** Consulta dados completos de um CNPJ */
export async function consultarCNPJ(cnpj: string): Promise<CNPJData> {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) throw new APIBrasilError("CNPJ deve ter 14 dígitos.", 400);
  return apiFetch<undefined, CNPJData>(`/api/consulta/cnpj?cnpj=${digits}`, "GET");
}

/** Consulta endereço por CEP */
export async function consultarCEP(cep: string): Promise<CEPData> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) throw new APIBrasilError("CEP deve ter 8 dígitos.", 400);
  return apiFetch<undefined, CEPData>(`/api/consulta/cep?cep=${digits}`, "GET");
}

/**
 * Consulta SCR Bacen + Score de Crédito para um CPF.
 *
 * Endpoint: POST /api/v2/consulta/cpf/credits
 * Payload:  { tipo: "scr-bacen-score", cpf, homolog }
 */
export async function consultarSCRScore(cpf: string): Promise<SCRScoreResponse> {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) throw new APIBrasilError("CPF deve ter 11 dígitos.", 400);

  const homolog = process.env.APIBRASIL_HOMOLOG === "true";

  return apiFetch<SCRScorePayload, SCRScoreResponse>(
    "/api/v2/consulta/cpf/credits",
    "POST",
    { tipo: "scr-bacen-score", cpf: digits, homolog }
  );
}

// ─────────────────────────────────────────────────────────
// DATASET: Placa FIPE (Com Chassi)
// POST /api/v2/consulta/veiculos/credits
// ─────────────────────────────────────────────────────────

/** Payload enviado para o endpoint de veículos */
export interface PlacaFIPEPayload {
  tipo: "fipe-chassi";
  placa: string;
  homolog: boolean;
}

/** Dados FIPE de uma tabela de referência */
export interface FIPEItem {
  Codigo?: string;
  Marca?: string;
  Modelo?: string;
  AnoModelo?: string | number;
  Combustivel?: string;
  CodigoFipe?: string;
  MesReferencia?: string;
  TipoVeiculo?: number;
  SiglaCombustivel?: string;
  Valor?: string;
  [key: string]: unknown;
}

/** Informações do chassi / características do veículo */
export interface VeiculoChassi {
  chassi?: string;
  motor?: string;
  cor?: string;
  anoFabricacao?: string | number;
  anoModelo?: string | number;
  potencia?: string;
  cilindrada?: string;
  capacidadePassageiros?: string | number;
  carroceria?: string;
  especie?: string;
  tipo?: string;
  combustivel?: string;
  procedencia?: string;
  [key: string]: unknown;
}

/** Dados consolidados do veículo */
export interface VeiculoDados {
  placa?: string;
  marca?: string;
  modelo?: string;
  versao?: string;
  anoFabricacao?: string | number;
  anoModelo?: string | number;
  cor?: string;
  combustivel?: string;
  municipio?: string;
  uf?: string;
  situacao?: string;
  restricoes?: string[];
  chassi?: VeiculoChassi;
  fipe?: FIPEItem[];
  [key: string]: unknown;
}

/** Resposta completa do endpoint /api/v2/consulta/veiculos/credits */
export interface PlacaFIPEResponse {
  status?: number | string;
  message?: string;
  data?: {
    veiculo?: VeiculoDados;
    fipe?: FIPEItem[];
    chassi?: VeiculoChassi;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// ─── Validação de placa (padrão antigo e Mercosul) ───────

const PLACA_ANTIGA = /^[A-Z]{3}\d{4}$/;
const PLACA_MERCOSUL = /^[A-Z]{3}\d[A-Z]\d{2}$/;

export function normalizarPlaca(placa: string): string {
  return placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function validarPlaca(placa: string): boolean {
  const p = normalizarPlaca(placa);
  return PLACA_ANTIGA.test(p) || PLACA_MERCOSUL.test(p);
}

/**
 * Consulta dados FIPE + Chassi de um veículo pela placa.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "fipe-chassi", placa, homolog }
 *
 * @param placa   Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)
 * @returns       Resposta bruta da APIBrasil com FIPE e dados do chassi
 */
export async function consultarPlacaFIPE(placa: string): Promise<PlacaFIPEResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog = process.env.APIBRASIL_HOMOLOG === "true";

  return apiFetch<PlacaFIPEPayload, PlacaFIPEResponse>(
    "/api/v2/consulta/veiculos/credits",
    "POST",
    { tipo: "fipe-chassi", placa: p, homolog }
  );
}

// ─────────────────────────────────────────────────────────
// DATASET: Proprietário Atual
// POST /api/v2/consulta/veiculos/credits  { tipo: "proprietario-atual" }
// ─────────────────────────────────────────────────────────

/** Payload para consulta de proprietário atual do veículo */
export interface ProprietarioAtualPayload {
  tipo: "proprietario-atual";
  placa: string;
  homolog: boolean;
}

/**
 * Dados do proprietário atual — estrutura provisória.
 * Os campos exatos são confirmados após o primeiro teste em homolog
 * inspecionando o campo _raw na resposta da rota.
 */
export interface ProprietarioAtualDados {
  nome?: string;
  cpfCnpj?: string;
  municipio?: string;
  uf?: string;
  dataAquisicao?: string;
  restricoes?: string[];
  [key: string]: unknown;
}

/** Resposta completa do endpoint para proprietário atual */
export interface ProprietarioAtualResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    proprietario?: ProprietarioAtualDados;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Consulta o proprietário atual de um veículo pela placa.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "proprietario-atual", placa, homolog }
 *
 * PROTOCOLO: Rodar em homolog primeiro. Só mudar para produção
 * após autorização explícita do usuário (Denison).
 *
 * @param placa  Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)
 */
export async function consultarProprietarioAtual(
  placa: string
): Promise<ProprietarioAtualResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog = process.env.APIBRASIL_HOMOLOG === "true";

  return apiFetch<ProprietarioAtualPayload, ProprietarioAtualResponse>(
    "/api/v2/consulta/veiculos/credits",
    "POST",
    { tipo: "proprietario-atual", placa: p, homolog }
  );
}

// ─────────────────────────────────────────────────────────
// DATASET: Relatório Completo do Veículo (VIP Car)
// POST /api/v2/consulta/veiculos/credits  { tipo: "vip-car" }
// ─────────────────────────────────────────────────────────

/** Payload para o relatório completo VIP Car */
export interface VipCarPayload {
  tipo: "vip-car";
  placa: string;
  homolog: boolean;
}

/**
 * Resposta completa VIP Car — estrutura provisória.
 * Campos exatos confirmados após primeiro teste em homolog
 * inspecionando _raw no DevTools Network.
 */
export interface VipCarResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Consulta o Relatório Completo (VIP Car) de um veículo pela placa.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "vip-car", placa, homolog }
 *
 * PROTOCOLO: Rodar em homolog primeiro. Só mudar para produção
 * após autorização explícita do usuário (Denison).
 *
 * @param placa  Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)
 */
export async function consultarVipCar(
  placa: string
): Promise<VipCarResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog = process.env.APIBRASIL_HOMOLOG === "true";

  return apiFetch<VipCarPayload, VipCarResponse>(
    "/api/v2/consulta/veiculos/credits",
    "POST",
    { tipo: "vip-car", placa: p, homolog }
  );
}

// ─────────────────────────────────────────────────────────
// DATASET: Leilão com Score
// POST /api/v2/consulta/veiculos/credits  { tipo: "leilao-completo-score" }
// ─────────────────────────────────────────────────────────

/** Payload para consulta de Leilão com Score do veículo */
export interface LeilaoScorePayload {
  tipo: "leilao-completo-score";
  placa: string;
  homolog: boolean;
}

/**
 * Resposta completa Leilão com Score — estrutura provisória.
 * Campos exatos confirmados após primeiro teste em homolog
 * inspecionando _raw no DevTools Network.
 */
export interface LeilaoScoreResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Consulta Leilão com Score de um veículo pela placa.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "leilao-completo-score", placa, homolog }
 *
 * PROTOCOLO: Rodar em homolog primeiro. Só mudar para produção
 * após autorização explícita do usuário (Denison).
 *
 * @param placa  Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)
 */
export async function consultarLeilaoScore(
  placa: string
): Promise<LeilaoScoreResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog = process.env.APIBRASIL_HOMOLOG === "true";

  return apiFetch<LeilaoScorePayload, LeilaoScoreResponse>(
    "/api/v2/consulta/veiculos/credits",
    "POST",
    { tipo: "leilao-completo-score", placa: p, homolog }
  );
}

// ─────────────────────────────────────────────────────────
// DATASET: Renajud
// POST /api/v2/consulta/veiculos/credits  { tipo: "renajud" }
// ─────────────────────────────────────────────────────────

export interface RenajudPayload {
  tipo: "renajud";
  placa: string;
  homolog: boolean;
}

export interface RenajudResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    processo?: string;
    orgao_judicial?: string;
    tribunal?: string;
    restricoes?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface RenajudConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
}

/**
 * Consulta restrições do RENAJUD para um veículo pela placa.
 *
 * @param placa   Placa do veículo (ex: ABC1234 ou ABC1D23)
 * @param config  Configurações opcionais de injeção de dependência (token, base_url, homolog, timeout)
 */
export async function consultarRenajud(
  placa: string,
  config?: RenajudConfig
): Promise<RenajudResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  // Injeção de dependências e configuração
  const homolog = config?.homolog ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl = config?.baseUrl ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;

  // Obter token
  const token = config?.bearerToken ?? (await getToken());

  // Executar a requisição
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "renajud",
        placa: p,
        homolog,
      } as RenajudPayload),
      signal: controller.signal,
    });

    return await parseResponse<RenajudResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─────────────────────────────────────────────────────────
// DATASET: Gravame (Restrição Financeira)
// POST /api/v2/consulta/veiculos/credits  { tipo: "gravame" }
// ─────────────────────────────────────────────────────────

export interface GravamePayload {
  tipo: "gravame";
  placa: string;
  homolog: boolean;
}

export interface GravameResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    placa?: string;
    chassi?: string;
    renavam?: string;
    marca_modelo?: string;
    ano_fabricacao?: string;
    ano_modelo?: string;
    cor_veiculo?: string;
    combustivel?: string;
    financiamento?: string;        // "SIM" ou "NÃO"
    agente_financeiro?: string;    // Banco / Financiadora
    data_inclusao?: string;        // Data de inclusão do Gravame
    contrato_numero?: string;      // Número do contrato de financiamento
    situacao?: string;             // Situação do Gravame (ex: "ATIVO", "BAIXADO")
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Consulta gravame e restrição financeira de um veículo pela placa.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "gravame", placa, homolog }
 *
 * @param placa  Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)
 */
export async function consultarGravame(
  placa: string
): Promise<GravameResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog = process.env.APIBRASIL_HOMOLOG === "true";

  return apiFetch<GravamePayload, GravameResponse>(
    "/api/v2/consulta/veiculos/credits",
    "POST",
    { tipo: "gravame", placa: p, homolog }
  );
}

// ─────────────────────────────────────────────────────────
// DATASET: Débitos V4
// POST /api/v2/consulta/veiculos/credits  { tipo: "debitos-v4" }
// ─────────────────────────────────────────────────────────

export interface DebitosV4Payload {
  tipo: "debitos-v4";
  placa: string;
  homolog: boolean;
}

export interface DebitoItem {
  descricao?: string;
  valor?: number | string;
  dataVencimento?: string;
  orgaoEmissor?: string;
  tipoDebito?: string;
  codigoInfracao?: string;
  [key: string]: unknown;
}

export interface DebitosV4Dados {
  placa?: string;
  renavam?: string;
  chassi?: string;
  marcaModelo?: string;
  anoFabricacao?: string | number;
  anoModelo?: string | number;
  combustivel?: string;
  cor?: string;
  multas?: DebitoItem[];
  ipva?: DebitoItem[];
  licenciamento?: DebitoItem[];
  dpvat?: DebitoItem[];
  outrosDebitos?: DebitoItem[];
  totalMultas?: number | string;
  totalIpva?: number | string;
  totalLicenciamento?: number | string;
  totalDpvat?: number | string;
  totalGeral?: number | string;
  [key: string]: unknown;
}

export interface DebitosV4Response {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    veiculo?: {
      placa?: string;
      renavam?: string;
      chassi?: string;
      marca_modelo?: string;
      [key: string]: unknown;
    };
    debitos?: DebitosV4Dados;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface DebitosV4Config {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
}

/**
 * Consulta débitos (faturamento, IPVA, multas, licenciamento) do veículo (Débitos V4) pela placa.
 *
 * @param placa       Placa do veículo (ex: ABC1234 ou ABC1D23)
 * @param config      Configurações opcionais de injeção de dependência (token, base_url, homolog, timeout)
 */
export async function consultarDebitosV4(
  placa: string,
  config?: DebitosV4Config
): Promise<DebitosV4Response> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  // Injeção de dependências e configuração
  const homolog = config?.homolog ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl = config?.baseUrl ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;

  // Obter token
  const token = config?.bearerToken ?? (await getToken());

  // Executar a requisição
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "debitos-v4",
        placa: p,
        homolog,
      } as DebitosV4Payload),
      signal: controller.signal,
    });

    return await parseResponse<DebitosV4Response>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─────────────────────────────────────────────────────────
// DATASET: Base Estadual
// POST /api/v2/consulta/veiculos/credits  { tipo: "estadual" }
// ─────────────────────────────────────────────────────────

export interface EstadualPayload {
  tipo: "estadual";
  placa: string;
  homolog: boolean;
}

export interface EstadualDebito {
  descricao?: string;
  valor?: number | string;
  dataVencimento?: string;
  orgaoEmissor?: string;
  tipoDebito?: string;
  [key: string]: unknown;
}

export interface EstadualRestricao {
  tipo?: string;
  descricao?: string;
  [key: string]: unknown;
}

export interface EstadualDados {
  placa?: string;
  renavam?: string;
  chassi?: string;
  marcaModelo?: string;
  anoFabricacao?: string | number;
  anoModelo?: string | number;
  combustivel?: string;
  cor?: string;
  uf?: string;
  municipio?: string;
  restricoes?: EstadualRestricao[];
  multas?: EstadualDebito[];
  ipva?: EstadualDebito[];
  licenciamento?: EstadualDebito[];
  outrosDebitos?: EstadualDebito[];
  totalDebitos?: number | string;
  [key: string]: unknown;
}

export interface EstadualResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    veiculo?: {
      placa?: string;
      renavam?: string;
      chassi?: string;
      marca_modelo?: string;
      uf?: string;
      [key: string]: unknown;
    };
    estadual?: EstadualDados;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface EstadualConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
}

/**
 * Consulta dados da Base Estadual (dados detalhados do DETRAN) do veículo pela placa.
 *
 * @param placa       Placa do veículo (ex: ABC1234 ou ABC1D23)
 * @param config      Configurações opcionais de injeção de dependência (token, base_url, homolog, timeout)
 */
export async function consultarBaseEstadual(
  placa: string,
  config?: EstadualConfig
): Promise<EstadualResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  // Injeção de dependências e configuração
  const homolog = config?.homolog ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl = config?.baseUrl ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;

  // Obter token
  const token = config?.bearerToken ?? (await getToken());

  // Executar a requisição com timeout explícito
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "estadual",
        placa: p,
        homolog,
      } as EstadualPayload),
      signal: controller.signal,
    });

    return await parseResponse<EstadualResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Multas (Renainf) ──────────────────────────────────────

export interface RenainfPayload {
  tipo: "renainf";
  placa: string;
  homolog?: boolean;
}

export interface RenainfInfracao {
  autoInfra?: string;
  codigoInfra?: string;
  dataInfra?: string;
  descricao?: string;
  orgaoEmissor?: string;
  valorOriginal?: string;
  valorAnotado?: string;
  situacao?: string;
  localInfra?: string;
  [key: string]: unknown;
}

export interface RenainfDados {
  placa?: string;
  chassi?: string;
  renavam?: string;
  marcaModelo?: string;
  totalMultas?: number;
  valorTotal?: string;
  infracoes?: RenainfInfracao[];
  [key: string]: unknown;
}

export interface RenainfResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    veiculo?: {
      placa?: string;
      renavam?: string;
      chassi?: string;
      marca_modelo?: string;
      uf?: string;
      [key: string]: unknown;
    };
    renainf?: RenainfDados;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface RenainfConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
}

/**
 * Consulta dados de Multas (Renainf) do veículo pela placa.
 *
 * @param placa       Placa do veículo (ex: ABC1234 ou ABC1D23)
 * @param config      Configurações opcionais de injeção de dependência
 */
export async function consultarRenainf(
  placa: string,
  config?: RenainfConfig
): Promise<RenainfResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog = config?.homolog ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl = config?.baseUrl ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;

  const token = config?.bearerToken ?? (await getToken());

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "renainf",
        placa: p,
        homolog,
      } as RenainfPayload),
      signal: controller.signal,
    });

    return await parseResponse<RenainfResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─────────────────────────────────────────────────────────
// DATASET: Histórico Km
// POST /api/v2/consulta/veiculos/credits  { tipo: "historico-km" }
// ─────────────────────────────────────────────────────────

export interface HistoricoKmPayload {
  tipo: "historico-km";
  placa: string;
  homolog: boolean;
}

export interface HistoricoKmRegistro {
  data?: string;
  km?: number | string;
  fonte?: string;
  estado?: string;
}

export interface HistoricoKmResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    placa?: string;
    chassi?: string;
    renavam?: string;
    marca_modelo?: string;
    ano_fabricacao?: string;
    ano_modelo?: string;
    cor?: string;
    combustivel?: string;
    historico?: HistoricoKmRegistro[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Consulta histórico de quilometragem de um veículo pela placa.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "historico-km", placa, homolog }
 */
export async function consultarHistoricoKm(
  placa: string
): Promise<HistoricoKmResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  return apiFetch<HistoricoKmPayload, HistoricoKmResponse>(
    "/api/v2/consulta/veiculos/credits",
    "POST",
    {
      tipo: "historico-km",
      placa: p,
      homolog: process.env.APIBRASIL_HOMOLOG === "true",
    }
  );
}

// ─── Emissão de CRLV-e ──────────────────────────────────────

export interface CrlvePayload {
  tipo: "crlve";
  placa: string;
  uf: string;
  homolog?: boolean;
}

export interface CrlveStatusRetorno {
  codigo?: string;
  descricao?: string;
}

export interface CrlveFile {
  file_base64?: string;
  mime_type?: string;
}

export interface CrlveDocumento {
  chave_retorno?: string;
  exercicio?: string;
  existe_ocorrencia?: string;
  observacoes?: string;
  pdf_file?: CrlveFile;
  image_file?: CrlveFile;
  status_retorno?: CrlveStatusRetorno;
}

export interface CrlveVeiculo {
  ano_fabricacao?: string;
  ano_modelo?: string;
  chassi?: string;
  combustivel?: string;
  cor_veiculo?: string;
  crlv?: string;
  data_atualizacao?: string;
  marca_modelo?: string;
  motor?: string;
  municipio?: string;
  placa?: string;
  proprietario_documento?: string;
  proprietario_nome?: string;
  renavam?: string;
  status_retorno?: CrlveStatusRetorno;
  uf?: string;
}

export interface CrlveResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    documentos?: {
      crlv?: CrlveDocumento;
    };
    uf?: string;
    veiculo?: CrlveVeiculo;
  };
  [key: string]: unknown;
}

export interface CrlveConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
}

/**
 * Consulta a emissão do CRLV-e de um veículo pela placa e UF.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "crlve", placa, uf, homolog }
 */
export async function consultarCrlve(
  placa: string,
  uf: string,
  config?: CrlveConfig
): Promise<CrlveResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const normalizedUf = uf.trim().toUpperCase();
  if (normalizedUf.length !== 2) {
    throw new APIBrasilError(
      `UF inválida: "${uf}". Use a sigla de 2 letras (ex: SP, PR).`,
      400
    );
  }

  const homolog = config?.homolog ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl = config?.baseUrl ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;

  const token = config?.bearerToken ?? (await getToken());

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "crlve",
        placa: p,
        uf: normalizedUf,
        homolog,
      } as CrlvePayload),
      signal: controller.signal,
    });

    return await parseResponse<CrlveResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── CSV Completa (RENAINF + RENAJUD + BIN + Proprietário) ───────────────────

export interface CsvCompletaPayload {
  tipo: "csv-renainf-renajud-bin-proprietario";
  placa: string;
  homolog?: boolean;
}

// ─── Sub-tipos do response real da API ────────────────────────────────────────

export interface CsvCompletaStatusRetorno {
  codigo?: string;
  descricao?: string;
}

export interface CsvCompletaProprietarioAtual {
  placa?: string;
  marca_modelo?: string;
  chassi?: string;
  renavam?: string;
  ano_fabricacao?: string;
  ano_modelo?: string;
  combustivel?: string;
  cor_veiculo?: string;
  municipio?: string;
  uf?: string;
  motor?: string;
  proprietario_nome?: string;
  proprietario_documento?: string;
  status_retorno?: CsvCompletaStatusRetorno;
}

export interface CsvCompletaBinNacional {
  placa?: string;
  marca_modelo?: string;
  chassi?: string;
  renavam?: string;
  ano_fabricacao?: string;
  ano_modelo?: string;
  combustivel?: string;
  cor_veiculo?: string;
  municipio?: string;
  uf?: string;
  categoria_veiculo?: string;
  especie_veiculo?: string;
  tipo_veiculo?: string;
  tipo_carroceria?: string;
  potencia_veiculo?: string;
  numero_eixos?: string;
  quantidade_passageiros?: string;
  procedencia?: string;
  pbt?: string;
  situacao?: string;
  data_emissao_crlv?: string;
  data_emissao_ultimo_crv?: string;
  proprietario?: { nome?: string; documento?: string };
  restricoes?: {
    existe_restricao_geral?: string;
    existe_restricao_renajud?: string;
    existe_restricao_roubo_furto?: string;
    mensagens_restricoes?: string[];
    veiculo_baixado?: string;
  };
  status_retorno?: CsvCompletaStatusRetorno;
}

export interface CsvCompletaVeicular {
  proprietario_atual_veiculo?: CsvCompletaProprietarioAtual;
  bin_nacional?: CsvCompletaBinNacional;
  alerta_indicio?: {
    existe_ocorrencia?: string;
    descricao_ocorrencia?: string;
    status_retorno?: CsvCompletaStatusRetorno;
  };
  renainf?: {
    qtd_ocorrencias?: string;
    ocorrencias?: Record<string, unknown>[];
    status_retorno?: CsvCompletaStatusRetorno;
  };
  renajud?: {
    quantidade_ocorrencias?: string;
    msg_alerta?: string;
    status_retorno?: CsvCompletaStatusRetorno;
  };
  csv?: {
    quantidade_ocorrencia?: string;
    ocorrencias?: Record<string, unknown>[];
    mensagem_observacao?: string;
    status_retorno?: CsvCompletaStatusRetorno;
  };
  precificador?: {
    ocorrencias?: {
      ano_modelo?: string;
      codigo?: string;
      fabricante_modelo?: string;
      informante?: string;
      preco?: string;
      vigencia?: string;
    }[];
    status_retorno?: CsvCompletaStatusRetorno;
  };
  recall?: {
    quantidade_ocorrencias?: string;
    status_retorno?: CsvCompletaStatusRetorno;
  };
}

export interface CsvCompletaResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    pdf?: string;
    veicular?: CsvCompletaVeicular;
  };
}

export interface CsvCompletaConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
}

/**
 * Consulta CSV Completa: veículo + RENAINF + RENAJUD + BIN + Proprietário.
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "csv-renainf-renajud-bin-proprietario", placa, homolog }
 */
export async function consultarCsvCompleta(
  placa: string,
  config?: CsvCompletaConfig
): Promise<CsvCompletaResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog   = config?.homolog   ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl   = config?.baseUrl   ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const token     = config?.bearerToken ?? (await getToken());

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "csv-renainf-renajud-bin-proprietario",
        placa: p,
        homolog,
      } as CsvCompletaPayload),
      signal: controller.signal,
    });
    return await parseResponse<CsvCompletaResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// ─────────────────────────────────────────────────────────
// DATASET: Analítico Veicular
// POST /api/v2/consulta/veiculos/credits  { tipo: "analitico-veicular" }
// Super-dataset: FIPE + Proprietário + Histórico KM + RENAJUD + RENAINF + Roubo/Furto + Recall
// ─────────────────────────────────────────────────────────

/** Configurações de sub-consultas do Analítico Veicular */
export interface AnaliticoVeicularExtra {
  fipe?: boolean;
  "proprietario-atual"?: boolean;
  "historico-km"?: boolean;
  renajud?: boolean;
  renainf?: boolean;
  "roubo-furto"?: boolean;
  recall?: boolean;
}

/** Configurações de whitelabel para o PDF gerado pela API */
export interface AnaliticoVeicularWhitelabel {
  empresa?: string;
  logo?: string;
  "font-size"?: string;
  "font-color"?: string;
  "header-color"?: string;
  "font-header-color"?: string;
}

/** Payload para consulta do Analítico Veicular */
export interface AnaliticoVeicularPayload {
  tipo: "analitico-veicular";
  placa: string;
  homolog: boolean;
  extra: AnaliticoVeicularExtra;
  whitelabel?: AnaliticoVeicularWhitelabel;
}

/**
 * Resposta do Analítico Veicular — estrutura provisória.
 * Campos exatos confirmados após primeiro teste em homolog
 * inspecionando _raw no DevTools Network.
 */
export interface AnaliticoVeicularResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AnaliticoVeicularConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
  extra?: AnaliticoVeicularExtra;
  whitelabel?: AnaliticoVeicularWhitelabel;
}

/**
 * Consulta o Analítico Veicular de um veículo pela placa.
 *
 * Este é um super-dataset que agrega FIPE, Proprietário Atual,
 * Histórico de KM, RENAJUD, RENAINF, Roubo/Furto e Recall
 * em uma única chamada.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "analitico-veicular", placa, homolog, extra, whitelabel }
 *
 * PROTOCOLO: Rodar em homolog primeiro. Só mudar para produção
 * após autorização explícita do usuário (Denison).
 *
 * @param placa   Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)
 * @param config  Configurações opcionais (token, base_url, homolog, timeout, extra, whitelabel)
 */
export async function consultarAnaliticoVeicular(
  placa: string,
  config?: AnaliticoVeicularConfig
): Promise<AnaliticoVeicularResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog   = config?.homolog   ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl   = config?.baseUrl   ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const token     = config?.bearerToken ?? (await getToken());

  const extra: AnaliticoVeicularExtra = config?.extra ?? {
    fipe: true,
    "proprietario-atual": true,
    "historico-km": true,
    renajud: true,
    renainf: true,
    "roubo-furto": true,
    recall: true,
  };

  const whitelabel: AnaliticoVeicularWhitelabel = config?.whitelabel ?? {
    empresa: "SNC - Sistema Nacional de Conformidade",
    logo: "",
    "font-size": "14px",
    "font-color": "#0F172A",
    "header-color": "#000000",
    "font-header-color": "#FFFFFF",
  };

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "analitico-veicular",
        placa: p,
        homolog,
        extra,
        whitelabel,
      } as AnaliticoVeicularPayload),
      signal: controller.signal,
    });
    return await parseResponse<AnaliticoVeicularResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}


// ─────────────────────────────────────────────────────────
// DATASET: Agregados Basica
// POST /api/v2/consulta/veiculos/credits  { tipo: "agregados-basica" }
// ─────────────────────────────────────────────────────────

export interface AgregadosBasicaPayload {
  tipo: "agregados-basica";
  placa: string;
  homolog: boolean;
}

export interface AgregadosBasicaVeiculo {
  placa?: string;
  chassi?: string;
  renavam?: string;
  motor?: string;
  marca_modelo?: string;
  ano_fabricacao?: string | number;
  ano_modelo?: string | number;
  cor?: string;
  combustivel?: string;
  municipio?: string;
  uf?: string;
  [key: string]: unknown;
}

export interface AgregadosBasicaResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    veiculo?: AgregadosBasicaVeiculo;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AgregadosBasicaConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
}

/**
 * Consulta dados agregados básicos (dados cadastrais consolidados) de um veículo pela placa.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "agregados-basica", placa, homolog }
 *
 * @param placa   Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)
 * @param config  Configurações opcionais (token, base_url, homolog, timeout)
 */
export async function consultarAgregadosBasica(
  placa: string,
  config?: AgregadosBasicaConfig
): Promise<AgregadosBasicaResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog   = config?.homolog   ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl   = config?.baseUrl   ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const token     = config?.bearerToken ?? (await getToken());

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "agregados-basica",
        placa: p,
        homolog,
      } as AgregadosBasicaPayload),
      signal: controller.signal,
    });
    return await parseResponse<AgregadosBasicaResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}


// ─────────────────────────────────────────────────────────
// DATASET: Agregados Propria
// POST /api/v2/consulta/veiculos/credits  { tipo: "agregados-propria" }
// ─────────────────────────────────────────────────────────

export interface AgregadosPropriaPayload {
  tipo: "agregados-propria";
  placa: string;
  homolog: boolean;
}

export interface AgregadosPropriaVeiculo {
  placa?: string;
  chassi?: string;
  renavam?: string;
  motor?: string;
  marca_modelo?: string;
  ano_fabricacao?: string | number;
  ano_modelo?: string | number;
  cor?: string;
  combustivel?: string;
  municipio?: string;
  uf?: string;
  [key: string]: unknown;
}

export interface AgregadosPropriaResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    veiculo?: AgregadosPropriaVeiculo;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AgregadosPropriaConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
}

/**
 * Consulta dados agregados proprietários (dados cadastrais de base proprietária) de um veículo pela placa.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "agregados-propria", placa, homolog }
 *
 * @param placa   Placa no formato antigo (ABC1234) ou Mercosul (ABC1D23)
 * @param config  Configurações opcionais (token, base_url, homolog, timeout)
 */
export async function consultarAgregadosPropria(
  placa: string,
  config?: AgregadosPropriaConfig
): Promise<AgregadosPropriaResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Use o formato ABC1234 (antigo) ou ABC1D23 (Mercosul).`,
      400
    );
  }

  const homolog   = config?.homolog   ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl   = config?.baseUrl   ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const token     = config?.bearerToken ?? (await getToken());

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "agregados-propria",
        placa: p,
        homolog,
      } as AgregadosPropriaPayload),
      signal: controller.signal,
    });
    return await parseResponse<AgregadosPropriaResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}


// ─────────────────────────────────────────────────────────
// DATASET: Decodificador Chassi (Agregados Chassi)
// POST /api/v2/consulta/veiculos/credits  { tipo: "agregados-chassi" }
// ─────────────────────────────────────────────────────────

export interface AgregadosChassiPayload {
  tipo: "agregados-chassi";
  chassi: string;
  homolog: boolean;
}

export interface AgregadosChassiVeiculo {
  placa?: string;
  chassi?: string;
  renavam?: string;
  motor?: string;
  marca_modelo?: string;
  ano_fabricacao?: string | number;
  ano_modelo?: string | number;
  cor?: string;
  combustivel?: string;
  municipio?: string;
  uf?: string;
  especie?: string;
  tipo?: string;
  carroceria?: string;
  potencia?: string;
  cilindrada?: string;
  capacidade_passageiros?: string | number;
  procedencia?: string;
  [key: string]: unknown;
}

export interface AgregadosChassiResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    veiculo?: AgregadosChassiVeiculo;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AgregadosChassiConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
}

// ─── Validação de Chassi ─────────────────────────────────

const CHASSI_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

export function normalizarChassi(chassi: string): string {
  return chassi.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
}

export function validarChassi(chassi: string): boolean {
  return CHASSI_REGEX.test(normalizarChassi(chassi));
}

/**
 * Consulta dados agregados de um veículo pelo chassi (Decodificador de Chassi).
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "agregados-chassi", chassi, homolog }
 *
 * PROTOCOLO: Rodar em homolog primeiro. Só mudar para produção
 * após autorização explícita do usuário (Denison).
 *
 * @param chassi  Chassi de 17 caracteres alfanuméricos (sem I, O, Q)
 * @param config  Configurações opcionais (token, base_url, homolog, timeout)
 */
export async function consultarAgregadosChassi(
  chassi: string,
  config?: AgregadosChassiConfig
): Promise<AgregadosChassiResponse> {
  const c = normalizarChassi(chassi);
  if (!validarChassi(c)) {
    throw new APIBrasilError(
      `Chassi inválido: "${chassi}". Deve ter 17 caracteres alfanuméricos (sem I, O, Q).`,
      400
    );
  }

  const homolog   = config?.homolog   ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl   = config?.baseUrl   ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const token     = config?.bearerToken ?? (await getToken());

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "agregados-chassi",
        chassi: c,
        homolog,
      } as AgregadosChassiPayload),
      signal: controller.signal,
    });
    return await parseResponse<AgregadosChassiResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}


// ─────────────────────────────────────────────────────────
// DATASET: Veicular Agrupados
// POST /api/v2/consulta/veiculos/credits  { tipo: "veicular-agrupados" }
// Retorna dados agrupados de múltiplos sub-datasets em 1 chamada.
// ─────────────────────────────────────────────────────────

export interface VeicularAgrupadosMap {
  "agregados-propria"?: boolean;
  "fipe"?: boolean;
  "proprietario-atual"?: boolean;
  [key: string]: boolean | undefined;
}

export interface VeicularAgrupadosPayload {
  tipo: "veicular-agrupados";
  placa: string;
  agrupados: VeicularAgrupadosMap;
  homolog: boolean;
}

export interface VeicularAgrupadosFipe {
  codigo_fipe?: string;
  marca?: string;
  modelo?: string;
  ano_modelo?: string;
  combustivel?: string;
  valor?: string;
  referencia?: string;
  [key: string]: unknown;
}

export interface VeicularAgrupadosProprietario {
  nome?: string;
  documento?: string;
  tipo_documento?: string;
  municipio?: string;
  uf?: string;
  data_atualizacao?: string;
  [key: string]: unknown;
}

export interface VeicularAgrupadosVeiculo {
  placa?: string;
  chassi?: string;
  renavam?: string;
  motor?: string;
  marca_modelo?: string;
  ano_fabricacao?: string | number;
  ano_modelo?: string | number;
  cor?: string;
  combustivel?: string;
  municipio?: string;
  uf?: string;
  especie?: string;
  tipo?: string;
  carroceria?: string;
  potencia?: string;
  cilindrada?: string;
  capacidade_passageiros?: string | number;
  procedencia?: string;
  situacao?: string;
  [key: string]: unknown;
}

export interface VeicularAgrupadosResponse {
  status_code?: number;
  error?: boolean;
  message?: string;
  homolog?: boolean;
  data?: {
    veiculo?: VeicularAgrupadosVeiculo;
    fipe?: VeicularAgrupadosFipe;
    proprietario?: VeicularAgrupadosProprietario;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface VeicularAgrupadosConfig {
  bearerToken?: string;
  baseUrl?: string;
  homolog?: boolean;
  timeoutMs?: number;
  agrupados?: VeicularAgrupadosMap;
}

/**
 * Consulta veicular agrupada — retorna dados de múltiplos sub-datasets
 * (agregados-propria, fipe, proprietário) em uma única chamada.
 *
 * Endpoint: POST /api/v2/consulta/veiculos/credits
 * Payload:  { tipo: "veicular-agrupados", placa, agrupados: {...}, homolog }
 *
 * PROTOCOLO: Rodar em homolog primeiro. Só mudar para produção
 * após autorização explícita do usuário (Denison).
 *
 * @param placa     Placa do veículo (7 caracteres)
 * @param config    Configurações opcionais
 */
export async function consultarVeicularAgrupados(
  placa: string,
  config?: VeicularAgrupadosConfig
): Promise<VeicularAgrupadosResponse> {
  const p = normalizarPlaca(placa);
  if (!validarPlaca(p)) {
    throw new APIBrasilError(
      `Placa inválida: "${placa}". Formato esperado: ABC1234 ou ABC1D23.`,
      400
    );
  }

  const homolog   = config?.homolog   ?? process.env.APIBRASIL_HOMOLOG === "true";
  const baseUrl   = config?.baseUrl   ?? BASE_URL;
  const timeoutMs = config?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const token     = config?.bearerToken ?? (await getToken());

  const agrupados: VeicularAgrupadosMap = config?.agrupados ?? {
    "agregados-propria": true,
    "fipe": true,
    "proprietario-atual": true,
  };

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/api/v2/consulta/veiculos/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tipo: "veicular-agrupados",
        placa: p,
        agrupados,
        homolog,
      } as VeicularAgrupadosPayload),
      signal: controller.signal,
    });
    return await parseResponse<VeicularAgrupadosResponse>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new APIBrasilError(`Timeout de requisição após ${timeoutMs / 1000}s`, 408);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
