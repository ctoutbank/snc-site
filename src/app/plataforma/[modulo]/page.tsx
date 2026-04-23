import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MODULES, areaLabel } from '@/data/snc-data';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

interface Props {
  params: Promise<{ modulo: string }>;
}

export async function generateStaticParams() {
  return MODULES.map((m) => ({ modulo: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modulo } = await params;
  const m = MODULES.find((m) => m.slug === modulo);
  if (!m) return {};
  return {
    title: `${m.name} — Módulo SNC`,
    description: m.fullDescription ?? m.description,
  };
}

const AREA_COLORS: Record<string, string> = {
  id: '#2BA84A',
  credito: '#B8914A',
  fraude: '#e05a5a',
  pj: '#4a7ab8',
  int: '#7a4ab8',
};

export default async function ModuloPage({ params }: Props) {
  const { modulo } = await params;
  const m = MODULES.find((m) => m.slug === modulo);
  if (!m) notFound();

  const areaColor = AREA_COLORS[m.area] ?? '#2BA84A';
  const areaName = areaLabel(m.area);
  const moduleIndex = MODULES.findIndex((x) => x.slug === m.slug) + 1;

  return (
    <div className="snc-root">
      <SiteNav />
      <main>

        {/* ── Hero ── */}
        <section className="snc-hero" style={{ minHeight: 460, background: 'var(--snc-navy)' }}>
          <div className="snc-hero-inner" style={{ paddingBottom: 60 }}>
            <div className="snc-hero-meta">
              <div className="l">
                <span>
                  <span className="seal">§</span>
                  <span style={{ marginLeft: 8, color: areaColor, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase' }}>
                    {areaName}
                  </span>
                </span>
              </div>
              <Link href="/plataforma" style={{ color: 'inherit', opacity: 0.7, fontSize: 12 }}>
                ← Todos os módulos
              </Link>
            </div>

            <div style={{ marginTop: 40 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--snc-brass)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
                M.{String(moduleIndex).padStart(2, '0')} · MÓDULO SNC
              </div>
              <h1 style={{ fontSize: 'clamp(36px,6vw,80px)', fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, lineHeight: .95, letterSpacing: '-0.025em', color: '#fff', marginBottom: 24 }}>
                {m.name}
              </h1>
              <p style={{ fontSize: 17, color: '#bcc4d1', lineHeight: 1.6, maxWidth: 560, marginBottom: 32 }}>
                {m.description}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/contato" className="snc-btn snc-btn-primary">
                  Solicitar Acesso →
                </Link>
                <Link href="/plataforma" className="snc-btn snc-btn-ghost">
                  Ver todos os módulos
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <div style={{ background: 'var(--snc-navy-2)', borderTop: '1px solid #17243b', borderBottom: '1px solid #17243b' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '24px 28px', display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 36, color: '#fff', lineHeight: 1 }}>
                {m.datasets}<sup style={{ fontSize: '.45em', color: 'var(--snc-green-2)', marginLeft: 2 }}>ds</sup>
              </div>
              <div style={{ fontSize: 10, color: '#8a94a3', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 6 }}>Datasets integrados</div>
            </div>
            {m.sla && (
              <div>
                <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 36, color: '#fff', lineHeight: 1 }}>
                  {m.sla}
                </div>
                <div style={{ fontSize: 10, color: '#8a94a3', letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 6 }}>SLA garantido</div>
              </div>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {m.chips.map((chip) => (
                <span key={chip} className="snc-chip" style={{ background: 'rgba(255,255,255,.06)', color: '#cfd6df', borderColor: 'rgba(255,255,255,.14)', padding: '5px 10px', fontSize: 10 }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Descrição completa ── */}
        {m.fullDescription && (
          <section className="snc-sec" style={{ paddingTop: 80, paddingBottom: 60 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start', maxWidth: 1180, margin: '0 auto' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 18 }}>
                  § Sobre o módulo
                </div>
                <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(28px,3.5vw,44px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--snc-ink)', marginBottom: 20 }}>
                  O que o módulo<br />
                  <span style={{ fontStyle: 'italic', color: '#5a6a7a' }}>entrega.</span>
                </h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24 }}>
                  {m.chips.map((chip) => (
                    <span key={chip} className="snc-chip">{chip}</span>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 17, color: '#4a5662', lineHeight: 1.75 }}>
                  {m.fullDescription}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Datasets detalhados ── */}
        {m.datasetItems && m.datasetItems.length > 0 && (
          <section className="snc-sec" style={{ paddingTop: 72, paddingBottom: 72, borderTop: '1px solid rgba(15,26,36,.1)' }}>
            <div style={{ maxWidth: 1180, margin: '0 auto' }}>
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 16 }}>
                  § Datasets incluídos
                </div>
                <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(26px,3vw,40px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--snc-ink)', maxWidth: 520 }}>
                  O que cada um dos <span style={{ fontStyle: 'italic', color: '#5a6a7a' }}>{m.datasets} datasets entrega.</span>
                </h2>
              </div>

              {/* Grid de datasets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 1, background: 'rgba(15,26,36,.1)', border: '1px solid rgba(15,26,36,.1)' }}>
                {m.datasetItems.map((ds, i) => (
                  <div key={ds.id} style={{ background: 'var(--snc-paper)', padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Cabeçalho */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.14em' }}>
                        {String(i + 1).padStart(2, '0')} · {ds.id}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#8a94a3', letterSpacing: '.12em', textTransform: 'uppercase', background: 'rgba(15,26,36,.06)', padding: '3px 8px', border: '1px solid rgba(15,26,36,.1)' }}>
                        {ds.source}
                      </span>
                    </div>
                    {/* Nome */}
                    <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 18, fontWeight: 400, color: 'var(--snc-ink)', lineHeight: 1.2 }}>
                      {ds.name}
                    </div>
                    {/* O que retorna */}
                    <p style={{ fontSize: 13, color: '#5a6a7a', lineHeight: 1.65, margin: 0 }}>
                      {ds.returns}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Use Cases ── */}
        {m.useCases && m.useCases.length > 0 && (
          <section style={{ background: 'var(--snc-paper-2)', borderTop: '1px solid rgba(15,26,36,.1)', padding: '80px 28px' }}>
            <div style={{ maxWidth: 1180, margin: '0 auto' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 18 }}>
                § Casos de uso
              </div>
              <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(28px,3.5vw,44px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--snc-ink)', marginBottom: 48 }}>
                Onde este módulo<br />
                <span style={{ fontStyle: 'italic', color: '#5a6a7a' }}>é decisivo.</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 1, background: 'rgba(15,26,36,.1)', border: '1px solid rgba(15,26,36,.1)' }}>
                {m.useCases.map((uc, i) => (
                  <div key={uc} style={{ background: 'var(--snc-paper)', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.16em' }}>
                      UC.{String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: 20, fontWeight: 400, color: 'var(--snc-ink)', lineHeight: 1.15 }}>
                      {uc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section style={{ background: 'var(--snc-navy)', padding: '80px 28px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
              § Acesso ao módulo
            </div>
            <h2 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 'clamp(28px,4vw,52px)', lineHeight: 1.05, color: '#fff', marginBottom: 20 }}>
              Pronto para integrar<br />
              <span style={{ fontStyle: 'italic', color: '#bcc4d1' }}>{m.name}?</span>
            </h2>
            <p style={{ color: '#8a94a3', fontSize: 16, lineHeight: 1.6, marginBottom: 36 }}>
              Acesso via API REST, documentação técnica pública, sandbox disponível e onboarding assistido.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contato" className="snc-btn snc-btn-primary" style={{ fontSize: 14, padding: '14px 28px' }}>
                Solicitar Acesso →
              </Link>
              <Link href="/plataforma" className="snc-btn snc-btn-ghost" style={{ fontSize: 14, padding: '14px 28px' }}>
                ← Todos os módulos
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
