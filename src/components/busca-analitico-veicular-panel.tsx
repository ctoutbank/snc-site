"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { ANALITICO_VEICULAR_MOCK_CLEAN, ANALITICO_VEICULAR_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AnaliticoVeicularResult {
  veiculo?: {
    placa?: string; marca_modelo?: string; ano_fabricacao?: string; ano_modelo?: string;
    cor?: string; combustivel?: string; chassi?: string; renavam?: string; motor?: string;
    municipio?: string; uf?: string;
  };
  proprietario?: { nome?: string; documento?: string; municipio?: string; uf?: string };
  fipe?: { codigoFipe?: string; modelo?: string; anoModelo?: string; combustivel?: string; mesReferencia?: string; valor?: string };
  historicoKm?: {
    registros?: { data?: string; km?: string; fonte?: string; uf?: string }[];
    anomalia?: boolean; motivoAnomalia?: string;
  };
  renajud?: {
    temRestricao?: boolean; restricoes?: string[];
    processo?: string | null; orgaoJudicial?: string | null; tribunal?: string | null;
  };
  renainf?: {
    totalMultas?: number; valorTotal?: string;
    multas?: { data?: string; descricao?: string; valor?: string; orgao?: string; situacao?: string }[];
  };
  rouboFurto?: {
    temOcorrencia?: boolean;
    ocorrencias?: { data?: string; tipo?: string; boletim?: string; localidade?: string; situacao?: string }[];
  };
  recall?: {
    temRecall?: boolean;
    ocorrencias?: { fabricante?: string; modelo?: string; campanha?: string; defeito?: string; situacao?: string }[];
  };
  _status?: string;
}

// ─── Formatação de placa ──────────────────────────────────────────────────────
function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

const COR_ACCENT = "#D4A843"; // Âmbar padrão AutoScore
const COR_ACCENT_DIM = "rgba(212,168,67,0.2)";

// ─── Bloco de seção ────────────────────────────────────────────────────────────
function Bloco({ titulo, children }: {
  titulo: string; children: React.ReactNode;
}) {
  const cor = COR_ACCENT;
  return (
    <div className="snc-bloco" style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "28px 28px",
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
        color: cor, letterSpacing: "0.22em", textTransform: "uppercase" as const,
        marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${cor}33`,
      }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

// ─── Linha de dado ─────────────────────────────────────────────────────────────
function DataRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;
  return (
    <div className="snc-data-row" style={{
      display: "grid", gridTemplateColumns: "180px 1fr",
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
      gap: 12, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.15em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e0e6ef" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Indicador Circular ───────────────────────────────────────────────────────
function IndicadorBool({ label, valor, alerta = false }: { label: string; valor: boolean; alerta?: boolean }) {
  const ruim = alerta ? !valor : valor;
  const cor = ruim ? "#ef4444" : "#2BA84A";
  return (
    <div className="snc-data-row" style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: cor, flexShrink: 0 }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" as const, flex: 1 }}>
        {label}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: cor, fontWeight: 700 }}>
        {valor ? "SIM" : "NÃO"}
      </span>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export function BuscaAnaliticoVeicularPanel() {
  const [placa, setPlaca]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState<string | null>(null);
  const [resultado, setResultado] = useState<AnaliticoVeicularResult | null>(null);
  const [activeTab, setActiveTab] = useState<"identificacao" | "fipe" | "restricoes">("identificacao");
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const { historico, salvar, limpar } = useHistoricoConsultas("analitico-veicular");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(formatarPlaca(e.target.value));
    setErro(null);
    setResultado(null);
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
    try {
      const res  = await fetch(`/api/apibrasil/analitico-veicular?placa=${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na consulta.");
      setResultado(data as AnaliticoVeicularResult);
      salvar(clean, data as Record<string, unknown>);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa, salvar]);

  const handleExemplo = useCallback(async (cenario: "clean" | "restricted") => {
    const isClean = cenario === "clean";
    const placaSimulada = isClean ? "XXX-0000" : "XXX-1111";
    const mockData = isClean ? ANALITICO_VEICULAR_MOCK_CLEAN : ANALITICO_VEICULAR_MOCK_RESTRICTED;
    setPlaca(placaSimulada);
    setResultado(mockData as unknown as AnaliticoVeicularResult);
    setErro(null);
    const { url } = await gerarUrlRelatorio("analitico-veicular", placaSimulada, "PLACA", mockData as unknown as Record<string, unknown>);
    window.open(url, "_blank");
  }, []);

  const r = resultado;

  return (
    <div>
      {/* ── Input no padrão Vip-Car ── */}
      <div className="search-bar-wrapper" style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 36px", marginBottom: 32,
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
              id="analitico-placa-input"
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
            id="analitico-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px", background: loading ? "rgba(212,168,67,0.4)" : "#D4A843",
              color: "#0A1628", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
              letterSpacing: "0.12em", textTransform: "uppercase" as const, fontWeight: 700,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s", whiteSpace: "nowrap" as const,
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #0A1628", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Consultando
              </>
            ) : "Consultar"}
          </button>
        </div>

        {erro && (
          <div style={{ marginTop: 14, padding: "10px 16px", background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#e07b6a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
            ⚠ {erro}
          </div>
        )}
        <p style={{ marginTop: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
          Formatos aceitos: ABC-1234 (antigo) · ABC-1D23 (Mercosul)
        </p>

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
              Exemplo de Relatório (Com Restrições)
            </button>
          </div>
        </div>
      </div>

      {/* ── Resultado no padrão Vip-Car ── */}
      {r && (
        <div id="analitico-resultado" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* ── Cabeçalho do Resultado & Botão Visualizar Relatório ── */}
          {(() => {
            const temRestricao = !!(
              r.renajud?.temRestricao ||
              r.rouboFurto?.temOcorrencia ||
              r.recall?.temRecall ||
              r.historicoKm?.anomalia ||
              (r.renainf?.totalMultas && r.renainf.totalMultas > 0)
            );
            const borderColor = temRestricao ? "#ef4444" : COR_ACCENT;
            return (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${borderColor}`,
            padding: "20px 28px", marginBottom: 12
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" as const }}>
                ANALÍTICO VEICULAR · {placa}
              </span>
              <span style={{ fontSize: 20, color: "#fff", fontFamily: "'Libre Caslon Text', serif", marginTop: 6, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.veiculo?.marca_modelo
                  ? String(r.veiculo.marca_modelo).toUpperCase().replace('/', ' - ')
                  : placa.toUpperCase()}
              </span>
              {(() => {
                const temRestricao = !!(
                  r.renajud?.temRestricao ||
                  r.rouboFurto?.temOcorrencia ||
                  r.recall?.temRecall ||
                  r.historicoKm?.anomalia ||
                  (r.renainf?.totalMultas && r.renainf.totalMultas > 0)
                );
                return (
                  <span style={{ fontSize: 11, color: temRestricao ? "#ef4444" : "#2ba84a", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginTop: 4 }}>
                    {temRestricao ? "RESTRIÇÕES / ALERTAS ATIVOS" : "VEÍCULO REGULAR — NADA CONSTA"}
                  </span>
                );
              })()}
            </div>
            <button
              onClick={async () => {
                const clean = placa.replace(/[^A-Z0-9]/g, "");
                const { url } = await gerarUrlRelatorio("analitico-veicular", clean, "PLACA", r as unknown as Record<string, unknown>);
                window.open(url, "_blank");
              }}
              style={{
                padding: "12px 24px", background: COR_ACCENT, color: "#0a1628",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                fontWeight: 700, border: "none", cursor: "pointer",
                whiteSpace: "nowrap" as const,
                marginLeft: 20, flexShrink: 0, transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e8c05a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = COR_ACCENT)}
            >
              Visualizar Relatório
            </button>
          </div>
            );
          })()}

          {/* ── Menu de Abas (Tabs) ── */}
          <div className="guias-container" style={{
            display: "flex",
            gap: 4,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: 4,
            marginBottom: 16,
            flexWrap: "wrap"
          }}>
            {[
              { id: "identificacao", label: "Ficha & Proprietário" },
              { id: "fipe", label: "Histórico & FIPE" },
              { id: "restricoes", label: "Restrições & Multas" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={async () => setActiveTab(tab.id as any)}
                style={{
                  flex: 1, minWidth: 150, padding: "14px 16px",
                  background: activeTab === tab.id ? COR_ACCENT_DIM : "transparent",
                  color: activeTab === tab.id ? COR_ACCENT : "#8a94a3",
                  border: "none", cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.15em", textTransform: "uppercase" as const,
                  transition: "all 0.2s",
                  borderBottom: `2px solid ${activeTab === tab.id ? COR_ACCENT : "transparent"}`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Conteúdo das Abas ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Aba 1: Ficha & Proprietário */}
            {activeTab === "identificacao" && (
              <>
                <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2 }}>
                  <Bloco titulo="Identificação do Veículo">
                    {r.veiculo ? (
                      <>
                        <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, fontWeight: 400, color: "#fff", lineHeight: 1.2, marginBottom: 20 }}>
                          {r.veiculo.marca_modelo ?? "—"}
                        </h3>
                        <DataRow label="Placa"          value={r.veiculo.placa ?? "—"} />
                        <DataRow label="Ano Fabricação" value={r.veiculo.ano_fabricacao ?? "—"} />
                        <DataRow label="Ano Modelo"     value={r.veiculo.ano_modelo ?? "—"} />
                        <DataRow label="Cor"            value={r.veiculo.cor ?? "—"} />
                        <DataRow label="Combustível"    value={r.veiculo.combustivel ?? "—"} />
                        <DataRow label="RENAVAM"        value={r.veiculo.renavam ?? "—"} />
                        <DataRow label="Motor"          value={r.veiculo.motor ?? "—"} />
                        <DataRow label="Município / UF" value={r.veiculo.municipio && r.veiculo.uf ? `${r.veiculo.municipio} / ${r.veiculo.uf}` : "—"} />
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Dados do veículo não disponíveis</span>
                    )}
                  </Bloco>
                  <Bloco titulo="Ocorrências & Recalls">
                    {r.recall ? (
                      <>
                        <IndicadorBool label="Recall Ativo / Pendente" valor={!!r.recall.temRecall} />
                        {r.recall.temRecall && r.recall.ocorrencias?.map((o, idx) => (
                          <div key={idx} style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239, 68, 68, 0.05)", borderLeft: "2px solid #ef4444" }}>
                            <div style={{ fontSize: 9, color: "#8a94a3", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{o.fabricante} · {o.campanha}</div>
                            <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{o.defeito} ({o.situacao})</div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem ocorrências de Recall</span>
                    )}
                  </Bloco>
                </div>

                <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Bloco titulo="Proprietário Atual">
                    {r.proprietario ? (
                      <>
                        <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, fontWeight: 400, color: "#fff", lineHeight: 1.2, marginBottom: 20 }}>
                          {r.proprietario.nome ?? "—"}
                        </h3>
                        <DataRow label="Documento"      value={r.proprietario.documento ?? "—"} />
                        <DataRow label="Município / UF" value={r.proprietario.municipio && r.proprietario.uf ? `${r.proprietario.municipio} / ${r.proprietario.uf}` : "—"} />
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem dados do proprietário</span>
                    )}
                  </Bloco>
                  <Bloco titulo="Dados Estruturais">
                    {r.veiculo ? (
                      <>
                        <DataRow label="Chassi"         value={r.veiculo.chassi ?? "—"} />
                        <DataRow label="Código RENAVAM" value={r.veiculo.renavam ?? "—"} />
                        <DataRow label="Número Motor"   value={r.veiculo.motor ?? "—"} />
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem dados estruturais</span>
                    )}
                  </Bloco>
                </div>
              </>
            )}

            {/* Aba 2: Histórico & FIPE */}
            {activeTab === "fipe" && (
              <>
                <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Bloco titulo="Tabela FIPE">
                    {r.fipe ? (
                      <>
                        <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, fontWeight: 400, color: "#fff", lineHeight: 1.2, marginBottom: 20 }}>
                          {r.fipe.valor ?? "—"}
                        </h3>
                        <DataRow label="Código FIPE"    value={r.fipe.codigoFipe ?? "—"} />
                        <DataRow label="Modelo"         value={r.fipe.modelo ?? "—"} />
                        <DataRow label="Ano FIPE"       value={r.fipe.anoModelo ?? "—"} />
                        <DataRow label="Combustível"    value={r.fipe.combustivel ?? "—"} />
                        <DataRow label="Referência"     value={r.fipe.mesReferencia ?? "—"} />
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Dados FIPE indisponíveis</span>
                    )}
                  </Bloco>
                  <Bloco titulo="Odômetro (Histórico KM)">
                    {r.historicoKm ? (
                      <>
                        <IndicadorBool label="Anomalia de Hodômetro" valor={!!r.historicoKm.anomalia} />
                        {r.historicoKm.anomalia && (
                          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239, 68, 68, 0.05)", borderLeft: "2px solid #ef4444", fontSize: 11, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
                            ⚠ {r.historicoKm.motivoAnomalia}
                          </div>
                        )}
                        {r.historicoKm.registros && r.historicoKm.registros.length > 0 && (
                          <div style={{ overflowX: "auto", marginTop: 16 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  {["Data", "KM Registrado", "Fonte", "UF"].map((h) => (
                                    <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {r.historicoKm.registros.map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px" }}>{item.data}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px", fontWeight: 700 }}>{item.km} km</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{item.fonte}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{item.uf}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem registros de quilometragem</span>
                    )}
                  </Bloco>
                </div>
              </>
            )}

            {/* Aba 3: Restrições & Multas */}
            {activeTab === "restricoes" && (
              <>
                <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Bloco titulo="Restrições Judiciais (RENAJUD)">
                    {r.renajud ? (
                      <>
                        <IndicadorBool label="Restrição Judicial Ativa" valor={!!r.renajud.temRestricao} />
                        {r.renajud.temRestricao && (
                          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                            <DataRow label="Processo"   value={r.renajud.processo ?? "—"} />
                            <DataRow label="Órgão"      value={r.renajud.orgaoJudicial ?? "—"} />
                            <DataRow label="Tribunal"   value={r.renajud.tribunal ?? "—"} />
                            {r.renajud.restricoes?.map((desc, idx) => (
                              <div key={idx} style={{ marginTop: 10, padding: "8px 12px", background: "rgba(239, 68, 68, 0.05)", borderLeft: "2px solid #ef4444", fontSize: 11, color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
                                ⚠ {desc}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem restrições judiciais</span>
                    )}
                  </Bloco>
                  <Bloco titulo="Restrições de Roubo & Furto">
                    {r.rouboFurto ? (
                      <>
                        <IndicadorBool label="Alerta de Roubo / Furto" valor={!!r.rouboFurto.temOcorrencia} />
                        {r.rouboFurto.temOcorrencia && r.rouboFurto.ocorrencias?.map((o, idx) => (
                          <div key={idx} style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239, 68, 68, 0.05)", borderLeft: "2px solid #ef4444" }}>
                            <div style={{ fontSize: 9, color: "#8a94a3", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{o.data} · {o.tipo} ({o.boletim})</div>
                            <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{o.localidade} · {o.situacao}</div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem ocorrências de roubo/furto</span>
                    )}
                  </Bloco>
                </div>

                <Bloco titulo={`Infrações de Trânsito (RENAINF)`}>
                  {r.renainf ? (
                    <>
                      <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 16 }}>
                        <DataRow label="Total de Multas"     value={String(r.renainf.totalMultas ?? 0)} />
                        <DataRow label="Valor Consolidado"   value={r.renainf.valorTotal ?? "R$ 0,00"} />
                      </div>
                      {r.renainf.multas && r.renainf.multas.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                {["Data", "Descrição da Infração", "Órgão Autuador", "Valor", "Situação"].map((h) => (
                                  <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {r.renainf.multas.map((m, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px" }}>{m.data}</td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.descricao}</td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{m.orgao}</td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#ef4444", fontWeight: 700, padding: "10px 12px" }}>{m.valor}</td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "10px 12px" }}>
                                    <span style={{
                                      padding: "2px 6px", borderRadius: 2, fontSize: 9, fontWeight: 700,
                                      background: m.situacao === 'PENDENTE' ? "rgba(239,68,68,0.1)" : "rgba(43,168,74,0.1)",
                                      color: m.situacao === 'PENDENTE' ? "#ef4444" : "#2BA84A",
                                      fontFamily: "'JetBrains Mono', monospace"
                                    }}>
                                      {m.situacao}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Nenhuma infração registrada na base RENAINF.</span>
                      )}
                    </>
                  ) : (
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem infrações de trânsito</span>
                  )}
                </Bloco>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "16px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 24,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: "#3a4a5a", letterSpacing: "0.1em", textTransform: "uppercase" as const,
          }}>
            <span>Fonte: DENATRAN / SENATRAN · SNC</span>
            <span>·</span>
            <span>LGPD Art. 7º, III</span>
            <span style={{ marginLeft: "auto" }}>SNC — Sistema Nacional de Conformidade</span>
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
            setResultado(dados as unknown as AnaliticoVeicularResult);
            setErro(null);
            setShowHistoryMobile(false);
          }}
          onLimpar={limpar}
          corAccent={COR_ACCENT}
          scrollTargetId="analitico-resultado"
        />
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          #analitico-resultado > div:nth-child(3) { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .search-bar-wrapper {
            padding: 20px 16px !important;
          }
          .search-bar-container {
            flex-direction: column;
          }
          #analitico-placa-input {
            font-size: 22px !important;
            padding: 16px 16px 16px 68px !important;
            letter-spacing: 0.1em !important;
          }
          #analitico-consultar-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 16px !important;
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
