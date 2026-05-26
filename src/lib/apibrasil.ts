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
    super(`[APIBrasil] ${message}`);
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
