'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

function CountUp({ target, suffix = '', duration = 1200 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          el.textContent = String(v) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix, duration]);
  return <span ref={ref}>0{suffix}</span>;
}

export function SuperscoreHero() {
  return (
    <section className="snc-hero snc-hero-geo">
      <div className="snc-hero-bg" style={{ background: 'var(--snc-navy)', overflow: 'hidden' }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, var(--snc-brass) 0%, transparent 40%), radial-gradient(circle at 80% 70%, var(--snc-green-2) 0%, transparent 40%)`,
          filter: 'blur(100px)'
        }} />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45v-30L30 0z' fill='none' stroke='%23B8914A' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      <div className="snc-hero-inner">
        <div className="snc-hero-meta">
          <div className="l">
            <span>
              <span className="seal">§</span>
              Sistema Nacional de Conformidade · SuperScore
            </span>
            <span>Inteligência Multibureau</span>
          </div>
          <div>ESTADO DA ARTE · 2026</div>
        </div>

        <h1>
          Inteligência <span className="it">decisiva.</span><br />
          Score <span className="grn">unificado.</span>
        </h1>

        <div className="snc-hero-bottom">
          <div className="snc-hero-lede">
            Mais que um bureau. Uma camada de IA que unifica todos os bureaus e o histórico do Banco Central
            em uma única resposta definitiva. Reduza a inadimplência com a visão mais
            completa do mercado brasileiro.

            <div className="snc-hero-cta">
              <Link href="/contato" className="snc-btn snc-btn-primary">
                Agendar Demonstração →
              </Link>
              <a href="https://www.superscore.one" className="snc-btn snc-btn-ghost">
                Acessar SuperScore App
              </a>
            </div>
          </div>

          <div className="snc-hero-stats">
            <div className="s">
              <div className="n"><CountUp target={4} /></div>
              <div className="l">Bureaus Core</div>
            </div>
            <div className="s">
              <div className="n"><CountUp target={200} suffix="ms" /></div>
              <div className="l">Tempo de Resposta</div>
            </div>
            <div className="s">
              <div className="n">
                <CountUp target={98} suffix="%" />
              </div>
              <div className="l">Precisão de Score</div>
            </div>
            <div className="s">
              <div className="n">
                100<sup>%</sup>
              </div>
              <div className="l">Auditável</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
