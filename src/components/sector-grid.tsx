'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SECTORS } from '@/data/snc-data';

function SectorCard({ s, index }: { s: (typeof SECTORS)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/setores/${s.slug}`}
      className="snc-sg-card"
      style={{ textDecoration: 'none' }}
      draggable={false}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Photo */}
      <img
        src={s.image}
        alt={s.cat}
        draggable={false}
        style={{ opacity: hovered ? 0 : 0.2, transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
      />

      {/* Overlay */}
      <div className="snc-sg-overlay" style={{ opacity: hovered ? 0 : 1 }} />

      {/* Default dark */}
      <div className="snc-sg-default" style={{ opacity: hovered ? 0 : 1 }}>
        <div className="sg-num">S.{String(index + 1).padStart(2, '0')}</div>
        <div className="sg-cat">{s.cat}</div>
        <p className="sg-desc">{s.description}</p>
        <div className="sg-metric">
          <span className="sg-val">{s.case.value}</span>
        </div>
      </div>

      {/* Hover white */}
      <div
        className="snc-sg-hover"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: hovered ? 'auto' : 'none',
        }}
      >
        <div>
          <div className="sg-hover-cat">{s.cat}</div>
          <div className="sg-hover-val">{s.case.value}</div>
          <div className="sg-hover-label">{s.case.label}</div>
        </div>
        <p className="sg-hover-text">{s.hoverText}</p>
        <div className="sg-hover-tags">
          {s.stars.slice(0, 3).map((star) => (
            <span key={star}>{star}</span>
          ))}
        </div>
        <div className="sg-hover-cta">
          Conhecer o setor
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" width={13} height={13}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

export function SectorGrid() {
  return (
    <div className="snc-sg-root">
      {/* Header */}
      <div className="snc-sg-header">
        <div className="kicker">§ EIXO III · SETORES</div>
        <h2>
          Quatorze verticais da <span className="it">economia regulada.</span>
        </h2>
        <p className="snc-sg-sub">
          Pacotes de dados construídos com especialistas de cada setor — prontos para integrar ao seu fluxo de decisão.
        </p>
      </div>

      {/* Grid 3 colunas */}
      <div className="snc-sg-grid">
        {SECTORS.map((s, i) => (
          <SectorCard key={s.slug} s={s} index={i} />
        ))}
      </div>

      <div className="snc-sg-footer">
        <Link href="/setores" className="snc-btn-outline">
          Ver todos os setores →
        </Link>
      </div>
    </div>
  );
}
