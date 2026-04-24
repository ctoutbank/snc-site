import type { Metadata } from 'next';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { DatasetsSection } from '@/components/datasets-section';

export const metadata: Metadata = {
  title: 'Datasets — Biblioteca integral · 253 datasets',
  description:
    '253 datasets de 9 bureaus integrados: SCR, Serasa, Boa Vista, SPC Brasil, Quod, Receita Federal, TSE, IBAMA e COAF. Disponíveis via API em regime LGPD-compliant.',
};

export default function DatasetsPage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        <DatasetsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
