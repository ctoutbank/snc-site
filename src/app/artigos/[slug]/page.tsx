import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, getBlogPost } from '@/data/blog-data';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Artigos SNC`,
    description: post.excerpt,
  };
}

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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && p.category === post.category
  ).slice(0, 3);

  const catColor = CATEGORY_COLORS[post.category] ?? 'var(--snc-brass)';

  return (
    <>
      <SiteNav />

      {/* ── Hero ── */}
      <section className="snc-hero" style={{ minHeight: 360 }}>
        <div className="snc-hero-bg" style={{ background: 'var(--snc-navy)' }} />
        <div className="snc-hero-inner" style={{ paddingBottom: 48 }}>
          <div className="snc-hero-meta">
            <Link href="/artigos" style={{ color: 'inherit', opacity: 0.7, fontSize: 12 }}>
              Blog
            </Link>
            <span style={{ opacity: 0.4, margin: '0 8px' }}>›</span>
            <span style={{ color: catColor, fontSize: 12 }}>{post.category}</span>
          </div>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              color: catColor,
              border: `1px solid ${catColor}`,
              padding: '4px 10px',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
            }}>
              {post.category}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#5a6a7a', letterSpacing: '.08em' }}>
              {post.readTime} de leitura
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#5a6a7a', letterSpacing: '.08em' }}>
              {formatDate(post.date)}
            </span>
          </div>

          <h1
            className="snc-hero-title"
            style={{ marginTop: 18, maxWidth: 680, fontSize: 'clamp(18px, 1.8vw, 24px)', lineHeight: 1.2 }}
          >
            {post.title}
          </h1>
          <p style={{
            fontFamily: "'Libre Caslon Text', serif",
            fontStyle: 'italic',
            fontSize: 14,
            color: '#6a7a8a',
            lineHeight: 1.4,
            margin: '6px 0 0',
            maxWidth: 600,
          }}>
            {post.subtitle}
          </p>

          <div className="snc-hero-lede" style={{ marginTop: 20 }}>
            <p style={{ color: '#8a94a3', fontSize: 15, lineHeight: 1.7, maxWidth: 600, margin: 0 }}>
              {post.excerpt}
            </p>
          </div>
        </div>
      </section>

      {/* ── Barra de autor ── */}
      <div style={{ background: 'var(--snc-paper-2)', borderBottom: '1px solid rgba(15,26,36,.1)', padding: '18px 28px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--snc-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--snc-brass)' }}>SNC</span>
          </div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-ink)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              {post.author}
            </div>
            <div style={{ fontSize: 11, color: '#8a94a3', marginTop: 2 }}>{post.authorRole}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                color: '#6a7a8a',
                background: 'rgba(15,26,36,.06)',
                border: '1px solid rgba(15,26,36,.1)',
                padding: '3px 8px',
                letterSpacing: '.08em',
                textTransform: 'uppercase',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Corpo do artigo ── */}
      <article style={{ background: 'var(--snc-paper)', padding: '80px 28px 120px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          {post.content.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: i === 0 ? 18 : 16,
                color: i === 0 ? '#1e2d3a' : '#3a4a5a',
                lineHeight: 1.85,
                fontWeight: i === 0 ? 500 : 400,
                margin: '0 0 28px',
              }}
            >
              {para}
            </p>
          ))}

          {/* Divisor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '56px 0', opacity: 0.4 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(15,26,36,.2)' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--snc-brass)' }}>§</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(15,26,36,.2)' }} />
          </div>

          {/* CTA inline */}
          <div style={{
            background: 'var(--snc-navy)',
            borderLeft: '4px solid var(--snc-brass)',
            padding: '32px 36px',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 14 }}>
              § Quer ver na prática?
            </div>
            <p style={{ color: '#C4CDD8', fontSize: 15, lineHeight: 1.65, margin: '0 0 24px' }}>
              O SNC oferece demonstrações ao vivo com dados reais do seu setor. Sem compromisso, 45 minutos.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/contato" className="snc-btn snc-btn-primary" style={{ fontSize: 12 }}>
                Falar com um especialista →
              </Link>
              <Link href="/artigos" className="snc-btn snc-btn-ghost" style={{ fontSize: 12 }}>
                ← Voltar ao Blog
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* ── Artigos relacionados ── */}
      {related.length > 0 && (
        <section style={{ background: 'var(--snc-paper-2)', padding: '80px 28px', borderTop: '1px solid rgba(15,26,36,.1)' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 40 }}>
              § Leia também
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${related.length}, 1fr)`, gap: 1, background: 'rgba(15,26,36,.1)', border: '1px solid rgba(15,26,36,.1)' }}>
              {related.map((r) => (
                <Link key={r.slug} href={`/artigos/${r.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: '#fff', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9,
                      color: CATEGORY_COLORS[r.category] ?? 'var(--snc-brass)',
                      border: `1px solid ${CATEGORY_COLORS[r.category] ?? 'var(--snc-brass)'}`,
                      padding: '3px 9px',
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      alignSelf: 'flex-start',
                    }}>
                      {r.category}
                    </span>
                    <h4 style={{ fontFamily: "'Libre Caslon Text', serif", fontWeight: 400, fontSize: 16, color: 'var(--snc-ink)', lineHeight: 1.25, margin: 0 }}>
                      {r.title}
                    </h4>
                    <p style={{ fontSize: 13, color: '#5a6a7a', lineHeight: 1.65, margin: 0, flex: 1 }}>{r.excerpt}</p>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--snc-brass)', letterSpacing: '.1em', marginTop: 8 }}>
                      Ler artigo →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </>
  );
}
