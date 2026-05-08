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

      <div
        className="snc-mod-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          background: 'var(--snc-paper-2)',
          border: '1px solid rgba(15,26,36,0.1)'
        }}
      >
        {BENEFITS.map((b, i) => (
          <Link key={b.slug} href="/contato" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              style={{
                minHeight: 320,
                padding: '36px 28px',
                background: 'var(--snc-paper)',
                borderRight: '1px solid rgba(15,26,36,0.08)',
                borderBottom: '1px solid rgba(15,26,36,0.08)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                cursor: 'pointer',
                transition: 'background .2s'
              }}
            >
              <div
                className="snc-mono"
                style={{ fontSize: 10, color: 'var(--snc-brass)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 24 }}
              >
                § BENEFÍCIO 0{i + 1}
              </div>
              <div style={{ fontSize: 32, marginBottom: 20, color: 'var(--snc-brass)' }}>{b.icon}</div>
              <h4
                className="snc-serif"
                style={{ fontSize: 24, fontWeight: 400, marginBottom: 16, color: 'var(--snc-ink)' }}
              >
                {b.title}
              </h4>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--snc-muted)', flex: 1, margin: 0 }}>{b.description}</p>
              <div
                className="snc-mono"
                style={{ marginTop: 24, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--snc-brass)' }}
              >
                Saiba mais →
              </div>
            </motion.div>
          </Link>
        ))}

        <Link href="/contato" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div
            style={{
              minHeight: 320,
              padding: '36px 28px',
              background: 'var(--snc-navy)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              height: '100%'
            }}
          >
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div
                className="snc-mono"
                style={{ fontSize: 9, color: 'var(--snc-brass)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 8 }}
              >
                PRÓXIMO PASSO
              </div>
              <div style={{ fontSize: 18, fontFamily: "'Libre Caslon Text', serif" }}>
                Implementar na<br />
                <span style={{ fontStyle: 'italic', color: 'var(--snc-brass)' }}>sua entidade</span>
              </div>
              <div
                className="snc-mono"
                style={{ marginTop: 16, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}
              >
                Iniciar Parceria →
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                backgroundImage: 'radial-gradient(var(--snc-brass) 1px, transparent 1px)',
                backgroundSize: '10px 10px'
              }}
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
