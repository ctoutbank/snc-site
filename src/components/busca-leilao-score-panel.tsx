"use client";

import { useState, useCallback } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface LeilaoResult {
  score?: number | null;
  scoreLabel?: string | null;
  totalLeiloes?: number | null;
  indicio?: boolean | null;
  historico?: LeilaoHistoricoItem[];
  [key: string]: unknown;
}

interface LeilaoHistoricoItem {
  data?: string | null;
  leiloeiro?: string | null;
  lote?: string | null;
  condicao?: string | null;
  comitente?: string | null;
  [key: string]: unknown;
}

// ─── Formatação de placa ──────────────────────────────────────────────────────
function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

// ─── DataRow ──────────────────────────────────────────────────────────────────
function DataRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "180px 1fr",
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
      gap: 12, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e0e6ef" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
export function BuscaLeilaoScorePanel() {
  const [placa, setPlaca]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState<string | null>(null);
  const [resultado, setResultado] = useState<LeilaoResult | null>(null);

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
      const res  = await fetch(`/api/apibrasil/leilao-score?placa=${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na consulta.");
      setResultado(data.leilao as LeilaoResult);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa]);

  const r = resultado;

  return (
    <div>
      {/* ── Input ── */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 36px", marginBottom: 32,
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
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
              }}
              onFocus={(e) => (e.target.style.borderColor = "#D4A843")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>
          <button
            id="leilao-score-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px", background: loading ? "rgba(212,168,67,0.4)" : "#D4A843",
              color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
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
          <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(224,123,106,0.1)", border: "1px solid rgba(224,123,106,0.25)", color: "#e07b6a", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            {erro}
          </div>
        )}
      </div>

      {/* ── Resultado ── */}
      {r && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Score */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "28px 28px",
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
              color: "#D4A843", letterSpacing: "0.22em", textTransform: "uppercase" as const,
              marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid rgba(212,168,67,0.2)",
            }}>
              Score de Leilão
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16 }}>
              <div style={{
                fontFamily: "'Libre Caslon Text', serif", fontSize: 56,
                color: (r.score ?? 0) >= 70 ? "#2BA84A" : (r.score ?? 0) >= 40 ? "#D4A843" : "#e07b6a",
                lineHeight: 1,
              }}>
                {r.score ?? "—"}
              </div>
              <div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  color: (r.score ?? 0) >= 70 ? "#2BA84A" : (r.score ?? 0) >= 40 ? "#D4A843" : "#e07b6a",
                  fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const,
                }}>
                  {r.scoreLabel ?? "—"}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", marginTop: 4 }}>
                  Escala 0–100 · Quanto maior, menor o risco
                </div>
              </div>
            </div>

            <DataRow label="Total de Leilões" value={String(r.totalLeiloes ?? "0")} />
            <DataRow label="Indício de Leilão" value={r.indicio ? "SIM" : "NÃO"} />
          </div>

          {/* Histórico */}
          {r.historico && r.historico.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "28px 28px",
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                color: "#D4A843", letterSpacing: "0.22em", textTransform: "uppercase" as const,
                marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid rgba(212,168,67,0.2)",
              }}>
                Histórico de Leilões · {r.historico.length} registro{r.historico.length > 1 ? "s" : ""}
              </div>
              {r.historico.map((item, i) => (
                <div key={i} style={{
                  padding: "12px 0",
                  borderBottom: i < (r.historico?.length ?? 0) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <DataRow label="Data" value={item.data ?? "—"} />
                  <DataRow label="Leiloeiro" value={item.leiloeiro ?? "—"} />
                  <DataRow label="Lote" value={item.lote ?? "—"} />
                  <DataRow label="Condição" value={item.condicao ?? "—"} />
                  <DataRow label="Comitente" value={item.comitente ?? "—"} />
                </div>
              ))}
            </div>
          )}

          {/* Dados brutos (debug em HML) */}
          <details style={{ marginTop: 8 }}>
            <summary style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: "#3a4a5a", cursor: "pointer", letterSpacing: "0.08em",
            }}>
              Ver resposta bruta (debug)
            </summary>
            <pre style={{
              background: "rgba(0,0,0,0.3)", padding: 16, fontSize: 10,
              color: "#5a6a7a", overflow: "auto", maxHeight: 300, marginTop: 8,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {JSON.stringify(r, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
