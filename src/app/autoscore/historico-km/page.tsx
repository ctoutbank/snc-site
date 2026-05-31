import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaHistoricoKmPanel } from "@/components/busca-historico-km-panel";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Histórico de Quilometragem — SNC",
  description:
    "Rastreie a quilometragem registrada ao longo da vida útil do veículo. Identifique inconsistências e possível adulteração de hodômetro pela placa.",
};

export default function BuscaHistoricoKmPage() {
  return (
    <div className="snc-root">
      <SiteNav />

      {/* ── Action Bar ── */}
      <div style={{
        background: "#0A1628",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          padding: "12px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <BackButton fallback="/autoscore" />
          <div style={{ display: "flex", gap: 8 }}>
            {/* Espaço para futuros botões */}
          </div>
        </div>
      </div>

      <main>
        <section className="historico-km-main-section">
          <div className="historico-km-panel-inner">

            <div className="historico-km-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 11 · VEÍCULOS · PLACA · LGPD ART. 7º III
              </div>
              <h1 className="historico-km-title-compact">
                Histórico de <span className="gold">Quilometragem</span>
              </h1>
              <p className="historico-km-desc-compact">
                Rastreie a quilometragem registrada ao longo da vida útil do veículo —
                revisões, vistorias e registros de seguradora. Identifique inconsistências
                e possível adulteração de hodômetro informando apenas a placa.
              </p>
            </div>

            <BuscaHistoricoKmPanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .historico-km-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .historico-km-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .historico-km-header-compact {
          margin-bottom: 36px;
        }
        .historico-km-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .historico-km-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .historico-km-title-compact .gold {
          color: #D4A843;
        }
        .historico-km-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }
        @media (max-width: 768px) {
          .historico-km-main-section { padding: 40px 16px 48px; }
          .historico-km-title-compact { font-size: 28px; }
          .historico-km-desc-compact { font-size: 12px; }
        }
        @media (max-width: 480px) {
          .historico-km-title-compact { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
