import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaLeilaoScorePanel } from "@/components/busca-leilao-score-panel";

import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Leilão Veicular + Score — SNC",
  description:
    "Score de risco, indício de sinistro, dados do veículo, histórico de leilões e checklist de avarias pela placa.",
};

export default function BuscaLeilaoScorePage() {
  return (
    <div className="snc-root">
      <SiteNav />
      
      {/* ── Barra de Navegação Secundária (Action Bar) ── */}
      <div style={{
        background: "#0A1628",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          padding: "12px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <BackButton fallback="/autoscore" />
          <div style={{ display: "flex", gap: 8 }}>
            {/* Espaço para futuros botões */}
          </div>
        </div>
      </div>

      <main>
        {/* ── Seção Única Integrada (Cabeçalho Compacto + Busca) ── */}
        <section className="leilao-main-section">
          <div className="leilao-panel-inner">
            
            {/* Cabeçalho Compacto e Proporcional */}
            <div className="leilao-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 02 · VEÍCULOS · PLACA · LGPD ART. 7º III
              </div>
              <h1 className="leilao-title-compact">
                Leilão Veicular <span className="gold">+ Score</span>
              </h1>
              <p className="leilao-desc-compact">
                Consulte em tempo real o score de risco (pontuação A–E), indício de sinistro, dados completos do veículo (chassi, motor, eixos, km), histórico detalhado de leilões e checklist de avarias através da placa.
              </p>
            </div>

            {/* Painel de Busca - Colocado perfeitamente no topo para uso imediato */}
            <BuscaLeilaoScorePanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .leilao-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .leilao-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #8a94a3;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
          text-decoration: none;
          margin-bottom: 20px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #fff;
        }
        .leilao-header-compact {
          margin-bottom: 36px;
        }
        .leilao-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .leilao-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .leilao-title-compact .it {
          font-style: italic;
          color: #bcc4d1;
        }
        .leilao-title-compact .gold {
          color: var(--ds-05);
        }
        .leilao-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .leilao-main-section {
            padding: 40px 16px 48px;
          }
          .leilao-title-compact {
            font-size: 28px;
          }
          .leilao-desc-compact {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .leilao-title-compact {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
