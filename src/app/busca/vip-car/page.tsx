import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaVipCarPanel } from "@/components/busca-vip-car-panel";

export const metadata: Metadata = {
  title: "Relatório Completo do Veículo — SNC",
  description:
    "Relatório VIP completo do veículo: identificação, proprietário, restrições, débitos, sinistros, recalls, leilões e histórico FIPE.",
};

export default function BuscaVipCarPage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        <section className="busca-main-section">
          <div className="busca-panel-inner">

            <div className="busca-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 04 · VIP CAR · RELATÓRIO COMPLETO · PLACA · LGPD ART. 7º III
              </div>
              <h1 className="busca-title-compact">
                Relatório <span className="it">Completo</span> <span style={{ color: "var(--ds-04)" }}>VIP Car</span>
              </h1>
              <p className="busca-desc-compact">
                Relatório completo do veículo: identificação, proprietário atual, dados
                técnicos, histórico de roubo/furto, sinistro, infrações de trânsito (RENAINF),
                precificação FIPE com chassi e documento oficial SENATRAN/DENATRAN.
              </p>
            </div>

            <BuscaVipCarPanel />

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
          color: var(--snc-brass);
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
