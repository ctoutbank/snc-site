/**
 * APIBrasil — Cliente REST
 * Documentação: https://doc.apibrasil.io
 *
 * Autenticação via Bearer Token:
 * 1ª prioridade: APIBRASIL_BEARER_TOKEN (direto, sem latência)
 * 2ª prioridade: login dinâmico com APIBRASIL_EMAIL + APIBRASIL_PASSWORD
 */

const BASE_URL = "https://gateway.apibrasil.io";

// Cache de token em memória (fallback para login dinâmico)
let _token: string | null = null;
let _tokenExpiry: number | null = null;

async function getToken(): Promise<string> {
  // 1ª prioridade: Bearer Token pré-configurado (zero latência)
  const staticToken = process.env.APIBRASIL_BEARER_TOKEN;
  if (staticToken) return staticToken;

  // 2ª prioridade: login dinâmico com email/senha
  const now = Date.now();
  if (_token && _tokenExpiry && now < _tokenExpiry) return _token;

  const email = process.env.APIBRASIL_EMAIL;
  const password = process.env.APIBRASIL_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "[APIBrasil] Configure APIBRASIL_BEARER_TOKEN ou APIBRASIL_EMAIL + APIBRASIL_PASSWORD."
    );
  }

  const res = await fetch(`${BASE_URL}/api/oauth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[APIBrasil] Auth falhou (${res.status}): ${body}`);
  }

  const data = await res.json();
  const token: string =
    data.token ?? data.access_token ?? data.data?.token ?? data.data?.access_token;

  if (!token) throw new Error("[APIBrasil] Token não encontrado na resposta.");

  _token = token;
  _tokenExpiry = now + 55 * 60 * 1000; // expira em 55 min (margem de segurança)
  return token;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[APIBrasil] ${path} → ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// Consultas
// ─────────────────────────────────────────

/** Consulta dados completos de um CNPJ */
export async function consultarCNPJ(cnpj: string): Promise<CNPJData> {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) throw new Error("CNPJ deve ter 14 dígitos.");
  return apiFetch<CNPJData>(`/api/consulta/cnpj?cnpj=${digits}`);
}

/** Consulta endereço por CEP */
export async function consultarCEP(cep: string): Promise<CEPData> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) throw new Error("CEP deve ter 8 dígitos.");
  return apiFetch<CEPData>(`/api/consulta/cep?cep=${digits}`);
}
