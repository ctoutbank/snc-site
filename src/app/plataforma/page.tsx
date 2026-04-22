import type { Metadata } from 'next';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ModulesPageClient } from './modules-page-client';

export const metadata: Metadata = {
  title: 'Plataforma — 20 módulos',
  description:
    'Vinte módulos organizados em cinco áreas temáticas — identidade, crédito, fraude, empresas e inteligência avançada. 253 datasets integrados.',
};

export default function PlataformaPage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        <section className="snc-sec" style={{ paddingTop: 60 }}>
          <div className="snc-sec-head">
            <div className="num">§ EIXO I · PLATAFORMA</div>
            <h2>
              Vinte módulos<br />
              <span className="it">operando em coerência.</span>
            </h2>
            <div className="aside">
              Cada módulo é uma camada coesa de datasets integrados, com SLA próprio,
              modelo de consumo por evento e documentação técnica pública.
            </div>
          </div>
          <ModulesPageClient />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
