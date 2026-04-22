import Link from 'next/link';

const EIXOS = [
  {
    num: 'EIXO I · PLATAFORMA',
    href: '/plataforma',
    label: 'Ver módulos',
    title: 'Por ',
    titleItalic: 'produto.',
    desc: 'Para áreas técnicas, ISOs e parceiros de integração. Navegue pelos 20 módulos organizados em cinco áreas temáticas — cadastro, crédito, fraude, inteligência empresarial e dados avançados.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    num: 'EIXO II · JORNADAS',
    href: '/jornadas',
    label: 'Ver jornadas',
    title: 'Por ',
    titleItalic: 'problema.',
    desc: 'Para decisores que pensam em resultados, não em APIs. Sete jornadas temáticas combinam módulos para resolver dores reais: crédito responsável, KYC digital, due diligence, prevenção de fraude.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M3 12h18M3 6h18M3 18h12" />
      </svg>
    ),
  },
  {
    num: 'EIXO III · SETORES',
    href: '/setores',
    label: 'Ver setores',
    title: 'Por ',
    titleItalic: 'setor.',
    desc: 'Para prospects com necessidade específica ao seu negócio. Pacotes de dados desenhados para varejo, imobiliário, financeiro, indústria, RH, saúde e apostas regulamentadas.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M4 20V9l8-5 8 5v11M9 20v-7h6v7" />
      </svg>
    ),
  },
];

export function EixosSection() {
  return (
    <section className="snc-eixos">
      <div className="snc-eixos-wrap">
        <div className="snc-eixos-head">
          <div className="kicker">§ 01 · Três caminhos de navegação</div>
          <h2>
            Escolha <span className="it">o seu caminho</span><br />de conformidade.
          </h2>
          <p>
            A arquitetura do SNC foi desenhada para três tipos de interlocutor: quem busca capacidade
            técnica, quem busca resolver um problema de negócio, e quem busca a solução exata para o seu setor.
          </p>
        </div>
        <div className="snc-eixos-grid">
          {EIXOS.map((e) => (
            <Link key={e.href} href={e.href} className="snc-eixo-card" style={{ textDecoration: 'none' }}>
              <div className="num">{e.num}</div>
              <div className="ic">{e.icon}</div>
              <h3>
                {e.title}
                <span className="it">{e.titleItalic}</span>
              </h3>
              <p>{e.desc}</p>
              <div className="link">
                <span>{e.label}</span>
                <span className="arr">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
