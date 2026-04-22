'use client';

import { useState } from 'react';
import { DATASETS, DS_CATEGORIES } from '@/data/snc-data';

export function DatasetsSection() {
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const visible = DATASETS.filter((d) => {
    if (cat && d.category !== cat) return false;
    if (q) {
      const ql = q.toLowerCase();
      return (
        d.id.toLowerCase().includes(ql) ||
        d.name.toLowerCase().includes(ql) ||
        d.bureau.toLowerCase().includes(ql) ||
        d.category.toLowerCase().includes(ql)
      );
    }
    return true;
  });

  return (
    <section className="snc-data-sec" id="datasets-sec">
      <div className="snc-sec-head" style={{ maxWidth: 1440, margin: '0 auto 60px' }}>
        <div className="num">§ 06 · DATASETS</div>
        <h2>
          Explore a <span className="it">biblioteca integral.</span>
        </h2>
        <div className="aside">
          Todo dataset disponível via API, documentado, auditável e rastreável à fonte primária.
          Filtre por módulo, bureau ou finalidade.
        </div>
      </div>
      <div className="snc-data-in">
        <div className="snc-data-left">
          <div className="big">253</div>
          <div className="lbl">
            Datasets integrados, disponíveis sob contrato comercial, operados em regime LGPD-compliant.
          </div>
          <div className="bureaus">
            {[
              ['Banco Central do Brasil', 'SCR · 41 Mi'],
              ['Serasa Experian', '18 datasets'],
              ['Boa Vista SCPC', '12 datasets'],
              ['Quod', '9 datasets'],
              ['SPC Brasil', 'On-demand'],
              ['Receita Federal', 'Oficial'],
              ['TSE', 'PEP · Eleitoral'],
              ['IBAMA / SICAR', 'ESG Rural'],
              ['COAF · LAB', 'AML'],
            ].map(([nm, md]) => (
              <div key={nm} className="bureau">
                <span className="nm">{nm}</span>
                <span className="md">{md}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="snc-ds-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Buscar dataset, bureau ou finalidade…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <span className="cnt">{visible.length} / 253</span>
          </div>
          <div className="snc-ds-cats">
            {DS_CATEGORIES.map((c) => (
              <button
                key={c}
                className={(c === 'TODOS' ? !cat : cat === c) ? 'on' : ''}
                onClick={() => setCat(c === 'TODOS' ? null : c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="snc-ds-list">
            {visible.map((d) => (
              <div key={d.id} className="snc-ds-row">
                <div className="id">{d.id}</div>
                <div className="nm">{d.name}</div>
                <div className="md">{d.category}</div>
                <div className="br">{d.bureau}</div>
                <div className="pr">{d.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
