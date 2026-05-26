"use client";

import { useState, useCallback } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ProprietarioData {
  nome?: string | null;
  cpfCnpj?: string | null;
  municipio?: string | null;
  uf?: string | null;
  dataAquisicao?: string | null;
  renavam?: string | null;
  placa?: string | null;
  situacao?: string | null;
  restricoes?: string[];
}

interface ConsultaResult {
  proprietario: ProprietarioData;
  _raw?: Record<string, unknown>;
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
  return doc;
}

// ─── Linha de dado ─────────────────────────────────────────────────────────────
function DataRow({ label, value, destaque }: { label: string; value: string; destaque?: boolean }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      padding: "13px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
      gap: 16, alignItems: "center",
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
        {label}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: destaque ? "#e07b6a" : "#fff", fontWeight: destaque ? 700 : 400 }}>
        {value}
      </span>
    </div>
  );
}

// ─── Avatar inicial ────────────────────────────────────────────────────────────
function Avatar({ nome }: { nome?: string | null }) {
  const inicial = nome?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <div style={{
      width: 72, height: 72, borderRadius: "50%",
      background: "rgba(74,138,184,0.15)",
      border: "2px solid rgba(74,138,184,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Libre Caslon Text', serif", fontSize: 32, color: "#4A8AB8",
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

  const p = resultado?.proprietario ?? {};
  const temDados = p.nome || p.cpfCnpj || p.municipio;

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
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", marginLeft: "auto" }}>
              {new Date().toLocaleString("pt-BR")}
            </span>
          </div>

          {/* Card do proprietário */}
          <div style={{ background: "rgba(74,138,184,0.05)", border: "1px solid rgba(74,138,184,0.2)", padding: "36px 32px", marginBottom: 2 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#4A8AB8", letterSpacing: "0.22em", textTransform: "uppercase" as const, marginBottom: 20 }}>
              Proprietário · Atual
            </div>

            {temDados ? (
              <>
                {/* Nome em destaque */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
                  <Avatar nome={p.nome} />
                  <div>
                    <h3 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 28, fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: 0 }}>
                      {p.nome ?? "Nome não disponível"}
                    </h3>
                    {p.cpfCnpj && (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#4A8AB8", marginTop: 6, letterSpacing: "0.1em" }}>
                        {mascaraDoc(p.cpfCnpj)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dados */}
                <DataRow label="Município" value={p.municipio ?? "—"} />
                <DataRow label="UF" value={p.uf ?? "—"} />
                <DataRow label="Data de Aquisição" value={p.dataAquisicao ?? "—"} />
                <DataRow label="RENAVAM" value={p.renavam ?? "—"} />
                <DataRow label="Situação" value={p.situacao ?? "—"} />

                {/* Restrições */}
                {p.restricoes && p.restricoes.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#e07b6a", letterSpacing: "0.18em", textTransform: "uppercase" as const, marginBottom: 10 }}>
                      Restrições
                    </div>
                    {p.restricoes.map((r, i) => (
                      <div key={i} style={{ padding: "8px 12px", marginBottom: 4, background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#e07b6a" }}>
                        ⚠ {r}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Sem dados mapeados — aguardando mapeamento de campos via _raw */
              <div style={{ padding: "32px", textAlign: "center" as const }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5a6a7a", lineHeight: 1.8 }}>
                  Consulta retornou 200. Campos sendo mapeados.<br />
                  Verifique <strong style={{ color: "#4A8AB8" }}>_raw</strong> no DevTools → Network para ver a estrutura real.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: "16px 24px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: 24,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: "#3a4a5a", letterSpacing: "0.1em", textTransform: "uppercase" as const,
          }}>
            <span>Fonte: APIBrasil · Proprietário Atual</span>
            <span>·</span>
            <span>LGPD Art. 7º, III</span>
            <span style={{ marginLeft: "auto" }}>SNC — Sistema Nacional de Conformidade</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
