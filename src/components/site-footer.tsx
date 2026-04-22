'use client';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="snc-footer">
      <div className="snc-foot-in">
        <div className="snc-foot-top">
          <div className="brand">
            <img src="/snc-logo.png" alt="SNC" />
            <p>Sistema Nacional de Conformidade. Operado pela Consolle Data Intelligence S.A. CNPJ 33.284.110/0001-48. Empresa brasileira registrada na ANPD.</p>
          </div>
          <div className="snc-foot-col">
            <h5>Plataforma</h5>
            <Link href="/plataforma">Módulos</Link>
            <Link href="/datasets">Datasets</Link>
            <Link href="/sobre">Status · SLA</Link>
          </div>
          <div className="snc-foot-col">
            <h5>Jornadas</h5>
            <Link href="/jornadas/credito-responsavel">Crédito Responsável</Link>
            <Link href="/jornadas/kyc-digital">KYC Digital</Link>
            <Link href="/jornadas/due-diligence">Due Diligence</Link>
            <Link href="/jornadas/prevencao-de-fraude">Prevenção de Fraude</Link>
            <Link href="/jornadas/compliance-regulatorio">Compliance</Link>
          </div>
          <div className="snc-foot-col">
            <h5>Setores</h5>
            <Link href="/setores/financeiro-fintechs">Financeiro</Link>
            <Link href="/setores/varejo-e-commerce">Varejo</Link>
            <Link href="/setores/imobiliario-locacao">Imobiliário</Link>
            <Link href="/setores/industria-b2b">Indústria</Link>
            <Link href="/setores/saude-planos">Saúde</Link>
            <Link href="/setores/betting-igaming">Apostas</Link>
          </div>
          <div className="snc-foot-col">
            <h5>Instituição</h5>
            <Link href="/sobre">Conselho</Link>
            <Link href="/sobre">Carreiras</Link>
            <Link href="/sobre">Compliance LGPD</Link>
            <Link href="/contato">Contato</Link>
          </div>
        </div>
        <div className="snc-foot-bot">
          <span>© MMXXVI Consolle Data Intelligence · Todos os direitos reservados</span>
          <div className="certs">
            <span>ISO 27001</span>
            <span>SOC 2 · II</span>
            <span>LGPD</span>
            <span>BACEN 4.893</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
