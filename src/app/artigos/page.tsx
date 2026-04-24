import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/data/blog-data';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Artigos SNC — Inteligência de Dados, Compliance e Risco',
  description: 'Artigos e análises sobre compliance LGPD, prevenção de fraude, KYC digital, score de crédito e inteligência de dados para o mercado financeiro brasileiro.',
};

const CATEGORY_COLORS: Record<string, string> = {
  Compliance: 'var(--snc-brass)',
  KYC: '#2ba84a',
  Crédito: '#4a9fd4',
  'Due Diligence': '#8b6fc7',
  'Prevenção de Fraude': '#e05a5a',
  Dados: '#4ab8a0',
  Risco: '#e08a3a',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <>
      <SiteNav />

      {/* ── Hero ── */}
      <section className="snc-hero" style={{ minHeight: 420 }}>
        <div className="snc-hero-bg" style={{ background: 'var(--snc-navy)' }} />
        <div className="snc-hero-inner" style={{ paddingBottom: 60 }}>
          <div className="snc-hero-meta">
            <span className="snc-hero-tag">§ BLOG · SNC</span>
          </div>
          <h1 className="snc-hero-title" style={{ marginTop: 28, maxWidth: 700 }}>
            Inteligência de dados{' '}
            <em>para decisões que importam.</em>
          </h1>
          <div className="snc-hero-lede">
            <p style={{ color: '#8a94a3', fontSize: 16, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
              Análises, guias e perspectivas sobre compliance, risco, fraude e regulação para o mercado financeiro brasileiro.
            </p>
          </div>
        </div>
      </section>

      {/* ── Categorias ── */}
      <div style={{ background: 'var(--snc-paper-2)', borderBottom: '1px solid rgba(15,26,36,.1)', padding: '18px 28px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.18em', textTransform: 'uppercase', marginRight: 8 }}>
            Filtrar por
          </span>
          {BLOG_CATEGORIES.map((cat) => (
            <span
              key={cat}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                color: CATEGORY_COLORS[cat] ?? 'var(--snc-brass)',
                border: `1px solid ${CATEGORY_COLORS[cat] ?? 'var(--snc-brass)'}`,
                padding: '4px 10px',
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                opacity: 0.8,
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* ── Destaque principal ── */}
      <section style={{ background: 'var(--snc-paper)', padding: '80px 28px 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 32 }}>
            § Artigo em destaque
          </div>
          <Link href={`/artigos/${featured.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 0,
                border: '1px solid rgba(15,26,36,.12)',
                overflow: 'hidden',
                transition: 'box-shadow .2s',
              }}
              className="snc-blog-featured"
            >
              {/* Lado esquerdo — conteúdo */}
              <div style={{ background: 'var(--snc-navy)', padding: '56px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9,
                      color: CATEGORY_COLORS[featured.category] ?? 'var(--snc-brass)',
                      border: `1px solid ${CATEGORY_COLORS[featured.category] ?? 'var(--snc-brass)'}`,
                      padding: '3px 9px',
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                    }}>
                      {featured.category}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#5a6a7a', letterSpacing: '.08em' }}>
                      {featured.readTime} de leitura
                    </span>
                  </div>
                  <h2 style={{
                    fontFamily: "'Libre Caslon Text', serif",
                    fontWeight: 400,
                    fontSize: 'clamp(22px, 2.2vw, 30px)',
                    color: '#fff',
                    lineHeight: 1.15,
                    margin: '0 0 8px',
                  }}>
                    {featured.title}
                  </h2>
                  <p style={{ fontFamily: "'Libre Caslon Text', serif", fontStyle: 'italic', fontSize: 13, color: '#6a7a8a', lineHeight: 1.4, margin: '0 0 20px', letterSpacing: '.01em' }}>
                    {featured.subtitle}
                  </p>
                  <p style={{ fontSize: 14, color: '#6a7a8a', lineHeight: 1.7, margin: 0 }}>
                    {featured.excerpt}
                  </p>
                </div>
                <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--snc-brass)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {featured.author}
                    </div>
                    <div style={{ fontSize: 11, color: '#5a6a7a' }}>{formatDate(featured.date)}</div>
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.1em' }}>
                    Ler artigo →
                  </span>
                </div>
              </div>
              {/* Lado direito — visual abstrato */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(15,26,36,1) 0%, rgba(30,48,70,1) 60%, rgba(15,26,36,.9) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  fontFamily: "'Libre Caslon Text', serif",
                  fontSize: 'clamp(80px,12vw,160px)',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,.04)',
                  lineHeight: 1,
                  userSelect: 'none',
                  letterSpacing: '-.04em',
                }}>
                  §
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 28,
                  right: 28,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  color: 'rgba(255,255,255,.2)',
                  letterSpacing: '.2em',
                  textTransform: 'uppercase',
                }}>
                  SNC · Blog
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Grade de artigos ── */}
      <section style={{ background: 'var(--snc-paper)', padding: '80px 28px 120px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 40 }}>
            § Todos os artigos
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(15,26,36,.1)', border: '1px solid rgba(15,26,36,.1)' }}>
            {rest.map((post) => (
              <Link key={post.slug} href={`/artigos/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{
                  background: '#fff',
                  padding: '36px 32px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'background .15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9,
                      color: CATEGORY_COLORS[post.category] ?? 'var(--snc-brass)',
                      border: `1px solid ${CATEGORY_COLORS[post.category] ?? 'var(--snc-brass)'}`,
                      padding: '3px 9px',
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                    }}>
                      {post.category}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9aa4b0', letterSpacing: '.06em' }}>
                      {post.readTime}
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: "'Libre Caslon Text', serif",
                    fontWeight: 400,
                    fontSize: 17,
                    color: 'var(--snc-ink)',
                    lineHeight: 1.25,
                    margin: '0 0 14px',
                  }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#5a6a7a', lineHeight: 1.7, margin: 0, flex: 1 }}>
                    {post.excerpt}
                  </p>
                  <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(15,26,36,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#8a94a3', letterSpacing: '.06em' }}>
                      {formatDate(post.date)}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--snc-brass)', letterSpacing: '.1em' }}>
                      Ler →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
