import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BENEFITS } from '@/data/benefits';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BENEFITS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const b = BENEFITS.find((b) => b.slug === slug);
  if (!b) return {};
  return {
    title: `${b.title} — Valor Estratégico SNC`,
    description: b.fullDescription ?? b.description,
  };
}

export default async function VantagemPage({ params }: Props) {
  const { slug } = await params;
  const b = BENEFITS.find((b) => b.slug === slug);
  if (!b) notFound();

  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        {/* ── Hero ── */}
        <section className="snc-hero snc-hero-geo" style={{ minHeight: 460, background: 'var(--snc-navy)' }}>
          <div className="snc-hero-inner" style={{ paddingBottom: 60 }}>
            <div className="snc-hero-meta">
              <div className="l">
                <span>
                  <span className="seal">{b.icon}</span>
                  <span style={{ marginLeft: 8, color: 'var(--snc-brass)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase' }}>
                    Valor Estratégico
                  </span>
                </span>
              </div>
              <Link href="/superscore" style={{ color: 'inherit', opacity: 0.7, fontSize: 12 }}>
                ← Voltar ao SuperScore
              </Link>
            </div>

            <div style={{ marginTop: 28 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--snc-brass)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
                VANTAGEM EXCLUSIVA
              </div>
              <h1 style={{ fontSize: 'clamp(36px,6vw,80px)', fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, lineHeight: .95, letterSpacing: '-0.025em', color: '#fff', marginBottom: 24 }}>
                {b.title}
              </h1>
              <p style={{ fontSize: 18, color: '#bcc4d1', lineHeight: 1.6, maxWidth: 640, marginBottom: 32 }}>
                {b.description}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/contato" className="snc-btn snc-btn-primary">
                  Saber mais sobre {b.title} →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        {b.metrics && b.metrics.length > 0 && (
          <div style={{ background: 'var(--snc-navy-2)', borderTop: '1px solid #17243b', borderBottom: '1px solid #17243b' }}>
            <div className="snc-mod-statsbar-inner">
              {b.metrics.map((m) => (
                <div key={m.label}>
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 36, color: '#fff', lineHeight: 1 }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: 10, color: '#8a94a3', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 6 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Narrativa ── */}
        <section className="snc-sec" style={{ paddingTop: 80, paddingBottom: 60 }}>
          <div className="snc-mod-split">
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 18 }}>
                § O Valor Real
              </div>
              <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(28px,3.5vw,44px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--snc-ink)', marginBottom: 20 }}>
                Entenda a<br />
                <span style={{ fontStyle: 'italic', color: '#5a6a7a' }}>estratégia.</span>
              </h2>
            </div>
            <div>
              <p style={{ fontSize: 18, color: '#4a5662', lineHeight: 1.75, marginBottom: 24, fontWeight: 500 }}>
                {b.fullDescription}
              </p>
              {b.narrative.map((p, i) => (
                <p key={i} style={{ fontSize: 16, color: '#5a6a7a', lineHeight: 1.7, marginBottom: 16 }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ── Diferenciais ── */}
        <section style={{ background: 'var(--snc-paper-2)', borderTop: '1px solid rgba(15,26,36,.1)', padding: '80px 28px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 18 }}>
              § Diferenciais
            </div>
            <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(28px,3.5vw,44px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--snc-ink)', marginBottom: 48 }}>
              O que nos torna<br />
              <span style={{ fontStyle: 'italic', color: '#5a6a7a' }}>únicos.</span>
            </h2>

            <div className="snc-mod-cards-grid" style={{ background: 'rgba(15,26,36,.12)', border: '1px solid rgba(15,26,36,.12)' }}>
              {b.features.map((f, i) => (
                <div key={f.title} style={{ background: '#ffffff', padding: '36px 32px 40px', display: 'flex', flexDirection: 'column', gap: 0, borderRight: '1px solid rgba(15,26,36,.12)', borderBottom: '1px solid rgba(15,26,36,.12)' }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 8 }}>
                    FEATURE.{String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 72, fontWeight: 400, color: 'var(--snc-brass)', lineHeight: 1, marginBottom: 20, opacity: 0.55 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 20, fontWeight: 400, color: 'var(--snc-ink)', lineHeight: 1.15, marginBottom: 14 }}>
                    {f.title}
                  </div>
                  <p style={{ fontSize: 14, color: '#5a6a7a', lineHeight: 1.75, margin: 0, flex: 1 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
              {Array((4 - (b.features.length % 4)) % 4).fill(null).map((_, i) => (
                <div key={`phantom-feat-${i}`} style={{ background: 'var(--snc-dot-bg)', borderRight: '1px solid rgba(15,26,36,.12)', borderBottom: '1px solid rgba(15,26,36,.12)' }} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Final ── */}
        <section style={{ background: 'var(--snc-navy)', padding: '100px 28px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 24 }}>
              § Próximo Passo
            </div>
            <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(32px,5vw,64px)', lineHeight: 1, color: '#fff', marginBottom: 28 }}>
              Leve o SuperScore para a sua<br />
              <span style={{ fontStyle: 'italic', color: '#bcc4d1' }}>entidade agora.</span>
            </h2>
            <p style={{ color: '#8a94a3', fontSize: 18, lineHeight: 1.6, marginBottom: 44, maxWidth: 600, margin: '0 auto 44px' }}>
              Nossa equipe está pronta para desenhar o modelo de parceria ideal para o seu volume e realidade regional.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contato" className="snc-btn snc-btn-primary" style={{ fontSize: 15, padding: '16px 36px' }}>
                Falar com um Especialista →
              </Link>
              <Link href="/superscore" className="snc-btn snc-btn-ghost" style={{ fontSize: 15, padding: '16px 36px' }}>
                Voltar ao SuperScore
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
