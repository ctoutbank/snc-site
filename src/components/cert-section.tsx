export function CertSection() {
  const certs = [
    { code: 'ISO', name: 'ISO/IEC 27001:2022 — Gestão de Segurança da Informação', status: 'VIGENTE' },
    { code: 'ISO', name: 'ISO/IEC 27701 — Privacidade da Informação', status: 'VIGENTE' },
    { code: 'SOC', name: 'SOC 2 Tipo II — Confidencialidade e Disponibilidade', status: 'VIGENTE' },
    { code: 'ANPD', name: 'Operador LGPD · Encarregado registrado', status: 'ATIVO' },
    { code: 'BACEN', name: 'Conformidade com Resolução 4.893 e Circular 3.978', status: 'ATESTADO' },
    { code: 'COAF', name: 'Prestador cadastrado · Fluxo PLD/FT', status: 'REGISTRO' },
  ];

  return (
    <section className="snc-cert">
      <div className="snc-cert-grid">
        <div className="snc-cert-img">
          <img
            src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1200&q=80"
            alt="Arquitetura institucional"
          />
          <div className="badge">§ CERTIFICAÇÕES</div>
          <div className="seal-b">SNC<br />CERT<br />VI · 2026</div>
        </div>
        <div className="snc-cert-text">
          <div className="kicker">§ 07 · CONFORMIDADE</div>
          <h2>
            Operamos sob <span className="it">o mesmo rigor</span> exigido
            das instituições que nos contratam.
          </h2>
          <p>
            Toda operação do SNC é auditada por terceiros independentes e registrada em ledger
            imutável. Nossa infraestrutura está homologada pelos principais padrões regulatórios
            e de segurança da informação do mercado brasileiro.
          </p>
          <div className="snc-cert-list">
            {certs.map((c) => (
              <div key={c.name} className="r">
                <span className="c">{c.code}</span>
                <span className="n">{c.name}</span>
                <span className="s">{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
