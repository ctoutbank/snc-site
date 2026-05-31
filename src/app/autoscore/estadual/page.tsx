import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaEstadualPanel } from "@/components/busca-estadual-panel";

import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Base Estadual Detran — SNC",
  description:
    "Consulte dados cadastrais primários, restrições ativas e débitos locais diretamente da base do DETRAN do estado de registro do veículo.",
};

export default function BuscaEstadualPage() {
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
        <section className="estadual-main-section">
          <div className="estadual-panel-inner">
            
            {/* Cabeçalho Compacto e Proporcional */}
            <div className="estadual-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 09 · VEÍCULOS · PLACA · LGPD ART. 7º III
              </div>
              <h1 className="estadual-title-compact">
                Base Estadual <span className="gold">Detran</span>
              </h1>
              <p className="estadual-desc-compact">
                Consulte dados cadastrais primários, restrições ativas e débitos locais diretamente da base do DETRAN do estado de registro do veículo. Identifique pendências administrativas ou financeiras em tempo real.
              </p>
            </div>

            {/* Painel de Busca */}
            <BuscaEstadualPanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .estadual-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .estadual-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .estadual-header-compact {
          margin-bottom: 36px;
        }
        .estadual-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .estadual-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .estadual-title-compact .it {
          font-style: italic;
          color: #bcc4d1;
        }
        .estadual-title-compact .gold {
          color: #D4A843;
        }
        .estadual-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .estadual-main-section {
            padding: 40px 16px 48px;
          }
          .estadual-title-compact {
            font-size: 28px;
          }
          .estadual-desc-compact {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .estadual-title-compact {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
