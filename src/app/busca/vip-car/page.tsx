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
        {/* ── Hero ── */}
        <section className="snc-hero snc-hero-geo" style={{ minHeight: "auto" }}>
          <div className="snc-hero-inner" style={{ paddingBottom: 0 }}>
            <div className="snc-hero-meta">
              <div className="l">
                <span>
                  <span className="snc-mono" style={{ color: "var(--snc-brass)", fontSize: 10 }}>DATASET</span>
                  &nbsp;VIP CAR · RELATÓRIO COMPLETO · PLACA
                </span>
                <span>Consulta em tempo real</span>
              </div>
              <div className="snc-mono" style={{ fontSize: 10, color: "#3a4a5a" }}>
                LGPD · ART. 7º III
              </div>
            </div>

            <div style={{ maxWidth: 760, paddingBottom: 60 }}>
              <div className="snc-mono" style={{ fontSize: 11, color: "var(--snc-brass)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
                04 · Veículos
              </div>
              <h1 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.025em", color: "#fff", marginBottom: 24 }}>
                Relatório<br />
                <span style={{ fontStyle: "italic", color: "#bcc4d1" }}>Completo</span><br />
                <span style={{ color: "#7B5EA7" }}>VIP Car</span>
              </h1>
              <p style={{ fontSize: 16, color: "#8a94a3", lineHeight: 1.6, maxWidth: 540 }}>
                Relatório completo do veículo: identificação, proprietário atual, dados
                técnicos, histórico de roubo/furto, sinistro, infrações de trânsito (RENAINF),
                precificação FIPE com chassi e documento oficial SENATRAN/DENATRAN.
              </p>
            </div>
          </div>
        </section>

        {/* ── Painel ── */}
        <section style={{
          background: "var(--snc-navy)",
          borderTop: "1px solid #17243b",
          padding: "0 28px 80px",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", paddingTop: 48 }}>
            <div className="ds-stats-grid" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { num: "VIP", label: "Relatório Completo" },
                { num: "8+", label: "Blocos de Dados" },
                { num: "2", label: "Formatos de Placa" },
                { num: "Real-time", label: "Atualização" },
              ].map(({ num, label }) => (
              <div key={label} className="ds-stat-item">
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, color: "#7B5EA7", lineHeight: 1, marginBottom: 6 }}>
                    {num}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <BuscaVipCarPanel />
          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .ds-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-bottom:36px}
        .ds-stat-item{padding:20px 24px;border-right:1px solid rgba(255,255,255,0.06)}
        .ds-stat-item:last-child{border-right:none}
        @media(max-width:768px){.ds-stats-grid{grid-template-columns:repeat(2,1fr)}.ds-stat-item:nth-child(2){border-right:none}}
        @media(max-width:480px){.ds-stats-grid{grid-template-columns:1fr 1fr}.ds-stat-item{padding:14px 16px}}
      `}</style>
    </div>
  );
}
