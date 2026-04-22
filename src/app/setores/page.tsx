import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { SECTORS } from '@/data/snc-data';

export const metadata: Metadata = {
  title: 'Setores — 7 verticais reguladas',
  description:
    'Soluções por vertical regulada da economia brasileira: financeiro, varejo, imobiliário, indústria, RH, saúde e apostas.',
};

// SVG icons per sector — inline for performance, no external deps
const SECTOR_ICONS: Record<string, React.ReactNode> = {
  'varejo-e-commerce': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  'financeiro-fintechs': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  'imobiliario-locacao': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
      <polyline points="9 21 9 12 15 12 15 21"/>
    </svg>
  ),
  'industria-b2b': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="1"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  'rh-recrutamento': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  'saude-planos': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  'betting-igaming': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
};

export default function SetoresPage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        <section style={{ paddingTop: 60, paddingBottom: 120, paddingLeft: 28, paddingRight: 28, maxWidth: 1440, margin: '0 auto' }}>
          <div className="snc-sec-head">
            <div className="num">§ EIXO III · SETORES</div>
            <h2>
              Sete verticais da <span className="it">economia regulada.</span>
            </h2>
            <div className="aside">Pacotes construídos com especialistas de cada setor.</div>
          </div>
          <div className="snc-sectors-grid">
            {SECTORS.map((s, i) => (
              <Link
                key={s.slug}
                href={`/setores/${s.slug}`}
                className={`snc-sector snc-${s.size}`}
                style={{ textDecoration: 'none' }}
              >
                <img src={s.image} alt={s.cat} />
                {/* Icon badge */}
                <div className="s-icon">
                  {SECTOR_ICONS[s.slug]}
                </div>
                <div className="s-num">S.{String(i + 1).padStart(2, '0')} / VII</div>
                <div className="case">
                  <div className="cn">{s.case.value}</div>
                  <div className="cl">{s.case.label}</div>
                </div>
                <div className="s-cat">{s.cat}</div>
                <h3>{s.title.replace(/\.$/, '')}<span className="it">.</span></h3>
                <p>{s.description}</p>
                <div className="stars">
                  {s.stars.map((star) => <span key={star}>{star}</span>)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
