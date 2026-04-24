export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  category: string;
  author: string;
  authorRole: string;
  readTime: string;
  excerpt: string;
  content: string[];
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'lgpd-e-bureau-de-dados-como-conciliar',
    title: 'LGPD e Bureau de Dados',
    subtitle: 'Conformidade e decisão sem conflito',
    date: '2026-04-18',
    category: 'Compliance',
    author: 'Equipe SNC',
    authorRole: 'Time de Conformidade',
    readTime: '4 min',
    excerpt: 'A LGPD não proíbe o uso de dados para decisões de crédito — ela exige finalidade, necessidade e transparência. Entenda como bureaus de dados operam dentro da lei.',
    content: [
      'A LGPD não proíbe bureaus de dados — ela exige base legal documentada. Para o setor financeiro, o legítimo interesse e a proteção ao crédito (art. 7º, §3º) cobrem a maioria das consultas de CPF e CNPJ.',
      'O que muda é a obrigação de registrar a finalidade de cada consulta e garantir proporcionalidade. O SNC gera log auditável com timestamp e fonte primária em cada chamada, automaticamente.',
      'A ANPD já sinalizou que score de crédito e verificação de identidade são tratamentos legítimos com transparência. O risco real está em quem não documenta — não em quem consulta.',
    ],
    tags: ['LGPD', 'Compliance', 'Bureau de Dados', 'Crédito'],
  },
  {
    slug: 'kyc-digital-alem-do-documento',
    title: 'KYC Digital além do documento',
    subtitle: 'Verificação multicamada em tempo real',
    date: '2026-04-10',
    category: 'KYC',
    author: 'Equipe SNC',
    authorRole: 'Time de Identidade',
    readTime: '4 min',
    excerpt: 'Verificar um documento não é mais suficiente. A fraude de identidade evoluiu — e o KYC digital precisa acompanhar com dados comportamentais, biometria e análise de rede.',
    content: [
      'Em 2025, o Brasil registrou 4,1 milhões de tentativas de fraude no onboarding digital. A maioria usou documentos autênticos de terceiros — tornando a checagem documental isolada insuficiente.',
      'O SNC combina OCR com detecção de adulteração, biometria com liveness e cruzamento com Receita Federal, DETRAN e bases de dispositivos suspeitos. Tudo em menos de 900ms por verificação.',
      'A Resolução BACEN 4.893 exige trilha de auditoria em cada processo KYC. O SNC entrega timestamp, fonte e resultado de forma nativa — pronto para inspeção regulatória sem configuração adicional.',
    ],
    tags: ['KYC', 'Identidade Digital', 'Fraud Prevention', 'BACEN'],
  },
  {
    slug: 'score-de-credito-como-interpretar',
    title: 'Score de Crédito',
    subtitle: 'Quatro bureaus, uma leitura unificada',
    date: '2026-04-03',
    category: 'Crédito',
    author: 'Equipe SNC',
    authorRole: 'Time de Análise de Risco',
    readTime: '4 min',
    excerpt: 'SPC, Serasa, Boa Vista e Quod usam metodologias diferentes. Entender o que cada bureau mede — e o que não mede — é fundamental para políticas de crédito eficientes.',
    content: [
      'Serasa, SPC, Boa Vista e Quod usam escalas e modelos distintos. Um score 650 no Serasa não equivale a 650 no SPC — distribuições estatísticas e dados de entrada são diferentes em cada bureau.',
      'O erro mais comum é tratar bureaus como intercambiáveis. Cada um pesa diferentemente comércio, histórico financeiro e comportamento de pagamento, gerando resultados divergentes para o mesmo CPF.',
      'Bureaus medem o passado. Combinar score com renda estimada e comportamento transacional é o que separa uma política de risco eficiente de uma decisão baseada em dados parciais.',
    ],
    tags: ['Score', 'Crédito', 'Serasa', 'SPC', 'Boa Vista'],
  },
  {
    slug: 'due-diligence-digital-para-pj',
    title: 'Due Diligence Digital para PJ',
    subtitle: 'Sócios, vínculos e reputação automatizados',
    date: '2026-03-27',
    category: 'Due Diligence',
    author: 'Equipe SNC',
    authorRole: 'Time de Inteligência Empresarial',
    readTime: '4 min',
    excerpt: 'Onboarding de clientes PJ exige mais do que checar o CNPJ. Análise de quadro societário, exposição política dos sócios e mídia negativa são componentes essenciais de uma due diligence efetiva.',
    content: [
      'Um CNPJ regular pode esconder sócios com restrições, empresas em recuperação judicial ou vínculos com PEPs. Nenhum desse risco aparece em uma simples consulta de situação cadastral.',
      'Due diligence eficaz exige quatro camadas: quadro societário completo, verificação de PEP e sanções por sócio, histórico de mídia negativa e situação fiscal federal e estadual.',
      'No SNC, as quatro dimensões são executadas em uma chamada de API com resultado em menos de 2 segundos — score de risco por dimensão e log auditável inclusos.',
    ],
    tags: ['Due Diligence', 'PJ', 'Compliance', 'PEP', 'Sanções'],
  },
  {
    slug: 'prevencao-fraude-invisivel',
    title: 'A Fraude que você não vê',
    subtitle: 'Identidades sintéticas e account takeover',
    date: '2026-03-20',
    category: 'Prevenção de Fraude',
    author: 'Equipe SNC',
    authorRole: 'Time de Antifraude',
    readTime: '4 min',
    excerpt: 'Fraude de identidade sintética combina CPFs reais com dados falsos para construir históricos de crédito limpos. É o tipo de fraude mais difícil de detectar — e o mais custoso.',
    content: [
      'Identidade sintética combina um CPF real — de pessoa falecida ou inativa — com dados fictícios. O perfil passa nas checagens básicas e cultiva histórico por meses antes do bust-out.',
      'A detecção eficaz cruza três dimensões: consistência do CPF com a idade declarada, fingerprint do dispositivo comparado com tentativas anteriores e velocidade das solicitações versus padrão humano.',
      'Account takeover é o segundo vetor mais comum. O monitoramento contínuo pós-onboarding é mais eficaz — desvios de comportamento surgem antes da perda se concretizar.',
    ],
    tags: ['Antifraude', 'Identidade Sintética', 'Account Takeover', 'Segurança'],
  },
  {
    slug: 'pep-e-sancoes-o-que-sua-empresa-precisa-saber',
    title: 'PEP e Sanções Internacionais',
    subtitle: 'AML e compliance anti-lavagem em 2026',
    date: '2026-03-13',
    category: 'Compliance',
    author: 'Equipe SNC',
    authorRole: 'Time de Regulatório',
    readTime: '4 min',
    excerpt: 'Manter uma carteira sem verificação de PEP e sanções pode resultar em multas milionárias e perda de licença. Entenda os riscos e como mitigá-los.',
    content: [
      'PEP é qualquer pessoa que exerceu função pública relevante nos últimos 5 anos, incluindo familiares diretos. Verificação é obrigatória para instituições reguladas pelo BACEN, COAF e CVM.',
      'O OFAC atualiza a SDN List várias vezes por semana. Um cliente aprovado no onboarding pode ser sancionado meses depois — sem monitoramento contínuo, esse risco passa despercebido.',
      'O módulo SNC verifica OFAC, ONU, COAF e PEPs brasileiros em cada consulta. Para fintechs em licenciamento, entregamos documentação técnica para comprovação junto ao regulador.',
    ],
    tags: ['PEP', 'Sanções', 'OFAC', 'COAF', 'AML', 'Compliance'],
  },
  {
    slug: 'enriquecimento-de-base-casos-de-uso',
    title: 'Enriquecimento de Base de Dados',
    subtitle: '5 casos que geram vantagem real',
    date: '2026-03-06',
    category: 'Dados',
    author: 'Equipe SNC',
    authorRole: 'Time de Produto',
    readTime: '4 min',
    excerpt: 'Empresas com bases enriquecidas tomam decisões melhores, personalizam ofertas com mais precisão e identificam oportunidades de cross-sell que bases brutas não revelam.',
    content: [
      'Enriquecimento é adicionar renda estimada, score, vínculos empregatícios e perfil demográfico a uma base que tem só nome, CPF e e-mail. O resultado é uma visão 360° por cliente.',
      'Casos reais: segmentação para crédito com aprovação 4x maior, reativação de inativos com 60% mais eficiência e qualificação de leads B2B por faturamento estimado e número de funcionários.',
      'O uso mais estratégico é compliance retroativo — processar toda a carteira para identificar PEPs e sancionados que passaram pelo onboarding antes de um processo estruturado de verificação.',
    ],
    tags: ['Enriquecimento', 'CRM', 'Dados', 'Marketing', 'Segmentação'],
  },
  {
    slug: 'monitoramento-continuo-pos-onboarding',
    title: 'Monitoramento Contínuo',
    subtitle: 'Risco que muda depois do onboarding',
    date: '2026-02-27',
    category: 'Risco',
    author: 'Equipe SNC',
    authorRole: 'Time de Risco',
    readTime: '4 min',
    excerpt: 'Um cliente aprovado hoje pode ser um risco amanhã. Mudanças em score, inclusão em listas de sanção e sinais de fraude pós-contratação exigem monitoramento ativo.',
    content: [
      'Risco não é estático. Um cliente com score 750 pode chegar a 400 em seis meses. Um fornecedor aprovado pode ter sócios sancionados no trimestre seguinte — sem que o onboarding capture isso.',
      'O módulo SNC acompanha variação de score, inclusão em listas OFAC/ONU, novos processos judiciais e mudanças societárias. Alertas via webhook em tempo real ou relatório diário consolidado.',
      'Clientes que ativaram o módulo registram redução média de 23% na inadimplência 90+ no primeiro ano. ROI direto: menos surpresas na carteira, mais tempo para ação preventiva.',
    ],
    tags: ['Monitoramento', 'Risco', 'Carteira', 'Inadimplência', 'Alertas'],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.category === category);
}

export const BLOG_CATEGORIES = [...new Set(BLOG_POSTS.map((p) => p.category))];
