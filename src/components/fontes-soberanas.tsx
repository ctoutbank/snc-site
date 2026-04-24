export function FontesSoberanas() {
  // Autoridades institucionais — destaque brass itálico
  const spotlight = [
    'Banco Central do Brasil', 'COAF / UNIDAD', 'Receita Federal',
    'Polícia Federal', 'STF', 'STJ', 'TSE', 'Polícia Civil',
    'OFAC — EUA', 'ONU / UNODC', 'INTERPOL', 'TCU', 'CGU',
  ];

  // Demais fontes — sem duplicatas do spotlight
  const rows = [
    {
      label: 'Crédito & Bureaus',
      sources: ['SPC Brasil', 'Serasa Experian', 'Boa Vista SCPC', 'Quod', 'PGFN', 'CVM'],
    },
    {
      label: 'Reguladores',
      sources: ['SUSEP', 'ANS', 'ANATEL', 'ANAC', 'ANVISA', 'ANP'],
    },
    {
      label: 'Justiça & Registros',
      sources: ['CNJ', 'TJ Estaduais', 'TJSP / TJRJ', 'TRT', 'Cartório de Protestos', 'Juntas Comerciais'],
    },
    {
      label: 'Ambiental & Terra',
      sources: ['IBAMA', 'SICAR / CAR', 'INCRA', 'ANA', 'FUNAI', 'ICMBio'],
    },
    {
      label: 'Social & Trânsito',
      sources: ['INSS / CNIS', 'CadÚnico', 'SENATRAN', 'SINESP', 'SENAD', 'DRCI'],
    },
  ];

  return (
    <section className="snc-fontes-section">

      <div className="snc-fontes-top">
        <div className="snc-fontes-tag">§ Fontes Soberanas</div>
        <h2 className="snc-fontes-hl">
          Dados de quem <em>o Brasil confia.</em>
        </h2>
        <p className="snc-fontes-count">30 fontes oficiais · 9 categorias · cobertura total.</p>
      </div>

      <div className="snc-fontes-bureaus">
        <div className="snc-fontes-bureaus-list">
          {spotlight.map((b, i) => (
            <span key={b} className="snc-fontes-bureau-item">
              {i > 0 && <span className="snc-fontes-bureau-sep">·</span>}
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="snc-fontes-grid">
        {rows.map((row) => (
          <div key={row.label} className="snc-fontes-row">
            <div className="snc-fontes-row-cat">{row.label}</div>
            <div className="snc-fontes-row-list">
              {row.sources.map((s, i) => (
                <span key={s} className="snc-fontes-row-item">
                  {i > 0 && <span className="snc-fontes-row-sep">·</span>}
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="snc-fontes-bar">
        <span>30 fontes</span>
        <span className="snc-fontes-bar-dot">·</span>
        <span>253 datasets</span>
        <span className="snc-fontes-bar-dot">·</span>
        <span>Uma decisão.</span>
      </div>

    </section>
  );
}
