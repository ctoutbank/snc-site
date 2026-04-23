'use client';

import { useRef, useState } from 'react';
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
      <img
        src={s.image}
        alt={s.cat}
        draggable={false}
        style={{ opacity: hovered ? 0 : 0.22, transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
      />
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
        <div className="snc-sg-hover-bottom">
          <div className="sg-hover-tags">
            {s.stars.slice(0, 3).map((star) => (
              <span key={star}>{star}</span>
            ))}
          </div>
          <div className="sg-hover-cta">
            Conhecer o setor
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" width={12} height={12}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function SectorGrid({ mode = 'scroll' }: { mode?: 'scroll' | 'grid' }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  function scrollBy(dir: 'left' | 'right') {
    if (!trackRef.current) return;
    const colWidth = trackRef.current.offsetWidth / 4;
    trackRef.current.scrollBy({
      left: dir === 'right' ? colWidth * 2 : -colWidth * 2,
      behavior: 'smooth',
    });
  }

  function onScroll() {
    if (!trackRef.current) return;
    const { scrollLeft: sl, scrollWidth, clientWidth } = trackRef.current;
    setProgress(sl / (scrollWidth - clientWidth));
    if (sl > 10) setHasScrolled(true);
  }

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
    trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.2;
  }

  return (
    <div className="snc-sg-root">
      {/* Header */}
      <div className="snc-sg-header">
        <div className="kicker">§ EIXO III · SETORES</div>
        <h2>
          {SECTORS.length} verticais da <span className="it">economia regulada.</span>
        </h2>
        <p className="snc-sg-sub">
          Pacotes de dados construídos com especialistas de cada setor — prontos para integrar ao seu fluxo de decisão.
        </p>
      </div>

      {mode === 'grid' ? (
        /* ─── PÁGINA /setores: grid estático 4 colunas ─── */
        <div className="snc-sg-static-grid">
          {SECTORS.map((s, i) => (
            <SectorCard key={s.slug} s={s} index={i} />
          ))}
        </div>
      ) : (
        /* ─── HOMEPAGE: carrossel horizontal com setas ─── */
        <>
          {/* Barra de navegação */}
          <div className="snc-sg-nav-bar">
            <span className="snc-sg-nav-label">{SECTORS.length} setores disponíveis</span>
            <div className="snc-sg-arrows">
              <button className="snc-sg-arrow-btn" onClick={() => scrollBy('left')} aria-label="Anterior">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" width={18} height={18}>
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 5 5 12 12 19" />
                </svg>
              </button>
              <button className="snc-sg-arrow-btn" onClick={() => scrollBy('right')} aria-label="Próximo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" width={18} height={18}>
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>

          {/* Grid 2 linhas scroll horizontal */}
          <div className="snc-sg-scroll-outer">
            <div
              ref={trackRef}
              className="snc-sg-scroll-track"
              onScroll={onScroll}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onMouseMove={onMouseMove}
              style={{ cursor: 'grab' }}
            >
              {SECTORS.map((s, i) => (
                <SectorCard key={s.slug} s={s} index={i} />
              ))}
            </div>
          </div>

          {/* Barra de progresso + hint */}
          <div className="snc-sg-feedback">
            <div className="snc-sg-progress-wrap">
              <div className="snc-sg-progress-bar" style={{ width: `${progress * 100}%` }} />
            </div>
            <span
              className="snc-sg-drag-hint"
              style={{ opacity: hasScrolled ? 0 : 1, pointerEvents: 'none' }}
            >
              ← arraste para explorar →
            </span>
          </div>
        </>
      )}

      <div className="snc-sg-footer">
        <Link href="/setores" className="snc-btn-outline">
          Ver todos os {SECTORS.length} setores →
        </Link>
      </div>
    </div>
  );
}
