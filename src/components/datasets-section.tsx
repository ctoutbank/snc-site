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

const SPECS = [
  { label: '253', sub: 'datasets ativos' },
  { label: '9', sub: 'fontes soberanas' },
  { label: '99,9%', sub: 'SLA contratual' },
  { label: '<900ms', sub: 'latência p95' },
];

const FEATURES = [
  {
    num: 'I',
    title: 'Contratos diretos',
    desc: 'BCB, Receita Federal, TSE, IBAMA, COAF, Serasa, Boa Vista, Quod e SPC Brasil — sob contratos institucionais diretos, sem intermediário, sem revenda.',
  },
  {
    num: 'II',
    title: 'Rastreabilidade por operação',
    desc: 'Cada consulta gera registro auditável com carimbo de tempo, finalidade declarada e fonte primária — pronto para ANPD, regulador e ISO 27001.',
  },
  {
    num: 'III',
    title: 'Latência operacional',
    desc: 'Decisões em menos de 900ms no percentil 95. Arquitetura projetada para ser chamada a cada transação, não apenas no cadastro.',
  },
  {
    num: 'IV',
    title: 'Conformidade embarcada',
    desc: 'LGPD, Resolução BCB 4.893, Circular 3.978 e fluxo COAF já estruturados na camada de integração. Você contrata a plataforma e herda a conformidade.',
  },
];

export function DatasetsSection() {
  return (
    <section className="snc-ds-premium" id="datasets-sec">

      {/* Cabeçalho institucional */}
      <div className="snc-ds-header">
        <div className="snc-ds-header-left">
          <div className="snc-ds-header-num">§ 06 · FONTES E DATASETS</div>
          <h2>
            Uma síntese,{' '}
            <span className="it">não uma coleção.</span>
          </h2>
        </div>
        <div className="snc-ds-header-right">
          Nove fontes soberanas. Um esquema de autenticação. Um contrato. Um faturamento.
        </div>
      </div>

      {/* Faixa de especificações técnicas */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,.08)',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        maxWidth: 1180,
        margin: '0 auto 0',
        padding: '0 28px',
      }}>
        {SPECS.map((s, i) => (
          <div key={s.label} style={{
            padding: '24px 0',
            borderLeft: i > 0 ? '1px solid rgba(255,255,255,.08)' : 'none',
            paddingLeft: i > 0 ? 32 : 0,
          }}>
            <div style={{
              fontFamily: "'Libre Caslon Text', serif",
              fontSize: 32,
              color: '#fff',
              lineHeight: 1,
              marginBottom: 4,
            }}>
              {s.label}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              color: '#5a6a7a',
              letterSpacing: '.14em',
              textTransform: 'uppercase',
            }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Corpo */}
      <div className="snc-ds-body">
        {/* Coluna esquerda */}
        <div className="snc-ds-col-left">
          <div className="snc-ds-counter">
            <CountUp target={253} />
          </div>
          <div className="snc-ds-counter-label">
            DATASETS DISTRIBUÍDOS EM 9 FONTES SOBERANAS, HOMOLOGADAS SOB
            CONTRATO INSTITUCIONAL DIRETO.
          </div>
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
          <p className="snc-ds-copy" style={{ opacity: 0.65, fontSize: 14, marginTop: -8 }}>
            Cada fonte passa por homologação contratual direta, padronização de
            schema, monitoramento de SLA e verificação de conformidade LGPD antes
            de ser exposta à API. Não há dados brutos. Há síntese operacional.
          </p>
          <div className="snc-ds-ctas">
            <Link href="/contato" className="snc-btn snc-btn-primary">
              Documentação técnica →
            </Link>
            <Link href="/plataforma" className="snc-btn snc-btn-ghost">
              Ver módulos
            </Link>
          </div>
        </div>

        {/* Coluna direita — 4 pilares técnicos */}
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
