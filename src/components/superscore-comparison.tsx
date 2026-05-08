'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function SuperscoreComparison() {
  const data = [
    {
      trad: 'Consultas fragmentadas em múltiplos bureaus.',
      super: 'Consolidação inteligente de todos os bureaus.',
    },
    {
      trad: 'Cinco contratos, cinco logins, cinco SLAs',
      super: 'Um contrato, um login, um SLA',
    },
    {
      trad: 'Lojista monta a integração ou faz manual',
      super: 'Resposta unificada em tela e em API',
    },
    {
      trad: 'Responsabilidade integral da LGPD na loja',
      super: 'Conformidade certificada herdada no contrato',
    },
  ];

  return (
    <section className="snc-sec" style={{ padding: '120px 28px', background: 'var(--snc-paper)' }}>
      <div className="snc-sec-head" style={{ marginBottom: 80 }}>
        <div className="num">§ A ESCOLHA</div>
        <h2>Bureaus vendem <span className="it">silos.</span><br />O SuperScore entrega <span className="it">resposta.</span></h2>
        <div className="aside">
          A diferença fundamental entre gerenciar múltiplos fornecedores brutos e operar
          com uma camada de inteligência unificada.
        </div>
      </div>

      <div className="snc-mod-section-wrap">
        <div
          className="snc-superscore-comparison"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 0,
            border: '1px solid rgba(15,26,36,0.12)',
            background: 'var(--snc-paper-2)',
            overflow: 'hidden'
          }}
        >
          {/* Tradicional */}
          <div style={{ padding: '48px', borderRight: '1px solid rgba(15,26,36,0.12)' }}>
            <div
              className="snc-mono"
              style={{ fontSize: 10, color: 'var(--snc-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24 }}
            >
              — MODELO TRADICIONAL
            </div>
            <h3
              className="snc-serif"
              style={{ fontSize: 30, fontWeight: 400, color: 'var(--snc-ink)', marginBottom: 32, lineHeight: 1.1 }}
            >
              Fragmentação &amp; Risco
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {data.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: 0.6 }}>
                  <span style={{ color: 'var(--snc-muted)', marginTop: 4 }}>—</span>
                  <p style={{ fontSize: 14, color: 'var(--snc-ink)', lineHeight: 1.6, margin: 0 }}>{item.trad}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SuperScore */}
          <div style={{ padding: '48px', background: '#fff', position: 'relative' }}>
            <div
              className="snc-mono"
              style={{ fontSize: 10, color: 'var(--snc-brass)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24 }}
            >
              + SUPERSCORE ENGINE
            </div>
            <h3
              className="snc-serif"
              style={{ fontSize: 30, fontWeight: 400, color: 'var(--snc-navy)', marginBottom: 32, lineHeight: 1.1 }}
            >
              Unificação &amp; Agilidade
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {data.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
                >
                  <span style={{ color: 'var(--snc-green-2)', marginTop: 4, fontWeight: 700 }}>+</span>
                  <p style={{ fontSize: 14, color: 'var(--snc-navy)', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>{item.super}</p>
                </motion.div>
              ))}
            </div>

            <div
              style={{
                position: 'absolute',
                top: 32,
                right: 32,
                width: 48,
                height: 48,
                border: '1px solid var(--snc-brass)',
                opacity: 0.1,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'serif',
                fontSize: 12
              }}
            >
              SNC
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
