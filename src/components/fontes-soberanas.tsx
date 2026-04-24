export function FontesSoberanas() {
  const bureaus = [
    'Banco Central · SCR',
    'SPC Brasil',
    'Serasa Experian',
    'Boa Vista SCPC',
    'Quod',
  ];

  const rows = [
    {
      label: 'Governo Federal',
      sources: ['Receita Federal', 'PGFN', 'CVM', 'SUSEP', 'ANS', 'COAF / UNIDAD'],
    },
    {
      label: 'Segurança Pública',
      sources: ['Polícia Federal', 'Polícia Civil', 'SINESP', 'SENAD', 'ANAC', 'INTERPOL'],
    },
    {
      label: 'Justiça & Eleitoral',
      sources: ['TSE', 'CNJ', 'TJ Estaduais', 'STJ', 'TJSP / TJRJ', 'TRT'],
    },
    {
      label: 'Ambiental & Terra',
      sources: ['IBAMA', 'SICAR / CAR', 'INCRA', 'ANA', 'FUNAI', 'ICMBio'],
    },
    {
      label: 'Registros & Outros',
      sources: ['Cartório de Protestos', 'Juntas Comerciais', 'INSS / CNIS', 'SENATRAN', 'CadÚnico', 'ANP'],
    },
  ];

  return (
    <section className="snc-fontes-section">

      {/* Topo — headline */}
      <div className="snc-fontes-top">
        <div className="snc-fontes-tag">§ Fontes Soberanas</div>
        <h2 className="snc-fontes-hl">
          Dados de quem <em>o Brasil confia.</em>
        </h2>
        <p className="snc-fontes-count">
          30 instituições oficiais — bureaus, órgãos federais,<br />
          segurança pública e registros públicos.
        </p>
      </div>

      {/* Bureaus — banda destacada em navy */}
      <div className="snc-fontes-bureaus">
        <div className="snc-fontes-bureaus-label">Bureaus de Crédito</div>
        <div className="snc-fontes-bureaus-list">
          {bureaus.map((b, i) => (
            <span key={b} className="snc-fontes-bureau-item">
              {i > 0 && <span className="snc-fontes-bureau-sep">·</span>}
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Demais fontes — linhas por categoria */}
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

      {/* Rodapé */}
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
