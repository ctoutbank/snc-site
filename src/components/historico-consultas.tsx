"use client";

import { useState, useEffect, useCallback } from "react";
import { gerarUrlRelatorio } from "@/lib/relatorio";
import { DatePickerFlat } from "@/components/ui/date-picker-flat";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ConsultaHistorico {
  id: string;
  placa: string;
  dataset: string;
  timestamp: string;
  dados: Record<string, unknown>;
}

const STORAGE_KEY = "snc_historico_consultas";
const MAX_HISTORICO = 100;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHistoricoConsultas(dataset: string) {
  const [historico, setHistorico] = useState<ConsultaHistorico[]>([]);

  // Carregar do localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const all = JSON.parse(raw) as ConsultaHistorico[];
        setHistorico(all.filter((h) => h.dataset === dataset));
      }
    } catch { /* ignore */ }
  }, [dataset]);

  // Salvar consulta
  const salvar = useCallback((placa: string, dados: Record<string, unknown>) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all = raw ? (JSON.parse(raw) as ConsultaHistorico[]) : [];

      const nova: ConsultaHistorico = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        placa,
        dataset,
        timestamp: new Date().toISOString(),
        dados,
      };

      // Remove duplicata da mesma placa/dataset
      const filtrado = all.filter((h) => !(h.placa === placa && h.dataset === dataset));
      const atualizado = [nova, ...filtrado].slice(0, MAX_HISTORICO);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizado));
      setHistorico(atualizado.filter((h) => h.dataset === dataset));
    } catch { /* ignore */ }
  }, [dataset]);

  // Limpar histórico
  const limpar = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all = raw ? (JSON.parse(raw) as ConsultaHistorico[]) : [];
      const filtrado = all.filter((h) => h.dataset !== dataset);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrado));
      setHistorico([]);
    } catch { /* ignore */ }
  }, [dataset]);

  return { historico, salvar, limpar };
}

// ─── Componente de tabela ─────────────────────────────────────────────────────

interface Props {
  historico: ConsultaHistorico[];
  onCarregar: (dados: Record<string, unknown>, placa: string) => void;
  onLimpar: () => void;
  corAccent?: string;
  scrollTargetId?: string;
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm} ${hh}:${mi}:${ss}`;
}

function formatarPlaca(p: string): string {
  if (p.length === 7) return `${p.slice(0, 3)}-${p.slice(3)}`;
  return p;
}

function obterMarcaModeloHistorico(h: ConsultaHistorico): string {
  const r = h.dados;
  if (!r) return "—";

  if (h.dataset === "leilao") {
    const dv = (r.dadosVeiculo ?? {}) as Record<string, unknown>;
    const mm = dv.marcaModelo ?? "—";
    return typeof mm === "string" ? mm.replace("/", " - ") : "—";
  }

  if (h.dataset === "vip-car") {
    const id = (r.identificacao ?? {}) as Record<string, unknown>;
    const mm = id.marcaModelo ?? "—";
    return typeof mm === "string" ? mm.replace("/", " - ") : "—";
  }

  if (h.dataset === "proprietario") {
    const p = (r.proprietario ?? {}) as Record<string, unknown>;
    const mm = p.marcaModelo ?? "—";
    return typeof mm === "string" ? mm.replace("/", " - ") : "—";
  }

  if (h.dataset === "veiculo") {
    const v = (r.veiculo ?? {}) as Record<string, unknown>;
    const marca = v.marca ?? "";
    const modelo = v.modelo ?? "";
    if (marca || modelo) {
      return `${marca} - ${modelo}`.trim();
    }
    return "—";
  }

  // Fallback genérico para outros datasets veiculares
  const v = (r.veiculo ?? r.dadosVeiculo ?? r.identificacao ?? r.dados ?? r) as Record<string, unknown>;
  if (v && typeof v === "object") {
    const marca = String(v.marca ?? v.marcaModelo ?? v.marca_modelo ?? v.modelo ?? "");
    const modelo = String(v.modelo ?? v.marcaModelo ?? v.marca_modelo ?? "");
    if (marca || modelo) {
      if (marca === modelo) return marca.replace("/", " - ").toUpperCase();
      return `${marca} - ${modelo}`.replace(/\//g, " - ").toUpperCase().trim();
    }
  }

  return "—";
}

export function HistoricoConsultas({ historico, onCarregar, onLimpar, corAccent = "#D4A843", scrollTargetId }: Props) {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);

  if (historico.length === 0) return null;

  const handleCarregar = (dados: Record<string, unknown>, placa: string) => {
    onCarregar(dados, placa);
    // Scroll to result
    setTimeout(() => {
      const target = scrollTargetId ? document.getElementById(scrollTargetId) : null;
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  const filteredHistorico = historico.filter(h => {
    const cleanSearch = searchQuery.toLowerCase().replace(/[^a-z0-9 ]/g, "");
    const mm = obterMarcaModeloHistorico(h);
    const searchTarget = `${h.placa} ${mm}`.toLowerCase().replace(/[^a-z0-9 ]/g, "");
    const matchSearch = searchTarget.includes(cleanSearch);

    let matchDate = true;
    if (searchDate) {
      const recordDate = new Date(h.timestamp);
      recordDate.setHours(0, 0, 0, 0);

      const filterDate = new Date(searchDate);
      filterDate.setHours(0, 0, 0, 0);

      matchDate = recordDate.getTime() === filterDate.getTime();
    }

    return matchSearch && matchDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredHistorico.length / itemsPerPage));
  // Ensure current page is valid when filtering
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedHistorico = filteredHistorico.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 12,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          color: corAccent, letterSpacing: "0.22em", textTransform: "uppercase" as const,
        }}>
          Histórico de Consultas · {historico.length}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Pesquisar Placa, Marca ou Modelo"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: 1, minWidth: 200, background: "rgba(255,255,255,0.03)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)", padding: "8px 12px",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, outline: "none",
            letterSpacing: "0.08em", transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = corAccent}
          onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
        />
        <DatePickerFlat 
          date={searchDate} 
          setDate={(d) => {
            setSearchDate(d);
            setCurrentPage(1);
          }}
          corAccent={corAccent}
          className="mobile-full-width"
        />
      </div>

      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
        {/* Header — hidden on mobile */}
        <div className="hist-header" style={{
          display: "grid", gridTemplateColumns: "0.4fr 1.5fr 1fr 2.2fr 1.2fr 1.4fr",
          padding: "10px 16px", gap: 12,
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          color: "#8a94a3", letterSpacing: "0.12em", textTransform: "uppercase" as const,
        }}>
          <span style={{ textAlign: "center" }}>#</span>
          <span style={{ textAlign: "center" }}>Data/Hora</span>
          <span style={{ textAlign: "center" }}>Placa</span>
          <span style={{ textAlign: "center" }}>Marca / Modelo</span>
          <span style={{ textAlign: "center" }}>Ação</span>
          <span style={{ textAlign: "center" }}>Relatório</span>
        </div>

        {/* Rows */}
        {paginatedHistorico.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#8a94a3", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            Nenhum registro encontrado.
          </div>
        ) : paginatedHistorico.map((h, i) => (
          <div
            key={h.id}
            className="hist-row"
            style={{
              display: "grid", gridTemplateColumns: "0.4fr 1.5fr 1fr 2.2fr 1.2fr 1.4fr",
              padding: "10px 16px", gap: 12, alignItems: "center",
              borderBottom: i < paginatedHistorico.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
            }}
          >
            {/* Wrapper de dados para Mobile (usa display: contents no Desktop) */}
            <div className="hist-data">
              {/* 1. # */}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#ffffff", textAlign: "center" }}>
                {String(startIndex + i + 1).padStart(2, "0")}
              </span>

              {/* 2. Data/Hora */}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#ffffff", textAlign: "center" }}>
                {formatarData(h.timestamp)}
              </span>

              {/* 3. Placa */}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#ffffff", letterSpacing: "0.08em", textAlign: "center" }}>
                {formatarPlaca(h.placa)}
              </span>

              {/* 4. Marca / Modelo */}
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#ffffff",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "center"
              }} title={obterMarcaModeloHistorico(h)}>
                {obterMarcaModeloHistorico(h)}
              </span>
            </div>
            {/* Wrapper de ações para Mobile (usa display: contents no Desktop) */}
            <div className="hist-actions">
              {/* 5. Ação (Botão Carregar) - Centralizado */}
              <span style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={async () => handleCarregar(h.dados, h.placa)}
                  className="hist-btn"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                    color: corAccent, background: `${corAccent}15`,
                    border: `1px solid ${corAccent}40`, padding: "6px 12px",
                    cursor: "pointer", letterSpacing: "0.08em",
                    textTransform: "uppercase" as const, textAlign: "center",
                    transition: "all 0.15s",
                    width: "100px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${corAccent}35`;
                    e.currentTarget.style.borderColor = corAccent;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${corAccent}15`;
                    e.currentTarget.style.borderColor = `${corAccent}40`;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  ↑ Carregar
                </button>
              </span>

              {/* 6. Relatório (Botão Ver Relatório) - Centralizado */}
              <span style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={async () => {
                    const { url } = await gerarUrlRelatorio(h.dataset as any, h.placa, h.dataset === "credito" ? "DOCUMENTO" : "PLACA", h.dados);
                    window.open(url, "_blank");
                  }}
                  className="hist-btn"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                    color: "#cfd6df", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px",
                    cursor: "pointer", letterSpacing: "0.08em",
                    textTransform: "uppercase" as const, textAlign: "center",
                    transition: "all 0.15s",
                    width: "100px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Relatório
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Controls (Items per page & Pagination) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32, marginTop: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3", textTransform: "uppercase" as const }}>Itens por página:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              background: "rgba(255,255,255,0.03)", color: "#cfd6df",
              border: "1px solid rgba(255,255,255,0.1)", padding: "6px 8px",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, outline: "none", cursor: "pointer"
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {safeCurrentPage > 1 && (
              <button
                onClick={async () => setCurrentPage(p => Math.max(1, p - 1))}
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cfd6df", padding: "6px 14px",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Anterior
              </button>
            )}
            
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#8a94a3" }}>
              Página <span style={{ color: "#fff" }}>{safeCurrentPage}</span> de {totalPages}
            </span>
            
            <button
              onClick={async () => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: safeCurrentPage === totalPages ? "rgba(255,255,255,0.2)" : "#cfd6df", padding: "6px 14px",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, cursor: safeCurrentPage === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      <style>{`
          .hist-data { display: contents; }
          .hist-actions { display: contents; }
          @media (max-width: 768px) {
            .hist-header { display: none !important; }
            .hist-row {
              display: grid !important;
              grid-template-columns: 1fr auto !important;
              gap: 16px !important;
              padding: 16px !important;
              align-items: center !important;
              border-radius: 8px;
              background: rgba(255,255,255,0.02) !important;
              border: 1px solid rgba(255,255,255,0.05) !important;
              margin-bottom: 12px;
            }
            .hist-data {
              display: flex !important;
              flex-direction: column !important;
              gap: 8px !important;
            }
            .hist-data > span {
              width: 100% !important;
              text-align: left !important;
            }
            .hist-actions {
              display: flex !important;
              flex-direction: column !important;
              gap: 8px !important;
              align-items: flex-end !important;
            }
            .hist-actions > span {
              display: flex !important;
              justify-content: flex-end !important;
            }
            .hist-btn {
              width: auto !important;
              padding: 8px 16px !important;
              margin: 0 !important;
            }
        }
      `}</style>
    </div>
  );
}
