"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";

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
    <div style={{
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

// ─── Separador de seção ────────────────────────────────────────────────────────
function SectionTitle({ label }: { label: string }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#4A8AB8", letterSpacing: "0.22em", textTransform: "uppercase" as const, paddingTop: 24, paddingBottom: 12, marginTop: 8, borderTop: "1px solid rgba(74,138,184,0.15)" }}>
      {label}
    </div>
  );
}

// ─── Avatar inicial ────────────────────────────────────────────────────────────
function Avatar({ nome }: { nome?: string | null }) {
  const inicial = nome?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <div style={{
      width: 68, height: 68, borderRadius: "50%",
      background: "rgba(74,138,184,0.15)",
      border: "2px solid rgba(74,138,184,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Libre Caslon Text', serif", fontSize: 28, color: "#4A8AB8",
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
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBuscar();
  };

  const p = resultado?.proprietario;

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
              id="proprietario-placa-input"
              type="text"
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
              }}
              onFocus={(e) => (e.target.style.borderColor = "#4A8AB8")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>
          <button
            id="proprietario-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px",
              background: loading ? "rgba(74,138,184,0.4)" : "#4A8AB8",
              color: "#030c13",
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
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #030c13", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
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
      </div>

      {/* ── Resultado ── */}
      {resultado && (
        <div id="proprietario-resultado" style={{ animation: "fadeUp 0.4s ease" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 24, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4A8AB8", boxShadow: "0 0 0 3px rgba(74,138,184,0.2)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#4A8AB8", letterSpacing: "0.18em", textTransform: "uppercase" as const }}>
              Consulta concluída · {placa}
            </span>
            {resultado.pdf && (
              <a
                href={resultado.pdf}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: "auto", padding: "6px 14px", background: "rgba(74,138,184,0.1)", border: "1px solid rgba(74,138,184,0.3)", color: "#4A8AB8", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textDecoration: "none" }}
              >
                ↓ PDF
              </a>
            )}
            {!resultado.pdf && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", marginLeft: "auto" }}>
                {new Date().toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          {p ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {/* ── Coluna Esquerda: Proprietário ── */}
              <div style={{ background: "rgba(74,138,184,0.05)", border: "1px solid rgba(74,138,184,0.2)", padding: "36px 32px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#4A8AB8", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                  Proprietário · Atual
                </div>

                {/* Nome em destaque */}
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 32 }}>
                  <Avatar nome={p.nome} />
                  <div>
                    <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 26, fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: 0 }}>
                      {p.nome ?? "Nome não disponível"}
                    </h3>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#4A8AB8", marginTop: 6, letterSpacing: "0.1em" }}>
                      {mascaraDoc(p.documento)}
                    </div>
                  </div>
                </div>

                <DataRow label="Município" value={p.municipio ?? "—"} />
                <DataRow label="UF" value={p.uf ?? "—"} />

                {p.statusDescricao && (
                  <>
                    <SectionTitle label="Status da Consulta" />
                    <div style={{ padding: "10px 14px", background: "rgba(43,168,74,0.07)", border: "1px solid rgba(43,168,74,0.2)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#2BA84A", letterSpacing: "0.08em" }}>
                      ✓ {p.statusDescricao}
                    </div>
                  </>
                )}
              </div>

              {/* ── Coluna Direita: Veículo ── */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                  Veículo · Dados
                </div>
                <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 22, fontWeight: 400, color: "#fff", lineHeight: 1.2, marginBottom: 24 }}>
                  {p.marcaModelo ?? "—"}
                </h3>

                <DataRow label="Placa" value={p.placa ?? "—"} />
                <DataRow label="RENAVAM" value={p.renavam ?? "—"} />
                <DataRow label="Ano Fabricação" value={p.anoFabricacao ?? "—"} />
                <DataRow label="Ano Modelo" value={p.anoModelo ?? "—"} />
                <DataRow label="Cor" value={p.cor ?? "—"} />
                <DataRow label="Combustível" value={p.combustivel ?? "—"} />
                <DataRow label="Motor" value={p.motor ?? "—"} />

                {p.chassi && (
                  <>
                    <SectionTitle label="Chassi" />
                    <div style={{ padding: "12px 16px", background: "rgba(184,145,74,0.08)", border: "1px solid rgba(184,145,74,0.2)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#fff", letterSpacing: "0.06em", wordBreak: "break-all" as const }}>
                      {p.chassi}
                    </div>
                  </>
                )}

                <DataRow label="Atualizado em" value={p.dataAtualizacao ?? "—"} />
              </div>
            </div>
          ) : (
            <div style={{ padding: 32, textAlign: "center" as const, border: "1px solid rgba(255,255,255,0.06)", color: "#5a6a7a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              Nenhum dado encontrado para esta placa.
            </div>
          )}

          {/* Botão Gerar Relatório */}
          <div style={{ marginTop: 2, padding: "20px 0", display: "flex", justifyContent: "flex-end" }}>
            <button
              id="proprietario-gerar-relatorio-btn"
              onClick={() => {
                const { url } = gerarUrlRelatorio(
                  "proprietario",
                  placa,
                  "PLACA",
                  resultado as unknown as Record<string, unknown>
                );
                window.open(url, "_blank");
              }}
              style={{
                padding: "14px 28px",
                background: "transparent",
                border: "1px solid rgba(200,162,90,0.5)",
                color: "#c8a25a",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase" as const,
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(200,162,90,0.08)";
                e.currentTarget.style.borderColor = "#c8a25a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(200,162,90,0.5)";
              }}
            >
              ⎙ Gerar Relatório
            </button>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          #proprietario-resultado > div:nth-child(3) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
