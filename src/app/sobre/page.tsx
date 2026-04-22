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
  { year: '2024', event: 'Lançamento dos módulos ESG e Grafo de Relacionamentos. Sede Brasília inaugurada.' },
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
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80"
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
                O Sistema Nacional de Conformidade é operado pela Consolle Data Intelligence S.A.,
                empresa brasileira de tecnologia fundada em 2019 por um grupo de ex-executivos do
                Banco Central, Serasa e Itaú. Atendemos hoje 1.240 instituições entre bancos,
                fintechs, varejistas, operadoras de saúde e órgãos públicos.
              </div>
              <div className="snc-hero-stats">
                <div className="s">
                  <div className="n">1.240</div>
                  <div className="l">Instituições atendidas</div>
                </div>
                <div className="s">
                  <div className="n">41<sup>Mi</sup></div>
                  <div className="l">Consultas/mês</div>
                </div>
                <div className="s">
                  <div className="n">180</div>
                  <div className="l">Colaboradores</div>
                </div>
                <div className="s">
                  <div className="n">R$ 2,1<sup>Bi</sup></div>
                  <div className="l">Crédito protegido/mês</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conselho Consultivo */}
        <section className="snc-cert">
          <div className="snc-cert-grid">
            <div className="snc-cert-text">
              <div className="kicker">§ GOVERNANÇA</div>
              <h2>Conselho<br /><span className="it">consultivo.</span></h2>
              <p>
                Nossa governança inclui especialistas independentes com trajetória no regulador,
                no mercado financeiro e na academia. Reuniões trimestrais, atas públicas,
                conflitos de interesse declarados.
              </p>
              <div className="snc-cert-list">
                {CONSELHO.map((m) => (
                  <div key={m.name} className="r">
                    <span className="c">{m.code}</span>
                    <span className="n">{m.name} — {m.role}</span>
                    <span className="s">{m.since}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="snc-cert-img">
              <img
                src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=1200&q=80"
                alt="Conselho Consultivo"
              />
              <div className="badge">§ CONSELHO · MMXXVI</div>
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
            <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, paddingTop: 40, borderTop: '1px solid rgba(15,26,36,.14)' }}>
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

        {/* Timeline */}
        <section className="snc-sec">
          <div className="snc-sec-head">
            <div className="num">§ HISTÓRIA</div>
            <h2>Uma <span className="it">trajetória</span> de construção.</h2>
            <div className="aside">2019 — 2026</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(15,26,36,.14)', paddingLeft: 40, marginLeft: 60 }}>
            {TIMELINE.map((t) => (
              <div key={t.year} style={{ marginBottom: 40, position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: -49,
                  top: 4,
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: 'var(--snc-brass)',
                  letterSpacing: '.12em',
                }}>
                  {t.year}
                </div>
                <p style={{ fontSize: 15, color: '#4a5662', lineHeight: 1.6 }}>{t.event}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Presença */}
        <section style={{ background: 'var(--snc-navy)', color: '#fff', padding: '80px 28px' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 40 }}>
              § PRESENÇA NACIONAL
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 60 }}>
              {[
                {
                  city: 'Brasília · Sede',
                  address: 'SHN Quadra 2, Bloco F\nEdifício Executive Office · 12º andar\nCEP 70702-906',
                  desc: 'Centro de Governança, Compliance e Relações Institucionais.',
                },
                {
                  city: 'São Paulo · Operação',
                  address: 'Av. Brigadeiro Faria Lima, 4440\nItaim Bibi · 14º andar\nCEP 04538-132',
                  desc: 'Centro de Engenharia, Produto e Atendimento ao Cliente.',
                },
              ].map((loc) => (
                <div key={loc.city}>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--snc-brass)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 16 }}>
                    {loc.city}
                  </div>
                  <div style={{ color: '#cfd6df', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: 16 }}>
                    {loc.address}
                  </div>
                  <div style={{ fontSize: 13, color: '#8a94a3' }}>{loc.desc}</div>
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
