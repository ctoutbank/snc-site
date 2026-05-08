import React from 'react';
import Link from 'next/link';

const STEPS = [
  {
    num: '01',
    title: 'Quem é esse cliente?',
    desc: 'Validação de identidade em tempo real. CPF real, dados batem com a Receita Federal e verificação de "nome frio" ou fraude cadastral.',
    icon: '§',
    url: '/plataforma/verificacao-de-identidade',
  },
  {
    num: '02',
    title: 'Esse cliente vai pagar?',
    desc: 'Análise de score e histórico unificado. Inteligência multibureau com dados do Banco Central e dos principais bureaus nacionais consolidados.',
    icon: '±',
    url: '/plataforma/score-de-credito',
  },
  {
    num: '03',
    title: 'Fornecedor confiável?',
    desc: 'Análise de quadro societário, processos trabalhistas e situação fiscal. Segurança total antes de abrir qualquer conta ou prazo.',
    icon: '∆',
    url: '/plataforma/compliance-e-pep',
  },
  {
    num: '04',
    title: 'Resposta Definitiva',
    desc: 'Entrega do dossiê auditável em conformidade com ISO 27001 e LGPD. Evidência concreta para o jurídico e compliance.',
    icon: '✓',
    url: '/datasets',
  },
];

export function SuperscoreEngine() {
  return (
    <section className="snc-sec" style={{ padding: '120px 28px' }}>
      <div className="snc-sec-head">
        <div className="num">§ O MOTOR</div>
        <h2>A engenharia por trás da <span className="it">decisão.</span></h2>
        <div className="aside">
          Como transformamos dados brutos de múltiplos bureaus em inteligência
          acionável para sua operação de crédito.
        </div>
      </div>

      <div className="snc-eixos-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {STEPS.map((step) => (
          <Link key={step.num} href={step.url} className="snc-eixo-card" style={{ textDecoration: 'none' }}>
            <div className="num">ETAPA {step.num}</div>
            <div className="ic" style={{ fontSize: 24, fontFamily: 'serif' }}>
              {step.icon}
            </div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
            <div className="link">
              DETALHES TÉCNICOS <span className="arr">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
