"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";

// ─── Tipos mapeados ───────────────────────────────────────────────────────────

interface VeiculoResult {
  veiculo: {
    placa?: string;
    marca_modelo?: string;
    ano_fabricacao?: string | number;
    ano_modelo?: string | number;
    cor?: string;
    combustivel?: string;
    chassi?: string;
    renavam?: string;
    motor?: string;
    municipio?: string;
    uf?: string;
  };
}

const COR_ACCENT = "#D4A843"; // Âmbar padrão AutoScore
const COR_ACCENT_DIM = "rgba(212,168,67,0.2)";

// ─── Formatação de Placa ──────────────────────────────────────────────────────

function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
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

// ─── Componente Principal ─────────────────────────────────────────────────────

export function BuscaAgregadosPropriaPanel() {
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<VeiculoResult | null>(null);
  const { historico, salvar, limpar } = useHistoricoConsultas("agregados-propria");
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
      const res = await fetch(`/api/apibrasil/agregados-propria?placa=${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na consulta.");
      setResultado(data as VeiculoResult);
      salvar(clean, data as Record<string, unknown>);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa, salvar]);

  const handleExemplo = useCallback(() => {
    const placaSimulada = "SDD-4545";
    const mockData = {
      veiculo: {
        placa: "SDD4545",
        marca_modelo: "VW/FOX 1.0 GII",
        ano_fabricacao: "2012",
        ano_modelo: "2013",
        cor: "VERMELHA",
        combustivel: "ALCOOL/GASOLINA",
        chassi: "9BWZZZ377VT000000",
        renavam: "00456789012",
        motor: "CCC178906",
        municipio: "CURITIBA",
        uf: "PR"
      }
    };
    setPlaca(placaSimulada);
    setResultado(mockData);
    setErro(null);
    setIsFromHistory(false);
    
    // Abre o relatório em nova aba
    const { url } = gerarUrlRelatorio("agregados-propria", placaSimulada, "PLACA", mockData);
    window.open(url, "_blank");
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBuscar();
  };

  const v = resultado?.veiculo ?? {};

  return (
    <div>
      {/* ── Input de Placa ── */}
      <div className="search-bar-wrapper" style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 36px",
        marginBottom: 18,
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
              id="agregados-placa-input"
              type="text"
              autoComplete="off"
              value={placa}
              onChange={handleChange}
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
                WebkitBoxShadow: "0 0 0 1000px rgba(14,28,48,1) inset",
              }}
              onFocus={(e) => (e.target.style.borderColor = COR_ACCENT)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>
          <button
            id="agregados-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px",
              background: loading ? "rgba(212,168,67,0.4)" : COR_ACCENT,
              color: "#0a1628",
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
              onClick={handleExemplo}
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
              Exemplo de Relatório (Homologação)
            </button>
          </div>
        </div>
      </div>

      {/* ── Resultados ── */}
      {resultado && (
        <div id="agregados-resultado" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${COR_ACCENT}`,
            padding: "20px 28px", marginBottom: 12,
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700 }}>AGREGADOS PRÓPRIA · {placa.toUpperCase()}</span>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em" }}>
                {v.marca_modelo ? String(v.marca_modelo).toUpperCase().replace('/', ' - ') : 'Veículo'}
              </span>
              <span style={{
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, fontWeight: 700, letterSpacing: "0.05em",
                color: "#2ba84a",
              }}>
                DADOS EXTRAÍDOS COM SUCESSO (BASE PROPRIETÁRIA)
              </span>
            </div>
            <button
              id="agregados-gerar-relatorio-btn"
              onClick={() => {
                const clean = placa.replace(/[^A-Z0-9]/g, "");
                const { url } = gerarUrlRelatorio(
                  "agregados-propria",
                  clean,
                  "PLACA",
                  resultado as unknown as Record<string, unknown>
                );
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
              onMouseEnter={(e) => {
                if (isFromHistory) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.borderColor = COR_ACCENT;
                  e.currentTarget.style.color = "#fff";
                } else {
                  e.currentTarget.style.background = "#b8913c";
                }
              }}
              onMouseLeave={(e) => {
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

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* ── Dados de Identificação ── */}
            <Bloco titulo="Ficha Cadastral do Veículo" badge="INFO">
              <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                <div>
                  <DataRow label="Placa" value={String(v.placa ?? "—")} mono />
                  <DataRow label="Marca / Modelo" value={v.marca_modelo ? String(v.marca_modelo).toUpperCase().replace('/', ' - ') : "—"} />
                  <DataRow label="Ano Fabricação" value={String(v.ano_fabricacao ?? "—")} mono />
                  <DataRow label="Ano Modelo" value={String(v.ano_modelo ?? "—")} mono />
                </div>
                <div>
                  <DataRow label="Cor" value={String(v.cor ?? "—")} />
                  <DataRow label="Combustível" value={String(v.combustivel ?? "—")} />
                  <DataRow label="Município / UF" value={v.municipio && v.uf ? `${v.municipio} / ${v.uf}` : "—"} />
                </div>
              </div>
            </Bloco>

            {/* ── Identificadores Estruturais ── */}
            <Bloco titulo="Agregados & Números de Chassi" badge="ESTRUTURAL">
              <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                <div>
                  <DataRow label="Chassi" value={String(v.chassi ?? "—")} mono />
                  <DataRow label="RENAVAM" value={String(v.renavam ?? "—")} mono />
                </div>
                <div>
                  <DataRow label="Número do Motor" value={String(v.motor ?? "—")} mono />
                </div>
              </div>
            </Bloco>
          </div>
        </div>
      )}

      {/* Botão para abrir Histórico no Mobile */}
      <div className="mobile-history-toggle" style={{ display: "none", marginTop: 24 }}>
        <button
          onClick={() => setShowHistoryMobile(!showHistoryMobile)}
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
            setResultado(dados as unknown as VeiculoResult);
            setErro(null);
            setIsFromHistory(true);
            setShowHistoryMobile(false); // Fecha no mobile ao carregar
          }}
          onLimpar={limpar}
          corAccent="#D4A843"
          scrollTargetId="agregados-resultado"
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .search-bar-wrapper {
            padding: 20px 16px !important;
          }
          .search-bar-container {
            flex-direction: column;
          }
          #agregados-placa-input {
            font-size: 22px !important;
            padding: 16px 16px 16px 68px !important;
            letter-spacing: 0.1em !important;
          }
          #agregados-consultar-btn {
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
