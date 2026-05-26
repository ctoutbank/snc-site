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
    cor: "var(--snc-green-2)",
    corBg: "rgba(43,168,74,0.08)",
    corBorder: "rgba(43,168,74,0.25)",
    fonte: "Banco Central do Brasil",
    tipo: "CPF",
  },
  {
    id: "02",
    titulo: "Placa FIPE + Chassi",
    subtitulo: "Veículos · Placa",
    descricao:
      "Tabela FIPE atualizada, número do chassi, especificações técnicas e histórico de valorização do veículo.",
    campos: ["Valor FIPE", "Código FIPE", "Chassi", "Histórico de Valores", "Marca / Modelo"],
    status: "ativo" as const,
    href: "/busca/veiculo",
    cor: "#B8914A",
    corBg: "rgba(184,145,74,0.08)",
    corBorder: "rgba(184,145,74,0.25)",
    fonte: "FIPE / DENATRAN",
    tipo: "PLACA",
  },
  // ── Próximos datasets (placeholders) ────────────────────────────────────────
  {
    id: "03",
    titulo: "Proprietário Atual",
    subtitulo: "Veículos · Placa",
    descricao: "Identifique o proprietário atual de qualquer veículo pela placa — nome, documento, município e restrições.",
    campos: ["Nome", "CPF / CNPJ", "Município / UF", "Data Aquisição", "Restrições"],
    status: "ativo" as const,
    href: "/busca/proprietario",
    cor: "#4A8AB8",
    corBg: "rgba(74,138,184,0.08)",
    corBorder: "rgba(74,138,184,0.25)",
    fonte: "DENATRAN / SENATRAN",
    tipo: "PLACA",
  },
  {
    id: "04",
    titulo: "Relatório VIP Car",
    subtitulo: "Veículos · Placa",
    descricao: "Relatório completo do veículo: identificação, proprietário atual, dados técnicos, histórico de roubo/furto, sinistro, infrações (RENAINF), precificação FIPE com chassi e documento oficial.",
    campos: ["Proprietário", "Dados Técnicos", "Roubo/Furto", "Sinistro", "RENAINF", "FIPE", "PDF"],
    status: "ativo" as const,
    href: "/busca/vip-car",
    cor: "#7B5EA7",
    corBg: "rgba(123,94,167,0.08)",
    corBorder: "rgba(123,94,167,0.25)",
    fonte: "DENATRAN / SENATRAN",
    tipo: "PLACA",
  },
  {
    id: "05",
    titulo: "Leilão com Score",
    subtitulo: "Veículos · Placa",
    descricao: "Score de risco (A–E), indício de sinistro, dados do veículo (marca, chassi, RENAVAM, motor, câmbio, km, eixos), histórico de leilões (leiloeiro, comitente, condições) e checklist de avarias.",
    campos: ["Score", "Sinistro", "Dados Veículo", "Histórico", "Condições", "Checklist"],
    status: "ativo" as const,
    href: "/busca/leilao-score",
    cor: "#D4A843",
    corBg: "rgba(212,168,67,0.08)",
    corBorder: "rgba(212,168,67,0.25)",
    fonte: "DENATRAN / SENATRAN",
    tipo: "PLACA",
  },
  {
    id: "06",
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
    id: "07",
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
        {/* ── Hero ── */}
        <section className="snc-hero snc-hero-geo" style={{ minHeight: "auto" }}>
          <div className="snc-hero-inner" style={{ paddingBottom: 0 }}>
            <div className="snc-hero-meta">
              <div className="l">
                <span>
                  <span className="snc-mono" style={{ color: "var(--snc-brass)", fontSize: 10 }}>PLATAFORMA</span>
                  &nbsp;SNC · DATASETS · CONSULTAS
                </span>
                <span>APIBrasil · Dados Oficiais</span>
              </div>
              <div className="snc-mono" style={{ fontSize: 10, color: "#3a4a5a" }}>
                LGPD · ART. 7º III
              </div>
            </div>

            <div style={{ maxWidth: 760, paddingBottom: 60 }}>
              <div className="snc-mono" style={{ fontSize: 11, color: "var(--snc-brass)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
                Consultas
              </div>
              <h1 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: "clamp(48px, 7vw, 96px)", lineHeight: 0.95, letterSpacing: "-0.025em", color: "#fff", marginBottom: 24 }}>
                Central de<br />
                <span style={{ fontStyle: "italic", color: "#bcc4d1" }}>Datasets</span>
              </h1>
              <p style={{ fontSize: 16, color: "#8a94a3", lineHeight: 1.6, maxWidth: 540 }}>
                Consulte dados regulatórios, financeiros e patrimoniais de pessoas
                físicas e jurídicas a partir de fontes oficiais e bureaus homologados.
              </p>
            </div>
          </div>
        </section>

        {/* ── Grid de Datasets ── */}
        <section style={{
          background: "var(--snc-navy)",
          borderTop: "1px solid #17243b",
          padding: "0 28px 80px",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 48 }}>

            {/* Stats bar */}
            <div style={{
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
              ].map(({ num, label }) => (
                <div key={label} style={{ padding: "20px 24px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 28, color: "var(--snc-brass)", lineHeight: 1, marginBottom: 6 }}>
                    {num}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Grade de cards */}
            <div style={{
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
    </div>
  );
}
