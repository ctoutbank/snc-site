"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { HISTORICO_KM_MOCK_CLEAN, HISTORICO_KM_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface KmRegistro {
  data?: string;
  km?: number | string;
  fonte?: string;
  estado?: string;
}

interface HistoricoKmResult {
  placa?: string;
  totalRegistros?: number;
  anomalia?: boolean;
  registros?: KmRegistro[];
}

interface ConsultaResult {
  veiculo?: Record<string, unknown>;
  historicoKm?: HistoricoKmResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

function formatarKm(km: number | string | undefined): string {
  const n = Number(km ?? 0);
  if (!n) return "—";
  return `${n.toLocaleString("pt-BR")} km`;
}

const COR_ACCENT     = "#D4A843";
const COR_ACCENT_DIM = "rgba(212,168,67,0.2)";

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "22px 24px",
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
        color: COR_ACCENT, letterSpacing: "0.22em", textTransform: "uppercase" as const,
        marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${COR_ACCENT_DIM}`,
      }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

function DataRow({ label, value, mono = false, accent = false, danger = false }: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  accent?: boolean;
  danger?: boolean;
}) {
  if (value === undefined || value === null || value === "—" || value === "") return null;
  const color = danger ? "#ef4444" : accent ? COR_ACCENT : "#ffffff";
  return (
    <div className="snc-data-row" style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
      gap: 16, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#a0aec0", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
        fontSize: 12, color, fontWeight: accent || danger ? 700 : 400,
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export function BuscaHistoricoKmPanel() {
  const [placa, setPlaca]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [erro, setErro]         = useState<string | null>(null);
  const [resultado, setResultado] = useState<ConsultaResult | null>(null);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

  const { historico, salvar, limpar } = useHistoricoConsultas("historico-km");

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
      const res  = await fetch(`/api/apibrasil/historico-km?placa=${cleanPlaca}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao consultar Histórico Km.");

      setResultado(data as ConsultaResult);
      salvar(cleanPlaca, data as Record<string, unknown>);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa, salvar]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBuscar();
  };

  const handleExemplo = useCallback((cenario: "clean" | "restricted") => {
    const mockData = cenario === "clean" ? HISTORICO_KM_MOCK_CLEAN : HISTORICO_KM_MOCK_RESTRICTED;
    const placaSimulada = cenario === "clean" ? "XXX-0000" : "XXX-1111";
    // Popula o card do painel com os dados do mock (mesmo dado que aparece no relatório)
    setPlaca(placaSimulada);
    setResultado(mockData as unknown as ConsultaResult);
    setErro(null);
    // Abre o relatório em nova aba
    const { url } = gerarUrlRelatorio("historico-km", placaSimulada, "PLACA", mockData as unknown as Record<string, unknown>);
    window.open(url, "_blank");
  }, []);

  const hkm     = resultado?.historicoKm;
  const veiculo = resultado?.veiculo;
  const temAnomalia = !!hkm?.anomalia;
  const registros   = hkm?.registros ?? [];
  const modelo      = String(veiculo?.marcaModelo ?? "—").replace("/", " - ");

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
              id="historico-km-placa-input"
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
              background: loading ? "rgba(212,168,67,0.4)" : COR_ACCENT,
              color: "#0A1628",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12, letterSpacing: "0.12em",
              textTransform: "uppercase" as const, fontWeight: 700,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s", whiteSpace: "nowrap" as const,
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #0A1628", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Consultando
              </>
            ) : "Consultar"}
          </button>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", display: "flex", alignItems: "center", textTransform: "uppercase", paddingTop: 6 }}>Exemplos:</span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => handleExemplo("clean")}
              style={{ padding: "6px 14px", background: "rgba(43,168,74,0.08)", color: "#2BA84A", border: "1px solid rgba(43,168,74,0.25)", borderRadius: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: "pointer", transition: "all 0.15s", textTransform: "uppercase" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.15)"; e.currentTarget.style.borderColor = "#2BA84A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.08)"; e.currentTarget.style.borderColor = "rgba(43,168,74,0.25)"; }}
            >
              Exemplo de Relatório (Consistente)
            </button>
            <button
              onClick={() => handleExemplo("restricted")}
              style={{ padding: "6px 14px", background: "rgba(192,57,43,0.08)", color: "#c0392b", border: "1px solid rgba(192,57,43,0.25)", borderRadius: 2, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: "pointer", transition: "all 0.15s", textTransform: "uppercase" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.15)"; e.currentTarget.style.borderColor = "#c0392b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.08)"; e.currentTarget.style.borderColor = "rgba(192,57,43,0.25)"; }}
            >
              Exemplo de Relatório (Anomalia)
            </button>
          </div>
        </div>

        {erro && (
          <div style={{ marginTop: 14, padding: "10px 16px", background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#e07b6a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.08em" }}>
            ⚠ {erro}
          </div>
        )}
      </div>

      {/* ── Resultado ── */}
      {resultado && (
        <div id="historico-km-resultado" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Cabeçalho do resultado */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${temAnomalia ? "#ef4444" : COR_ACCENT}`,
            padding: "20px 28px",
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" as const }}>
                HISTÓRICO DE QUILOMETRAGEM · {placa.toUpperCase()}
              </span>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em" }}>
                {modelo}
              </span>
              <span style={{
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, fontWeight: 700, letterSpacing: "0.05em",
                color: temAnomalia ? "#ef4444" : "#2ba84a",
              }}>
                {temAnomalia ? "ANOMALIA DETECTADA NO HODÔMETRO" : "HISTÓRICO CONSISTENTE"} · {hkm?.totalRegistros ?? 0} REGISTRO(S)
              </span>
            </div>
            <button
              onClick={() => {
                const { url } = gerarUrlRelatorio("historico-km", placa, "PLACA", resultado as unknown as Record<string, unknown>);
                window.open(url, "_blank");
              }}
              style={{
                padding: "12px 24px", background: COR_ACCENT, color: "#0A1628",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.15s", whiteSpace: "nowrap" as const,
                marginLeft: 20, flexShrink: 0,
              }}
            >
              Visualizar Relatório
            </button>
          </div>

          {/* Identificação do veículo */}
          <Bloco titulo="Identificação do Veículo">
            <DataRow label="Marca / Modelo" value={modelo} />
            <DataRow label="Placa"          value={String(veiculo?.placa ?? placa)} mono />
            <DataRow label="Chassi"         value={String(veiculo?.chassi ?? "—")} mono />
            <DataRow label="RENAVAM"        value={String(veiculo?.renavam ?? "—")} mono />
            <DataRow label="Ano Fab / Mod"  value={`${veiculo?.anoFabricacao ?? "—"} / ${veiculo?.anoModelo ?? "—"}`} />
            <DataRow label="Cor"            value={String(veiculo?.cor ?? "—")} />
            <DataRow label="Combustível"    value={String(veiculo?.combustivel ?? "—")} />
          </Bloco>

          {/* Histórico de km */}
          <Bloco titulo={`Histórico de Quilometragem — ${hkm?.totalRegistros ?? 0} registro(s)`}>
            {registros.length === 0 ? (
              <div style={{ color: "#8a94a3", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: "12px 0" }}>
                Nenhum registro de quilometragem encontrado.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Cabeçalho da tabela */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr 1fr", gap: 8, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Data", "Km", "Fonte", "UF"].map((h) => (
                    <span key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>{h}</span>
                  ))}
                </div>
                {registros.map((reg, i) => {
                  const kmAtual = Number(reg.km ?? 0);
                  const kmProx  = i + 1 < registros.length ? Number(registros[i + 1].km ?? 0) : 0;
                  const isAnomaly = i + 1 < registros.length && kmAtual < kmProx;
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr 1fr", gap: 8, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df" }}>{reg.data ?? "—"}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: isAnomaly ? "#ef4444" : "#fff", fontWeight: isAnomaly ? 700 : 400 }}>
                        {formatarKm(reg.km)}
                        {isAnomaly && <span style={{ marginLeft: 4, fontSize: 9 }}>⚠</span>}
                      </span>
                      <span style={{ fontSize: 11, color: "#8a94a3" }}>{reg.fonte ?? "—"}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df" }}>{reg.estado ?? "—"}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {temAnomalia && (
              <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.06em", fontWeight: 700 }}>
                ⚠ ATENÇÃO: Quilometragem decrescente detectada — possível adulteração de hodômetro.
              </div>
            )}
          </Bloco>
        </div>
      )}

      {/* Mobile: botão histórico */}
      <div className="mobile-history-toggle" style={{ display: "none", marginTop: 24 }}>
        <button
          onClick={() => setShowHistoryMobile(!showHistoryMobile)}
          style={{
            width: "100%", padding: "14px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${showHistoryMobile ? COR_ACCENT : "rgba(255,255,255,0.12)"}`,
            color: showHistoryMobile ? COR_ACCENT : "#cfd6df",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em",
            textAlign: "center", cursor: "pointer", transition: "all 0.2s",
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
            setResultado(dados as unknown as ConsultaResult);
            setErro(null);
            setShowHistoryMobile(false);
          }}
          onLimpar={limpar}
          corAccent={COR_ACCENT}
          scrollTargetId="historico-km-resultado"
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .search-bar-container { grid-template-columns: 1fr !important; }
          .mobile-history-toggle { display: block !important; }
          .historico-wrapper:not(.show-mobile) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
