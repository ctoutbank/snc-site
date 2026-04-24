export function OutrasFontes() {
  const fontes = [
    'SUSEP', 'ANS', 'ANATEL', 'ANAC', 'ANVISA', 'ANP',
    'CNJ', 'TJ Estaduais', 'TJSP / TJRJ', 'TRT', 'Cartório de Protestos', 'Juntas Comerciais',
    'INCRA', 'ANA', 'FUNAI', 'ICMBio',
    'INSS / CNIS', 'CadÚnico', 'SENATRAN', 'SINESP',
  ];

  return (
    <div className="snc-outras-bar">
      <div className="snc-outras-inner">
        {fontes.map((f, i) => (
          <span key={f} className="snc-outras-item">
            {i > 0 && <span className="snc-outras-dot">●</span>}
            {f.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
