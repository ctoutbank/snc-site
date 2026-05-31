import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import BuscaCsvCompletaPanel from "@/components/busca-csv-completa-panel";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "SNC AutoScore — CSV Completa",
  description: "Consulta veicular completa: RENAINF (multas nacionais), RENAJUD (restrições judiciais), BIN (bloqueios administrativos) e dados do proprietário em uma única consulta.",
};

export default function BuscaCsvCompletaPage() {
  return (
    <div className="snc-root">
      <SiteNav />

      {/* ── Barra de Navegação Secundária ── */}
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
          <div style={{ display: "flex", gap: 8 }} />
        </div>
      </div>

      <main>
        <section className="csv-completa-main-section">
          <div className="csv-completa-panel-inner">

            {/* Cabeçalho Compacto */}
            <div className="csv-completa-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 03 · VEÍCULOS · PLACA · LGPD ART. 7º III
              </div>
              <h1 className="csv-completa-title-compact">
                Consulta <span className="gold">CSV Completa</span>
              </h1>
              <p className="csv-completa-desc-compact">
                Consulta veicular unificada com RENAINF (multas nacionais de trânsito), RENAJUD (restrições e penhoras judiciais), BIN (bloqueios administrativos nacionais) e dados completos do proprietário atual — tudo em uma única chamada.
              </p>
            </div>

            {/* Painel de Busca */}
            <BuscaCsvCompletaPanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .csv-completa-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .csv-completa-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .csv-completa-header-compact {
          margin-bottom: 36px;
        }
        .csv-completa-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .csv-completa-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .csv-completa-title-compact .gold {
          color: #D4A843;
        }
        .csv-completa-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .csv-completa-main-section { padding: 40px 16px 48px; }
          .csv-completa-title-compact { font-size: 28px; }
          .csv-completa-desc-compact { font-size: 12px; }
        }
        @media (max-width: 480px) {
          .csv-completa-title-compact { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
