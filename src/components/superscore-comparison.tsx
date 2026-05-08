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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[rgba(15,26,36,0.12)] bg-[var(--snc-paper-2)] overflow-hidden">
          <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[rgba(15,26,36,0.12)]">
            <div className="snc-mono text-[10px] text-[var(--snc-muted)] uppercase tracking-widest mb-6">— MODELO TRADICIONAL</div>
            <h3 className="snc-serif text-3xl font-normal text-[var(--snc-ink)] mb-8">Fragmentação & Risco</h3>

            <div className="space-y-6">
              {data.map((item, i) => (
                <div key={i} className="flex gap-4 items-start opacity-60">
                  <span className="text-[var(--snc-muted)] mt-1">—</span>
                  <p className="text-sm text-[var(--snc-ink)] leading-relaxed">{item.trad}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 md:p-12 bg-white relative">
            <div className="snc-mono text-[10px] text-[var(--snc-brass)] uppercase tracking-widest mb-6">+ SUPERSCORE ENGINE</div>
            <h3 className="snc-serif text-3xl font-normal text-[var(--snc-navy)] mb-8">Unificação & Agilidade</h3>

            <div className="space-y-6">
              {data.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <span className="text-[var(--snc-green-2)] mt-1 font-bold">+</span>
                  <p className="text-sm text-[var(--snc-navy)] font-medium leading-relaxed">{item.super}</p>
                </motion.div>
              ))}
            </div>

            <div className="absolute top-8 right-8 w-12 h-12 border border-[var(--snc-brass)] opacity-10 rounded-full flex items-center justify-center font-serif text-xs">
              SNC
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
