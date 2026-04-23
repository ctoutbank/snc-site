import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SECTORS, JOURNEYS, MODULES } from '@/data/snc-data';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

interface Props {
  params: Promise<{ setor: string }>;
}

export async function generateStaticParams() {
  return SECTORS.map((s) => ({ setor: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { setor } = await params;
  const s = SECTORS.find((s) => s.slug === setor);
  if (!s) return {};
  return {
    title: `${s.cat} — SNC`,
    description: s.fullDescription || s.description,
  };
}

export default async function SetorPage({ params }: Props) {
  const { setor } = await params;
  const s = SECTORS.find((s) => s.slug === setor);
  if (!s) notFound();

  const relatedModules = MODULES.filter((m) =>
    s.modules?.some((name) =>
      m.name.toLowerCase().includes(name.toLowerCase().replace(/ /g, '').substring(0, 6))
    )
  ).slice(0, 4);

  const relatedJourneys = (s.sectorJourneys ?? [])
    .map((slug) => JOURNEYS.find((j) => j.slug === slug))
    .filter(Boolean) as typeof JOURNEYS;

  return (
    <div className="snc-root">
      <SiteNav />
      <main>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="snc-hero" style={{ minHeight: 560 }}>
          <div className="snc-hero-bg">
            <img src={s.image} alt={s.cat} />
          </div>
          <div className="snc-hero-inner" style={{ paddingBottom: 60 }}>
            <div className="snc-hero-meta">
              <div className="l">
                <span><span className="seal">§</span> {s.cat}</span>
              </div>
              <Link href="/setores" style={{ color: 'inherit', opacity: 0.7, fontSize: 12 }}>
                ← Todos os setores
              </Link>
            </div>
            <h1 style={{ fontSize: 'clamp(42px,7vw,96px)' }}>
              {s.title.replace(/\.$/, '')}<span style={{ fontStyle: 'italic', color: '#bcc4d1' }}>.</span>
            </h1>
            <div className="snc-hero-bottom" style={{ paddingBottom: 40 }}>
              <div className="snc-hero-lede">
                {s.fullDescription || s.description}
              </div>
              <div className="snc-hero-stats" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="s">
                  <div className="n">{s.case.value}</div>
                  <div className="l">{s.case.label}</div>
                </div>
                <div className="s">
                  <div className="n">{s.stars.length}</div>
                  <div className="l">Módulos incluídos</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ─────────────────────────────────────────── */}
        <div className="snc-trust">
          <div className="snc-trust-in">
            <span className="lab">Pacote</span>
            <div className="items">
              {s.stars.map((star) => <span key={star}>{star}</span>)}
            </div>
          </div>
        </div>

        {/* ── NARRATIVA DO SETOR ────────────────────────────────── */}
        {s.narrative && s.narrative.length > 0 && (
          <section className="snc-narrative-section" style={{
            background: 'var(--snc-paper-2)',
            borderTop: '1px solid rgba(15,26,36,.1)',
            borderBottom: '1px solid rgba(15,26,36,.1)',
            padding: '120px 28px',
          }}>
            <div className="snc-narrative-grid" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 100, alignItems: 'stretch' }}>

              {/* Esquerda: pull-quote + para quem é */}
              <div className="snc-narrative-left" style={{ paddingTop: 6, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
                  § O desafio do setor
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
                  &ldquo;{s.title.replace(/\.$/, '')}&rdquo;
                </blockquote>
                <div style={{ marginTop: 28, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#8a94a3', letterSpacing: '.12em', textTransform: 'uppercase' }}>
                  {s.cat}
                </div>

                {s.paraQueServe && s.paraQueServe.length > 0 && (
                  <div style={{
                    background: 'var(--snc-navy)',
                    borderLeft: '4px solid var(--snc-brass)',
                    padding: '28px 32px',
                    marginTop: 'auto',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <div style={{ width: 28, height: 1, background: 'var(--snc-brass)' }} />
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase' }}>
                        Para quem é
                      </div>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {s.paraQueServe.map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: 14, color: '#C4CDD8', lineHeight: 1.6 }}>
                          <span style={{ color: 'var(--snc-brass)', flexShrink: 0, fontSize: 11, lineHeight: 1.8, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.04em' }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Direita: narrativa + base legal */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {s.narrative.map((para, i) => (
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

                {s.legalBasis && s.legalBasis.length > 0 && (
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
                      {s.legalBasis.map((item, k) => (
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

        {/* ── APLICAÇÕES NO SETOR — Opção B (lista numerada) ───── */}
        {relatedJourneys.length > 0 && (
          <section className="snc-sec" style={{ background: 'var(--snc-paper)' }}>
            <div className="snc-sec-head">
              <div className="num">§ APLICAÇÕES</div>
              <h2>Como o SNC <span className="it">se aplica em {s.cat}.</span></h2>
              <div className="aside">
                Jornadas pré-configuradas para os desafios específicos deste setor.
              </div>
            </div>

            <div style={{ maxWidth: 1180, margin: '0 auto', borderTop: '1px solid rgba(15,26,36,.1)' }}>
              {relatedJourneys.map((j, i) => (
                <Link
                  key={j.slug}
                  href={`/jornadas/${j.slug}`}
                  className="snc-sector-journey-row"
                  style={{ textDecoration: 'none' }}
                >
                  {/* Número */}
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 'clamp(28px,3.5vw,48px)',
                    fontWeight: 700,
                    color: 'var(--snc-brass)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                    minWidth: 80,
                  }}>
                    0{i + 1}
                  </div>

                  {/* Título + descrição */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontFamily: "'Libre Caslon Text', serif",
                      fontSize: 'clamp(20px,2.4vw,28px)',
                      fontWeight: 400,
                      color: 'var(--snc-navy)',
                      margin: '0 0 8px',
                      lineHeight: 1.2,
                    }}>
                      {j.title}<span style={{ fontStyle: 'italic', color: '#8a94a3' }}>{j.titleItalic}</span>
                    </h4>
                    <p style={{ fontSize: 14, color: '#6b7785', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
                      {j.description}
                    </p>
                  </div>

                  {/* Chips + seta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {j.modules.slice(0, 3).map((m) => (
                        <span key={m} className="snc-chip" style={{ fontSize: 10 }}>{m}</span>
                      ))}
                    </div>
                    <span style={{
                      color: 'var(--snc-brass)',
                      fontSize: 20,
                      fontFamily: 'monospace',
                      transition: 'transform .2s',
                      flexShrink: 0,
                    }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── MÓDULOS RECOMENDADOS ──────────────────────────────── */}
        <section className="snc-sec">
          <div className="snc-sec-head">
            <div className="num">§ MÓDULOS</div>
            <h2>O pacote de <span className="it">dados para {s.cat}.</span></h2>
            <div className="aside">
              Datasets e módulos pré-configurados, SLAs e modelo de contrato
              desenhados para o perfil regulatório do setor.
            </div>
          </div>
          <div className="snc-prod-grid">
            {(relatedModules.length > 0 ? relatedModules : MODULES.slice(0, 4)).map((m) => (
              <Link
                key={m.slug}
                href={`/plataforma/${m.slug}`}
                className="snc-mod-card"
                style={{ textDecoration: 'none' }}
              >
                <div className="cnt">{m.datasets}<sup>datasets</sup></div>
                <h4>{m.name}</h4>
                <p>{m.description}</p>
                <div className="bot">
                  {m.chips.map((c) => <span key={c} className="snc-chip">{c}</span>)}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="snc-cta" style={{ padding: '80px 28px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
              § SOLUÇÃO SETORIAL
            </div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 400, lineHeight: 1, marginBottom: 24 }}>
              Leve o SNC para <span style={{ fontStyle: 'italic', color: '#bcc4d1' }}>{s.cat}.</span>
            </h2>
            <p style={{ color: '#bcc4d1', fontSize: 16, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 32px' }}>
              Demonstração personalizada com especialista no seu setor. Proposta em 48h.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contato" className="snc-btn snc-btn-primary">
                Solicitar proposta →
              </Link>
              <Link href="/setores" className="snc-btn snc-btn-ghost">
                ← Outros setores
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
