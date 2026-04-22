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
    title: `${j.title}${j.titleItalic}`,
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
        {/* Hero */}
        <section className="snc-hero" style={{ minHeight: 560 }}>
          <div className="snc-hero-bg">
            <img src={j.image} alt={j.title} />
          </div>
          <div className="snc-hero-inner" style={{ paddingBottom: 60 }}>
            <div className="snc-hero-meta">
              <div className="l">
                <span><span className="seal">§</span> Jornada</span>
              </div>
              <Link href="/jornadas" style={{ color: 'inherit', opacity: 0.7, fontSize: 12 }}>
                ← Todas as jornadas
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

        {/* Módulos incluídos */}
        <div className="snc-trust">
          <div className="snc-trust-in">
            <span className="lab">Módulos</span>
            <div className="items">
              {j.modules.map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Passo a passo */}
        {j.steps && (
          <section className="snc-sec">
            <div className="snc-sec-head">
              <div className="num">§ FLUXO</div>
              <h2>Como <span className="it">funciona.</span></h2>
              <div className="aside">Sequência operacional implementada em {'<'} 1 sprint.</div>
            </div>
            <div className="snc-prod-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              {j.steps.map((step, i) => (
                <div key={step.title} className="snc-mod-card">
                  <div className="tag">Passo {i + 1}</div>
                  <div className="cnt" style={{ fontSize: 56, color: 'var(--snc-brass)' }}>{String(i + 1).padStart(2, '0')}</div>
                  <h4 style={{ fontFamily: 'Georgia, serif' }}>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="snc-cta" style={{ padding: '80px 28px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
              § IMPLEMENTAR ESTA JORNADA
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 400, lineHeight: 1, marginBottom: 24 }}>
              Pronto para resolver <span style={{ fontStyle: 'italic', color: '#bcc4d1' }}>este problema?</span>
            </h2>
            <p style={{ color: '#bcc4d1', fontSize: 16, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 32px' }}>
              Demonstração personalizada de 45 minutos com case prático para o seu setor.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contato" className="snc-btn snc-btn-primary">
                Agendar demonstração →
              </Link>
              <Link href="/plataforma" className="snc-btn snc-btn-ghost">
                Ver todos os módulos
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
