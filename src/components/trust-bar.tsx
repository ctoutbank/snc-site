export function TrustBar() {
  const sources = [
    'Banco Central · SCR',
    'Serasa Experian',
    'Boa Vista SCPC',
    'SPC Brasil',
    'Receita Federal',
    'TSE',
    'IBAMA / SICAR',
    'COAF',
    'OFAC — EUA',
    'ONU / UNODC',
  ];
  return (
    <div className="snc-trust">
      <div className="snc-trust-in">
        <span className="lab">Fontes soberanas</span>
        <div className="items">
          {sources.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
