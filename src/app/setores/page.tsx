import type { Metadata } from 'next';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { SectorGrid } from '@/components/sector-grid';

export const metadata: Metadata = {
  title: 'Setores — 14 verticais reguladas · SNC',
  description:
    'Soluções por vertical regulada da economia brasileira: financeiro, varejo, seguros, agronegócio, imobiliário, telecomunicações, indústria, marketplace, RH, governo, saúde, transportes, energia e apostas.',
};

export default function SetoresPage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main style={{ paddingTop: 80 }}>
        <SectorGrid />
      </main>
      <SiteFooter />
    </div>
  );
}
