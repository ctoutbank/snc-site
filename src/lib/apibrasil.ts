/**
 * APIBrasil — Cliente REST
 * Documentação: https://doc.apibrasil.io
 *
 * Autenticação via Bearer Token:
 * 1. POST /auth/login → obtém token
 * 2. Token é reutilizado enquanto válido (cache em memória)
 */

const BASE_URL = "https://api.apibrasil.io";

// Cache simples do token em memória (válido por 1h)
let _token: string | null = null;
let _tokenExpiry: number | null = null;

async function getToken(): Promise<string> {
  // 1ª prioridade: Bearer Token pré-configurado (sem latência de login)
  const staticToken = process.env.APIBRASIL_BEARER_TOKEN;
  if (staticToken) return staticToken;

  // 2ª prioridade: login dinâmico com email/senha
  const now = Date.now();
  if (_token && _tokenExpiry && now < _tokenExpiry) {
    return _token;
  }

  const email = process.env.APIBRASIL_EMAIL;
  const password = process.env.APIBRASIL_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "APIBrasil: configure APIBRASIL_BEARER_TOKEN ou as variáveis APIBRASIL_EMAIL e APIBRASIL_PASSWORD."
    );
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`APIBrasil auth falhou (${res.status}): ${body}`);
  }

  const data = await res.json();
  const token: string = data.token ?? data.access_token ?? data.data?.token;

  if (!token) {
    throw new Error("APIBrasil: token não encontrado na resposta de login.");
  }

  _token = token;
  _tokenExpiry = now + 55 * 60 * 1000; // expira em 55 min (margem de segurança)
  return token;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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
    throw new Error(`APIBrasil ${path} → ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────
// Consultas disponíveis
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
  gia?: string;
  ddd?: string;
  siafi?: string;
  [key: string]: unknown;
}

/** Consulta dados de um CNPJ */
export async function consultarCNPJ(cnpj: string): Promise<CNPJData> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  return apiFetch<CNPJData>(`/cnpj/${cnpjLimpo}`);
}

/** Consulta dados de um CEP */
export async function consultarCEP(cep: string): Promise<CEPData> {
  const cepLimpo = cep.replace(/\D/g, "");
  return apiFetch<CEPData>(`/cep/${cepLimpo}`);
}
