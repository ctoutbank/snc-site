import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import BuscaRenainfPanel from "@/components/busca-renainf-panel";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "SNC AutoScore — Multas Renainf",
  description: "Consulta nacional de multas de trânsito registradas no Registro Nacional de Infrações de Trânsito (RENAINF).",
};

export default function BuscaRenainfPage() {
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
        <section className="renainf-main-section">
          <div className="renainf-panel-inner">
            
            {/* Cabeçalho Compacto e Proporcional */}
            <div className="renainf-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 10 · VEÍCULOS · PLACA · LGPD ART. 7º III
              </div>
              <h1 className="renainf-title-compact">
                Multas <span className="gold">Renainf</span>
              </h1>
              <p className="renainf-desc-compact">
                Consulta nacional de multas de trânsito registradas no Registro Nacional de Infrações de Trânsito (RENAINF). Identifique pendências ativas em nível nacional associadas ao veículo.
              </p>
            </div>

            {/* Painel de Busca */}
            <BuscaRenainfPanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .renainf-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .renainf-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .renainf-header-compact {
          margin-bottom: 36px;
        }
        .renainf-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .renainf-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .renainf-title-compact .it {
          font-style: italic;
          color: #bcc4d1;
        }
        .renainf-title-compact .gold {
          color: #D4A843;
        }
        .renainf-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .renainf-main-section {
            padding: 40px 16px 48px;
          }
          .renainf-title-compact {
            font-size: 28px;
          }
          .renainf-desc-compact {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .renainf-title-compact {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
