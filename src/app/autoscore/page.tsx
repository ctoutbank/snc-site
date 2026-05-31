import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { DatasetCard } from "@/components/dataset-card";

export const metadata: Metadata = {
  title: "AutoScore — Hub de Veículos SNC",
  description:
    "Plataforma de consulta e análise veicular: FIPE, Chassi, Proprietário Atual, Relatório Veicular Completo e Leilão com Score.",
};

// ─── Catálogo de datasets clássicos de veículos ──────────────────────────────────
const DATASETS = [
  {
    id: "01",
    titulo: "Relatório Veicular Completo",
    subtitulo: "Veículos · Placa",
    descricao: "Relatório veicular completo do veículo: identificação, proprietário atual, dados técnicos, histórico de roubo/furto, sinistro, infrações (RENAINF), precificação FIPE com chassi e documento oficial.",
    campos: ["Proprietário", "Dados Técnicos", "Roubo/Furto", "Sinistro", "RENAINF", "FIPE", "PDF"],
    status: "ativo" as const,
    href: "/autoscore/vip-car",
    cor: "var(--ds-04)",
    corBg: "var(--ds-04-bg)",
    corBorder: "var(--ds-04-border)",
    fonte: "DENATRAN / SENATRAN",
    tipo: "PLACA",
  },
  {
    id: "02",
    titulo: "Leilão Veicular + Score",
    subtitulo: "Veículos · Placa",
    descricao: "Score de risco (A–E), indício de sinistro, dados do veículo (marca, chassi, RENAVAM, motor, câmbio, km, eixos), histórico de leilões (leiloeiro, comitente, condições) e checklist de avarias.",
    campos: ["Score", "Sinistro", "Dados Veículo", "Histórico", "Condições", "Checklist"],
    status: "ativo" as const,
    href: "/autoscore/leilao-score",
    cor: "var(--ds-05)",
    corBg: "var(--ds-05-bg)",
    corBorder: "var(--ds-05-border)",
    fonte: "DENATRAN / SENATRAN",
    tipo: "PLACA",
  },
  {
    id: "03",
    titulo: "CSV Completa",
    subtitulo: "Veículos · Placa",
    descricao: "Consulta veicular unificada: RENAINF (multas nacionais), RENAJUD (restrições judiciais), BIN (bloqueios administrativos) e dados do proprietário em uma única chamada.",
    campos: ["RENAINF — Multas", "RENAJUD — Judicial", "BIN — Bloqueios", "Proprietário", "Dados do Veículo"],
    status: "ativo" as const,
    href: "/autoscore/csv-completa",
    cor: "#D4A843",
    corBg: "rgba(212,168,67,0.05)",
    corBorder: "rgba(212,168,67,0.15)",
    fonte: "SENATRAN / RENAINF / RENAJUD / BIN",
    tipo: "PLACA",
  },
  {
    id: "04",
    titulo: "Placa FIPE + Chassi",
    subtitulo: "Veículos · Placa",
    descricao:
      "Tabela FIPE atualizada, número do chassi, especificações técnicas e histórico de valorização do veículo.",
    campos: ["Valor FIPE", "Código FIPE", "Chassi", "Histórico de Valores", "Marca / Modelo"],
    status: "ativo" as const,
    href: "/autoscore/veiculo",
    cor: "var(--ds-02)",
    corBg: "var(--ds-02-bg)",
    corBorder: "var(--ds-02-border)",
    fonte: "FIPE / DENATRAN",
    tipo: "PLACA",
  },
  {
    id: "05",
    titulo: "Proprietário Atual",
    subtitulo: "Veículos · Placa",
    descricao: "Identifique o proprietário atual de qualquer veículo pela placa — nome, documento, município e restrições.",
    campos: ["Nome", "CPF / CNPJ", "Município / UF", "Data Aquisição", "Restrições"],
    status: "ativo" as const,
    href: "/autoscore/proprietario",
    cor: "var(--ds-03)",
    corBg: "var(--ds-03-bg)",
    corBorder: "var(--ds-03-border)",
    fonte: "DENATRAN / SENATRAN",
    tipo: "PLACA",
  },
  {
    id: "06",
    titulo: "Restrições RENAJUD",
    subtitulo: "Veículos · Placa + Documento",
    descricao: "Identifique restrições judiciais ativas registradas no sistema RENAJUD (órgão judicial, tribunal, número do processo e restrições).",
    campos: ["Processo", "Órgão Judicial", "Tribunal", "Restrições", "CPF / CNPJ"],
    status: "ativo" as const,
    href: "/autoscore/renajud",
    cor: "#5a6a7a",
    corBg: "rgba(90,106,122,0.05)",
    corBorder: "rgba(90,106,122,0.15)",
    fonte: "SENATRAN / CNJ",
    tipo: "PLACA / RENAVAM / DOC",
  },
  {
    id: "07",
    titulo: "Restrições de Gravame",
    subtitulo: "Veículos · Placa",
    descricao: "Consulte gravames e restrições financeiras registradas sobre o veículo (agente financeiro, data de inclusão, número do contrato e situação).",
    campos: ["Restrição Ativa", "Agente Financeiro", "Nº Contrato", "Data Registro", "Situação"],
    status: "ativo" as const,
    href: "/autoscore/gravame",
    cor: "#D4A843",
    corBg: "rgba(212,168,67,0.05)",
    corBorder: "rgba(212,168,67,0.15)",
    fonte: "DENATRAN / B3",
    tipo: "PLACA",
  },
  {
    id: "08",
    titulo: "Extrato de Débitos",
    subtitulo: "Veículos · Placa",
    descricao: "Consulte multas de trânsito, IPVA, licenciamento e DPVAT de veículos de forma consolidada e em tempo real informando a placa.",
    campos: ["Multas", "IPVA em Aberto", "Licenciamento Anual", "DPVAT Seguro", "Total Geral"],
    status: "ativo" as const,
    href: "/autoscore/debitos",
    cor: "#D4A843",
    corBg: "rgba(212,168,67,0.05)",
    corBorder: "rgba(212,168,67,0.15)",
    fonte: "FIPE / DETRAN",
    tipo: "PLACA",
  },
  {
    id: "09",
    titulo: "Base Estadual Detran",
    subtitulo: "Veículos · Placa",
    descricao: "Consulte dados cadastrais primários, restrições ativas e débitos locais diretamente da base do DETRAN do estado de registro do veículo.",
    campos: ["Dados Detran", "Restrições Locais", "IPVA e Taxas", "Débitos Estaduais", "Município / UF"],
    status: "ativo" as const,
    href: "/autoscore/estadual",
    cor: "#D4A843",
    corBg: "rgba(212,168,67,0.05)",
    corBorder: "rgba(212,168,67,0.15)",
    fonte: "DETRAN / SENATRAN",
    tipo: "PLACA",
  },
  {
    id: "10",
    titulo: "Multas Renainf",
    subtitulo: "Veículos · Placa",
    descricao: "Consulta nacional de multas de trânsito registradas no Registro Nacional de Infrações de Trânsito (RENAINF).",
    campos: ["Multas RENAINF", "Valores", "Órgão Emissor", "Local / Situação", "Data da Infração"],
    status: "ativo" as const,
    href: "/autoscore/renainf",
    cor: "#D4A843",
    corBg: "rgba(212,168,67,0.05)",
    corBorder: "rgba(212,168,67,0.15)",
    fonte: "SENATRAN / RENAINF",
    tipo: "PLACA",
  },
  {
    id: "11",
    titulo: "Histórico de Quilometragem",
    subtitulo: "Veículos · Placa",
    descricao: "Rastreie a quilometragem registrada ao longo da vida útil do veículo e identifique inconsistências ou possível adulteração de hodômetro.",
    campos: ["Registros de Km", "Fontes", "Datas", "UF", "Anomalia de Hodômetro"],
    status: "ativo" as const,
    href: "/autoscore/historico-km",
    cor: "#D4A843",
    corBg: "rgba(212,168,67,0.05)",
    corBorder: "rgba(212,168,67,0.15)",
    fonte: "DENATRAN / DETRAN / Seguradoras",
    tipo: "PLACA",
  },
  {
    id: "12",
    titulo: "Emissão de CRLV-e",
    subtitulo: "Veículos · Placa + UF",
    descricao: "Emissão e visualização do Certificado de Registro e Licenciamento de Veículo Digital oficial em formato PDF com validade nacional.",
    campos: ["CRLV-e Digital", "Licenciamento Anual", "Documento PDF", "Existe Ocorrência", "Marca / Modelo"],
    status: "ativo" as const,
    href: "/autoscore/crlve",
    cor: "#2BA84A",
    corBg: "rgba(43,168,74,0.05)",
    corBorder: "rgba(43,168,74,0.15)",
    fonte: "SENATRAN / DETRAN",
    tipo: "PLACA / UF",
  },
] as const;

// ─── Página Hub AutoScore ────────────────────────────────────────────────────────
export default function AutoScoreHubPage() {
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
                PLATAFORMA SNC · DATASETS · AUTO-SCORE · VEÍCULOS · LGPD ART. 7º III
              </div>
              <h1 className="busca-title-compact">
                Central <span className="it">AutoScore</span>
              </h1>
              <p className="busca-desc-compact">
                Consulte dados patrimoniais, restrições judiciais, histórico de leilão, precificação FIPE 
                e análise veicular completa com base em fontes federais e bureaus de dados homologados.
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
                { num: String(total), label: "Datasets Ativos" },
                { num: "Real-time", label: "Atualização" },
                { num: "LGPD", label: "Conformidade" },
                {
                  num: (
                    <>
                      DENATRAN · DETRAN · SENATRAN
                      <br />
                      FIPE · RENAJUD · RENAINF · CNJ
                    </>
                  ),
                  label: "Fontes"
                },
              ].map(({ num, label }, index) => (
                <div key={label} style={{ padding: "20px 24px", borderRight: index === 3 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{
                    fontFamily: label === "Fontes" ? "'JetBrains Mono', monospace" : "'Libre Caslon Text', serif",
                    fontSize: label === "Fontes" ? 11 : 28,
                    color: "var(--snc-brass)",
                    lineHeight: label === "Fontes" ? 1.5 : 1,
                    letterSpacing: label === "Fontes" ? "0.02em" : "normal",
                    marginBottom: 6,
                    whiteSpace: "normal",
                    wordBreak: "break-word"
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
              <span>Novas verificações adicionadas continuamente</span>
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
          .busca-title-compact { font-size: 28px; }
          .busca-desc-compact { font-size: 12px; }
        }
        @media (max-width: 480px) {
          .busca-title-compact { font-size: 24px; }
        }

        @media (max-width: 992px) {
          .datasets-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .datasets-grid {
            grid-template-columns: 1fr !important;
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
