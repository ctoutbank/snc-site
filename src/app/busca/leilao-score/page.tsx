import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaLeilaoScorePanel } from "@/components/busca-leilao-score-panel";

export const metadata: Metadata = {
  title: "Leilão com Score — SNC",
  description:
    "Score de risco, indício de sinistro, dados do veículo, histórico de leilões e checklist de avarias pela placa.",
};

export default function BuscaLeilaoScorePage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        {/* ── Hero ── */}
        <section className="snc-hero snc-hero-geo" style={{ minHeight: "auto" }}>
          <div className="snc-hero-inner" style={{ paddingBottom: 0 }}>
            <div className="snc-hero-meta">
              <div className="l">
                <span>
                  <span className="snc-mono" style={{ color: "var(--snc-brass)", fontSize: 10 }}>DATASET</span>
                  &nbsp;LEILÃO COM SCORE · VEÍCULOS · PLACA
                </span>
                <span>Consulta em tempo real</span>
              </div>
              <div className="snc-mono" style={{ fontSize: 10, color: "#3a4a5a" }}>
                LGPD · ART. 7º III
              </div>
            </div>

            <div className="leilao-hero-content">
              <div className="snc-mono" style={{ fontSize: 11, color: "var(--snc-brass)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
                05 · Veículos
              </div>
              <h1 className="leilao-hero-title">
                Leilão{" "}
                <span style={{ fontStyle: "italic", color: "#bcc4d1" }}>com </span>
                <span style={{ color: "#D4A843" }}>Score</span>
              </h1>
              <p className="leilao-hero-desc">
                Score de risco (pontuação A–E, aceitação, % sobre FIPE), indício de sinistro,
                dados do veículo (marca, chassi, RENAVAM, motor, câmbio, km, eixos),
                histórico de leilões e checklist de avarias.
              </p>
            </div>
          </div>
        </section>

        {/* ── Painel ── */}
        <section className="leilao-panel-section">
          <div className="leilao-panel-inner">
            <div className="leilao-stats-grid">
              {[
                { num: "100", label: "Score Máximo" },
                { num: "Leilão", label: "Histórico Completo" },
                { num: "2", label: "Formatos de Placa" },
                { num: "Real-time", label: "Atualização" },
              ].map(({ num, label }) => (
                <div key={label} className="leilao-stat-item">
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, color: "#D4A843", lineHeight: 1, marginBottom: 6 }}>
                    {num}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <BuscaLeilaoScorePanel />
          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .leilao-hero-content {
          max-width: 760px;
          padding-bottom: 60px;
        }
        .leilao-hero-title {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: clamp(48px, 7vw, 96px);
          line-height: 0.95;
          letter-spacing: -0.025em;
          color: #fff;
          margin-bottom: 24px;
          white-space: nowrap;
        }
        .leilao-hero-desc {
          font-size: 16px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 540px;
        }
        .leilao-panel-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 0 28px 80px;
        }
        .leilao-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding-top: 48px;
        }
        .leilao-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          margin-bottom: 36px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .leilao-stat-item {
          padding: 20px 24px;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .leilao-stat-item:last-child {
          border-right: none;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .leilao-hero-content {
            padding-bottom: 36px;
          }
          .leilao-hero-title {
            font-size: clamp(36px, 10vw, 56px);
            white-space: normal;
          }
          .leilao-hero-desc {
            font-size: 14px;
          }
          .leilao-panel-section {
            padding: 0 16px 48px;
          }
          .leilao-panel-inner {
            padding-top: 28px;
          }
          .leilao-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            margin-bottom: 24px;
          }
          .leilao-stat-item {
            padding: 14px 16px;
          }
          .leilao-stat-item:nth-child(2) {
            border-right: none;
          }
        }

        @media (max-width: 480px) {
          .leilao-hero-title {
            font-size: 32px;
          }
          .leilao-stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .leilao-stat-item {
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
}
