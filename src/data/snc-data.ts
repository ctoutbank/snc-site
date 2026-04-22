// SNC — Dados centralizados do site institucional
// Fonte: SNC Institucional - bundle source.html

export interface SncModule {
  slug: string;
  area: 'id' | 'credito' | 'fraude' | 'pj' | 'int';
  name: string;
  datasets: number;
  description: string;
  chips: string[];
  fullDescription?: string;
  useCases?: string[];
  sla?: string;
  priceFrom?: string;
}

export interface SncJourney {
  slug: string;
  title: string;
  titleItalic: string;
  problem: string;
  description: string;
  modules: string[];
  image: string;
  metrics?: { value: string; label: string }[];
  steps?: { title: string; desc: string }[];
  narrative?: string[];
}

export interface SncSector {
  slug: string;
  cat: string;
  title: string;
  size: 'sz-4' | 'sz-6' | 'sz-8' | 'sz-12';
  image: string;
  description: string;
  stars: string[];
  case: { value: string; label: string };
  fullDescription?: string;
  modules?: string[];
}

export interface SncDataset {
  id: string;
  name: string;
  category: string;
  bureau: string;
  price: string;
}

// ===== MODULES =====
export const MODULES: SncModule[] = [
  {
    slug: 'consulta-cadastral',
    area: 'id',
    name: 'Consulta Cadastral',
    datasets: 11,
    description: 'Dados básicos, contatos e endereços validados em fontes oficiais.',
    chips: ['Receita', 'SERPRO', 'CCE'],
    fullDescription: 'Acesso unificado a dados cadastrais completos de pessoas físicas e jurídicas, com validação cruzada em Receita Federal, SERPRO e Cadastro Centralizado de Empresas. Inclui CPF, CNPJ, endereços, contatos, situação fiscal e histórico de alterações.',
    useCases: ['Onboarding digital', 'Enriquecimento de base', 'Validação de cadastro', 'KYC simplificado'],
    sla: '99,95%',
    priceFrom: 'R$ 0,25/consulta',
  },
  {
    slug: 'verificacao-de-identidade',
    area: 'id',
    name: 'Verificação de Identidade',
    datasets: 8,
    description: 'Biometria facial, prova de vida, OCR e validação documental.',
    chips: ['Unico', 'Idwall', 'Serpro'],
    fullDescription: 'Verificação de identidade em camadas: biometria facial liveness detection, OCR de documentos, consulta Serpro e cruzamento com bases do governo federal. Conformidade com LGPD e Resolução BCB.',
    useCases: ['Abertura de conta digital', 'Onboarding regulatório', 'Autenticação reforçada', 'Prevenção de fraude'],
    sla: '99,90%',
    priceFrom: 'R$ 0,90/verificação',
  },
  {
    slug: 'formacao-e-qualificacoes',
    area: 'id',
    name: 'Formação & Qualificações',
    datasets: 10,
    description: 'Histórico profissional, RAIS, conselhos de classe e formação.',
    chips: ['MTE', 'RAIS', 'CFC'],
    fullDescription: 'Validação completa de histórico profissional e educacional: MEC, RAIS, CBO, conselhos de classe (CFC, CREMERS, OAB, etc.), certificações técnicas e experiências declaradas.',
    useCases: ['Background check profissional', 'RH e recrutamento', 'Validação de prestadores', 'Due diligence pessoal'],
    sla: '99,85%',
    priceFrom: 'R$ 1,80/consulta',
  },
  {
    slug: 'certidoes-pf',
    area: 'id',
    name: 'Certidões PF',
    datasets: 4,
    description: 'Certidões negativas, antecedentes e impedimentos governamentais.',
    chips: ['TST', 'TSE', 'Justiça'],
    fullDescription: 'Emissão e verificação de certidões negativas para pessoas físicas em todas as esferas: Justiça Federal, Estadual, Trabalhista (TST), TSE e PGFN. Rastreabilidade e validade documentada.',
    useCases: ['Processos licitatórios', 'Habilitação de fornecedores', 'Compliance corporativo', 'Due diligence'],
    sla: '99,80%',
    priceFrom: 'R$ 1,40/certidão',
  },
  {
    slug: 'score-de-credito',
    area: 'credito',
    name: 'Score de Crédito',
    datasets: 37,
    description: 'Análise financeira multibureau. SCR, SPC, Serasa, Boa Vista, Quod.',
    chips: ['9 bureaus'],
    fullDescription: 'O maior aggregator de score de crédito do Brasil. Consolida SCR Banco Central, SPC Brasil, Serasa Experian, Boa Vista SCPC, Quod e mais 4 fontes em uma única resposta normalizada. Inclui histórico de pagamentos, endividamento e projeção de risco.',
    useCases: ['Concessão de crédito', 'Limites e políticas de risco', 'Scoring para fintechs', 'Financiamento imobiliário'],
    sla: '99,98%',
    priceFrom: 'R$ 1,60/consulta',
  },
  {
    slug: 'risco-financeiro',
    area: 'credito',
    name: 'Risco Financeiro',
    datasets: 14,
    description: 'Endividamento, capacidade de pagamento e projeção de inadimplência.',
    chips: ['SCR BCB'],
    fullDescription: 'Análise profunda de capacidade financeira com dados do SCR Banco Central: carteira de dívidas, responsabilidade por garantias, co-obrigações, histórico de renegociações e projeção actuarial de inadimplência.',
    useCases: ['Crédito consignado', 'Capital de giro PJ', 'Risco de contraparte', 'Monitoramento de portfólio'],
    sla: '99,95%',
    priceFrom: 'R$ 2,80/consulta',
  },
  {
    slug: 'compliance-e-pep',
    area: 'credito',
    name: 'Compliance & PEP',
    datasets: 9,
    description: 'Listas negras, sanções, PEP e exposição política consolidada.',
    chips: ['OFAC', 'ONU', 'TSE'],
    fullDescription: 'Varredura completa em listas de sanções nacionais e internacionais: OFAC, ONU, UE, COAF, ANPD. Identificação de PEP (Pessoa Politicamente Exposta) com graus de exposição e parentes. Conformidade total com COAF Resolução 36.',
    useCases: ['Onboarding PLD/FT', 'KYB (Know Your Business)', 'Monitoramento contínuo', 'Auditorias regulatórias'],
    sla: '99,99%',
    priceFrom: 'R$ 0,35/consulta',
  },
  {
    slug: 'background-check',
    area: 'credito',
    name: 'Background Check',
    datasets: 9,
    description: 'Due diligence completa de pessoas físicas e jurídicas.',
    chips: ['TJ', 'TST', 'TSE'],
    fullDescription: 'Due diligence completa: antecedentes criminais, processos trabalhistas, certidões cíveis, histórico eleitoral, restrições comerciais e mídias negativas. Entregue em relatório estruturado e PDF auditável.',
    useCases: ['Parceiros e fornecedores', 'Cargos de liderança', 'Franqueados', 'M&A e investimentos'],
    sla: '99,90%',
    priceFrom: 'R$ 4,80/relatório',
  },
  {
    slug: 'antifraude',
    area: 'fraude',
    name: 'Antifraude',
    datasets: 17,
    description: 'Indicadores de fraude, KYC reforçado e análise de violações.',
    chips: ['Scoras', 'Phone'],
    fullDescription: 'Motor de antifraude multicamada: score de risco transacional, phone score, email score, device fingerprint, análise de velocidade, histórico de chargeback e violações anteriores. Decisão em < 200ms.',
    useCases: ['E-commerce e marketplace', 'Abertura de contas', 'Transações PIX', 'Emissão de cartão'],
    sla: '99,98%',
    priceFrom: 'R$ 1,15/avaliação',
  },
  {
    slug: 'midia-negativa',
    area: 'fraude',
    name: 'Mídia Negativa',
    datasets: 6,
    description: 'Varredura em notícias, Justiça e registros de má reputação.',
    chips: ['Global'],
    fullDescription: 'Monitoramento de mídia negativa em fontes abertas globais: notícias, portais jurídicos, registros de reclamação (Procon, ReclameAqui) e redes sociais. Análise de sentimento e score de reputação.',
    useCases: ['KYC avançado', 'Due diligence reputacional', 'Monitoramento de parceiros', 'Prevenção de fraude'],
    sla: '99,85%',
    priceFrom: 'R$ 2,40/varredura',
  },
  {
    slug: 'lovac-investigacao',
    area: 'fraude',
    name: 'LOVAC · Investigação',
    datasets: 17,
    description: 'Inteligência investigativa completa com relatório forense.',
    chips: ['LOVAC'],
    fullDescription: 'O módulo de maior profundidade do SNC: investigação OSINT completa com cruzamento de 17 datasets, análise de grafo de relacionamentos, timeline de eventos e relatório forense PDF. Para casos de alta complexidade.',
    useCases: ['Fraude corporativa', 'Due diligence executiva', 'Investigação patrimonial', 'Compliance de alto risco'],
    sla: '99,80%',
    priceFrom: 'R$ 28,00/relatório',
  },
  {
    slug: 'monitoramento-24h',
    area: 'fraude',
    name: 'Monitoramento 24h',
    datasets: 7,
    description: 'Alertas contínuos em eventos de risco e mudanças de status.',
    chips: ['Webhook'],
    fullDescription: 'Monitoramento contínuo de portfólio via webhook: alertas de restrições novas, mudanças de PEP, protestos, processos judiciais e eventos de risco. Integração push em tempo real.',
    useCases: ['Gestão de carteira de crédito', 'Compliance proativo', 'Alertas de fraude', 'Monitoramento PLD'],
    sla: '99,97%',
    priceFrom: 'R$ 0,15/evento',
  },
  {
    slug: 'indicadores-empresariais',
    area: 'pj',
    name: 'Indicadores Empresariais',
    datasets: 19,
    description: 'Reputação, sócios, finanças e saúde operacional de PJs.',
    chips: ['Receita', 'Juntas'],
    fullDescription: 'Radiografia completa de pessoas jurídicas: situação Receita Federal, SINTEGRA, SPED, quadro societário, faturamento estimado, reclamações Procon, histórico de penalidades e saúde financeira consolidada.',
    useCases: ['KYB (Know Your Business)', 'Onboarding de fornecedores', 'Crédito PJ', 'Auditoria pré-contratual'],
    sla: '99,95%',
    priceFrom: 'R$ 3,50/consulta',
  },
  {
    slug: 'circulos-e-relacionamentos',
    area: 'pj',
    name: 'Círculos & Relacionamentos',
    datasets: 8,
    description: 'Rede de conexões, sócios, representantes e grupos econômicos.',
    chips: ['Grafo'],
    fullDescription: 'Mapeamento completo de rede de relacionamentos via grafo: sócios, diretores, procuradores, empresas vinculadas, grupos econômicos e beneficiários finais. Visualização interativa e exportação em JSON.',
    useCases: ['Estruturas societárias complexas', 'Identificação de UBO', 'Risco de grupo econômico', 'M&A'],
    sla: '99,90%',
    priceFrom: 'R$ 5,20/mapa',
  },
  {
    slug: 'esg-e-dados-rurais',
    area: 'pj',
    name: 'ESG & Dados Rurais',
    datasets: 7,
    description: 'Sustentabilidade, IBAMA, SICAR e conformidade ambiental.',
    chips: ['IBAMA', 'SICAR'],
    fullDescription: 'Conformidade ambiental e ESG: embargos IBAMA, cadastro SICAR (imóveis rurais), CAR, infrações ambientais, certificações e histórico de autuações. Para empresas do agro, indústria e financiamento.',
    useCases: ['Crédito rural', 'Financiamento verde', 'Fornecedores do agro', 'ESG reporting'],
    sla: '99,85%',
    priceFrom: 'R$ 1,90/consulta',
  },
  {
    slug: 'certidoes-pj',
    area: 'pj',
    name: 'Certidões PJ',
    datasets: 6,
    description: 'Certidões negativas empresariais em todas as esferas.',
    chips: ['Federal', 'Estadual'],
    fullDescription: 'Certidões negativas para pessoas jurídicas: Receita Federal, PGFN, INSS, FGTS, Justiça Federal, CNDT e Câmaras Estaduais. Rastreamento de prazo de validade e renovação automática.',
    useCases: ['Licitações públicas', 'Habilitação de fornecedores', 'Compliance fiscal', 'Financiamentos'],
    sla: '99,80%',
    priceFrom: 'R$ 1,40/certidão',
  },
  {
    slug: 'perfil-digital',
    area: 'int',
    name: 'Perfil Digital',
    datasets: 22,
    description: 'Comportamento online, apps, redes sociais e assinatura de dispositivo.',
    chips: ['Device', 'Apps'],
    fullDescription: 'Inteligência digital completa: presença em redes sociais, apps instalados, dispositivos utilizados, comportamento de navegação, e-mails e telefones validados em bases digitais. Para enriquecimento e antifraude.',
    useCases: ['Enriquecimento de base', 'Personalização de ofertas', 'Antifraude digital', 'Onboarding sem fricção'],
    sla: '99,90%',
    priceFrom: 'R$ 1,60/perfil',
  },
  {
    slug: 'relatorio-ia',
    area: 'int',
    name: 'Relatório IA',
    datasets: 7,
    description: 'Biografia analítica gerada por LLMs auditáveis (GPT, Mistral, Nova).',
    chips: ['IA', 'LLM'],
    fullDescription: 'Relatório analítico narrativo gerado por LLMs auditáveis: síntese de todos os dados disponíveis em linguagem natural, riscos identificados, recomendações de ação e trilha de auditoria completa. Suporte a GPT-4o, Mistral e Amazon Nova.',
    useCases: ['Relatórios para comitês de crédito', 'Due diligence executiva', 'Compliance documentado', 'Análise de risco narrativa'],
    sla: '99,85%',
    priceFrom: 'R$ 3,80/relatório',
  },
  {
    slug: 'envolvimento-politico',
    area: 'int',
    name: 'Envolvimento Político',
    datasets: 12,
    description: 'PEP estendido, candidaturas, doações e grau de exposição.',
    chips: ['TSE', 'TCU'],
    fullDescription: 'Inteligência política completa: candidaturas históricas, cargos ocupados, doações eleitorais recebidas e realizadas, bens declarados, processos no TCU/TCE e grau de exposição política calculado.',
    useCases: ['PEP de nível 3 e 4', 'Onboarding de políticos', 'Compliance eleitoral', 'Jornalismo investigativo'],
    sla: '99,90%',
    priceFrom: 'R$ 1,30/consulta',
  },
  {
    slug: 'mercado-de-apostas',
    area: 'int',
    name: 'Mercado de Apostas',
    datasets: 5,
    description: 'Vertical regulada — Lei 14.790. KYC completo e idade.',
    chips: ['Lei 14790'],
    fullDescription: 'Módulo vertical completo para operadores licenciados de apostas esportivas (Lei 14.790/2023): KYC regulatório, verificação de maioridade, PEP, sanções administrativas, risco financeiro e monitoramento contínuo. Homologado para SPA/MF.',
    useCases: ['KYC de apostadores', 'Conformidade Lei 14.790', 'Verificação de idade', 'Monitoramento de clientes'],
    sla: '99,99%',
    priceFrom: 'R$ 1,90/verificação',
  },
];

// ===== JOURNEYS =====
export const JOURNEYS: SncJourney[] = [
  {
    slug: 'credito-responsavel',
    title: 'Crédito Responsável',
    titleItalic: ' no atacado.',
    problem: 'Como aprovar crédito com segurança, sem aumentar inadimplência?',
    description: 'Combine score multibureau, cadastro validado e análise de risco financeiro em uma única decisão automatizada. Reduza inadimplência sem sacrificar aprovação.',
    modules: ['Score 37', 'Cadastral 11', 'Risco 14'],
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80',
    metrics: [
      { value: '-28%', label: 'Inadimplência média' },
      { value: '+40%', label: 'Aprovação segura' },
      { value: '< 2s', label: 'Tempo de decisão' },
    ],
    steps: [
      { title: 'Score Multibureau', desc: 'Consulta simultânea em 9 bureaus — SCR, SPC, Serasa, Boa Vista, Quod.' },
      { title: 'Cadastro & Identidade', desc: 'Validação completa de dados pessoais e documentais em fontes oficiais.' },
      { title: 'Risco Financeiro', desc: 'Análise de endividamento SCR e projeção actuarial de inadimplência.' },
      { title: 'Decisão Automatizada', desc: 'Score consolidado com threshold configurável por política de risco.' },
    ],
  },
  {
    slug: 'kyc-digital',
    title: 'KYC Digital',
    titleItalic: ' sem fricção.',
    problem: 'Como verificar a identidade de um cliente em 15 segundos?',
    description: 'Biometria facial, OCR de documento e validação em fontes oficiais em um único fluxo. Conformidade total com BCB e LGPD.',
    modules: ['Identidade 8', 'KYC 9', 'Compliance 9'],
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80',
    metrics: [
      { value: '15s', label: 'Tempo médio de KYC' },
      { value: '99,7%', label: 'Precisão biométrica' },
      { value: '100%', label: 'Conformidade BCB' },
    ],
    steps: [
      { title: 'Captura de Documento', desc: 'OCR automático de RG, CNH ou Passaporte com validação de autenticidade.' },
      { title: 'Prova de Vida', desc: 'Biometria facial com liveness detection anti-spoofing.' },
      { title: 'Validação Oficial', desc: 'Cruzamento com Receita Federal, SERPRO e bases de identidade.' },
      { title: 'Compliance PEP/Sanções', desc: 'Varredura automática em OFAC, ONU, COAF e listas nacionais.' },
    ],
  },
  {
    slug: 'due-diligence',
    title: 'Due Diligence',
    titleItalic: ' investigativa.',
    problem: 'Como investigar um parceiro, fornecedor ou contraparte antes do contrato?',
    description: 'Investigação profunda com cruzamento de 35 fontes: antecedentes, processos, reputação, rede de relacionamentos e análise de risco consolidada.',
    modules: ['Background 9', 'LOVAC 17', 'Político 12'],
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=80',
    metrics: [
      { value: '35', label: 'Fontes cruzadas' },
      { value: '< 4h', label: 'Entrega do relatório' },
      { value: 'PDF', label: 'Relatório auditável' },
    ],
    steps: [
      { title: 'Background Check', desc: 'Antecedentes criminais, processos e certidões em todas as esferas.' },
      { title: 'Investigação LOVAC', desc: 'OSINT completo com grafo de relacionamentos e timeline de eventos.' },
      { title: 'Exposição Política', desc: 'PEP estendido, doações, cargos e bens declarados.' },
      { title: 'Relatório Forense', desc: 'Síntese analítica em PDF com recomendações e trilha de auditoria.' },
    ],
  },
  {
    slug: 'prevencao-de-fraude',
    title: 'Prevenção de Fraude',
    titleItalic: ' em tempo real.',
    problem: 'Como bloquear operações fraudulentas antes de serem efetivadas?',
    description: 'Motor de antifraude multicamada com decisão em < 200ms. Score transacional, device fingerprint, phone score e monitoramento contínuo.',
    modules: ['Antifraude 17', 'Monitoramento 7'],
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&q=80',
    metrics: [
      { value: '-68%', label: 'Redução de chargeback' },
      { value: '< 200ms', label: 'Latência de decisão' },
      { value: '99,8%', label: 'Precisão do modelo' },
    ],
    steps: [
      { title: 'Score Transacional', desc: 'Avaliação de risco em tempo real com base em 17 indicadores.' },
      { title: 'Device & Phone', desc: 'Fingerprint do dispositivo e score de telefone validado.' },
      { title: 'Análise de Velocidade', desc: 'Detecção de padrões anômalos de uso e múltiplas tentativas.' },
      { title: 'Alerta Webhook', desc: 'Notificação instantânea para seu sistema de prevenção.' },
    ],
  },
  {
    slug: 'analise-empresarial',
    title: 'Análise Empresarial',
    titleItalic: ' profunda.',
    problem: 'Como entender a saúde real de uma PJ antes de operar?',
    description: 'Radiografia completa de pessoas jurídicas: indicadores financeiros, quadro societário, grupo econômico, ESG e saúde operacional.',
    modules: ['Indicadores 19', 'Círculos 8', 'ESG 7'],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80',
    metrics: [
      { value: '19', label: 'Indicadores analisados' },
      { value: '8k', label: 'PJs validadas/mês' },
      { value: '< 3s', label: 'Tempo de resposta' },
    ],
    steps: [
      { title: 'Indicadores Empresariais', desc: 'Situação Receita, SPED, faturamento estimado e reclamações.' },
      { title: 'Círculos & Sócios', desc: 'Mapeamento do quadro societário e grupos econômicos como grafo.' },
      { title: 'Conformidade ESG', desc: 'IBAMA, SICAR, embargos ambientais e certificações.' },
      { title: 'Score Consolidado', desc: 'Rating de saúde empresarial com recomendação de risco.' },
    ],
  },
  {
    slug: 'enriquecimento-de-base',
    title: 'Enriquecimento',
    titleItalic: ' de base.',
    problem: 'Como enriquecer minha base com perfil digital e contatos validados?',
    description: 'Perfil digital completo, e-mails e telefones validados, comportamento online e score de engajamento para toda a sua base de clientes.',
    modules: ['Perfil Digital 22', 'BigMarket'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80',
    metrics: [
      { value: '22', label: 'Atributos digitais' },
      { value: '+35%', label: 'Taxa de entrega de email' },
      { value: '98%', label: 'Cobertura da base' },
    ],
    steps: [
      { title: 'Perfil Digital', desc: 'Presença digital, apps, redes sociais e assinatura de dispositivo.' },
      { title: 'Contatos Validados', desc: 'E-mails e telefones verificados em tempo real.' },
      { title: 'Comportamento Online', desc: 'Padrão de uso e engajamento digital.' },
      { title: 'Enriquecimento em Lote', desc: 'API em lote para atualização de toda a base em < 24h.' },
    ],
  },
  {
    slug: 'compliance-regulatorio',
    title: 'Compliance Regulatório',
    titleItalic: ' pleno.',
    problem: 'Como cumprir LGPD, Resolução BACEN 4.893 e obrigações COAF?',
    description: 'Infraestrutura de compliance completa: PLD/FT, LGPD, Resolução BCB 4.893, CVM e COAF em um único fluxo auditável.',
    modules: ['Compliance 9', 'PEP', 'Político 12'],
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=80',
    metrics: [
      { value: '100%', label: 'Conformidade BACEN' },
      { value: 'LGPD', label: 'Operador certificado' },
      { value: 'COAF', label: 'Cadastro ativo' },
    ],
    narrative: [
      'O desafio do compliance regulatório no Brasil não é falta de conhecimento — é falta de infraestrutura para provar conformidade em tempo real. LGPD, Resolução BCB 4.893, PLD/FT e as obrigações de reporte ao COAF têm critérios distintos, prazos próprios e registros separados. Na prática, a maioria das equipes ainda reconcilia fontes heterogêneas manualmente, sob pressão de prazo, acumulando lacunas de auditoria que só aparecem quando o regulador chega.',
      'Esta jornada conecta, em uma única chamada de API, os módulos que precisam operar juntos: varredura automática PLD/FT em COAF, OFAC, ONU, UE e Interpol; identificação e monitoramento contínuo de Pessoas Politicamente Expostas com graus de relacionamento familiar e societário; análise de exposição política com histórico de cargos, doações eleitorais e bens declarados; e trilha de auditoria imutável exportável como evidência para Relatórios de Inteligência Financeira. Cada etapa é logada por obrigação regulatória, não por consulta genérica.',
      'Para fintechs, bancos, IAPs e quaisquer entidades obrigadas, o resultado é direto: conformidade verificável — não apenas declarada. Sua área de compliance para de operar no modo reativo, a evidência de cada decisão está estruturada desde o primeiro onboarding, e sua exposição em fiscalizações cai a zero.',
    ],
    steps: [
      { title: 'PLD/FT', desc: 'Varredura em listas COAF, OFAC, ONU, UE e Interpol.' },
      { title: 'PEP & Sanções', desc: 'Identificação e monitoramento de Pessoas Politicamente Expostas.' },
      { title: 'Exposição Política', desc: 'Análise de cargos, doações e grau de risco político.' },
      { title: 'Trilha de Auditoria', desc: 'Log imutável de todas as consultas para Relatórios COAF.' },
    ],
  },
];

// ===== SECTORS =====
export const SECTORS: SncSector[] = [
  {
    slug: 'varejo-e-commerce',
    cat: 'Varejo & E-commerce',
    title: 'Menos chargeback. Mais conversão.',
    size: 'sz-8',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1400&q=80',
    description: 'Antifraude, phone score e perfil digital para operações de alto volume que não podem perder boas transações nem pagar por fraudes.',
    stars: ['Antifraude', 'Phone Score', 'Perfil Digital'],
    case: { value: '-68%', label: 'Chargeback · cliente enterprise' },
    fullDescription: 'O varejo e e-commerce enfrentam a equação impossível: aprovar o máximo sem aumentar perdas. Com o SNC, você tem antifraude em tempo real, device fingerprint e phone score integrados ao checkout — sem adicionar fricção para o cliente final.',
    modules: ['Antifraude', 'Perfil Digital', 'Verificação de Identidade'],
  },
  {
    slug: 'financeiro-fintechs',
    cat: 'Financeiro & Fintechs',
    title: 'Crédito responsável em escala.',
    size: 'sz-4',
    image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=900&q=80',
    description: 'SCR, SPC, Serasa e KYC regulatório em uma camada única.',
    stars: ['SCR BCB', 'KYC', 'PEP'],
    case: { value: '+40%', label: 'Aprovação mantendo inadimplência <3%' },
    fullDescription: 'Para bancos e fintechs que precisam crescer com rentabilidade. Score multibureau, KYC regulatório e conformidade BACEN em uma API unificada. Reduza o custo de conformidade e aumente a aprovação com segurança.',
    modules: ['Score de Crédito', 'Verificação de Identidade', 'Compliance & PEP', 'Risco Financeiro'],
  },
  {
    slug: 'imobiliario-locacao',
    cat: 'Imobiliário & Locação',
    title: 'Do contrato em 30 segundos.',
    size: 'sz-4',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80',
    description: 'Garantia de aluguel, score e certidões para análise de locatário.',
    stars: ['Decode', 'SCPC', 'Justiça'],
    case: { value: '30s', label: 'Análise completa de locatário' },
    fullDescription: 'O processo de análise de locatário que leva dias cai para 30 segundos com o SNC. Score de risco, certidões negativas, histórico de inadimplência e validação de renda em uma única consulta.',
    modules: ['Score de Crédito', 'Certidões PF', 'Risco Financeiro'],
  },
  {
    slug: 'industria-b2b',
    cat: 'Indústria & B2B',
    title: 'Due diligence de toda a cadeia de fornecedores.',
    size: 'sz-8',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=80',
    description: 'Indicadores empresariais, quadro societário, ESG e IBAMA para validar fornecedores, distribuidores e contrapartes em escala.',
    stars: ['Indicadores', 'Círculos', 'ESG', 'IBAMA', 'SICAR'],
    case: { value: '8k', label: 'Fornecedores validados/mês' },
    fullDescription: 'Cadeias produtivas complexas exigem due diligence em escala. Com o SNC, valide múltiplos fornecedores simultaneamente: saúde financeira, conformidade ESG, quadro societário e riscos de grupo econômico.',
    modules: ['Indicadores Empresariais', 'Círculos & Relacionamentos', 'ESG & Dados Rurais', 'Certidões PJ'],
  },
  {
    slug: 'rh-recrutamento',
    cat: 'RH & Recrutamento',
    title: 'Background check automatizado.',
    size: 'sz-6',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
    description: 'Antecedentes, formação e perfil digital integrados ao seu ATS.',
    stars: ['Background', 'RAIS', 'Formação'],
    case: { value: '-30%', label: 'Turnover em logística' },
    fullDescription: 'Integre o background check ao seu ATS: antecedentes criminais, formação validada, histórico RAIS e perfil digital — tudo automático, com resposta em < 60 segundos por candidato.',
    modules: ['Background Check', 'Formação & Qualificações', 'Certidões PF'],
  },
  {
    slug: 'saude-planos',
    cat: 'Saúde & Planos',
    title: 'Fraude em sinistro identificada antes do pagamento.',
    size: 'sz-6',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80',
    description: 'Identidade biométrica, processos e monitoramento contínuo conforme ANS.',
    stars: ['KYC', 'Biometria', 'Monitoramento'],
    case: { value: 'R$ 12M', label: 'Sinistros evitados/ano' },
    fullDescription: 'Operadoras de planos de saúde têm um dos maiores índices de fraude do Brasil. Com o SNC, valide a identidade do beneficiário, monitore alterações de cadastro e identifique padrões suspeitos antes do pagamento.',
    modules: ['Verificação de Identidade', 'Antifraude', 'Monitoramento 24h'],
  },
  {
    slug: 'betting-igaming',
    cat: 'Betting & iGaming',
    title: 'Conformidade total à Lei 14.790/2023 — em D+0.',
    size: 'sz-12',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1800&q=80',
    description: 'Módulo vertical completo: KYC regulatório, PEP, sanções administrativas, verificação de idade, risco financeiro e monitoramento contínuo, homologados para operadores licenciados pela SPA/MF.',
    stars: ['KYC regulatório', 'PEP', 'Idade', 'Risco', 'Monitoramento contínuo'],
    case: { value: 'D+0', label: 'Conformidade desde o go-live' },
    fullDescription: 'A Lei 14.790/2023 exige um nível de conformidade que nenhuma solução fragmentada consegue entregar. O SNC oferece o módulo mais completo do mercado: KYC regulatório, verificação de maioridade, PEP, sanções, risco financeiro e monitoramento contínuo em uma API.',
    modules: ['Mercado de Apostas', 'Verificação de Identidade', 'Compliance & PEP', 'Monitoramento 24h', 'Risco Financeiro'],
  },
];

// ===== DATASETS =====
export const DATASETS: SncDataset[] = [
  { id: 'SCR', name: 'Sistema de Informações de Crédito', category: 'SCORE', bureau: 'BCB', price: '—' },
  { id: 'SRSA01', name: 'Score Serasa Experian', category: 'SCORE', bureau: 'SERASA', price: 'R$ 1,80' },
  { id: 'BOAV01', name: 'Score Boa Vista SCPC', category: 'SCORE', bureau: 'BOA VISTA', price: 'R$ 1,60' },
  { id: 'SPC01', name: 'SPC Brasil Completo', category: 'SCORE', bureau: 'SPC', price: 'R$ 2,10' },
  { id: 'QUOD01', name: 'Score Quod Cadastro+', category: 'SCORE', bureau: 'QUOD', price: 'R$ 2,40' },
  { id: 'KYC01', name: 'Validação Biométrica Facial', category: 'KYC', bureau: 'UNICO', price: 'R$ 0,90' },
  { id: 'KYC02', name: 'Prova de Vida com OCR', category: 'KYC', bureau: 'IDWALL', price: 'R$ 1,20' },
  { id: 'PEP01', name: 'Lista PEP Consolidada', category: 'COMPLIANCE', bureau: 'TSE+BCB', price: 'R$ 0,40' },
  { id: 'AML01', name: 'Listas Sanções OFAC/ONU/UE', category: 'COMPLIANCE', bureau: 'GLOBAL', price: 'R$ 0,35' },
  { id: 'ANTI01', name: 'Score Antifraude Scoras', category: 'FRAUDE', bureau: 'SCORAS', price: 'R$ 1,15' },
  { id: 'ANTI02', name: 'Phone Score Blu365', category: 'FRAUDE', bureau: 'BLU365', price: 'R$ 0,70' },
  { id: 'DEV01', name: 'Device Fingerprint', category: 'FRAUDE', bureau: 'SNC', price: 'R$ 0,25' },
  { id: 'LOV01', name: 'Relatório LOVAC Completo', category: 'INVESTIGAÇÃO', bureau: 'LOVAC', price: 'R$ 28,00' },
  { id: 'BG01', name: 'Background Check PF', category: 'BG', bureau: 'SNC', price: 'R$ 4,80' },
  { id: 'BG02', name: 'Antecedentes Criminais', category: 'BG', bureau: 'TJ', price: 'R$ 2,20' },
  { id: 'FOR01', name: 'Formação Acadêmica', category: 'BG', bureau: 'MEC', price: 'R$ 1,80' },
  { id: 'RAIS01', name: 'RAIS · Trabalhador', category: 'BG', bureau: 'MTE', price: 'R$ 1,40' },
  { id: 'CFC01', name: 'Conselhos de Classe', category: 'BG', bureau: 'CFC', price: 'R$ 2,00' },
  { id: 'PJ01', name: 'Indicadores Empresariais+', category: 'PJ', bureau: 'RECEITA', price: 'R$ 3,50' },
  { id: 'PJ02', name: 'Quadro Societário Completo', category: 'PJ', bureau: 'JUCESP', price: 'R$ 2,80' },
  { id: 'PJ03', name: 'Grupo Econômico · Grafo', category: 'PJ', bureau: 'SNC', price: 'R$ 5,20' },
  { id: 'ESG01', name: 'IBAMA · Embargos', category: 'ESG', bureau: 'IBAMA', price: 'R$ 1,90' },
  { id: 'ESG02', name: 'SICAR · Cadastro Rural', category: 'ESG', bureau: 'SICAR', price: 'R$ 2,10' },
  { id: 'DIG01', name: 'Perfil Digital · Apps', category: 'DIGITAL', bureau: 'SNC', price: 'R$ 1,60' },
  { id: 'DIG02', name: 'Redes Sociais Mapeadas', category: 'DIGITAL', bureau: 'SNC', price: 'R$ 2,00' },
  { id: 'IA01', name: 'Bio Gerada por IA (GPT)', category: 'IA', bureau: 'SNC', price: 'R$ 3,80' },
  { id: 'BET01', name: 'KYC Apostas Lei 14.790', category: 'APOSTAS', bureau: 'SNC', price: 'R$ 1,90' },
  { id: 'BET02', name: 'Verificação de Idade', category: 'APOSTAS', bureau: 'SNC', price: 'R$ 0,60' },
  { id: 'MON01', name: 'Monitoramento 24h · Webhook', category: 'MON', bureau: 'SNC', price: 'R$ 0,15/evt' },
  { id: 'POL01', name: 'Envolvimento Político Estendido', category: 'COMPLIANCE', bureau: 'TSE', price: 'R$ 1,30' },
  { id: 'POL02', name: 'Doações Eleitorais', category: 'COMPLIANCE', bureau: 'TSE', price: 'R$ 0,80' },
  { id: 'CAD01', name: 'Dados Básicos PF', category: 'CADASTRO', bureau: 'RECEITA', price: 'R$ 0,25' },
  { id: 'CAD02', name: 'E-mails Validados', category: 'CADASTRO', bureau: 'SNC', price: 'R$ 0,15' },
  { id: 'CAD03', name: 'Telefones Validados', category: 'CADASTRO', bureau: 'SNC', price: 'R$ 0,20' },
  { id: 'END01', name: 'Endereços Unificados', category: 'CADASTRO', bureau: 'SNC', price: 'R$ 0,20' },
  { id: 'CERT01', name: 'Certidão Justiça Federal', category: 'CERTIDÕES', bureau: 'JF', price: 'R$ 1,40' },
  { id: 'CERT02', name: 'CNDT Trabalhista', category: 'CERTIDÕES', bureau: 'TST', price: 'R$ 0,90' },
  { id: 'CERT03', name: 'Processos Judiciais PF', category: 'CERTIDÕES', bureau: 'TJ', price: 'R$ 2,40' },
  { id: 'VEI01', name: 'Pendências Veiculares', category: 'VEÍCULOS', bureau: 'DETRAN', price: 'R$ 1,10' },
  { id: 'IMO01', name: 'Registros Imobiliários', category: 'IMÓVEIS', bureau: 'RGI', price: 'R$ 2,60' },
];

export const DS_CATEGORIES = [
  'TODOS', 'SCORE', 'KYC', 'COMPLIANCE', 'FRAUDE', 'BG', 'PJ', 'ESG',
  'DIGITAL', 'CERTIDÕES', 'CADASTRO', 'APOSTAS', 'MON', 'IA', 'INVESTIGAÇÃO', 'VEÍCULOS', 'IMÓVEIS'
];

export function areaLabel(area: string): string {
  const map: Record<string, string> = {
    id: 'Identidade',
    credito: 'Crédito',
    fraude: 'Fraude',
    pj: 'Empresas',
    int: 'Inteligência',
  };
  return map[area] || area;
}
