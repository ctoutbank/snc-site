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

// ─── Tipos de dataset suportados ──────────────────────────────────────────────

export type DatasetTipo = "vip-car" | "veiculo" | "proprietario" | "credito";

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

export const DATASET_META: Record<
  DatasetTipo,
  { titulo: string; subtitulo: string; fonte: string; cor: string }
> = {
  "vip-car": {
    titulo: "Relatório Completo do Veículo",
    subtitulo: "Identificação, proprietário, restrições, histórico de roubo/furto, infrações de trânsito (RENAINF), precificação FIPE e documento oficial SENATRAN/DENATRAN.",
    fonte: "DENATRAN / SENATRAN",
    cor: "#7B5EA7",
  },
  veiculo: {
    titulo: "Relatório Completo do Veículo",
    subtitulo: "Dados técnicos do veículo, tabela FIPE e chassi.",
    fonte: "DENATRAN / SENATRAN",
    cor: "#B8914A",
  },
  proprietario: {
    titulo: "Relatório Completo do Veículo",
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
};
