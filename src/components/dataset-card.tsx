"use client";

import Link from "next/link";

const ACCENT_CSS = `
  .ds-card {
    border-top: 3px solid #17243b !important; /* Navi */
    background: rgba(10, 22, 40, 0.45) !important; /* Navi */
    border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-left: 1px solid rgba(255, 255, 255, 0.05) !important;
    transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease !important;
  }
  .ds-card.ds-card-breve {
    border-top: 3px solid rgba(255, 255, 255, 0.04) !important;
    background: rgba(255, 255, 255, 0.01) !important;
  }
  .ds-card .card-num {
    color: #2a3a4a !important; /* Muted */
    transition: color 0.18s ease !important;
  }
  .ds-card.ds-card-ativo .card-num {
    color: #5a6a7a !important; /* Navi active number */
  }
  .ds-card .card-tag {
    color: #4a5a6a !important;
    border-color: rgba(255, 255, 255, 0.05) !important;
    background: transparent !important;
    transition: all 0.18s ease !important;
  }
  .ds-card.ds-card-ativo .card-tag {
    color: #7a8a9a !important;
    border-color: rgba(255, 255, 255, 0.08) !important;
    background: rgba(255, 255, 255, 0.02) !important;
  }
  .ds-card .card-status-dot {
    background: #3a4a5a !important;
    box-shadow: none !important;
    transition: all 0.18s ease !important;
  }
  .ds-card.ds-card-ativo .card-status-dot {
    background: #5a6a7a !important;
  }
  .ds-card .card-status-text {
    color: #3a4a5a !important;
    transition: all 0.18s ease !important;
  }
  .ds-card.ds-card-ativo .card-status-text {
    color: #7a8a9a !important;
  }
  .ds-card .card-status-box {
    border-color: rgba(255, 255, 255, 0.08) !important;
    background: rgba(255, 255, 255, 0.02) !important;
    transition: all 0.18s ease !important;
  }
  .ds-card.ds-card-ativo .card-status-box {
    border-color: rgba(255, 255, 255, 0.12) !important;
    background: rgba(255, 255, 255, 0.04) !important;
  }
  .ds-card .card-action {
    color: #3a4a5a !important;
    transition: color 0.18s ease !important;
  }
  .ds-card.ds-card-ativo .card-action {
    color: #5a6a7a !important;
  }
  .ds-card .card-sub {
    color: #3a4a5a !important;
    transition: color 0.18s ease !important;
  }
  .ds-card.ds-card-ativo .card-sub {
    color: #7a8a9a !important;
  }
  .ds-card .card-input-val {
    color: #3a4a5a !important;
    transition: color 0.18s ease !important;
  }
  .ds-card.ds-card-ativo .card-input-val {
    color: #7a8a9a !important;
  }

  /* Hover com Âmbar */
  .ds-card.ds-card-ativo:hover {
    transform: translateY(-3px) !important;
    border-color: #D4A843 !important; /* Amber border */
    border-top-color: #D4A843 !important; /* Amber top border */
    box-shadow: 0 8px 32px rgba(212, 168, 67, 0.15) !important;
  }
  .ds-card.ds-card-ativo:hover .card-num {
    color: #D4A843 !important; /* Amber number */
  }
  .ds-card.ds-card-ativo:hover .card-tag {
    color: #D4A843 !important; /* Amber tags */
    border-color: rgba(212, 168, 67, 0.3) !important;
    background: rgba(212, 168, 67, 0.06) !important;
  }
  .ds-card.ds-card-ativo:hover .card-status-dot {
    background: #D4A843 !important;
    box-shadow: 0 0 0 3px rgba(212, 168, 67, 0.2) !important;
  }
  .ds-card.ds-card-ativo:hover .card-status-text {
    color: #D4A843 !important;
  }
  .ds-card.ds-card-ativo:hover .card-status-box {
    border-color: rgba(212, 168, 67, 0.3) !important;
    background: rgba(212, 168, 67, 0.06) !important;
  }
  .ds-card.ds-card-ativo:hover .card-action {
    color: #D4A843 !important; /* Amber action button */
  }
  .ds-card.ds-card-ativo:hover .card-sub {
    color: #D4A843 !important;
  }
  .ds-card.ds-card-ativo:hover .card-input-val {
    color: #D4A843 !important;
  }
`;

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
      className={`ds-card ${ativo ? "ds-card-ativo" : "ds-card-breve"}`}
      style={{
        padding: "28px 28px 24px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        cursor: ativo ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: ACCENT_CSS }} />

      {/* Número + Status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <span className="card-num" style={{
          fontFamily: "'Libre Caslon Text', serif",
          fontSize: 48,
          lineHeight: 1,
          fontWeight: 400,
        }}>
          {id}
        </span>
        <div className="card-status-box" style={{
          padding: "4px 10px",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div className="card-status-dot" style={{
            width: 5, height: 5,
            borderRadius: "50%",
          }} />
          <span className="card-status-text" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
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
        <div className="card-sub" style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
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
          <span key={c} className="card-tag" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            padding: "3px 8px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
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
        borderTop: "1px solid rgba(255,255,255,0.04)",
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
          <div className="card-input-val" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>
            {tipo}
          </div>
        </div>
        {ativo && (
          <div className="card-action" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
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
