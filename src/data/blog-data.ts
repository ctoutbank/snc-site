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
  sncRole: {
    title: string;
    points: string[];
  };
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
    excerpt: 'A LGPD não proíbe o uso de dados para decisões de crédito. Ela exige que as empresas expliquem por que estão usando aqueles dados. Entenda como isso funciona na prática.',
    content: [
      'Desde que a Lei Geral de Proteção de Dados entrou em vigor, muitas empresas ficaram com dúvida: ainda posso consultar o histórico de um cliente para decidir se libero crédito? A resposta é sim. A lei não proíbe esse tipo de consulta. O que ela exige é que a empresa saiba explicar por que está fazendo isso e que tenha esse registro organizado.',
      'A própria lei prevê que consultar dados de crédito é uma prática legítima. Isso está no artigo 7º, que lista as situações em que uma empresa pode usar dados de terceiros sem precisar pedir autorização direta. Consultar o histórico de pagamentos de alguém para decidir se oferece um empréstimo é um exemplo clássico dessa situação.',
      'O que muda na prática é a necessidade de manter um registro claro de cada consulta feita: quando aconteceu, qual foi o motivo e de qual fonte o dado veio. Isso protege tanto a empresa quanto o cliente. Se o cliente quiser saber por que foi recusado, a empresa precisa ter esse histórico disponível.',
      'A autoridade responsável por fiscalizar o cumprimento da lei já deixou claro que score de crédito e verificação de identidade são usos legítimos dos dados, desde que a empresa seja transparente sobre o processo. O risco está em quem usa dados sem registro, não em quem consulta com responsabilidade.',
      'Para empresas que já usam sistemas de análise automática de crédito, a adaptação costuma ser simples. Na maioria dos casos, basta garantir que cada consulta gera um registro com data, motivo e resultado. O SNC já faz isso automaticamente em cada chamada, sem que a equipe técnica precise configurar nada adicional.',
    ],
    sncRole: {
      title: 'Como o SNC atua neste tema',
      points: [
        'Registra automaticamente cada consulta com data, hora, finalidade e fonte de dados',
        'Gera trilha de auditoria imutável pronta para apresentar a órgãos reguladores',
        'Documenta o processo decisório de forma estruturada, sem trabalho manual da equipe',
        'Garante que cada consulta tenha base legal identificada conforme as hipóteses da LGPD',
      ],
    },
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
    excerpt: 'Confirmar que um documento é válido não é mais suficiente para saber se a pessoa do outro lado é quem diz ser. A fraude de identidade ficou mais sofisticada e a verificação precisa acompanhar.',
    content: [
      'Quando alguém abre uma conta ou pede um empréstimo pela internet, a empresa precisa ter certeza de que está falando com a pessoa certa. Antigamente, bastava checar se o documento era válido. Hoje isso não é mais suficiente. Fraudadores aprenderam a usar documentos reais de outras pessoas para se passar por elas.',
      'A verificação de identidade moderna funciona em várias etapas ao mesmo tempo. Além de checar o documento, o sistema compara a foto com o rosto da pessoa em tempo real, busca o CPF em bases governamentais como a Receita Federal e verifica se o celular ou computador usado já foi associado a tentativas de fraude anteriores.',
      'Cada uma dessas etapas, sozinha, pode ser enganada. Mas quando todas acontecem juntas e precisam ser consistentes entre si, fica muito difícil para um fraudador passar por todas ao mesmo tempo. E o processo inteiro acontece em menos de um segundo, sem que o usuário perceba.',
      'Empresas do setor financeiro têm obrigação legal de registrar como verificaram a identidade de cada cliente. Esse registro precisa incluir quais informações foram consultadas, quando e qual foi o resultado. Sem isso, a empresa fica exposta tanto a fraudes quanto a questionamentos regulatórios.',
      'O princípio por trás de tudo isso é simples: identidade não é um dado único, é um conjunto de informações que precisam fazer sentido juntas. Quanto mais fontes diferentes confirmam os mesmos dados de uma pessoa, mais seguro é o processo de aprovação.',
    ],
    sncRole: {
      title: 'Como o SNC atua neste tema',
      points: [
        'Verifica o CPF nas bases da Receita Federal, DETRAN e Cartório de Registro Civil',
        'Cruza os dados do cadastro com histórico de dispositivos associados a fraudes anteriores',
        'Entrega o resultado completo em menos de um segundo, sem impactar a experiência do usuário',
        'Gera registro auditável de cada verificação com todas as fontes consultadas e o resultado obtido',
      ],
    },
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
    excerpt: 'O Brasil tem quatro grandes empresas que calculam score de crédito, e cada uma usa um método diferente. Entender essas diferenças ajuda a tomar decisões mais precisas.',
    content: [
      'Quando uma empresa vai decidir se oferece crédito para alguém, costuma consultar o score de crédito dessa pessoa. O score é uma pontuação que indica o risco de ela não pagar. No Brasil, as principais empresas que calculam esse número são Serasa, SPC Brasil, Boa Vista e Quod. Cada uma usa um método próprio, o que significa que a mesma pessoa pode ter pontuações bem diferentes dependendo de qual foi consultada.',
      'O Serasa usa uma escala de 0 a 1000 e é muito popular no varejo e nas fintechs. O SPC tem um modelo específico que estima a probabilidade de a pessoa atrasar um pagamento nos próximos 12 meses. A Boa Vista dá mais peso ao histórico de compras no comércio. O Quod é mais recente e incorpora dados de comportamento digital. Cada um enxerga o mesmo cliente de um ângulo diferente.',
      'O erro mais comum que empresas cometem é tratar essas pontuações como se fossem equivalentes. Uma nota 650 no Serasa não significa a mesma coisa que uma nota 650 no SPC. As escalas parecem iguais, mas os dados que geraram aqueles números são diferentes. Comparar sem entender isso pode levar a decisões erradas, tanto de recusar bons clientes quanto de aprovar quem representa risco maior.',
      'A forma certa de usar essas informações é olhar para cada bureau separadamente e entender o que ele está dizendo sobre aquele cliente dentro do seu próprio modelo. Empresas que fazem isso com mais rigor conseguem aprovar mais crédito sem aumentar o risco, porque entendem melhor o que cada número realmente significa.',
      'Outro ponto importante: o score reflete o passado. Uma pessoa que pagava tudo em dia pode estar passando por um momento difícil agora, e o score ainda não capturou isso. Por isso, combinar o score com outras informações, como estimativa de renda atual e comportamento recente, dá uma visão mais completa e mais justa do cliente.',
    ],
    sncRole: {
      title: 'Como o SNC atua neste tema',
      points: [
        'Consolida dados dos principais bureaus de crédito em uma única chamada de API',
        'Entrega os resultados de cada bureau com campos normalizados para facilitar a comparação',
        'Complementa o score com estimativa de renda e dados comportamentais do cliente',
        'Permite configurar thresholds de aprovação independentes para cada bureau consultado',
      ],
    },
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
    excerpt: 'Antes de fechar negócio com uma empresa, é importante saber quem está por trás dela. Checar o CNPJ é só o começo.',
    content: [
      'Quando uma empresa vai fechar parceria ou contrato com outra empresa, precisa saber com quem está lidando de verdade. Checar se o CNPJ existe e está ativo é o básico. O problema é que um CNPJ regular pode esconder sócios com dívidas graves, empresas ligadas com problemas financeiros, ou pessoas envolvidas em investigações. Nada disso aparece em uma consulta simples.',
      'Uma verificação completa de empresa precisa olhar para pelo menos quatro áreas. Primeiro, quem são os sócios e quem controla a empresa de verdade. Segundo, se algum desses sócios aparece em listas de pessoas politicamente expostas ou em listas internacionais de restrição. Terceiro, se a empresa ou os sócios aparecem em notícias negativas ligadas a fraude ou processos. Quarto, se a situação fiscal está em ordem.',
      'O trabalho fica mais complexo quando a empresa tem uma estrutura com várias camadas de sociedade. Um sócio problemático pode estar três ou quatro níveis acima na cadeia de controle e não aparecer no documento básico do CNPJ. Por isso, a verificação precisa ir além do que está no contrato social.',
      'Antes da tecnologia atual, fazer essa verificação manualmente levava de três a cinco dias por empresa e exigia uma equipe dedicada. Com sistemas como o SNC, o mesmo processo acontece em segundos, com o resultado organizado e pronto para uso. Isso não elimina a análise humana nos casos mais complexos, mas libera a equipe para focar onde realmente importa.',
      'Para empresas que atuam em setores regulados como bancos, seguradoras e corretoras, esse tipo de verificação é obrigatório por lei. As autoridades exigem que haja um processo documentado de análise de parceiros e clientes, com registro de quando foi feito e o que foi encontrado.',
    ],
    sncRole: {
      title: 'Como o SNC atua neste tema',
      points: [
        'Analisa o quadro societário completo, incluindo sócios indiretos e empresas controladoras',
        'Verifica cada sócio individualmente nas listas de PEP e sanções nacionais e internacionais',
        'Entrega score de risco calculado para cada dimensão da análise em menos de dois segundos',
        'Gera log auditável do processo completo para comprovação junto a órgãos reguladores',
      ],
    },
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
    excerpt: 'Existe um tipo de fraude em que o fraudador usa um CPF real misturado com informações inventadas. Essa combinação cria um perfil que parece legítimo e engana sistemas tradicionais de proteção.',
    content: [
      'Existe um tipo de golpe que não usa documentos roubados. O fraudador pega um CPF real, geralmente de uma pessoa falecida ou de alguém que nunca usou crédito, e combina com um nome e endereço inventados. O resultado é um perfil que passa nas verificações básicas porque o CPF existe de verdade, mas a pessoa por trás dele não.',
      'O que torna esse golpe especialmente difícil de detectar é que o fraudador não age na pressa. Ele abre uma conta, usa aos poucos, paga as faturas iniciais e vai construindo um histórico positivo. Pode levar meses até que ele esteja pronto para dar o golpe final, pedindo o máximo de crédito disponível e sumindo sem pagar.',
      'Detectar esse tipo de fraude exige olhar para vários sinais ao mesmo tempo. O CPF faz sentido com a idade e o histórico declarado? O celular e o computador usados no cadastro já apareceram em outros pedidos com dados diferentes? A velocidade e o padrão dos pedidos são compatíveis com o comportamento de uma pessoa real? Quando essas perguntas não têm respostas consistentes, há motivo para investigar mais.',
      'Existe também um outro tipo de fraude chamado de invasão de conta. Aqui, a conta foi aberta de forma legítima por uma pessoa real. Mas depois, alguém consegue acesso e começa a usar como se fosse ela. Esse tipo é mais difícil de detectar no momento do cadastro justamente porque a conta é genuína. A proteção mais eficaz é monitorar o comportamento depois do cadastro e identificar quando algo muda de forma suspeita.',
      'O custo médio de uma fraude desse tipo para as empresas é alto, e o problema vai além do dinheiro perdido. Há o trabalho de investigação, a provisão contábil e, em alguns casos, consequências legais por não ter detectado a tempo. Investir em prevenção custa consistentemente menos do que lidar com as consequências.',
    ],
    sncRole: {
      title: 'Como o SNC atua neste tema',
      points: [
        'Verifica a consistência entre o CPF, a idade declarada e o histórico biográfico da pessoa',
        'Cruza o dispositivo usado no cadastro com uma base de aparelhos associados a fraudes',
        'Analisa o padrão de comportamento das solicitações para identificar ações automatizadas',
        'Monitora contas ativas e gera alertas quando o comportamento do usuário muda de forma suspeita',
      ],
    },
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
    excerpt: 'Ter um cliente que é uma pessoa politicamente exposta ou que está em uma lista de sanções internacionais pode trazer consequências sérias para a empresa. Saiba o que isso significa e como se proteger.',
    content: [
      'Pessoa Politicamente Exposta, ou PEP, é o nome que se dá a qualquer pessoa que ocupou ou ocupa um cargo público importante nos últimos cinco anos. Isso inclui vereadores, deputados, diretores de empresas públicas, juízes e também os familiares próximos dessas pessoas. Empresas do setor financeiro são obrigadas por lei a verificar se os clientes se enquadram nessa categoria.',
      'Além dos PEPs, existem as listas de sanções internacionais. São listas mantidas por organismos como o governo americano e as Nações Unidas com os nomes de pessoas e empresas proibidas de realizar transações financeiras internacionais. Manter negócios com alguém que está nessas listas, mesmo sem saber, pode gerar multas muito altas e até a suspensão da licença de funcionamento.',
      'O grande desafio é que essas listas mudam o tempo todo. Uma pessoa que não estava em nenhuma lista quando abriu a conta pode aparecer em uma delas três meses depois. Por isso, verificar só no momento do cadastro não é suficiente. É preciso continuar monitorando os clientes ativos regularmente.',
      'Para empresas que estão começando a estruturar esse processo, o primeiro passo é entender quais listas precisam ser verificadas e com que frequência. Em alguns setores, a regra exige verificação mensal para todos os clientes. Em outros, a frequência pode variar dependendo do perfil de risco de cada um.',
      'O SNC verifica automaticamente as principais listas nacionais e internacionais em cada consulta e pode ser configurado para monitorar a carteira ativa de forma contínua. Para empresas que estão buscando regularização junto ao Banco Central ou outros órgãos, o sistema já entrega o registro técnico no formato exigido para comprovação.',
    ],
    sncRole: {
      title: 'Como o SNC atua neste tema',
      points: [
        'Verifica automaticamente as listas OFAC, ONU e COAF em cada consulta realizada',
        'Mantém uma base proprietária de PEPs brasileiros atualizada diariamente',
        'Monitora a carteira ativa e gera alertas quando um cliente passa a constar em alguma lista',
        'Entrega documentação técnica para comprovação do processo junto a órgãos reguladores',
      ],
    },
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
    excerpt: 'Muitas empresas têm uma base de clientes com poucas informações além do nome e CPF. Acrescentar dados externos a essa base pode abrir oportunidades que estavam invisíveis.',
    content: [
      'A maioria das empresas conhece seus clientes de forma superficial. Tem o nome, o CPF, talvez um e-mail e o histórico de compras. Com essas informações, fica difícil saber se um cliente tem perfil para receber uma oferta de crédito, se seria bom candidato para um produto diferente ou se está em situação financeira delicada. Enriquecimento de base é o processo de acrescentar informações externas a esses registros para ver o cliente com mais clareza.',
      'Um exemplo prático: uma financeira tem dois milhões de clientes ativos. Ao acrescentar estimativa de renda e pontuação de crédito ao cadastro de cada um, ela descobre que existem 180 mil clientes com ótimo perfil financeiro que nunca foram abordados para um empréstimo. Com essa informação, a campanha vai para as pessoas certas e a taxa de aprovação fica muito maior do que em uma ação genérica.',
      'Outro uso muito comum é a reativação de clientes que pararam de comprar. Uma varejista com 500 mil clientes inativos usa o enriquecimento para descobrir quais ainda têm telefone e e-mail válidos, quais mudaram de cidade e quais passaram por mudanças financeiras recentes. Com isso, a comunicação vai para quem realmente tem chance de voltar a comprar, em vez de gastar dinheiro com toda a base.',
      'No mundo B2B, o enriquecimento serve para qualificar leads. Uma empresa que recebe formulários com apenas nome e CNPJ pode usar o enriquecimento para descobrir o tamanho da empresa, o setor de atuação, o número de funcionários e o faturamento estimado. Isso permite que o time comercial priorize os contatos com mais potencial em vez de tratar todos da mesma forma.',
      'O uso menos óbvio, mas muito relevante, é a verificação retroativa de compliance. Uma empresa que começou a verificar PEPs e sanções recentemente precisa checar também os clientes mais antigos que nunca passaram por esse processo. Com o enriquecimento em lote, é possível processar toda a carteira e identificar riscos que estavam invisíveis desde o cadastro.',
    ],
    sncRole: {
      title: 'Como o SNC atua neste tema',
      points: [
        'Adiciona estimativa de renda, score de crédito e perfil de risco a qualquer base de CPFs',
        'Enriquece bases de CNPJs com dados societários, faturamento estimado e situação fiscal',
        'Processa grandes volumes de registros em lote para verificações retroativas de compliance',
        'Atualiza dados de contato como telefone e e-mail para melhorar o alcance das campanhas',
      ],
    },
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
    excerpt: 'Aprovar um cliente hoje não significa que ele representa o mesmo nível de risco daqui a seis meses. A situação das pessoas muda, e as empresas precisam acompanhar essas mudanças.',
    content: [
      'A forma tradicional de gerenciar risco é: verifica o cliente na entrada, aprova ou recusa, e encerra o processo. O problema com essa abordagem é que ela parte de uma premissa errada. A situação financeira e o perfil de risco de uma pessoa mudam ao longo do tempo. Um cliente com histórico impecável pode perder o emprego, acumular dívidas em outras empresas ou passar por uma situação que aumenta significativamente o risco de não pagar.',
      'Alguns sinais de alerta aparecem antes de a inadimplência acontecer de fato. Uma queda na pontuação de crédito, por exemplo, muitas vezes indica que a pessoa está se endividando em outros lugares. Se a empresa só descobre isso quando a conta já está atrasada, perdeu a janela de agir com antecedência. Com monitoramento contínuo, esse alerta chega a tempo de tomar uma atitude preventiva, como entrar em contato ou ajustar o limite de crédito.',
      'Para empresas que trabalham com clientes PJ, há outro tipo de risco que pode aparecer depois do cadastro. Um fornecedor ou parceiro que estava limpo pode ter um sócio incluído em uma lista de sanções internacionais três meses depois da assinatura do contrato. Ou a empresa pode entrar em processo de recuperação judicial sem que isso apareça imediatamente nas verificações básicas. Monitoramento contínuo capta essas mudanças.',
      'Setor financeiro, seguradoras e outros setores regulados têm obrigação legal de atualizar periodicamente os dados dos clientes. Não basta fazer a verificação uma vez no início. A frequência de atualização depende do perfil do cliente e do que as regras do setor exigem, mas o processo precisa existir e ser documentado.',
      'Empresas que implementaram monitoramento contínuo costumam relatar resultados concretos: menos inadimplência, porque as situações de risco são identificadas antes de virar problema, e mais segurança jurídica, porque há registro de que a empresa fez o acompanhamento que a lei exige. O custo do monitoramento é consistentemente menor do que o custo de lidar com as consequências de não ter feito.',
    ],
    sncRole: {
      title: 'Como o SNC atua neste tema',
      points: [
        'Monitora variações de score de crédito e situação cadastral na carteira ativa de clientes',
        'Gera alertas automáticos quando um cliente passa a constar em listas de sanção ou PEP',
        'Acompanha mudanças no quadro societário de empresas parceiras e clientes PJ',
        'Entrega alertas em tempo real via integração direta ou em relatórios consolidados por período',
      ],
    },
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
