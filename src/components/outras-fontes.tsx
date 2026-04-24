export function OutrasFontes() {
  const fontes = [
    'SPC Brasil', 'Serasa Experian', 'Boa Vista SCPC', 'Quod', 'PGFN', 'CVM',
    'SUSEP', 'ANS', 'ANATEL', 'ANAC', 'ANVISA', 'ANP',
    'CNJ', 'TJ Estaduais', 'TJSP / TJRJ', 'TRT', 'Cartório de Protestos', 'Juntas Comerciais',
    'IBAMA', 'SICAR / CAR', 'INCRA', 'ANA', 'FUNAI', 'ICMBio',
    'INSS / CNIS', 'CadÚnico', 'SENATRAN', 'SINESP', 'SENAD', 'DRCI',
  ];

  return (
    <div className="snc-outras-bar">
      <div className="snc-outras-inner">
        <span className="snc-outras-label">Outras Fontes</span>
        <div className="snc-outras-list">
          {fontes.map((f, i) => (
            <span key={f} className="snc-outras-item">
              {i > 0 && <span className="snc-outras-dot">●</span>}
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
