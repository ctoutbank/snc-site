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
