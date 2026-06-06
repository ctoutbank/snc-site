"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { RENAJUD_MOCK_CLEAN, RENAJUD_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos mapeados ───────────────────────────────────────────────────────────

interface RenajudResult {
  processo?: string | null;
  orgao_judicial?: string | null;
  tribunal?: string | null;
  restricoes?: string[];
  veiculo?: {
    marcaModelo?: string;
    anoFabricacao?: string;
    anoModelo?: string;
    cor?: string;
    combustivel?: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

const COR_ACCENT = "#D4A843"; // Âmbar padrão AutoScore

// ─── Bloco de seção ───────────────────────────────────────────────────────────
function Bloco({ titulo, children }: {
  titulo: string; children: React.ReactNode;
}) {
  return (
    <div className="snc-bloco" style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "28px 28px",
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
        color: "#cfd6df", letterSpacing: "0.22em", textTransform: "uppercase" as const,
        marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid rgba(255,255,255,0.1)`,
      }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

// ─── Linha de dado ────────────────────────────────────────────────────────────
function DataRow({ label, value, mono = false, highlight = false, accent = false }: {
  label: string; value: React.ReactNode; mono?: boolean; highlight?: boolean; accent?: boolean;
}) {
  if (value === undefined || value === null || value === "—" || value === "") return null;

  let valColor = "#ffffff";
  if (highlight) valColor = "#ef4444";
  else if (accent) valColor = COR_ACCENT;

  return (
    <div className="snc-data-row" style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
      gap: 16, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#a0aec0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
        fontSize: 12, color: valColor, fontWeight: highlight || accent ? 700 : 400,
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export function BuscaRenajudPanel() {
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RenajudResult | null>(null);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

  // Histórico de Consultas
  const { historico, salvar, limpar } = useHistoricoConsultas("renajud");

  const handleBuscar = useCallback(async () => {
    const cleanPlaca = placa.replace(/[^A-Z0-9]/g, "");

    if (cleanPlaca.length < 7) {
      setErro("Placa inválida. Use o formato ABC-1234 ou ABC-1D23.");
      return;
    }

    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const res = await fetch(`/api/apibrasil/renajud?placa=${cleanPlaca}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao consultar RENAJUD.");

      const resData = data.renajud as RenajudResult;
      setResultado(resData);

      // Salva no histórico local
      salvar(cleanPlaca, resData as unknown as Record<string, unknown>);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa, salvar]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBuscar();
  };

  const handleExemplo = useCallback(async (cenario: "clean" | "restricted") => {
    const isClean = cenario === "clean";
    const placaSimulada = isClean ? "XXX-0000" : "XXX-1111";
    const mockData = isClean ? RENAJUD_MOCK_CLEAN : RENAJUD_MOCK_RESTRICTED;
    // Popula o card do painel com os dados do mock (mesmo dado que aparece no relatório)
    setPlaca(placaSimulada);
    setResultado(mockData as unknown as RenajudResult);
    setErro(null);
    // Abre o relatório em nova aba
    const { url } = await gerarUrlRelatorio("renajud", placaSimulada, "PLACA", mockData);
    window.open(url, "_blank");
  }, []);

  const r = resultado;
  const temRestricoes = r?.restricoes && r.restricoes.length > 0;

  return (
    <div>
      {/* ── Input de Busca ── */}
      <div className="search-bar-wrapper" style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 36px",
        marginBottom: 32,
      }}>
        <div className="search-bar-container" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "stretch" }}>

          {/* Placa */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const,
              pointerEvents: "none",
            }}>
              PLACA
            </div>
            <input
              id="renajud-placa-input"
              type="text"
              autoComplete="off"
              value={placa}
              onChange={(e) => setPlaca(formatarPlaca(e.target.value))}
              onKeyDown={handleKeyDown}
              placeholder="ABC-1234"
              maxLength={8}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 28,
                letterSpacing: "0.14em",
                padding: "18px 18px 18px 82px",
                outline: "none",
                textTransform: "uppercase" as const,
                transition: "border-color 0.15s",
                WebkitBoxShadow: "0 0 0 1000px rgba(10,22,40,1) inset",
              }}
              onFocus={(e) => (e.target.style.borderColor = COR_ACCENT)}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>

          <button
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px",
              background: loading ? "rgba(212,168,67,0.4)" : "#D4A843",
              color: "#0A1628",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              fontWeight: 700,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              whiteSpace: "nowrap" as const,
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
            Exemplo de Relatório (Restrições Judiciais)
          </button>
          </div>
        </div>

        {erro && (
          <div style={{ marginTop: 14, padding: "10px 16px", background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#e07b6a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.08em" }}>
            ⚠ {erro}
          </div>
        )}
      </div>

      {/* ── Resultados ── */}
      {r && (
        <div id="renajud-resultado" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Cabeçalho do Resultado & Relatório ── */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${COR_ACCENT}`,
            padding: "20px 28px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" as const }}>
                RENAJUD · {placa.toUpperCase()}
              </span>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em" }}>
                {(r.veiculo?.marcaModelo || "—").replace("/", " - ")}
              </span>
              <span style={{
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, fontWeight: 700, letterSpacing: "0.05em",
                color: temRestricoes ? "#ef4444" : "#2ba84a",
              }}>
                {temRestricoes ? "RESTRIÇÃO JUDICIAL ATIVA" : "NENHUMA RESTRIÇÃO ENCONTRADA"}
                {temRestricoes && r.restricoes ? ` · ${r.restricoes.join(", ")}` : ""}
              </span>
            </div>
            <button
              onClick={async () => {
                const { url } = await gerarUrlRelatorio(
                  "renajud", placa, "PLACA",
                  { data: r } as unknown as Record<string, unknown>
                );
                window.open(url, "_blank");
              }}
              style={{
                padding: "12px 24px", background: COR_ACCENT, color: "#0A1628",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.15s", whiteSpace: "nowrap" as const,
                marginLeft: 20, flexShrink: 0
              }}
            >
              Visualizar Relatório
            </button>
          </div>

          {/* ── Bloco Detalhado de Processos e Órgãos Judiciais ── */}
          <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
            <Bloco titulo="Processo & Juízo">
              <DataRow label="Nº Processo" value={r.processo} mono />
              <DataRow label="Órgão Judicial" value={r.orgao_judicial} />
              <DataRow label="Tribunal" value={r.tribunal} mono />
            </Bloco>

            <Bloco titulo="Situação Jurídica">
              {temRestricoes ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{
                    padding: "12px 16px",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#ef4444",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.08em"
                  }}>
                    ⚠ RESTRIÇÕES REGISTRADAS:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {r.restricoes?.map((res, i) => (
                      <span key={i} style={{
                        padding: "6px 12px",
                        background: "rgba(239,68,68,0.12)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        color: "#ef4444",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase"
                      }}>
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: "16px 20px",
                  background: "rgba(43,168,74,0.08)",
                  border: "1px solid rgba(43,168,74,0.2)",
                  color: "#2BA84A",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}>
                  ✓ NADA CONSTA DE RESTRIÇÃO JUDICIAL
                </div>
              )}
            </Bloco>
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
        <HistoricoConsultas
          historico={historico}
          onCarregar={(dados, p) => {
            setPlaca(p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p);
            setResultado(dados as unknown as RenajudResult);
            setErro(null);
            setShowHistoryMobile(false);
          }}
          onLimpar={limpar}
          corAccent={COR_ACCENT}
          scrollTargetId="renajud-resultado"
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .search-bar-container {
            grid-template-columns: 1fr !important;
          }
          .snc-data-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
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
