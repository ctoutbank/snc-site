import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaLeilaoScorePanel } from "@/components/busca-leilao-score-panel";

export const metadata: Metadata = {
  title: "Leilão com Score — SNC",
  description:
    "Score de risco, indício de sinistro, dados do veículo, histórico de leilões e checklist de avarias pela placa.",
};

export default function BuscaLeilaoScorePage() {
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
                  &nbsp;LEILÃO COM SCORE · VEÍCULOS · PLACA
                </span>
                <span>Consulta em tempo real</span>
              </div>
              <div className="snc-mono" style={{ fontSize: 10, color: "#3a4a5a" }}>
                LGPD · ART. 7º III
              </div>
            </div>

            <div style={{ maxWidth: 760, paddingBottom: 60 }}>
              <div className="snc-mono" style={{ fontSize: 11, color: "var(--snc-brass)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
                05 · Veículos
              </div>
              <h1 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.025em", color: "#fff", marginBottom: 24 }}>
                Leilão<br />
                <span style={{ fontStyle: "italic", color: "#bcc4d1" }}>com</span><br />
                <span style={{ color: "#D4A843" }}>Score</span>
              </h1>
              <p style={{ fontSize: 16, color: "#8a94a3", lineHeight: 1.6, maxWidth: 540 }}>
                Score de risco (pontuação A–E, aceitação, % sobre FIPE), indício de sinistro,
                dados do veículo (marca, chassi, RENAVAM, motor, câmbio, km, eixos),
                histórico de leilões e checklist de avarias.
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
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0, marginBottom: 36,
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {[
                { num: "100", label: "Score Máximo" },
                { num: "Leilão", label: "Histórico Completo" },
                { num: "2", label: "Formatos de Placa" },
                { num: "Real-time", label: "Atualização" },
              ].map(({ num, label }) => (
                <div key={label} style={{ padding: "20px 24px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, color: "#D4A843", lineHeight: 1, marginBottom: 6 }}>
                    {num}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <BuscaLeilaoScorePanel />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
