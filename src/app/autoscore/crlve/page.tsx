import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import BuscaCrlvePanel from "@/components/busca-crlve-panel";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "SNC AutoScore — Emissão de CRLV-e",
  description: "Emissão e visualização do Certificado de Registro e Licenciamento de Veículo Digital oficial em formato PDF.",
};

export default function BuscaCrlvePage() {
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
            {/* Espaço para botões secundários se necessário */}
          </div>
        </div>
      </div>

      <main>
        {/* ── Seção Única Integrada (Cabeçalho Compacto + Busca) ── */}
        <section className="crlve-main-section">
          <div className="crlve-panel-inner">
            
            {/* Cabeçalho Compacto e Proporcional */}
            <div className="crlve-header-compact">
              <div className="snc-mono sub-meta">
                DATASET 12 · VEÍCULOS · PLACA + UF · LGPD ART. 7º III
              </div>
              <h1 className="crlve-title-compact">
                Emissão <span className="gold">CRLV-e</span>
              </h1>
              <p className="crlve-desc-compact">
                Emissão e visualização do Certificado de Registro e Licenciamento de Veículo Digital oficial. Faça a consulta veicular, emita a certidão digital com validade jurídica do DENATRAN/SENATRAN e baixe o documento em PDF.
              </p>
            </div>

            {/* Painel de Busca */}
            <BuscaCrlvePanel />

          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .crlve-main-section {
          background: var(--snc-navy);
          border-top: 1px solid #17243b;
          padding: 60px 28px 80px;
        }
        .crlve-panel-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .crlve-header-compact {
          margin-bottom: 36px;
        }
        .crlve-header-compact .sub-meta {
          font-size: 9px;
          color: #a0aec0;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .crlve-title-compact {
          font-family: 'Libre Caslon Text', serif;
          font-weight: 400;
          font-size: 32px;
          color: #fff;
          margin: 8px 0 12px;
        }
        .crlve-title-compact .gold {
          color: #D4A843;
        }
        .crlve-desc-compact {
          font-size: 13px;
          color: #8a94a3;
          line-height: 1.6;
          max-width: 720px;
          margin: 0;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .crlve-main-section {
            padding: 40px 16px 48px;
          }
          .crlve-title-compact {
            font-size: 28px;
          }
          .crlve-desc-compact {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .crlve-title-compact {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
