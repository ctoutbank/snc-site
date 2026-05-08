import React from 'react';
import Link from 'next/link';
import { SuperscoreVisual } from './superscore-visual';

export function SuperscoreSection() {
  return (
    <section className="snc-cta" style={{ overflow: 'hidden' }}>
      <div className="snc-hero-bg" style={{ opacity: 0.05, filter: 'grayscale(1)' }}>
        <img src="/images/superscore/integration-focus.png" alt="SuperScore" />
      </div>

      <div className="snc-cta-in" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
        gap: '60px'
      }}>
        <div className="snc-cta-left">
          <div className="kicker">§ PRODUTO EM DESTAQUE</div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}>
            SuperScore: <br />
            A <span className="it">inteligência decisiva</span> <br />
            unificada em 4 bureaus.
          </h2>
          <p style={{ fontSize: 18, opacity: 0.8, maxWidth: 540 }}>
            Unificamos Serasa, Boa Vista, SPC e SNC (Banco Central) em uma única camada de IA.
            A solução definitiva para reduzir a inadimplência e acelerar decisões de crédito
            em milissegundos com precisão cirúrgica.
          </p>
          <div className="snc-hero-cta">
            <Link href="/superscore" className="snc-btn snc-btn-primary">
              Conhecer o SuperScore →
            </Link>
            <Link href="/contato" className="snc-btn snc-btn-ghost">
              Demonstração técnica
            </Link>
          </div>

          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, borderTop: '1px solid rgba(184, 145, 74, 0.2)', paddingTop: 32 }}>
            <div>
              <div style={{ fontSize: 24, fontFamily: "'Libre Caslon Text', serif", color: 'var(--snc-brass)' }}>200ms</div>
              <div className="snc-mono" style={{ fontSize: 9, textTransform: 'uppercase', color: '#8a94a3', letterSpacing: '0.1em' }}>Resposta</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontFamily: "'Libre Caslon Text', serif", color: 'var(--snc-brass)' }}>98.4%</div>
              <div className="snc-mono" style={{ fontSize: 9, textTransform: 'uppercase', color: '#8a94a3', letterSpacing: '0.1em' }}>Precisão</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontFamily: "'Libre Caslon Text', serif", color: 'var(--snc-brass)' }}>4 Bureaus</div>
              <div className="snc-mono" style={{ fontSize: 9, textTransform: 'uppercase', color: '#8a94a3', letterSpacing: '0.1em' }}>Unificação</div>
            </div>
          </div>
        </div>

        <div className="snc-visual-wrapper" style={{
          position: 'relative',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <SuperscoreVisual />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(circle at center, transparent 30%, var(--snc-navy) 100%)',
            opacity: 0.4
          }} />
        </div>
      </div>
    </section>
  );
}
