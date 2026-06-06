"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";
import { CRLV_MOCK_CLEAN, CRLV_MOCK_RESTRICTED } from "@/lib/mocks";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CrlveResult {
  veiculo?: {
    placa?: string;
    renavam?: string;
    chassi?: string;
    combustivel?: string;
    cor_veiculo?: string;
    crlv?: string;
    data_atualizacao?: string;
    marca_modelo?: string;
    motor?: string;
    municipio?: string;
    uf?: string;
    proprietario_nome?: string;
    proprietario_documento?: string;
  };
  documentos?: {
    crlv?: {
      chave_retorno?: string;
      exercicio?: string;
      existe_ocorrencia?: string;
      observacoes?: string;
      pdf_file?: {
        file_base64?: string;
        mime_type?: string;
      };
    };
  };
  [key: string]: unknown;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const COR_ACCENT     = "#D4A843";
const COR_ACCENT_DIM = "rgba(212,168,67,0.2)";

const UFS = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

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

export default function BuscaCrlvePanel() {
  const [placa, setPlaca]         = useState("");
  const [uf, setUf]               = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<CrlveResult | null>(null);
  const [error, setError]         = useState<string | null>(null);

  const { historico, salvar, limpar } = useHistoricoConsultas("crlve");

  const handlePlacaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaca(formatarPlaca(e.target.value));
    setError(null);
  }, []);

  const handleBuscar = useCallback(async () => {
    const cleanPlaca = placa.replace(/[^A-Z0-9]/g, "");
    if (cleanPlaca.length < 7) {
      setError("Placa inválida. Use o formato ABC-1234 (antigo) ou ABC-1D23 (Mercosul).");
      return;
    }

    if (!uf) {
      setError("Selecione a UF de registro do veículo.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/apibrasil/crlve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placa: cleanPlaca, uf, homolog: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Erro ao emitir o CRLV-e.");

      const veiculo = data.data?.veiculo || {};
      const documentos = data.data?.documentos || {};
      const mapped: CrlveResult = { veiculo, documentos };

      setResult(mapped);
      salvar(cleanPlaca, mapped);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa, uf, salvar]);

  const handleExemplo = useCallback(async (cenario: "clean" | "restricted") => {
    const mockData  = cenario === "clean" ? CRLV_MOCK_CLEAN : CRLV_MOCK_RESTRICTED;
    const placaMock = cenario === "clean" ? "XXX-0000" : "XXX-1111";
    // Popula o card do painel com os dados do mock (mesmo dado que aparece no relatório)
    const mapped: CrlveResult = { veiculo: mockData.data.veiculo, documentos: mockData.data.documentos };
    setPlaca(placaMock);
    setResult(mapped);
    setError(null);
    // Abre o relatório em nova aba
    const { url }   = await gerarUrlRelatorio("crlve", placaMock, "PLACA", mockData.data);
    window.open(url, "_blank");
  }, []);

  const handleGerarRelatorio = useCallback(async () => {
    if (!result) return;
    const doc     = result.veiculo?.placa || placa;
    const { url } = await gerarUrlRelatorio("crlve", doc, "PLACA", result);
    window.open(url, "_blank");
  }, [result, placa]);

  const handleDownloadPDF = useCallback(async () => {
    if (!result?.documentos?.crlv?.pdf_file?.file_base64) return;
    try {
      const base64 = result.documentos.crlv.pdf_file.file_base64;
      const mime = result.documentos.crlv.pdf_file.mime_type || "application/pdf";
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CRLVe-${result.veiculo?.placa || "VEICULO"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao baixar documento digital", e);
    }
  }, [result]);

  return (
    <div>
      {/* ── Formulário de Busca ── */}
      <div className="search-bar-wrapper" style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 36px", marginBottom: 18,
      }}>
        <div className="search-bar-container" style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
          
          {/* Placa */}
          <div style={{ flex: 2, position: "relative" }}>
            <div style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const,
              pointerEvents: "none", zIndex: 5,
            }}>
              PLACA
            </div>
            <input
              id="crlve-placa-input"
              type="text"
              autoComplete="off"
              value={placa}
              onChange={handlePlacaChange}
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

          {/* UF */}
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const,
              pointerEvents: "none", zIndex: 5,
            }}>
              UF
            </div>
            <select
              id="crlve-uf-select"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
              style={{
                width: "100%", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.15)", color: "#fff",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 28, letterSpacing: "0.14em",
                padding: "18px 18px 18px 56px",
                outline: "none", transition: "border-color 0.15s",
                borderRadius: 0, appearance: "none", cursor: "pointer",
                WebkitBoxShadow: "0 0 0 1000px rgba(14,28,48,1) inset",
              }}
              onFocus={(e) => (e.target.style.borderColor = COR_ACCENT)}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            >
              <option value="" style={{ background: "#0E1C30", fontFamily: "'JetBrains Mono', monospace", fontSize: 16 }}>--</option>
              {UFS.map((u) => (
                <option key={u.sigla} value={u.sigla} style={{ background: "#0E1C30", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 16 }}>
                  {u.sigla}
                </option>
              ))}
            </select>
          </div>

          {/* Botão de Busca */}
          <button
            id="crlve-consultar-btn"
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
                Emitindo…
              </>
            ) : "Consultar"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            {error}
          </div>
        )}

        {/* Botões de Exemplo */}
        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", display: "flex", alignItems: "center", textTransform: "uppercase" as const, paddingTop: 6 }}>
            Exemplos:
          </span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={async () => handleExemplo("clean")}
              style={{
                padding: "6px 14px", border: "1px solid rgba(43,168,74,0.25)",
                background: "rgba(43,168,74,0.08)", color: "#2BA84A",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                cursor: "pointer", transition: "all 0.15s", borderRadius: 2,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.15)"; e.currentTarget.style.borderColor = "#2BA84A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.08)"; e.currentTarget.style.borderColor = "rgba(43,168,74,0.25)"; }}
            >
              Exemplo de Relatório (Nada Consta)
            </button>
            <button
              onClick={async () => handleExemplo("restricted")}
              style={{
                padding: "6px 14px", border: "1px solid rgba(192,57,43,0.25)",
                background: "rgba(192,57,43,0.08)", color: "#c0392b",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                cursor: "pointer", transition: "all 0.15s", borderRadius: 2,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.15)"; e.currentTarget.style.borderColor = "#c0392b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(192,57,43,0.08)"; e.currentTarget.style.borderColor = "rgba(192,57,43,0.25)"; }}
            >
              Exemplo de Relatório (Com Bloqueios)
            </button>
          </div>
        </div>
      </div>

      {/* ── Resultados da Busca ── */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Header do Resultado */}
          <div style={{
            border: `1px solid ${COR_ACCENT}`,
            background: "rgba(212,168,67,0.02)",
            padding: "20px 28px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: COR_ACCENT, letterSpacing: "0.14em", textTransform: "uppercase" as const, fontWeight: 700 }}>
                CRLV-e · {v(result.veiculo?.placa || placa)}
              </span>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Libre Caslon Text', serif", marginTop: 6, letterSpacing: "0.02em" }}>
                {(result.veiculo?.marca_modelo || "—").replace("/", " - ")}
              </span>
              <span style={{
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, fontWeight: 700, letterSpacing: "0.05em",
                color: result.documentos?.crlv?.existe_ocorrencia === "1" ? "#ef4444" : "#2ba84a",
              }}>
                {result.documentos?.crlv?.existe_ocorrencia === "1" ? "CONSTA IMPEDIMENTO / RESTRIÇÃO" : "CRLV-e REGULAR — NADA CONSTA"}
                {result.documentos?.crlv?.exercicio && ` · EXERCÍCIO ${result.documentos.crlv.exercicio}`}
              </span>
            </div>
            <button
              onClick={handleGerarRelatorio}
              style={{
                padding: "12px 24px", background: COR_ACCENT, color: "#0A1628",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                letterSpacing: "0.1em", textTransform: "uppercase" as const,
                fontWeight: 700, border: "none", cursor: "pointer",
                whiteSpace: "nowrap" as const, transition: "background 0.15s",
                flexShrink: 0, marginLeft: 20,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e8c05a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = COR_ACCENT)}
            >
              Visualizar Relatório
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Bloco 1: Informações do Veículo */}
            <Bloco titulo="Identificação do Veículo">
              <DataRow label="Marca / Modelo" value={result.veiculo?.marca_modelo} />
              <DataRow label="Placa" value={result.veiculo?.placa} mono />
              <DataRow label="RENAVAM" value={result.veiculo?.renavam} mono />
              <DataRow label="Chassi" value={result.veiculo?.chassi} mono />
              <DataRow label="Motor" value={result.veiculo?.motor} mono />
              <DataRow label="Combustível" value={result.veiculo?.combustivel} />
              <DataRow label="Cor" value={result.veiculo?.cor_veiculo} />
              <DataRow label="Município / UF" value={result.veiculo?.municipio && `${result.veiculo.municipio} - ${result.veiculo.uf || ""}`} />
            </Bloco>

            {/* Bloco 2: Proprietário e Documento */}
            <Bloco titulo="Proprietário & Licenciamento">
              <DataRow label="Proprietário Atual" value={result.veiculo?.proprietario_nome} />
              <DataRow label="Documento (CPF/CNPJ)" value={result.veiculo?.proprietario_documento} mono />
              <DataRow label="Exercício Licenciado" value={result.documentos?.crlv?.exercicio} />
              <DataRow label="Nº CRLV" value={result.veiculo?.crlv} mono />
              <DataRow label="Existe Ocorrência" value={result.documentos?.crlv?.existe_ocorrencia === "1" ? "SIM" : "NÃO"} isError={result.documentos?.crlv?.existe_ocorrencia === "1"} />
              <DataRow label="Observações" value={result.documentos?.crlv?.observacoes} isError={result.documentos?.crlv?.existe_ocorrencia === "1"} />
              <DataRow label="Última Atualização DENATRAN" value={result.veiculo?.data_atualizacao} />
            </Bloco>
          </div>

          {/* Botão Baixar PDF — abaixo das tabelas, à direita */}
          {result.documentos?.crlv?.pdf_file?.file_base64 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={handleDownloadPDF}
                style={{
                  padding: "12px 24px", background: "transparent",
                  border: "1px solid #2BA84A", color: "#2BA84A",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  fontWeight: 700, cursor: "pointer",
                  whiteSpace: "nowrap" as const, transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(43,168,74,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                ⎙ Baixar CRLV-e (PDF)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Histórico Recente */}
      <div style={{ marginTop: 32 }}>
        <div
          className="mobile-history-toggle"
          style={{ display: "none" }}
          onClick={(e) => {
            const wrapper = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (wrapper) wrapper.classList.toggle("show-mobile");
          }}
        >
          <span>▸ Histórico de Consultas</span>
        </div>
        <div className="historico-wrapper">
          <HistoricoConsultas
            historico={historico}
            onCarregar={(dadosSelect: unknown, placaSelect: string) => {
              setPlaca(formatarPlaca(placaSelect));
              setResult(dadosSelect as CrlveResult);
              setError(null);
            }}
            onLimpar={limpar}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .mobile-history-toggle { display: flex !important; align-items: center; gap: 8px; cursor: pointer; padding: 10px 0; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5a6a7a; text-transform: uppercase; letter-spacing: 0.1em; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 8px; }
          .historico-wrapper:not(.show-mobile) { display: none !important; }
        }
      `}</style>
    </div>
  );
}
