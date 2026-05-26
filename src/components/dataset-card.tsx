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
      style={{
        background: ativo ? corBg : "rgba(255,255,255,0.02)",
        border: `1px solid ${ativo ? corBorder : "rgba(255,255,255,0.06)"}`,
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "all 0.2s ease",
        cursor: ativo ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!ativo) return;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = cor;
      }}
      onMouseLeave={(e) => {
        if (!ativo) return;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = corBorder;
      }}
    >
      {/* Número + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <span style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 48, color: ativo ? cor : "#2a3a4a", lineHeight: 1, fontWeight: 400 }}>
          {id}
        </span>
        <div style={{
          padding: "4px 10px",
          background: ativo ? `${cor}22` : "rgba(255,255,255,0.04)",
          border: `1px solid ${ativo ? `${cor}55` : "rgba(255,255,255,0.08)"}`,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: ativo ? cor : "#3a4a5a" }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: ativo ? cor : "#3a4a5a", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            {ativo ? "Ativo" : "Em breve"}
          </span>
        </div>
      </div>

      {/* Título */}
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 22, fontWeight: 400, color: ativo ? "#fff" : "#4a5a6a", lineHeight: 1.2, margin: 0 }}>
          {titulo}
        </h2>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: ativo ? cor : "#3a4a5a", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 6 }}>
          {subtitulo}
        </div>
      </div>

      {/* Descrição */}
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: ativo ? "#8a94a3" : "#3a4a5a", lineHeight: 1.6, marginTop: 16, marginBottom: 20 }}>
        {descricao}
      </p>

      {/* Campos */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {campos.map((c) => (
          <span key={c} style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            color: ativo ? cor : "#3a4a5a",
            padding: "3px 8px",
            border: `1px solid ${ativo ? `${cor}44` : "rgba(255,255,255,0.05)"}`,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            {c}
          </span>
        ))}
      </div>

      {/* Footer do card */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 20, borderTop: `1px solid ${ativo ? corBorder : "rgba(255,255,255,0.04)"}` }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4a5a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>Fonte</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: ativo ? "#7a8a9a" : "#3a4a5a" }}>{fonte}</div>
        </div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#3a4a5a", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>Input</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: ativo ? cor : "#3a4a5a" }}>{tipo}</div>
        </div>
        {ativo && (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: cor, letterSpacing: "0.12em" }}>
            Consultar →
          </div>
        )}
      </div>
    </div>
  );

  return ativo ? <Link href={href} style={{ textDecoration: "none", display: "block" }}>{inner}</Link> : inner;
}
