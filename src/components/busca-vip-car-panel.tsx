"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { VIP_CAR_MOCK_CLEAN, VIP_CAR_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos (estrutura real confirmada em homolog) ─────────────────────────────
interface Identificacao {
  placa?: string | null;
  marcaModelo?: string | null;
  anoFabricacao?: string | null;
  anoModelo?: string | null;
  categoria?: string | null;
  combustivel?: string | null;
  municipio?: string | null;
  statusDescricao?: string | null;
}

interface RouboFurto {
  declaracao: boolean;
  devolucao: boolean;
  recuperacao: boolean;
}

interface PrecificadorItem {
  anoModelo: string;
  codigo: string;
  fabricanteModelo: string;
  informante: string;
  preco: string;
}

interface RenainfOcorrencia {
  auto: string;
  dataHora: string;
  descricao: string;
  orgao: string;
  codigo: string;
  valor: string;
}

interface ProprietarioResult {
  nome?: string | null;
  documento?: string | null;
  renavam?: string | null;
  municipio?: string | null;
  uf?: string | null;
  cor?: string | null;
  motor?: string | null;
  chassi?: string | null;
  crlv?: string | null;
  dataAtualizacao?: string | null;
  statusDescricao?: string | null;
}

interface DadosTecnicosResult {
  cor?: string | null;
  chassi?: string | null;
  marca?: string | null;
  modelo?: string | null;
  motor?: string | null;
  potencia?: string | null;
  cilindrada?: string | null;
  capacidadePassageiros?: string | null;
  carroceria?: string | null;
  especie?: string | null;
  tipo?: string | null;
  procedencia?: string | null;
}

interface VipCarResult {
  identificacao: Identificacao | null;
  rouboFurto: RouboFurto | null;
  precificador: PrecificadorItem[];
  renainf: { total: string; ocorrencias: RenainfOcorrencia[] };
  pdf: string | null;
  proprietario?: ProprietarioResult | null;
  dadosTecnicos?: DadosTecnicosResult | null;
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
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e0e6ef" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Indicador Roubo/Furto ────────────────────────────────────────────────────
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
export function BuscaVipCarPanel() {
  const [placa, setPlaca]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState<string | null>(null);
  const [resultado, setResultado] = useState<VipCarResult | null>(null);
  const [activeTab, setActiveTab] = useState<"identificacao" | "fipe" | "renainf">("identificacao");
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const { historico, salvar, limpar } = useHistoricoConsultas("vip-car");

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
      const res  = await fetch(`/api/apibrasil/vip-car?placa=${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na consulta.");
      setResultado(data as VipCarResult);
      salvar(clean, data as Record<string, unknown>);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa]);

  const handleExemplo = useCallback(async (cenario: "clean" | "restricted") => {
    const isClean = cenario === "clean";
    const placaSimulada = isClean ? "XXX-0000" : "XXX-1111";
    const mockData = isClean ? VIP_CAR_MOCK_CLEAN : VIP_CAR_MOCK_RESTRICTED;
    // Popula o card do painel com os dados do mock (mesmo dado que aparece no relatório)
    setPlaca(placaSimulada);
    setResultado(mockData as unknown as VipCarResult);
    setErro(null);
    // Abre o relatório em nova aba
    const { url } = await gerarUrlRelatorio("vip-car", placaSimulada, "PLACA", mockData);
    window.open(url, "_blank");
  }, []);

  const r = resultado;

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
              id="vip-car-placa-input"
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
            id="vip-car-consultar-btn"
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
            Exemplo de Relatório (Roubo + Leilão)
          </button>
          </div>
        </div>
      </div>

      {/* ── Resultado ── */}
      {r && (
        <div id="vip-car-resultado" style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* ── Cabeçalho do Resultado & Botão Gerar Relatório ── */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${COR_ACCENT}`,
            padding: "20px 28px", marginBottom: 12
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" as const }}>
                RELATÓRIO VEICULAR COMPLETO · {placa}
              </span>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.identificacao?.marcaModelo
                  ? String(r.identificacao.marcaModelo).toUpperCase().replace('/', ' - ')
                  : placa.toUpperCase()}
              </span>
            </div>
            <button
              onClick={async () => {
                const clean = placa.replace(/[^A-Z0-9]/g, "");
                const { url } = await gerarUrlRelatorio("vip-car", clean, "PLACA", r as unknown as Record<string, unknown>);
                window.open(url, "_blank");
              }}
              style={{
                padding: "12px 24px", background: COR_ACCENT, color: "#0a1628",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.2s", whiteSpace: "nowrap" as const,
                marginLeft: 20, flexShrink: 0
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#1d7a36"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = COR_ACCENT; }}
            >
              Visualizar Relatório
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
            {[
              { id: "identificacao", label: "Ficha & Proprietário" },
              { id: "fipe", label: "Precificação FIPE" },
              { id: "renainf", label: `Infrações (RENAINF · ${r.renainf.total})` }
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
                    {r.identificacao ? (
                      <>
                        <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, fontWeight: 400, color: "#fff", lineHeight: 1.2, marginBottom: 20 }}>
                          {r.identificacao.marcaModelo ?? "—"}
                        </h3>
                        <DataRow label="Placa"          value={r.identificacao.placa ?? "—"} />
                        <DataRow label="Ano Fabricação" value={r.identificacao.anoFabricacao ?? "—"} />
                        <DataRow label="Ano Modelo"     value={r.identificacao.anoModelo ?? "—"} />
                        <DataRow label="Categoria"      value={r.identificacao.categoria ?? "—"} />
                        <DataRow label="Combustível"    value={r.identificacao.combustivel ?? "—"} />
                        <DataRow label="Município"      value={r.identificacao.municipio ?? "—"} />
                        {r.identificacao.statusDescricao && (
                          <div style={{ marginTop: 16, padding: "8px 12px", background: "rgba(212,168,67,0.07)", border: `1px solid ${COR_ACCENT_DIM}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COR_ACCENT }}>
                            ✓ {r.identificacao.statusDescricao}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Dados não disponíveis</span>
                    )}
                  </Bloco>
                  <Bloco titulo="Roubo · Furto">
                    {r.rouboFurto ? (
                      <>
                        <IndicadorBool label="Declaração de Roubo/Furto" valor={r.rouboFurto.declaracao} />
                        <IndicadorBool label="Devolução Registrada"       valor={r.rouboFurto.devolucao} alerta={r.rouboFurto.declaracao} />
                        <IndicadorBool label="Recuperação Registrada"     valor={r.rouboFurto.recuperacao} alerta={r.rouboFurto.declaracao} />
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem ocorrências</span>
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
                        <DataRow label="Documento"    value={r.proprietario.documento ?? "—"} />
                        <DataRow label="Município / UF" value={`${r.proprietario.municipio ?? "—"} / ${r.proprietario.uf ?? "—"}`} />
                        <DataRow label="RENAVAM"      value={r.proprietario.renavam ?? "—"} />
                        <DataRow label="CRLV Digital" value={r.proprietario.crlv ?? "—"} />
                        <DataRow label="Atualizado Em" value={r.proprietario.dataAtualizacao ?? "—"} />
                        {r.proprietario.statusDescricao && (
                          <div style={{ marginTop: 16, padding: "8px 12px", background: "rgba(212,168,67,0.07)", border: `1px solid ${COR_ACCENT_DIM}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COR_ACCENT }}>
                            ✓ {r.proprietario.statusDescricao}
                          </div>
                        )}
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem dados do proprietário</span>
                    )}
                  </Bloco>
                  <Bloco titulo="Dados Técnicos do Veículo">
                    {r.dadosTecnicos ? (
                      <>
                        <DataRow label="Chassi"         value={r.dadosTecnicos.chassi ?? "—"} />
                        <DataRow label="Motor"          value={r.dadosTecnicos.motor ?? "—"} />
                        <DataRow label="Cor"            value={r.dadosTecnicos.cor ?? "—"} />
                        <DataRow label="Potência"       value={r.dadosTecnicos.potencia ?? "—"} />
                        <DataRow label="Cilindrada"     value={r.dadosTecnicos.cilindrada ?? "—"} />
                        <DataRow label="Carroceria"     value={r.dadosTecnicos.carroceria ?? "—"} />
                        <DataRow label="Espécie / Tipo" value={`${r.dadosTecnicos.especie ?? "—"} / ${r.dadosTecnicos.tipo ?? "—"}`} />
                        <DataRow label="Procedência"    value={r.dadosTecnicos.procedencia ?? "—"} />
                      </>
                    ) : (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem ficha técnica</span>
                    )}
                  </Bloco>
                </div>
              </>
            )}

            {/* Aba 2: Precificação FIPE */}
            {activeTab === "fipe" && r.precificador && (
              <Bloco titulo="Precificador · Tabela FIPE">
                {r.precificador.length > 0 ? (
                  <div style={{ overflowX: "auto" as const }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                      <thead>
                        <tr>
                          {["Código", "Fabricante / Modelo", "Ano Modelo", "Informante", "Preço"].map((h) => (
                            <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const, textAlign: "left" as const, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {r.precificador.map((item, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px" }}>{item.codigo}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px" }}>{item.fabricanteModelo}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{item.anoModelo}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{item.informante}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COR_ACCENT, fontWeight: 700, padding: "10px 12px" }}>{item.preco}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Nenhuma precificação FIPE registrada.</span>
                )}
              </Bloco>
            )}

            {/* Aba 3: Infrações RENAINF */}
            {activeTab === "renainf" && r.renainf && (
              <Bloco titulo={`RENAINF · Infrações de Trânsito (${r.renainf.total})`}>
                {r.renainf.ocorrencias.length > 0 ? (
                  <div style={{ overflowX: "auto" as const }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                      <thead>
                        <tr>
                          {["Auto", "Data/Hora", "Código", "Descrição", "Órgão", "Valor"].map((h) => (
                            <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const, textAlign: "left" as const, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {r.renainf.ocorrencias.map((inf, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px" }}>{inf.auto}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{inf.dataHora}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px" }}>{inf.codigo}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{inf.descricao}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{inf.orgao}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ef4444", fontWeight: 700, padding: "10px 12px" }}>{inf.valor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>
                    Nenhuma infração registrada no RENAINF.
                  </span>
                )}
              </Bloco>
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
            setResultado(dados as unknown as VipCarResult);
            setErro(null);
            setShowHistoryMobile(false);
          }}
          onLimpar={limpar}
          corAccent={COR_ACCENT}
          scrollTargetId="vip-car-resultado"
        />
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          #vip-car-resultado > div:nth-child(3) { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .search-bar-wrapper {
            padding: 20px 16px !important;
          }
          .search-bar-container {
            flex-direction: column;
          }
          #vip-car-placa-input {
            font-size: 22px !important;
            padding: 16px 16px 16px 68px !important;
            letter-spacing: 0.1em !important;
          }
          #vip-car-consultar-btn {
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
