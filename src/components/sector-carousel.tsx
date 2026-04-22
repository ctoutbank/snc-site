'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { SECTORS } from '@/data/snc-data';

function SectorCard({ s, index }: { s: (typeof SECTORS)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/setores/${s.slug}`}
      className="snc-sc"
      style={{ textDecoration: 'none' }}
      draggable={false}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Photo — hidden on hover */}
      <img
        src={s.image}
        alt={s.cat}
        draggable={false}
        style={{ opacity: hovered ? 0 : 0.2, transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
      />

      {/* Navy overlay — hidden on hover */}
      <div
        className="snc-sc-overlay"
        style={{ opacity: hovered ? 0 : 1 }}
      />

      {/* Default dark content */}
      <div
        className="snc-sc-default"
        style={{ opacity: hovered ? 0 : 1, pointerEvents: hovered ? 'none' : 'auto' }}
      >
        <div className="sc-num">S.{String(index + 1).padStart(2, '0')} / XIV</div>
        <div className="sc-cat">{s.cat}</div>
        <h3>{s.title.replace(/\.$/, '')}<span className="it">.</span></h3>
        <div className="sc-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>

      {/* Hover white content */}
      <div
        className="snc-sc-hover"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
          pointerEvents: hovered ? 'auto' : 'none',
        }}
      >
        <div>
          <div className="sc-hover-num">S.{String(index + 1).padStart(2, '0')}</div>
          <div className="sc-hover-cat">{s.cat}</div>
          <div className="sc-hover-metric">
            <span className="sc-hover-val">{s.case.value}</span>
            <span className="sc-hover-label">{s.case.label}</span>
          </div>
        </div>
        <p className="sc-hover-text">{s.hoverText}</p>
        <div>
          <div className="sc-hover-tags">
            {s.stars.slice(0, 3).map((star) => (
              <span key={star}>{star}</span>
            ))}
          </div>
          <div className="sc-hover-cta">
            Conhecer o setor
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" width={14} height={14}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SectorCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  function onMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeft.current = trackRef.current?.scrollLeft ?? 0;
    if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
  }
  function onMouseUp() {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.4;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  }

  function scroll(dir: 'left' | 'right') {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir === 'right' ? 580 : -580, behavior: 'smooth' });
  }

  return (
    <div className="snc-carousel-root">
      <div className="snc-carousel-header">
        <div>
          <div className="kicker">§ EIXO III · SETORES</div>
          <h2>
            Quatorze verticais da <span className="it">economia regulada.</span>
          </h2>
          <p className="snc-carousel-sub">
            Pacotes de dados construídos com especialistas de cada setor — prontos para integrar ao seu fluxo de decisão.
          </p>
        </div>
        <div className="snc-carousel-nav">
          <button onClick={() => scroll('left')} aria-label="Anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button onClick={() => scroll('right')} aria-label="Próximo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="snc-carousel-track"
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseMove={onMouseMove}
      >
        {SECTORS.map((s, i) => (
          <SectorCard key={s.slug} s={s} index={i} />
        ))}
      </div>
    </div>
  );
}
