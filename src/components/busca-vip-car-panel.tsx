"use client";

import { useState, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { useHistoricoConsultas, HistoricoConsultas } from "@/components/historico-consultas";

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

// ─── Bloco de seção ────────────────────────────────────────────────────────────
function Bloco({ titulo, cor = "#7B5EA7", children }: {
  titulo: string; cor?: string; children: React.ReactNode;
}) {
  return (
    <div style={{
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
    <div style={{
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

// ─── Componente Principal ──────────────────────────────────────────────────────
export function BuscaVipCarPanel() {
  const [placa, setPlaca]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState<string | null>(null);
  const [resultado, setResultado] = useState<VipCarResult | null>(null);
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
              id="vip-car-placa-input"
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
              onFocus={(e) => (e.target.style.borderColor = "#7B5EA7")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>
          <button
            id="vip-car-consultar-btn"
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: "18px 36px", background: loading ? "rgba(123,94,167,0.4)" : "#7B5EA7",
              color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
              letterSpacing: "0.12em", textTransform: "uppercase" as const, fontWeight: 700,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s", whiteSpace: "nowrap" as const,
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
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
      {r && (
        <div id="vip-car-resultado" style={{ animation: "fadeUp 0.4s ease" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7B5EA7", boxShadow: "0 0 0 3px rgba(123,94,167,0.25)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#7B5EA7", letterSpacing: "0.18em", textTransform: "uppercase" as const }}>
              Relatório VIP · {placa}
            </span>
            {r.pdf ? (
              <a href={r.pdf} target="_blank" rel="noopener noreferrer"
                style={{ marginLeft: "auto", padding: "6px 14px", background: "rgba(123,94,167,0.15)", border: "1px solid rgba(123,94,167,0.35)", color: "#7B5EA7", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textDecoration: "none" }}>
                ↓ PDF
              </a>
            ) : (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a", marginLeft: "auto" }}>
                {new Date().toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          {/* Linha 1: Identificação + Roubo/Furto */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2, marginBottom: 2 }}>
            {/* Identificação */}
            <Bloco titulo="Identificação do Veículo" cor="#7B5EA7">
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
                    <div style={{ marginTop: 16, padding: "8px 12px", background: "rgba(43,168,74,0.07)", border: "1px solid rgba(43,168,74,0.2)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#2BA84A" }}>
                      ✓ {r.identificacao.statusDescricao}
                    </div>
                  )}
                </>
              ) : (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Dados não disponíveis</span>
              )}
            </Bloco>

            {/* Roubo / Furto */}
            <Bloco titulo="Roubo · Furto" cor="#e07b6a">
              {r.rouboFurto ? (
                <>
                  <IndicadorBool label="Declaração de Roubo/Furto" valor={r.rouboFurto.declaracao} />
                  <IndicadorBool label="Devolução Registrada"       valor={r.rouboFurto.devolucao} />
                  <IndicadorBool label="Recuperação Registrada"     valor={r.rouboFurto.recuperacao} />
                </>
              ) : (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#3a4a5a" }}>Sem ocorrências</span>
              )}
            </Bloco>
          </div>

          {/* Precificador FIPE */}
          {r.precificador.length > 0 && (
            <div style={{ marginBottom: 2 }}>
              <Bloco titulo="Precificador · FIPE" cor="#2BA84A">
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
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#B8914A", padding: "10px 12px" }}>{item.codigo}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px" }}>{item.fabricanteModelo}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{item.anoModelo}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{item.informante}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#2BA84A", fontWeight: 700, padding: "10px 12px" }}>{item.preco}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Bloco>
            </div>
          )}

          {/* RENAINF */}
          <div style={{ marginBottom: 2 }}>
            <Bloco titulo={`RENAINF · Infrações de Trânsito (${r.renainf.total})`} cor="#e07b39">
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
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#e07b39", padding: "10px 12px" }}>{inf.auto}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{inf.dataHora}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#B8914A", padding: "10px 12px" }}>{inf.codigo}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#cfd6df", padding: "10px 12px", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{inf.descricao}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#8a94a3", padding: "10px 12px" }}>{inf.orgao}</td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e07b39", fontWeight: 700, padding: "10px 12px" }}>{inf.valor}</td>
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
          </div>

          {/* Botão Gerar Relatório */}
          <div style={{ marginTop: 2, padding: "20px 0", display: "flex", justifyContent: "flex-end" }}>
            <button
              id="vip-car-gerar-relatorio-btn"
              onClick={() => {
                const { url } = gerarUrlRelatorio(
                  "vip-car",
                  placa,
                  "PLACA",
                  r as unknown as Record<string, unknown>
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

      {/* ── Histórico de Consultas ── */}
      <HistoricoConsultas
        historico={historico}
        onCarregar={(dados, p) => {
          setPlaca(p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p);
          setResultado(dados as unknown as VipCarResult);
          setErro(null);
        }}
        onLimpar={limpar}
        corAccent="#7B5EA7"
      />

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 900px) {
          #vip-car-resultado > div:nth-child(3) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
