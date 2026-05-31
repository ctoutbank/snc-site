"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { CSV_COMPLETA_MOCK_CLEAN, CSV_COMPLETA_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos (espelho da estrutura real da API) ─────────────────────────────────

interface PropAtual {
  placa?: string; marca_modelo?: string; chassi?: string; renavam?: string;
  ano_fabricacao?: string; ano_modelo?: string; combustivel?: string; cor_veiculo?: string;
  municipio?: string; uf?: string; motor?: string;
  proprietario_nome?: string; proprietario_documento?: string;
}

interface BinNacional {
  placa?: string; marca_modelo?: string; chassi?: string; renavam?: string;
  ano_fabricacao?: string; ano_modelo?: string; combustivel?: string; cor_veiculo?: string;
  municipio?: string; uf?: string;
  categoria_veiculo?: string; especie_veiculo?: string; tipo_veiculo?: string;
  tipo_carroceria?: string; potencia_veiculo?: string; numero_eixos?: string;
  quantidade_passageiros?: string; procedencia?: string; pbt?: string; situacao?: string;
  data_emissao_crlv?: string; data_emissao_ultimo_crv?: string;
  proprietario?: { nome?: string; documento?: string };
  restricoes?: {
    existe_restricao_geral?: string; existe_restricao_renajud?: string;
    existe_restricao_roubo_furto?: string; mensagens_restricoes?: string[];
    veiculo_baixado?: string;
  };
}

interface CsvCompletaResult {
  pdf?: string;
  veicular?: {
    proprietario_atual_veiculo?: PropAtual;
    bin_nacional?: BinNacional;
    alerta_indicio?: { existe_ocorrencia?: string; descricao_ocorrencia?: string };
    renainf?: { qtd_ocorrencias?: string; ocorrencias?: Record<string, unknown>[] };
    renajud?: { quantidade_ocorrencias?: string; msg_alerta?: string };
    csv?: { quantidade_ocorrencia?: string; ocorrencias?: Record<string, unknown>[]; mensagem_observacao?: string };
    precificador?: { ocorrencias?: { ano_modelo?: string; codigo?: string; fabricante_modelo?: string; informante?: string; preco?: string; vigencia?: string }[] };
    recall?: { quantidade_ocorrencias?: string };
  };
  [key: string]: unknown;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_ACCENT     = "#D4A843";
const COR_ACCENT_DIM = "rgba(212,168,67,0.2)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

function v(val: unknown): string {
  return val == null || val === "" ? "—" : String(val);
}

function num(s: unknown): number {
  return Number(s ?? 0);
}

/**
 * Pluralização de badges: 1 → singular, 2+ → plural.
 * Regra obrigatória do site — nunca usar "(S)" ou "(ÕES)".
 */
function pl(qtd: unknown, singular: string, plural: string): string {
  return num(qtd) === 1 ? `1 ${singular}` : `${num(qtd)} ${plural}`;
}

// ─── Bloco de seção ───────────────────────────────────────────────────────────

function Bloco({ titulo, badge, badgeError, children }: {
  titulo: string; badge?: string; badgeError?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "20px 24px",
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
        color: COR_ACCENT, letterSpacing: "0.22em", textTransform: "uppercase" as const,
        marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${COR_ACCENT_DIM}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {titulo}
        {badge && (
          <span style={{
            padding: "2px 8px", fontSize: 8, fontWeight: 700,
            background: badgeError ? "rgba(192,57,43,0.15)" : "rgba(43,168,74,0.1)",
            color: badgeError ? "#c0392b" : "#2BA84A",
            border: `1px solid ${badgeError ? "rgba(192,57,43,0.3)" : "rgba(43,168,74,0.3)"}`,
            borderRadius: 2,
          }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Linha de dado ────────────────────────────────────────────────────────────

// required=true → sempre renderiza; false → oculta se vazio
// isError → vermelho | isPositive → verde | highlight → dourado | default → branco
function DataRow({ label, value, mono = false, highlight = false, isError = false, isPositive = false, required = false }: {
  label: string; value: React.ReactNode; mono?: boolean; highlight?: boolean; isError?: boolean; isPositive?: boolean; required?: boolean;
}) {
  const isEmpty = value === undefined || value === null || value === "—" || value === "";
  if (!required && isEmpty) return null;
  const display  = isEmpty ? "—" : value;
  const valColor = isEmpty      ? "#5a6a7a"
    : isError    ? "#ef4444"
    : isPositive ? "#2ba84a"
    : highlight  ? COR_ACCENT
    : "#ffffff";
  const isBold = !isEmpty && (isError || isPositive || highlight);
  return (
    <div className="snc-data-row">
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#a0aec0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
        fontSize: 12, color: valColor,
        fontWeight: isBold ? 700 : 400,
      }}>
        {display}
      </span>
    </div>
  );
}

// ─── Separador entre ocorrências ──────────────────────────────────────────────

function OcorrenciaSep() {
  return <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "10px 0" }} />;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function BuscaCsvCompletaPanel() {
  const [placa, setPlaca]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<CsvCompletaResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const { historico, salvar, limpar } = useHistoricoConsultas("csv-completa");

  const handlePlacaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(formatarPlaca(e.target.value));
    setError(null);
  }, []);

  const handleBuscar = useCallback(async () => {
    const cleanPlaca = placa.replace(/[^A-Z0-9]/g, "");
    if (cleanPlaca.length < 7) {
      setError("Placa inválida. Use o formato ABC-1234 (antigo) ou ABC-1D23 (Mercosul).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res  = await fetch("/api/apibrasil/csv-completa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: cleanPlaca, homolog: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Erro ao consultar CSV Completa.");
      // A API retorna { status_code, data: { pdf, veicular: {...} } }
      const mapped: CsvCompletaResult = data.data ?? data;
      setResult(mapped);
      salvar(cleanPlaca, mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa, salvar]);

  const handleExemplo = useCallback((cenario: "clean" | "restricted") => {
    const mockData  = cenario === "clean" ? CSV_COMPLETA_MOCK_CLEAN : CSV_COMPLETA_MOCK_RESTRICTED;
    const placaMock = cenario === "clean" ? "XXX-0000" : "XXX-1111";
    // Popula o card do panel com os dados do mock (mesmo dado que aparece no relatório)
    setPlaca(placaMock);
    setResult(mockData.data as CsvCompletaResult);
    setError(null);
    // Abre o relatório em nova aba
    const { url } = gerarUrlRelatorio("csv-completa", placaMock, "PLACA", mockData.data);
    window.open(url, "_blank");
  }, []);

  const handleGerarRelatorio = useCallback(() => {
    if (!result) return;
    const doc     = result.veicular?.proprietario_atual_veiculo?.placa || placa;
    const { url } = gerarUrlRelatorio("csv-completa", doc, "PLACA", result);
    window.open(url, "_blank");
  }, [result, placa]);

  // ─── Extrair sub-objetos ───────────────────────────────────────────────────
  const veicular   = result?.veicular ?? {};
  const propAtual  = veicular.proprietario_atual_veiculo ?? {};
  const binNac     = veicular.bin_nacional ?? {};
  const restricoes = binNac.restricoes ?? {};
  const alerta     = veicular.alerta_indicio ?? {};
  const renainf    = veicular.renainf ?? {};
  const renajud    = veicular.renajud ?? {};
  const csv        = veicular.csv ?? {};
  const prec       = veicular.precificador ?? {};
  const recall     = veicular.recall ?? {};

  // ─── Status geral ─────────────────────────────────────────────────────────
  const temRestGeral    = restricoes.existe_restricao_geral    === "1";
  const temRestRenajud  = restricoes.existe_restricao_renajud  === "1" || num(renajud.quantidade_ocorrencias) > 0;
  const temRestRoubo    = restricoes.existe_restricao_roubo_furto === "1";
  const temSinistro     = alerta.existe_ocorrencia === "1";
  const temMultas       = num(renainf.qtd_ocorrencias) > 0;
  const temCsvOcorr     = num(csv.quantidade_ocorrencia) > 0;
  const temRestricao    = temRestGeral || temRestRenajud || temRestRoubo || temSinistro || temMultas || temCsvOcorr;

  const modeloLabel = propAtual.marca_modelo || binNac.marca_modelo || "";

  return (
    <div>
      {/* ── Formulário de Busca ── */}
      <div className="search-bar-wrapper" style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 36px", marginBottom: 18,
      }}>
        <div className="search-bar-container" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "stretch" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const,
              pointerEvents: "none", zIndex: 5,
            }}>PLACA</div>
            <input
              id="csv-completa-placa-input"
              type="text"
              autoComplete="off"
              value={placa}
              onChange={handlePlacaChange}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              placeholder="ABC-1234"
              maxLength={8}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.15)", color: "#fff",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 28,
                letterSpacing: "0.14em", padding: "18px 18px 18px 82px",
                outline: "none", textTransform: "uppercase" as const, transition: "border-color 0.15s",
                WebkitBoxShadow: "0 0 0 1000px rgba(14,28,48,1) inset",
              }}
              onFocus={(e) => (e.target.style.borderColor = COR_ACCENT)}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>
          <button
            id="csv-completa-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px", background: loading ? "rgba(212,168,67,0.4)" : COR_ACCENT,
              color: "#0A1628", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
              letterSpacing: "0.12em", textTransform: "uppercase" as const, fontWeight: 700,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s", whiteSpace: "nowrap" as const,
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.6s linear infinite",
                }} />
                Consultando…
              </>
            ) : "Consultar"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            {error}
          </div>
        )}

        {/* Botões de Exemplo */}
        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", display: "flex", alignItems: "center", textTransform: "uppercase" as const, paddingTop: 6 }}>
            Exemplos:
          </span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => handleExemplo("clean")}
              style={{ padding: "6px 14px", border: "1px solid rgba(43,168,74,0.25)", background: "rgba(43,168,74,0.08)", color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", borderRadius: 2 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.15)"; e.currentTarget.style.borderColor = "#2BA84A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.08)"; e.currentTarget.style.borderColor = "rgba(43,168,74,0.25)"; }}
            >
              Exemplo de Relatório (Nada Consta)
            </button>
            <button
              onClick={() => handleExemplo("restricted")}
              style={{ padding: "6px 14px", border: "1px solid rgba(192,57,43,0.25)", background: "rgba(192,57,43,0.08)", color: "#c0392b", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", borderRadius: 2 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.15)"; e.currentTarget.style.borderColor = "#c0392b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.08)"; e.currentTarget.style.borderColor = "rgba(192,57,43,0.25)"; }}
            >
              Exemplo de Relatório (Com Restrições)
            </button>
          </div>
        </div>
      </div>

      {/* ── Resultado ── */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Header do Resultado — padrão do site: kicker · MARCA - MODELO · status */}
          <div style={{
            border: `1px solid ${COR_ACCENT}`,
            background: "rgba(212,168,67,0.02)",
            padding: "20px 28px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: COR_ACCENT, letterSpacing: "0.14em", textTransform: "uppercase" as const, fontWeight: 700 }}>
                CSV COMPLETA · {v(propAtual.placa || placa)}
              </span>
              <span style={{ fontSize: 20, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6 }}>
                {modeloLabel ? modeloLabel.replace("/", " - ") : v(propAtual.placa || placa)}
              </span>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, color: temRestricao ? "#ef4444" : "#2ba84a", fontWeight: 700, letterSpacing: "0.05em" }}>
                {temRestricao ? "RESTRIÇÕES ENCONTRADAS" : "VEÍCULO SEM RESTRIÇÕES"}
                {temMultas ? ` · ${renainf.qtd_ocorrencias} multa(s) RENAINF` : ""}
                {temRestRenajud ? " · RENAJUD" : ""}
                {temRestRoubo ? " · ROUBO/FURTO" : ""}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0, marginLeft: 20 }}>
              <button
                onClick={handleGerarRelatorio}
                style={{
                  padding: "12px 24px", background: "transparent", color: COR_ACCENT,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  fontWeight: 700, border: `1px solid ${COR_ACCENT}`, cursor: "pointer",
                  whiteSpace: "nowrap" as const, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = COR_ACCENT; e.currentTarget.style.color = "#0A1628"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = COR_ACCENT; }}
              >
                Visualizar Relatório
              </button>
            </div>
          </div>

          {/* ── Linha 1: Identificação + Situação/Restrições ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* Bloco: Identificação do Veículo — todos os campos em branco */}
            <Bloco titulo="Identificação do Veículo">
              <DataRow label="Marca / Modelo"   value={propAtual.marca_modelo} required />
              <DataRow label="Placa"             value={propAtual.placa || placa} mono required />
              <DataRow label="Chassi"            value={propAtual.chassi} mono required />
              <DataRow label="RENAVAM"           value={propAtual.renavam} mono required />
              <DataRow label="Motor"             value={propAtual.motor} mono required />
              <DataRow label="Ano Fab. / Mod."   value={propAtual.ano_fabricacao ? `${propAtual.ano_fabricacao} / ${propAtual.ano_modelo || "—"}` : undefined} required />
              <DataRow label="Combustível"       value={propAtual.combustivel} required />
              <DataRow label="Cor"               value={propAtual.cor_veiculo} required />
              <DataRow label="Município / UF"    value={propAtual.municipio ? `${propAtual.municipio} — ${propAtual.uf || ""}` : undefined} required />
              <DataRow label="Proprietário"      value={propAtual.proprietario_nome} required />
              <DataRow label="CPF / CNPJ"        value={propAtual.proprietario_documento} mono required />
            </Bloco>

            {/* Bloco: Situação Geral / Restrições */}
            <Bloco
              titulo="Situação / Restrições BIN"
              badge={temRestricao ? "RESTRIÇÕES ATIVAS" : "REGULAR"}
              badgeError={temRestricao}
            >
              <DataRow
                label="Situação Geral"
                value={v(binNac.situacao)}
                isError={temRestricao} isPositive={!temRestricao} required
              />
              <DataRow
                label="Restrição Geral"
                value={temRestGeral ? "ATIVA" : "LIVRE"}
                isError={temRestGeral} isPositive={!temRestGeral} required
              />
              <DataRow
                label="Restrição RENAJUD"
                value={temRestRenajud ? "ATIVA" : "LIVRE"}
                isError={temRestRenajud} isPositive={!temRestRenajud} required
              />
              <DataRow
                label="Roubo / Furto"
                value={temRestRoubo ? "ATIVO" : "LIVRE"}
                isError={temRestRoubo} isPositive={!temRestRoubo} required
              />
              <DataRow
                label="Veículo Baixado"
                value={restricoes.veiculo_baixado === "1" ? "SIM" : "NÃO"}
                isError={restricoes.veiculo_baixado === "1"}
                isPositive={restricoes.veiculo_baixado !== "1"} required
              />
              <DataRow
                label="Alerta Sinistro"
                value={temSinistro ? "INDÍCIO IDENTIFICADO" : "NADA CONSTA"}
                isError={temSinistro} isPositive={!temSinistro} required
              />
              {temSinistro && alerta.descricao_ocorrencia && (
                <DataRow label="Descrição Sinistro" value={alerta.descricao_ocorrencia} isError />
              )}
              {(restricoes.mensagens_restricoes ?? []).map((msg, i) => (
                <DataRow key={i} label={`Restrição ${i + 1}`} value={msg} isError />
              ))}
            </Bloco>
          </div>

          {/* ── Linha 2: Dados Técnicos + FIPE + Recall ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* Bloco: Dados Técnicos BIN Nacional */}
            <Bloco titulo="Dados Técnicos (BIN Nacional)">
              <DataRow label="Categoria"         value={binNac.categoria_veiculo} />
              <DataRow label="Espécie"           value={binNac.especie_veiculo} />
              <DataRow label="Tipo de Veículo"   value={binNac.tipo_veiculo} />
              <DataRow label="Carroceria"        value={binNac.tipo_carroceria} />
              <DataRow label="Potência (cv)"     value={binNac.potencia_veiculo} />
              <DataRow label="Nº Eixos"          value={binNac.numero_eixos} />
              <DataRow label="Passageiros"       value={binNac.quantidade_passageiros} />
              <DataRow label="Procedência"       value={binNac.procedencia} />
              <DataRow label="PBT (t)"           value={binNac.pbt} />
              <DataRow label="Data Emissão CRLV" value={binNac.data_emissao_crlv} />
              <DataRow label="Data Último CRV"   value={binNac.data_emissao_ultimo_crv} />
            </Bloco>

            {/* Coluna direita: FIPE + Recall */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(prec.ocorrencias?.length ?? 0) > 0 && (
                <Bloco titulo="Precificador FIPE">
                  {prec.ocorrencias?.map((o, i) => (
                    <div key={i}>
                      {i > 0 && <OcorrenciaSep />}
                      <DataRow label="Valor FIPE"  value={o.preco ? `R$ ${o.preco}` : undefined} required />
                      <DataRow label="Código FIPE" value={o.codigo} mono required />
                      <DataRow label="Modelo"      value={o.fabricante_modelo} required />
                      <DataRow label="Vigência"    value={o.vigencia} />
                      <DataRow label="Informante"  value={o.informante} />
                    </div>
                  ))}
                </Bloco>
              )}
              <Bloco titulo="Recall"
                badge={num(recall.quantidade_ocorrencias) > 0 ? pl(recall.quantidade_ocorrencias, "RECALL", "RECALLS") : "NADA CONSTA"}
                badgeError={num(recall.quantidade_ocorrencias) > 0}
              >
                <DataRow
                  label="Recall"
                  value={num(recall.quantidade_ocorrencias) > 0
                    ? `${recall.quantidade_ocorrencias} recall(s) ativo(s)`
                    : "NADA CONSTA"}
                  isError={num(recall.quantidade_ocorrencias) > 0}
                  isPositive={num(recall.quantidade_ocorrencias) === 0}
                  required
                />
              </Bloco>
            </div>
          </div>

          {/* ── RENAINF — Multas ── */}
          <Bloco
            titulo="RENAINF — Multas de Trânsito"
            badge={temMultas ? pl(renainf.qtd_ocorrencias, "MULTA", "MULTAS") : "NADA CONSTA"}
            badgeError={temMultas}
          >
            {!temMultas ? (
              <DataRow label="Situação RENAINF" value="NENHUMA MULTA REGISTRADA NO RENAINF" required />
            ) : (
              (renainf.ocorrencias ?? []).map((inf, i) => {
                const o = inf as Record<string, unknown>;
                return (
                  <div key={i}>
                    {i > 0 && <OcorrenciaSep />}
                    <DataRow label="Auto de Infração" value={v(o.numero_auto_infracao)} mono />
                    <DataRow label="Código"           value={v(o.codigo_infracao)} mono />
                    <DataRow label="Data"             value={v(o.data_infracao)} />
                    <DataRow label="Descrição"        value={v(o.descricao_infracao)} isError />
                    <DataRow label="Órgão Autuador"   value={v(o.orgao_autuador)} />
                    <DataRow label="Valor da Multa"   value={o.valor_multa ? `R$ ${o.valor_multa}` : undefined} isError />
                    <DataRow label="Situação"         value={v(o.situacao)} isError />
                    <DataRow label="Local"            value={v(o.local_infracao)} />
                  </div>
                );
              })
            )}
          </Bloco>

          {/* ── RENAJUD + CSV/BIN ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* RENAJUD */}
            <Bloco
              titulo="RENAJUD — Restrições Judiciais"
              badge={temRestRenajud ? pl(renajud.quantidade_ocorrencias, "RESTRIÇÃO", "RESTRIÇÕES") : "NADA CONSTA"}
              badgeError={temRestRenajud}
            >
              <DataRow
                label="Ocorrências"
                value={num(renajud.quantidade_ocorrencias) === 0 ? "NADA CONSTA" : `${renajud.quantidade_ocorrencias} restrição(ões) judicial(is)`}
                isError={num(renajud.quantidade_ocorrencias) > 0}
                required
              />
              {renajud.msg_alerta && (
                <DataRow label="Alerta RENAJUD" value={renajud.msg_alerta} isError />
              )}
            </Bloco>

            {/* CSV / BIN Ocorrências */}
            <Bloco
              titulo="CSV / BIN — Ocorrências"
              badge={temCsvOcorr ? pl(csv.quantidade_ocorrencia, "OCORRÊNCIA", "OCORRÊNCIAS") : "NADA CONSTA"}
              badgeError={temCsvOcorr}
            >
              <DataRow
                label="Ocorrências CSV"
                value={num(csv.quantidade_ocorrencia) === 0 ? "NADA CONSTA" : `${csv.quantidade_ocorrencia} ocorrência(s) ativa(s)`}
                isError={temCsvOcorr}
                required
              />
              {csv.mensagem_observacao && (
                <DataRow label="Observação" value={csv.mensagem_observacao} isError />
              )}
              {(csv.ocorrencias ?? []).map((o, i) => {
                const oc = o as Record<string, unknown>;
                return (
                  <div key={i}>
                    {i > 0 && <OcorrenciaSep />}
                    <DataRow label="Tipo"     value={v(oc.tipo_restricao || oc.tipo)} isError />
                    <DataRow label="Descrição" value={v(oc.descricao)} isError />
                    <DataRow label="Data"     value={v(oc.data)} />
                    <DataRow label="Órgão"    value={v(oc.orgao)} />
                  </div>
                );
              })}
            </Bloco>
          </div>
        </div>
      )}

      {/* Histórico Recente */}
      <div style={{ marginTop: 32 }}>
        <div
          className="mobile-history-toggle"
          style={{ display: "none" }}
          onClick={(e) => {
            const wrapper = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (wrapper) wrapper.classList.toggle("show-mobile");
          }}
        >
          <span>▸ Histórico de Consultas</span>
        </div>
        <div className="historico-wrapper">
          <HistoricoConsultas
            historico={historico}
            onCarregar={(dadosSelect: unknown, placaSelect: string) => {
              setPlaca(formatarPlaca(placaSelect));
              setResult(dadosSelect as CsvCompletaResult);
              setError(null);
            }}
            onLimpar={limpar}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .mobile-history-toggle { display: flex !important; align-items: center; gap: 8px; cursor: pointer; padding: 10px 0; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5a6a7a; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 8px; }
          .historico-wrapper:not(.show-mobile) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
