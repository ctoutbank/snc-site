"use client";

import { useState, useCallback } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface FIPEItem {
  Codigo?: string;
  Marca?: string;
  Modelo?: string;
  AnoModelo?: string | number;
  Combustivel?: string;
  CodigoFipe?: string;
  MesReferencia?: string;
  Valor?: string;
  SiglaCombustivel?: string;
}

interface VeiculoResult {
  veiculo: {
    error?: string;
    placa?: string;
    marca?: string;
    modelo?: string;
    versao?: string;
    anoFabricacao?: string | number;
    anoModelo?: string | number;
    cor?: string;
    combustivel?: string;
    municipio?: string;
    uf?: string;
    situacao?: string;
    restricoes?: string[];
    chassi?: {
      chassi?: string;
      motor?: string;
      cor?: string;
      potencia?: string;
      cilindrada?: string;
      capacidadePassageiros?: string | number;
      carroceria?: string;
      especie?: string;
      tipo?: string;
      combustivel?: string;
      procedencia?: string;
    };
    [key: string]: unknown;
  };
  fipe: FIPEItem[];
  chassi: Record<string, unknown>;
  _raw?: Record<string, unknown>;
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
  destaque,
  cor,
}: {
  label: string;
  value: string;
  destaque?: boolean;
  cor?: string;
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
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: cor ?? (destaque ? "#e07b6a" : "#fff"), fontWeight: destaque ? 700 : 400 }}>
        {value}
      </span>
    </div>
  );
}

// ─── Badge de situação ────────────────────────────────────────────────────────
function SituacaoBadge({ situacao }: { situacao?: string }) {
  if (!situacao) return null;
  const ok = situacao.toUpperCase().includes("REGULAR") || situacao.toUpperCase().includes("ATIVO");
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 14px",
      background: ok ? "rgba(43,168,74,0.12)" : "rgba(192,57,43,0.12)",
      border: `1px solid ${ok ? "rgba(43,168,74,0.3)" : "rgba(192,57,43,0.3)"}`,
      marginBottom: 24,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: ok ? "#2BA84A" : "#c0392b" }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: ok ? "#2BA84A" : "#e07b6a", letterSpacing: "0.14em", textTransform: "uppercase" as const }}>
        {situacao}
      </span>
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
      setResultado(data);
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
  const ch = (v.chassi as VeiculoResult["veiculo"]["chassi"]) ?? (resultado?.chassi ?? {});

  return (
    <div>
      {/* ── Painel de busca ── */}
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
                textTransform: "uppercase",
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
              display: "flex",
              alignItems: "center",
              gap: 10,
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
              Consulta concluída · {v.placa ?? placa.replace(/[^A-Z0-9]/g, "")}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", marginLeft: "auto" }}>
              {new Date().toLocaleString("pt-BR")}
            </span>
          </div>

          {/* Situação */}
          {v.situacao && <SituacaoBadge situacao={v.situacao} />}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginBottom: 2 }}>
            {/* ── Dados do Veículo ── */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                Veículo · Identificação
              </div>
              <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 26, fontWeight: 400, color: "#fff", marginBottom: 24, lineHeight: 1.1 }}>
                {v.marca ?? "—"}<br />
                <em style={{ color: "#8a94a3", fontSize: 20 }}>{v.modelo ?? ""}</em>
              </h3>

              <DataRow label="Versão" value={String(v.versao ?? "—")} />
              <DataRow label="Ano Fabricação" value={String(v.anoFabricacao ?? "—")} />
              <DataRow label="Ano Modelo" value={String(v.anoModelo ?? "—")} />
              <DataRow label="Cor" value={String(v.cor ?? "—")} />
              <DataRow label="Combustível" value={String(v.combustivel ?? "—")} />
              <DataRow label="Município / UF" value={v.municipio && v.uf ? `${v.municipio} / ${v.uf}` : String(v.municipio ?? v.uf ?? "—")} />

              {/* Restrições */}
              {v.restricoes && v.restricoes.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#e07b6a", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 10 }}>
                    Restrições
                  </div>
                  {v.restricoes.map((r, i) => (
                    <div key={i} style={{ padding: "8px 12px", marginBottom: 4, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#e07b6a" }}>
                      ⚠ {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Chassi ── */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                Chassi · Especificações
              </div>
              <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 26, fontWeight: 400, color: "#fff", marginBottom: 24, lineHeight: 1.1 }}>
                Dados<br /><em style={{ color: "#8a94a3" }}>Técnicos</em>
              </h3>

              {/* Número do chassi em destaque */}
              {ch?.chassi && (
                <div style={{ padding: "14px 18px", background: "rgba(184,145,74,0.08)", border: "1px solid rgba(184,145,74,0.2)", marginBottom: 20 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.2em", textTransform: "uppercase" as const, marginBottom: 6 }}>Chassi</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#fff", letterSpacing: "0.08em", wordBreak: "break-all" as const }}>{ch.chassi}</div>
                </div>
              )}

              <DataRow label="Motor" value={String(ch?.motor ?? "—")} />
              <DataRow label="Potência" value={String(ch?.potencia ?? "—")} />
              <DataRow label="Cilindrada" value={String(ch?.cilindrada ?? "—")} />
              <DataRow label="Carroceria" value={String(ch?.carroceria ?? "—")} />
              <DataRow label="Espécie" value={String(ch?.especie ?? "—")} />
              <DataRow label="Tipo" value={String(ch?.tipo ?? "—")} />
              <DataRow label="Passageiros" value={String(ch?.capacidadePassageiros ?? "—")} />
              <DataRow label="Procedência" value={String(ch?.procedencia ?? "—")} />
              <DataRow label="Combustível" value={String(ch?.combustivel ?? "—")} />
            </div>
          </div>

          {/* ── Tabela FIPE ── */}
          {fipeList.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "36px 32px", marginTop: 2 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#B8914A", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
                FIPE · Tabela de Referência
              </div>
              <div style={{ overflowX: "auto" as const }}>
                <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                  <thead>
                    <tr>
                      {["Código FIPE", "Referência", "Marca", "Modelo", "Ano", "Combustível", "Valor"].map((h) => (
                        <th key={h} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.14em", textTransform: "uppercase" as const, textAlign: "left" as const, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fipeList.map((item, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#B8914A", padding: "11px 14px" }}>{item.CodigoFipe ?? "—"}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#7a8a9a", padding: "11px 14px" }}>{item.MesReferencia ?? "—"}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "11px 14px" }}>{item.Marca ?? "—"}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "11px 14px" }}>{item.Modelo ?? "—"}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "11px 14px" }}>{item.AnoModelo ?? "—"}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "11px 14px" }}>{item.SiglaCombustivel ?? item.Combustivel ?? "—"}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#2BA84A", fontWeight: 700, padding: "11px 14px" }}>{item.Valor ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: 2, padding: "16px 24px",
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
