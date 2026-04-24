'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);
        const dur = 1200;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
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
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export function HomeHero() {
  return (
    <section className="snc-hero">
      <div className="snc-hero-bg">
        <img
          src="/hero-bg.png"
          alt="Congresso Nacional"
        />
      </div>
      <div className="snc-hero-inner">
        <div className="snc-hero-meta">
          <div className="l">
            <span>
              <span className="seal">§</span>
              Autoridade em Conformidade
            </span>
            <span>2019 — 2026</span>
          </div>
          <div>ED. 04 · Abril 2026</div>
        </div>

        <h1>
          A infraestrutura<br />
          <span className="it">decisiva</span> da <span className="grn">conformidade</span><br />
          no Brasil.
        </h1>

        <div className="snc-hero-bottom">
          <div className="snc-hero-lede">
            O SNC consolida 253 datasets de 9 bureaus oficiais em uma única camada operacional
            de decisão — score de crédito, KYC, antifraude, due diligence e compliance regulatório
            — disponível para instituições financeiras, governo e operadores regulados.
            <div className="snc-hero-cta">
              <Link href="/plataforma" className="snc-btn snc-btn-primary">
                Conhecer a plataforma →
              </Link>
              <Link href="/contato" className="snc-btn snc-btn-ghost">
                Agendar apresentação
              </Link>
            </div>
          </div>

          <div className="snc-hero-stats">
            <div className="s">
              <div className="n"><CountUp target={253} /></div>
              <div className="l">Datasets</div>
            </div>
            <div className="s">
              <div className="n"><CountUp target={20} /></div>
              <div className="l">Módulos</div>
            </div>
            <div className="s">
              <div className="n"><CountUp target={9} /></div>
              <div className="l">Bureaus integrados</div>
            </div>
            <div className="s">
              <div className="n">
                99<sup>,98%</sup>
              </div>
              <div className="l">SLA Operacional</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
