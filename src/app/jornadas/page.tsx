import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { JOURNEYS } from '@/data/snc-data';

export const metadata: Metadata = {
  title: 'Jornadas — 7 problemas de negócio',
  description:
    'Sete jornadas temáticas que combinam módulos para resolver dores reais: crédito responsável, KYC digital, due diligence, prevenção de fraude e compliance.',
};

export default function JornadasPage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        <section className="snc-journeys" style={{ paddingTop: 60 }}>
          <div className="snc-sec" style={{ padding: '0 28px' }}>
            <div className="snc-sec-head">
              <div className="num">§ EIXO II · JORNADAS</div>
              <h2>
                Sete jornadas. <span className="it">Sete problemas de negócio.</span>
              </h2>
              <div className="aside">
                Escolha pelo problema que você resolve, não pelo dataset que você usa.
              </div>
            </div>
            {JOURNEYS.map((j, i) => (
              <Link
                key={j.slug}
                href={`/jornadas/${j.slug}`}
                className="snc-journey-row"
                style={{ textDecoration: 'none', display: 'grid' }}
              >
                <div className="j-num">J.{String(i + 1).padStart(2, '0')} / VII</div>
                <div className="j-mid">
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#8a94a3', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                    {j.problem}
                  </div>
                  <h3>
                    {j.title}
                    <span className="it">{j.titleItalic}</span>
                  </h3>
                  <div className="mods">
                    {j.modules.map((m) => <span key={m}>{m}</span>)}
                  </div>
                </div>
                <div className="j-img-wrap">
                  <img className="j-img" src={j.image} alt={j.title} />
                  <span className="j-arr">→</span>
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
