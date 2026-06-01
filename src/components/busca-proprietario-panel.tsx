"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { PROPRIETARIO_MOCK_CLEAN, PROPRIETARIO_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos (estrutura real confirmada em homolog) ─────────────────────────────
interface ProprietarioData {
  nome?: string | null;
  documento?: string | null;
  placa?: string | null;
  renavam?: string | null;
  municipio?: string | null;
  uf?: string | null;
  marcaModelo?: string | null;
  anoFabricacao?: string | null;
  anoModelo?: string | null;
  cor?: string | null;
  combustivel?: string | null;
  motor?: string | null;
  chassi?: string | null;
  crlv?: string | null;
  dataAtualizacao?: string | null;
  statusCodigo?: string | null;
  statusDescricao?: string | null;
}

interface ConsultaResult {
  proprietario: ProprietarioData | null;
  pdf?: string | null;
}

// ─── Formatação de placa ──────────────────────────────────────────────────────
function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

// ─── Máscara CPF/CNPJ ────────────────────────────────────────────────────────
function mascaraDoc(doc?: string | null): string {
  if (!doc) return "—";
  const d = doc.replace(/\D/g, "");
  if (d.length === 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "***.$2.$3-**");
  if (d.length === 14)
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/****-**");
  return doc; // se já vier formatado (ex: "000.000.000-00")
}

// ─── Linha de dado ─────────────────────────────────────────────────────────────
function DataRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  if (!value || value === "—") return null;
  return (
    <div className="snc-data-row" style={{
      display: "grid", gridTemplateColumns: "180px 1fr",
      padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
      gap: 16, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif", fontSize: 13, color: "#e0e6ef" }}>
        {value}
      </span>
    </div>
  );
}

const COR_ACCENT = "#D4A843"; // Âmbar padrão AutoScore
const COR_ACCENT_DIM = "rgba(212,168,67,0.2)";

// ─── Separador de seção ────────────────────────────────────────────────────────
function SectionTitle({ label }: { label: string }) {
  const cor = COR_ACCENT;
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
      color: cor, letterSpacing: "0.22em", textTransform: "uppercase" as const,
      paddingTop: 18, paddingBottom: 12, marginBottom: 12,
      borderBottom: `1px solid ${cor}22`,
    }}>
      {label}
    </div>
  );
}

// ─── Bloco de seção ────────────────────────────────────────────────────────────
function Bloco({ titulo, children, bg, border }: {
  titulo: string; children: React.ReactNode; bg?: string; border?: string;
}) {
  const cor = COR_ACCENT;
  return (
    <div className="snc-bloco" style={{
      background: bg ?? "rgba(255,255,255,0.03)",
      border: border ?? "1px solid rgba(255,255,255,0.08)",
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

// ─── Avatar inicial ────────────────────────────────────────────────────────────
function Avatar({ nome }: { nome?: string | null }) {
  const inicial = nome?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <div style={{
      width: 68, height: 68, borderRadius: "50%",
      background: "rgba(128,90,213,0.15)",
      border: "2px solid rgba(128,90,213,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Libre Caslon Text', serif", fontSize: 28, color: COR_ACCENT,
      flexShrink: 0,
    }}>
      {inicial}
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export function BuscaProprietarioPanel() {
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ConsultaResult | null>(null);
  const [activeTab, setActiveTab] = useState<"proprietario" | "veiculo">("proprietario");
  const { historico, salvar, limpar } = useHistoricoConsultas("proprietario");
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

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
      const res = await fetch(`/api/apibrasil/proprietario?placa=${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na consulta.");
      setResultado(data as ConsultaResult);
      salvar(clean, data as Record<string, unknown>);
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
    const isClean = cenario === "clean";
    const placaSimulada = isClean ? "XXX-0000" : "XXX-1111";
    const mockData = isClean ? PROPRIETARIO_MOCK_CLEAN : PROPRIETARIO_MOCK_RESTRICTED;
    // Popula o card do painel com os dados do mock (mesmo dado que aparece no relatório)
    setPlaca(placaSimulada);
    setResultado(mockData as unknown as ConsultaResult);
    setErro(null);
    // Abre o relatório em nova aba
    const { url } = gerarUrlRelatorio("proprietario", placaSimulada, "PLACA", mockData);
    window.open(url, "_blank");
  }, []);

  const p = resultado?.proprietario;

  return (
    <div>
      {/* ── Input ── */}
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
              id="proprietario-placa-input"
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
            id="proprietario-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px",
              background: loading ? "rgba(212,168,67,0.4)" : "#D4A843",
              color: "#0A1628",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12, letterSpacing: "0.12em",
              textTransform: "uppercase" as const,
              fontWeight: 700, border: "none",
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
            onClick={() => handleExemplo("clean")}
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
            onClick={() => handleExemplo("restricted")}
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
            Exemplo de Relatório (Com Bloqueio)
          </button>
          </div>
        </div>
      </div>

      {/* ── Resultado ── */}
      {resultado && (
        <div id="proprietario-resultado" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* ── Cabeçalho do Resultado & Botão Gerar Relatório ── */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid #D4A843",
            padding: "20px 28px", marginBottom: 12,
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#D4A843", letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" as const }}>
                PROPRIETÁRIO ATUAL · {placa}
              </span>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                {p?.nome
                  ? String(p.nome).toUpperCase()
                  : p?.marcaModelo
                    ? String(p.marcaModelo).replace('/', ' - ').toUpperCase()
                    : placa.toUpperCase()}
              </span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0, marginLeft: 20 }}>
              {resultado.pdf && (
                <a
                  href={resultado.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "12px 18px", background: "transparent",
                    border: "1px solid rgba(212,168,67,0.5)", color: "#D4A843",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                    letterSpacing: "0.1em", textDecoration: "none",
                    textTransform: "uppercase" as const, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  ↓ PDF
                </a>
              )}
              <button
                onClick={() => {
                  const { url } = gerarUrlRelatorio(
                    "proprietario", placa, "PLACA",
                    resultado as unknown as Record<string, unknown>
                  );
                  window.open(url, "_blank");
                }}
                style={{
                  padding: "12px 24px", background: "#D4A843", color: "#0a1628",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  fontWeight: 700, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.15s", whiteSpace: "nowrap" as const,
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#b8913c"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#D4A843"; }}
              >
                Visualizar Relatório
              </button>
            </div>
          </div>

          {/* ── Conteúdo das Abas (Proprietário + Veículo Juntos) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            {p ? (
              <>
                {/* Bloco 1: Proprietário Atual */}
                <Bloco titulo="Proprietário · Atual">
                  {/* Nome em destaque */}
                  <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32 }}>
                    <Avatar nome={p.nome} />
                    <div>
                      <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 22, fontWeight: 400, color: "#ffffff", lineHeight: 1.2, marginBottom: 6 }}>
                        {p.nome ?? "Nome não disponível"}
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", letterSpacing: "0.06em" }}>
                        {mascaraDoc(p.documento)}
                      </div>
                    </div>
                  </div>

                  <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                    <div>
                      <DataRow label="Município" value={p.municipio ?? "—"} />
                      <DataRow label="UF" value={p.uf ?? "—"} />
                    </div>
                    <div>
                      <DataRow label="Atualizado em" value={p.dataAtualizacao ?? "—"} />
                    </div>
                  </div>

                  {p.statusDescricao && (
                    <>
                      <SectionTitle label="Status da Consulta" />
                      <div style={{ padding: "10px 14px", background: "rgba(43,168,74,0.07)", border: "1px solid rgba(43,168,74,0.2)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#2BA84A", letterSpacing: "0.08em" }}>
                        ✓ {p.statusDescricao}
                      </div>
                    </>
                  )}
                </Bloco>

                {/* Bloco 2: Dados do Veículo */}
                <Bloco titulo="Veículo · Dados">
                  <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 22, fontWeight: 400, color: "#fff", lineHeight: 1.2, marginBottom: 24 }}>
                    {p.marcaModelo ?? "—"}
                  </h3>

                  <div className="snc-data-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                    <div>
                      <DataRow label="Placa" value={p.placa ?? "—"} />
                      <DataRow label="RENAVAM" value={p.renavam ?? "—"} />
                      <DataRow label="Ano Fabricação" value={p.anoFabricacao ?? "—"} />
                      <DataRow label="Ano Modelo" value={p.anoModelo ?? "—"} />
                    </div>
                    <div>
                      <DataRow label="Cor" value={p.cor ?? "—"} />
                      <DataRow label="Combustível" value={p.combustivel ?? "—"} />
                      <DataRow label="Motor" value={p.motor ?? "—"} />
                    </div>
                  </div>

                  {p.chassi && (
                    <>
                      <SectionTitle label="Chassi" />
                      <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#ffffff", letterSpacing: "0.06em", wordBreak: "break-all" as const }}>
                        {p.chassi}
                      </div>
                    </>
                  )}
                </Bloco>
              </>
            ) : (
              <div style={{ padding: 32, textAlign: "center" as const, border: "1px solid rgba(255,255,255,0.06)", color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                Nenhum dado encontrado para esta placa.
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 2, padding: "16px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
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
          onClick={() => setShowHistoryMobile(!showHistoryMobile)}
          style={{
            width: "100%",
            padding: "14px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${showHistoryMobile ? "#D4A843" : "rgba(255,255,255,0.12)"}`,
            color: showHistoryMobile ? "#D4A843" : "#cfd6df",
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
            setResultado(dados as unknown as ConsultaResult);
            setErro(null);
            setShowHistoryMobile(false);
          }}
          onLimpar={limpar}
          corAccent="#D4A843"
          scrollTargetId="proprietario-resultado"
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          #proprietario-resultado > div:nth-child(3) { grid-template-columns: 1fr !important; }
          .search-bar-wrapper {
            padding: 20px 16px !important;
          }
          .search-bar-container {
            flex-direction: column;
          }
          #proprietario-placa-input {
            font-size: 22px !important;
            padding: 16px 16px 16px 68px !important;
            letter-spacing: 0.1em !important;
          }
          #proprietario-consultar-btn {
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
