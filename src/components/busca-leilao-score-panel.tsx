"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { LEILAO_MOCK_CLEAN, LEILAO_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos mapeados ───────────────────────────────────────────────────────────

interface LeilaoScore {
  pontuacao?: string | null;
  aceitacao?: string | null;
  descricaoPontuacao?: string | null;
  exigeVistoriaEspecial?: string | null;
  percentualSobreFipe?: string | null;
}

interface LeilaoDadosVeiculo {
  placa?: string | null;
  marcaModelo?: string | null;
  anoFabricacao?: string | null;
  anoModelo?: string | null;
  chassi?: string | null;
  renavam?: string | null;
  cor?: string | null;
  combustivel?: string | null;
  motor?: string | null;
  cambio?: string | null;
  carroceria?: string | null;
  categoria?: string | null;
  kilometragem?: string | null;
  qtdEixos?: string | null;
  eixoTraseiro?: string | null;
}

interface LeilaoSinistro {
  existeOcorrencia: boolean;
  descricao?: string | null;
}

interface LeilaoOcorrencia {
  dataLeilao: string;
  leiloeiro: string;
  lote: string;
  comitente: string;
  patio: string;
  condicaoGeral: string;
  condicaoMotor: string;
  condicaoMecanica: string;
  condicaoCambio: string;
  situacaoChassi: string;
  observacoes: string;
  imagens: string[];
}

interface LeilaoCheckList {
  airbags?: string | null;
  frente?: string | null;
  traseira?: string | null;
  lateralDireita?: string | null;
  lateralEsquerda?: string | null;
  teto?: string | null;
  interior?: string | null;
  localQueimado?: string | null;
  rodasFaltantes?: string | null;
  observacoes?: string | null;
}

interface SinistroRegistro {
  data: string;
  tipo: string;
  seguradora: string;
  valor: string;
  situacao: string;
  descricao: string;
}

interface LeilaoResult {
  score: LeilaoScore | null;
  dadosVeiculo: LeilaoDadosVeiculo | null;
  sinistro: LeilaoSinistro | null;
  checkList: LeilaoCheckList | null;
  totalOcorrencias: number;
  ocorrencias: LeilaoOcorrencia[];
  historicoSinistros?: SinistroRegistro[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

const COR_ACCENT = "#D4A843";
const COR_ACCENT_DIM = "rgba(212,168,67,0.2)";

// ─── Bloco de seção ───────────────────────────────────────────────────────────
function Bloco({ titulo, badge, children }: {
  titulo: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div className="snc-bloco" style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "28px 28px",
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
        color: COR_ACCENT, letterSpacing: "0.22em", textTransform: "uppercase" as const,
        marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${COR_ACCENT_DIM}`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        {titulo}
        {badge && (
          <span style={{
            background: COR_ACCENT_DIM, color: COR_ACCENT, padding: "2px 8px",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
          }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Componente Gradiente ─────────────────────────────────────────────────────
function GradientBar({ percentual }: { percentual: string | number }) {
  const p = Number(String(percentual).replace('%', '').trim());
  if (isNaN(p)) return <span>—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 300 }}>
      <div style={{
        flex: 1, minWidth: 120, height: 6, background: "rgba(255,255,255,0.1)",
        borderRadius: 3, overflow: "hidden", position: "relative"
      }}>
        <div style={{
          width: `${p}%`, height: "100%",
          background: "linear-gradient(90deg, #ef4444 0%, #D4A843 50%, #32C85A 100%)",
          borderRadius: 3, transition: "width 1s ease-out"
        }} />
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#fff", fontWeight: 700, width: 40, textAlign: "right" }}>
        {p}%
      </span>
    </div>
  );
}

// ─── Helper de colorização do checklist/condições ──────────────────────────────
function renderChecklistValue(val?: string | null) {
  if (!val || val === "—") return "—";
  const lower = val.toLowerCase();
  
  const isOk = lower.includes("sem") || lower.includes("não") || lower.includes("nao") || lower.includes("nada") || lower === "ok" || lower === "normal" || lower === "bom" || lower === "excelente" || lower.includes("ativo") || lower.includes("regular");
  const isAvaria = lower.includes("avaria") || lower.includes("sim") || lower.includes("amassado") || lower.includes("riscado") || lower.includes("queimado") || lower.includes("faltante") || lower.includes("adulterado") || lower.includes("sinistro");
  
  if (isOk) {
    return <span style={{ color: "#2BA84A", fontWeight: 700 }}>{val}</span>;
  }
  if (isAvaria) {
    return <span style={{ color: "#ef4444", fontWeight: 700 }}>{val}</span>;
  }
  
  if (lower === "sim") return <span style={{ color: "#ef4444", fontWeight: 700 }}>{val}</span>;
  if (lower === "não" || lower === "nao") return <span style={{ color: "#2BA84A", fontWeight: 700 }}>{val}</span>;

  return <span>{val}</span>;
}

// ─── Linha de dado ────────────────────────────────────────────────────────────
function DataRow({ label, value, mono = false, highlight = false, amber = false }: {
  label: string; value: React.ReactNode; mono?: boolean; highlight?: boolean; amber?: boolean;
}) {
  if (value === undefined || value === null || value === "—" || value === "") return null;

  let valColor = "#ffffff";
  if (highlight) valColor = "#ef4444";
  else if (amber) valColor = "#D4A843";

  return (
    <div className="snc-data-row">
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#a0aec0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'JetBrains Mono', monospace",
        fontSize: 12, color: valColor, fontWeight: highlight || amber ? 700 : 400,
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Indicador booleano ───────────────────────────────────────────────────────
function IndicadorBool({ label, valor }: { label: string; valor: boolean }) {
  return (
    <div className="snc-data-row">
      <div style={{ display: "flex", alignItems: "center", gap: 10, gridColumn: "1 / -1" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: valor ? "#ef4444" : "#32C85A", flexShrink: 0 }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#a0aec0", letterSpacing: "0.1em", textTransform: "uppercase" as const, flex: 1 }}>
          {label}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: valor ? "#ef4444" : "#32C85A", fontWeight: 700 }}>
          {valor ? "SIM" : "NÃO"}
        </span>
      </div>
    </div>
  );
}

// ─── Score Badge ──────────────────────────────────────────────────────────────
function scoreCor(pontuacao?: string | null): string {
  if (!pontuacao) return "#5a6a7a";
  if (pontuacao === "A") return "#22c55e"; // Verde vibrante (Excelente)
  if (pontuacao === "B") return "#84cc16"; // Verde limão (Bom)
  if (pontuacao === "C") return "#eab308"; // Amarelo/Dourado (Regular)
  if (pontuacao === "D") return "#f97316"; // Laranja (Risco)
  if (pontuacao === "E") return "#ef4444"; // Vermelho (Inaceitável)
  return "#5a6a7a"; // Cinza escuro
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export function BuscaLeilaoScorePanel() {
  const [placa, setPlaca]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState<string | null>(null);
  const [resultado, setResultado] = useState<LeilaoResult | null>(null);
  const [activeTab, setActiveTab] = useState<"geral" | "veiculo" | "historico" | "inspecao">("geral");
  const { historico, salvar, limpar } = useHistoricoConsultas("leilao");
  const [isFromHistory, setIsFromHistory] = useState(false);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(formatarPlaca(e.target.value));
    setErro(null);
  }, []);

  const handleBuscar = useCallback(async () => {
    const clean = placa.replace(/[^A-Z0-9]/g, "");
    if (clean.length < 7) {
      setErro("Placa inválida. Use o formato ABC-1234 (antigo) ou ABC-1D23 (Mercosul).");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setActiveTab("geral");
    setIsFromHistory(false);
    try {
      const res  = await fetch(`/api/apibrasil/leilao-score?placa=${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na consulta.");
      setResultado(data.leilao as LeilaoResult);
      salvar(clean, data.leilao as Record<string, unknown>);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa]);

  const handleExemplo = useCallback(async (cenario: "clean" | "restricted") => {
    const isClean = cenario === "clean";
    const placaSimulada = isClean ? "XXX-0000" : "XXX-1111";
    const mockData = isClean ? LEILAO_MOCK_CLEAN : LEILAO_MOCK_RESTRICTED;
    // Popula o card do painel com os dados do mock (mesmo dado que aparece no relatório)
    setPlaca(placaSimulada);
    setResultado(mockData as unknown as LeilaoResult);
    setErro(null);
    // Abre o relatório em nova aba
    const { url } = await gerarUrlRelatorio("leilao", placaSimulada, "PLACA", mockData);
    window.open(url, "_blank");
  }, []);

  const r = resultado;

  return (
    <div>
      {/* ── Input ── */}
      <div className="search-bar-wrapper" style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 36px", marginBottom: 18,
      }}>
        <div className="search-bar-container" style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const,
              pointerEvents: "none",
            }}>
              PLACA
            </div>
            <input
              id="leilao-score-placa-input"
              type="text"
              autoComplete="off"
              value={placa}
              onChange={handleChange}
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
            id="leilao-score-consultar-btn"
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
        {erro && (
          <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            {erro}
          </div>
        )}

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", display: "flex", alignItems: "center", textTransform: "uppercase", paddingTop: 6 }}>Exemplos:</span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={async () => handleExemplo("clean")}
            style={{
              padding: "6px 14px", background: "rgba(43,168,74,0.08)", color: "#2BA84A",
              border: "1px solid rgba(43,168,74,0.25)", borderRadius: 2,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: "pointer",
              transition: "all 0.15s", textTransform: "uppercase"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(43,168,74,0.15)";
              e.currentTarget.style.borderColor = "#2BA84A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(43,168,74,0.08)";
              e.currentTarget.style.borderColor = "rgba(43,168,74,0.25)";
            }}
          >
            Exemplo de Relatório (Nada Consta)
          </button>
          <button
            onClick={async () => handleExemplo("restricted")}
            style={{
              padding: "6px 14px", background: "rgba(192,57,43,0.08)", color: "#c0392b",
              border: "1px solid rgba(192,57,43,0.25)", borderRadius: 2,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: "pointer",
              transition: "all 0.15s", textTransform: "uppercase"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(192,57,43,0.15)";
              e.currentTarget.style.borderColor = "#c0392b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(192,57,43,0.08)";
              e.currentTarget.style.borderColor = "rgba(192,57,43,0.25)";
            }}
          >
            Exemplo de Relatório (Com Sinistro)
          </button>
          </div>
        </div>
      </div>



      {/* ── Resultado ── */}
      {r && (
        <div id="leilao-resultado" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* ── Cabeçalho do Resultado & Botão Gerar Relatório ── */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${COR_ACCENT}`,
            padding: "20px 28px", marginBottom: 12
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700 }}>LEILÃO · {placa.toUpperCase()}</span>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em" }}>
                {r.dadosVeiculo?.marcaModelo ? r.dadosVeiculo.marcaModelo.replace('/', ' - ') : 'Veículo'}
              </span>
              <span style={{
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, fontWeight: 700, letterSpacing: "0.05em",
                color: (r.totalOcorrencias ?? 0) > 0 || r.sinistro?.existeOcorrencia ? "#ef4444" : "#2ba84a",
              }}>
                {(r.totalOcorrencias ?? 0) > 0
                  ? `${r.totalOcorrencias} LEILÃO(ÕES) ENCONTRADO(S)`
                  : "NADA CONSTA"}
                {r.sinistro?.existeOcorrencia ? " · SINISTRO" : ""}
                {r.score?.pontuacao ? ` · SCORE ${r.score.pontuacao}` : ""}
              </span>
            </div>
            <button
              onClick={async () => {
                const clean = placa.replace(/[^A-Z0-9]/g, "");
                const { url } = await gerarUrlRelatorio("leilao", clean, "PLACA", r as unknown as Record<string, unknown>);
                window.open(url, "_blank");
              }}
              style={isFromHistory ? {
                padding: "12px 24px", background: "rgba(255,255,255,0.04)", color: "#cfd6df",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                fontWeight: 700, border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all 0.2s"
              } : {
                padding: "12px 24px", background: COR_ACCENT, color: "#0a1628",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => {
                if (isFromHistory) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = "#fff";
                } else {
                  e.currentTarget.style.background = "#b8913c";
                }
              }}
              onMouseOut={(e) => {
                if (isFromHistory) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.color = "#cfd6df";
                } else {
                  e.currentTarget.style.background = COR_ACCENT;
                }
              }}
            >
              {isFromHistory ? "Visualizar Relatório" : "Gerar Relatório"}
            </button>
          </div>

          {/* ── Menu de Abas ── */}
          <div className="guias-container" style={{
            display: "flex",
            gap: 4,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: 4,
            marginBottom: 16,
            flexWrap: "wrap"
          }}>
            <button
              onClick={async () => setActiveTab("geral")}
              style={{
                flex: 1, minWidth: 150, padding: "14px 16px",
                background: activeTab === "geral" ? "rgba(212,168,67,0.12)" : "transparent",
                color: activeTab === "geral" ? COR_ACCENT : "#8a94a3",
                border: "none", cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                transition: "all 0.2s",
                borderBottom: `2px solid ${activeTab === "geral" ? COR_ACCENT : "transparent"}`,
              }}
            >
              Dados & Score
            </button>
            <button
              onClick={async () => setActiveTab("historico")}
              style={{
                flex: 1, minWidth: 150, padding: "14px 16px",
                background: activeTab === "historico" ? "rgba(212,168,67,0.12)" : "transparent",
                color: activeTab === "historico" ? COR_ACCENT : "#8a94a3",
                border: "none", cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                transition: "all 0.2s",
                borderBottom: `2px solid ${activeTab === "historico" ? COR_ACCENT : "transparent"}`,
              }}
            >
              Histórico ({r.totalOcorrencias})
            </button>
            {r.checkList && (
              <button
                onClick={async () => setActiveTab("inspecao")}
                style={{
                  flex: 1, minWidth: 150, padding: "14px 16px",
                  background: activeTab === "inspecao" ? "rgba(212,168,67,0.12)" : "transparent",
                  color: activeTab === "inspecao" ? COR_ACCENT : "#8a94a3",
                  border: "none", cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  transition: "all 0.2s",
                  borderBottom: `2px solid ${activeTab === "inspecao" ? COR_ACCENT : "transparent"}`,
                }}
              >
                Checklist Avarias
              </button>
            )}
          </div>

          {/* ── Conteúdo das Abas ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Aba 1: Dados & Score */}
            {activeTab === "geral" && (() => {
              const sinistros = r.historicoSinistros || [];
              return (
                <>
                  {/* Tabela de Dados do Veículo (Especificações) */}
                  {r.dadosVeiculo && (
                    <Bloco titulo="Dados do Veículo">
                      <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                        <div>
                          <DataRow label="Placa" value={r.dadosVeiculo.placa ?? "—"} mono />
                          <DataRow label="Marca/Modelo" value={r.dadosVeiculo.marcaModelo ? r.dadosVeiculo.marcaModelo.replace('/', ' - ') : "—"} />
                          <DataRow label="Ano Fabricação" value={r.dadosVeiculo.anoFabricacao ?? "—"} mono />
                          <DataRow label="Ano Modelo" value={r.dadosVeiculo.anoModelo ?? "—"} mono />
                          <DataRow label="Chassi" value={r.dadosVeiculo.chassi ?? "—"} mono />
                          <DataRow label="RENAVAM" value={r.dadosVeiculo.renavam ?? "—"} mono />
                          <DataRow label="Cor" value={r.dadosVeiculo.cor ?? "—"} />
                          <DataRow label="Combustível" value={r.dadosVeiculo.combustivel ?? "—"} />
                        </div>
                        <div>
                          <DataRow label="Motor" value={r.dadosVeiculo.motor ?? "—"} mono />
                          <DataRow label="Câmbio" value={r.dadosVeiculo.cambio ?? "—"} />
                          <DataRow label="Carroceria" value={r.dadosVeiculo.carroceria ?? "—"} />
                          <DataRow label="Categoria" value={r.dadosVeiculo.categoria ?? "—"} />
                          <DataRow label="Kilometragem" value={r.dadosVeiculo.kilometragem ? `${parseInt(r.dadosVeiculo.kilometragem).toLocaleString("pt-BR")} km` : "—"} />
                          <DataRow label="Qtd. Eixos" value={r.dadosVeiculo.qtdEixos ?? "—"} />
                          <DataRow label="Eixo Traseiro" value={r.dadosVeiculo.eixoTraseiro ?? "—"} />
                        </div>
                      </div>
                    </Bloco>
                  )}

                  {/* Score de Leilão */}
                  {r.score && (
                    <Bloco titulo="Score de Leilão">
                      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16 }}>
                        <div style={{
                          fontFamily: "'Libre Caslon Text', serif", fontSize: 64,
                          color: scoreCor(r.score.pontuacao), lineHeight: 1,
                          display: "flex", alignItems: "baseline", gap: 8,
                        }}>
                          {r.score.pontuacao ?? "—"}
                        </div>
                        <div>
                          <div style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                            color: scoreCor(r.score.pontuacao), fontWeight: 700,
                            letterSpacing: "0.1em", textTransform: "uppercase" as const,
                          }}>
                            {r.score.descricaoPontuacao ?? "—"}
                          </div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#a0aec0", marginTop: 4 }}>
                            Pontuação A–E · A = menor risco
                          </div>
                        </div>
                      </div>
                      <DataRow label="Aceitação Comercial" value={r.score.aceitacao ? <GradientBar percentual={r.score.aceitacao} /> : "—"} />
                      <DataRow label="% Sobre Tabela FIPE" value={r.score.percentualSobreFipe ? <GradientBar percentual={r.score.percentualSobreFipe} /> : "—"} />
                      <DataRow label="Exige Vistoria" value={r.score.exigeVistoriaEspecial ?? "—"} />

                      {/* Legenda de faixas de Score com quadradinhos coloridos */}
                      <div style={{
                        marginTop: 20,
                        paddingTop: 16,
                        borderTop: "1px solid rgba(255,255,255,0.12)",
                      }}>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9,
                          color: COR_ACCENT,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: 12
                        }}>Faixas de Classificação do Score</div>

                        <div className="score-legend-grid" style={{
                           display: "grid",
                           gridTemplateColumns: "1fr 1fr",
                           gap: "12px 24px",
                           alignItems: "center"
                        }}>
                          {[
                            { l: "A", cor: "#22c55e", desc: "Excelente (Baixíssimo Risco)" },
                            { l: "B", cor: "#84cc16", desc: "Bom (Baixo Risco)" },
                            { l: "C", cor: "#eab308", desc: "Regular (Médio Risco)" },
                            { l: "D", cor: "#f97316", desc: "Risco (Alto Risco)" },
                            { l: "E", cor: "#ef4444", desc: "Inaceitável (Altíssimo Risco)" }
                          ].map((item) => (
                            <div key={item.l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 16,
                                height: 16,
                                background: item.cor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: item.l === "D" || item.l === "E" ? "#ffffff" : "#0A1628",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 9,
                                fontWeight: 700,
                                borderRadius: 2
                              }}>
                                {item.l}
                              </div>
                              <span style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 11,
                                color: "#cfd6df"
                              }}>
                                {item.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Bloco>
                  )}

                  {/* Indício de Sinistro */}
                  {r.sinistro && (
                    <Bloco titulo="Indício de Sinistro">
                      <div style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12
                      }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%",
                          background: r.sinistro.existeOcorrencia ? "rgba(239,68,68,0.08)" : "rgba(43,168,74,0.08)",
                          border: r.sinistro.existeOcorrencia ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(43,168,74,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12,
                          color: r.sinistro.existeOcorrencia ? "#ef4444" : "#2BA84A",
                          fontWeight: 700
                        }}>
                          {r.sinistro.existeOcorrencia ? "✕" : "✓"}
                        </div>
                        <div>
                          <div style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
                            color: r.sinistro.existeOcorrencia ? "#ef4444" : "#2BA84A", letterSpacing: "0.08em"
                          }}>
                            {r.sinistro.existeOcorrencia ? "OCORRÊNCIA CONSTATADA" : "NADA CONSTA DE SINISTRO"}
                          </div>
                        </div>
                      </div>
                      {r.sinistro.descricao && (
                        <DataRow label="Descrição" value={r.sinistro.descricao} highlight={r.sinistro.existeOcorrencia} />
                      )}
                    </Bloco>
                  )}

                  {/* Histórico de Sinistros */}
                  {sinistros.length > 0 && (
                    <Bloco titulo="Histórico de Sinistros" badge={`${sinistros.length} registro${sinistros.length !== 1 ? "s" : ""}`}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {sinistros.map((s, idx) => (
                          <div key={idx} style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            padding: "20px 24px",
                          }}>
                            <div style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              marginBottom: 14, paddingBottom: 10,
                              borderBottom: "1px solid rgba(255,255,255,0.06)",
                            }}>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>
                                Sinistro #{idx + 1} · {s.tipo}
                              </span>
                              <span style={{
                                padding: "4px 10px",
                                border: "1px solid rgba(239,68,68,0.3)",
                                background: "rgba(239,68,68,0.1)",
                                color: "#ef4444",
                                fontSize: 9,
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 700,
                                letterSpacing: "0.08em"
                              }}>
                                {s.situacao}
                              </span>
                            </div>
                            <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                              <div>
                                <DataRow label="Data" value={s.data} mono />
                                <DataRow label="Seguradora" value={s.seguradora} />
                              </div>
                              <div>
                                <DataRow label="Valor" value={s.valor} highlight />
                                <DataRow label="Descrição / Avaria" value={s.descricao} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Bloco>
                  )}
                </>
              );
            })()}

            {/* Aba 3: Histórico de Leilões */}
            {activeTab === "historico" && (
              <Bloco titulo="Histórico de Leilões" badge={`${r.totalOcorrencias} registro${r.totalOcorrencias !== 1 ? "s" : ""}`}>
                {r.ocorrencias.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {r.ocorrencias.map((o, i) => (
                      <div key={i} style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        padding: "20px 24px",
                      }}>
                        <div style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          marginBottom: 14, paddingBottom: 10,
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>
                            Leilão #{i + 1} · {o.dataLeilao}
                          </span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a" }}>
                            Lote {o.lote}
                          </span>
                        </div>
                        <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                          <div>
                            <DataRow label="Data" value={o.dataLeilao} mono />
                            <DataRow label="Leiloeiro" value={o.leiloeiro} />
                            <DataRow label="Lote" value={o.lote} mono />
                            <DataRow label="Comitente" value={o.comitente} />
                            <DataRow label="Pátio" value={o.patio} />
                          </div>
                          <div>
                            <DataRow label="Cond. Geral" value={renderChecklistValue(o.condicaoGeral)} />
                            <DataRow label="Cond. Motor" value={renderChecklistValue(o.condicaoMotor)} />
                            <DataRow label="Cond. Mecânica" value={renderChecklistValue(o.condicaoMecanica)} />
                            <DataRow label="Cond. Câmbio" value={renderChecklistValue(o.condicaoCambio)} />
                            <DataRow label="Situação Chassi" value={renderChecklistValue(o.situacaoChassi)} />
                          </div>
                        </div>
                        {o.observacoes && o.observacoes !== "—" && (
                          <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(212,168,67,0.06)", border: "1px solid rgba(212,168,67,0.15)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3" }}>
                            OBSERVAÇÕES: {o.observacoes}
                          </div>
                        )}
                        {o.imagens && o.imagens.length > 0 && (
                          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {o.imagens.map((img, j) => (
                              <a key={j} href={img} target="_blank" rel="noopener noreferrer" style={{
                                padding: "4px 10px", background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.2)",
                                fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: COR_ACCENT,
                                letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase" as const,
                              }}>
                                Imagem {j + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#2BA84A", padding: "12px 0" }}>
                    Nenhum registro de leilão encontrado
                  </div>
                )}
              </Bloco>
            )}

            {/* Aba 4: Checklist de Avarias */}
            {activeTab === "inspecao" && r.checkList && (
              <Bloco titulo="Checklist de Avarias">
                <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                  <div>
                    <DataRow label="Frente" value={renderChecklistValue(r.checkList.frente)} />
                    <DataRow label="Traseira" value={renderChecklistValue(r.checkList.traseira)} />
                    <DataRow label="Lateral Direita" value={renderChecklistValue(r.checkList.lateralDireita)} />
                    <DataRow label="Lateral Esquerda" value={renderChecklistValue(r.checkList.lateralEsquerda)} />
                    <DataRow label="Teto" value={renderChecklistValue(r.checkList.teto)} />
                  </div>
                  <div>
                    <DataRow label="Interior" value={renderChecklistValue(r.checkList.interior)} />
                    <DataRow label="Airbags" value={renderChecklistValue(r.checkList.airbags)} />
                    <DataRow label="Local Queimado" value={renderChecklistValue(r.checkList.localQueimado)} />
                    <DataRow label="Rodas Faltantes" value={renderChecklistValue(r.checkList.rodasFaltantes)} />
                    <DataRow label="Observações" value={renderChecklistValue(r.checkList.observacoes)} />
                  </div>
                </div>
              </Bloco>
            )}
          </div>

        </div>
      )}

      {/* Botão para abrir Histórico no Mobile */}
      <div className="mobile-history-toggle" style={{ display: "none", marginTop: 24 }}>
        <button
          onClick={async () => setShowHistoryMobile(!showHistoryMobile)}
          style={{
            width: "100%",
            padding: "14px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${showHistoryMobile ? COR_ACCENT : "rgba(255,255,255,0.12)"}`,
            color: showHistoryMobile ? COR_ACCENT : "#cfd6df",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          {showHistoryMobile ? "✕ Fechar Histórico" : "📋 Histórico de Consultas"}
        </button>
      </div>

      <div className={`historico-wrapper ${showHistoryMobile ? "show-mobile" : ""}`}>
        {/* ── Histórico de Consultas ── */}
        <HistoricoConsultas
          historico={historico}
          onCarregar={(dados, p) => {
            setPlaca(p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p);
            setResultado(dados as unknown as LeilaoResult);
            setActiveTab("geral");
            setErro(null);
            setIsFromHistory(true);
            setShowHistoryMobile(false); // Fecha no mobile ao carregar
          }}
          onLimpar={limpar}
          corAccent="#D4A843"
          scrollTargetId="leilao-resultado"
        />
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media (max-width: 768px) {
          .search-bar-wrapper {
            padding: 20px 16px !important;
          }
          .search-bar-container {
            flex-direction: column;
          }
          #leilao-score-placa-input {
            font-size: 22px !important;
            padding: 16px 16px 16px 68px !important;
            letter-spacing: 0.1em !important;
          }
          #leilao-score-consultar-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 16px !important;
          }
          /* Guia de abas mobile */
          .guias-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 6px !important;
            padding: 6px !important;
          }
          .guias-container button {
            min-width: 0 !important;
            padding: 12px 6px !important;
            font-size: 9px !important;
            text-align: center !important;
          }
          /* Blocos mobile */
          .snc-bloco {
            padding: 18px 16px !important;
          }
          /* Grids de dados mobile */
          .snc-data-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          /* Linhas de dados mobile */
          .snc-data-row {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
            padding: 10px 12px !important;
          }
          .snc-data-row span {
            display: block !important;
            width: 100% !important;
          }
          .snc-data-row span:first-child {
            font-size: 8px !important;
            color: #8a94a3 !important;
          }
          .snc-data-row span:last-child {
            font-size: 12px !important;
            text-align: left !important;
          }
          /* Score legend grid mobile */
          .score-legend-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px 10px !important;
          }
          /* Histórico de consultas mobile togglable */
          .mobile-history-toggle {
            display: block !important;
          }
          .historico-wrapper:not(.show-mobile) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
