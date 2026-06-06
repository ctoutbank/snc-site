"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { DEBITOS_V4_MOCK_CLEAN, DEBITOS_V4_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos mapeados ───────────────────────────────────────────────────────────

interface DebitoItemResult {
  descricao?: string;
  valor?: number | string;
  dataVencimento?: string;
  orgaoEmissor?: string;
  tipoDebito?: string;
  codigoInfracao?: string;
  situacao?: string;
}

interface DebitosResult {
  veiculo?: {
    placa?: string;
    renavam?: string;
    chassi?: string;
    marca_modelo?: string;
    anoFabricacao?: string;
    anoModelo?: string;
    cor?: string;
    combustivel?: string;
  };
  debitos?: {
    placa?: string;
    renavam?: string;
    chassi?: string;
    marcaModelo?: string;
    anoFabricacao?: string | number;
    anoModelo?: string | number;
    combustivel?: string;
    cor?: string;
    multas?: DebitoItemResult[];
    ipva?: DebitoItemResult[];
    licenciamento?: DebitoItemResult[];
    dpvat?: DebitoItemResult[];
    outrosDebitos?: DebitoItemResult[];
    totalMultas?: number | string;
    totalIpva?: number | string;
    totalLicenciamento?: number | string;
    totalDpvat?: number | string;
    totalGeral?: number | string;
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
export function BuscaDebitosPanel() {
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<DebitosResult | null>(null);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

  // Histórico de Consultas
  const { historico, salvar, limpar } = useHistoricoConsultas("debitos");

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
      const res = await fetch(`/api/apibrasil/debitos?placa=${cleanPlaca}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao consultar Débitos.");

      const resData = data.debitos as DebitosResult;
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
    const mockData = isClean ? DEBITOS_V4_MOCK_CLEAN : DEBITOS_V4_MOCK_RESTRICTED;
    // Popula o card do painel com os dados do mock (mesmo dado que aparece no relatório)
    setPlaca(placaSimulada);
    setResultado(mockData as unknown as DebitosResult);
    setErro(null);
    // Abre o relatório em nova aba
    const { url } = await gerarUrlRelatorio("debitos", placaSimulada, "PLACA", mockData);
    window.open(url, "_blank");
  }, []);

  const r = resultado;
  const veiculo = r?.veiculo ?? {};
  const debitos = r?.debitos ?? {};
  const totalGeral = debitos.totalGeral ?? "R$ 0,00";
  const temDebitos = totalGeral !== "R$ 0,00" && totalGeral !== "—" && totalGeral !== "0";

  return (
    <div>
      {/* ── Inputs de Busca ── */}
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
              id="debitos-placa-input"
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
            Exemplo de Relatório (Isento de Débitos)
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
            Exemplo de Relatório (Com Débitos)
          </button>
          </div>
        </div>
      </div>

      {erro && (
        <div style={{
          background: "rgba(224,80,67,0.08)",
          border: "1px solid rgba(224,80,67,0.25)",
          color: "#ff6b6b",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          padding: "16px 20px",
          marginBottom: 32,
        }}>
          [ERRO] {erro}
        </div>
      )}

      {/* ── Resultado ── */}
      {r && (
        <div id="debitos-resultado" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          
          {/* Cabeçalho de Resultado */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${COR_ACCENT}`,
            padding: "20px 28px", marginBottom: 12
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span className="snc-mono" style={{ fontSize: 9, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700 }}>DÉBITOS · {placa.toUpperCase()}</span>
              <span style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 22, margin: "6px 0 0", color: "#fff", fontWeight: 700, letterSpacing: "0.02em" }}>
                {(veiculo.marca_modelo || debitos.marcaModelo || "—").toString().replace("/", " - ")}
              </span>
              <span style={{
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, fontWeight: 700, letterSpacing: "0.05em",
                color: temDebitos ? "#ef4444" : "#2ba84a",
              }}>
                {temDebitos ? `DÉBITOS PENDENTES · TOTAL ${totalGeral}` : "ISENTO DE DÉBITOS"}
              </span>
            </div>
            <button
              onClick={async () => {
                const { url } = await gerarUrlRelatorio("debitos", placa.replace(/[^A-Z0-9]/g, ""), "PLACA", r as unknown as Record<string, unknown>);
                window.open(url, "_blank");
              }}
              style={{
                padding: "12px 24px", background: COR_ACCENT, color: "#0a1628",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#b8913c";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = COR_ACCENT;
              }}
            >
              Abrir Relatório Completo ↗
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Informações Gerais */}
            <Bloco titulo="Ficha do Veículo">
              <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                <DataRow label="Marca/Modelo" value={veiculo.marca_modelo || debitos.marcaModelo} />
                <DataRow label="RENAVAM" value={veiculo.renavam || debitos.renavam} mono />
                <DataRow label="Chassi" value={veiculo.chassi || debitos.chassi} mono />
                <DataRow label="Ano Fab/Mod" value={`${veiculo.anoFabricacao || debitos.anoFabricacao} / ${veiculo.anoModelo || debitos.anoModelo}`} />
                <DataRow label="Cor" value={veiculo.cor || debitos.cor} />
                <DataRow label="Combustível" value={veiculo.combustivel || debitos.combustivel} />
              </div>
            </Bloco>

            {/* Resumo Financeiro */}
            <Bloco titulo="Resumo Financeiro">
              <DataRow label="Multas de Trânsito" value={debitos.totalMultas} highlight={debitos.totalMultas !== "R$ 0,00"} />
              <DataRow label="IPVA" value={debitos.totalIpva} highlight={debitos.totalIpva !== "R$ 0,00"} />
              <DataRow label="Licenciamento Anual" value={debitos.totalLicenciamento} highlight={debitos.totalLicenciamento !== "R$ 0,00"} />
              <DataRow label="Seguro DPVAT" value={debitos.totalDpvat} highlight={debitos.totalDpvat !== "R$ 0,00"} />
              <DataRow label="Total Geral Acumulado" value={totalGeral} highlight={temDebitos} />
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
        {/* ── Histórico de Consultas ── */}
        <HistoricoConsultas
          historico={historico}
          onCarregar={(dados, p) => {
            setPlaca(p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p);
            setResultado(dados as unknown as DebitosResult);
            setErro(null);
            setShowHistoryMobile(false);
          }}
          onLimpar={limpar}
          corAccent="#D4A843"
          scrollTargetId="debitos-resultado"
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .search-bar-wrapper {
          border-radius: 4px;
        }
        .search-bar-container input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        @media (max-width: 768px) {
          .search-bar-wrapper {
            padding: 20px 16px !important;
          }
          .search-bar-container {
            display: flex !important;
            flex-direction: column !important;
          }
          #debitos-placa-input {
            font-size: 22px !important;
            padding: 16px 16px 16px 68px !important;
            letter-spacing: 0.1em !important;
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
