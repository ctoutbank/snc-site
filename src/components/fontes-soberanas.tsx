export function FontesSoberanas() {
  const groups = [
    {
      label: 'Bureaus de Crédito',
      tier: 'primary',
      sources: [
        { name: 'Banco Central · SCR', desc: 'Crédito Bancário' },
        { name: 'SPC Brasil', desc: 'Restrições' },
        { name: 'Serasa Experian', desc: 'Score & Dívidas' },
        { name: 'Boa Vista SCPC', desc: 'Análise de Risco' },
        { name: 'Quod', desc: 'Open Finance' },
      ],
    },
    {
      label: 'Receita & Fiscal',
      tier: 'secondary',
      sources: [
        { name: 'Receita Federal', desc: 'CPF / CNPJ / IR' },
        { name: 'PGFN', desc: 'Dívida Ativa' },
        { name: 'CVM', desc: 'Mercado de Capitais' },
        { name: 'SUSEP', desc: 'Seguros' },
        { name: 'ANS', desc: 'Saúde Suplementar' },
      ],
    },
    {
      label: 'Segurança Pública',
      tier: 'secondary',
      sources: [
        { name: 'Polícia Federal', desc: 'Antecedentes Federais' },
        { name: 'Polícia Civil', desc: 'Antecedentes Estaduais' },
        { name: 'SINESP / INFOSEG', desc: 'Integração Segurança' },
        { name: 'SENAD', desc: 'Narcotráfico' },
        { name: 'COAF / UNIDAD', desc: 'Atividades Suspeitas' },
      ],
    },
    {
      label: 'Justiça & Eleitoral',
      tier: 'tertiary',
      sources: [
        { name: 'TSE', desc: 'Registro Eleitoral' },
        { name: 'CNJ', desc: 'Processos Judiciais' },
        { name: 'TJ Estaduais', desc: 'Ações Cíveis' },
        { name: 'STJ', desc: 'Jurisprudência Federal' },
        { name: 'TJSP / TJRJ', desc: 'Protestos' },
      ],
    },
    {
      label: 'Ambiental & Propriedade',
      tier: 'tertiary',
      sources: [
        { name: 'IBAMA', desc: 'Infrações Ambientais' },
        { name: 'SICAR / CAR', desc: 'Cadastro Rural' },
        { name: 'INCRA', desc: 'Registro de Imóveis' },
        { name: 'Cartório de Protestos', desc: 'Protestos Extrajudiciais' },
        { name: 'Juntas Comerciais', desc: 'Registro Empresarial' },
      ],
    },
    {
      label: 'Trânsito & Previdência',
      tier: 'tertiary',
      sources: [
        { name: 'SENATRAN', desc: 'Veículos & CNH' },
        { name: 'DETRAN Estadual', desc: 'Multas & Infrações' },
        { name: 'ANTT', desc: 'Transportes' },
        { name: 'INSS / CNIS', desc: 'Vínculos Empregatícios' },
        { name: 'CadÚnico / MDS', desc: 'Benefícios Sociais' },
      ],
    },
  ];

  return (
    <section className="snc-fontes-section">
      {/* Header */}
      <div className="snc-fontes-header">
        <div className="snc-fontes-label">§ Fontes Soberanas</div>
        <div className="snc-fontes-headline">
          Dados de quem{' '}
          <span style={{ fontStyle: 'italic', color: '#5a6a7a' }}>o Brasil reconhece.</span>
        </div>
        <div className="snc-fontes-sub">
          {groups.reduce((t, g) => t + g.sources.length, 0)} fontes oficiais integradas &mdash; bureaus, órgãos federais, segurança pública e registros públicos.
        </div>
      </div>

      {/* Source rows */}
      <div className="snc-fontes-rows">
        {groups.map((group) => (
          <div key={group.label} className={`snc-fontes-row snc-fontes-row--${group.tier}`}>
            <div className="snc-fontes-row-label">{group.label}</div>
            <div className="snc-fontes-row-items">
              {group.sources.map((src, i) => (
                <span key={src.name} className="snc-fontes-item">
                  {i > 0 && <span className="snc-fontes-dot">·</span>}
                  <span className="snc-fontes-name">{src.name}</span>
                  <span className="snc-fontes-desc">{src.desc}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer bar */}
      <div className="snc-fontes-footer">
        <span>30 fontes</span>
        <span className="snc-fontes-footer-dot">·</span>
        <span>253 datasets</span>
        <span className="snc-fontes-footer-dot">·</span>
        <span>Uma decisão.</span>
      </div>
    </section>
  );
}
