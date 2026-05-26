"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ConsultaHistorico {
  id: string;
  placa: string;
  dataset: string;
  timestamp: string;
  dados: Record<string, unknown>;
}

const STORAGE_KEY = "snc_historico_consultas";
const MAX_HISTORICO = 20;

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

export function HistoricoConsultas({ historico, onCarregar, onLimpar, corAccent = "#D4A843" }: Props) {
  if (historico.length === 0) return null;

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
        <button
          onClick={onLimpar}
          style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            color: "#5a6a7a", background: "none", border: "1px solid rgba(255,255,255,0.1)",
            padding: "4px 10px", cursor: "pointer", letterSpacing: "0.08em",
            textTransform: "uppercase" as const,
          }}
        >
          Limpar
        </button>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "60px 100px 1fr 100px",
          padding: "10px 16px", gap: 12,
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          color: "#5a6a7a", letterSpacing: "0.1em", textTransform: "uppercase" as const,
        }}>
          <span>#</span>
          <span>Placa</span>
          <span>Data/Hora</span>
          <span style={{ textAlign: "right" }}>Ação</span>
        </div>

        {/* Rows */}
        {historico.map((h, i) => (
          <div
            key={h.id}
            style={{
              display: "grid", gridTemplateColumns: "60px 100px 1fr 100px",
              padding: "10px 16px", gap: 12, alignItems: "center",
              borderBottom: i < historico.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
            }}
          >
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#3a4a5a" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#e0e6ef", letterSpacing: "0.08em" }}>
              {formatarPlaca(h.placa)}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#5a6a7a" }}>
              {formatarData(h.timestamp)}
            </span>
            <button
              onClick={() => onCarregar(h.dados, h.placa)}
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                color: corAccent, background: `${corAccent}15`,
                border: `1px solid ${corAccent}40`, padding: "4px 10px",
                cursor: "pointer", letterSpacing: "0.08em",
                textTransform: "uppercase" as const, textAlign: "center",
              }}
            >
              Carregar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
