import type { Metadata } from 'next';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { HomeHero } from '@/components/home-hero';
import { TrustBar } from '@/components/trust-bar';
import { FontesSoberanas } from '@/components/fontes-soberanas';
import { OutrasFontes } from '@/components/outras-fontes';
import { EixosSection } from '@/components/eixos-section';
import { ModulesPreview } from '@/components/modules-preview';
import { ManifestoSection } from '@/components/manifesto-section';
import { JornadasSection } from '@/components/jornadas-section';
import { SetoresSection } from '@/components/setores-section';
import { DatasetsSection } from '@/components/datasets-section';
import { CertSection } from '@/components/cert-section';
import { CtaSection } from '@/components/cta-section';

export const metadata: Metadata = {
  title: 'SNC — Sistema Nacional de Conformidade',
  description:
    'A infraestrutura decisiva da conformidade no Brasil. 253 datasets de 9 bureaus oficiais em uma única camada operacional de decisão.',
  openGraph: {
    title: 'SNC — Sistema Nacional de Conformidade',
    description: '253 datasets. 9 bureaus. Uma única camada de decisão.',
    images: [{ url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&q=80', width: 1200, height: 630 }],
  },
};

export default function Home() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        <HomeHero />
        <TrustBar />
        <FontesSoberanas />
        <OutrasFontes />
        <EixosSection />
        <ModulesPreview />
        <ManifestoSection />
        <JornadasSection />
        <SetoresSection />
        <DatasetsSection />
        <CertSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
