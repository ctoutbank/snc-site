import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BuscaProprietarioPanel } from "@/components/busca-proprietario-panel";

export const metadata: Metadata = {
  title: "Consulta de Proprietário Atual — SNC",
  description:
    "Identifique o proprietário atual de qualquer veículo pela placa. Dados cadastrais, município, estado e restrições em tempo real.",
};

export default function BuscaProprietarioPage() {
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
                  &nbsp;PROPRIETÁRIO · VEÍCULOS · PLACA
                </span>
                <span>Consulta em tempo real</span>
              </div>
              <div className="snc-mono" style={{ fontSize: 10, color: "#3a4a5a" }}>
                LGPD · ART. 7º III
              </div>
            </div>

            <div style={{ maxWidth: 760, paddingBottom: 60 }}>
              <div className="snc-mono" style={{ fontSize: 11, color: "var(--snc-brass)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
                03 · Veículos
              </div>
              <h1 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.025em", color: "#fff", marginBottom: 24 }}>
                Proprietário<br />
                <span style={{ fontStyle: "italic", color: "#bcc4d1" }}>Atual</span>
              </h1>
              <p style={{ fontSize: 16, color: "#8a94a3", lineHeight: 1.6, maxWidth: 540 }}>
                Identifique o proprietário atual de qualquer veículo a partir da placa,
                nos formatos antigo e Mercosul.
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
            {/* Stats */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0, marginBottom: 36,
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {[
                { num: "Nome", label: "Proprietário" },
                { num: "CPF/CNPJ", label: "Identificação" },
                { num: "2", label: "Formatos de Placa" },
                { num: "Real-time", label: "Atualização" },
              ].map(({ num, label }) => (
                <div key={label} style={{ padding: "20px 24px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 24, color: "#4A8AB8", lineHeight: 1, marginBottom: 6 }}>
                    {num}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <BuscaProprietarioPanel />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
