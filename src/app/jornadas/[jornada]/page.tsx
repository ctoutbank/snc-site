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
          <section className="snc-narrative-section" style={{
            background: 'var(--snc-paper-2)',
            borderTop: '1px solid rgba(15,26,36,.1)',
            borderBottom: '1px solid rgba(15,26,36,.1)',
            padding: '120px 28px',
          }}>
            <div className="snc-narrative-grid" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 100, alignItems: 'stretch' }}>

              {/* Esquerda — pull-quote fixo */}
              <div className="snc-narrative-left" style={{ paddingTop: 6, display: 'flex', flexDirection: 'column' }}>
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

                {/* Para que serve — premium dark card (coluna esquerda, abaixo do problema) */}
                {j.paraQueServe && j.paraQueServe.length > 0 && (
                  <div style={{
                    background: 'var(--snc-navy)',
                    borderLeft: '4px solid var(--snc-brass)',
                    padding: '28px 32px',
                    marginTop: 'auto',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 20,
                    }}>
                      <div style={{ width: 28, height: 1, background: 'var(--snc-brass)' }} />
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase' }}>
                        Para que serve
                      </div>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {j.paraQueServe.map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 14, color: '#C4CDD8', lineHeight: 1.6 }}>
                          <span style={{
                            color: 'var(--snc-brass)',
                            flexShrink: 0,
                            fontSize: 11,
                            lineHeight: 1.8,
                            fontFamily: 'JetBrains Mono, monospace',
                            letterSpacing: '.04em',
                          }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Direita — texto + § BASE LEGAL (mesmo nível do card esquerdo) */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                </div>

                {/* § BASE LEGAL — navy + brass, mesmo estético do card esquerdo */}
                {j.legalBasis && j.legalBasis.length > 0 && (
                  <div style={{
                    background: 'transparent',
                    borderLeft: '4px solid var(--snc-brass)',
                    padding: '20px 24px',
                    marginTop: 32,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 28, height: 1, background: 'var(--snc-brass)' }} />
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-navy)', letterSpacing: '.2em', textTransform: 'uppercase' }}>
                        § Base Legal
                      </div>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {j.legalBasis.map((item, k) => (
                        <li key={k} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#2e3d4a', lineHeight: 1.6 }}>
                          — {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
              <div className="aside">Do primeiro dado consultado até a entrega do dossiê, tudo rastreável.</div>
            </div>

            {/* Conector de fluxo — compacto */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              margin: '16px 0 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(15,26,36,.12)' }} />
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--snc-brass)', letterSpacing: '.18em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {j.steps.length} ETAPAS{j.delivery ? ' + 1 ENTREGA' : ''}
              </div>
              <div style={{ flex: 1, height: 1, background: 'rgba(15,26,36,.12)' }} />
            </div>

            <div
              className="snc-steps-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${(j.steps.length) + (j.delivery ? 1 : 0)}, 1fr)`,
                gap: 1,
                background: 'radial-gradient(circle, rgba(15,26,36,.18) 1px, #F4EFE4 1px) center/14px 14px',
                border: '1px solid rgba(15,26,36,.1)',
                marginTop: 24,
              }}
            >
              {j.steps.map((step, i) => (
                <div key={step.title} style={{
                  background: '#fff',
                  padding: '36px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9,
                    color: 'var(--snc-brass)',
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                  }}>
                    Etapa {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 44, fontFamily: "'Libre Caslon Text', serif", color: 'var(--snc-brass)', lineHeight: 1, fontWeight: 400, opacity: 0.4 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h4 style={{
                    fontFamily: "'Libre Caslon Text', serif",
                    fontWeight: 400,
                    fontSize: 18,
                    color: 'var(--snc-ink)',
                    lineHeight: 1.15,
                    margin: 0,
                  }}>
                    {step.title}
                  </h4>
                  <p style={{ fontSize: 13, color: '#4a5662', lineHeight: 1.55, margin: 0, flex: 1 }}>
                    {step.desc}
                  </p>
                </div>
              ))}

              {/* Card de entrega — terminal do fluxo */}
              {j.delivery && (
                <div style={{
                  background: 'var(--snc-navy)',
                  padding: '36px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  borderTop: '3px solid var(--snc-green-2)',
                }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9,
                    color: 'var(--snc-green-2)',
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                  }}>
                    Entrega
                  </div>
                  <div style={{
                    fontSize: 44,
                    fontFamily: "'Libre Caslon Text', serif",
                    color: 'var(--snc-green-2)',
                    lineHeight: 1,
                    fontWeight: 400,
                    opacity: 0.3,
                  }}>
                    ✓
                  </div>
                  <h4 style={{
                    fontFamily: "'Libre Caslon Text', serif",
                    fontWeight: 400,
                    fontSize: 18,
                    color: '#fff',
                    lineHeight: 1.15,
                    margin: 0,
                  }}>
                    {j.delivery.title}
                  </h4>
                  <p style={{ fontSize: 13, color: '#8a94a3', lineHeight: 1.55, margin: 0, flex: 1 }}>
                    {j.delivery.desc}
                  </p>
                  {j.delivery.highlights && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                      {j.delivery.highlights.map((h) => (
                        <span key={h} style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 9,
                          color: 'var(--snc-green-2)',
                          border: '1px solid rgba(43,168,74,.3)',
                          padding: '3px 8px',
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                        }}>
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
