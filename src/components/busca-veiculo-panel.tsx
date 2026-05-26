"use client";

import { useState, useCallback } from "react";

// ─── Tipos (alinhados com a resposta real da APIBrasil) ───────────────────────
interface FIPEItem {
  codigoFipe: string;
  modelo: string;
  anoModelo: string | number;
  combustivel: string;
  mesReferencia: string;
  valor: string;
  valorNum: number;
  principal: boolean;
}

interface HistoricoItem {
  mes: string;
  valor: number;
  valorFormatado: string;
}

interface VeiculoResult {
  veiculo: {
    placa?: string;
    marca?: string;
    modelo?: string;
    anoFabricacao?: string | number;
    anoModelo?: string | number;
    cor?: string;
    combustivel?: string;
    categoria?: string;
    chassi?: string;
  };
  fipe: FIPEItem[];
  historico: HistoricoItem[];
}

// ─── Formatação de placa ──────────────────────────────────────────────────────
function formatarPlaca(valor: string): string {
  const clean = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
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
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
      gap: 16, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{ fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif", fontSize: 13, color: "#fff" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ dados }: { dados: HistoricoItem[] }) {
  if (dados.length < 2) return null;
  const valores = dados.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min || 1;
  const w = 280;
  const h = 60;
  const pad = 8;

  const pts = dados.map((d, i) => {
    const x = pad + (i / (dados.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.valor - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const ultimo = dados[dados.length - 1];
  const penultimo = dados[dados.length - 2];
  const subiu = ultimo.valor >= penultimo.valor;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 12 }}>
        Histórico de Valores FIPE
      </div>
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={subiu ? "#2BA84A" : "#e07b39"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Ponto atual */}
        {pts.length > 0 && (
          <circle
            cx={parseFloat(pts[pts.length - 1].split(",")[0])}
            cy={parseFloat(pts[pts.length - 1].split(",")[1])}
            r="3"
            fill={subiu ? "#2BA84A" : "#e07b39"}
          />
        )}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4a5a" }}>
          {dados[0]?.mes}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4a5a" }}>
          {ultimo?.mes}
        </span>
      </div>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export function BuscaVeiculoPanel() {
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<VeiculoResult | null>(null);

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
      const res = await fetch(`/api/apibrasil/veiculo?placa=${clean}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro na consulta.");
      setResultado(data as VeiculoResult);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [placa]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBuscar();
  };

  const v = resultado?.veiculo ?? {};
  const fipeList = resultado?.fipe ?? [];
  const historico = resultado?.historico ?? [];
  const principal = fipeList.find((f) => f.principal) ?? fipeList[0];

  return (
    <div>
      {/* ── Input de Placa ── */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "32px 36px",
        marginBottom: 32,
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
              id="veiculo-placa-input"
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
              onFocus={(e) => (e.target.style.borderColor = "#B8914A")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>
          <button
            id="veiculo-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px",
              background: loading ? "rgba(184,145,74,0.4)" : "#B8914A",
              color: "#1a1100",
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
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #1a1100", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
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

        <p style={{ marginTop: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
          Formatos aceitos: ABC-1234 (antigo) · ABC-1D23 (Mercosul)
        </p>
      </div>

      {/* ── Resultados ── */}
      {resultado && (
        <div id="veiculo-resultado" style={{ animation: "fadeUp 0.4s ease" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 24, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#B8914A", boxShadow: "0 0 0 3px rgba(184,145,74,0.2)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#B8914A", letterSpacing: "0.18em", textTransform: "uppercase" as const }}>
              Consulta concluída
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", marginLeft: "auto" }}>
              {new Date().toLocaleString("pt-BR")}
            </span>
          </div>

          {/* Valor FIPE em destaque */}
          {principal && (
            <div style={{
              padding: "28px 32px", marginBottom: 2,
              background: "rgba(43,168,74,0.06)",
              border: "1px solid rgba(43,168,74,0.2)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 8 }}>
                  Valor FIPE · {principal.mesReferencia}
                </div>
                <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 52, color: "#fff", lineHeight: 1 }}>
                  {principal.valor}
                </div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const, marginBottom: 6 }}>Código FIPE</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: "#B8914A" }}>{principal.codigoFipe}</div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
            {/* ── Dados do Veículo ── */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                Veículo · Identificação
              </div>
              <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, fontWeight: 400, color: "#fff", marginBottom: 24, lineHeight: 1.2 }}>
                {v.marca ?? "—"}
                <br />
                <em style={{ color: "#8a94a3", fontSize: 18 }}>{v.modelo ?? ""}</em>
              </h3>

              <DataRow label="Ano Fabricação" value={String(v.anoFabricacao ?? "—")} />
              <DataRow label="Ano Modelo" value={String(v.anoModelo ?? "—")} />
              <DataRow label="Cor" value={String(v.cor ?? "—")} />
              <DataRow label="Combustível" value={String(v.combustivel ?? "—")} />
              <DataRow label="Categoria" value={String(v.categoria ?? "—")} />

              {/* Chassi em destaque */}
              {v.chassi && v.chassi !== "—" && (
                <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(184,145,74,0.08)", border: "1px solid rgba(184,145,74,0.2)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.2em", textTransform: "uppercase" as const, marginBottom: 6 }}>Chassi</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#fff", letterSpacing: "0.06em", wordBreak: "break-all" as const }}>{v.chassi}</div>
                </div>
              )}
            </div>

            {/* ── Histórico + FIPE detalhe ── */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                FIPE · Evolução
              </div>
              <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, fontWeight: 400, color: "#fff", marginBottom: 24, lineHeight: 1.2 }}>
                Referência<br /><em style={{ color: "#8a94a3" }}>{principal?.mesReferencia ?? "—"}</em>
              </h3>

              <DataRow label="Código FIPE" value={principal?.codigoFipe ?? "—"} />
              <DataRow label="Valor Atual" value={principal?.valor ?? "—"} />
              <DataRow label="Mês Referência" value={principal?.mesReferencia ?? "—"} />
              <DataRow label="Combustível" value={principal?.combustivel ?? "—"} />
              <DataRow label="Ano Modelo" value={String(principal?.anoModelo ?? "—")} />

              {historico.length > 1 && <Sparkline dados={historico} />}
            </div>
          </div>

          {/* ── Tabela FIPE todos os anos ── */}
          {fipeList.length > 1 && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px", marginBottom: 2 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                FIPE · Todos os Anos/Versões
              </div>
              <div style={{ overflowX: "auto" as const }}>
                <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                  <thead>
                    <tr>
                      {["Código FIPE", "Modelo", "Ano Modelo", "Combustível", "Referência", "Valor"].map((h) => (
                        <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const, textAlign: "left" as const, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fipeList.map((item, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: item.principal ? "rgba(184,145,74,0.06)" : "transparent",
                        }}
                      >
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#B8914A", padding: "11px 14px" }}>{item.codigoFipe}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "11px 14px", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{item.modelo}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "11px 14px" }}>{item.anoModelo}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "11px 14px" }}>{item.combustivel}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#7a8a9a", padding: "11px 14px" }}>{item.mesReferencia}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#2BA84A", fontWeight: item.principal ? 700 : 400, padding: "11px 14px" }}>{item.valor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            padding: "16px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 24,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: "#3a4a5a", letterSpacing: "0.1em", textTransform: "uppercase" as const,
          }}>
            <span>Fonte: APIBrasil · FIPE + Chassi</span>
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
          #veiculo-resultado > div:nth-child(3) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
