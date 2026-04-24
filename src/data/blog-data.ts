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
      'Desde a vigência plena da LGPD, em agosto de 2021, surgiu uma dúvida recorrente no setor financeiro: "podemos continuar usando bureaus de dados para decisões automáticas?" A resposta é sim — mas com base legal documentada e proporcionalidade no uso dos dados. A lei não veda o tratamento; ela estrutura e responsabiliza.',
      'O artigo 7º da LGPD lista dez hipóteses de tratamento legítimo. Para o setor de crédito, três são centrais: execução de contrato, legítimo interesse e cumprimento de obrigação legal. O §3º do mesmo artigo reconhece explicitamente a proteção ao crédito como finalidade legítima — o que dá suporte jurídico sólido à consulta de CPF e CNPJ por bureaus credenciados.',
      'Na prática, o que muda é a exigência de documentar cada etapa do processo decisório. Finalidade declarada, minimização de dados, prazo de retenção definido e trilha de auditoria acessível ao titular — esses elementos transformam uma consulta de bureau de um ato opaco em um processo transparente e defensável perante a ANPD.',
      'A Autoridade Nacional de Proteção de Dados publicou, em 2023, orientações específicas para o setor financeiro que reforçam essa leitura. Score de crédito, verificação de identidade e análise de risco são tratamentos legítimos quando acompanhados de transparência ativa — incluindo o direito do titular de solicitar revisão de decisões automatizadas.',
      'Para gestores de compliance e CISOs, o caminho é integrar a conformidade LGPD no fluxo operacional, não como camada burocrática paralela. O SNC entrega isso nativamente: cada consulta gera log imutável com timestamp, finalidade, fonte primária e resultado — pronto para auditoria interna ou inspeção regulatória sem esforço adicional da equipe técnica.',
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
      'Em 2025, o Brasil registrou mais de 4,1 milhões de tentativas de fraude de identidade em processos de onboarding digital — crescimento de 38% sobre o ano anterior, segundo o Banco Central. O dado mais preocupante: a maioria das tentativas usou documentos autênticos pertencentes a terceiros. Isso torna a checagem documental isolada estruturalmente insuficiente.',
      'O KYC digital moderno opera em quatro camadas simultâneas. Primeira: validação documental com OCR e detecção de adulteração de imagem. Segunda: biometria facial com liveness detection ativo, eliminando fotos estáticas e deepfakes. Terceira: cruzamento com bases governamentais — Receita Federal, DETRAN, Cartório de Registro Civil. Quarta: análise de rede, verificando se o CPF aparece associado a dispositivos ou endereços marcados em tentativas de fraude anteriores.',
      'Cada camada, isolada, pode ser contornada. Combinadas e executadas em paralelo, criam uma superfície de ataque impraticável para fraudes em escala. A latência não precisa ser sacrificada: verificações multicamada bem arquitetadas rodam em menos de 900ms — dentro do threshold de UX aceitável para onboarding mobile.',
      'A Resolução BACEN 4.893 e a Circular 3.978 exigem que instituições financeiras mantenham trilha de auditoria completa de todos os processos KYC, incluindo a fonte de cada dado consultado e o resultado obtido. Instituições que ainda dependem de verificação manual ou checagem documental única estão expostas a risco regulatório além do risco de fraude.',
      'O princípio orientador é simples: identidade não é um dado — é um conjunto de evidências convergentes. Quanto mais fontes independentes confirmam os mesmos atributos de uma pessoa, maior a confiança na identidade. O SNC estrutura esse processo como pipeline auditável, não como checklist binário.',
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
      'O Brasil tem quatro grandes bureaus de crédito: Serasa Experian, SPC Brasil, Boa Vista (SCPC) e Quod. Cada um possui metodologia proprietária, bases de dados distintas e escalas de score diferentes. A ausência de padronização cria um desafio real para analistas de crédito: o mesmo CPF pode ter scores muito diferentes dependendo do bureau consultado — e ambos estarem tecnicamente corretos.',
      'O Serasa Score opera na escala de 0 a 1000, com forte peso em histórico de inadimplência e comportamento de pagamento no mercado financeiro. O SPC Score 12 meses é um modelo preditivo calibrado para estimar a probabilidade de inadimplência nos próximos 12 meses, com escala de 1 a 999. A Boa Vista opera com o SCPC Score (0–1000) com maior representatividade no comércio varejista. O Quod, mais recente, incorpora variáveis de comportamento digital e dados de open finance.',
      'O erro mais custoso em políticas de crédito é tratar bureaus como intercambiáveis. Um score 650 no Serasa não equivale a um score 650 no SPC — as distribuições estatísticas são diferentes, os dados de entrada variam e o peso de cada variável muda conforme o modelo. Calibrar thresholds de aprovação sem considerar essa heterogeneidade leva a taxas de inadimplência maiores ou a rejeição desnecessária de bons pagadores.',
      'A abordagem correta é construir políticas de crédito que definam, para cada bureau individualmente, os pontos de corte adequados ao perfil da carteira e ao apetite de risco do negócio. Isso exige dados históricos de performance por bureau e modelagem estatística. O SNC entrega os dados dos principais bureaus normalizados em uma API única, facilitando esse trabalho de calibração sem múltiplas integrações.',
      'Um ponto frequentemente negligenciado: bureaus medem o comportamento passado. Score alto hoje não garante capacidade de pagamento amanhã — especialmente em contextos de choque de renda, desemprego setorial ou crises de liquidez. A combinação de score com renda estimada, comportamento transacional recente e análise de risco setorial é o que separa uma política de crédito sofisticada de uma baseada em dados históricos estáticos.',
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
      'O onboarding de um cliente pessoa jurídica envolve camadas de risco invisíveis na superfície. Um CNPJ ativo, sem débitos federais e com contrato social regular pode esconder sócios com restrições graves, empresas controladas em recuperação judicial, vínculos com pessoas expostas politicamente (PEPs) ou menções negativas em investigações jornalísticas. Nenhum desses riscos aparece em uma consulta de situação cadastral.',
      'A due diligence empresarial eficaz exige pelo menos quatro dimensões simultâneas: análise do quadro societário completo, incluindo sócios indiretos e empresas controladoras até o beneficiário final; verificação de cada sócio individualmente nos registros de PEP e nas listas de sanção OFAC e ONU/UNODC; varredura de mídia negativa com menções associadas a fraude, processos criminais ou escândalos; e situação fiscal e tributária, com dívida ativa federal, certidões estaduais e CADIN.',
      'A complexidade aumenta em estruturas societárias com múltiplas camadas. Um sócio indireto sancionado três níveis acima na cadeia de controle pode não aparecer no quadro societário direto do CNPJ consultado — mas representa risco regulatório real para a empresa que mantém o relacionamento comercial. Resoluções recentes do BACEN e da CVM exigem identificação do beneficiário final, não apenas do representante legal.',
      'Na prática, due diligence manual de clientes PJ em setores regulados levava de 3 a 5 dias úteis por empresa, exigindo equipe dedicada de compliance. Com automação via API, o mesmo processo roda em menos de 2 segundos, com resultado estruturado em JSON, score de risco calculado por dimensão e log auditável para as obrigações regulatórias de cada setor.',
      'A automação não elimina o julgamento humano nos casos de risco elevado — ela concentra a atenção da equipe de compliance onde ela realmente importa, eliminando o trabalho manual repetitivo dos casos de risco baixo. O resultado é uma operação mais eficiente e uma postura de risco mais sólida com o mesmo ou menor custo operacional.',
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
      'A fraude de identidade sintética é o vetor de perda mais subestimado em carteiras de crédito digital. Diferente do roubo de identidade clássico — onde uma pessoa real tem seus dados usados sem consentimento — a identidade sintética combina um CPF real (frequentemente de pessoa falecida, menor de idade ou com histórico inativo) com dados fictícios de nome, endereço, telefone e e-mail, criando uma entidade que não existe na vida real mas existe, coerentemente, nos sistemas.',
      'O que torna essa fraude tão perigosa é a paciência do fraudador. O "fantasma de crédito" não age imediatamente — ele cultiva o perfil por meses, fazendo pequenas transações, honrando pagamentos e construindo relacionamento com a instituição. Quando o limite de crédito disponível atinge o pico, executa o bust-out: maximiza todas as linhas de crédito em um intervalo curto e desaparece. Nesse momento, a detecção tradicional baseada em inadimplência já é irreversível.',
      'A detecção eficaz exige cruzar três dimensões em tempo real: consistência biográfica (o CPF pertence a uma pessoa com a idade, histórico de renda e comportamento declarados?), análise de dispositivo (o fingerprint deste aparelho aparece em outros cadastros com dados diferentes?) e velocidade de comportamento (o padrão de solicitações é humano ou automatizado?).',
      'Account takeover — quando um fraudador assume o controle de uma conta legítima — opera de forma diferente. Aqui, o onboarding foi legítimo. O risco surge depois, com mudança súbita de padrões: novo dispositivo, localização geográfica inconsistente, sequência de transações incomum para o perfil histórico do titular. Monitoramento comportamental contínuo detecta esses desvios antes que a perda se concretize.',
      'O custo médio de uma fraude de identidade sintética no Brasil é de R$ 23.000 por ocorrência, segundo dados da Federação Brasileira de Bancos. Mas o impacto real é maior: inclui custo operacional de investigação, provisão contábil, dano reputacional e, em casos de falha no KYC, exposição regulatória. A prevenção baseada em dados é consistentemente mais barata do que a recuperação pós-fraude.',
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
      'Pessoa Exposta Politicamente (PEP) é qualquer indivíduo que exerceu, nos últimos 5 anos, função pública relevante no Brasil ou no exterior — incluindo parlamentares, diretores de estatais, magistrados, militares de alta patente e seus familiares diretos e associados próximos. A verificação de PEP é obrigatória para todas as instituições financeiras reguladas pelo BACEN, COAF e CVM, com penalidades que chegam a 20 milhões de reais por infração na regulamentação atual.',
      'As listas de sanção internacional acrescentam outra camada de complexidade. A SDN List do OFAC (Office of Foreign Assets Control) identifica indivíduos e entidades com os quais empresas norte-americanas — e qualquer entidade que opere em dólares — não podem transacionar. A lista da ONU/UNODC tem abrangência global e inclui grupos terroristas, traficantes de armas e redes de lavagem de dinheiro. Manter relacionamento comercial com um sancionado, mesmo que involuntariamente, pode resultar em multas de até 30% do faturamento anual e suspensão da licença operacional.',
      'O desafio prático está na dinâmica dessas listas. O OFAC atualiza a SDN List múltiplas vezes por semana. Um cliente que passou na checagem de onboarding pode ser incluído em uma lista de sanção 90 dias depois. Sem monitoramento contínuo da carteira ativa, a empresa só descobrirá o problema quando o relacionamento já tiver gerado passivo regulatório.',
      'Para fintechs em fase de obtenção de licença junto ao BACEN, a comprovação de um processo robusto de verificação PEP e sanções é requisito formal nos processos de autorização. O regulador avalia não apenas a existência do processo, mas sua periodicidade, cobertura de fontes e capacidade de rastreabilidade — ou seja, a documentação técnica é tão importante quanto o processo em si.',
      'A abordagem mais eficiente combina verificação no onboarding com monitoramento periódico da carteira. A frequência ideal depende do perfil de risco do cliente e do setor regulatório — clientes PJ em setores sensíveis podem exigir varredura semanal, enquanto PF de baixo risco podem ser monitorados mensalmente. O SNC permite configurar essa periodicidade por segmento, automatizando alertas via webhook sem carga manual na equipe de compliance.',
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
      'A maioria das empresas conhece seus clientes de forma superficial: nome, CPF, e-mail, histórico de compras. Enriquecimento de base é o processo de complementar esses registros internos com dados externos — renda estimada, perfil de risco, vínculos empregatícios, dados de comportamento digital, composição familiar e score de crédito. O resultado é uma visão 360° que transforma como o negócio segmenta, oferta e gerencia relacionamentos.',
      'Segmentação para oferta de crédito: uma financeira com 2 milhões de clientes ativos enriquece a base com estimativa de renda e score. Identifica 180 mil clientes com perfil de baixo risco que nunca foram abordados para produtos de crédito — porque a empresa não sabia que eles tinham capacidade. A campanha dirigida gera taxa de aprovação 4 vezes maior que campanhas genéricas com custo de aquisição menor.',
      'Reativação de inativos e qualificação de leads B2B: uma varejista com 500 mil clientes sem compra há 12 meses usa enriquecimento para identificar quais ainda têm telefone e e-mail válidos e quais mudaram de cidade — segmentando campanhas com 60% mais eficiência. Uma plataforma SaaS com 50 mil leads de formulário sem dados além de nome e empresa usa CNPJ para enriquecer com faturamento estimado, número de funcionários e setor — priorizando o pipeline de vendas objetivamente.',
      'Detecção de clientes de alto valor e compliance retroativo: um banco digital descobre via enriquecimento que 8% da sua base de conta corrente básica tem patrimônio estimado acima de R$ 500 mil — clientes com potencial para investimentos que nunca foram mapeados porque o produto de entrada não capturava esse dado. Uma seguradora precisa verificar PEP e sanções de toda a carteira existente: o enriquecimento em lote processa 1 milhão de registros em menos de 24 horas.',
      'O denominador comum em todos os casos: dados externos transformam uma base de registros em uma base de inteligência. A diferença competitiva entre empresas que tomam decisões baseadas em dados completos e as que operam com dados parciais se amplia a cada ciclo de produto. Enriquecimento não é projeto pontual — é infraestrutura de decisão contínua.',
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
      'O modelo tradicional de gestão de risco é concentrado no ponto de entrada: analisa-se o cliente no onboarding, aprova-se ou recusa-se, e o processo encerra. Esse modelo parte de um pressuposto falso — de que o perfil de risco de um cliente é estático. Na realidade, risco é dinâmico. Eventos de vida, mudanças econômicas, decisões judiciais e até alterações regulatórias podem transformar um cliente aprovado em um passivo significativo em questão de semanas.',
      'Os gatilhos de risco mais frequentes pós-onboarding são: queda acentuada de score de crédito (indicando comprometimento de renda ou início de inadimplência em outras instituições), inclusão em listas de sanção OFAC ou ONU, abertura de processos judiciais relevantes, mudança de quadro societário em clientes PJ (novo sócio com restrições) e sinais de device fingerprint comprometido indicando possível account takeover.',
      'Para carteiras de crédito, o monitoramento antecipado de queda de score permite acionar instrumentos de cobrança preventiva — renegociação proativa, redução de limite ou suspensão de novos créditos — antes que a inadimplência se materialize. A diferença entre intervir com score em 550 (em declínio) e intervir com score em 300 (já inadimplente) é a diferença entre recuperação e perda.',
      'Para carteiras de clientes PJ em setores regulados (seguros, financeiro, saúde), o monitoramento contínuo de PEP e sanções é obrigação regulatória — não apenas boa prática. A SUSEP, BACEN e CVM exigem processos de atualização cadastral periódica com evidência de varredura nas listas relevantes. Empresas que dependem apenas da checagem de onboarding estão fora de conformidade com as resoluções vigentes.',
      'Clientes SNC que ativaram o módulo de Monitoramento 24h relatam, em média, redução de 23% na inadimplência de 90+ dias no primeiro ano de uso e zero incidências de relacionamento com sancionados descobertos após o fato. O custo mensal do monitoramento é consistentemente inferior ao custo médio de uma única inadimplência significativa — tornando o ROI positivo já no primeiro trimestre de operação.',
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
