import Link from 'next/link';
import { SECTORS } from '@/data/snc-data';

export function SetoresSection() {
  return (
    <section style={{ padding: '120px 28px', maxWidth: 1440, margin: '0 auto' }}>
      <div className="snc-sec-head">
        <div className="num">§ 05 · SETORES</div>
        <h2>
          Soluções por <span className="it">vertical</span> regulada.
        </h2>
        <div className="aside">
          Sete verticais da economia brasileira com pacotes de dados, SLAs e modelos
          de contrato desenhados para o perfil regulatório de cada setor.
        </div>
      </div>
      <div className="snc-sectors-grid">
        {SECTORS.map((s, i) => (
          <Link
            key={s.slug}
            href={`/snc/setores/${s.slug}`}
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
              {s.stars.map((star) => (
                <span key={star}>{star}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
