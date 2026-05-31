import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaGravamePanel } from "@/components/busca-gravame-panel";

import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Restrições de Gravame — SNC",
  description:
    "Identifique gravames e restrições financeiras ativas de veículos pela placa, incluindo instituição financeira, contrato e data de inclusão.",
};

export default function BuscaGravamePage() {
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
        <section className="gravame-main-section">
          <div className="gravame-panel-inner">
            
            {/* Cabeçalho Compacto e Proporcional */}
            <div className="gravame-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 07 · VEÍCULOS · PLACA · LGPD ART. 7º III
              </div>
              <h1 className="gravame-title-compact">
                Restrição de <span className="slate" style={{ color: "#D4A843" }}>Gravame</span>
              </h1>
              <p className="gravame-desc-compact">
                Consulte gravames e restrições financeiras de veículos (identificação do agente financeiro, data de inclusão, número de contrato e situação de financiamento ativo) informando a placa.
              </p>
            </div>

            {/* Painel de Busca */}
            <BuscaGravamePanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .gravame-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .gravame-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .gravame-header-compact {
          margin-bottom: 36px;
        }
        .gravame-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .gravame-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .gravame-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .gravame-main-section {
            padding: 40px 16px 48px;
          }
          .gravame-title-compact {
            font-size: 28px;
          }
          .gravame-desc-compact {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .gravame-title-compact {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
