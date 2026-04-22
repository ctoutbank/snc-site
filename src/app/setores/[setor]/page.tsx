import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SECTORS, MODULES } from '@/data/snc-data';
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
    title: `${s.cat} — ${s.title}`,
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

  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        {/* Hero visual do setor */}
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

        {/* Trust bar com módulos do setor */}
        <div className="snc-trust">
          <div className="snc-trust-in">
            <span className="lab">Pacote</span>
            <div className="items">
              {s.stars.map((star) => <span key={star}>{star}</span>)}
            </div>
          </div>
        </div>

        {/* Módulos recomendados — fallback: primeiros 4 da plataforma */}
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

        {/* CTA */}
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
