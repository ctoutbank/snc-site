import Link from 'next/link';
import { JOURNEYS } from '@/data/snc-data';

export function JornadasSection() {
  return (
    <section className="snc-journeys">
      <div className="snc-sec" style={{ padding: '0 28px' }}>
        <div className="snc-sec-head">
          <div className="num">§ 04 · JORNADAS</div>
          <h2>
            Pense em <span className="it">problemas.</span><br />Não em APIs.
          </h2>
          <div className="aside">
            Sete caminhos construídos a partir de casos reais de clientes, cada um combinando
            o conjunto exato de módulos para resolver a questão.
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
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: '#8a94a3', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                {j.problem}
              </div>
              <h3>
                {j.title}
                <span className="it">{j.titleItalic}</span>
              </h3>
              <div className="mods">
                {j.modules.map((m) => (
                  <span key={m}>{m}</span>
                ))}
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
  );
}
