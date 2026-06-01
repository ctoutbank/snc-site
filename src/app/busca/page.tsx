import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { DatasetCard } from "@/components/dataset-card";

export const metadata: Metadata = {
  title: "Datasets de Consulta — SNC",
  description:
    "Plataforma de consulta de dados públicos e regulatórios: SCR Bacen, Score de Crédito, FIPE, Chassi, CPF, CNPJ e muito mais.",
};

// ─── Catálogo de datasets ─────────────────────────────────────────────────────
const DATASETS = [
  {
    id: "01",
    titulo: "SCR Bacen + Score",
    subtitulo: "Crédito · CPF",
    descricao:
      "Exposição de crédito no Sistema de Informações de Crédito do Banco Central e Score de inadimplência (0–1000).",
    campos: ["Crédito a Vencer", "Crédito Vencido", "Prejuízo", "Qtd. Instituições", "Score"],
    status: "ativo" as const,
    href: "/busca/credito",
    cor: "var(--ds-01)",
    corBg: "var(--ds-01-bg)",
    corBorder: "var(--ds-01-border)",
    fonte: "Banco Central do Brasil",
    tipo: "CPF",
  },
  {
    id: "02",
    titulo: "Protestos · Negativações",
    subtitulo: "Crédito · CPF / CNPJ",
    descricao: "Consulta de protestos em cartório e negativações em bureaus de crédito.",
    campos: ["Protestos", "Valor", "Cartório", "Data", "Situação"],
    status: "breve" as const,
    href: "#",
    cor: "#5a6a7a",
    corBg: "rgba(90,106,122,0.05)",
    corBorder: "rgba(90,106,122,0.15)",
    fonte: "CRC / Serasa",
    tipo: "CPF / CNPJ",
  },
  {
    id: "03",
    titulo: "Processos Judiciais",
    subtitulo: "Jurídico · CPF / CNPJ",
    descricao: "Consulta de ações judiciais em tribunais federais e estaduais.",
    campos: ["Processos", "Tribunal", "Valor da Causa", "Fase", "Partes"],
    status: "breve" as const,
    href: "#",
    cor: "#5a6a7a",
    corBg: "rgba(90,106,122,0.05)",
    corBorder: "rgba(90,106,122,0.15)",
    fonte: "CNJ / Tribunais",
    tipo: "CPF / CNPJ",
  },
] as const;

// ─── Página Hub ────────────────────────────────────────────────────────────────
export default function DatasetsHubPage() {
  const ativos = DATASETS.filter((d) => d.status === "ativo").length;
  const total = DATASETS.length;

  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        {/* ── Main Section ── */}
        <section style={{
          background: "var(--snc-navy)",
          borderTop: "1px solid #17243b",
          padding: "60px 28px 80px",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>

            <div className="busca-header-compact">
              <div className="snc-mono sub-meta">
                PLATAFORMA SNC · DATASETS · CONSULTAS · LGPD ART. 7º III
              </div>
              <h1 className="busca-title-compact">
                Central de <span className="it">Datasets</span>
              </h1>
              <p className="busca-desc-compact">
                Consulte dados regulatórios, financeiros e patrimoniais de pessoas
                físicas e jurídicas a partir de fontes oficiais e bureaus homologados.
              </p>
            </div>

            {/* Stats bar */}
            <div className="stats-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0,
              marginBottom: 48,
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {[
                { num: String(ativos), label: "Datasets Ativos" },
                { num: String(total), label: "Total de Datasets" },
                { num: "Real-time", label: "Atualização" },
                { num: "LGPD", label: "Conformidade" },
              ].map(({ num, label }, index) => (
                <div key={label} style={{ padding: "20px 24px", borderRight: index === 3 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{
                    fontFamily: "'Libre Caslon Text', serif",
                    fontSize: 28,
                    color: "var(--snc-brass)",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}>
                    {num}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Grade de cards */}
            <div className="datasets-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
            }}>
              {DATASETS.map((d) => (
                <DatasetCard key={d.id} {...d} />
              ))}
            </div>

            {/* Rodapé informativo */}
            <div style={{
              marginTop: 24, padding: "16px 24px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: 24,
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              color: "#3a4a5a", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span>Provedor: APIBrasil · gateway.apibrasil.io</span>
              <span>·</span>
              <span>Novos datasets adicionados continuamente</span>
              <span style={{ marginLeft: "auto" }}>SNC — Sistema Nacional de Conformidade</span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
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
          .busca-title-compact { font-size: 28px; }
          .busca-desc-compact { font-size: 12px; }
        }
        @media (max-width: 480px) {
          .busca-title-compact { font-size: 24px; }
        }

        @media (max-width: 900px) {
          .datasets-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .stats-grid > div {
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          }
          .stats-grid > div:nth-child(even) {
            border-right: none !important;
          }
          .stats-grid > div:nth-child(3),
          .stats-grid > div:nth-child(4) {
            border-bottom: none !important;
          }
        }
        @media (max-width: 600px) {
          .datasets-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-grid > div {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          }
          .stats-grid > div:last-child {
            border-bottom: none !important;
          }
        }
      `}</style>
    </div>
  );
}
