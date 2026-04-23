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
        const dur = 1600;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          el.textContent = String(v) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

const FEATURES = [
  {
    num: 'I',
    title: 'Fontes soberanas',
    desc: 'BCB, Receita Federal, TSE, IBAMA, SICAR, COAF, Serasa, Boa Vista, Quod e SPC — sob contratos institucionais diretos, sem intermediários.',
  },
  {
    num: 'II',
    title: 'Rastreabilidade total',
    desc: 'Toda consulta gera registro auditável com carimbo de tempo, finalidade declarada e fonte primária — pronto para regulador, ANPD e ISO 27001.',
  },
  {
    num: 'III',
    title: 'Latência operacional',
    desc: 'Decisões em menos de 900ms no percentil 95. Arquitetura desenhada para ser chamada a cada transação — não apenas no cadastro.',
  },
  {
    num: 'IV',
    title: 'Conformidade embarcada',
    desc: 'LGPD, Resolução BACEN 4.893, Circular 3.978 e fluxo COAF já estruturados na camada — você contrata a plataforma, herda a conformidade.',
  },
];

export function DatasetsSection() {
  return (
    <section className="snc-ds-premium" id="datasets-sec">
      {/* Cabeçalho editorial */}
      <div className="snc-ds-header">
        <div className="snc-ds-header-left">
          <div className="snc-ds-header-num">§ 06 · DATASETS</div>
          <h2>
            A infraestrutura de dados{' '}
            <span className="it">mais densa</span> do Brasil.
          </h2>
        </div>
        <div className="snc-ds-header-right">
          Uma camada operacional única, construída sobre fontes soberanas,
          homologada para decisão em tempo real.
        </div>
      </div>

      {/* Corpo */}
      <div className="snc-ds-body">
        {/* Coluna esquerda */}
        <div className="snc-ds-col-left">

          <p className="snc-ds-copy">
            O SNC não vende dados soltos. Vende a{' '}
            <span className="it" style={{ color: 'var(--snc-green-2)' }}>
              síntese
            </span>
            . Consolidamos o que está disperso em nove fontes públicas e privadas
            em uma malha coesa de APIs documentadas, com SLA único, contrato
            único e faturamento único. O seu time técnico integra em dias, não em
            trimestres.
          </p>
          <div className="snc-ds-ctas">
            <Link href="/contato" className="snc-btn snc-btn-primary">
              Solicitar catálogo completo →
            </Link>
            <Link href="/plataforma" className="snc-btn snc-btn-ghost">
              Ver módulos
            </Link>
          </div>
        </div>

        {/* Coluna direita — 4 features */}
        <div className="snc-ds-features">
          {FEATURES.map((f) => (
            <div key={f.num} className="snc-ds-feat">
              <div className="snc-ds-feat-num">{f.num}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
