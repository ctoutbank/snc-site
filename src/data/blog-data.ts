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
    readTime: '7 min',
    excerpt: 'A LGPD não proíbe o uso de dados para decisões de crédito — ela exige finalidade, necessidade e transparência. Entenda como bureaus de dados operam dentro da lei.',
    content: [
      'Desde a vigência plena da Lei Geral de Proteção de Dados (LGPD), em agosto de 2021, o ecossistema de crédito e compliance brasileiro passou por uma reconfiguração silenciosa. A pergunta que mais ouvimos de clientes fintech, bancos digitais e varejistas é: "podemos continuar usando bureaus de dados para decisões automáticas?"',
      'A resposta é sim — desde que a base legal esteja correta. O artigo 7º da LGPD lista dez hipóteses legítimas de tratamento. Para o segmento financeiro, três são particularmente relevantes: execução de contrato, legítimo interesse e cumprimento de obrigação legal.',
      'O SNC opera sob a hipótese de legítimo interesse combinada com a proteção ao crédito prevista no artigo 7º, §3º. Isso significa que a consulta ao histórico de um CPF ou CNPJ para fins de concessão de crédito tem amparo legal explícito — independentemente do consentimento do titular.',
      'O que muda com a LGPD é a necessidade de documentar a finalidade de cada consulta, limitar o uso dos dados ao necessário para aquela decisão específica, e garantir o direito de acesso e portabilidade ao titular. O SNC incorpora essas exigências na camada de conformidade: toda consulta gera um log auditável com timestamp, finalidade declarada e fonte primária.',
      'A Autoridade Nacional de Proteção de Dados (ANPD) publicou, em 2023, orientações específicas para o setor financeiro que reforçam essa interpretação. O uso de score de crédito, verificação de identidade e análise de risco são tratamentos legítimos quando acompanhados de transparência e proporcionalidade.',
      'Para empresas que usam inteligência de dados em decisões automatizadas, a recomendação é clara: invista na documentação do processo decisório, defina políticas de retenção de dados e garanta que o fornecedor de dados esteja contratualmente alinhado com as obrigações da LGPD.',
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
    readTime: '6 min',
    excerpt: 'Verificar um documento não é mais suficiente. A fraude de identidade evoluiu — e o KYC digital precisa acompanhar com dados comportamentais, biometria e análise de rede.',
    content: [
      'Em 2025, o Brasil registrou mais de 4,1 milhões de tentativas de fraude de identidade em processos de onboarding digital — um crescimento de 38% em relação ao ano anterior, segundo dados do Banco Central. A maioria dessas tentativas envolveu documentos autênticos pertencentes a terceiros, o que torna a verificação documental clássica insuficiente.',
      'O KYC digital evoluiu de um processo de checagem para um processo de inteligência. Verificar se um CPF é válido e se o documento não está vencido é o mínimo. O que diferencia uma operação segura é a capacidade de cruzar dados de múltiplas fontes em tempo real.',
      'No SNC, o módulo de Verificação de Identidade combina quatro camadas: (1) validação documental com OCR e detecção de adulteração; (2) biometria facial com liveness detection para eliminar deepfakes; (3) cruzamento com bases governamentais — Receita Federal, DETRAN e Cartório de Registro Civil; (4) análise de rede — verificando se o CPF aparece associado a dispositivos, endereços ou telefones marcados em outras tentativas de fraude.',
      'Essa abordagem multicamada reduziu a taxa de falsos negativos em clientes SNC em 67% no primeiro semestre de 2025. Mais importante: a latência média de uma verificação completa é de 890ms — dentro do threshold de experiência do usuário em onboarding mobile.',
      'A Resolução BACEN 4.893 e a Circular 3.978 exigem que instituições financeiras mantenham trilha de auditoria de todos os processos KYC. O SNC entrega essa rastreabilidade nativamente, com cada verificação registrada com timestamp, fonte consultada e resultado — pronto para inspeção regulatória.',
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
    readTime: '8 min',
    excerpt: 'SPC, Serasa, Boa Vista e Quod usam metodologias diferentes. Entender o que cada bureau mede — e o que não mede — é fundamental para políticas de crédito eficientes.',
    content: [
      'O Brasil tem quatro grandes bureaus de crédito: Serasa Experian, SPC Brasil, Boa Vista (SCPC) e Quod. Cada um possui metodologia própria, bases de dados distintas e escalas de score diferentes. A ausência de padronização cria um desafio para analistas de crédito: um mesmo CPF pode ter scores muito diferentes dependendo do bureau consultado.',
      'O Serasa Score usa escala de 0 a 1000 e é amplamente adotado pelo varejo e fintechs. O SPC Score 12 meses é um modelo preditivo que estima a probabilidade de inadimplência nos próximos 12 meses, com escala de 1 a 999 — onde scores próximos de 999 indicam baixíssimo risco. A Boa Vista opera com o SCPC Score, também de 0 a 1000, com peso maior em dados de comércio varejista.',
      'O erro mais comum que vemos em políticas de crédito é tratar scores de bureaus diferentes como comparáveis. Um score 650 no Serasa não equivale a um score 650 no SPC — as distribuições estatísticas são diferentes, os dados de entrada são diferentes, e o peso de cada variável varia.',
      'A abordagem correta é construir uma política de crédito que defina, para cada bureau, os pontos de corte adequados ao perfil do seu cliente e ao risco aceitável do seu negócio. O SNC facilita esse processo consolidando dados dos quatro bureaus em uma única API, com normalização dos campos e documentação clara das diferenças metodológicas.',
      'Outro ponto crítico: bureaus medem o passado. Score alto hoje não garante capacidade de pagamento amanhã — especialmente em contextos de crise ou desemprego. Combinar score de bureau com dados de renda estimada, comportamento transacional e análise de risco setorial é o que separa uma política de crédito responsável de uma aposta.',
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
    readTime: '9 min',
    excerpt: 'Onboarding de clientes PJ exige mais do que checar o CNPJ. Análise de quadro societário, exposição política dos sócios e mídia negativa são componentes essenciais de uma due diligence efetiva.',
    content: [
      'O onboarding de um cliente pessoa jurídica envolve uma complexidade muito maior do que o de uma pessoa física. Um CNPJ regular pode esconder sócios com restrições, empresas relacionadas em processo de recuperação judicial, ou vínculos com pessoas expostas politicamente (PEP) — todos fatores de risco que precisam ser avaliados antes de estabelecer uma relação comercial.',
      'A due diligence empresarial eficaz cobre pelo menos quatro dimensões: (1) análise do quadro societário completo, incluindo sócios indiretos e empresas controladoras; (2) verificação de cada sócio individual nos registros de PEP, listas de sanção OFAC e ONU; (3) histórico de mídia negativa — menções em veículos de imprensa associadas a fraude, processos ou escândalos; (4) situação fiscal e tributária, incluindo dívida ativa federal e certidões estaduais.',
      'No módulo de Background Check e Indicadores Empresariais do SNC, automatizamos essas quatro dimensões em uma única chamada de API. O resultado é entregue em menos de 2 segundos, estruturado em JSON com campos padronizados e scores de risco calculados para cada dimensão.',
      'Um caso real: um cliente do setor de seguros realizava due diligence manual de corretoras parceiras. O processo levava 3 a 5 dias úteis por empresa e exigia uma equipe de compliance dedicada. Após integrar o SNC, o mesmo processo passou a ser executado em tempo real no momento do cadastro, com alertas automáticos para casos de risco elevado. O resultado foi uma redução de 82% no tempo de onboarding e a identificação de 7 parceiros com sócios em listas de sanção internacional — que teriam passado pela análise manual.',
      'Para empresas reguladas pelo BACEN, SUSEP ou CVM, a automação da due diligence não é apenas uma eficiência operacional — é um requisito de conformidade. As resoluções recentes dessas agências exigem processos formalizados de análise de clientes PJ, com trilha de auditoria documentada.',
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
    readTime: '7 min',
    excerpt: 'Fraude de identidade sintética combina CPFs reais com dados falsos para construir históricos de crédito limpos. É o tipo de fraude mais difícil de detectar — e o mais custoso.',
    content: [
      'A fraude de identidade sintética é hoje o maior vetor de perda em carteiras de crédito digital no Brasil. Diferente do roubo de identidade tradicional — onde uma pessoa real tem seus dados usados sem autorização — a identidade sintética combina um CPF real (muitas vezes de uma pessoa falecida, menor de idade ou com histórico inativo) com dados fictícios de nome, endereço e contato.',
      'O resultado é um "fantasma de crédito": uma entidade que passa pelas checagens básicas de CPF válido e sem restrições, mas que não corresponde a nenhuma pessoa real. O fraudador cultiva esse histórico por meses, construindo relacionamento e aumentando limites, até executar o "bust-out" — maximizando o crédito disponível e desaparecendo.',
      'A detecção eficaz de identidade sintética exige cruzar pelo menos três dimensões: (1) consistência dos dados — o CPF pertence a uma pessoa com a idade e o histórico declarados? (2) análise de dispositivo — o fingerprint deste dispositivo aparece em outras tentativas de cadastro com dados diferentes? (3) velocidade de comportamento — o padrão de solicitações é compatível com o de um cliente real ou com um script automatizado?',
      'O módulo Antifraude do SNC incorpora os três vetores em uma única análise, com decisão em menos de 200ms. Para cada consulta, retornamos um score de risco transacional, um phone score (verificando se o número está associado a histórico de fraude), e um device fingerprint cruzado com nossa base de dispositivos suspeitos.',
      'Account takeover — quando um fraudador assume o controle de uma conta legítima — é o segundo maior vetor. Aqui, o monitoramento contínuo é mais eficaz que a detecção no onboarding. O módulo de Monitoramento 24h do SNC acompanha padrões de comportamento pós-cadastro e alerta sobre desvios que indicam comprometimento de conta.',
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
    readTime: '6 min',
    excerpt: 'Manter uma carteira de clientes sem verificação de PEP e listas de sanção internacional pode resultar em multas milionárias e perda de licença operacional. Entenda os riscos e como mitigá-los.',
    content: [
      'Pessoa Exposta Politicamente (PEP) é qualquer indivíduo que exerce ou exerceu, nos últimos 5 anos, função pública relevante — incluindo parlamentares, diretores de estatais, magistrados e seus familiares diretos. A verificação de PEP é obrigatória para todas as instituições financeiras reguladas pelo BACEN, COAF e CVM.',
      'As listas de sanção internacional — OFAC (Office of Foreign Assets Control, dos EUA) e ONU/UNODC — identificam indivíduos e entidades proibidos de operar em mercados financeiros internacionais. Manter um relacionamento comercial com um sancionado, mesmo que involuntariamente, pode resultar em multas de até 30% do faturamento anual e suspensão da licença operacional.',
      'O desafio prático é que essas listas são dinâmicas: o OFAC atualiza sua SDN List múltiplas vezes por semana. Um cliente que passou na checagem de onboarding pode ser sancionado três meses depois — e a empresa precisa de um processo de monitoramento contínuo para detectar essa mudança.',
      'O módulo de Compliance & PEP do SNC verifica, em cada consulta, todas as bases relevantes: listas OFAC, ONU/UNODC, COAF, histórico de condenações criminais públicas, e uma base proprietária de PEPs brasileiros atualizada diariamente. O monitoramento contínuo pode ser ativado para carteiras existentes, gerando alertas automáticos quando um cliente passa a constar em alguma lista.',
      'Para fintechs em processo de obtenção de licença junto ao BACEN, demonstrar um processo robusto de verificação PEP e sanções é requisito formal. O SNC entrega a documentação técnica necessária para comprovação do processo junto ao regulador.',
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
    readTime: '5 min',
    excerpt: 'Empresas com bases de dados enriquecidas tomam decisões melhores, personalizam ofertas com mais precisão e identificam oportunidades de cross-sell que bases brutas não revelam.',
    content: [
      'Enriquecimento de base de dados é o processo de complementar os registros internos de uma empresa com dados externos — adicionando informações de renda estimada, perfil demográfico, dados de comportamento digital, vínculos empregatícios e score de crédito a uma base de clientes que, internamente, talvez contenha apenas nome, CPF e e-mail.',
      'Caso 1 — Segmentação para oferta de crédito: Uma financeira tem 2 milhões de clientes ativos. Ao enriquecer a base com estimativa de renda e score de crédito, consegue identificar 180 mil clientes com perfil de risco baixo que nunca foram abordados para produtos de crédito. Resultado: campanha dirigida com taxa de aprovação 4x maior que campanhas genéricas.',
      'Caso 2 — Reativação de clientes inativos: Uma varejista tem 500 mil clientes que não compram há mais de 12 meses. O enriquecimento com dados de contato atualizado (telefone e e-mail) e perfil digital (redes sociais ativas) permite identificar quais ainda são alcançáveis e quais mudaram de cidade — segmentando campanhas de reativação com 60% mais eficiência.',
      'Caso 3 — Qualificação de leads B2B: Uma plataforma SaaS tem 50 mil leads gerados por formulário, com apenas nome e empresa. O enriquecimento com dados do CNPJ — faturamento estimado, número de funcionários, setor de atividade e histórico de crescimento — permite priorizar o pipeline de vendas de forma objetiva.',
      'Caso 4 — Detecção de clientes de alto valor: Um banco digital identifica, via enriquecimento, que 8% da sua base de conta corrente básica possui patrimônio estimado acima de R$500 mil — clientes com potencial para produtos de investimento que nunca foram mapeados.',
      'Caso 5 — Compliance retroativo: Uma seguradora precisa verificar PEP e sanções de toda a sua carteira. O enriquecimento em lote permite processar 1 milhão de registros em menos de 24 horas, identificando riscos latentes na carteira existente.',
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
    readTime: '6 min',
    excerpt: 'Um cliente aprovado hoje pode ser um risco amanhã. Mudanças em score, inclusão em listas de sanção e sinais de fraude pós-contratação exigem monitoramento ativo — não apenas verificação pontual.',
    content: [
      'O modelo tradicional de gestão de risco concentra esforços no momento de onboarding: analisa-se o cliente, aprova-se ou recusa-se, e o processo termina. Esse modelo ignora uma realidade crítica: a situação de risco de um cliente muda ao longo do tempo.',
      'Um cliente que entrou com score 750 pode ter score 400 seis meses depois por desemprego ou comprometimento excessivo da renda. Um fornecedor que passou pela due diligence limpo pode, trimestres depois, ter sócios incluídos em listas de sanção internacional. Um segurado pode ser objeto de investigação de fraude que ainda não se materializou em condenação.',
      'O monitoramento contínuo resolve esse problema acompanhando, de forma automatizada, as variáveis de risco mais críticas da carteira ativa. No SNC, o Módulo de Monitoramento 24h permite configurar alertas para: variação significativa de score de crédito, inclusão em listas OFAC/ONU, registro de novos processos judiciais, mudança de quadro societário (para PJ), e sinais de device fingerprint comprometido.',
      'Os alertas são entregues via webhook em tempo real ou consolidados em relatórios diários — de acordo com a capacidade operacional do cliente. Para carteiras de crédito, o monitoramento permite antecipar inadimplência e acionar instrumentos de cobrança preventiva antes que a dívida se torne irrecuperável.',
      'O retorno sobre investimento do monitoramento contínuo é mensurável: clientes SNC que ativaram o módulo relatam, em média, redução de 23% na inadimplência de 90+ dias no primeiro ano de uso, além de zero casos de relacionamento com sancionados descobertos pós-onboarding.',
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
