import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaAgregadosChassiPanel } from "@/components/busca-agregados-chassi-panel";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Decodificador de Chassi — SNC",
  description:
    "Decodifique qualquer chassi e obtenha dados cadastrais completos do veículo: marca, modelo, ano, placa, renavam, motor, dados técnicos e procedência.",
};

export default function BuscaAgregadosChassiPage() {
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
        <section className="busca-main-section">
          <div className="busca-panel-inner">

            <div className="busca-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 16 · VEÍCULOS · AGREGADOS · CHASSI · LGPD ART. 7º III
              </div>
              <h1 className="busca-title-compact">
                Decodificador <span className="it">Chassi</span>
              </h1>
              <p className="busca-desc-compact">
                Decodifique o chassi de qualquer veículo e obtenha dados cadastrais completos:
                marca/modelo, ano de fabricação/modelo, placa, renavam, motor, dados técnicos
                (espécie, tipo, carroceria, potência, cilindrada) e procedência.
              </p>
            </div>

            <BuscaAgregadosChassiPanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .busca-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .busca-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .busca-header-compact {
          margin-bottom: 36px;
        }
        .busca-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .busca-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .busca-title-compact .it {
          font-style: italic;
          color: #bcc4d1;
        }
        .busca-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }
        @media (max-width: 768px) {
          .busca-main-section { padding: 40px 16px 48px; }
          .busca-title-compact { font-size: 28px; }
          .busca-desc-compact { font-size: 12px; }
        }
        @media (max-width: 480px) {
          .busca-title-compact { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
