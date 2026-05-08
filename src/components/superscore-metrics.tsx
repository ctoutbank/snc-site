import React from 'react';

const METRICS = [
  {
    label: 'Carga Reversa (E-commerce)',
    value: '-68%',
    desc: 'Redução drástica em chargeback após a implementação da camada antifraude do SuperScore.',
  },
  {
    label: 'Redução de Inadimplência',
    value: '-35%',
    desc: 'Impacto médio medido em redes de varejo físico com a unificação de bureaus no crediário.',
  },
  {
    label: 'Velocidade de Resposta',
    value: '< 20s',
    desc: 'Tempo médio de consulta consolidada (Identidade, Score, Restrições e Fraude) no balcão.',
  },
];

export function SuperscoreMetrics() {
  return (
    <section className="snc-sec" style={{ background: 'var(--snc-navy)', color: '#fff', padding: '120px 28px' }}>
      <div className="snc-sec-head" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
        <div className="num" style={{ color: 'var(--snc-brass)' }}>§ PERFORMANCE</div>
        <h2 style={{ color: '#fff' }}>Impacto real na <span className="it" style={{ color: '#8a94a3' }}>última linha.</span></h2>
        <div className="aside" style={{ color: '#8a94a3' }}>
          Métricas consolidadas de operações que migraram do modelo tradicional
          monobureau para a inteligência SuperScore.
        </div>
      </div>

      <div className="snc-mod-cards-grid" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        {METRICS.map((m) => (
          <div key={m.label} className="snc-mod-card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="cnt" style={{ color: 'var(--snc-brass)' }}>
              {m.value}
            </div>
            <div className="ds" style={{ color: '#8a94a3' }}>{m.label}</div>
            <p style={{ color: '#cfd6df' }}>{m.desc}</p>
          </div>
        ))}
        <div className="snc-mod-card" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center' }}>
          <div className="ds" style={{ textAlign: 'center', opacity: 0.5 }}>DATA-DRIVEN DECISIONS</div>
        </div>
      </div>
    </section>
  );
}
