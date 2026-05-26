"use client";

import { useState, useCallback } from "react";

// ─── Tipos ───────────────────────────────────────────────
type TipoDoc = "CPF" | "CNPJ";

interface ConsultaResult {
  scr: {
    error?: string;
    nome?: string;
    totalVencido?: number;
    totalAVencer?: number;
    totalPrejuizo?: number;
    totalResponsabilidade?: number;
    quantidadeInstituicoes?: number;
    dataReferencia?: string;
    modalidades?: { modalidade: string; vencido?: number; aVencer?: number; total?: number }[];
    [key: string]: unknown;
  };
  score: {
    error?: string;
    score?: number;
    scoreLabel?: string;
    faixa?: string;
    probabilidadeInadimplencia?: number;
    fatoresNegativos?: string[];
    fatoresPositivos?: string[];
    dataConsulta?: string;
    [key: string]: unknown;
  };
}

// ─── Formatação ───────────────────────────────────────────
function formatarDocumento(valor: string, tipo: TipoDoc): string {
  const digits = valor.replace(/\D/g, "");
  if (tipo === "CPF") {
    return digits
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function formatarMoeda(valor?: number): string {
  if (valor == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

// ─── Score Ring ───────────────────────────────────────────
function ScoreRing({ score }: { score?: number }) {
  const val = score ?? 0;
  const pct = Math.min(val / 1000, 1);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  const cor =
    val >= 700 ? "#2BA84A" :
    val >= 500 ? "#B8914A" :
    val >= 300 ? "#e07b39" : "#c0392b";

  const label =
    val >= 700 ? "Excelente" :
    val >= 500 ? "Bom" :
    val >= 300 ? "Regular" : "Baixo";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="70" cy="70" r={r}
            fill="none"
            stroke={cor}
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 32, color: "#fff", lineHeight: 1 }}>
            {val > 0 ? val : "—"}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#8a94a3", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 4 }}>
            / 1000
          </span>
        </div>
      </div>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: cor, letterSpacing: "0.14em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────
export function BuscaPanel() {
  const [tipo, setTipo] = useState<TipoDoc>("CPF");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ConsultaResult | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValor(formatarDocumento(e.target.value, tipo));
    setErro(null);
    setResultado(null);
  }, [tipo]);

  const handleTipo = useCallback((t: TipoDoc) => {
    setTipo(t);
    setValor("");
    setErro(null);
    setResultado(null);
  }, []);

  const handleBuscar = useCallback(async () => {
    const digits = valor.replace(/\D/g, "");
    const esperado = tipo === "CPF" ? 11 : 14;
    if (digits.length !== esperado) {
      setErro(`${tipo} inválido. Verifique e tente novamente.`);
      return;
    }

    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      const res = await fetch(`/api/apibrasil/consulta?documento=${digits}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na consulta.");
      setResultado(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [valor, tipo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBuscar();
  };

  return (
    <div>
      {/* ── Input de busca ── */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 36px",
        marginBottom: 32,
      }}>
        {/* Toggle CPF / CNPJ */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          {(["CPF", "CNPJ"] as TipoDoc[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTipo(t)}
              id={`busca-tipo-${t.toLowerCase()}`}
              style={{
                padding: "12px 24px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: tipo === t ? "#fff" : "#5a6a7a",
                borderBottom: tipo === t ? "2px solid #2BA84A" : "2px solid transparent",
                background: "none",
                border: "none",
                borderBottom: tipo === t ? "2px solid #2BA84A" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Campo de entrada */}
        <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{
              position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase",
              pointerEvents: "none",
            }}>
              {tipo}
            </div>
            <input
              id="busca-documento-input"
              type="text"
              inputMode="numeric"
              value={valor}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={tipo === "CPF" ? "000.000.000-00" : "00.000.000/0000-00"}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22,
                letterSpacing: "0.06em",
                padding: "18px 18px 18px 60px",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2BA84A")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>
          <button
            id="busca-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px",
              background: loading ? "rgba(43,168,74,0.4)" : "#2BA84A",
              color: "#06240e",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #06240e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Consultando
              </>
            ) : "Consultar"}
          </button>
        </div>

        {/* Erro */}
        {erro && (
          <div style={{
            marginTop: 14,
            padding: "10px 16px",
            background: "rgba(192,57,43,0.15)",
            border: "1px solid rgba(192,57,43,0.3)",
            color: "#e07b6a",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: "0.08em",
          }}>
            ⚠ {erro}
          </div>
        )}

        <p style={{ marginTop: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Dados protegidos por criptografia · Consulta registrada conforme LGPD
        </p>
      </div>

      {/* ── Resultados ── */}
      {resultado && (
        <div id="busca-resultado" style={{ animation: "fadeUp 0.4s ease" }}>
          {/* Header do resultado */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            paddingBottom: 24, marginBottom: 28,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2BA84A", boxShadow: "0 0 0 3px rgba(43,168,74,0.2)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#2BA84A", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Consulta concluída
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", letterSpacing: "0.1em", marginLeft: "auto" }}>
              {new Date().toLocaleString("pt-BR")}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {/* ── Coluna SCR ── */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20 }}>
                SCR · Bacen
              </div>
              <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 28, fontWeight: 400, color: "#fff", marginBottom: 28, lineHeight: 1.1 }}>
                Sistema de<br /><em style={{ color: "#8a94a3", fontStyle: "italic" }}>Crédito</em>
              </h3>

              {resultado.scr.error ? (
                <div style={{ color: "#e07b6a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: "16px", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)" }}>
                  {resultado.scr.error}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {[
                    { label: "Responsabilidade Total", val: formatarMoeda(resultado.scr.totalResponsabilidade) },
                    { label: "A Vencer", val: formatarMoeda(resultado.scr.totalAVencer) },
                    { label: "Vencido", val: formatarMoeda(resultado.scr.totalVencido), destaque: (resultado.scr.totalVencido ?? 0) > 0 },
                    { label: "Prejuízo", val: formatarMoeda(resultado.scr.totalPrejuizo), destaque: (resultado.scr.totalPrejuizo ?? 0) > 0 },
                    { label: "Instituições", val: resultado.scr.quantidadeInstituicoes != null ? String(resultado.scr.quantidadeInstituicoes) : "—" },
                    { label: "Referência", val: resultado.scr.dataReferencia ?? "—" },
                  ].map(({ label, val, destaque }) => (
                    <div key={label} style={{
                      display: "grid", gridTemplateColumns: "1fr auto",
                      padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                      gap: 16, alignItems: "center",
                    }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: destaque ? "#e07b6a" : "#fff", fontWeight: destaque ? 700 : 400 }}>{val}</span>
                    </div>
                  ))}

                  {/* Modalidades */}
                  {resultado.scr.modalidades && resultado.scr.modalidades.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
                        Modalidades
                      </div>
                      {resultado.scr.modalidades.slice(0, 5).map((m, i) => (
                        <div key={i} style={{
                          display: "grid", gridTemplateColumns: "1fr auto",
                          padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#7a8a9a" }}>{m.modalidade}</span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df" }}>{formatarMoeda(m.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Coluna Score ── */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20 }}>
                Score · Crédito
              </div>
              <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 28, fontWeight: 400, color: "#fff", marginBottom: 28, lineHeight: 1.1 }}>
                Indicador de<br /><em style={{ color: "#8a94a3", fontStyle: "italic" }}>Risco</em>
              </h3>

              {resultado.score.error ? (
                <div style={{ color: "#e07b6a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: "16px", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.2)" }}>
                  {resultado.score.error}
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                    <ScoreRing score={resultado.score.score} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[
                      { label: "Faixa", val: resultado.score.faixa ?? "—" },
                      { label: "Prob. Inadimplência", val: resultado.score.probabilidadeInadimplencia != null ? `${(resultado.score.probabilidadeInadimplencia * 100).toFixed(1)}%` : "—" },
                      { label: "Data Consulta", val: resultado.score.dataConsulta ?? "—" },
                    ].map(({ label, val }) => (
                      <div key={label} style={{
                        display: "grid", gridTemplateColumns: "1fr auto",
                        padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                        gap: 16, alignItems: "center",
                      }}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#fff" }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {resultado.score.fatoresNegativos && resultado.score.fatoresNegativos.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#e07b6a", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
                        Fatores de Risco
                      </div>
                      {resultado.score.fatoresNegativos.map((f, i) => (
                        <div key={i} style={{ padding: "8px 12px", marginBottom: 4, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.15)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#e07b6a" }}>
                          — {f}
                        </div>
                      ))}
                    </div>
                  )}

                  {resultado.score.fatoresPositivos && resultado.score.fatoresPositivos.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2BA84A", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
                        Fatores Positivos
                      </div>
                      {resultado.score.fatoresPositivos.map((f, i) => (
                        <div key={i} style={{ padding: "8px 12px", marginBottom: 4, background: "rgba(43,168,74,0.08)", border: "1px solid rgba(43,168,74,0.2)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#2BA84A" }}>
                          + {f}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer da consulta */}
          <div style={{
            marginTop: 2, padding: "16px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 24,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: "#3a4a5a", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            <span>Fonte: APIBrasil · SCR Bacen</span>
            <span>·</span>
            <span>LGPD Art. 7º, III</span>
            <span>·</span>
            <span style={{ marginLeft: "auto" }}>SNC — Sistema Nacional de Conformidade</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          #busca-resultado > div:last-of-type { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
