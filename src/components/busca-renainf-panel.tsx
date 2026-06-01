"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { RENAINF_MOCK_CLEAN, RENAINF_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface InfracaoItem {
  autoInfra?: string;
  codigoInfra?: string;
  dataInfra?: string;
  descricao?: string;
  orgaoEmissor?: string;
  valorOriginal?: string;
  valorAnotado?: string;
  situacao?: string;
  localInfra?: string;
}

interface RenainfResult {
  veiculo?: {
    placa?: string;
    renavam?: string;
    chassi?: string;
    marca_modelo?: string;
    uf?: string;
  };
  renainf?: {
    placa?: string;
    chassi?: string;
    renavam?: string;
    marcaModelo?: string;
    totalMultas?: number;
    valorTotal?: string;
    infracoes?: InfracaoItem[];
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

function DataRow({ label, value, mono = false, highlight = false, isError = false }: {
  label: string; value: React.ReactNode; mono?: boolean; highlight?: boolean; isError?: boolean;
}) {
  if (value === undefined || value === null || value === "—" || value === "") return null;

  let valColor = "#ffffff";
  if (isError) valColor = "#ef4444";

  return (
    <div className="snc-data-row">
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#a0aec0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'JetBrains Mono', monospace",
        fontSize: 12, color: valColor, fontWeight: isError ? 700 : 400,
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function BuscaRenainfPanel() {
  const [placa, setPlaca]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<RenainfResult | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  const { historico, salvar, limpar } = useHistoricoConsultas("renainf");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(formatarPlaca(e.target.value));
    setError(null);
  }, []);

  const handleBuscar = useCallback(async () => {
    const clean = placa.replace(/[^A-Z0-9]/g, "");
    if (clean.length < 7) {
      setError("Placa inválida. Use o formato ABC-1234 (antigo) ou ABC-1D23 (Mercosul).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res  = await fetch("/api/apibrasil/renainf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: clean, homolog: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Erro ao consultar a API.");

      const veiculo = data.data?.veiculo || {};
      const renainf = data.data?.renainf || {};
      const mapped: RenainfResult = { veiculo, renainf };

      setResult(mapped);
      salvar(clean, mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa, salvar]);

  const handleExemplo = useCallback((cenario: "clean" | "restricted") => {
    const mockData  = cenario === "clean" ? RENAINF_MOCK_CLEAN : RENAINF_MOCK_RESTRICTED;
    const placaMock = cenario === "clean" ? "XXX-0000" : "XXX-1111";
    // Popula o card do painel com os dados do mock (mesmo dado que aparece no relatório)
    const mapped: RenainfResult = { veiculo: mockData.data.veiculo, renainf: mockData.data.renainf };
    setPlaca(placaMock);
    setResult(mapped);
    setError(null);
    // Abre o relatório em nova aba
    const { url }   = gerarUrlRelatorio("renainf", placaMock, "PLACA", mockData.data);
    window.open(url, "_blank");
  }, []);

  const handleGerarRelatorio = useCallback(() => {
    if (!result) return;
    const doc     = result.veiculo?.placa || result.renainf?.placa || placa;
    const { url } = gerarUrlRelatorio("renainf", doc, "PLACA", result);
    window.open(url, "_blank");
  }, [result, placa]);

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
              id="renainf-placa-input"
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
            id="renainf-consultar-btn"
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

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", display: "flex", alignItems: "center", textTransform: "uppercase", paddingTop: 6 }}>Exemplos:</span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => handleExemplo("clean")}
            style={{
              padding: "6px 14px", background: "rgba(43,168,74,0.08)", color: "#2BA84A",
              border: "1px solid rgba(43,168,74,0.25)", borderRadius: 2,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: "pointer",
              transition: "all 0.15s", textTransform: "uppercase",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.15)"; e.currentTarget.style.borderColor = "#2BA84A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.08)"; e.currentTarget.style.borderColor = "rgba(43,168,74,0.25)"; }}
          >
            Exemplo de Relatório (Nada Consta)
          </button>
          <button
            onClick={() => handleExemplo("restricted")}
            style={{
              padding: "6px 14px", background: "rgba(192,57,43,0.08)", color: "#c0392b",
              border: "1px solid rgba(192,57,43,0.25)", borderRadius: 2,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: "pointer",
              transition: "all 0.15s", textTransform: "uppercase",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.15)"; e.currentTarget.style.borderColor = "#c0392b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.08)"; e.currentTarget.style.borderColor = "rgba(192,57,43,0.25)"; }}
          >
            Exemplo de Relatório (Com Multas)
          </button>
          </div>
        </div>
      </div>

      {/* ── Resultado ── */}
      {result && (
        <div id="renainf-resultado" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Cabeçalho do resultado + botão relatório */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${COR_ACCENT}`,
            padding: "20px 28px", marginBottom: 12,
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700 }}>RENAINF · {placa.toUpperCase()}</span>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em" }}>
                {v(result.renainf?.marcaModelo || result.veiculo?.marca_modelo)}
              </span>
              <span style={{
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, fontWeight: 700, letterSpacing: "0.05em",
                color: Number(result.renainf?.totalMultas) > 0 ? "#ef4444" : "#2ba84a",
              }}>
                {Number(result.renainf?.totalMultas) > 0
                  ? `${result.renainf?.totalMultas} MULTA(S) REGISTRADA(S)`
                  : "NENHUMA MULTA REGISTRADA"}
                {result.renainf?.valorTotal && Number(result.renainf?.totalMultas) > 0
                  ? ` · R$ ${result.renainf.valorTotal}`
                  : ""}
              </span>
            </div>
            <button
              onClick={handleGerarRelatorio}
              style={{
                padding: "12px 24px", background: COR_ACCENT, color: "#0a1628",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#b8913c")}
              onMouseOut={(e)  => (e.currentTarget.style.background = COR_ACCENT)}
            >
              ⎙ Gerar Relatório
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Bloco titulo="DADOS DO VEÍCULO" badge="INFO">
              <DataRow label="Marca / Modelo" value={v(result.renainf?.marcaModelo || result.veiculo?.marca_modelo)} />
              <DataRow label="Placa"           value={v(result.renainf?.placa || result.veiculo?.placa)} mono />
              <DataRow label="RENAVAM"         value={v(result.renainf?.renavam || result.veiculo?.renavam)} mono />
              <DataRow label="Chassi"          value={v(result.renainf?.chassi || result.veiculo?.chassi)} mono />
              <DataRow label="UF"              value={v(result.veiculo?.uf)} />
            </Bloco>

            <Bloco titulo="RESUMO FINANCEIRO" badge="TOTAIS">
              <DataRow label="Quantidade de Multas" value={v(result.renainf?.totalMultas)} />
              <DataRow
                label="Valor Total de Multas"
                value={v(result.renainf?.valorTotal) !== "—" ? `R$ ${result.renainf?.valorTotal}` : "—"}
                isError={Number(result.renainf?.totalMultas) > 0}
              />
            </Bloco>

            {(result.renainf?.infracoes ?? []).length > 0 && (
              <Bloco titulo="DETALHAMENTO DE MULTAS" badge={(() => { const n = result.renainf?.infracoes?.length ?? 0; return `${n} ${n === 1 ? 'multa' : 'multas'}`; })()}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {result.renainf?.infracoes?.map((inf, idx) => (
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
                          Multa #{idx + 1} · {v(inf.codigoInfra)}
                        </span>
                        <span style={{
                          padding: "4px 10px",
                          border: "1px solid rgba(239,68,68,0.3)",
                          background: "rgba(239,68,68,0.1)",
                          color: "#ef4444",
                          fontSize: 9,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}>
                          {v(inf.situacao)}
                        </span>
                      </div>
                      <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                        <div>
                          <DataRow label="Auto"            value={v(inf.autoInfra)} mono />
                          <DataRow label="Data"            value={v(inf.dataInfra)} mono />
                          <DataRow label="Órgão Emissor"   value={v(inf.orgaoEmissor)} />
                        </div>
                        <div>
                          <DataRow label="Valor Original"  value={v(inf.valorOriginal) !== "—" ? `R$ ${inf.valorOriginal}` : "—"} isError />
                          <DataRow label="Valor Anotado"   value={v(inf.valorAnotado) !== "—" ? `R$ ${inf.valorAnotado}` : "—"} />
                          <DataRow label="Local"           value={v(inf.localInfra)} />
                        </div>
                      </div>
                      {inf.descricao && inf.descricao !== "—" && (
                        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(212,168,67,0.06)", border: "1px solid rgba(212,168,67,0.15)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3" }}>
                          {inf.descricao}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Bloco>
            )}
          </div>
        </div>
      )}

      {/* ── Histórico mobile toggle ── */}
      <div className="mobile-history-toggle" style={{ display: "none", marginTop: 24 }}>
        <button
          onClick={() => setShowMobileHistory(!showMobileHistory)}
          style={{
            width: "100%",
            padding: "14px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${showMobileHistory ? COR_ACCENT : "rgba(255,255,255,0.12)"}`,
            color: showMobileHistory ? COR_ACCENT : "#cfd6df",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {showMobileHistory ? "✕ Fechar Histórico" : "📋 Histórico de Consultas"}
        </button>
      </div>

      <div className={`historico-wrapper ${showMobileHistory ? "show-mobile" : ""}`}>
        <HistoricoConsultas
          historico={historico}
          onCarregar={(dados, p) => {
            setPlaca(p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p);
            setResult(dados as unknown as RenainfResult);
            setError(null);
            setShowMobileHistory(false);
          }}
          onLimpar={limpar}
          corAccent={COR_ACCENT}
          scrollTargetId="renainf-resultado"
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .search-bar-wrapper {
            padding: 20px 16px !important;
          }
          .search-bar-container {
            flex-direction: column;
          }
          #renainf-placa-input {
            font-size: 22px !important;
            padding: 16px 16px 16px 68px !important;
            letter-spacing: 0.1em !important;
          }
          #renainf-consultar-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 16px !important;
          }
          .snc-bloco {
            padding: 18px 16px !important;
          }
          .snc-data-grid {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
          .snc-data-row {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
            padding: 10px 12px !important;
          }
          .snc-data-row span { display: block !important; width: 100% !important; }
          .snc-data-row span:first-child { font-size: 8px !important; color: #8a94a3 !important; }
          .snc-data-row span:last-child  { font-size: 12px !important; text-align: left !important; }
          .mobile-history-toggle { display: block !important; }
          .historico-wrapper:not(.show-mobile) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
