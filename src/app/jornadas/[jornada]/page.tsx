import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JOURNEYS } from '@/data/snc-data';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

interface Props {
  params: Promise<{ jornada: string }>;
}

export async function generateStaticParams() {
  return JOURNEYS.map((j) => ({ jornada: j.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { jornada } = await params;
  const j = JOURNEYS.find((j) => j.slug === jornada);
  if (!j) return {};
  return {
    title: `${j.title}${j.titleItalic} — SNC`,
    description: j.problem + ' ' + j.description,
  };
}

export default async function JornadaPage({ params }: Props) {
  const { jornada } = await params;
  const j = JOURNEYS.find((j) => j.slug === jornada);
  if (!j) notFound();

  return (
    <div className="snc-root">
      <SiteNav />
      <main>

        {/* ── Hero ── */}
        <section className="snc-hero" style={{ minHeight: 560 }}>
          <div className="snc-hero-bg">
            <img src={j.image} alt={j.title} />
          </div>
          <div className="snc-hero-inner" style={{ paddingBottom: 60 }}>
            <div className="snc-hero-meta">
              <div className="l">
                <span><span className="seal">§</span> SNC · Solução</span>
              </div>
              <Link href="/jornadas" style={{ color: 'inherit', opacity: 0.7, fontSize: 12 }}>
                ← Ver soluções
              </Link>
            </div>
            <h1 style={{ fontSize: 'clamp(42px,7vw,96px)' }}>
              {j.title}<br />
              <span className="it">{j.titleItalic}</span>
            </h1>
            <div className="snc-hero-bottom" style={{ paddingBottom: 40 }}>
              <div className="snc-hero-lede">
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a94a3', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 20 }}>
                  {j.problem}
                </div>
                {j.description}
              </div>
              {j.metrics && (
                <div className="snc-hero-stats" style={{ gridTemplateColumns: `repeat(${j.metrics.length},1fr)` }}>
                  {j.metrics.map((m) => (
                    <div key={m.label} className="s">
                      <div className="n" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>{m.value}</div>
                      <div className="l">{m.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Módulos incluídos ── */}
        <div className="snc-trust">
          <div className="snc-trust-in">
            <span className="lab">Módulos</span>
            <div className="items">
              {j.modules.map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* ── Narrativa editorial + Para que serve ── */}
        {j.narrative && j.narrative.length > 0 && (
          <section style={{
            background: 'var(--snc-paper-2)',
            borderTop: '1px solid rgba(15,26,36,.1)',
            borderBottom: '1px solid rgba(15,26,36,.1)',
            padding: '80px 28px',
          }}>
            <div className="snc-narrative-grid" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 80, alignItems: 'start' }}>

              {/* Esquerda — pull-quote fixo */}
              <div className="snc-narrative-left">
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
                  § O problema que resolvemos
                </div>
                <blockquote style={{
                  fontFamily: "'Libre Caslon Text', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(22px,2.8vw,34px)',
                  fontWeight: 400,
                  lineHeight: 1.2,
                  color: 'var(--snc-navy)',
                  borderLeft: '3px solid var(--snc-green-2)',
                  paddingLeft: 24,
                  margin: 0,
                }}>
                  &ldquo;{j.problem}&rdquo;
                </blockquote>
                <div style={{ marginTop: 28, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#8a94a3', letterSpacing: '.12em', textTransform: 'uppercase' }}>
                  {j.title}{j.titleItalic}
                </div>
              </div>

              {/* Direita — texto + para que serve + contato */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {j.narrative.map((para, i) => (
                  <p key={i} style={{
                    fontSize: i === 0 ? 17 : 16,
                    color: i === 0 ? '#2e3d4a' : '#4a5662',
                    lineHeight: 1.8,
                    fontWeight: i === 0 ? 500 : 400,
                    margin: 0,
                  }}>
                    {para}
                  </p>
                ))}

                {/* Para que serve — destaque */}
                {j.paraQueServe && j.paraQueServe.length > 0 && (
                  <div style={{
                    background: 'rgba(43,168,74,.08)',
                    border: '1px solid rgba(43,168,74,.22)',
                    borderRadius: 4,
                    padding: '24px 28px',
                    marginTop: 8,
                  }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 16 }}>
                      Para que serve
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {j.paraQueServe.map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#2e3d4a', lineHeight: 1.55 }}>
                          <span style={{ color: 'var(--snc-green-2)', flexShrink: 0, fontSize: 15, lineHeight: 1.2 }}>→</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Link de contato inline */}
                <div style={{ marginTop: 4 }}>
                  <Link href="/contato" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    color: 'var(--snc-green-2)',
                    textDecoration: 'none',
                    fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '.06em',
                    borderBottom: '1px solid rgba(43,168,74,.3)',
                    paddingBottom: 2,
                  }}>
                    Falar com um especialista →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Como funciona ── */}
        {j.steps && (
          <section className="snc-sec">
            <div className="snc-sec-head">
              <div className="num">§ ETAPAS</div>
              <h2>Como <span className="it">funciona.</span></h2>
              <div className="aside">Sequência operacional pronta para integrar em menos de 1 sprint.</div>
            </div>
            <div className="snc-prod-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              {j.steps.map((step, i) => (
                <div key={step.title} className="snc-mod-card">
                  <div className="tag">Etapa {i + 1}</div>
                  <div className="cnt" style={{ fontSize: 56, color: 'var(--snc-brass)' }}>{String(i + 1).padStart(2, '0')}</div>
                  <h4 style={{ fontFamily: 'Georgia, serif' }}>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="snc-cta" style={{ padding: '80px 28px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
              § SOLICITAR ACESSO
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 400, lineHeight: 1, marginBottom: 24 }}>
              Quer ver como funciona<span style={{ fontStyle: 'italic', color: '#bcc4d1' }}> na prática?</span>
            </h2>
            <p style={{ color: '#bcc4d1', fontSize: 16, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 32px' }}>
              Demonstração de 45 minutos com case real do seu setor. Sem compromisso.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contato" className="snc-btn snc-btn-primary">
                Falar com um especialista →
              </Link>
              <Link href="/plataforma" className="snc-btn snc-btn-ghost">
                Conhecer a plataforma
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
