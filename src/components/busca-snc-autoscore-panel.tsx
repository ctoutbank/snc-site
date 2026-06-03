"use client";

import { useState, useCallback, Fragment, useMemo } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { CrlveDownloadButton } from "@/components/crlve-download-button";

// ─── Tipos e Interfaces ──────────────────────────────────────────────────────

interface Identificacao {
  placa?: string | null;
  marcaModelo?: string | null;
  anoFabricacao?: string | null;
  anoModelo?: string | null;
  categoria?: string | null;
  combustivel?: string | null;
  municipio?: string | null;
  uf?: string | null;
  statusDescricao?: string | null;
}

interface DadosTecnicos {
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

interface Proprietario {
  nome?: string | null;
  documento?: string | null;
  renavam?: string | null;
  municipio?: string | null;
  uf?: string | null;
  crlv?: string | null;
  dataAtualizacao?: string | null;
  statusDescricao?: string | null;
}

interface RouboFurto {
  declaracao: boolean;
  devolucao: boolean;
  recuperacao: boolean;
}

interface RestricoesBin {
  existeRestricaoGeral: boolean;
  renajud: boolean;
  rouboFurto: boolean;
  veiculoBaixado: boolean;
  alertaSinistro: boolean;
  mensagens: string[];
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
  local?: string;
  valorAnotado?: string;
  situacao?: string;
}

interface LeilaoResult {
  score: number | null;
  scoreLabel: string;
  aceitacao?: number | string | null;
  percentualSobreFipe?: number | string | null;
  exigeVistoriaEspecial?: string | null;
  dadosVeiculo?: {
    cambio?: string | null;
    qtdEixos?: string | null;
    eixoTraseiro?: string | null;
    kilometragem?: string | null;
  } | null;
  totalLeiloes: number;
  indicio: boolean;
  historico: {
    data: string;
    leiloeiro: string;
    lote: string;
    comitente: string;
    patio: string;
    valorArremate: string;
    condicaoGeral: string;
    situacaoChassi: string;
    condicaoMotor?: string;
    condicaoMecanica?: string;
    condicaoCambio?: string;
    imagens: string[];
  }[];
  checklist: {
    frente: string | null;
    traseira: string | null;
    laterais: string | null;
    lateralDireita?: string | null;
    lateralEsquerda?: string | null;
    teto: string | null;
    interior: string | null;
    airbags: string | null;
    rodas: string | null;
    localQueimado?: string | null;
    rodasFaltantes?: string | null;
    observacoes?: string | null;
  };
  sinistro: {
    existeOcorrência?: boolean;
    existeOcorrencia?: boolean;
    historico: {
      data: string;
      tipo: string;
      seguradora: string;
      valor: string;
      situacao: string;
      descricao: string;
    }[];
  };
}

interface DebitoItem {
  descricao?: string;
  valor: string;
  dataVencimento: string;
  orgaoEmissor?: string;
  situacao: string;
  exercicio?: string;
  parcela?: string;
}

interface DebitosResult {
  totalMultas: string;
  totalIpva: string;
  totalLicenciamento: string;
  totalDpvat: string;
  totalGeral: string;
  multas: DebitoItem[];
  ipva: DebitoItem[];
  licenciamento: DebitoItem[];
  dpvat: DebitoItem[];
}

interface RegistrosKm {
  data: string;
  km: number;
  fonte: string;
  estado: string;
}

interface HistoricoKmResult {
  totalRegistros: number;
  anomalia: boolean;
  registros: RegistrosKm[];
}

interface AutoScoreResult {
  status: {
    csv: "success" | "failed";
    leilao: "success" | "failed";
    debitos: "success" | "failed";
    km: "success" | "failed";
    gravame?: "success" | "failed";
    renajud?: "success" | "failed";
    fipe?: "success" | "failed";
    agregadosPropria?: "success" | "failed";
    crlve?: "success" | "failed";
  };
  identificacao: Identificacao | null;
  dadosTecnicos: DadosTecnicos | null;
  proprietario: Proprietario | null;
  rouboFurto: RouboFurto | null;
  restricoesBin: RestricoesBin | null;
  precificador: PrecificadorItem[];
  renainf: { total: string; ocorrencias: RenainfOcorrencia[] };
  leilao: LeilaoResult | null;
  debitos: DebitosResult | null;
  historicoKm: HistoricoKmResult | null;
  recall: { total: string; ocorrencias: any[] };
  pdf: string | null;
  crlve?: {
    exercicio?: string | null;
    codigoSegurancaCla?: string | null;
    existeOcorrencia?: boolean;
    observacoes?: string | null;
    pdfBase64?: string | null;
    pdf?: string | null;
    statusDescricao?: string | null;
    veiculo?: any;
  } | null;
  [key: string]: any;
}

// Sub-consultas sob demanda (Tab 2)
interface GravameOnDemand {
  financiamento?: string;
  agente_financeiro?: string;
  data_inclusao?: string;
  contrato_numero?: string;
  situacao?: string;
}

interface RenajudOnDemand {
  processo?: string;
  orgao_judicial?: string;
  tribunal?: string;
  restricoes?: string[];
  quantidade_ocorrencias?: string;
  [key: string]: any;
}

interface EstadualOnDemand {
  totalDebitos?: string | number;
  restricoes?: { tipo?: string; descricao?: string }[];
  multas?: any[];
  ipva?: any[];
  [key: string]: any;
}

// ─── Estilos e Variáveis Visuais ─────────────────────────────────────────────
const COR_ACCENT = "#D4A843"; // Dourado Brass Premium
const COR_ACCENT_DIM = "rgba(212,168,67,0.12)";

function formatarBRL(valor?: string | number): string {
  if (valor === undefined || valor === null || valor === "") return "—";
  const num = typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;
  if (isNaN(num)) return String(valor);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function formatarPlacaInput(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

// ─── Componentes Locais de UI ─────────────────────────────────────────────────

function Bloco({ titulo, children, badge }: { titulo: string; children: React.ReactNode; badge?: string }) {
  return (
    <div className="snc-bloco animate-fade-in" style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "24px 28px",
      borderRadius: 1,
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid rgba(212,168,67,0.15)`,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          color: COR_ACCENT, letterSpacing: "0.22em", textTransform: "uppercase" as const,
        }}>
          {titulo}
        </div>
        {badge && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 8,
            color: COR_ACCENT, background: COR_ACCENT_DIM,
            padding: "2px 8px", border: `1px solid rgba(212,168,67,0.3)`
          }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function DataRow({ label, value, isMono = false }: { label: string; value?: string | null; isMono?: boolean }) {
  if (value === undefined || value === null || value === "" || value === "—") return null;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "170px 1fr",
      padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
      gap: 12, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ 
        fontFamily: isMono ? "'JetBrains Mono', monospace" : "inherit", 
        fontSize: isMono ? 11 : 12, 
        color: "#e2e8f0",
        fontWeight: isMono ? 500 : 400 
      }}>
        {value}
      </span>
    </div>
  );
}

function IndicadorBool({ label, valor, alerta = false }: { label: string; valor: boolean; alerta?: boolean }) {
  const ruim = alerta ? !valor : valor;
  const cor = ruim ? "#ef4444" : "#2BA84A";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: cor, flexShrink: 0 }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", letterSpacing: "0.08em", textTransform: "uppercase", flex: 1 }}>
        {label}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: cor, fontWeight: 700 }}>
        {valor ? "SIM / CONSTA" : "NÃO / NADA"}
      </span>
    </div>
  );
}

// Banner de Graceful Degradation / Falha de API
function BannerAviso({ base, onReconsultar }: { base: string; onReconsultar: () => void }) {
  return (
    <div style={{
      padding: "16px 20px", background: "rgba(212,168,67,0.05)",
      border: "1px solid rgba(212,168,67,0.2)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      gap: 16, marginBottom: 16, flexWrap: "wrap"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#e2e8f0", lineHeight: 1.4 }}>
          A base do dataset <strong style={{ color: COR_ACCENT }}>{base.toUpperCase()}</strong> apresentou instabilidade temporária. 
          O restante deste super-relatório está carregado.
        </div>
      </div>
      <button 
        onClick={onReconsultar}
        style={{
          background: COR_ACCENT, color: "#0A1628", border: "none",
          padding: "6px 12px", fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          fontWeight: 700, cursor: "pointer", textTransform: "uppercase"
        }}
      >
        Reconsultar {base}
      </button>
    </div>
  );
}

// Gráfico de Evolução de Quilometragem (SVG Sparkline Premium)
function GraficoKMEvolucao({ registros }: { registros: RegistrosKm[] }) {
  const pointsSorted = useMemo(() => {
    return [...registros]
      .filter(r => r.km > 0)
      .sort((a, b) => {
        const dateA = a.data ? new Date(a.data.split("/").reverse().join("-")) : new Date(0);
        const dateB = b.data ? new Date(b.data.split("/").reverse().join("-")) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
  }, [registros]);

  if (pointsSorted.length < 2) return null;

  const minKm = Math.min(...pointsSorted.map(p => p.km));
  const maxKm = Math.max(...pointsSorted.map(p => p.km));
  const rangeKm = maxKm - minKm === 0 ? 1 : maxKm - minKm;

  // Dimensões da ViewBox
  const width = 500;
  const height = 120;
  const padding = 15;

  const svgPoints = pointsSorted.map((p, index) => {
    const x = padding + (index / (pointsSorted.length - 1)) * (width - padding * 2);
    // Inverte Y porque o SVG cresce de cima para baixo
    const y = height - padding - ((p.km - minKm) / rangeKm) * (height - padding * 2);
    return { x, y, label: `${p.km.toLocaleString("pt-BR")} km (${p.data})` };
  });

  const polylinePath = svgPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{ marginTop: 24, padding: "20px 24px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>
        Gráfico de Evolução do Odômetro
      </div>
      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ display: "block" }}>
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {/* Line path */}
          <polyline
            fill="none"
            stroke={COR_ACCENT}
            strokeWidth="2"
            points={polylinePath}
          />

          {/* Dots and Tooltips */}
          {svgPoints.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#0A1628"
                stroke={COR_ACCENT}
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y - 8}
                textAnchor="middle"
                fill="#8a94a3"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7 }}
              >
                {pointsSorted[idx].km.toLocaleString("pt-BR")}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#3a4a5a" }}>
        <span>INÍCIO ({pointsSorted[0].data})</span>
        <span>ATUAL ({pointsSorted[pointsSorted.length - 1].data})</span>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function BuscaSncAutoScorePanel() {
  const [placa, setPlaca]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState<string | null>(null);
  const [resultado, setResultado] = useState<AutoScoreResult | null>(null);
  const [activeTab, setActiveTab] = useState<"ficha" | "restricoes" | "financeiro" | "fipe-km" | "renainf" | "leilao" | "documentos">("ficha");
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const { historico, salvar, limpar } = useHistoricoConsultas("snc-autoscore");

  // Sub-consultas sob demanda em estado local
  const [loadingGravame, setLoadingGravame] = useState(false);
  const [gravameData, setGravameData]       = useState<GravameOnDemand | null>(null);
  
  const [loadingRenajud, setLoadingRenajud] = useState(false);
  const [renajudData, setRenajudData]       = useState<RenajudOnDemand | null>(null);

  const [loadingEstadual, setLoadingEstadual] = useState(false);
  const [estadualData, setEstadualData]       = useState<EstadualOnDemand | null>(null);

  // CRLV-e — agora vem automático do backend (não precisa mais de estado manual)

  const handleBuscar = useCallback(async (placaAlvo?: string) => {
    const placaClean = (placaAlvo || placa).replace(/[^A-Z0-9]/g, "");
    if (placaClean.length < 7) {
      setErro("Placa inválida. Use o formato ABC-1234 ou ABC-1D23.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);

    // Resetar estados on-demand antes de nova consulta
    setGravameData(null);
    setRenajudData(null);
    setEstadualData(null);


    try {
      const res = await fetch(`/api/apibrasil/snc-autoscore?placa=${placaClean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao realizar consulta.");
      setResultado(data as AutoScoreResult);
      salvar(placaClean, data as Record<string, unknown>);
      if (data.gravame)         setGravameData(data.gravame);
      if (data.renajudDetalhes) setRenajudData(data.renajudDetalhes);
      if (data.estadual)        setEstadualData(data.estadual);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa, salvar]);

  const handleExemplo = useCallback(async (cenario: "clean" | "restricted") => {
    const isClean = cenario === "clean";
    const placaSimulada = isClean ? "SNC-2026" : "SNC-1990";
    setPlaca(placaSimulada);
    setLoading(true);
    setErro(null);
    setResultado(null);

    // Simula tempo de resposta local
    setTimeout(async () => {
      try {
        const clean = placaSimulada.replace(/[^A-Z0-9]/g, "");
        const res = await fetch(`/api/apibrasil/snc-autoscore?placa=${clean}`);
        const data = await res.json();
        setResultado(data as AutoScoreResult);
        salvar(clean, data as Record<string, unknown>);
        if (data.gravame)         setGravameData(data.gravame);
        if (data.renajudDetalhes) setRenajudData(data.renajudDetalhes);
        if (data.estadual)        setEstadualData(data.estadual);
      } catch (e) {
        setErro("Falha ao simular exemplo.");
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [salvar]);

  // Re-consultas de datasets específicos com falha (Graceful Degradation)
  const handleReconsultar = async (dataset: "leilao" | "debitos" | "km") => {
    if (!resultado || !resultado.identificacao?.placa) return;
    const placaClean = resultado.identificacao.placa;
    
    // Endpoint específico
    const endpointMap = {
      leilao: "/api/apibrasil/leilao-score",
      debitos: "/api/apibrasil/debitos",
      km: "/api/apibrasil/historico-km"
    };

    try {
      setLoading(true);
      const res = await fetch(`${endpointMap[dataset]}?placa=${placaClean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erro ao reconsultar ${dataset}`);

      // Atualiza resultado preservando o restante
      setResultado(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: { ...prev.status, [dataset]: "success" },
          leilao: dataset === "leilao" ? (data.leilao || data.data) : prev.leilao,
          debitos: dataset === "debitos" ? (data.debitos || data.data?.debitos) : prev.debitos,
          historicoKm: dataset === "km" ? (data.historicoKm || data.data) : prev.historicoKm
        };
      });
    } catch (e: any) {
      alert(`Reconsulta falhou: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funções de Consulta On-Demand (Tab 2)
  const consultarGravame = async () => {
    if (!resultado?.identificacao?.placa) return;
    setLoadingGravame(true);
    try {
      const res = await fetch(`/api/apibrasil/gravame?placa=${resultado.identificacao.placa}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao consultar gravame.");
      setGravameData(data.gravame || null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingGravame(false);
    }
  };

  const consultarRenajud = async () => {
    if (!resultado?.identificacao?.placa) return;
    setLoadingRenajud(true);
    try {
      const res = await fetch(`/api/apibrasil/renajud?placa=${resultado.identificacao.placa}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao consultar RENAJUD.");
      setRenajudData(data.renajud || data.data?.renajud || null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingRenajud(false);
    }
  };

  const consultarEstadual = async () => {
    if (!resultado?.identificacao?.placa) return;
    setLoadingEstadual(true);
    try {
      const res = await fetch(`/api/apibrasil/estadual?placa=${resultado.identificacao.placa}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao consultar base estadual.");
      setEstadualData(data.estadual || data.data?.estadual || null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingEstadual(false);
    }
  };

  // CRLV-e já vem do backend automaticamente — acessar via r.crlve

  const r = resultado;

  return (
    <div>
      {/* ── BARRA DE BUSCA ── */}
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
              color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase",
              pointerEvents: "none",
            }}>
              PLACA
            </div>
            <input
              id="autoscore-placa-input"
              type="text"
              autoComplete="off"
              value={placa}
              onChange={(e) => {
                setPlaca(formatarPlacaInput(e.target.value));
                setErro(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              placeholder="ABC-1234"
              maxLength={8}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.15)", color: "#fff",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 28,
                letterSpacing: "0.14em", padding: "18px 18px 18px 82px",
                outline: "none", textTransform: "uppercase", transition: "border-color 0.15s",
                WebkitBoxShadow: "0 0 0 1000px rgba(14,28,48,1) inset",
              }}
              onFocus={(e) => (e.target.style.borderColor = COR_ACCENT)}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>
          <button
            id="autoscore-consultar-btn"
            onClick={() => handleBuscar()}
            disabled={loading}
            style={{
              padding: "18px 36px", background: loading ? "rgba(212,168,67,0.4)" : COR_ACCENT,
              color: "#0A1628", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
              letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s", whiteSpace: "nowrap",
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
        <p style={{ marginTop: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Formatos aceitos: ABC-1234 (Cinza/Mercosul) · SNC AutoScore 100% Integrado
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
              Exemplo de Relatório (Com Restrições)
            </button>
          </div>
        </div>
      </div>

      {/* ── RESULTADO ── */}
      {r && (
        <div id="autoscore-resultado" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          
          {/* Cabeçalho do Resultado */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${COR_ACCENT}`,
            padding: "20px 28px", marginBottom: 12
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, letterSpacing: "0.14em", fontWeight: 700, textTransform: "uppercase" }}>
                SNC AUTOSCORE · RELATÓRIO EXCLUSIVO · {r.identificacao?.placa}
              </span>
              <span style={{ fontSize: 24, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.identificacao?.marcaModelo
                  ? String(r.identificacao.marcaModelo).toUpperCase().replace('/', ' - ')
                  : placa.toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => {
                const { url } = gerarUrlRelatorio("snc-autoscore", r.identificacao?.placa ?? "", "PLACA", r as unknown as Record<string, unknown>);
                window.open(url, "_blank");
              }}
              style={{
                padding: "12px 24px", background: COR_ACCENT, color: "#0a1628",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase",
                fontWeight: 700, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "background 0.2s", whiteSpace: "nowrap",
                marginLeft: 20, flexShrink: 0
              }}
            >
              Visualizar Relatório Autenticado
            </button>
          </div>

          {/* Menu de Abas */}
          <div className="guias-container" style={{
            display: "flex",
            gap: 2,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: 2,
            marginBottom: 8,
            flexWrap: "wrap"
          }}>
            {[
              { id: "ficha", label: "Ficha & Proprietário" },
              { id: "restricoes", label: "Restrições" },
              { id: "financeiro", label: "Financeiro DETRAN" },
              { id: "fipe-km", label: "FIPE & Hodômetro" },
              { id: "renainf", label: `Infrações (${r.renainf.total})` },
              { id: "leilao", label: `Leilão & Score (${r.leilao?.totalLeiloes ?? 0})` },
              { id: "documentos", label: "CRLV-e & Recall" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1, minWidth: 120, padding: "12px 8px",
                  background: activeTab === tab.id ? COR_ACCENT_DIM : "transparent",
                  color: activeTab === tab.id ? COR_ACCENT : "#8a94a3",
                  border: "none", cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  transition: "all 0.2s",
                  borderBottom: `2px solid ${activeTab === tab.id ? COR_ACCENT : "transparent"}`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── CONTEÚDO DAS ABAS ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* ── ABA 1: FICHA & PROPRIETÁRIO ── */}
            {activeTab === "ficha" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="snc-grid-1">
                  <Bloco titulo="Ficha cadastral primária (BIN)">
                    {r.identificacao ? (
                      <>
                        <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 20, color: "#fff", marginBottom: 12 }}>
                          {r.identificacao.marcaModelo ?? "—"}
                        </h3>
                        <DataRow label="Placa"          value={r.identificacao.placa ?? "—"} isMono />
                        <DataRow label="Ano Fabricação" value={r.identificacao.anoFabricacao ?? "—"} />
                        <DataRow label="Ano Modelo"     value={r.identificacao.anoModelo ?? "—"} />
                        <DataRow label="Categoria"      value={r.identificacao.categoria ?? "—"} />
                        <DataRow label="Combustível"    value={r.identificacao.combustivel ?? "—"} />
                        <DataRow label="Município / UF" value={`${r.identificacao.municipio ?? "—"} / ${r.identificacao.uf ?? "—"}`} />
                        {r.identificacao.statusDescricao && (
                          <div style={{ marginTop: 14, padding: "8px 12px", background: "rgba(212,168,67,0.07)", border: `1px solid rgba(212,168,67,0.2)`, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT }}>
                            ✓ STATUS BIN: {r.identificacao.statusDescricao}
                          </div>
                        )}
                      </>
                    ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Ficha cadastral não disponível.</p>}
                  </Bloco>

                  <Bloco titulo="Proprietário Atual do Veículo">
                    {r.proprietario ? (
                      <>
                        <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 20, color: "#fff", marginBottom: 12 }}>
                          {r.proprietario.nome ?? "—"}
                        </h3>
                        <DataRow label="Documento"       value={r.proprietario.documento ?? "—"} isMono />
                        <DataRow label="RENAVAM"         value={r.proprietario.renavam ?? "—"} isMono />
                        <DataRow label="CRLV Oficial"    value={r.proprietario.crlv ?? "—"} isMono />
                        <DataRow label="Última Atualiz"  value={r.proprietario.dataAtualizacao ?? "—"} />
                        <DataRow label="Status"          value={r.proprietario.statusDescricao ?? "REGULAR"} />
                      </>
                    ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Dados do proprietário atual indisponíveis.</p>}
                  </Bloco>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }} className="snc-grid-1">
                  <Bloco titulo="Dados Técnicos e Identificadores">
                    {r.dadosTecnicos ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="snc-grid-1">
                        <div>
                          <DataRow label="Chassi Estrutural" value={r.dadosTecnicos.chassi ?? "—"} isMono />
                          <DataRow label="Número do Motor"   value={r.dadosTecnicos.motor ?? "—"} isMono />
                          <DataRow label="Cor Cadastrada"    value={r.dadosTecnicos.cor ?? "—"} />
                          <DataRow label="Carroceria"        value={r.dadosTecnicos.carroceria ?? "—"} />
                          <DataRow label="Cap. Passageiros"  value={r.dadosTecnicos.capacidadePassageiros ?? "—"} />
                        </div>
                        <div>
                          <DataRow label="Potência"       value={r.dadosTecnicos.potencia ?? "—"} />
                          <DataRow label="Cilindrada"     value={r.dadosTecnicos.cilindrada ?? "—"} />
                          <DataRow label="Procedência"    value={r.dadosTecnicos.procedencia ?? "—"} />
                          <DataRow label="Espécie Veículo" value={r.dadosTecnicos.especie ?? "—"} />
                          <DataRow label="Tipo Veículo"    value={r.dadosTecnicos.tipo ?? "—"} />
                        </div>
                      </div>
                    ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Ficha técnica não disponível.</p>}
                  </Bloco>

                  <Bloco titulo="Alerta Roubo e Furto (Nacional)">
                    {r.rouboFurto ? (
                      <>
                        <IndicadorBool label="Declaração Ativa" valor={r.rouboFurto.declaracao} />
                        <IndicadorBool label="Histórico de Devolução" valor={r.rouboFurto.devolucao} alerta={r.rouboFurto.declaracao} />
                        <IndicadorBool label="Recuperação Policial" valor={r.rouboFurto.recuperacao} alerta={r.rouboFurto.declaracao} />
                      </>
                    ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Ocorrências não identificadas.</p>}
                  </Bloco>
                </div>

                {/* ── Histórico de Proprietários Anteriores (Agregados Propria) ── */}
                {(() => {
                  const mascararNome = (nome: string): string => {
                    const partes = String(nome ?? "").trim().split(/\s+/);
                    if (partes.length <= 1) return nome;
                    return [
                      partes[0],
                      ...partes.slice(1).map((p) => p.charAt(0) + "*".repeat(Math.max(p.length - 1, 2))),
                    ].join(" ");
                  };
                  const lista: any[] = Array.isArray((r as any).historicoProprietarios)
                    ? (r as any).historicoProprietarios
                    : [];
                  return (
                    <Bloco
                      titulo="Histórico de Proprietários Anteriores"
                      badge={lista.length > 0 ? `${lista.length} registro${lista.length !== 1 ? "s" : ""}` : undefined}
                    >
                      {lista.length === 0 ? (
                        <p style={{ color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                          ✓ Nenhum proprietário anterior identificado na base federal.
                        </p>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                            <thead>
                              <tr style={{ borderBottom: `1px solid ${COR_ACCENT_DIM}` }}>
                                {["#", "Nome / Razão Social", "Documento", "Município / UF", "Data Atualiz."].map((h) => (
                                  <th key={h} style={{
                                    textAlign: "left", padding: "6px 12px",
                                    fontSize: 9, color: COR_ACCENT, letterSpacing: "0.1em",
                                    textTransform: "uppercase", fontWeight: 700,
                                  }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {lista.map((p: any, i: number) => (
                                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                  <td style={{ padding: "8px 12px", color: "#5a6a7a", fontSize: 10 }}>{i + 1}</td>
                                  <td style={{ padding: "8px 12px", color: "#fff", fontWeight: 600 }}>{mascararNome(p.nome ?? "—")}</td>
                                  <td style={{ padding: "8px 12px", color: "#a0aec0", letterSpacing: "0.05em" }}>{p.documento ?? "—"}</td>
                                  <td style={{ padding: "8px 12px", color: "#a0aec0" }}>{p.municipio ?? "—"}{p.uf ? ` / ${p.uf}` : ""}</td>
                                  <td style={{ padding: "8px 12px", color: "#a0aec0" }}>{p.dataAtualizacao ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Bloco>
                  );
                })()}
              </>
            )}

            {/* ── ABA 2: RESTRIÇÕES (COM BOTÕES ON-DEMAND) ── */}
            {activeTab === "restricoes" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="snc-grid-1">
                  
                  {/* Restrições Gerais BIN / CSV (Vem no Combo base) */}
                  <Bloco titulo="Restrições Cadastrais BIN/CSV (Geral)">
                    {r.restricoesBin ? (
                      <>
                        <IndicadorBool label="Existe Restrição Geral" valor={r.restricoesBin.existeRestricaoGeral} />
                        <IndicadorBool label="Existe Restrição RENAJUD" valor={r.restricoesBin.renajud} />
                        <IndicadorBool label="Ocorrência Roubo/Furto" valor={r.restricoesBin.rouboFurto} />
                        <IndicadorBool label="Veículo Baixado" valor={r.restricoesBin.veiculoBaixado} />
                        <IndicadorBool label="Indício / Alerta Sinistro" valor={r.restricoesBin.alertaSinistro} />
                        {r.restricoesBin.mensagens.length > 0 ? (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>Mensagens/Observações:</div>
                            {r.restricoesBin.mensagens.map((msg, i) => (
                              <div key={i} style={{ padding: "4px 8px", background: "rgba(239,68,68,0.06)", borderLeft: "2px solid #ef4444", fontSize: 10, color: "#e2e8f0", marginBottom: 4 }}>
                                {msg}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ marginTop: 12, fontSize: 10, color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace" }}>
                            ✓ Nenhuma mensagem restritiva identificada na base federal.
                          </div>
                        )}
                      </>
                    ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Dados BIN de restrições indisponíveis.</p>}
                  </Bloco>

                  {/* Restrições de Gravame (On-Demand) */}
                  <Bloco titulo="Gravames e Financiamentos (B3)" badge="Sob Demanda">
                    {!gravameData ? (
                      <div style={{ display: "flex", flexDirection: "column", justifyItems: "center", alignItems: "center", padding: "24px 0" }}>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", textAlign: "center", marginBottom: 16 }}>
                          Gravames financeiros não inclusos no combo básico. Deseja realizar a busca avançada na B3?
                        </p>
                        <button
                          onClick={consultarGravame}
                          disabled={loadingGravame}
                          style={{
                            background: COR_ACCENT, color: "#0A1628", border: "none",
                            padding: "10px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                            fontWeight: 700, cursor: loadingGravame ? "not-allowed" : "pointer"
                          }}
                        >
                          {loadingGravame ? "Consultando B3..." : "Consultar Gravame"}
                        </button>
                      </div>
                    ) : (
                      <>
                        <IndicadorBool label="Financiamento Ativo" valor={gravameData.financiamento === "SIM" || gravameData.situacao === "ATIVO"} />
                        <DataRow label="Agente Financeiro" value={gravameData.agente_financeiro} />
                        <DataRow label="Nº Contrato B3"   value={gravameData.contrato_numero} isMono />
                        <DataRow label="Data Inclusão"    value={gravameData.data_inclusao} />
                        <DataRow label="Situação Gravame"  value={gravameData.situacao} />
                        <button 
                          onClick={() => setGravameData(null)}
                          style={{ background: "transparent", color: "#5a6a7a", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, marginTop: 12 }}
                        >
                          ✕ Limpar Busca
                        </button>
                      </>
                    )}
                  </Bloco>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="snc-grid-1">
                  {/* Restrições Estaduais Detran (On-Demand) */}
                  <Bloco titulo="Restrições Estaduais DETRAN" badge="Sob Demanda">
                    {!estadualData ? (
                      <div style={{ display: "flex", flexDirection: "column", justifyItems: "center", alignItems: "center", padding: "24px 0" }}>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", textAlign: "center", marginBottom: 16 }}>
                          Necessita de consulta profunda na base estadual de registro do veículo?
                        </p>
                        <button
                          onClick={consultarEstadual}
                          disabled={loadingEstadual}
                          style={{
                            background: COR_ACCENT, color: "#0A1628", border: "none",
                            padding: "10px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                            fontWeight: 700, cursor: loadingEstadual ? "not-allowed" : "pointer"
                          }}
                        >
                          {loadingEstadual ? "Buscando DETRAN..." : "Consultar Base Estadual"}
                        </button>
                      </div>
                    ) : (
                      <>
                        <DataRow label="Total Débitos Locais" value={formatarBRL(estadualData.totalDebitos ?? 0)} />
                        {estadualData.restricoes && estadualData.restricoes.length > 0 ? (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", marginBottom: 6 }}>RESTRIÇÕES DETECTADAS:</div>
                            {estadualData.restricoes.map((r: any, idx: number) => (
                              <div key={idx} style={{ padding: "4px 8px", background: "rgba(212,168,67,0.05)", borderLeft: `2px solid ${COR_ACCENT}`, fontSize: 10, marginBottom: 4 }}>
                                <strong>{r.tipo || "RESTRIÇÃO"}:</strong> {r.descricao || "Sem detalhes"}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ marginTop: 12, fontSize: 10, color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace" }}>
                            ✓ Nenhuma restrição local encontrada na base deste DETRAN.
                          </div>
                        )}
                        <button 
                          onClick={() => setEstadualData(null)}
                          style={{ background: "transparent", color: "#5a6a7a", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, marginTop: 12 }}
                        >
                          ✕ Limpar Busca
                        </button>
                      </>
                    )}
                  </Bloco>

                  {/* Detalhes de Processo RENAJUD (On-Demand) */}
                  <Bloco titulo="RENAJUD Detalhado (Processos Judiciais)" badge="Sob Demanda">
                    {!renajudData ? (
                      <div style={{ display: "flex", flexDirection: "column", justifyItems: "center", alignItems: "center", padding: "24px 0" }}>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", textAlign: "center", marginBottom: 16 }}>
                          Identifica processos ativos, tribunais de origem e órgãos expedidores do bloqueio judicial.
                        </p>
                        <button
                          onClick={consultarRenajud}
                          disabled={loadingRenajud}
                          style={{
                            background: COR_ACCENT, color: "#0A1628", border: "none",
                            padding: "10px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                            fontWeight: 700, cursor: loadingRenajud ? "not-allowed" : "pointer"
                          }}
                        >
                          {loadingRenajud ? "Consultando CNJ..." : "Consultar Detalhes Judiciais"}
                        </button>
                      </div>
                    ) : (
                      <>
                        <DataRow label="Ocorrências" value={renajudData.quantidade_ocorrencias || "0"} />
                        {renajudData.processo ? (
                          <>
                            <DataRow label="Número Processo" value={renajudData.processo} isMono />
                            <DataRow label="Órgão Emissor"  value={renajudData.orgao_judicial} />
                            <DataRow label="Tribunal Origin" value={renajudData.tribunal} />
                            {renajudData.restricoes && renajudData.restricoes.map((res: string, i: number) => (
                              <div key={i} style={{ padding: "4px 8px", background: "rgba(239,68,68,0.06)", borderLeft: "2px solid #ef4444", fontSize: 10, marginTop: 6 }}>
                                {res}
                              </div>
                            ))}
                          </>
                        ) : (
                          <div style={{ fontSize: 10, color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace", marginTop: 12 }}>
                            ✓ Sem restrições de penhora, transferência ou circulação registradas.
                          </div>
                        )}
                        <button 
                          onClick={() => setRenajudData(null)}
                          style={{ background: "transparent", color: "#5a6a7a", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, marginTop: 12 }}
                        >
                          ✕ Limpar Busca
                        </button>
                      </>
                    )}
                  </Bloco>
                </div>
              </>
            )}

            {/* ── ABA 3: FINANCEIRO DETRAN ── */}
            {activeTab === "financeiro" && (
              <>
                {r.status.debitos === "failed" ? (
                  <BannerAviso base="debitos" onReconsultar={() => handleReconsultar("debitos")} />
                ) : r.debitos ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8 }} className="snc-grid-5">
                      {[
                        { val: r.debitos.totalMultas, l: "Multas DETRAN" },
                        { val: r.debitos.totalIpva, l: "IPVA Acumulado" },
                        { val: r.debitos.totalLicenciamento, l: "Licenciamento" },
                        { val: r.debitos.totalDpvat, l: "Seguro DPVAT" },
                        { val: r.debitos.totalGeral, l: "Débito Total" }
                      ].map((item, idx) => (
                        <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "16px 20px" }}>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, color: idx === 4 ? COR_ACCENT : "#fff", fontWeight: 700 }}>
                            {item.val}
                          </div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
                            {item.l}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="snc-grid-1">
                      <Bloco titulo="Multas do DETRAN registradas">
                        {r.debitos.multas.length > 0 ? (
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  {["Descrição", "Vencimento", "Órgão", "Valor"].map((h) => (
                                    <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", textTransform: "uppercase", textAlign: "left", padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {r.debitos.multas.map((m, idx) => (
                                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#cfd6df", padding: "8px" }}>{m.descricao}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "8px" }}>{m.dataVencimento}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "8px" }}>{m.orgaoEmissor}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#ef4444", fontWeight: 700, padding: "8px" }}>{m.valor}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : <p style={{ color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>✓ Nenhuma multa local em aberto neste DETRAN.</p>}
                      </Bloco>

                      <Bloco titulo="IPVA em aberto por Exercício">
                        {r.debitos.ipva.length > 0 ? (
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  {["Exercicio", "Parcela", "Vencimento", "Situação", "Valor"].map((h) => (
                                    <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", textTransform: "uppercase", textAlign: "left", padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {r.debitos.ipva.map((i, idx) => (
                                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#cfd6df", padding: "8px" }}>{i.exercicio}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "8px" }}>{i.parcela}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "8px" }}>{i.dataVencimento}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: COR_ACCENT, padding: "8px" }}>{i.situacao}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#ef4444", fontWeight: 700, padding: "8px" }}>{i.valor}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : <p style={{ color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>✓ IPVA integralmente liquidado em todos os anos.</p>}
                      </Bloco>
                    </div>
                  </>
                ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Dados de débitos indisponíveis.</p>}
              </>
            )}

            {/* ── ABA 4: FIPE & HISTÓRICO KM ── */}
            {activeTab === "fipe-km" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="snc-grid-1">
                  
                  {/* FIPE */}
                  <Bloco titulo="Precificador Oficial Tabela FIPE">
                    {r.precificador && r.precificador.length > 0 ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr>
                              {["Código FIPE", "Modelo Cadastrado", "Ano Mod", "Preço"].map((h) => (
                                <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", textTransform: "uppercase", textAlign: "left", padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {r.precificador.map((item, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#cfd6df", padding: "8px" }}>{item.codigo}</td>
                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#cfd6df", padding: "8px" }}>{item.fabricanteModelo}</td>
                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "8px" }}>{item.anoModelo}</td>
                                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COR_ACCENT, fontWeight: 700, padding: "8px" }}>{item.preco}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Nenhuma cotação de mercado na base FIPE.</p>}
                  </Bloco>

                  {/* KM */}
                  <Bloco titulo="Histórico de Registro de Quilometragem">
                    {r.status.km === "failed" ? (
                      <BannerAviso base="km" onReconsultar={() => handleReconsultar("km")} />
                    ) : r.historicoKm ? (
                      <>
                        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                          <IndicadorBool label="Divergência de Hodômetro" valor={r.historicoKm.anomalia} />
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: "#5a6a7a", textTransform: "uppercase" }}>Registros:</span>
                            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#fff", fontWeight: 700 }}>{r.historicoKm.totalRegistros}</span>
                          </div>
                        </div>

                        {r.historicoKm.registros.length > 0 ? (
                          <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr>
                                  {["Data Registro", "KM Indicada", "Fonte Informadora", "UF"].map((h) => (
                                    <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", textTransform: "uppercase", textAlign: "left", padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {r.historicoKm.registros.map((reg, idx) => (
                                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#cfd6df", padding: "8px" }}>{reg.data}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COR_ACCENT, fontWeight: 700, padding: "8px" }}>{reg.km.toLocaleString("pt-BR")} km</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "8px" }}>{reg.fonte}</td>
                                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "8px" }}>{reg.estado}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Nenhum registro cronológico de hodômetro.</p>}
                      </>
                    ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Dados de quilometragem indisponíveis.</p>}
                  </Bloco>
                </div>

                {r.historicoKm && r.historicoKm.registros.length >= 2 && (
                  <GraficoKMEvolucao registros={r.historicoKm.registros} />
                )}
              </>
            )}

            {/* ── ABA 5: INFRAÇÕES RENAINF (BUG CORRIGIDO) ── */}
            {activeTab === "renainf" && (
              <Bloco titulo={`Registro Nacional de Infrações de Trânsito — RENAINF (${r.renainf?.total || 0})`}>
                {r.renainf && r.renainf.ocorrencias.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          {["Código AIT", "Data/Hora", "Código", "Descrição da Infração", "Órgão Autuador", "Local", "Valor", "Status"].map((h) => (
                            <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", textTransform: "uppercase", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {r.renainf.ocorrencias.map((inf, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#cfd6df", padding: "10px 12px" }}>{inf.auto}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "10px 12px" }}>{inf.dataHora}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#cfd6df", padding: "10px 12px" }}>{inf.codigo}</td>
                            <td style={{ fontFamily: "inherit", fontSize: 11, color: "#cfd6df", padding: "10px 12px", maxWidth: 280, whiteSpace: "normal" }}>{inf.descricao}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "10px 12px" }}>{inf.orgao}</td>
                            <td style={{ fontFamily: "inherit", fontSize: 10, color: "#8a94a3", padding: "10px 12px", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{inf.local || "—"}</td>
                            <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#ef4444", fontWeight: 700, padding: "10px 12px" }}>{inf.valor}</td>
                            <td style={{ padding: "10px 12px" }}>
                              <span style={{ 
                                fontSize: 8, fontFamily: "'JetBrains Mono', monospace",
                                background: inf.situacao === "PAGO" ? "rgba(43,168,74,0.12)" : "rgba(239,68,68,0.12)",
                                color: inf.situacao === "PAGO" ? "#2BA84A" : "#ef4444",
                                border: `1px solid ${inf.situacao === "PAGO" ? "rgba(43,168,74,0.3)" : "rgba(239,68,68,0.3)"}`,
                                padding: "2px 6px",
                                textTransform: "uppercase"
                              }}>
                                {inf.situacao || "EM ABERTO"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p style={{ color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>✓ Nenhuma multa federal cadastrada no sistema RENAINF.</p>}
              </Bloco>
            )}

            {/* ── ABA 6: LEILÃO & SINISTRO (NATIVO A-E) ── */}
            {activeTab === "leilao" && (
              <>
                {r.status.leilao === "failed" ? (
                  <BannerAviso base="leilao" onReconsultar={() => handleReconsultar("leilao")} />
                ) : r.leilao ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }} className="snc-grid-1">
                      
                      {/* Score Leilão */}
                      <Bloco titulo="Análise de Risco e Score de Leilão">
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
                          <div style={{
                            fontSize: 48, fontFamily: "'Libre Caslon Text', serif",
                            color: r.leilao.score && r.leilao.score < 50 ? "#ef4444" : r.leilao.score && r.leilao.score < 75 ? COR_ACCENT : "#2BA84A",
                            fontWeight: 700
                          }}>
                            {r.leilao.score || "—"}
                          </div>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                            color: r.leilao.score && r.leilao.score < 50 ? "#ef4444" : r.leilao.score && r.leilao.score < 75 ? COR_ACCENT : "#2BA84A",
                            fontWeight: 700, letterSpacing: "0.14em", marginTop: 4, textTransform: "uppercase"
                          }}>
                            {r.leilao.scoreLabel}
                          </span>
                        </div>
                        <IndicadorBool label="Indício Ocorrência" valor={r.leilao.indicio} />
                        <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", fontSize: 10, color: "#8a94a3", lineHeight: 1.4, marginBottom: 12 }}>
                          O score é calculado em base estatística própria variando entre A (excelência) a E (risco extremo).
                        </div>
                        {r.leilao.aceitacao && <DataRow label="Aceitação Comercial" value={`${r.leilao.aceitacao}%`} />}
                        {r.leilao.percentualSobreFipe && <DataRow label="% s/ Tabela FIPE" value={`${r.leilao.percentualSobreFipe}%`} />}
                        {r.leilao.exigeVistoriaEspecial && <DataRow label="Exige Vistoria" value={r.leilao.exigeVistoriaEspecial} />}
                      </Bloco>

                      {/* Checklist de Avarias */}
                      <Bloco titulo="Checklist Geral de Avarias Avaliadas">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="snc-grid-1">
                          <div>
                            <DataRow label="Avaria Frontal" value={r.leilao.checklist.frente} />
                            <DataRow label="Avaria Traseira" value={r.leilao.checklist.traseira} />
                            <DataRow label="Avarias Laterais" value={r.leilao.checklist.laterais || r.leilao.checklist.lateralDireita || r.leilao.checklist.lateralEsquerda} />
                            <DataRow label="Avaria no Teto"   value={r.leilao.checklist.teto} />
                            <DataRow label="Avaria Interna"  value={r.leilao.checklist.interior} />
                          </div>
                          <div>
                            <DataRow label="Airbags / Painel" value={r.leilao.checklist.airbags} />
                            <DataRow label="Rodas / Pneus"    value={r.leilao.checklist.rodas || r.leilao.checklist.rodasFaltantes} />
                            <DataRow label="Local Queimado"  value={r.leilao.checklist.localQueimado} />
                            <DataRow label="Rodas Faltantes"  value={r.leilao.checklist.rodasFaltantes} />
                            <DataRow label="Observações"     value={r.leilao.checklist.observacoes} />
                          </div>
                        </div>
                      </Bloco>
                    </div>

                    {r.leilao.dadosVeiculo && (
                      <Bloco titulo="Características Físicas e Câmbio Detectadas no Leilão">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }} className="snc-grid-1">
                          <DataRow label="Câmbio Registrado" value={r.leilao.dadosVeiculo.cambio} />
                          <DataRow label="Quantidade Eixos"  value={r.leilao.dadosVeiculo.qtdEixos} />
                          <DataRow label="Eixo Traseiro"      value={r.leilao.dadosVeiculo.eixoTraseiro} />
                          <DataRow label="KM no Leilão"       value={r.leilao.dadosVeiculo.kilometragem ? `${Number(r.leilao.dadosVeiculo.kilometragem).toLocaleString("pt-BR")} km` : null} />
                        </div>
                      </Bloco>
                    )}

                    {/* Histórico Ocorrências de Leilão */}
                    <Bloco titulo={`Histórico de Ocorrência em Leilão (${r.leilao.totalLeiloes})`}>
                      {r.leilao.historico.length > 0 ? (
                        r.leilao.historico.map((h, idx) => (
                          <div key={idx} style={{
                            padding: "20px 24px", background: "rgba(255,255,255,0.01)",
                            border: "1px solid rgba(255,255,255,0.04)", marginBottom: 12
                          }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }} className="snc-grid-1">
                              <div>
                                <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COR_ACCENT, marginBottom: 12 }}>
                                  LEILÃO DETECTADO EM: {h.data}
                                </h4>
                                <DataRow label="Leiloeiro Oficial" value={h.leiloeiro} />
                                <DataRow label="Lote Identificação" value={h.lote} isMono />
                                <DataRow label="Comitente Vendedor" value={h.comitente} />
                                <DataRow label="Pátio Depósito"    value={h.patio} />
                                <DataRow label="Valor Arremate"    value={h.valorArremate} isMono />
                                <DataRow label="Condição Geral"    value={h.condicaoGeral} />
                                <DataRow label="Estado Chassi"     value={h.situacaoChassi} />
                                <DataRow label="Condição Motor"    value={h.condicaoMotor} />
                                <DataRow label="Condição Mecânica" value={h.condicaoMecanica} />
                                <DataRow label="Condição Câmbio"   value={h.condicaoCambio} />
                              </div>
                              {/* Imagens do Leilão */}
                              <div>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", marginBottom: 8, textTransform: "uppercase" }}>Fotos do Lote:</div>
                                {h.imagens && h.imagens.length > 0 ? (
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                                    {h.imagens.map((img: string, i: number) => (
                                      <div key={i} style={{ border: "1px solid rgba(255,255,255,0.1)", background: "#000", height: 80, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <img src={img} alt={`Lote ${h.lote} - ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{ height: 80, border: "1px dashed rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#3a4a5a", fontFamily: "'JetBrains Mono', monospace" }}>
                                    Sem fotos registradas
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : <p style={{ color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>✓ Nenhuma passagem detectada em leiloeiros conveniados.</p>}
                    </Bloco>

                    {/* Sinistros */}
                    <Bloco titulo="Histórico de Sinistros e Danos Corporativos">
                      {r.leilao.sinistro && r.leilao.sinistro.historico.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr>
                                {["Data Ocorrência", "Tipo Sinistro", "Seguradora", "Valor Indenizado", "Situação"].map((h) => (
                                  <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "#5a6a7a", textTransform: "uppercase", textAlign: "left", padding: "6px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {r.leilao.sinistro.historico.map((sin, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#cfd6df", padding: "8px" }}>{sin.data}</td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#cfd6df", padding: "8px" }}>{sin.tipo}</td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", padding: "8px" }}>{sin.seguradora}</td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#ef4444", fontWeight: 700, padding: "8px" }}>{formatarBRL(sin.valor)}</td>
                                  <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#ef4444", padding: "8px" }}>{sin.situacao}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : <p style={{ color: "#2BA84A", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>✓ Nenhum registro de colisão grave ou indenização integral.</p>}
                    </Bloco>
                  </>
                ) : <p style={{ color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>Dados de leilão indisponíveis.</p>}
              </>
            )}

            {/* ── ABA 7: DOCUMENTOS & RECALL ── */}
            {activeTab === "documentos" && (
              <>
                {/* ── CARD 1: CRLV-e Digital Oficial ── */}
                <div style={{
                  border: `1px solid ${r.crlve ? 'rgba(43,168,74,0.35)' : 'rgba(212,168,67,0.25)'}`,
                  background: r.crlve ? 'rgba(43,168,74,0.04)' : 'rgba(212,168,67,0.03)',
                  marginBottom: 12,
                  overflow: 'hidden',
                }}>
                  {/* Header do card */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: `1px solid rgba(255,255,255,0.06)`,
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: r.crlve ? 'rgba(43,168,74,0.15)' : 'rgba(212,168,67,0.12)',
                        fontSize: 18,
                      }}>📄</div>
                      <div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12, color: '#fff', letterSpacing: '0.04em' }}>
                          CRLV-e — Certificado de Registro e Licenciamento
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#5a6a7a', marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          SENATRAN / DETRAN Estadual · Emissão automática
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 10px', fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                      background: r.crlve ? 'rgba(43,168,74,0.2)' : 'rgba(239,68,68,0.15)',
                      color: r.crlve ? '#2BA84A' : '#ef4444',
                      border: `1px solid ${r.crlve ? 'rgba(43,168,74,0.4)' : 'rgba(239,68,68,0.3)'}`,
                    }}>
                      {r.crlve ? '✓ Emitido' : '✕ Indisponível'}
                    </span>
                  </div>

                  {/* Corpo do card */}
                  <div style={{ padding: '16px 20px', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    {/* Descrição */}
                    <div style={{ flex: 2, minWidth: 240 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8a94a3', lineHeight: 1.7 }}>
                        Documento <strong style={{ color: '#D4A843' }}>oficial com validade jurídica</strong>, emitido diretamente pelo
                        SENATRAN em conjunto com o DETRAN do estado de origem. Comprova que o veículo está
                        devidamente registrado e licenciado para o exercício vigente.
                      </div>
                      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {['✅ Aceito em cartório', '✅ Exigido em financiamentos', '✅ Válido para transferência', '✅ Assinatura ICP-Brasil'].map(tag => (
                          <span key={tag} style={{
                            fontSize: 9, fontFamily: "'JetBrains Mono', monospace", padding: '3px 8px',
                            background: 'rgba(43,168,74,0.08)', border: '1px solid rgba(43,168,74,0.2)',
                            color: '#2BA84A', letterSpacing: '0.04em',
                          }}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Resultado */}
                    <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {r.crlve ? (
                        <>
                          <DataRow label="Exercício" value={r.crlve.exercicio || r.crlve.veiculo?.anoExercicioLicenciamento || '—'} />
                          <DataRow label="Cód. Segurança" value={r.crlve.codigoSegurancaCla || '—'} isMono />
                          <div style={{ marginTop: 4 }}>
                            {r.crlve.pdfBase64 ? (
                              <CrlveDownloadButton pdfBase64={r.crlve.pdfBase64} placa={r.identificacao?.placa || 'VEICULO'} mimeType="application/pdf" />
                            ) : r.crlve.pdf ? (
                              <a href={r.crlve.pdf} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', background: COR_ACCENT, color: '#0a1628', padding: '10px 16px', textTransform: 'uppercase', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textDecoration: 'none' }}>
                                ↓ Download CRLV-e PDF
                              </a>
                            ) : <p style={{ fontSize: 9, color: '#8a94a3' }}>Sem arquivo anexado.</p>}
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8a94a3', lineHeight: 1.6 }}>
                          CRLV-e não pôde ser emitido automaticamente. Verifique se a UF do veículo está disponível.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Recall de Fabricante ── */}
                <Bloco titulo="Campanhas de Recall do Fabricante">
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: '#5a6a7a', textTransform: 'uppercase' }}>Total pendente:</span>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: r.recall?.total !== '0' ? '#ef4444' : '#2BA84A', fontWeight: 700 }}>
                        {r.recall?.total || '0'}
                      </span>
                    </div>
                  </div>
                  {r.recall && r.recall.ocorrencias.length > 0 ? (
                    r.recall.ocorrencias.map((rec: any, i: number) => (
                      <div key={i} style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.04)', borderLeft: '2px solid #ef4444', marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>{rec.campanha}</div>
                        <div style={{ fontSize: 9, color: '#8a94a3', marginTop: 4 }}>Fabricante: {rec.fabricante}</div>
                        <div style={{ fontSize: 9, color: '#8a94a3', marginTop: 2 }}>Defeito: {rec.defeito}</div>
                        <div style={{ fontSize: 9, color: '#ef4444', fontWeight: 700, marginTop: 4 }}>Situação: {rec.situacao}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#2BA84A', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
                      ✓ Nenhuma campanha de recall pendente para este chassi.
                    </p>
                  )}
                </Bloco>

                {/* ── Tabela de Downloads (por último) ── */}
                <Bloco titulo="Documentos para Download">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${COR_ACCENT_DIM}` }}>
                        <th style={{ textAlign: 'center', padding: '6px 12px', fontSize: 9, color: COR_ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, width: 36 }}>#</th>
                        {['Documento', 'Fonte', 'Natureza', 'Situação', 'Ação'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '6px 12px', fontSize: 9, color: COR_ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* 1 - CRLV-e */}
                      <tr style={{ borderBottom: 'none' }}>
                        <td style={{ padding: '10px 12px', color: '#5a6a7a', fontWeight: 700, fontSize: 13, textAlign: 'center', verticalAlign: 'top', width: 36, fontFamily: "'JetBrains Mono', monospace" }}>1</td>
                        <td style={{ padding: '10px 12px', color: '#fff', fontWeight: 600 }}>
                          CRLV-e Digital Oficial
                          <span style={{ display: 'inline-block', marginLeft: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 8, padding: '1px 5px', border: '1px solid rgba(212,168,67,0.45)', color: '#D4A843', letterSpacing: '0.06em', verticalAlign: 'middle' }}>ICP-BRASIL</span>
                        </td>
                        <td style={{ padding: '10px 12px', color: '#5a6a7a' }}>SENATRAN / DETRAN</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 6px', border: '1px solid rgba(255,255,255,0.2)', color: '#cfd6df', letterSpacing: '0.06em' }}>OFICIAL</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {r.crlve
                            ? <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 6px', border: '1px solid rgba(43,168,74,0.4)', color: '#2BA84A', letterSpacing: '0.06em', display: 'inline-block' }}>EMITIDO</span>
                            : <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, padding: '2px 6px', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', letterSpacing: '0.06em', display: 'inline-block' }}>FALHOU</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {r.crlve ? (
                            r.crlve.pdfBase64
                              ? <CrlveDownloadButton pdfBase64={r.crlve.pdfBase64} placa={r.identificacao?.placa || 'VEICULO'} mimeType="application/pdf" />
                              : r.crlve.pdf
                                ? <a href={r.crlve.pdf} target="_blank" rel="noreferrer" style={{ color: COR_ACCENT, fontWeight: 700, textDecoration: 'none', fontSize: 10 }}>↓ Baixar PDF</a>
                                : <span style={{ color: '#5a6a7a', fontSize: 10 }}>Sem arquivo</span>
                          ) : (
                            <span style={{ color: '#5a6a7a', fontSize: 10 }}>—</span>
                          )}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
                        <td style={{ borderTop: 'none', background: 'rgba(255,255,255,0.01)' }} />
                        <td colSpan={5} style={{ padding: '4px 12px 14px', borderTop: 'none' }}>
                          <div style={{ paddingLeft: 10, borderLeft: '2px solid rgba(255,255,255,0.12)', fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#8a94a3', lineHeight: 1.8, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            Documento oficial com validade jurídica, emitido diretamente pelo SENATRAN em conjunto com o DETRAN do estado de origem. Comprova que o veículo está devidamente registrado e licenciado para o exercício vigente. É aceito em cartório, exigido em financiamentos e transferências de propriedade. Possui assinatura digital no padrão ICP-Brasil.
                          </div>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </Bloco>

              </>
            )}

          </div>

          {/* Footer Informativo */}
          <div style={{
            padding: "16px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 24,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: "#3a4a5a", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            <span>Fontes: B3 · DENATRAN · SENATRAN · CNJ · DETRAN</span>
            <span>·</span>
            <span>Segurança: SSL Autenticado</span>
            <span style={{ marginLeft: "auto" }}>SNC — Sistema Nacional de Conformidade</span>
          </div>
        </div>
      )}

      {/* Botão de Histórico Mobile */}
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
        <HistoricoConsultas
          historico={historico}
          onCarregar={(dados, p) => {
            setPlaca(p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p);
            setResultado(dados as unknown as AutoScoreResult);
            setErro(null);
            setShowHistoryMobile(false);
          }}
          onLimpar={limpar}
          corAccent={COR_ACCENT}
          scrollTargetId="autoscore-resultado"
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 992px) {
          .snc-grid-1 { grid-template-columns: 1fr !important; gap: 12px !important; }
          .snc-grid-5 { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
        }
        
        @media (max-width: 768px) {
          .search-bar-wrapper {
            padding: 20px 16px !important;
          }
          .search-bar-container {
            flex-direction: column;
          }
          #autoscore-placa-input {
            font-size: 22px !important;
            padding: 16px 16px 16px 68px !important;
            letter-spacing: 0.1em !important;
          }
          #autoscore-consultar-btn {
            width: 100% !important;
            justify-content: center !important;
            padding: 16px !important;
          }
          .snc-bloco {
            padding: 20px 18px !important;
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
