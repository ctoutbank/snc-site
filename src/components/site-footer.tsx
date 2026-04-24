'use client';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="snc-footer">
      <div className="snc-foot-in">
        <div className="snc-foot-top">
          <div className="brand">
            <img src="/snc-logo.png" alt="SNC" />
            <p>Sistema Nacional de Conformidade. Infraestrutura brasileira de inteligência de dados para decisão em tempo real. Conformidade LGPD e BCB 4.893.</p>

            {/* E-mail institucional — estilo monospace brass + email branco */}
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'var(--snc-brass)',
                letterSpacing: '.22em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                E-mail institucional
              </div>
              <a
                href="mailto:contato@snc.consolle.one"
                style={{
                  fontFamily: 'inherit',
                  fontSize: 12,
                  color: '#7c8699',
                  letterSpacing: 'normal',
                  textDecoration: 'none',
                  display: 'block',
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                contato@snc.consolle.one
              </a>
            </div>
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
            <Link href="/jornadas/prevencao-de-fraude">Prevenção à Fraude</Link>
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
            <Link href="/sobre">Compliance LGPD</Link>
            <Link href="/contato">Contato</Link>
          </div>
          <div className="snc-foot-col">
            <h5>Conteúdo</h5>
            <Link href="/blog">Blog SNC</Link>
            <Link href="/jornadas">Jornadas</Link>
            <Link href="/datasets">Datasets</Link>
          </div>
        </div>
        <div className="snc-foot-bot">
          <span>© 2026 SNC-Sistema Nacional de Conformidade · Consolle Data Intelligence · Todos os direitos reservados</span>
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
