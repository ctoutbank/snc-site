import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Compliance LGPD — Privacidade e Proteção de Dados · SNC',
  description:
    'O SNC opera com LGPD by design desde 2019. Cada consulta registra operador, finalidade e timestamp. Transparência total, rastreabilidade integral e direitos do titular garantidos.',
  openGraph: {
    title: 'Compliance LGPD · SNC',
    description: 'LGPD by design desde 2019. Rastreabilidade integral. Direitos do titular garantidos.',
  },
};

const BASES_LEGAIS = [
  {
    art: 'Art. 7º, II',
    titulo: 'Cumprimento de Obrigação Legal',
    desc: 'Consultas exigidas por regulação BCB (Res. 4.893), COAF e órgãos de supervisão. A base legal é a norma, não o interesse comercial.',
  },
  {
    art: 'Art. 7º, V',
    titulo: 'Execução de Contrato',
    desc: 'Consultas realizadas no contexto de análise de crédito, KYC ou due diligence quando o titular é parte ou pré-contratante.',
  },
  {
    art: 'Art. 7º, IX',
    titulo: 'Legítimo Interesse',
    desc: 'Prevenção à fraude e segurança de operações financeiras, sempre limitado ao mínimo necessário e documentado no RoPA.',
  },
  {
    art: 'Art. 7º, I',
    titulo: 'Consentimento',
    desc: 'Quando aplicável e exigido, o consentimento é livre, informado, inequívoco e revogável a qualquer tempo pelo titular.',
  },
];

const DIREITOS = [
  { n: '01', titulo: 'Confirmação e Acesso', desc: 'Confirmar se tratamos seus dados e obter cópia legível em formato estruturado.' },
  { n: '02', titulo: 'Correção', desc: 'Solicitar atualização de dados incompletos, inexatos ou desatualizados.' },
  { n: '03', titulo: 'Anonimização ou Eliminação', desc: 'Requerer que dados desnecessários ou tratados em desconformidade sejam eliminados.' },
  { n: '04', titulo: 'Portabilidade', desc: 'Receber seus dados em formato interoperável para transferência a outro fornecedor.' },
  { n: '05', titulo: 'Oposição', desc: 'Opor-se a tratamento realizado com fundamento em base legal que não seja consentimento.' },
  { n: '06', titulo: 'Revogação de Consentimento', desc: 'Retirar consentimento anteriormente concedido, sem prejuízo da licitude do tratamento anterior.' },
];

const PRINCIPIOS = [
  {
    sigla: 'MND',
    titulo: 'Minimização Necessária de Dados',
    desc: 'Coletamos e transmitimos apenas os dados estritamente necessários para a finalidade declarada. Campos adicionais são filtrados antes da entrega.',
  },
  {
    sigla: 'FLD',
    titulo: 'Finalidade Legítima Declarada',
    desc: 'Cada consulta API registra a finalidade de uso no momento da requisição. Sem finalidade, sem dado. Sem exceção.',
  },
  {
    sigla: 'RAT',
    titulo: 'Rastreabilidade e Auditoria Total',
    desc: 'Log imutável de cada operação: quem consultou, qual dado, quando, sob qual base legal. Disponível para o DPO e para a ANPD.',
  },
  {
    sigla: 'PBD',
    titulo: 'Privacy by Design',
    desc: 'A privacidade não é uma funcionalidade adicionada — é a arquitetura. Criptografia em trânsito (TLS 1.3) e em repouso (AES-256) desde o primeiro dia.',
  },
];

export default function LgpdPage() {
  return (
    <div className="snc-root" style={{ background: 'var(--snc-paper)', color: 'var(--snc-ink)', overflowX: 'hidden' }}>
      <SiteNav />
      <main>

        {/* ── HERO ── */}
        <section className="snc-hero">
          <div className="snc-hero-bg" style={{ background: 'var(--snc-navy)' }} />
          <div className="snc-hero-inner" style={{ paddingBottom: 40 }}>
            <div className="snc-hero-meta">
              <span className="snc-hero-tag">§ COMPLIANCE · LGPD · Lei 13.709/2018</span>
            </div>
            <h1 className="snc-hero-title" style={{ marginTop: 28, maxWidth: 680, fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.15 }}>
              Privacidade não é política.<br />
              <em>É arquitetura.</em>
            </h1>
            <div className="snc-hero-lede">
              <p style={{ color: '#8a94a3', fontSize: 16, lineHeight: 1.7, maxWidth: 540, margin: 0 }}>
                O SNC foi construído com LGPD by design desde 2019 — antes mesmo da lei entrar
                em vigor. Cada dataset processado, cada consulta realizada e cada dado transmitido
                opera sob rastreabilidade integral, base legal declarada e finalidade explícita.
              </p>
              <div className="snc-hero-cta" style={{ marginTop: 32 }}>
                <a href="mailto:dpo@snc.consolle.one" className="snc-btn snc-btn-primary">
                  Falar com o DPO →
                </a>
                <Link href="/contato" className="snc-btn snc-btn-ghost">
                  Solicitar relatório de dados
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── MANIFESTO LGPD ── */}
        <section className="snc-manifesto">
          <div className="snc-manifesto-in">
            <div className="kicker">§ PROPÓSITO</div>
            <blockquote>
              Acreditamos que{' '}
              <span className="grn">dados pessoais</span> são extensões da{' '}
              <span className="it">dignidade humana</span> — não ativos comerciais.
              Nossa missão é viabilizar decisões de crédito, compliance e risco{' '}
              <span className="it">sem comprometer esse princípio</span>.
            </blockquote>
            <div className="snc-values-3col">
              {[
                { title: 'LGPD by Design', desc: 'Privacidade estrutural, não decorativa. Nenhum dado flui sem base legal registrada, finalidade declarada e log auditável.' },
                { title: 'Encarregado (DPO)', desc: 'Designamos um DPO dedicado, ponto de contato para titulares e ANPD. Resposta a solicitações em até 15 dias úteis.' },
                { title: 'ANPD Ready', desc: 'Estrutura preparada para responder a notificações da Autoridade Nacional de Proteção de Dados com relatório de impacto (RIPD) disponível.' },
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

        {/* ── BASES LEGAIS ── */}
        <section style={{ background: 'var(--snc-paper)', padding: '52px 28px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                § Bases Legais de Tratamento
              </div>
              <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(26px,3.5vw,46px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--snc-ink)', maxWidth: 600 }}>
                Cada dado tem uma{' '}
                <span style={{ fontStyle: 'italic', color: '#5a6a7a' }}>razão legal documentada.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, background: 'rgba(15,26,36,.1)', border: '1px solid rgba(15,26,36,.1)' }}>
              {BASES_LEGAIS.map((b) => (
                <div key={b.art} style={{ background: 'var(--snc-paper)', padding: '32px 28px', borderTop: '3px solid var(--snc-brass)' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--snc-brass)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                    {b.art}
                  </div>
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 17, fontWeight: 400, color: 'var(--snc-ink)', marginBottom: 10, lineHeight: 1.2 }}>
                    {b.titulo}
                  </div>
                  <p style={{ fontSize: 13, color: '#7c8699', lineHeight: 1.65, margin: 0 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRINCÍPIOS TÉCNICOS ── */}
        <section style={{ background: 'var(--snc-paper-2)', borderTop: '1px solid rgba(15,26,36,.1)', padding: '52px 28px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                § Princípios Técnicos
              </div>
              <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(26px,3.5vw,46px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--snc-ink)', maxWidth: 620 }}>
                O que{' '}
                <span style={{ fontStyle: 'italic', color: '#5a6a7a' }}>implementamos de fato.</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
              {PRINCIPIOS.map((p) => (
                <div key={p.sigla} style={{ background: 'var(--snc-paper)', border: '1px solid rgba(15,26,36,.1)', padding: '32px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9,
                      color: 'var(--snc-navy)',
                      background: 'var(--snc-brass)',
                      padding: '4px 8px',
                      letterSpacing: '.1em',
                      fontWeight: 700,
                    }}>{p.sigla}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#8a94a3', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                      Princípio
                    </span>
                  </div>
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 17, color: 'var(--snc-ink)', marginBottom: 10, lineHeight: 1.2 }}>
                    {p.titulo}
                  </div>
                  <p style={{ fontSize: 13, color: '#7c8699', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIREITOS DO TITULAR ── */}
        <section style={{ background: 'var(--snc-navy)', padding: '52px 28px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                § Direitos do Titular — Art. 18 LGPD
              </div>
              <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(26px,3.5vw,46px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: '#fff', maxWidth: 600 }}>
                Seus dados.{' '}
                <em style={{ color: '#bcc4d1' }}>Seu controle.</em>
              </h2>
              <p style={{ fontSize: 15, color: '#8a94a3', lineHeight: 1.7, maxWidth: 520, marginTop: 16 }}>
                Qualquer titular pode exercer seus direitos enviando solicitação para{' '}
                <a href="mailto:dpo@snc.consolle.one" style={{ color: 'var(--snc-brass)' }}>
                  dpo@snc.consolle.one
                </a>
                . Respondemos em até 15 dias úteis.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}>
              {DIREITOS.map((d) => (
                <div key={d.n} style={{ background: '#05101f', padding: '28px 24px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--snc-brass)', letterSpacing: '.1em', paddingTop: 3, flexShrink: 0 }}>
                      {d.n}
                    </span>
                    <div>
                      <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 15, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
                        {d.titulo}
                      </div>
                      <p style={{ fontSize: 12, color: '#7c8699', lineHeight: 1.65, margin: 0 }}>{d.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CITAÇÃO CENTRAL ── */}
        <section style={{ background: 'var(--snc-paper)', borderTop: '1px solid rgba(15,26,36,.08)', padding: '52px 28px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ borderLeft: '4px solid var(--snc-brass)', paddingLeft: 36 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
                § Posição da Consolle Data Intelligence
              </div>
              <blockquote style={{
                fontFamily: "'Libre Caslon Text', serif",
                fontSize: 'clamp(18px, 2.2vw, 26px)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'var(--snc-ink)',
                lineHeight: 1.5,
                margin: 0,
              }}>
                "Privacidade e utilidade dos dados não são opostos. São complementares quando a
                arquitetura é honesta desde o início. Construímos o SNC para provar esse ponto
                — e continuamos provando a cada consulta auditada."
              </blockquote>
              <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--snc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--snc-brass)' }}>CDI</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-ink)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    Consolle Data Intelligence
                  </div>
                  <div style={{ fontSize: 11, color: '#8a94a3', marginTop: 2 }}>DPO & Equipe de Governança · SNC</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTATO DPO ── */}
        <section style={{ background: 'var(--snc-paper-2)', borderTop: '1px solid rgba(15,26,36,.1)', padding: '52px 28px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
                § Encarregado de Dados (DPO)
              </div>
              <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(22px,2.5vw,34px)', lineHeight: 1.1, color: 'var(--snc-ink)', marginBottom: 16 }}>
                Canal direto com<br />
                <em style={{ color: '#5a6a7a' }}>o responsável pela privacidade.</em>
              </h2>
              <p style={{ fontSize: 14, color: '#7c8699', lineHeight: 1.7, marginBottom: 28 }}>
                Nosso DPO é o ponto de contato oficial para titulares de dados, parceiros
                e para a Autoridade Nacional de Proteção de Dados (ANPD). Todas as
                solicitações são respondidas em até 15 dias úteis, conforme Art. 18, §3º LGPD.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'E-mail DPO', value: 'dpo@snc.consolle.one' },
                  { label: 'Horário', value: 'Seg–Sex · 09h às 18h (BRT)' },
                  { label: 'Prazo de resposta', value: 'Até 15 dias úteis' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(15,26,36,.08)' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#8a94a3', letterSpacing: '.1em', textTransform: 'uppercase', minWidth: 120 }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--snc-ink)', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--snc-navy)', padding: '36px', borderTop: '4px solid var(--snc-brass)' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--snc-brass)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 20 }}>
                § Certificações Ativas
              </div>
              {[
                { cert: 'ISO 27001', scope: 'Segurança da Informação', status: 'Ativo' },
                { cert: 'SOC 2 Tipo II', scope: 'Segurança, Disponibilidade e Confidencialidade', status: 'Ativo' },
                { cert: 'LGPD', scope: 'Lei 13.709/2018 — Conformidade total', status: 'By Design' },
                { cert: 'BCB 4.893', scope: 'Resolução Banco Central do Brasil', status: 'Ativo' },
                { cert: 'RIPD', scope: 'Relatório de Impacto à Proteção de Dados', status: 'Disponível' },
              ].map((c) => (
                <div key={c.cert} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#fff', letterSpacing: '.06em' }}>{c.cert}</div>
                    <div style={{ fontSize: 11, color: '#5a6a7a', marginTop: 2 }}>{c.scope}</div>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: 'var(--snc-green-2)', border: '1px solid var(--snc-green-2)', padding: '3px 8px', letterSpacing: '.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="snc-cta" style={{ padding: '52px 28px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
              § Próximo passo
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 400, lineHeight: 1.08, marginBottom: 14 }}>
              Conformidade que<br />
              <span style={{ fontStyle: 'italic', color: '#bcc4d1' }}>você pode demonstrar.</span>
            </h2>
            <p style={{ color: '#8a94a3', fontSize: 15, lineHeight: 1.6, maxWidth: 420, margin: '0 auto 32px' }}>
              Solicite o dossiê de conformidade LGPD do SNC, incluindo RIPD, registros de
              tratamento e relatório de auditoria independente.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:dpo@snc.consolle.one" className="snc-btn snc-btn-primary">
                Solicitar dossiê LGPD →
              </a>
              <Link href="/contato" className="snc-btn snc-btn-ghost">
                Falar com a equipe
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
