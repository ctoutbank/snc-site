import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaDebitosPanel } from "@/components/busca-debitos-panel";

import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Extrato de Débitos — SNC",
  description:
    "Consulte multas de trânsito, IPVA, licenciamento e DPVAT de veículos de forma consolidada e em tempo real informando a placa.",
};

export default function BuscaDebitosPage() {
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
        <section className="debitos-main-section">
          <div className="debitos-panel-inner">
            
            {/* Cabeçalho Compacto e Proporcional */}
            <div className="debitos-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 08 · VEÍCULOS · PLACA · LGPD ART. 7º III
              </div>
              <h1 className="debitos-title-compact">
                Extrato de <span className="slate" style={{ color: "#D4A843" }}>Débitos</span>
              </h1>
              <p className="debitos-desc-compact">
                Consulte multas de trânsito, IPVA, licenciamento e DPVAT de veículos de forma consolidada e em tempo real informando a placa. Identifique pendências financeiras e regularize a situação cadastral.
              </p>
            </div>

            {/* Painel de Busca */}
            <BuscaDebitosPanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .debitos-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .debitos-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .debitos-header-compact {
          margin-bottom: 36px;
        }
        .debitos-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .debitos-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .debitos-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .debitos-main-section {
            padding: 40px 16px 48px;
          }
          .debitos-title-compact {
            font-size: 28px;
          }
          .debitos-desc-compact {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .debitos-title-compact {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
