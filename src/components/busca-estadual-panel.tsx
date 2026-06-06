"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { ESTADUAL_MOCK_CLEAN, ESTADUAL_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos mapeados ───────────────────────────────────────────────────────────

interface DebitoItemResult {
  descricao?: string;
  valor?: number | string;
  dataVencimento?: string;
  orgaoEmissor?: string;
  tipoDebito?: string;
}

interface RestricaoItemResult {
  tipo?: string;
  descricao?: string;
}

interface EstadualDados {
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
  restricoes?: RestricaoItemResult[];
  multas?: DebitoItemResult[];
  ipva?: DebitoItemResult[];
  licenciamento?: DebitoItemResult[];
  outrosDebitos?: DebitoItemResult[];
  totalDebitos?: number | string;
}

interface EstadualResult {
  veiculo?: {
    placa?: string;
    renavam?: string;
    chassi?: string;
    marca_modelo?: string;
    uf?: string;
  };
  estadual?: EstadualDados;
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

// ─── Linha de dado ────────────────────────────────────────────────────────────
function DataRow({ label, value, mono = false, highlight = false, amber = false }: {
  label: string; value: React.ReactNode; mono?: boolean; highlight?: boolean; amber?: boolean;
}) {
  if (value === undefined || value === null || value === "—" || value === "") return null;

  let valColor = "#ffffff";
  if (highlight) valColor = "#ef4444";
  else if (amber) valColor = COR_ACCENT;

  return (
    <div className="snc-data-row">
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#a0aec0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, color: valColor, fontWeight: highlight || amber ? 700 : 400,
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export function BuscaEstadualPanel() {
  const [placa, setPlaca]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState<string | null>(null);
  const [resultado, setResultado] = useState<EstadualResult | null>(null);
  const { historico, salvar, limpar } = useHistoricoConsultas("estadual");
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
    setIsFromHistory(false);
    try {
      const res  = await fetch(`/api/apibrasil/estadual?placa=${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na consulta.");
      setResultado(data.estadual as EstadualResult);
      salvar(clean, data.estadual as Record<string, unknown>);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa, salvar]);

  const handleExemplo = useCallback(async (cenario: "clean" | "restricted") => {
    const isClean = cenario === "clean";
    const placaSimulada = isClean ? "XXX-0000" : "XXX-1111";
    const mockData = isClean ? ESTADUAL_MOCK_CLEAN : ESTADUAL_MOCK_RESTRICTED;
    // Popula o card do painel com os dados do mock (mesmo dado que aparece no relatório)
    setPlaca(placaSimulada);
    setResultado(mockData as unknown as EstadualResult);
    setErro(null);
    // Abre o relatório em nova aba
    const { url } = await gerarUrlRelatorio("estadual", placaSimulada, "PLACA", mockData);
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
              id="estadual-placa-input"
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
            id="estadual-consultar-btn"
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
            Exemplo de Relatório (Bloqueio + Débitos)
          </button>
          </div>
        </div>
      </div>

      {/* ── Resultado ── */}
      {r && (() => {
        const veiculo   = r.veiculo   ?? {};
        const estadual  = r.estadual  ?? {} as EstadualDados;
        const restricoes   = estadual.restricoes   ?? [];
        const multas       = estadual.multas       ?? [];
        const ipva         = estadual.ipva         ?? [];
        const licenciamento = estadual.licenciamento ?? [];
        const totalDebitos = estadual.totalDebitos ?? "R$ 0,00";
        const temDebitos = restricoes.length > 0 || multas.length > 0 || ipva.length > 0 || licenciamento.length > 0;
        const marcaModelo = estadual.marcaModelo || veiculo.marca_modelo || "Veículo";

        return (
          <div id="estadual-resultado" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

            {/* ── Cabeçalho do Resultado & Botão Gerar Relatório ── */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${COR_ACCENT}`,
              padding: "20px 28px", marginBottom: 12
            }}>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700 }}>ESTADUAL · {placa.toUpperCase()}</span>
                <span style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em" }}>
                  {marcaModelo.replace("/", " - ")}
                </span>
                <span style={{
                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, fontWeight: 700, letterSpacing: "0.05em",
                  color: restricoes.length > 0 || temDebitos ? "#ef4444" : "#2ba84a",
                }}>
                  {restricoes.length > 0 ? "RESTRIÇÕES ENCONTRADAS" : "NADA CONSTA"}
                  {temDebitos ? ` · DÉBITOS: ${totalDebitos}` : ""}
                </span>
              </div>
              <button
                onClick={async () => {
                  const clean = placa.replace(/[^A-Z0-9]/g, "");
                  const { url } = await gerarUrlRelatorio("estadual", clean, "PLACA", r as unknown as Record<string, unknown>);
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

            {/* ── Conteúdo dos blocos ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Bloco 1: Ficha Técnica Cadastral */}
              <Bloco titulo="Ficha Técnica Cadastral">
                <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                  <div>
                    <DataRow label="Placa" value={veiculo.placa ?? estadual.placa ?? "—"} mono />
                    <DataRow label="Marca / Modelo" value={marcaModelo.replace("/", " - ")} />
                    <DataRow label="Ano Fabricação" value={estadual.anoFabricacao ?? "—"} mono />
                    <DataRow label="Ano Modelo" value={estadual.anoModelo ?? "—"} mono />
                    <DataRow label="Chassi" value={veiculo.chassi ?? estadual.chassi ?? "—"} mono />
                  </div>
                  <div>
                    <DataRow label="RENAVAM" value={veiculo.renavam ?? estadual.renavam ?? "—"} mono />
                    <DataRow label="Combustível" value={estadual.combustivel ?? "—"} />
                    <DataRow label="Cor" value={estadual.cor ?? "—"} />
                    <DataRow label="UF de Registro" value={estadual.uf ?? veiculo.uf ?? "—"} mono />
                    <DataRow label="Município" value={estadual.municipio ?? "—"} />
                  </div>
                </div>
              </Bloco>

              {/* Bloco 2: Status Estadual / Restrições */}
              <Bloco
                titulo="Restrições Ativas (DETRAN)"
                badge={restricoes.length > 0 ? `${restricoes.length} ocorrência${restricoes.length !== 1 ? "s" : ""}` : undefined}
              >
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: temDebitos ? "rgba(239,68,68,0.08)" : "rgba(43,168,74,0.08)",
                    border: temDebitos ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(43,168,74,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12,
                    color: temDebitos ? "#ef4444" : "#2BA84A",
                    fontWeight: 700
                  }}>
                    {temDebitos ? "✕" : "✓"}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
                      color: temDebitos ? "#ef4444" : "#2BA84A", letterSpacing: "0.08em"
                    }}>
                      {temDebitos ? "CONSTAM RESTRIÇÕES / DÉBITOS ATIVOS" : "VEÍCULO REGULAR NA BASE ESTADUAL"}
                    </div>
                    {estadual.uf && (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#a0aec0", marginTop: 4 }}>
                        Fonte: DETRAN-{estadual.uf} · Total: {totalDebitos}
                      </div>
                    )}
                  </div>
                </div>

                {restricoes.length === 0 ? (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#2BA84A", padding: "12px 0" }}>
                    Nenhuma restrição ou gravame ativo registrado no Detran estadual.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {restricoes.map((item, idx) => (
                      <div key={idx} style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        padding: "16px 20px",
                      }}>
                        <div style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          marginBottom: 8, paddingBottom: 8,
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>
                            Restrição #{idx + 1}
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
                            {item.tipo ?? "Administrativa"}
                          </span>
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", lineHeight: 1.5 }}>
                          {item.descricao}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Bloco>

              {/* Bloco 3: Extrato de Débitos Estaduais */}
              {(multas.length > 0 || ipva.length > 0 || licenciamento.length > 0) && (
                <Bloco titulo="Extrato de Débitos Estaduais">
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {multas.length > 0 && (
                      <div>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                          color: COR_ACCENT, letterSpacing: "0.08em", textTransform: "uppercase" as const,
                          marginBottom: 12
                        }}>Multas Estaduais · {multas.length} ocorrência{multas.length !== 1 ? "s" : ""}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {multas.map((item, idx) => (
                            <div key={idx} style={{
                              display: "grid", gridTemplateColumns: "1fr auto auto",
                              padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                              gap: 16, alignItems: "center",
                            }}>
                              <div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#fff" }}>{item.descricao}</div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", marginTop: 2 }}>{item.orgaoEmissor}</div>
                              </div>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#a0aec0" }}>{item.dataVencimento}</span>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ef4444", fontWeight: 700 }}>{item.valor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {ipva.length > 0 && (
                      <div>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                          color: COR_ACCENT, letterSpacing: "0.08em", textTransform: "uppercase" as const,
                          marginBottom: 12
                        }}>IPVA · {ipva.length} exercício{ipva.length !== 1 ? "s" : ""}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {ipva.map((item, idx) => (
                            <div key={idx} style={{
                              display: "grid", gridTemplateColumns: "1fr auto auto",
                              padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                              gap: 16, alignItems: "center",
                            }}>
                              <div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#fff" }}>{item.descricao}</div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", marginTop: 2 }}>{item.orgaoEmissor}</div>
                              </div>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#a0aec0" }}>{item.dataVencimento}</span>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ef4444", fontWeight: 700 }}>{item.valor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {licenciamento.length > 0 && (
                      <div>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                          color: COR_ACCENT, letterSpacing: "0.08em", textTransform: "uppercase" as const,
                          marginBottom: 12
                        }}>Licenciamento e Taxas · {licenciamento.length} registro{licenciamento.length !== 1 ? "s" : ""}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {licenciamento.map((item, idx) => (
                            <div key={idx} style={{
                              display: "grid", gridTemplateColumns: "1fr auto auto",
                              padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
                              gap: 16, alignItems: "center",
                            }}>
                              <div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#fff" }}>{item.descricao}</div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", marginTop: 2 }}>{item.orgaoEmissor}</div>
                              </div>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#a0aec0" }}>{item.dataVencimento}</span>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ef4444", fontWeight: 700 }}>{item.valor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div style={{
                      display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16,
                      paddingTop: 16, borderTop: `1px solid ${COR_ACCENT_DIM}`,
                    }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#a0aec0", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
                        Total Geral de Débitos Estaduais
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: "#ef4444", fontWeight: 700 }}>
                        {totalDebitos}
                      </span>
                    </div>
                  </div>
                </Bloco>
              )}
            </div>

          </div>
        );
      })()}

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
        <HistoricoConsultas
          historico={historico}
          onCarregar={(dados, p) => {
            setPlaca(p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p);
            setResultado(dados as unknown as EstadualResult);
            setErro(null);
            setIsFromHistory(true);
            setShowHistoryMobile(false);
          }}
          onLimpar={limpar}
          corAccent="#D4A843"
          scrollTargetId="estadual-resultado"
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
          #estadual-placa-input {
            font-size: 22px !important;
            padding: 16px 16px 16px 68px !important;
            letter-spacing: 0.1em !important;
          }
          #estadual-consultar-btn {
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
