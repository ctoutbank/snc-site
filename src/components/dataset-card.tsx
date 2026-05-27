"use client";

import Link from "next/link";

interface DatasetCardProps {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  campos: readonly string[];
  status: "ativo" | "breve";
  href: string;
  cor: string;
  corBg: string;
  corBorder: string;
  fonte: string;
  tipo: string;
}

export function DatasetCard({
  id,
  titulo,
  subtitulo,
  descricao,
  campos,
  status,
  href,
  cor,
  corBg,
  corBorder,
  fonte,
  tipo,
}: DatasetCardProps) {
  const ativo = status === "ativo";

  const inner = (
    <div
      id={`dataset-card-${id}`}
      className="ds-card"
      style={{
        /* barra de acento no topo — detalhe diferencial por dataset */
        borderTop: `3px solid ${ativo ? cor : "rgba(255,255,255,0.08)"}`,
        background: ativo ? corBg : "rgba(255,255,255,0.02)",
        borderRight: `1px solid ${ativo ? corBorder : "rgba(255,255,255,0.06)"}`,
        borderBottom: `1px solid ${ativo ? corBorder : "rgba(255,255,255,0.06)"}`,
        borderLeft: `1px solid ${ativo ? corBorder : "rgba(255,255,255,0.06)"}`,
        padding: "28px 28px 24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
        cursor: ativo ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!ativo) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-3px)";
        el.style.borderRightColor = cor;
        el.style.borderBottomColor = cor;
        el.style.borderLeftColor = cor;
        el.style.boxShadow = `0 8px 32px ${cor}22`;
      }}
      onMouseLeave={(e) => {
        if (!ativo) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.borderRightColor = corBorder;
        el.style.borderBottomColor = corBorder;
        el.style.borderLeftColor = corBorder;
        el.style.boxShadow = "none";
      }}
    >
      {/* Número + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <span style={{
          fontFamily: "'Libre Caslon Text', serif",
          fontSize: 48,
          color: ativo ? cor : "#2a3a4a",
          lineHeight: 1,
          fontWeight: 400,
        }}>
          {id}
        </span>
        <div style={{
          padding: "4px 10px",
          background: ativo ? `${cor}22` : "rgba(255,255,255,0.04)",
          border: `1px solid ${ativo ? `${cor}55` : "rgba(255,255,255,0.08)"}`,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{
            width: 5, height: 5,
            borderRadius: "50%",
            background: ativo ? cor : "#3a4a5a",
            /* glow no dot quando ativo */
            boxShadow: ativo ? `0 0 0 3px ${cor}33` : "none",
          }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: ativo ? cor : "#3a4a5a",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}>
            {ativo ? "Ativo" : "Em breve"}
          </span>
        </div>
      </div>

      {/* Título + Subtítulo */}
      <div style={{ marginBottom: 0 }}>
        <h2 style={{
          fontFamily: "'Libre Caslon Text', serif",
          fontSize: 22, fontWeight: 400,
          color: ativo ? "#fff" : "#4a5a6a",
          lineHeight: 1.2, margin: 0,
        }}>
          {titulo}
        </h2>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: ativo ? cor : "#3a4a5a",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          marginTop: 6,
        }}>
          {subtitulo}
        </div>
      </div>

      {/* Descrição */}
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        color: ativo ? "#8a94a3" : "#3a4a5a",
        lineHeight: 1.6,
        marginTop: 16, marginBottom: 20,
      }}>
        {descricao}
      </p>

      {/* Tags de campos */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {campos.map((c) => (
          <span key={c} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: ativo ? cor : "#3a4a5a",
            padding: "3px 8px",
            border: `1px solid ${ativo ? `${cor}44` : "rgba(255,255,255,0.05)"}`,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: ativo ? `${cor}0d` : "transparent",
          }}>
            {c}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
        paddingTop: 20,
        borderTop: `1px solid ${ativo ? corBorder : "rgba(255,255,255,0.04)"}`,
      }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4a5a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
            Fonte
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: ativo ? "#7a8a9a" : "#3a4a5a" }}>
            {fonte}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4a5a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>
            Input
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: ativo ? cor : "#3a4a5a" }}>
            {tipo}
          </div>
        </div>
        {ativo && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: cor,
            letterSpacing: "0.12em",
          }}>
            Consultar →
          </div>
        )}
      </div>
    </div>
  );

  return ativo
    ? <Link href={href} style={{ textDecoration: "none", display: "flex", height: "100%", width: "100%" }}>{inner}</Link>
    : inner;
}
