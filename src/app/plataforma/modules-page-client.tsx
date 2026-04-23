'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MODULES, areaLabel } from '@/data/snc-data';

const TABS = [
  { area: 'all', label: 'Todos · 20' },
  { area: 'id', label: 'Identidade & Cadastro' },
  { area: 'credito', label: 'Crédito & Risco' },
  { area: 'fraude', label: 'Segurança & Fraude' },
  { area: 'pj', label: 'Empresas & PJ' },
  { area: 'int', label: 'Inteligência Avançada' },
];

export function ModulesPageClient() {
  const [active, setActive] = useState('all');
  const visible = active === 'all' ? MODULES : MODULES.filter((m) => m.area === active);

  return (
    <>
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
            href={`/plataforma/${m.slug}`}
            className="snc-mod-card"
            style={{ textDecoration: 'none' }}
          >
            <div className="tag">M.{String(i + 1).padStart(2, '0')}</div>

            <div className="ds">{areaLabel(m.area)}</div>
            <h4>{m.name}</h4>
            <p>{m.description}</p>
            <div className="bot">
              {m.chips.map((c) => <span key={c} className="snc-chip">{c}</span>)}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
