"use client";

import { useState, useCallback } from "react";

// ─── Tipos mapeados ───────────────────────────────────────────────────────────

interface LeilaoScore {
  pontuacao?: string | null;
  aceitacao?: string | null;
  descricaoPontuacao?: string | null;
  exigeVistoriaEspecial?: string | null;
  percentualSobreFipe?: string | null;
}

interface LeilaoDadosVeiculo {
  placa?: string | null;
  marcaModelo?: string | null;
  anoFabricacao?: string | null;
  anoModelo?: string | null;
  chassi?: string | null;
  renavam?: string | null;
  cor?: string | null;
  combustivel?: string | null;
  motor?: string | null;
  cambio?: string | null;
  carroceria?: string | null;
  categoria?: string | null;
  kilometragem?: string | null;
  qtdEixos?: string | null;
  eixoTraseiro?: string | null;
}

interface LeilaoSinistro {
  existeOcorrencia: boolean;
  descricao?: string | null;
}

interface LeilaoOcorrencia {
  dataLeilao: string;
  leiloeiro: string;
  lote: string;
  comitente: string;
  patio: string;
  condicaoGeral: string;
  condicaoMotor: string;
  condicaoMecanica: string;
  condicaoCambio: string;
  situacaoChassi: string;
  observacoes: string;
  imagens: string[];
}

interface LeilaoResult {
  score: LeilaoScore | null;
  dadosVeiculo: LeilaoDadosVeiculo | null;
  sinistro: LeilaoSinistro | null;
  checkList: Record<string, string | null> | null;
  totalOcorrencias: number;
  ocorrencias: LeilaoOcorrencia[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

const COR_ACCENT = "#D4A843";
const COR_ACCENT_DIM = "rgba(212,168,67,0.2)";

// ─── Bloco de seção ───────────────────────────────────────────────────────────
function Bloco({ titulo, badge, children }: {
  titulo: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
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
function DataRow({ label, value, mono = false, highlight = false }: {
  label: string; value: string; mono?: boolean; highlight?: boolean;
}) {
  if (!value || value === "—" || value === "") return null;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "180px 1fr",
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
      gap: 12, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'JetBrains Mono', monospace",
        fontSize: 12, color: highlight ? "#e07b6a" : "#e0e6ef", fontWeight: highlight ? 700 : 400,
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Indicador booleano ───────────────────────────────────────────────────────
function IndicadorBool({ label, valor }: { label: string; valor: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: valor ? "#e07b6a" : "#2BA84A", flexShrink: 0 }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" as const, flex: 1 }}>
        {label}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: valor ? "#e07b6a" : "#2BA84A", fontWeight: 700 }}>
        {valor ? "SIM" : "NÃO"}
      </span>
    </div>
  );
}

// ─── Score Badge ──────────────────────────────────────────────────────────────
function scoreCor(pontuacao?: string | null): string {
  if (!pontuacao) return "#5a6a7a";
  if (pontuacao === "A") return "#2BA84A";
  if (pontuacao === "B") return "#8BC34A";
  if (pontuacao === "C") return "#D4A843";
  if (pontuacao === "D") return "#e07b6a";
  return "#e05555";
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
              onFocus={(e) => (e.target.style.borderColor = COR_ACCENT)}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>
          <button
            id="leilao-score-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px", background: loading ? "rgba(212,168,67,0.4)" : COR_ACCENT,
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

          {/* ── Score ── */}
          {r.score && (
            <Bloco titulo="Score de Leilão">
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 16 }}>
                <div style={{
                  fontFamily: "'Libre Caslon Text', serif", fontSize: 64,
                  color: scoreCor(r.score.pontuacao), lineHeight: 1,
                  display: "flex", alignItems: "baseline", gap: 8,
                }}>
                  {r.score.pontuacao ?? "—"}
                  <span style={{ fontSize: 18, fontFamily: "'JetBrains Mono', monospace", opacity: 0.5 }}>
                    / {r.score.aceitacao ?? "—"}%
                  </span>
                </div>
                <div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                    color: scoreCor(r.score.pontuacao), fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  }}>
                    {r.score.descricaoPontuacao ?? "—"}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", marginTop: 4 }}>
                    Pontuação A–E · A = menor risco
                  </div>
                </div>
              </div>
              <DataRow label="% Sobre Tabela FIPE" value={r.score.percentualSobreFipe ? `${r.score.percentualSobreFipe}%` : "—"} />
              <DataRow label="Exige Vistoria" value={r.score.exigeVistoriaEspecial ?? "—"} />
            </Bloco>
          )}

          {/* ── Indício de Sinistro ── */}
          {r.sinistro && (
            <Bloco titulo="Indício de Sinistro">
              <IndicadorBool label="Existe Ocorrência de Sinistro" valor={r.sinistro.existeOcorrencia} />
              {r.sinistro.descricao && (
                <DataRow label="Descrição" value={r.sinistro.descricao} highlight={r.sinistro.existeOcorrencia} />
              )}
            </Bloco>
          )}

          {/* ── Dados do Veículo (Leilão) ── */}
          {r.dadosVeiculo && (
            <Bloco titulo="Dados do Veículo">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                <div>
                  <DataRow label="Placa" value={r.dadosVeiculo.placa ?? "—"} mono />
                  <DataRow label="Marca/Modelo" value={r.dadosVeiculo.marcaModelo ?? "—"} />
                  <DataRow label="Ano Fabricação" value={r.dadosVeiculo.anoFabricacao ?? "—"} mono />
                  <DataRow label="Ano Modelo" value={r.dadosVeiculo.anoModelo ?? "—"} mono />
                  <DataRow label="Chassi" value={r.dadosVeiculo.chassi ?? "—"} mono />
                  <DataRow label="RENAVAM" value={r.dadosVeiculo.renavam ?? "—"} mono />
                  <DataRow label="Cor" value={r.dadosVeiculo.cor ?? "—"} />
                  <DataRow label="Combustível" value={r.dadosVeiculo.combustivel ?? "—"} />
                </div>
                <div>
                  <DataRow label="Motor" value={r.dadosVeiculo.motor ?? "—"} mono />
                  <DataRow label="Câmbio" value={r.dadosVeiculo.cambio ?? "—"} />
                  <DataRow label="Carroceria" value={r.dadosVeiculo.carroceria ?? "—"} />
                  <DataRow label="Categoria" value={r.dadosVeiculo.categoria ?? "—"} />
                  <DataRow label="Kilometragem" value={r.dadosVeiculo.kilometragem ? `${parseInt(r.dadosVeiculo.kilometragem).toLocaleString("pt-BR")} km` : "—"} />
                  <DataRow label="Qtd. Eixos" value={r.dadosVeiculo.qtdEixos ?? "—"} />
                  <DataRow label="Eixo Traseiro" value={r.dadosVeiculo.eixoTraseiro ?? "—"} />
                </div>
              </div>
            </Bloco>
          )}

          {/* ── Ocorrências de Leilão ── */}
          <Bloco titulo="Histórico de Leilões" badge={`${r.totalOcorrencias} registro${r.totalOcorrencias !== 1 ? "s" : ""}`}>
            {r.ocorrencias.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {r.ocorrencias.map((o, i) => (
                  <div key={i} style={{
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
                        Leilão #{i + 1} · {o.dataLeilao}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a" }}>
                        Lote {o.lote}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
                      <div>
                        <DataRow label="Data" value={o.dataLeilao} mono />
                        <DataRow label="Leiloeiro" value={o.leiloeiro} />
                        <DataRow label="Lote" value={o.lote} mono />
                        <DataRow label="Comitente" value={o.comitente} />
                        <DataRow label="Pátio" value={o.patio} />
                      </div>
                      <div>
                        <DataRow label="Cond. Geral" value={o.condicaoGeral} />
                        <DataRow label="Cond. Motor" value={o.condicaoMotor} />
                        <DataRow label="Cond. Mecânica" value={o.condicaoMecanica} />
                        <DataRow label="Cond. Câmbio" value={o.condicaoCambio} />
                        <DataRow label="Situação Chassi" value={o.situacaoChassi} />
                      </div>
                    </div>
                    {o.observacoes && o.observacoes !== "—" && (
                      <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(212,168,67,0.06)", border: "1px solid rgba(212,168,67,0.15)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3" }}>
                        💬 {o.observacoes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#2BA84A", padding: "12px 0" }}>
                Nenhum registro de leilão encontrado
              </div>
            )}
          </Bloco>

          {/* ── Checklist (se disponível) ── */}
          {r.checkList && (
            <Bloco titulo="Checklist do Veículo">
              {Object.entries(r.checkList).map(([key, val]) => (
                val ? <DataRow key={key} label={key.replace(/([A-Z])/g, " $1").trim()} value={val} /> : null
              ))}
            </Bloco>
          )}

          {/* ── Debug ── */}
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
