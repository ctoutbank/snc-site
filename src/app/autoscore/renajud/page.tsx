import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaRenajudPanel } from "@/components/busca-renajud-panel";

import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Restrições RENAJUD — SNC",
  description:
    "Identifique em tempo real restrições judiciais ativas registradas no sistema RENAJUD pela placa do veículo.",
};

export default function BuscaRenajudPage() {
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
        <section className="renajud-main-section">
          <div className="renajud-panel-inner">
            
            {/* Cabeçalho Compacto e Proporcional */}
            <div className="renajud-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 06 · VEÍCULOS · PLACA · LGPD ART. 7º III
              </div>
              <h1 className="renajud-title-compact">
                Restrições <span className="gold">RENAJUD</span>
              </h1>
              <p className="renajud-desc-compact">
                Consulte em tempo real restrições judiciais ativas registradas no sistema RENAJUD — órgão judicial, tribunal, número do processo e restrições — informando apenas a placa do veículo.
              </p>
            </div>

            {/* Painel de Busca - Colocado perfeitamente no topo para uso imediato */}
            <BuscaRenajudPanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .renajud-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .renajud-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .renajud-header-compact {
          margin-bottom: 36px;
        }
        .renajud-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .renajud-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .renajud-title-compact .slate {
          color: #a0aec0;
        }
        .renajud-title-compact .gold {
          color: #D4A843;
        }
        .renajud-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .renajud-main-section {
            padding: 40px 16px 48px;
          }
          .renajud-title-compact {
            font-size: 28px;
          }
          .renajud-desc-compact {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .renajud-title-compact {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
