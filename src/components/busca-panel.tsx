"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";

// ─── Tipos (alinhados com a resposta real da APIBrasil) ───────────────────────
type TipoDoc = "CPF" | "CNPJ";

interface ConsultaResult {
  scr: {
    error?: string;
    totalAVencer?: string;
    totalVencido?: string;
    totalPrejuizo?: string;
    limiteCredito?: string;
    quantidadeInstituicoes?: string;
    quantidadeOperacoes?: string;
    databaseConsultada?: string;
    dataInicioRelacionamento?: string;
    coobrigacaoAssumida?: string;
    coobrigacaoRecebida?: string;
    tipoDocumento?: string;
    operacoes?: { modalidade: string; subModalidade: string; total: string; percentual: string }[];
    creditoAVencer?: { descricao: string; valor: string; qtdMeses: string }[];
  };
  score: {
    error?: string;
    pontuacao?: number | null;
    faixa?: string;
  };
}

// ─── Formatação ───────────────────────────────────────────────────────────────
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

/** Converte "16833,00" → "R$ 16.833,00" */
function formatarValorBR(valor?: string): string {
  if (!valor || valor === "—") return "—";
  const num = parseFloat(valor.replace(/\./g, "").replace(",", "."));
  if (isNaN(num)) return valor;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score?: number | null }) {
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
        {val > 0 ? label : "Sem dados"}
      </span>
    </div>
  );
}

// ─── Linha de dado ────────────────────────────────────────────────────────────
function DataRow({ label, value, destaque }: { label: string; value: string; destaque?: boolean }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
      gap: 16, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: destaque ? "#e07b6a" : "#fff", fontWeight: destaque ? 700 : 400 }}>{value}</span>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
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

    if (tipo === "CNPJ") {
      setErro("A consulta SCR Bacen + Score está disponível apenas para CPF no momento.");
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

  const vencido = parseFloat((resultado?.scr?.totalVencido ?? "0").replace(",", "."));
  const prejuizo = parseFloat((resultado?.scr?.totalPrejuizo ?? "0").replace(",", "."));

  return (
    <div>
      {/* ── Painel de busca ── */}
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
                textTransform: "uppercase" as const,
                color: tipo === t ? "#fff" : "#5a6a7a",
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
              color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const,
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
              textTransform: "uppercase" as const,
              fontWeight: 700,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              whiteSpace: "nowrap" as const,
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

        {erro && (
          <div style={{ marginTop: 14, padding: "10px 16px", background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#e07b6a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.08em" }}>
            ⚠ {erro}
          </div>
        )}

        <p style={{ marginTop: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
          Dados protegidos por criptografia · Consulta registrada conforme LGPD
        </p>
      </div>

      {/* ── Resultados ── */}
      {resultado && (
        <div id="busca-resultado" style={{ animation: "fadeUp 0.4s ease" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 24, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2BA84A", boxShadow: "0 0 0 3px rgba(43,168,74,0.2)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#2BA84A", letterSpacing: "0.18em", textTransform: "uppercase" as const }}>
              Consulta concluída · Base {resultado.scr.databaseConsultada}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", letterSpacing: "0.1em", marginLeft: "auto" }}>
              {new Date().toLocaleString("pt-BR")}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {/* ── SCR Bacen ── */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                SCR · Bacen
              </div>
              <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 28, fontWeight: 400, color: "#fff", marginBottom: 28, lineHeight: 1.1 }}>
                Sistema de<br /><em style={{ color: "#8a94a3" }}>Crédito</em>
              </h3>

              <DataRow label="Crédito a Vencer" value={formatarValorBR(resultado.scr.totalAVencer)} />
              <DataRow label="Crédito Vencido" value={formatarValorBR(resultado.scr.totalVencido)} destaque={vencido > 0} />
              <DataRow label="Prejuízo" value={formatarValorBR(resultado.scr.totalPrejuizo)} destaque={prejuizo > 0} />
              <DataRow label="Limite de Crédito" value={formatarValorBR(resultado.scr.limiteCredito)} />
              <DataRow label="Coobrigação Assumida" value={formatarValorBR(resultado.scr.coobrigacaoAssumida)} />
              <DataRow label="Qtd. Instituições" value={resultado.scr.quantidadeInstituicoes ?? "—"} />
              <DataRow label="Qtd. Operações" value={resultado.scr.quantidadeOperacoes ?? "—"} />
              <DataRow label="Início Relacionamento" value={resultado.scr.dataInicioRelacionamento ?? "—"} />
              <DataRow label="Base de Dados" value={resultado.scr.databaseConsultada ?? "—"} />

              {/* Operações por modalidade */}
              {resultado.scr.operacoes && resultado.scr.operacoes.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 12 }}>
                    Operações por Modalidade
                  </div>
                  {resultado.scr.operacoes.slice(0, 8).map((op, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#7a8a9a", lineHeight: 1.4 }}>{op.subModalidade || op.modalidade}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df" }}>{formatarValorBR(op.total)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Crédito a vencer por prazo */}
              {resultado.scr.creditoAVencer && resultado.scr.creditoAVencer.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 12 }}>
                    A Vencer por Prazo
                  </div>
                  {resultado.scr.creditoAVencer.slice(0, 6).map((c, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#7a8a9a" }}>{c.descricao}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df" }}>{formatarValorBR(c.valor)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Score ── */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                Score · Crédito
              </div>
              <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 28, fontWeight: 400, color: "#fff", marginBottom: 28, lineHeight: 1.1 }}>
                Indicador de<br /><em style={{ color: "#8a94a3" }}>Risco</em>
              </h3>

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
                <ScoreRing score={resultado.score.pontuacao} />
              </div>

              <DataRow label="Pontuação" value={resultado.score.pontuacao != null ? String(resultado.score.pontuacao) : "—"} />
              <DataRow label="Faixa de Risco" value={resultado.score.faixa ?? "—"} destaque={["RUIM", "PESSIMO", "PÉSSIMO"].includes(resultado.score.faixa ?? "")} />

              {/* Legenda das faixas */}
              <div style={{ marginTop: 28 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 14 }}>
                  Referência de Faixas
                </div>
                {[
                  { faixa: "Excelente", range: "700–1000", cor: "#2BA84A" },
                  { faixa: "Bom", range: "500–699", cor: "#B8914A" },
                  { faixa: "Regular", range: "300–499", cor: "#e07b39" },
                  { faixa: "Baixo / Ruim", range: "0–299", cor: "#c0392b" },
                ].map(({ faixa, range, cor }) => (
                  <div key={faixa} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: cor }}>{faixa}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a" }}>{range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botão Gerar Relatório */}
          <div style={{ marginTop: 2, padding: "20px 0", display: "flex", justifyContent: "flex-end" }}>
            <button
              id="credito-gerar-relatorio-btn"
              onClick={() => {
                const { url } = gerarUrlRelatorio(
                  "credito",
                  valor,
                  tipo,
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
            <span>Fonte: Banco Central do Brasil · SNC</span>
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
          #busca-resultado > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
