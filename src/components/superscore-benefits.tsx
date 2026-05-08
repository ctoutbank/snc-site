'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const BENEFITS = [
  {
    slug: 'condicao-coletiva',
    title: 'Condição Coletiva',
    icon: '§',
    description: 'Preço de associado, não de varejo. Cada lojista tem seu acesso individual mas herda o poder de escala e negociação do grupo.',
  },
  {
    slug: 'protecao-juridica',
    title: 'Proteção Jurídica',
    icon: '∆',
    description: 'Ledger auditável de todas as consultas realizadas. Evidência concreta e segura para defesa em processos de Procon e auditorias LGPD.',
  },
  {
    slug: 'painel-da-praca',
    title: 'Painel da Praça',
    icon: '◊',
    description: 'A associação ganha visibilidade agregada da fraude e inadimplência regional em tempo real, sem expor dados individuais sensíveis.',
  },
];

export function SuperscoreBenefits() {
  return (
    <section className="snc-sec" style={{ padding: '120px 28px' }}>
      <div className="snc-sec-head" style={{ borderBottomColor: 'rgba(15,26,36,0.08)' }}>
        <div className="num">§ VALOR ESTRATÉGICO</div>
        <h2>Vantagens para o <span className="it">associado</span> e para a <span className="it">associação.</span></h2>
        <div className="aside">
          Desenvolvido sob medida para federações e entidades de classe que buscam
          proteger seus membros com tecnologia de elite.
        </div>
      </div>

      <div className="snc-mod-cards-grid" style={{ background: 'var(--snc-paper-2)', border: '1px solid rgba(15,26,36,0.1)' }}>
        {BENEFITS.map((b, i) => (
          <Link key={b.slug} href="/contato" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="snc-mod-card group hover:bg-[var(--snc-paper-3)] transition-colors"
              style={{ minHeight: '320px', borderRight: '1px solid rgba(15,26,36,0.08)', borderBottom: '1px solid rgba(15,26,36,0.08)' }}
            >
              <div className="tag">§ BENEFÍCIO 0{i + 1}</div>
              <div className="cnt" style={{ fontSize: 32, marginBottom: 20, color: 'var(--snc-brass)' }}>{b.icon}</div>
              <h4 className="snc-serif text-2xl font-normal mb-4 group-hover:text-[var(--snc-brass)] transition-colors">{b.title}</h4>
              <p className="text-sm leading-relaxed text-[var(--snc-muted)]">{b.description}</p>
              <div className="mt-8 text-[10px] uppercase tracking-widest text-[var(--snc-brass)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                Saiba mais →
              </div>
            </motion.div>
          </Link>
        ))}

        <Link href="/contato" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div className="snc-mod-card flex items-center justify-center bg-[var(--snc-navy)] text-white group cursor-pointer overflow-hidden relative" style={{ height: '100%' }}>
            <div className="relative z-10 text-center">
              <div className="snc-mono text-[9px] text-[var(--snc-brass)] uppercase tracking-widest mb-2">PRÓXIMO PASSO</div>
              <div className="text-lg font-serif">Implementar na<br /><span className="italic text-[var(--snc-brass)]">sua entidade</span></div>
              <div className="mt-4 text-[10px] uppercase tracking-widest text-white/40 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                Iniciar Parceria →
              </div>
            </div>
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(var(--snc-brass) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
