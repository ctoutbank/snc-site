import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'A Instituição — Consolle Data Intelligence',
  description:
    'O Sistema Nacional de Conformidade é operado pela Consolle Data Intelligence S.A., empresa brasileira de tecnologia fundada em 2019. Atendemos 1.240 instituições.',
};

const CONSELHO = [
  { code: 'PRES', name: 'Denison Zimmer da Luz', role: 'Presidente · Consolle Data Intelligence', since: '2019–' },
  { code: 'CONS', name: 'Dra. Helena Vargas Siqueira', role: 'Prof. Titular, FGV Direito SP', since: '2020–' },
  { code: 'CONS', name: 'Paulo Henrique Castro', role: 'ex-COO, Serasa Experian', since: '2021–' },
  { code: 'CONS', name: 'Marina Okabe', role: 'Parceira, Veirano Advogados', since: '2022–' },
  { code: 'CONS', name: 'Carlos Eduardo Falcão', role: 'ex-Superintendente, Susep', since: '2023–' },
];

const TIMELINE = [
  { year: '2019', event: 'Fundação da Consolle Data Intelligence S.A. por ex-executivos do BCB, Serasa e Itaú.' },
  { year: '2020', event: 'Primeiros contratos com instituições financeiras. Integração SCR Banco Central operacional.' },
  { year: '2021', event: 'Lançamento do SNC com 9 bureaus integrados. Certificação ISO 27001.' },
  { year: '2022', event: '500 clientes ativos. Compliance SOC 2 Tipo II. Abertura do escritório em São Paulo.' },
  { year: '2023', event: 'Módulo LOVAC e Inteligência por IA. Conformidade Lei 14.790 (apostas). 1.000 clientes.' },
  { year: '2024', event: 'Lançamento dos módulos ESG e Grafo de Relacionamentos. Sede Porto Alegre inaugurada no Trend City Center.' },
  { year: '2025', event: 'Relatório IA com LLMs auditáveis. 41 Mi de consultas/mês. R$ 2,1Bi de crédito protegido.' },
  { year: '2026', event: 'Expansão internacional. 253 datasets. 1.240 instituições. Maior plataforma de conformidade do Brasil.' },
];

export default function SobrePage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        {/* Hero */}
        <section className="snc-hero" style={{ minHeight: 520 }}>
          <div className="snc-hero-bg">
            <img
              src="/sobre/hero.jpg"
              alt="Consolle Data Intelligence"
            />
          </div>
          <div className="snc-hero-inner" style={{ paddingBottom: 80 }}>
            <div className="snc-hero-meta">
              <div className="l">
                <span><span className="seal">§</span> A Instituição</span>
              </div>
              <div>Desde 2019</div>
            </div>
            <h1>
              Uma <span className="it">infraestrutura</span><br />
              a serviço do <span className="grn">estado</span> de direito.
            </h1>
            <div className="snc-hero-bottom" style={{ paddingBottom: 40 }}>
              <div className="snc-hero-lede">
                O Sistema Nacional de Conformidade é uma plataforma brasileira de tecnologia desenvolvida
                para assegurar integridade, consistência e rigor na análise de dados. Evolui continuamente
                para atender organizações que operam sob elevados padrões regulatórios e demandam alto nível
                de confiabilidade em seus processos. Atua de forma abrangente nos setores financeiro, fintechs,
                varejo, seguros, telecomunicações, operadoras de saúde, exportações e no setor público,
                sustentando decisões mais seguras, mitigação de riscos e conformidade integral com as normas vigentes.
              </div>
              <div className="snc-hero-stats">
                <div className="s">
                  <div className="n">100<sup>%</sup></div>
                  <div className="l">Conformidade</div>
                </div>
                <div className="s">
                  <div className="n">&lt; 2<sup>s</sup></div>
                  <div className="l">Latência média</div>
                </div>
                <div className="s">
                  <div className="n">35<sup>+</sup></div>
                  <div className="l">Fontes de dados</div>
                </div>
                <div className="s">
                  <div className="n">99,9<sup>%</sup></div>
                  <div className="l">Disponibilidade</div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Missão e Valores */}
        <section className="snc-manifesto">
          <div className="snc-manifesto-in">
            <div className="kicker">§ MISSÃO</div>
            <blockquote>
              Tornamos <span className="grn">rastreável</span> toda decisão automatizada
              que afeta <span className="it">vidas, crédito e liberdade</span> no Brasil.
              Conformidade não é burocracia — é <span className="it">proteção</span>.
            </blockquote>
            <div className="snc-values-3col">
              {[
                { title: 'Transparência', desc: 'Toda operação auditada. Todo dataset rastreável à fonte primária. Sem caixas pretas.' },
                { title: 'Responsabilidade', desc: 'Cada consulta tem nome, data e finalidade declarados. LGPD by design desde 2019.' },
                { title: 'Rigor técnico', desc: 'ISO 27001, SOC 2 Tipo II, conformidade BACEN e COAF. Auditoria independente trimestral.' },
              ].map((v) => (
                <div key={v.title}>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--snc-brass)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                    {v.title}
                  </div>
                  <p style={{ fontSize: 14, color: '#4a5662', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>





        {/* Benefícios */}
        <section style={{ background: 'var(--snc-paper-2)', borderTop: '1px solid rgba(15,26,36,.1)', padding: '80px 28px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                § Benefícios
              </div>
              <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--snc-ink)' }}>
                Por que o SNC <span style={{ fontStyle: 'italic', color: '#5a6a7a' }}>funciona.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0, border: '1px solid rgba(15,26,36,.12)' }}>
              {[
                { title: 'Decisões mais seguras',    desc: 'Redução de incerteza operacional' },
                { title: 'Menor exposição a risco',  desc: 'Análise estruturada e preventiva' },
                { title: 'Eficiência operacional',   desc: 'Automação de processos críticos' },
                { title: 'Conformidade contínua',    desc: 'Atualização constante às normas vigentes' },
                { title: 'Aderência regulatória',    desc: 'Compatível com BACEN, LGPD e COAF' },
              ].map((item, i) => (
                <div key={item.title} style={{
                  background: 'var(--snc-paper)',
                  borderTop: '3px solid var(--snc-brass)',
                  borderLeft: i > 0 ? '1px solid rgba(15,26,36,.12)' : 'none',
                  padding: '28px 24px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 17, fontWeight: 400, color: 'var(--snc-ink)', lineHeight: 1.2 }}>
                    {item.title}
                  </div>
                  <p style={{ fontSize: 12, color: '#7c8699', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="snc-cta" style={{ padding: '80px 28px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 400, lineHeight: 1, marginBottom: 24 }}>
              Faça parte da <span style={{ fontStyle: 'italic', color: '#bcc4d1' }}>infraestrutura.</span>
            </h2>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contato" className="snc-btn snc-btn-primary">
                Falar com a equipe →
              </Link>
              <Link href="/plataforma" className="snc-btn snc-btn-ghost">
                Ver a plataforma
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
