'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MODULES, areaLabel } from '@/data/snc-data';

const TABS = [
  { area: 'all', label: 'Todos' },
  { area: 'id', label: 'Identidade & Cadastro' },
  { area: 'credito', label: 'Crédito & Risco' },
  { area: 'fraude', label: 'Segurança & Fraude' },
  { area: 'pj', label: 'Empresas & PJ' },
  { area: 'int', label: 'Inteligência Avançada' },
];

export function ModulesPreview() {
  const [active, setActive] = useState('all');
  const visible = active === 'all' ? MODULES : MODULES.filter((m) => m.area === active);

  return (
    <section className="snc-sec" id="modules-preview">
      <div className="snc-sec-head">
        <div className="num">§ 02 · PLATAFORMA</div>
        <h2>
          Vinte módulos. <span className="it">Duzentos e cinquenta e três</span> datasets.
        </h2>
        <div className="aside">
          A maior concentração de fontes oficiais de decisão do país, organizada em
          camadas coesas para integração programática.
        </div>
      </div>

      <div className="snc-prod-tabs">
        {TABS.map((t) => (
          <button
            key={t.area}
            className={active === t.area ? 'on' : ''}
            onClick={() => setActive(t.area)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="snc-prod-grid">
        {visible.map((m, i) => (
          <Link
            key={m.slug}
            href={`/snc/plataforma/${m.slug}`}
            style={{ textDecoration: 'none' }}
            className="snc-mod-card"
          >
            <div className="tag">M.{String(i + 1).padStart(2, '0')}</div>
            <div className="cnt">
              {m.datasets}
              <sup>datasets</sup>
            </div>
            <div className="ds">{areaLabel(m.area)}</div>
            <h4>{m.name}</h4>
            <p>{m.description}</p>
            <div className="bot">
              {m.chips.map((c) => (
                <span key={c} className="snc-chip">
                  {c}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
