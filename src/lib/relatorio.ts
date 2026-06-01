/**
 * relatorio.ts — Utilitários para geração de relatórios SNC
 *
 * Arquitetura sem banco de dados:
 *   Os dados da consulta são serializados em Base64 e embutidos na URL.
 *   A rota /relatorio/snc/[id] lê e renderiza diretamente a partir da URL.
 *
 * Formato da URL gerada:
 *   /relatorio/snc/[id8chars]?d=[base64]
 */

export type DatasetTipo =
  | "vip-car"
  | "veiculo"
  | "proprietario"
  | "credito"
  | "leilao"
  | "renajud"
  | "gravame"
  | "debitos"
  | "estadual"
  | "renainf"
  | "historico-km"
  | "crlve"
  | "csv-completa";

export interface RelatorioPayload {
  dataset: DatasetTipo;
  /** Documento consultado (placa, CPF, etc.) */
  documento: string;
  /** Label do documento (ex: "PLACA", "CPF") */
  documentoLabel: string;
  /** Timestamp ISO da consulta */
  emitidoEm: string;
  /** Dados do resultado (tipagem livre por dataset) */
  resultado: Record<string, unknown>;
}

// ─── Geração de ID curto ──────────────────────────────────────────────────────

/**
 * Gera um ID único de 8 caracteres hexadecimais para o protocolo.
 * Baseado em timestamp + dados, sem dependência de crypto server-side.
 */
export function gerarRelatorioId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return (ts + rand).slice(-8).padStart(8, "0");
}

// ─── Geração do protocolo formatado ──────────────────────────────────────────

/**
 * Retorna o protocolo no formato "2026.MMDD-XXXXXXXX"
 */
export function gerarProtocolo(id: string, data?: Date): string {
  const d = data ?? new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const ano = d.getFullYear();
  return `${ano}.${mm}${dd}-${id}`;
}

// ─── Serialização / deserialização ────────────────────────────────────────────

/**
 * Serializa o payload do relatório para Base64 URL-safe.
 * Usa btoa() nativo (browser + Node), convertendo para URL-safe manualmente.
 */
export function serializarDados(payload: RelatorioPayload): string {
  const json = JSON.stringify(payload);
  // btoa é suportado em browser e Node 16+
  const b64 = btoa(unescape(encodeURIComponent(json)));
  // Converte para URL-safe: + → -, / → _, remove =
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Deserializa o Base64 URL-safe de volta para o payload tipado.
 * Funciona tanto no browser (atob) quanto no Node.js (Buffer).
 * Retorna null em caso de erro de parsing.
 */
export function deserializarDados(base64: string): RelatorioPayload | null {
  try {
    // Reconverte de URL-safe para Base64 padrão + padding
    const b64 = base64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "==".slice(0, (4 - (b64.length % 4)) % 4);

    let json: string;
    if (typeof Buffer !== "undefined") {
      // Node.js (server-side / Next.js SSR)
      json = Buffer.from(padded, "base64").toString("utf-8");
    } else {
      // Browser
      json = decodeURIComponent(escape(atob(padded)));
    }

    const parsed = JSON.parse(json) as RelatorioPayload;
    if (!parsed.dataset || !parsed.documento || !parsed.resultado) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ─── Geração da URL do relatório ─────────────────────────────────────────────

/**
 * Gera a URL completa do relatório.
 * Uso: window.open(gerarUrlRelatorio(...), "_blank")
 */
export function gerarUrlRelatorio(
  dataset: DatasetTipo,
  documento: string,
  documentoLabel: string,
  resultado: Record<string, unknown>
): { url: string; id: string; protocolo: string } {
  const id = gerarRelatorioId();
  const emitidoEm = new Date().toISOString();
  const protocolo = gerarProtocolo(id);

  const payload: RelatorioPayload = {
    dataset,
    documento,
    documentoLabel,
    emitidoEm,
    resultado,
  };

  const d = serializarDados(payload);
  const url = `/relatorio/snc/${id}?d=${d}`;

  return { url, id, protocolo };
}

// ─── Labels e metadados por dataset ──────────────────────────────────────────

const baseMeta: Record<
  string,
  { titulo: string; subtitulo: string; fonte: string; cor: string }
> = {
  "vip-car": {
    titulo: "Relatório Veicular Completo",
    subtitulo: "Identificação, proprietário atual, dados técnicos (motor, potência, cilindrada, carroceria), histórico de roubo/furto, indício de sinistro, infrações de trânsito (RENAINF), precificação FIPE com chassi e documento oficial SENATRAN/DENATRAN.",
    fonte: "DENATRAN / SENATRAN",
    cor: "#7B5EA7",
  },
  veiculo: {
    titulo: "Placa FIPE + Chassi",
    subtitulo: "Dados técnicos do veículo, tabela FIPE e chassi.",
    fonte: "DENATRAN / SENATRAN",
    cor: "#B8914A",
  },
  proprietario: {
    titulo: "Proprietário Atual",
    subtitulo: "Identificação do proprietário atual pela placa.",
    fonte: "DENATRAN / SENATRAN",
    cor: "#4A8AB8",
  },
  credito: {
    titulo: "SCR Bacen + Score de Crédito",
    subtitulo: "Exposição de crédito no Banco Central e score de inadimplência.",
    fonte: "DENATRAN / SENATRAN",
    cor: "#2BA84A",
  },
  leilao: {
    titulo: "Leilão Veicular + Score",
    subtitulo: "Score de risco (pontuação A–E, aceitação, % sobre FIPE, vistoria), indício de sinistro, dados do veículo (marca/modelo, chassi, RENAVAM, cor, motor, câmbio, carroceria, categoria, quilometragem, eixos), histórico de leilões (data, leiloeiro, lote, comitente, pátio, condições e situação do chassi) and checklist de avarias.",
    fonte: "DENATRAN / SENATRAN",
    cor: "#D4A843",
  },
  renajud: {
    titulo: "Restrições RENAJUD",
    subtitulo: "Identificação de restrições judiciais ativas registradas no sistema RENAJUD (órgão judicial, tribunal, número do processo e restrições).",
    fonte: "SENATRAN / CNJ",
    cor: "#5a6a7a",
  },
  gravame: {
    titulo: "Restrições de Gravame",
    subtitulo: "Consulta de gravame e restrição financeira de veículos, identificando agente financeiro, data de inclusão, número do contrato e situação.",
    fonte: "SENATRAN / B3",
    cor: "#D4A843",
  },
  debitos: {
    titulo: "Extrato de Débitos",
    subtitulo: "Consulta consolidada de débitos de veículos (IPVA, licenciamento, multas e restrições financeiras/administrativas ativas).",
    fonte: "DENATRAN / DETRAN",
    cor: "#D4A843",
  },
  estadual: {
    titulo: "Base Estadual Detran",
    subtitulo: "Dados cadastrais primários, restrições ativas (gravames judiciais e administrativos) e débitos locais diretamente da base do DETRAN do estado de registro do veículo (IPVA, licenciamento, multas estaduais).",
    fonte: "DETRAN Estadual",
    cor: "#D4A843",
  },
  renainf: {
    titulo: "Multas Renainf",
    subtitulo: "Consulta nacional de multas de trânsito registradas no Registro Nacional de Infrações de Trânsito (RENAINF).",
    fonte: "SENATRAN / RENAINF",
    cor: "#D4A843",
  },
  "historico-km": {
    titulo: "Histórico de Quilometragem",
    subtitulo: "Rastreamento da quilometragem registrada ao longo da vida útil do veículo, identificando inconsistências e possível adulteração de odômetro.",
    fonte: "DENATRAN / DETRAN / Seguradoras",
    cor: "#D4A843",
  },
  crlve: {
    titulo: "Emissão de CRLV-e",
    subtitulo: "Emissão e visualização do Certificado de Registro e Licenciamento de Veículo Digital oficial em formato PDF.",
    fonte: "SENATRAN / DETRAN",
    cor: "#2BA84A",
  },
  "csv-completa": {
    titulo: "CSV Completa",
    subtitulo: "Consulta veicular unificada: RENAINF (multas nacionais), RENAJUD (restrições judiciais), BIN (bloqueios administrativos) e dados do proprietário em uma única chamada.",
    fonte: "SENATRAN / RENAINF / RENAJUD / BIN",
    cor: "#D4A843",
  },
};

export const DATASET_META = baseMeta as Record<
  DatasetTipo,
  { titulo: string; subtitulo: string; fonte: string; cor: string }
>;
