export interface SncBenefit {
  slug: string;
  title: string;
  icon: string;
  description: string;
  fullDescription: string;
  narrative: string[];
  features: { title: string; desc: string }[];
  metrics?: { value: string; label: string }[];
}

export const BENEFITS: SncBenefit[] = [
  {
    slug: 'condicao-coletiva',
    title: 'Condição Coletiva',
    icon: '§',
    description: 'Preço de associado, não de varejo. Cada lojista tem seu acesso individual mas herda o poder de escala e negociação do grupo.',
    fullDescription: 'O SuperScore foi desenhado para democratizar o acesso à tecnologia de elite para entidades de classe e associações comerciais. Ao invés de negociações individuais com bureaus, a associação centraliza o volume e transfere a economia diretamente para o associado.',
    narrative: [
      'Historicamente, as melhores tabelas de preço de bureaus de crédito eram reservadas apenas para grandes bancos e varejistas nacionais.',
      'O SNC inverte essa lógica através da Condição Coletiva: o volume de todos os associados é somado para garantir o menor custo unitário por consulta.',
      'Cada lojista mantém sua autonomia técnica e financeira, mas opera sob a "tabela VIP" da federação ou associação comercial.'
    ],
    features: [
      { title: 'Poder de Escala', desc: 'Preços baseados no volume total da associação, permitindo que pequenos lojistas paguem o mesmo que grandes players.' },
      { title: 'Gestão Autônoma', desc: 'Cada associado gerencia seus próprios usuários e relatórios, sem sobrecarga para o administrativo da associação.' },
      { title: 'Faturamento Flexível', desc: 'Opção de faturamento centralizado na entidade ou cobrança direta de cada associado via cartão ou PIX.' }
    ],
    metrics: [
      { value: '-40%', label: 'Redução média de custo' },
      { value: 'Zero', label: 'Taxa de implementação' }
    ]
  },
  {
    slug: 'protecao-juridica',
    title: 'Proteção Jurídica',
    icon: '∆',
    description: 'Ledger auditável de todas as consultas realizadas. Evidência concreta e segura para defesa em processos de Procon e auditorias LGPD.',
    fullDescription: 'Segurança jurídica total em processos de Procon, ações cíveis e auditorias de conformidade LGPD. Cada consulta no ecossistema SNC gera um registro imutável que serve como prova de "Boa-fé" e conformidade regulatória.',
    narrative: [
      'Em disputas judiciais sobre negativações ou recusa de crédito, a prova técnica é o fator decisivo entre o êxito e a condenação.',
      'O SNC entrega um dossiê com hash SHA-256 de cada consulta, provando exatamente quais dados foram utilizados e em qual timestamp a decisão foi tomada.',
      'Isso blinda a associação e o lojista contra alegações de uso indevido de dados ou descumprimento dos ritos do Código de Defesa do Consumidor.'
    ],
    features: [
      { title: 'Ledger Imutável', desc: 'Registro histórico de todas as consultas com integridade garantida por criptografia de ponta a ponta.' },
      { title: 'Conformidade LGPD', desc: 'Gestão nativa de finalidade de consulta e prazos de retenção de dados exigidos pela lei brasileira.' },
      { title: 'Evidência Judicial', desc: 'Exportação de relatórios em PDF auditável prontos para serem anexados em processos administrativos ou judiciais.' }
    ],
    metrics: [
      { value: '100%', label: 'Rastreabilidade' },
      { value: 'SHA-256', label: 'Padrão de Criptografia' }
    ]
  },
  {
    slug: 'painel-da-praca',
    title: 'Painel da Praça',
    icon: '◊',
    description: 'A associação ganha visibilidade agregada da fraude e inadimplência regional em tempo real, sem expor dados individuais sensíveis.',
    fullDescription: 'Inteligência coletiva para proteger o mercado local. O Painel da Praça permite que a diretoria da associação monitore a saúde econômica da região e identifique ondas de fraude antes que elas afetem toda a rede.',
    narrative: [
      'A informação isolada protege um lojista. A informação compartilhada protege a cidade inteira.',
      'O Painel da Praça transforma consultas individuais em dados estatísticos poderosos, respeitando o sigilo de cada transação.',
      'Identifique se um aumento de inadimplência é um evento isolado em um bairro ou uma tendência macroeconômica que exige ação da entidade.'
    ],
    features: [
      { title: 'Visão Macro', desc: 'Dashboard estatístico de inadimplência regional segmentado por setor e faixa etária.' },
      { title: 'Radar de Fraude', desc: 'Identificação de CPFs e padrões de comportamento suspeitos atuando na região em tempo real.' },
      { title: 'Benchmarking Local', desc: 'Permite que o associado compare sua performance de crédito com a média da sua "praça".' }
    ],
    metrics: [
      { value: 'Real-Time', label: 'Atualização de Dados' },
      { value: 'Macro', label: 'Visão Estatística' }
    ]
  },
  {
    slug: 'implementar',
    title: 'Implementar na sua entidade',
    icon: '✓',
    description: 'Transforme sua associação em um hub de inteligência e proteção com a tecnologia SNC.',
    fullDescription: 'O processo de integração do SuperScore na sua entidade é rápido, técnico e gera valor imediato para o associado desde o primeiro dia.',
    narrative: [
      'Mais que um fornecedor de dados, o SNC é um parceiro estratégico para federações e associações de classe.',
      'Nossa equipe de implementação cuida de todo o setup técnico e do treinamento das equipes locais, garantindo uma transição suave.',
      'Em menos de 15 dias, sua entidade pode oferecer o motor de crédito mais moderno do país com a sua própria marca e governança.'
    ],
    features: [
      { title: 'Setup Acelerado', desc: 'Implementação completa em menos de duas semanas, incluindo integração de APIs e portais.' },
      { title: 'White-Label Ready', desc: 'Possibilidade de customização visual para manter a identidade da sua associação na plataforma.' },
      { title: 'Suporte VIP', desc: 'Canal exclusivo de atendimento para a diretoria da entidade e suporte técnico 24/7.' }
    ],
    metrics: [
      { value: '< 15 dias', label: 'Tempo de Setup' },
      { value: '24/7', label: 'Suporte Técnico' }
    ]
  }
];
