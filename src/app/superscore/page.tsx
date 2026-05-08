import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { SuperscoreHero } from '@/components/superscore-hero';
import { SuperscoreEngine } from '@/components/superscore-engine';
import { SuperscoreMetrics } from '@/components/superscore-metrics';
import { SuperscoreVisual } from '@/components/superscore-visual';
import { SuperscoreComparison } from '@/components/superscore-comparison';
import { SuperscoreBenefits } from '@/components/superscore-benefits';

export const metadata: Metadata = {
  title: 'SuperScore — Sistema Nacional de Conformidade | SNC',
  description: 'Unificação inteligente de todos os bureaus e motor de IA para decisões de crédito instantâneas e precisas.',
};

export default function SuperscorePage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        <SuperscoreHero />

        <div className="snc-trust">
          <div className="snc-trust-in">
            <span className="lab">Bureaus Unificados</span>
            <div className="items">
              <span>SNC — BANCO CENTRAL</span>
              <span>BOA VISTA SCPC</span>
              <span>SPC BRASIL</span>
              <span>SERASA EXPERIAN</span>
            </div>
          </div>
        </div>

        <SuperscoreEngine />
        <SuperscoreComparison />
        <SuperscoreBenefits />
        <SuperscoreMetrics />

        <section className="snc-cert">
          <div className="snc-cert-grid">
            <div>
              <div className="snc-mono" style={{ fontSize: 10, color: 'var(--snc-brass)', textTransform: 'uppercase', marginBottom: 24 }}>
                § VISÃO COMPLETA
              </div>
              <h2 className="snc-serif" style={{ fontSize: 44, fontWeight: 400, color: 'var(--snc-navy)', lineHeight: 1.1, marginBottom: 32 }}>
                O fim da <span className="it">fragmentação</span><br />na análise de dados.
              </h2>
              <p style={{ fontSize: 16, color: '#4a5662', lineHeight: 1.8, marginBottom: 24 }}>
                Historicamente, a análise de crédito no Brasil exige a consulta individual a diversos bureaus,
                gerando custos redundantes e decisões baseadas em dados parciais.
              </p>
              <p style={{ fontSize: 16, color: '#4a5662', lineHeight: 1.8 }}>
                O SuperScore resolve este gap através de uma camada de interoperabilidade que processa
                registros negativos, protestos, ações judiciais e o histórico do Banco Central em milissegundos.
              </p>
            </div>
            <div className="snc-cert-img" style={{ background: 'var(--snc-navy)', borderRadius: 8, overflow: 'visible' }}>
              <SuperscoreVisual />
              <div className="badge" style={{ bottom: -20, top: 'auto', left: 'auto', right: -20, background: 'var(--snc-navy)', zIndex: 10 }}>
                <div style={{ fontSize: 32, fontFamily: "'Libre Caslon Text', serif", color: 'var(--snc-brass)' }}>253+</div>
                <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', opacity: 0.7 }}>Datasets integrados</div>
              </div>
            </div>
          </div>
        </section>

        <section className="snc-cta">
          <div className="snc-cta-in" style={{ gridTemplateColumns: '1fr', textAlign: 'center', padding: '120px 28px' }}>
            <div className="snc-cta-left" style={{ maxWidth: 800, margin: '0 auto' }}>
              <div className="kicker">§ ACESSO IMEDIATO</div>
              <h2>
                Sua próxima decisão <span className="it">com 100% de confiança.</span>
              </h2>
              <p style={{ margin: '0 auto 40px' }}>
                Junte-se às principais instituições financeiras que já operam com a inteligência do SuperScore.
              </p>
              <div className="snc-hero-cta" style={{ justifyContent: 'center' }}>
                <Link href="/contato" className="snc-btn snc-btn-primary">
                  Falar com um especialista →
                </Link>
                <a href="https://www.superscore.one" className="snc-btn snc-btn-ghost">
                  Testar Grátis no App
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
