// SNC — Dados centralizados do site institucional
// Fonte: SNC Institucional - bundle source.html

export interface SncDatasetItem {
  id: string;      // ex: FOR01
  source: string;  // ex: MEC, MTE, OAB
  name: string;    // Nome legível do dataset
  returns: string; // O que o dataset retorna
}

export interface SncModule {
  slug: string;
  area: 'id' | 'credito' | 'fraude' | 'pj' | 'int';
  name: string;
  datasets: number;
  description: string;
  chips: string[];
  fullDescription?: string;
  useCases?: string[];
  useCasesRich?: { title: string; desc: string }[];
  sla?: string;
  priceFrom?: string;
  datasetItems?: SncDatasetItem[];
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
  paraQueServe?: string[];
  delivery?: { title: string; desc: string; highlights?: string[] };
  legalBasis?: string[];
}

export interface SncSector {
  slug: string;
  cat: string;
  title: string;
  size: 'sz-4' | 'sz-6' | 'sz-8' | 'sz-12';
  image: string;
  description: string;
  hoverText: string;
  stars: string[];
  case: { value: string; label: string };
  fullDescription?: string;
  modules?: string[];
  narrative?: string[];
  paraQueServe?: string[];
  sectorJourneys?: string[];
  legalBasis?: string[];
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
    useCasesRich: [
      {
        title: 'Onboarding digital',
        desc: 'Em fluxos de onboarding, cada segundo de fricção custa conversões. A Consulta Cadastral valida CPF, endereço e telefone em menos de 2 segundos via Receita Federal e SERPRO, eliminando formulários de auto-declaração que geram inconsistências e só viram problema depois.',
      },
      {
        title: 'Enriquecimento de base',
        desc: 'Bases com email inválido, telefone desativado ou endereço desatualizado custam dinheiro em campanhas que não chegam e decisões baseadas em dados obsoletos. O módulo complementa registros existentes com dados validados oficialmente, aumentando a precisão de segmentação, scoring e comunicação.',
      },
      {
        title: 'Validação de cadastro',
        desc: 'Dados incorretos ou fraudados na entrada contaminam toda a cadeia: score errado, documentos enviados ao endereço errado, impossibilidade de recuperação judicial de créditos. A Consulta Cadastral valida cada campo na fonte primária antes de persistir o registro.',
      },
      {
        title: 'KYC simplificado',
        desc: 'Para produtos de baixo risco ou limites reduzidos, uma jornada de KYC completa perde clientes legítimos. O módulo entrega os elementos mínimos de identidade suficientes para abertura de conta, emissão de cartão pré-pago ou crédito de ticket baixo — com conformidade regulatória documentada.',
      },
    ],
    sla: '99,95%',
    priceFrom: 'R$ 0,25/consulta',
    datasetItems: [
      { id: 'CAD01', source: 'Receita Federal', name: 'Situação Cadastral CPF', returns: 'Nome completo, data de nascimento, situação (regular, suspensa, cancelada) e data da última atualização cadastral na Receita Federal.' },
      { id: 'CAD02', source: 'Receita Federal', name: 'Situação Cadastral CNPJ', returns: 'Razão social, nome fantasia, CNAE principal, data de abertura, situação cadastral e capital social. Cobre matriz e filiais.' },
      { id: 'CAD03', source: 'SERPRO', name: 'Validação CPF vs. Dados Pessoais', returns: 'Confirmação de correspondência entre CPF, nome completo, data de nascimento e nome da mãe. Score de confiança retornado (alto/médio/baixo).' },
      { id: 'CAD04', source: 'Correios / IBGE', name: 'Validação e Complemento de CEP', returns: 'Logradouro, bairro, município, UF e código IBGE para o CEP informado. Suporta geocodificação e padronização de endereços em lote.' },
      { id: 'CAD05', source: 'Receita Federal', name: 'Quadro Societário QSA', returns: 'Sócios e administradores da PJ com qualificação, data de entrada e participação percentual. Identifica alterações recentes na composição societária.' },
      { id: 'CAD06', source: 'Receita Federal', name: 'Situação MEI / Simples Nacional', returns: 'Enquadramento, atividade permitida, data de opção e limite de faturamento vigente do MEI ou empresa optante pelo Simples Nacional.' },
      { id: 'CAD07', source: 'TSE', name: 'Dados Eleitorais', returns: 'Número do título de eleitor, zona, seção eleitoral e município de domicílio eleitoral. Confirma existência e regularidade do vínculo eleitoral.' },
      { id: 'CAD08', source: 'ANATEL', name: 'Linhas Telefônicas por CPF/CNPJ', returns: 'Operadora de telefonia, tipo de linha (pré ou pós-pago), data de ativação e situação das linhas registradas no CPF ou CNPJ consultado.' },
      { id: 'CAD09', source: 'Junta Comercial', name: 'Atos Empresariais Arquivados', returns: 'Alterações contratuais, mudanças de sócios, transferência de sede e eventos societários arquivados na Junta Comercial estadual correspondente.' },
      { id: 'CAD10', source: 'CCE / BNDES', name: 'Cadastro Centralizado de Empresas', returns: 'Dados consolidados de PJs perante o BNDES: faturamento estimado, número de empregados via RAIS e vínculos com contratos públicos.' },
      { id: 'CAD11', source: 'INSS / CNIS', name: 'Vínculos Previdenciários', returns: 'Situação contributiva do CPF: tempo estimado de contribuição, último recolhimento e status de benefício ativo (aposentadoria, auxílio ou pensão).' },
    ],
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
    useCasesRich: [
      {
        title: 'Abertura de conta digital',
        desc: 'Conta digital aberta sem liveness detection é porta aberta para identidades sintéticas. A Verificação de Identidade combina biometria facial com anti-spoofing e cruzamento com SERPRO, bloqueando documentos adulterados e selfies injetadas antes do onboarding ser concluído.',
      },
      {
        title: 'Onboarding regulatório',
        desc: 'BCB 4.893 e LGPD exigem verificação de identidade com trilha auditável. O módulo registra cada passo — OCR, biometria, score de confiança — com timestamp e hash. A conformidade é automática, não uma camada adicionada depois da implementação.',
      },
      {
        title: 'Autenticação reforçada',
        desc: 'Senhas e OTP por SMS são insuficientes para transações de alto valor. A biometria facial com liveness detection adiciona uma camada que não pode ser replicada por phishing ou engenharia social, reduzindo o risco de account takeover em operações críticas.',
      },
      {
        title: 'Prevenção de fraude',
        desc: 'Identidades sintéticas combinam CPFs válidos com documentos falsificados. O OCR detecta alterações em elementos de segurança — hologramas, MRZ, fontes — que passam por revisão manual. Integrado ao Antifraude, identifica padrões de dispositivo e velocidade que indicam tentativa coordenada.',
      },
    ],
    sla: '99,90%',
    priceFrom: 'R$ 0,90/verificação',
    datasetItems: [
      { id: 'VID01', source: 'Unico Check', name: 'Biometria Facial com Liveness Detection', returns: 'Score de similaridade facial entre selfie e documento. Detecção de vivacidade (anti-spoofing) com classificação de risco: foto, máscara 3D ou vídeo injetado.' },
      { id: 'VID02', source: 'Idwall / OCR Engine', name: 'OCR e Autenticidade Documental', returns: 'Extração automática de dados de RG, CNH, Passaporte e CRNM via OCR. Verificação de elementos de segurança e autenticidade visual do documento.' },
      { id: 'VID03', source: 'SERPRO CadSUF', name: 'Biometria Previdenciária SERPRO', returns: 'Comparação biométrica facial contra a base de imagens do INSS/SERPRO. Retorna score de correspondência e nível de confiança da identificação.' },
      { id: 'VID04', source: 'SENATRAN / DETRAN', name: 'Validação de CNH', returns: 'Validade da CNH, categorias habilitadas, pontuação acumulada, suspensões ativas e autenticidade do número de registro junto ao SENATRAN.' },
      { id: 'VID05', source: 'Receita Federal', name: 'Validação CPF + Nome da Mãe', returns: 'Cruzamento de CPF com nome completo, data de nascimento e nome da mãe na base da Receita Federal. Retorna nível de confiança (alto/médio/baixo).' },
      { id: 'VID06', source: 'INSS / CNIS', name: 'Situação Previdenciária', returns: 'Existência de benefícios ativos, tipo e última competência de recolhimento. Confirma vínculo com o INSS e renda previdenciária do consultado.' },
      { id: 'VID07', source: 'TSE', name: 'Biometria Eleitoral TSE', returns: 'Confirmação de inscrição eleitoral ativa e quitação. Complementa a identificação previdenciária com o cadastro biométrico nacional do TSE.' },
      { id: 'VID08', source: 'SSP / Secretarias Estaduais', name: 'Documentos Inválidos e Ocorrências', returns: 'Consulta a documentos declarados como roubados, furtados ou cancelados perante as Secretarias de Segurança Pública estaduais. Previne uso de documentos inválidos.' },
    ],
  },
  {
    slug: 'formacao-e-qualificacoes',
    area: 'id',
    name: 'Formação & Qualificações',
    datasets: 10,
    description: 'Histórico profissional, RAIS, conselhos de classe e formação.',
    chips: ['MEC', 'MTE', 'OAB', 'CREA', 'RAIS', 'CBO'],
    fullDescription: 'Validação completa de histórico profissional e educacional: diplomas via e-MEC, vínculos empregatícios via RAIS, classificação de ocupações (CBO), conselhos de classe federais, certificações técnicas reconhecidas e carteira de trabalho digital. Cada dado retorna estruturado e auditável para processos de admissão, due diligence e compliance de prestadores.',
    useCases: ['Background check profissional', 'RH e recrutamento', 'Validação de prestadores', 'Due diligence pessoal'],
    useCasesRich: [
      {
        title: 'Background check profissional',
        desc: 'Um médico sem registro CRM ativo, um advogado suspenso pela OAB ou um engenheiro com acervo técnico zerado representam risco legal para quem os contrata. O módulo valida diretamente nos conselhos de classe federais — não no currículo apresentado pelo candidato.',
      },
      {
        title: 'RH e recrutamento',
        desc: 'Diploma falso, histórico de emprego inflado e cargo declarado diferente do CBO real são inconsistências que só aparecem com validação oficial. O módulo cruza os dados declarados com e-MEC, RAIS e eSocial, trazendo o histórico real de vínculos e salários CLT dos últimos 10 anos.',
      },
      {
        title: 'Validação de prestadores',
        desc: 'Prestador de serviços especializados que atua sem registro de conselho ou diploma reconhecido pelo MEC gera responsabilidade solidária para o contratante em processos trabalhistas e cíveis. A validação antes do contrato encerra essa exposição.',
      },
      {
        title: 'Due diligence pessoal',
        desc: 'Em admissões para cargos estratégicos, a verificação de formação vai além do diploma — inclui especialidades, certificações técnicas ativas, anuidades de conselho e histórico de penalidades disciplinares. Informações que o candidato não voluntaria e que a entrevista não revela.',
      },
    ],
    sla: '99,85%',
    priceFrom: 'R$ 1,80/consulta',
    datasetItems: [
      {
        id: 'FOR01',
        source: 'MEC / e-MEC',
        name: 'Formação Acadêmica',
        returns: 'Diploma, instituição, curso, data de conclusão e situação do processo de reconhecimento junto ao MEC. Cobre graduação, pós-graduação, mestrado e doutorado.',
      },
      {
        id: 'FOR02',
        source: 'MTE / RAIS',
        name: 'Vínculos Empregatícios RAIS',
        returns: 'Histórico de empregos CLT dos últimos 10 anos: CNPJ do empregador, cargo (CBO), salário contratual, admissão e demissão. Direto da base do Ministério do Trabalho.',
      },
      {
        id: 'FOR03',
        source: 'MTE / eSocial',
        name: 'Carteira de Trabalho Digital',
        returns: 'Registro oficial de contratos de trabalho, afastamentos, FGTS e contribuições previdenciárias consolidados via eSocial.',
      },
      {
        id: 'FOR04',
        source: 'MTE / CBO',
        name: 'Classificação Brasileira de Ocupações',
        returns: 'Código CBO correspondente à função exercida, família ocupacional e grupo de base, permitindo verificar aderência entre cargo declarado e histórico registrado.',
      },
      {
        id: 'FOR05',
        source: 'OAB Federal',
        name: 'Registro OAB',
        returns: 'Número de inscrição, seccional, data de inscrição, situação (ativo, suspenso, cancelado) e eventuais sanções disciplinares publicadas.',
      },
      {
        id: 'FOR06',
        source: 'CREA / CAU',
        name: 'Conselho de Engenharia e Arquitetura',
        returns: 'Registro no CREA ou CAU, especialidade, situação de anuidade, certidão de acervo técnico e ART/RRT emitidas pelo profissional.',
      },
      {
        id: 'FOR07',
        source: 'CFM / CRO / COREN',
        name: 'Conselhos de Saúde',
        returns: 'Situação do registro profissional em CFM (médicos), CRO (odontólogos) e COREN (enfermagem): número, especialidade, regime de exercício e pendências.',
      },
      {
        id: 'FOR08',
        source: 'CFC / CRC',
        name: 'Conselho de Contabilidade',
        returns: 'Registro CFC/CRC do contador ou técnico contábil, situação de anuidade, habilitação para auditoria e eventuais penalidades administrativas.',
      },
      {
        id: 'FOR09',
        source: 'Instituições Certificadoras',
        name: 'Certificações Técnicas',
        returns: 'Certificações reconhecidas por parceiros credenciados: TI (AWS, Azure, Cisco), Gestão (PMI, PRINCE2) e segurança (ISACA, ISC²). Validade e status de renovação.',
      },
      {
        id: 'FOR10',
        source: 'MEC / CAPES',
        name: 'Cadastro de Pós-Graduação',
        returns: 'Situação de cursos stricto sensu (mestrado e doutorado) via plataforma Sucupira/CAPES: conceito do programa, área de conhecimento e status da defesa.',
      },
    ],
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
    useCasesRich: [
      {
        title: 'Processos licitatórios',
        desc: 'Licitações exigem conjunto específico de certidões com prazos de validade distintos. O módulo centraliza emissão e monitora validade, garantindo que o pacote esteja completo e válido no momento da habilitação — não que expire no meio do processo.',
      },
      {
        title: 'Habilitação de fornecedores',
        desc: 'Fornecedores com débitos trabalhistas ou tributários sem aparecer em cadastros comerciais são passivo invisível. Certidões PF valida a situação de sócios-pessoa-física antes do credenciamento, antecipando problemas que só aparecem em execução de contrato.',
      },
      {
        title: 'Compliance corporativo',
        desc: 'Políticas de compliance exigem que prestadores comprovem regularidade fiscal e trabalhista periodicamente. O monitoramento de validade elimina a gestão manual de planilhas e garante alertas automáticos de vencimento.',
      },
      {
        title: 'Due diligence',
        desc: 'Em due diligence para aquisições, a situação das pessoas físicas ligadas à empresa-alvo importa tanto quanto a situação da PJ. Sócios com execuções trabalhistas ou débitos com a Fazenda podem bloquear transferência de ativos e aprovações regulatórias no pós-fechamento.',
      },
    ],
    sla: '99,80%',
    priceFrom: 'R$ 1,40/certidão',
    datasetItems: [
      { id: 'CPF01', source: 'CSJT / TST', name: 'Certidão Negativa de Débitos Trabalhistas', returns: 'CNDT emitida pelo CSJT: ausência de débitos executados na Justiça do Trabalho. Validade legal de 180 dias. Exigida em contratações e processos licitatórios.' },
      { id: 'CPF02', source: 'CJF / TRFs', name: 'Certidão Criminal da Justiça Federal', returns: 'Pesquisa de ações criminais, condenações e mandados na Justiça Federal em todas as seções e subseções via sistema CJF. Resultado por região.' },
      { id: 'CPF03', source: 'PGFN / RFB', name: 'Certidão de Débitos Federais', returns: 'CND ou CPD-EN emitida pela PGFN e Receita Federal: débitos tributários, previdenciários e parcelamentos junto à Fazenda Nacional. Validade de 180 dias.' },
      { id: 'CPF04', source: 'TSE / TREs', name: 'Certidão de Quitação Eleitoral', returns: 'Situação regular junto à Justiça Eleitoral: ausência de multas por abstenção não justificada e de inelegibilidades declaradas pelo TSE ou TRE.' },
    ],
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
    useCasesRich: [
      {
        title: 'Concessão de crédito',
        desc: 'Decisões baseadas em um único bureau podem aprovar quem é inadimplente em outro ou recusar quem tem histórico positivo não capturado. O módulo consolida SCR, SPC, Serasa, Boa Vista e Quod em uma única resposta normalizada, eliminando assimetria de informação entre fontes.',
      },
      {
        title: 'Limites e políticas de risco',
        desc: 'Limite de crédito definido sem considerar o comprometimento real de renda gera inadimplência previsível. O módulo entrega não só o score mas o endividamento total no SCR, coobrigações e histórico de renegociações — os dados que revelam a capacidade real de pagamento, não a declarada.',
      },
      {
        title: 'Scoring para fintechs',
        desc: 'Fintechs sem acesso ao SCR do Banco Central tomam decisões com informação incompleta. O módulo inclui o SCR BCB — antes restrito a IF reguladas — habilitando modelos de scoring com a mesma profundidade de dados que os grandes bancos utilizam.',
      },
      {
        title: 'Financiamento imobiliário',
        desc: 'Financiamentos de longo prazo exigem análise de capacidade de pagamento sustentada. O módulo entrega histórico de 60 meses de adimplência por modalidade, posições imobiliárias já registradas e renda estimada por vínculos CLT e INSS.',
      },
    ],
    sla: '99,98%',
    priceFrom: 'R$ 1,60/consulta',
    datasetItems: [
      { id: 'SCR01', source: 'SCR / Banco Central do Brasil', name: 'Carteira de Crédito BCB', returns: 'Total de dívidas ativas, coobrigações, operações em atraso e histórico de renegociações em todas as instituições financeiras reguladas pelo BCB.' },
      { id: 'SCR02', source: 'SCR / BCB', name: 'Histórico de Inadimplência BCB', returns: 'Série histórica de 60 meses de adimplência e inadimplência por modalidade: pessoal, consignado, imobiliário, empresarial e rotativo.' },
      { id: 'SCR03', source: 'SPC Brasil', name: 'Restrições e Score SPC', returns: 'Score SPC de 0 a 1.000, lista de restrições ativas (cheque, protestos, dívidas) e histórico de negativações nos últimos 5 anos.' },
      { id: 'SCR04', source: 'Serasa Experian', name: 'Score Serasa e Negativações', returns: 'Score Serasa de 0 a 1.000, ações negativas (protestos, cheques, dívidas, ações judiciais) e indicadores de comportamento financeiro.' },
      { id: 'SCR05', source: 'Boa Vista SCPC', name: 'Score BV e Restrições SCPC', returns: 'Score Boa Vista de 0 a 1.000, negativações SCPC, consultas recentes ao CPF e análise de comportamento de pagamento nos últimos 24 meses.' },
      { id: 'SCR06', source: 'Quod', name: 'Score Quod e Dados Alternativos', returns: 'Score Quod com metodologia de dados alternativos de renda e pagamento. Restrições, contratos ativos e risco de inadimplência projetado.' },
      { id: 'SCR07', source: 'B2E / Quod', name: 'Dados Comportamentais de Crédito', returns: 'Comportamento de pagamento em utilities (luz, água, gás, telefonia) e varejo: histórico de contas pagas em dia e atrasos registrados.' },
      { id: 'SCR08', source: 'Receita Federal / RAIS', name: 'Renda Estimada por Vínculos CLT', returns: 'Estimativa de renda mensal derivada de vínculos CLT via RAIS, contribuição previdenciária e comparação com capacidade declarada de pagamento.' },
      { id: 'SCR09', source: 'INSS / CadPrev', name: 'Renda Previdenciária e Margem', returns: 'Valor de benefício ativo (aposentadoria, pensão, auxílio), margem consignável útil disponível e banco pagador do benefício.' },
      { id: 'SCR10', source: 'Cadastro Positivo CPC', name: 'Histórico de Pagamentos Positivos', returns: 'Dados do Cadastro Positivo administrado por bureaus associados: pagamentos em dia, pontualidade histórica e score de Cadastro Positivo.' },
      { id: 'SCR11', source: 'SNC Model', name: 'Score Proprietário SNC', returns: 'Score interno calculado com base em todos os bureaus integrados, ponderado por tipo de operação, segmento de risco e dados comportamentais.' },
      { id: 'SCR12', source: 'CVM / B3', name: 'Restrições e Sanções CVM', returns: 'Punições administrativas aplicadas pela CVM a investidores e administradores de fundos. Relevante para crédito a profissionais do mercado financeiro.' },
    ],
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
    useCasesRich: [
      {
        title: 'Crédito consignado',
        desc: 'Concessão de consignado sem verificar a margem real disponível gera contratos inválidos por excesso de comprometimento. O módulo consulta o banco pagador, calcula a margem legal utilizada e o saldo disponível — o dado que o cliente não tem incentivo em revelar voluntariamente.',
      },
      {
        title: 'Capital de giro PJ',
        desc: 'Empresas que pedem capital de giro geralmente têm comprometimento de crédito invisível nos bureaus de varejo. O módulo acessa o SCR Banco Central, revelando coobrigações, garantias prestadas a terceiros e histórico de renegociações — passivos que comprometem a capacidade de pagamento sem aparecer no CNPJ.',
      },
      {
        title: 'Risco de contraparte',
        desc: 'Em operações B2B com pagamento diferido, o risco de inadimplência do comprador define o custo de capital do vendedor. O módulo entrega a probabilidade de default em 12 meses calculada sobre 14 datasets do SCR, bureaus e patrimônio.',
      },
      {
        title: 'Monitoramento de portfólio',
        desc: 'Portfólios de crédito deterioram lentamente — um cliente adimplente pode acumular coobrigações que aumentam seu risco. O monitoramento integrado detecta mudanças de perfil antes que se tornem inadimplência realizada.',
      },
    ],
    sla: '99,95%',
    priceFrom: 'R$ 2,80/consulta',
    datasetItems: [
      { id: 'RFI01', source: 'SCR / Banco Central', name: 'Carteira de Crédito Consolidada', returns: 'Volume total de dívidas ativas por modalidade: pessoal, consignado, imobiliário, rural, empresarial e financiamento de veículos no sistema financeiro regulado.' },
      { id: 'RFI02', source: 'SCR / BCB', name: 'Coobrigações e Garantias', returns: 'Exposição como garantidor ou coobrigado em operações de terceiros. Passivo contingente que impacta a capacidade real de pagamento sem aparecer nas dívidas diretas.' },
      { id: 'RFI03', source: 'SCR / BCB', name: 'Operações em Atraso e Vencidas', returns: 'Dívidas com atraso superior a 15, 30, 60 e 90 dias por modalidade de crédito. Segmentação por tipo de instituição credora e valor em aberto.' },
      { id: 'RFI04', source: 'SCR / BCB', name: 'Histórico de Renegociações', returns: 'Operações renegociadas nos últimos 24 meses: data, valor original, desconto concedido, condições e adimplência pós-renegociação.' },
      { id: 'RFI05', source: 'SCR / BCB', name: 'Limite de Crédito Disponível', returns: 'Saldo utilizável em linhas rotativas (cartão, cheque especial) e crédito pré-aprovado em aberto. Indica comprometimento ou folga de limite.' },
      { id: 'RFI06', source: 'Receita Federal / IRPF', name: 'Renda Declarada IRPF', returns: 'Renda bruta declarada no Imposto de Renda (último exercício), dedução de dependentes e bens e direitos declarados na declaração.' },
      { id: 'RFI07', source: 'RAIS / eSocial', name: 'Renda CLT e Encargos', returns: 'Salário contratual, FGTS recolhido e contribuição previdenciária conforme dados do empregador no eSocial. Proxy de capacidade de pagamento mensal.' },
      { id: 'RFI08', source: 'INSS / CadPrev', name: 'Benefício Previdenciário e Margem', returns: 'Valor do benefício, margem consignável legal (35%) e margem já comprometida com contratos de consignado ativos junto ao banco pagador.' },
      { id: 'RFI09', source: 'SPC / Serasa / Boa Vista', name: 'Comprometimento em Bureaus Privados', returns: 'Score de comprometimento de renda calculado a partir das dívidas em bureaus: complementa o SCR com operações não bancárias (varejo, telco, utilities).' },
      { id: 'RFI10', source: 'Cadastro Positivo', name: 'Comportamento de Pagamento Histórico', returns: 'Série histórica de pagamentos por tipo de credor: banco, fintech, varejo, utilities e telecom. Base para modelo actuarial proprietário do SNC.' },
      { id: 'RFI11', source: 'SNC Model', name: 'Projeção Actuarial de Inadimplência', returns: 'Probabilidade de default (PD) em 12 meses calculada pelo modelo SNC com base nos 10 datasets anteriores e calibrada por segmento de risco.' },
      { id: 'RFI12', source: 'Cartório RI / RGI', name: 'Bens Imóveis Registrados', returns: 'Patrimônio imobiliário por CPF: número de imóveis, município, matrícula parcial e situação de ônus ou gravame registrado em cartório.' },
      { id: 'RFI13', source: 'DETRAN / DENATRAN', name: 'Frota de Veículos', returns: 'Veículos registrados no CPF/CNPJ: tipo, ano, valor FIPE estimado e situação de débitos de IPVA e multas junto ao DETRAN.' },
      { id: 'RFI14', source: 'CVM / B3', name: 'Posições Mobiliárias Declaradas', returns: 'Posições em fundos de investimento e custódia de valores mobiliários via CVM: cota e valor total como referência de patrimônio financeiro disponível.' },
    ],
  },
  {
    slug: 'compliance-e-pep',
    area: 'credito',
    name: 'Compliance & PEP',
    datasets: 9,
    description: 'Listas negras, sanções, PEP e exposição política consolidada.',
    chips: ['OFAC', 'ONU', 'TSE'],
    fullDescription: 'Varredura completa em listas internacionais (OFAC, ONU, UE) e nacionais (COAF, ANPD, entre outras). Identificação de PEP (Pessoa Politicamente Exposta) com graus de exposição e parentes. Conformidade total com COAF Resolução 36.',
    useCases: ['Onboarding PLD/FT', 'KYB (Know Your Business)', 'Monitoramento contínuo', 'Auditorias regulatórias'],
    useCasesRich: [
      {
        title: 'Onboarding PLD/FT',
        desc: 'A COAF Resolução 36 e a Lei 9.613 exigem verificação de PEP e sanções no onboarding — com documentação da verificação. O módulo retorna a consulta estruturada com timestamp, lista consultada e resultado, gerando automaticamente a trilha de auditoria exigida pelos reguladores.',
      },
      {
        title: 'KYB (Know Your Business)',
        desc: 'Verificar apenas o CNPJ é insuficiente. Em PLD/FT, o risco está nos sócios-pessoas-físicas e nos parentes de sócios PEP. O módulo verifica cada sócio do QSA contra 9 listas internacionais e nacionais, incluindo parentes em 2 graus de parentesco.',
      },
      {
        title: 'Monitoramento contínuo',
        desc: 'PEP e sanções não são verificações únicas — um cliente pode ser nomeado para cargo público após o onboarding. O Monitoramento 24h integrado dispara alertas em tempo real quando o status PEP ou a presença em lista de sanção muda para qualquer cliente da carteira.',
      },
      {
        title: 'Auditorias regulatórias',
        desc: 'BACEN, SUSEP e CVM verificam a documentação de cada verificação de PEP realizada. O módulo entrega registros imutáveis de cada consulta — lista verificada, resultado, data, operador — em formato aceito como evidência em processos administrativos.',
      },
    ],
    sla: '99,99%',
    priceFrom: 'R$ 0,35/consulta',
    datasetItems: [
      { id: 'CMP01', source: 'OFAC (EUA)', name: 'Lista OFAC / SDN', returns: 'Verificação na lista SDN do Departamento do Tesouro dos EUA: indivíduos e entidades sancionadas por tráfico, terrorismo e corrupção internacional.' },
      { id: 'CMP02', source: 'ONU / CSNU', name: 'Lista de Sanções ONU', returns: 'Sanções impostas pelo Conselho de Segurança da ONU: regimes sancionados, congelamento de bens e proibições de transações financeiras internacionais.' },
      { id: 'CMP03', source: 'UE / EUR-Lex', name: 'Lista de Sanções União Europeia', returns: 'Entidades e pessoas sujeitas a medidas restritivas da UE por violações de direitos humanos, corrupção, terrorismo e regimes designados.' },
      { id: 'CMP04', source: 'TSE / TREs', name: 'Pessoas Politicamente Expostas — Eletivos', returns: 'Cargos eletivos e mandatos: presidentes, governadores, senadores, deputados, vereadores; histórico de mandatos por cargo e período de exercício.' },
      { id: 'CMP05', source: 'Presidência / DOU', name: 'PEP — Cargos de Alto Risco (Nomeados)', returns: 'Cargos de nomeação por decreto: ministros, secretários, diretores de autarquias, conselheiros de estatais e diplomatas ativos e exonerados.' },
      { id: 'CMP06', source: 'SNC Genograma', name: 'PEP — Parentes e Relacionados', returns: 'Cônjuges, filhos e sócios de PEP em até 2 graus de parentesco ou vínculo societário. Inclui grau de exposição calculado (1, 2 ou 3).' },
      { id: 'CMP07', source: 'COAF / Receita Federal', name: 'Listas Nacionais de Sanções e PLD', returns: 'Pessoas físicas e jurídicas em listas nacionais de suspeitos de lavagem de dinheiro e financiamento ao terrorismo mantidas pela Receita e COAF.' },
      { id: 'CMP08', source: 'Interpol', name: 'Difusões Vermelhas Interpol', returns: 'Consulta a difusões vermelhas da Interpol: indivíduos com mandado de prisão internacional ativo por crime grave passível de extradição.' },
      { id: 'CMP09', source: 'TCU / TCEs', name: 'Inabilitados e Inidôneos TCU', returns: 'Gestores públicos declarados inidôneos, inabilitados ou com julgamento de contas irregular nos Tribunais de Contas da União e dos Estados.' },
    ],
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
    useCasesRich: [
      {
        title: 'Parceiros e fornecedores',
        desc: 'Antes de assinar qualquer contrato, saiba se o parceiro responde a processos trabalhistas, acumula protestos em cartório ou tem histórico de reclamações sistêmicas no Procon. Empresas que transferem risco invisível pela cadeia de suprimentos são a principal causa de passivos contingentes não provisionados — e o Background Check mapeia isso antes do contrato, não depois.',
      },
      {
        title: 'Cargos de liderança',
        desc: 'C-levels, diretores e gerentes de áreas sensíveis têm acesso privilegiado a ativos, dados estratégicos e decisões de alto impacto. Antecedentes criminais não declarados, ações cíveis por desvio de função ou processos trabalhistas como reclamado revelam padrões de comportamento que o currículo não mostra. Contratações sem due diligence geram responsabilidade fiduciária para o board.',
      },
      {
        title: 'Franqueados',
        desc: 'Franqueadores são corresponsáveis pela reputação de toda a rede. Um franqueado com histórico de descumprimento trabalhista, protestos em cartório ou reclamações massivas de consumidores compromete não só a unidade — compromete a marca inteira. Validar o histórico antes do contrato de franquia protege os demais franqueados e a integridade do sistema.',
      },
      {
        title: 'M&A e investimentos',
        desc: 'Em processos de fusão, aquisição ou captação de investimento, a due diligence de pessoas-chave é tão crítica quanto a due diligence financeira. Antecedentes não revelados por sócios ou executivos podem anular acordos, gerar responsabilidade solidária para o adquirente, ou comprometer aprovações regulatórias junto ao CADE e BACEN. O relatório auditável do SNC é aceito como evidência documental nesses processos.',
      },
    ],
    sla: '99,90%',
    priceFrom: 'R$ 4,80/relatório',
    datasetItems: [
      { id: 'BGC01', source: 'TJs Estaduais', name: 'Processos Cíveis Estaduais', returns: 'Processos cíveis nos Tribunais de Justiça Estaduais: tipo de ação, valor da causa, situação processual, foro e últimas movimentações.' },
      { id: 'BGC02', source: 'CJF / TRFs', name: 'Processos na Justiça Federal', returns: 'Ações cíveis e criminais perante a Justiça Federal em todas as regiões: processos ativos, encerrados, condenações e recursos pendentes.' },
      { id: 'BGC03', source: 'CSJT / TRTs', name: 'Processos Trabalhistas', returns: 'Ações trabalhistas como reclamante ou reclamado nos TRTs: número, objeto da ação, situação e valor envolvido.' },
      { id: 'BGC04', source: 'Polícia Federal / SSP', name: 'Antecedentes Criminais', returns: 'Registro de antecedentes em bases policiais federais e estaduais: flagrantes, indiciamentos, condenações e situação de cumprimento de pena.' },
      { id: 'BGC05', source: 'CRC / Cartórios', name: 'Protestos em Cartório', returns: 'Protestos lavrados em nome do CPF ou CNPJ em cartórios de todo o Brasil: valor, credor, data e situação (ativo ou cancelado).' },
      { id: 'BGC06', source: 'CSJT / TST', name: 'Certidão Negativa Trabalhista (CNDT)', returns: 'CNDT emitida pelo CSJT: situação de débitos executados perante a Justiça do Trabalho. Resultado limpo ou com débito pendente.' },
      { id: 'BGC07', source: 'PGFN / RFB', name: 'Certidão de Débitos com a Fazenda', returns: 'CND ou CPD-EN com pendências tributárias e previdenciárias federais. Inclui parcelamentos em REFIS, PERT e outros programas.' },
      { id: 'BGC08', source: 'Imprensa / Open Web', name: 'Mídias Negativas e Reputação', returns: 'Varredura em veículos de imprensa, portais de notícias e bases abertas: menções a fraude, escândalos, processos de repercussão pública e Procon.' },
      { id: 'BGC09', source: 'ReclameAqui / Procon', name: 'Reclamações de Consumidores', returns: 'Quantidade e categoria de reclamações: taxa de resolução, nota de reputação e padrões de reclamações recorrentes que indicam comportamento sistêmico.' },
    ],
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
    useCasesRich: [
      {
        title: 'E-commerce e marketplace',
        desc: 'Chargebacks custam mais do que o produto — custam o produto, a taxa e o risco de perda de conta junto à adquirente. O Antifraude analisa device fingerprint, IP, email e histórico de chargeback em menos de 200ms, bloqueando transações de alto risco antes da aprovação sem impactar o checkout de clientes legítimos.',
      },
      {
        title: 'Abertura de contas',
        desc: 'Contas abertas com identidades sintéticas são a base das fraudes de account takeover. O módulo verifica, na abertura, se o CPF, email, telefone e dispositivo já estão associados a padrões de fraude na rede SNC, bloqueando contas-laranja antes que gerem passivo.',
      },
      {
        title: 'Transações PIX',
        desc: 'PIX irreversível mais engenharia social equivale a prejuízo sem recuperação. O Antifraude avalia o padrão da transação — valor atípico, novo beneficiário, horário incomum, dispositivo diferente — podendo bloquear ou exigir confirmação antes do débito, sem impactar 99% das transações legítimas.',
      },
      {
        title: 'Emissão de cartão',
        desc: 'Cartões emitidos para identidades sintéticas são usados para fraudes de crédito que só aparecem na inadimplência. O módulo valida email, telefone e device no momento da emissão, detectando inconsistências de perfil que indicam intenção fraudulenta antes do limite ser concedido.',
      },
    ],
    sla: '99,98%',
    priceFrom: 'R$ 1,15/avaliação',
    datasetItems: [
      { id: 'AFR01', source: 'SNC Engine', name: 'Score de Risco Transacional', returns: 'Probabilidade de fraude de 0 a 100 calculada em < 200ms com base em 16 variáveis: dispositivo, comportamento, localização e histórico da sessão.' },
      { id: 'AFR02', source: 'Device Intelligence', name: 'Device Fingerprint', returns: 'Impressão digital do dispositivo: SO, browser, resolução, IP, VPN/proxy/Tor, emulação e score de reuso em fraudes anteriores do ecossistema.' },
      { id: 'AFR03', source: 'Telecom / ANATEL', name: 'Phone Score e Validação', returns: 'Score de risco do telefone: operadora, tempo de ativação, histórico de portabilidade, uso em lista negra de fraudes e confirmação de titularidade.' },
      { id: 'AFR04', source: 'Email Intelligence', name: 'Email Score e Validação', returns: 'Score de risco do email: domínio temporário, data de criação estimada, presença em bases de abuse e consistência com o perfil apresentado.' },
      { id: 'AFR05', source: 'IP Intelligence', name: 'Análise de Endereço IP', returns: 'Geolocalização, ASN, tipo de conexão (residencial, datacenter, VPN, proxy, Tor), reputação histórica e distância do endereço cadastral.' },
      { id: 'AFR06', source: 'SNC Network', name: 'Análise de Velocidade de Operações', returns: 'Detecção de padrões anômalos: múltiplos onboardings em curto intervalo, múltiplos CPFs por dispositivo e comportamento de rede bot-like.' },
      { id: 'AFR07', source: 'Bureaus / Rede SNC', name: 'Histórico de Chargeback', returns: 'Histórico de estornos e chargebacks associados ao CPF, email ou dispositivo nas redes de prevenção compartilhadas entre membros do ecossistema SNC.' },
      { id: 'AFR08', source: 'OCR Engine', name: 'Validação Documental Antifraude', returns: 'Detecção de documentos adulterados ou clonados: verificação de holograma, MRZ, fontes e elementos gráficos de segurança do RG e CNH.' },
      { id: 'AFR09', source: 'BioAuth Engine', name: 'Análise Comportamental Biométrica', returns: 'Biometria comportamental: padrão de digitação, touch/mouse, tempo de preenchimento e sequência de navegação. Detecta automação e bots.' },
      { id: 'AFR10', source: 'SNC Consortium', name: 'Rede de Identidades Sintéticas', returns: 'Consulta ao grafo de identidades sintéticas: CPFs construídos artificialmente, compartilhamento de dados entre múltiplas identidades fraudulentas.' },
    ],
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
    useCasesRich: [
      {
        title: 'KYC avançado',
        desc: 'Bureaus tradicionais não capturam escândalos de imprensa ou associações a personagens investigados. A varredura de Mídia Negativa complementa o KYC com o risco reputacional que não aparece em nenhum banco de dados estruturado — mas que define a percepção de risco do regulador.',
      },
      {
        title: 'Due diligence reputacional',
        desc: 'Um parceiro sem processos judiciais pode ter sido protagonista de reportagem investigativa sobre desvios em empresa anterior, ou acumular centenas de reclamações sistêmicas no Procon. O módulo varre imprensa nacional, portais jurídicos, Procon e redes sociais com análise de sentimento automatizada.',
      },
      {
        title: 'Monitoramento de parceiros',
        desc: 'Reputação muda. Um parceiro limpo hoje pode ser alvo de reportagem investigativa amanhã. O monitoramento contínuo integrado gera alertas em tempo real quando nova publicação negativa é identificada, antes que a informação chegue pelo mercado.',
      },
      {
        title: 'Prevenção de fraude',
        desc: 'Fraudadores recorrentes acumulam rastros na imprensa e em reclamações online antes de aparecerem em listas negras formais. A varredura identifica esses padrões precocemente, adicionando uma camada de inteligência que os bureaus estruturados não fornecem.',
      },
    ],
    sla: '99,85%',
    priceFrom: 'R$ 2,40/varredura',
    datasetItems: [
      { id: 'MND01', source: 'Imprensa Nacional / News APIs', name: 'Varredura em Notícias', returns: 'Menções em veículos de imprensa nacionais e regionais: escândalos, fraudes, processos públicos e investigações. Score de frequência e impacto editorial.' },
      { id: 'MND02', source: 'Google News / Open Web', name: 'Web Aberta e Portais', returns: 'Rastreamento em portais de notícia, blogs especializados e sites de interesse público: referências negativas indexadas, data da publicação e veículo de origem.' },
      { id: 'MND03', source: 'ReclameAqui / Procon', name: 'Reclamações de Consumidores', returns: 'Quantidade e categorias de reclamações, taxa de resolução, nota pública de reputação e padrões recorrentes que indicam comportamento sistêmico.' },
      { id: 'MND04', source: 'DOU / Diários Oficiais', name: 'Publicações em Diários Oficiais', returns: 'Penalidades administrativas, suspensões e inabilitações registradas no DOU e nos Diários Oficiais estaduais. Resultado de decisões regulatórias obrigatórias.' },
      { id: 'MND05', source: 'Redes Sociais / Social Listening', name: 'Análise de Sentimento em Redes Sociais', returns: 'Frequência e sentimento de menções negativas em redes abertas: Twitter/X, Facebook, LinkedIn, YouTube e fóruns especializados. Escala por plataforma.' },
      { id: 'MND06', source: 'SNC NLP Engine', name: 'Score de Reputação Consolidado', returns: 'Score único de reputação de 0 a 100 calculado sobre os 5 datasets anteriores, normalizado por setor e porte. Classifica o risco reputacional em baixo, médio ou alto.' },
    ],
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
    useCasesRich: [
      {
        title: 'Fraude corporativa',
        desc: 'Quando a suspeita já existe, a investigação precisa ser documentada para suportar decisões jurídicas. O LOVAC consolida 17 datasets em relatório forense com hash SHA-256: patrimônio real, grafo de relacionamentos, timeline de eventos e registros que o investigado preferiria esconder.',
      },
      {
        title: 'Due diligence executiva',
        desc: 'Para nomeações de C-level ou M&A com alvo de alta complexidade, a due diligence padrão é insuficiente. O LOVAC mapeia o grafo de relacionamentos completo, cruza patrimônio declarado com registros públicos e gera relatório narrativo com recomendação de risco.',
      },
      {
        title: 'Investigação patrimonial',
        desc: 'Processos de execução e recuperação de crédito exigem identificar ativos de difícil localização — imóveis em cartório, veículos, participações societárias e benefícios previdenciários. O LOVAC consolida essas informações em relatório único com fontes rastreáveis e timestamp.',
      },
      {
        title: 'Compliance de alto risco',
        desc: 'Clientes com estruturas societárias opacas ou histórico de exposição política elevada exigem due diligence Enhanced, exigida pela COAF Resolução 36. O LOVAC fornece o nível de profundidade — e a documentação auditável — que satisfaz inspeções regulatórias.',
      },
    ],
    sla: '99,80%',
    priceFrom: 'R$ 28,00/relatório',
    datasetItems: [
      { id: 'LOV01', source: 'Receita Federal / SERPRO', name: 'Identidade e Cadastro Profundo', returns: 'Dados cadastrais completos de PF e PJ: situação, vínculos, histórico de alterações e cruzamento com bases previdenciárias, eleitorais e de atos empresariais.' },
      { id: 'LOV02', source: 'Cartório RI / RGI', name: 'Patrimônio Imobiliário', returns: 'Imóveis registrados no CPF/CNPJ em Cartórios de Registro de Imóveis de todo o Brasil: matrícula parcial, município, área e ônus ou gravame registrado.' },
      { id: 'LOV03', source: 'DETRAN / DENATRAN', name: 'Frota de Veículos e Histórico', returns: 'Veículos registrados: placa, tipo, ano, valor FIPE estimado, débitos de IPVA e multas. Histórico de transferências de propriedade.' },
      { id: 'LOV04', source: 'TJs / CJF / TST', name: 'Processos em Todas as Esferas', returns: 'Processos cíveis, criminais, trabalhistas e federais ativos e encerrados: tipo, valor e situação. Cobre Justiça Estadual, Federal e do Trabalho.' },
      { id: 'LOV05', source: 'TSE / Câmaras / DOU', name: 'Histórico Político e Mandatos', returns: 'Candidaturas históricas, cargos eletivos exercidos, vínculos com partidos políticos e doações eleitorais recebidas e realizadas.' },
      { id: 'LOV06', source: 'COAF / OFAC / ONU / UE', name: 'Sanções e Listas de Vigilância', returns: 'Presença em listas nacionais e internacionais: COAF, Receita, OFAC, ONU, UE e Interpol. Cobre terrorismo, lavagem e desvio de recursos públicos.' },
      { id: 'LOV07', source: 'SNC Grafo Engine', name: 'Grafo de Relacionamentos', returns: 'Mapeamento de rede: sócios comuns, cônjuges, parentes, associados por dados compartilhados (endereço, telefone, email). Exportável em JSON e visualizável.' },
      { id: 'LOV08', source: 'Open Web / Imprensa', name: 'Mídias Negativas e Reputação', returns: 'Varredura em imprensa, portais jurídicos e redes sociais: fraudes, irregularidades, processos com repercussão pública e casos de Procon.' },
      { id: 'LOV09', source: 'TCU / CGU / MPF', name: 'Irregularidades e Improbidades', returns: 'Condenações por improbidade, sanções do TCU, acordos de leniência e registros de investigação do MPF, CADE e CVM disponíveis publicamente.' },
      { id: 'LOV10', source: 'SNC AI Report Engine', name: 'Relatório Forense Analítico', returns: 'Síntese gerada por LLM auditável: consolidação de todos os datasets em relatório com linha do tempo, grafo e recomendação de risco. PDF com hash SHA-256.' },
    ],
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
    useCasesRich: [
      {
        title: 'Gestão de carteira de crédito',
        desc: 'A situação de risco de um cliente muda após a concessão. O Monitoramento 24h entrega alertas via webhook no momento em que o evento ocorre — nova inadimplência no SCR, protesto, demissão — permitindo ação preventiva antes que o contrato entre em atraso. É a diferença entre provisão proativa e perda realizada.',
      },
      {
        title: 'Compliance proativo',
        desc: 'Clientes PEP precisam de monitoramento contínuo — um correntista pode ser nomeado para cargo público após o onboarding. O alerta automático de mudança de status PEP ou inclusão em lista de sanção garante que a equipe seja notificada em tempo real, sem depender de re-consulta periódica manual.',
      },
      {
        title: 'Alertas de fraude',
        desc: 'Accounts comprometidas passam por eventos detectáveis antes da fraude ser consumada — novo dispositivo, endereço atualizado, nova linha telefônica. O módulo detecta essas mudanças e gera alertas que permitem autenticação adicional antes do prejuízo.',
      },
      {
        title: 'Monitoramento PLD',
        desc: 'Políticas de PLD exigem re-verificação periódica de clientes de alto risco. O monitoramento contínuo substitui ciclos manuais de revisão por alertas automáticos de eventos relevantes, reduzindo custo operacional de compliance sem comprometer a cobertura regulatória.',
      },
    ],
    sla: '99,97%',
    priceFrom: 'R$ 0,15/evento',
    datasetItems: [
      { id: 'MON01', source: 'SPC / Serasa / Boa Vista / Quod', name: 'Alertas de Novas Restrições', returns: 'Notificação em tempo real quando o monitorado recebe nova restrição em qualquer bureau: protesto, negativação, chargeback ou bloqueio judicial.' },
      { id: 'MON02', source: 'TSE / DOU / Câmaras', name: 'Eventos de Exposição Política PEP', returns: 'Alerta quando o monitorado assume cargo que o classifica como PEP: posse em cargo eletivo, nomeação em DOU ou mudança de categoria de exposição.' },
      { id: 'MON03', source: 'TJs / CJF / CSJT', name: 'Novos Processos Judiciais', returns: 'Alerta de ajuizamento de nova ação cível, criminal, trabalhista ou federal. Inclui tipo de ação, valor da causa e foro competente.' },
      { id: 'MON04', source: 'CRC / Cartórios', name: 'Alertas de Protesto em Cartório', returns: 'Notificação de novo protesto lavrado em nome do CPF ou CNPJ: valor, credor, praça e data de lavratura.' },
      { id: 'MON05', source: 'COAF / OFAC / Listas Internacionais', name: 'Inclusão em Listas de Sanção', returns: 'Alerta imediato quando o monitorado é incluído em lista de sanção nacional (COAF, Receita) ou internacional (OFAC, ONU, UE, Interpol).' },
      { id: 'MON06', source: 'Imprensa / Open Web', name: 'Alertas de Mídia Negativa', returns: 'Notificação quando nova publicação negativa é identificada na imprensa, diários oficiais ou redes sociais, associada ao monitorado.' },
      { id: 'MON07', source: 'SCR / BCB', name: 'Mudanças de Status no SCR BCB', returns: 'Alerta quando há operação vencida ou renegociação registrada no SCR Banco Central para o CPF/CNPJ monitorado. Ideal para gestão de carteira de crédito.' },
    ],
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
    useCasesRich: [
      {
        title: 'KYB (Know Your Business)',
        desc: 'CNPJ ativo não significa empresa solvente ou operacional. O módulo entrega a radiografia real: faturamento estimado por dados fiscais do SPED, número de funcionários via eSocial, reclamações no Procon e processos ativos — a diferença entre uma empresa que funciona e um CNPJ de prateleira.',
      },
      {
        title: 'Onboarding de fornecedores',
        desc: 'Um fornecedor com certificados impecáveis mas CNPJ inapto na Receita, inscrição estadual cancelada por irregularidade fiscal ou execuções trabalhistas ativas é um passivo a caminho. O módulo identifica esses sinais antes do contrato ser assinado.',
      },
      {
        title: 'Crédito PJ',
        desc: 'Crédito para pessoa jurídica baseado apenas na declaração do sócio é empiricamente arriscado. O módulo cruza faturamento estimado por SPED com capacidade de pagamento declarada, identificando sobre-declaração de receita antes da aprovação da linha de crédito.',
      },
      {
        title: 'Auditoria pré-contratual',
        desc: 'Antes de assinar contratos de longa duração com fornecedores críticos, a auditoria de saúde empresarial inclui mais que certidões: situação real de operação, porte estimado, histórico de litígios e scorecard de saúde de A a E calculado sobre os 9 datasets do módulo.',
      },
    ],
    sla: '99,95%',
    priceFrom: 'R$ 3,50/consulta',
    datasetItems: [
      { id: 'IND01', source: 'Receita Federal', name: 'Situação Cadastral CNPJ Completa', returns: 'Situação (ativa, suspensa, inapta, baixada), regime tributário, CNAEs principal e secundários, data de abertura, capital social e endereço de registro.' },
      { id: 'IND02', source: 'Receita Federal / SINTEGRA', name: 'Situação Tributária Estadual ICMS', returns: 'Inscrição estadual, situação junto à SEFAZ de cada UF, habilitação para emissão de NF-e e possível cancelamento de inscrição por irregularidade fiscal.' },
      { id: 'IND03', source: 'RAIS / eSocial', name: 'Número de Funcionários e Folha', returns: 'Quantidade de vínculos CLT ativos via RAIS e eSocial: total de funcionários, regime de trabalho e faturamento estimado com base na folha.' },
      { id: 'IND04', source: 'SPED / EFD / ECF', name: 'Faturamento e Lucro Estimados', returns: 'Estimativa de receita bruta anual derivada de dados fiscais do SPED (EFD e ECF): faturamento histórico por CNAE, lucro tributável e benchmarking setorial.' },
      { id: 'IND05', source: 'Receita Federal', name: 'Quadro Societário QSA Detalhado', returns: 'Sócios e administradores com participação societária, qualificação, data de entrada e CPF/CNPJ verificado. Identifica alterações recentes.' },
      { id: 'IND06', source: 'Receita / Certidões', name: 'Certidões Negativas Consolidadas', returns: 'Situação de certidões federais (CND/CPD-EN), estaduais (CND fiscal) e trabalhistas (CNDT): resultado, validade e prazo de renovação.' },
      { id: 'IND07', source: 'ReclameAqui / Procon', name: 'Reputação e Reclamações de Clientes', returns: 'Quantidade de reclamações, taxa de resolução, nota pública no ReclameAqui e histórico de auto-composição em Procon estaduais.' },
      { id: 'IND08', source: 'TJs / CJF', name: 'Processos Cíveis e Comerciais', returns: 'Ações judiciais contra o CNPJ na Justiça Estadual e Federal: contratos, cobranças, recuperação judicial e execuções fiscais ativas.' },
      { id: 'IND09', source: 'CRC / Cartórios', name: 'Protestos da Pessoa Jurídica', returns: 'Protestos em cartórios de todo o Brasil: valor protestado, credor, vencimento e status atual (ativo ou cancelado).' },
      { id: 'IND10', source: 'SNC Score PJ Engine', name: 'Scorecard de Saúde Empresarial', returns: 'Rating consolidado de saúde operacional e financeira de A a E, com base nos 9 datasets anteriores. Inclui recomendação de risco e benchmarking setorial.' },
    ],
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
    useCasesRich: [
      {
        title: 'Estruturas societárias complexas',
        desc: 'Holdings em cascata, empresas com sócios comuns e CNPJs no mesmo endereço são sinais de estruturas criadas para dificultar a identificação do risco real. O módulo mapeia automaticamente a rede completa, identificando sócios em comum, endereços compartilhados e vínculos não declarados entre empresas aparentemente independentes.',
      },
      {
        title: 'Identificação de UBO',
        desc: 'Regulações de PLD/FT exigem identificação do Beneficiário Final até o nível de 25% de participação. O módulo expande o QSA recursivamente, identificando a pessoa física que controla a cadeia societária — mesmo através de múltiplas camadas de holdings.',
      },
      {
        title: 'Risco de grupo econômico',
        desc: 'Risco em grupos econômicos é solidário — a inadimplência de uma subsidiária afeta as demais e pode comprometer garantias cruzadas. O módulo identifica empresas do mesmo grupo por sócios comuns, endereço e representante, calculando o risco consolidado de toda a rede antes da decisão de crédito.',
      },
      {
        title: 'M&A',
        desc: 'Estruturas societárias ocultas reveladas após o fechamento geram responsabilidade para o adquirente. O módulo mapeia o grafo completo antes do signing — identificando conexões com PEP, participações em entidades reguladas e empresas do mesmo grupo com passivos ocultos.',
      },
    ],
    sla: '99,90%',
    priceFrom: 'R$ 5,20/mapa',
    datasetItems: [
      { id: 'CIR01', source: 'Receita Federal', name: 'Quadro Societário QSA Expandido', returns: 'Sócios e administradores com participação, data de entrada, qualificação e flags de PEP ou sanções. Base primária para expansão do grafo societário.' },
      { id: 'CIR02', source: 'Receita Federal', name: 'Empresas do Mesmo Grupo Econômico', returns: 'CNPJs com sócios comuns, mesmo endereço de sede ou mesmo representante legal. Identifica holdings, subsidiárias e empresas coligadas não declaradas.' },
      { id: 'CIR03', source: 'SNC Geo / IBGE', name: 'Vínculos por Endereço Compartilhado', returns: 'PJs que compartilham o mesmo endereço de sede ou domicílio fiscal: número de empresas no endereço e risco de endereço de fachada.' },
      { id: 'CIR04', source: 'SNC Grafo Engine', name: 'Grafo de Relacionamentos PF-PJ', returns: 'Rede visual e exportável de vínculos: cada nó representa uma PF ou PJ, cada aresta o tipo de relação (societário, processual, endereço ou familiar).' },
      { id: 'CIR05', source: 'TSE / DOU', name: 'Vínculos Políticos e Mandatos', returns: 'Conexões com agentes públicos: cargos exercidos por sócios, doações recebidas de PJs e doações realizadas a partidos por sócios da empresa consultada.' },
      { id: 'CIR06', source: 'TJs / CJF', name: 'Processos Compartilhados entre Partes', returns: 'Processos nos quais a PJ e seus sócios figuram juntos como litisconsortes. Indica ações movidas contra o grupo econômico como um todo.' },
      { id: 'CIR07', source: 'COAF / Listas de Sanção', name: 'Sócios em Listas de Vigilância', returns: 'Verificação de cada sócio identificado em listas nacionais e internacionais: OFAC, ONU, UE, COAF, Interpol e inabilitados do TCU.' },
      { id: 'CIR08', source: 'CVM / BACEN', name: 'Participações em Entidades Reguladas', returns: 'Sócios com participação em fundos de investimento (CVM) ou instituições financeiras (BCB): cargos de diretoria, conselho e representação legal.' },
    ],
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
    useCasesRich: [
      {
        title: 'Crédito rural',
        desc: 'Financiamento rural para propriedades com embargo IBAMA ativo ou CAR pendente cria risco regulatório para o banco concedente. O módulo verifica a situação ambiental do imóvel antes da liberação do crédito, protegendo o financiador de associação com irregularidade ambiental.',
      },
      {
        title: 'Financiamento verde',
        desc: 'Fundos ESG e linhas de crédito verde exigem comprovação de conformidade ambiental dos tomadores. O módulo entrega o Score ESG consolidado com evidências em três dimensões — ambiental, social e governança — pronto para uso em relatórios de impacto e due diligence ESG.',
      },
      {
        title: 'Fornecedores do agro',
        desc: 'Cadeias de suprimento do agronegócio enfrentam pressão crescente de compradores internacionais e legislações como o EUDR. O módulo verifica se o fornecedor rural consta da Lista Suja de trabalho escravo, tem embargos do IBAMA ou irregularidade no CAR antes do contrato de fornecimento.',
      },
      {
        title: 'ESG reporting',
        desc: 'Relatórios de sustentabilidade GRI, SASB e TCFD exigem dados verificáveis sobre a cadeia de valor, não autodeclarações. O módulo fornece dados de conformidade ambiental e trabalhista dos fornecedores em formato estruturado, com fonte e data de referência auditável por terceiros.',
      },
    ],
    sla: '99,85%',
    priceFrom: 'R$ 1,90/consulta',
    datasetItems: [
      { id: 'ESG01', source: 'IBAMA', name: 'Embargos e Autos de Infração Ambiental', returns: 'Embargos de obra e área, autos de infração lavrados pelo IBAMA: tipo de infração, área embargada, situação e valor da multa aplicada. Cobre PF e PJ.' },
      { id: 'ESG02', source: 'SICAR / SFB', name: 'Cadastro Ambiental Rural CAR', returns: 'Situação no SICAR: área total, Reserva Legal declarada, APP, situação de análise e inconsistências apontadas pelo órgão competente.' },
      { id: 'ESG03', source: 'INCRA / SNCR', name: 'Cadastro de Imóveis Rurais', returns: 'Módulos fiscais, classificação fundiária, uso declarado, situação no ITR e histórico de regularização fundiária perante o INCRA.' },
      { id: 'ESG04', source: 'MTE / MPT', name: 'Trabalho Escravo e Irregular no Campo', returns: 'Empresas e fazendas incluídas na Lista Suja do MTE por emprego de trabalho análogo à escravidão. Situação atual e data de inclusão ou exclusão.' },
      { id: 'ESG05', source: 'Comex / SISCOMEX', name: 'Histórico de Exportação Agrícola', returns: 'Exportações de commodities via SISCOMEX: produto NCM, volume, destino, valor FOB e habilitação no Registro de Exportadores e Importadores (REI).' },
      { id: 'ESG06', source: 'MAPA / AGROFIT', name: 'Uso de Agrotóxicos e Certificações', returns: 'Conformidade com lista de proibidos pela ANVISA/MAPA, certificações orgânicas ativas e histórico de irregularidades em uso de insumos agrícolas.' },
      { id: 'ESG07', source: 'SNC ESG Model', name: 'Score ESG Consolidado', returns: 'Pontuação ESG de 0 a 100: ambiental (embargos, CAR), social (trabalho escravo) e governança (irregularidades fiscais e fundiárias). Benchmarking setorial.' },
    ],
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
    useCasesRich: [
      {
        title: 'Licitações públicas',
        desc: 'Habilitação em licitação exige conjunto específico de certidões com validades simultâneas. O módulo centraliza emissão e monitora vencimentos, alertando com antecedência suficiente para renovação — a empresa que perde licitação por certidão vencida cometeu um erro evitável.',
      },
      {
        title: 'Habilitação de fornecedores',
        desc: 'Políticas de gestão de fornecedores de grandes empresas exigem certidões válidas de todos os CNPJs no cadastro. O módulo faz a gestão automatizada do ciclo de vida das certidões, garantindo conformidade permanente sem custo operacional crescente.',
      },
      {
        title: 'Compliance fiscal',
        desc: 'Empresas que operam com fornecedores irregulares do ponto de vista fiscal podem ser responsabilizadas solidariamente em execuções fiscais. O monitoramento identifica quando um fornecedor perde a regularidade, permitindo ação antes que o risco seja transferido para o contratante.',
      },
      {
        title: 'Financiamentos',
        desc: 'Contratos de financiamento com bancos e BNDES exigem manutenção de regularidade fiscal e trabalhista durante toda a vigência. O módulo garante monitoramento automático, alertando em caso de perda de certidão antes que o covenant seja violado e o financiamento antecipado.',
      },
    ],
    sla: '99,80%',
    priceFrom: 'R$ 1,40/certidão',
    datasetItems: [
      { id: 'CPJ01', source: 'PGFN / Receita Federal', name: 'Certidão de Débitos Federais CND/CPD-EN', returns: 'Situação de débitos tributários e previdenciários perante a Fazenda Nacional. Inclui REFIS, PERT e parcelamentos especiais ativos.' },
      { id: 'CPJ02', source: 'CSJT / TST', name: 'Certidão Negativa de Débitos Trabalhistas', returns: 'CNDT emitida pelo CSJT para CNPJ: ausência de débitos com exigibilidade na Justiça do Trabalho. Válida por 180 dias, exigida em licitações e contratos.' },
      { id: 'CPJ03', source: 'INSS / RFB', name: 'Certidão de Regularidade INSS', returns: 'Situação do CNPJ perante a Previdência Social: recolhimentos em dia, parcelamentos e ausência de débitos executados relativos às contribuições previdenciárias.' },
      { id: 'CPJ04', source: 'CEF / FGTS', name: 'Certidão de Regularidade FGTS CRF', returns: 'CRF emitido pela Caixa: recolhimentos em dia, ausência de execuções e situação de parcelamento de débitos do FGTS. Exigida em contratos e habilitações.' },
      { id: 'CPJ05', source: 'CJF / TRFs', name: 'Certidão da Justiça Federal', returns: 'Pesquisa de ações cíveis e criminais na Justiça Federal envolvendo o CNPJ em todas as regiões. Exigida em M&A e habilitação de fornecedores públicos.' },
      { id: 'CPJ06', source: 'SEFAZ / CAC Estaduais', name: 'Certidões Estaduais ICMS e IPTU', returns: 'Certidões negativas expedidas pelas Secretarias de Fazenda estaduais: débitos de ICMS, IPVA da frota PJ e IPTU de imóveis de propriedade.' },
    ],
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
    useCasesRich: [
      {
        title: 'Enriquecimento de base',
        desc: 'Cadastros com email inválido, telefone desativado ou endereço desatualizado custam dinheiro em comunicação que não chega. O Perfil Digital valida email, telefone, IP e dispositivo em tempo real, enriquecendo a base com atributos digitais verificados e atualizados.',
      },
      {
        title: 'Personalização de ofertas',
        desc: 'Oferta de produto financeiro com ticket e canal errado tem taxa de conversão zero. O perfil de maturidade digital — apps instalados, comportamento de compra online, presença em redes sociais — permite segmentação muito mais precisa que dados demográficos tradicionais.',
      },
      {
        title: 'Antifraude digital',
        desc: 'Identidade sintética tem perfil digital inconsistente: email criado recentemente, número portado nos últimos dias, dispositivo nunca visto antes. O módulo detecta essas inconsistências na abertura de conta, sinalizando para revisão antes que a fraude seja completada.',
      },
      {
        title: 'Onboarding sem fricção',
        desc: 'Solicitar documentos que o sistema já consegue verificar digitalmente é fricção desnecessária que aumenta o abandono. O Perfil Digital valida endereço por IP, telefone pela operadora e email por entregabilidade — eliminando pedidos de comprovante que degradam a experiência do cliente legítimo.',
      },
    ],
    sla: '99,90%',
    priceFrom: 'R$ 1,60/perfil',
    datasetItems: [
      { id: 'PFD01', source: 'Telecom / ANATEL', name: 'Telefone e Operadora Validados', returns: 'Operadora ativa, tipo de linha (pré/pós-pago), tempo de ativação, portabilidade histórica e score de confiança de titularidade do número.' },
      { id: 'PFD02', source: 'Email Intelligence', name: 'Email Validado e Score de Risco', returns: 'Validade do email (entregável, bounce, domínio temporário), data estimada de criação, atividade e presença em bases de abuse ou fraude.' },
      { id: 'PFD03', source: 'IP / Geolocation Engine', name: 'Geolocalização e Análise de IP', returns: 'IP da última conexão: cidade, UF, ASN, tipo (residencial/corporativa/VPN/proxy/Tor) e consistência com o endereço cadastral declarado.' },
      { id: 'PFD04', source: 'Device Intelligence', name: 'Perfil de Dispositivo', returns: 'Sistema operacional, browser, modelo de hardware estimado, resolução de tela e score de reuso do dispositivo em fraudes anteriores.' },
      { id: 'PFD05', source: 'App Store / Play Store Intel', name: 'Aplicativos Instalados Estimados', returns: 'Estimativa de apps instalados por inferência de comportamento: financeiros, apostas, redes sociais e comunicação. Indicador de perfil de uso digital.' },
      { id: 'PFD06', source: 'Social Graph Intelligence', name: 'Presença em Redes Sociais', returns: 'Identificação de perfis públicos associados ao CPF: Instagram, LinkedIn, Facebook, Twitter/X. Retorna handle, data estimada e nível de atividade.' },
      { id: 'PFD07', source: 'BigData / Behavioral Model', name: 'Score de Maturidade Digital', returns: 'Score de 0 a 100 medindo engajamento digital: tempo online estimado, diversidade de apps, estabilidade de dispositivo e histórico de interações.' },
      { id: 'PFD08', source: 'Telecom Intel', name: 'Atividade e Posse do Número', returns: 'Volume estimado de comunicações, padrão de uso de SMS e confirmação de posse ativa do número (SIM Swap recente detectado ou não).' },
      { id: 'PFD09', source: 'Ecommerce / Marketplace Intel', name: 'Comportamento de Compra Online', returns: 'Frequência estimada de compras, ticket médio, categorias de produto e presença em marketplaces como vendedor ou comprador.' },
      { id: 'PFD10', source: 'SNC Digital Model', name: 'Score de Risco Digital Consolidado', returns: 'Score de risco digital de 0 a 100 calculado sobre os 9 atributos anteriores: identifica perfis inconsistentes, múltiplas identidades por dispositivo e uso suspeito.' },
    ],
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
    useCasesRich: [
      {
        title: 'Relatórios para comitês de crédito',
        desc: 'Analistas transformam dados brutos em texto para apresentar ao comitê — trabalho repetitivo, caro e propenso a inconsistências. O Relatório IA gera a síntese em linguagem natural diretamente dos datasets consultados, com riscos identificados e recomendação de ação, em formato pronto para uso em reunião.',
      },
      {
        title: 'Due diligence executiva',
        desc: 'Due diligence de pessoas físicas complexas gera volumes de informação difíceis de sintetizar manualmente. O LLM auditável consolida processos, patrimônio, histórico político, mídias negativas e sanções em relatório narrativo coerente, com linha do tempo e identificação de padrões que a análise manual tende a perder.',
      },
      {
        title: 'Compliance documentado',
        desc: 'Reguladores exigem evidência de que a análise foi realizada — não apenas o resultado. O Relatório IA gera trilha auditável com cada dataset consultado, resultado, timestamp e modelo LLM utilizado, com hash SHA-256 imutável. É a documentação de compliance gerada no mesmo momento que a análise.',
      },
      {
        title: 'Análise de risco narrativa',
        desc: 'Dados estruturados revelam o quê, mas não o porquê. O LLM identifica conexões causais entre eventos — o processo trabalhista que coincidiu com a saída do sócio majoritário e a queda de faturamento — que analistas humanos levam horas para identificar manualmente.',
      },
    ],
    sla: '99,85%',
    priceFrom: 'R$ 3,80/relatório',
    datasetItems: [
      { id: 'RIA01', source: 'SNC Data Aggregator', name: 'Consolidação de Datasets do Caso', returns: 'Compilação estruturada de todos os dados disponíveis do CPF ou CNPJ nos módulos habilitados: cadastro, crédito, PEP, processos e patrimônio.' },
      { id: 'RIA02', source: 'SNC NLP Pipeline', name: 'Estruturação para Modelo de Linguagem', returns: 'Transformação dos dados brutos em contexto normalizado para o LLM: entidades, fatos, datas, valores e relações causais identificadas nos datasets.' },
      { id: 'RIA03', source: 'GPT-4o / Amazon Nova / Mistral', name: 'Narrativa de Análise Gerada por IA', returns: 'Relatório em linguagem natural gerado pelo LLM selecionado: perfil completo, riscos identificados e recomendação de ação para a equipe.' },
      { id: 'RIA04', source: 'SNC Risk Classifier', name: 'Classificação e Score de Risco', returns: 'Score consolidado de 0 a 100 com justificativa por dimensão: financeira, legal, reputacional e comportamental. Inclui classificação de criticidade.' },
      { id: 'RIA05', source: 'SNC Highlight Engine', name: 'Pontos de Atenção e Alertas', returns: 'Flags automáticos de informações críticas: sanções ativas, processos recentes, PEP de 1.º grau ou discrepâncias entre dados declarados e verificados.' },
      { id: 'RIA06', source: 'SNC Audit Trail', name: 'Trilha de Auditoria do Relatório', returns: 'Registro imutável de cada dataset consultado, resultado, timestamp e modelo LLM utilizado. Hash SHA-256 por relatório para rastreabilidade completa.' },
      { id: 'RIA07', source: 'SNC PDF Engine', name: 'Exportação para PDF Auditável', returns: 'Geração em PDF com cabeçalho institucional, assinatura digital e hash de integridade. Pronto para apresentação a comitês de crédito e auditores externos.' },
    ],
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
    useCasesRich: [
      {
        title: 'PEP de nível 3 e 4',
        desc: 'A definição de PEP do BCB inclui parentes e associados próximos de políticos — os chamados níveis 3 e 4, raramente identificados em buscas simples. O módulo calcula o grau de exposição política para cada sócio, incluindo cônjuges, filhos e sócios de PEP direto, com justificativa e nível de risco calculado.',
      },
      {
        title: 'Onboarding de políticos',
        desc: 'Onboarding de pessoa com histórico político extenso — candidaturas em múltiplos estados, cargos de confiança, bens declarados inconsistentes — levaria horas de pesquisa manual. O módulo entrega o perfil político completo em segundos, com fontes públicas rastreáveis.',
      },
      {
        title: 'Compliance eleitoral',
        desc: 'Períodos eleitorais aumentam o volume de onboarding de pessoas com mandato ativo ou candidatura em andamento. A política de PEP exige tratamento diferenciado e aprovação em níveis superiores. O módulo identifica automaticamente a situação eleitoral atual e ativa o fluxo de aprovação adequado.',
      },
      {
        title: 'Jornalismo investigativo',
        desc: 'Jornalistas e pesquisadores que investigam redes políticas precisam cruzar candidaturas, doadores, patrimônio declarado e cargos ocupados para encontrar padrões. O módulo consolida 12 datasets do TSE, DOU e TCU em API estruturada, acelerando investigações que levariam semanas de pesquisa manual.',
      },
    ],
    sla: '99,90%',
    priceFrom: 'R$ 1,30/consulta',
    datasetItems: [
      { id: 'ENV01', source: 'TSE / TREs', name: 'Candidaturas e Mandatos Históricos', returns: 'Todas as candidaturas no TSE: cargo, partido, UF, número, resultado (eleito, suplente, não eleito) e histório completo desde 1994.' },
      { id: 'ENV02', source: 'TSE / SIAP', name: 'Doações Eleitorais Recebidas', returns: 'Doações declaradas no SIAP/TSE: CPF/CNPJ do doador, valor, data, tipo de doação e campanha. Indica financiadores e redes de apoio.' },
      { id: 'ENV03', source: 'TSE / SIAP', name: 'Doações Eleitorais Realizadas', returns: 'Doações feitas pelo CPF a candidatos e partidos: destinatário, valor, data e campanha. Revela preferências políticas declaradas.' },
      { id: 'ENV04', source: 'TSE / IRPF', name: 'Patrimônio Declarado em Campanha', returns: 'Bens e direitos declarados ao TSE: imóveis, veículos, investimentos e variação patrimonial entre campanhas sucessivas.' },
      { id: 'ENV05', source: 'DOU / Presidência', name: 'Cargos de Confiança e Nomeações', returns: 'Nomeações no Diário Oficial: ministérios, secretarias, autarquias, estatais e cargos DAS/CDS exercidos pelo consultado.' },
      { id: 'ENV06', source: 'Câmara / Senado / ALEs', name: 'Histórico Legislativo', returns: 'Projetos de lei de autoria, votações registradas, presenças, ausências e comissões permanentes às quais o consultado integrou.' },
      { id: 'ENV07', source: 'TCU / TCEs', name: 'Contas Julgadas e Sanções TCU', returns: 'Contas irregulares, condenações ao ressarcimento ao erário, multas e inabilitações aplicadas pelos Tribunais de Contas.' },
      { id: 'ENV08', source: 'MPF / STJ / STF', name: 'Processos de Alta Relevância', returns: 'Processos criminais no STF, STJ e MPF: ação penal, delação homologada, acordo de não persecução e situação atual do processo.' },
      { id: 'ENV09', source: 'COAF / Receita Federal', name: 'Grau de Exposição PEP Calculado', returns: 'Classificação PEP conforme BCB 4.893 e COAF Resolução 36: nível 1, 2 ou 3, com justificativa e prazo de validade da classificação.' },
      { id: 'ENV10', source: 'SNC Political Graph', name: 'Rede de Conexões Políticas', returns: 'Grafo de relacionamentos: familiares com mandato, sócios com cargo público, financiadores comuns de campanha e partidos de origem.' },
    ],
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
    useCasesRich: [
      {
        title: 'KYC de apostadores',
        desc: 'A Lei 14.790/2023 e a Portaria SPA/MF exigem verificação de identidade com evidência documentada — sem isso, a licença está em risco. O módulo entrega o KYC regulatório completo: validação de CPF, nome, data de nascimento e nome da mãe contra a Receita Federal, com score de confiança e trilha auditável por consulta.',
      },
      {
        title: 'Conformidade Lei 14.790',
        desc: 'A lei proíbe acesso de menores de idade, PEP e funcionários públicos federais às plataformas de aposta. O módulo verifica todos esses critérios em uma única chamada, gerando automaticamente o registro de conformidade exigido pelas normas da Secretaria de Prêmios e Apostas.',
      },
      {
        title: 'Verificação de idade',
        desc: 'Confirmação de maioridade não pode depender da data de nascimento autodeclarada — facilmente fraudável e insuficiente como evidência regulatória. O módulo verifica a maioridade diretamente na Receita Federal e retorna o resultado binário sem expor a data de nascimento do apostador.',
      },
      {
        title: 'Monitoramento de clientes',
        desc: 'Conformidade não é verificação única — apostadores podem ser nomeados para cargo público ou entrar em lista de sanção após o onboarding. O monitoramento contínuo via webhook alerta o operador de qualquer mudança de perfil que exija revisão regulatória conforme a Lei 14.790/2023.',
      },
    ],
    sla: '99,99%',
    priceFrom: 'R$ 1,90/verificação',
    datasetItems: [
      { id: 'APS01', source: 'Receita Federal / SERPRO', name: 'KYC Regulatório do Apostador', returns: 'Validação completa de identidade (CPF, nome, data de nascimento, nome da mãe) com score de confiança. Exigido pela Lei 14.790/2023 e Portaria SPA/MF.' },
      { id: 'APS02', source: 'IBGE / Receita Federal / TSE', name: 'Verificação de Maioridade 18+', returns: 'Confirmação legal de que o CPF pertence a indivíduo maior de 18 anos, cruzada com a Receita Federal. Resultado sem exposição da data de nascimento.' },
      { id: 'APS03', source: 'TSE / DOU / BCB', name: 'PEP e Funcionários Públicos', returns: 'Verificação de PEP e cargo público ativo: mandatos, nomeações e vinculações governamentais que impedem o acesso à plataforma regulada.' },
      { id: 'APS04', source: 'SPC / Serasa / COAF', name: 'Risco Financeiro e Sanções PLD', returns: 'Score de risco financeiro (inadimplência, superendividamento) e listas de sanção (COAF, OFAC): obrigatório para compliance PLD/FT em operadores licenciados.' },
      { id: 'APS05', source: 'SNC Monitoring Engine', name: 'Monitoramento Contínuo do Apostador', returns: 'Monitoramento pós-cadastro via webhook: alertas de novo PEP, sanção ou restrição que exija revisão do perfil conforme a Lei 14.790/2023.' },
    ],
  },
];

// ===== JOURNEYS =====
export const JOURNEYS: SncJourney[] = [
  {
    slug: 'credito-responsavel',
    title: 'Crédito Responsável',
    titleItalic: ' no atacado.',
    problem: 'Como aprovar crédito com segurança, sem aumentar inadimplência?',
    description: 'Score multibureau, cadastro validado e análise de risco financeiro por operação. Aprovação com menor inadimplência e mesmo SLA.',
    modules: ['Score de Crédito', 'Dados Cadastrais', 'Risco Financeiro'],
    image: '/jornadas/credito-responsavel.jpg',
    metrics: [
      { value: '-28%', label: 'Inadimplência média' },
      { value: '+40%', label: 'Aprovação segura' },
      { value: '< 2s', label: 'Tempo de decisão' },
    ],
    steps: [
      { title: 'Score Multibureau', desc: 'Consulta simultânea em 9 bureaus, SCR, SPC, Serasa, Boa Vista, Quod.' },
      { title: 'Cadastro & Identidade', desc: 'Validação completa de dados pessoais e documentais em fontes oficiais.' },
      { title: 'Risco Financeiro', desc: 'Análise de endividamento SCR e projeção actuarial de inadimplência.' },
      { title: 'Decisão Automatizada', desc: 'Score consolidado com threshold configurável por política de risco.' },
    ],
    narrative: [
      'O problema do crédito responsável não é análise de dados, é acesso simultâneo às fontes certas no momento da decisão. A maioria dos modelos ainda consulta bureaus em série, exposta a inconsistências entre bases e à latência que compromete a experiência do cliente. O resultado é aprovação excessiva em carteiras de risco ou rejeição conservadora que afasta bons pagadores.',
      'O SNC consulta os 9 principais bureaus em paralelo (SCR Banco Central, SPC Brasil, Serasa, Boa Vista, Quod e bases complementares) entregando um score consolidado em menos de 2 segundos. Cada fonte é ponderada pelo modelo e os dados brutos ficam disponíveis para auditoria da política de crédito.',
      'Na prática, instituições que adotam score multibureau com o SNC registram queda consistente na inadimplência sem redução no volume aprovado. A explicação é simples: mais dados, melhor segregação de risco.',
    ],
    paraQueServe: [
      'Bancos digitais e fintechs de crédito que precisam escalar aprovações sem deteriorar a carteira',
      'Financeiras e cooperativas que operam com alta concentração em segmentos de maior risco',
      'Emissores de cartão que precisam precificar limite com base em risco real de inadimplência',
      'Plataformas de BNPL com decisão em tempo real e alta exposição a fraude de identidade',
      'Consignado e crédito pessoal com necessidade de validação de vínculo empregatício',
    ],
    legalBasis: [
      'Lei 12.414/2011: Cadastro Positivo de Crédito',
      'Resolução BCB 4.557: Gestão de Riscos',
      'Resolução BCB 4.676: Crédito ao Consumidor',
      'SCR: Sistema de Informações de Crédito BCB',
    ],
    delivery: {
      title: 'Score Consolidado Multibureau',
      desc: 'Score único ponderado com dados de até 9 bureaus, variáveis de risco financeiro e validação de identidade. Threshold configurável por política interna e log de decisão auditável.',
      highlights: ['9 Bureaus', 'SCR BCB', '< 2s', 'Log auditável'],
    },
  },
  {
    slug: 'kyc-digital',
    title: 'KYC Digital',
    titleItalic: ' sem fricção.',
    problem: 'Como verificar a identidade de um cliente em 15 segundos?',
    description: 'Biometria facial, OCR de documento e validação em fontes oficiais combinados em um fluxo único. Conformidade BCB e LGPD.',
    modules: ['Verificação de Identidade', 'KYC', 'Compliance & PEP'],
    image: '/jornadas/kyc-digital.jpg',
    metrics: [
      { value: '15s', label: 'Tempo médio de KYC' },
      { value: '99,7%', label: 'Precisão biométrica' },
      { value: '100%', label: 'Conformidade BCB' },
    ],
    steps: [
      { title: 'Captura de Documento', desc: 'OCR automático de RG, CNH ou Passaporte com validação de autenticidade.' },
      { title: 'Prova de Vida', desc: 'Biometria facial com liveness detection anti-spoofing.' },
      { title: 'Validação Oficial', desc: 'Cruzamento com Receita Federal, SERPRO e bases de identidade.' },
      { title: 'Compliance PEP/Sanções', desc: 'Varredura em listas internacionais (OFAC, ONU, UE) e nacionais (COAF, entre outras).' },
    ],
    narrative: [
      'O KYC não é um processo de boas-vindas. É a primeira linha de defesa contra lavagem de dinheiro, uso de identidade falsa e fraude de onboarding. A maior parte das equipes ainda executa etapas em silos (biometria em um fornecedor, validação documental em outro, consulta PEP em um terceiro) com reconciliação manual e risco acumulado a cada handoff.',
      'O SNC unifica biometria facial com liveness detection, OCR de documentos, validação em Receita Federal e SERPRO, e varredura automática em listas PEP e sanções internacionais em uma única chamada de API. O fluxo inteiro leva menos de 15 segundos e gera um registro unificado por onboarding, imuável, exportável e pronto para apresentação ao regulador.',
      'O artefato final não é apenas uma aprovação. É um dosiê KYC com hash de evidência, timestamp e trilha de validação, exatamente o que o Banco Central exige para fiscalização do Programa de Compliance.',
    ],
    paraQueServe: [
      'Fintechs e bancos obrigados à Política de KYC conforme Resolução BCB 4.893',
      'Corretoras e gestoras com necessidade de KYC de cotistas e contrapartes',
      'Operadores de apostas e igaming sujeitos à identificação obrigatória de usuários',
      'Plataformas de open finance que processam vinculação de conta de terceiros',
      'Seguradoras e previdências com onboarding digital regulado pela SUSEP',
    ],
    legalBasis: [
      'Resolução BCB 4.893: Política de KYC e Compliance',
      'LGPD: Lei 13.709/2018: Tratamento de dados biométricos',
      'Circular BCB 3.978: PLD/FT em instituições financeiras',
      'SUSEP Circular 612: KYC em seguros e previdência',
    ],
    delivery: {
      title: 'Dosiê KYC Certificado',
      desc: 'Relatório unificado de verificação de identidade com hash de evidência, biometria validada e resultado de varredura PEP/Sanções. Pronto para auditoria BCB e Programa de Compliance.',
      highlights: ['BCB 4.893', 'PEP/Sanções', 'Biometria', 'LGPD'],
    },
  },
  {
    slug: 'due-diligence',
    title: 'Due Diligence',
    titleItalic: ' investigativa.',
    problem: 'Como investigar um parceiro, fornecedor ou contraparte antes do contrato?',
    description: 'Investigação com 35 fontes integradas: antecedentes, processos, reputação e rede de relacionamentos em relatório consolidado.',
    modules: ['Background Check', 'LOVAC · Investigação', 'Envolvimento Político'],
    image: '/jornadas/due-diligence.jpg',
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
    narrative: [
      'Antes de assinar um contrato, aceitar um cotista ou fechar uma parceria, a pergunta real é: quem é essa pessoa ou empresa, de fato? A due diligence mal conduzida não é apenas um risco jurídico, é exposição a responsabilidade solidária em processo de lavagem, fraude contratual ou envolvimento em esquemas de corrupção. A maioria das equipes ainda depende de buscas manuais, ausentes de padronização e sem trilha de auditoria defensável.',
      'O SNC executa investigação com cruzamento de até 35 fontes em paralelo: antecedentes criminais, processos em todas as esferas, histórico de protestos, análise de grafo de relacionamentos, exposição política e reputação em mídias abertas. O resultado chega como relatório estruturado em PDF, com metodologia documentada e hash de integridade.',
      'Para compliance officers, o dosiê SNC não é um relatório de busca, é um artefato de defesa. Cada dado consultado tem fonte, timestamp e resultado rastreável. Quando a fiscalização chega, a evidência de diligência já está pronta.',
    ],
    paraQueServe: [
      'Fundos de private equity e venture capital em processo de due diligence pré-investimento',
      'Departamentos jurídicos que assessoram clientes em M&A e contratos de alto valor',
      'Compliance officers responsáveis por onboarding de parceiros e fornecedores críticos',
      'Gestoras de fundos com obrigação de KYC estendido de cotistas PEP',
      'Empresas em processo de licenciamento ou renovação contratual com órgãos públicos',
    ],
    legalBasis: [
      'Lei 12.846/2013: Lei Anticorrupção',
      'Lei 9.613/1998: Prevenção à Lavagem de Dinheiro',
      'Decreto 8.420/2015: Programa de Integridade',
      'Circular BCB 3.978: Due Diligence de Contrapartes',
    ],
    delivery: {
      title: 'Relatório Forense Completo',
      desc: 'Dosiê investigativo com metodologia documentada, hash de integridade e trilha de auditoria. Entregue em PDF estruturado com recomendações de risco e evidências rastreáveis por fonte.',
      highlights: ['35 Fontes', 'PDF Auditável', 'Hash SHA256', 'Lei 12.846'],
    },
  },
  {
    slug: 'prevencao-de-fraude',
    title: 'Prevenção de Fraude',
    titleItalic: ' em tempo real.',
    problem: 'Como bloquear operações fraudulentas antes de serem efetivadas?',
    description: 'Antifraude multicamada com decisão em menos de 200ms. Score transacional, device fingerprint, phone score e monitoramento contínuo.',
    modules: ['Antifraude', 'Monitoramento 24h'],
    image: '/jornadas/prevencao-de-fraude.jpg',
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
    narrative: [
      'A fraude não avisa. Ela explora a janela entre a intenção do usuário e a resposta do sistema, e essa janela, na maioria das operações, dura mais de 3 segundos. Nesse intervalo, os padrões que distinguem um usuário legítimo de uma identidade sintética, um dispositivo comprometido ou uma conta de mula já estavam disponíveis. O problema não é dados, é latência na decisão.',
      'O motor antifraude do SNC combina score transacional em tempo real, fingerprint de dispositivo, phone score verificado, análise de velocidade e histórico de chargeback em uma única camada de decisão com resposta em menos de 200ms. Cada indicador é ponderado pelo modelo e o resultado é uma probabilidade de fraude calibrada por tipo de operação.',
      'O diferencial operacional está no monitoramento contínuo: o SNC não apenas decide no momento da transação, mas acompanha o comportamento da carteira via webhook, alertando anomalias antes que se tornem chargebacks ou bloqueios regulatórios.',
    ],
    paraQueServe: [
      'E-commerces e marketplaces com alta incidência de fraude em cartão e contas de mula',
      'Emissores de cartão que precisam reduzir chargeback sem aumentar falso-positivo',
      'Operadoras de PIX com necessidade de decisão de risco em menos de 200ms',
      'Fintechs de crédito que sofrem com fraude de identidade no onboarding',
      'Plataformas de cashback e loyalty com risco de abuso de programa',
    ],
    legalBasis: [
      'Resolução BCB 4.893: Segurança em meios eletrônicos de pagamento',
      'Lei 14.286/2021: Marco Legal das Garantias e Prevenção a Fraudes',
      'Circular BCB 3.978: Controles internos e PLD/FT',
      'LGPD: Análise de risco e decisões automatizadas',
    ],
    delivery: {
      title: 'Score Antifraude em Tempo Real',
      desc: 'Probabilidade de fraude calibrada por tipo de operação, com decisão em < 200ms, log de indicadores e integração via webhook para alertas contínuos de portfólio.',
      highlights: ['< 200ms', 'Webhook', 'PIX', 'Chargeback'],
    },
  },
  {
    slug: 'analise-empresarial',
    title: 'Análise Empresarial',
    titleItalic: ' profunda.',
    problem: 'Como entender a saúde real de uma PJ antes de operar?',
    description: 'Radiografia de pessoas jurídicas: indicadores financeiros, quadro societário, grupo econômico, ESG e saúde operacional.',
    modules: ['Indicadores Empresariais', 'Círculos & Relacionamentos', 'ESG & Dados Rurais'],
    image: '/jornadas/analise-empresarial.jpg',
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
    narrative: [
      'Operar com pessoas jurídicas sem radiografia real é decidir no escuro. Balanços auditados chegam com atraso, dados de SPED são opacos para quem não tem acesso direto e a composição societária real (com holdings e offshores) quase nunca está no contrato. O resultado é exposição a risco de crédito subestimado, fraude contratual e responsabilidade solidária com empresas envolvidas em irregularidades.',
      'O SNC mapeia a PJ em quatro dimensões simultâneas: indicadores financeiros estimados a partir de SPED, RAIS e bases fiscais; quadro societário completo com grafo de holdings e grupo econômico; conformidade ESG com histórico de embargos IBAMA; e scorecard de saúde operacional consolidado. Tudo em menos de 3 segundos, via API.',
      'Para analistas de crédito B2B, o SNC elimina o intervalo de semanas entre a solicitação e a disponibilização de informação qualificada. A decisão baseia-se em dados estruturados e auditáveis, não em balanço auto-declarado ou visita presencial.',
    ],
    paraQueServe: [
      'Bancos e fundos com carteira de crédito B2B que precisam de análise rápida e auditável de PJs',
      'Departamentos comerciais que precisam qualificar leads empresariais antes de negociar',
      'Operadores que exigem conformidade ESG e ambiental de fornecedores e parceiros',
      'Seguradoras que subscrevem riscos corporativos com base em saúde financeira da PJ',
      'Plataformas de supply chain que gerenciam risco de fornecedores em tempo real',
    ],
    legalBasis: [
      'Lei 6.404/1976: Lei das Sociedades Anônimas',
      'Decreto-Lei 9.430/1996: SPED e Obrigações Fiscais',
      'Lei 12.651/2012: Código Florestal e SICAR',
      'CVM: Instrução 480: Informações Periódicas',
    ],
    delivery: {
      title: 'Dosiê Empresarial Completo',
      desc: 'Relatório consolidado com indicadores financeiros estimados, mapa societário em grafo, histórico ESG e scorecard de risco. Entregue em JSON estruturado ou PDF com hash de integridade.',
      highlights: ['19 Indicadores', 'Grafo Societário', 'ESG', 'SPED'],
    },
  },
  {
    slug: 'enriquecimento-de-base',
    title: 'Enriquecimento',
    titleItalic: ' de base.',
    problem: 'Como enriquecer minha base com perfil digital e contatos validados?',
    description: 'Perfil digital, contatos validados e comportamento online para enriquecer a base de clientes com dados estruturados e auditáveis.',
    modules: ['Perfil Digital', 'BigMarket'],
    image: '/jornadas/enriquecimento-de-base.jpg',
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
    narrative: [
      'Uma base desatualizada é um passivo disfarçado de ativo. Telefones inválidos, e-mails inativos e endereços desatualizados comprometem campanhas, travam onboardings e produzem dados de cobrança inúteis. O enriquecimento manual é lento, caro e não escala, especialmente quando a base tem centenas de milhares de registros com frequência de atualização variável.',
      'O SNC resolve o enriquecimento em lote via API: perfil digital completo com presença em apps, redes sociais e assinatura de dispositivo; e-mails e telefones verificados em tempo real contra bases de operadoras; e comportamento online estruturado. A atualização de toda a base acontece em menos de 24 horas, com cobertura acima de 98% para CPFs ativos.',
      'Para equipes de CRM, o resultado é imediato: aumento consistente na taxa de entrega de email, melhor segmentação por perfil digital e redução de custo operacional com dados inválidos. A base deixa de ser um problema de qualidade e passa a ser um ativo de decisão.',
    ],
    paraQueServe: [
      'Equipes de marketing que dependem de base qualificada para campanhas de alta performance',
      'Departamentos de cobrança que precisam de contact data atualizado para acionamento',
      'CRMs e plataformas de customer data que oferecem enriquecimento como feature',
      'Empresas de e-commerce com alta taxa de bounce em email e SMS',
      'Startups de dados que revendem perfis enriquecidos para clientes corporativos',
    ],
    legalBasis: [
      'LGPD: Art. 7.º e 11: Finalidade e legitimidade no tratamento de dados',
      'Lei 12.965/2014: Marco Civil da Internet',
      'ANATEL: Portabilidade e validação de operadora',
      'LGPD: Art. 18: Direitos do titular e atualização de dados',
    ],
    delivery: {
      title: 'Base Enriquecida via API em Lote',
      desc: 'Perfil digital completo, contatos verificados e atributos comportamentais entregues em JSON enriquecido por CPF. Processamento em lote com retorno em < 24h e cobertura > 98% da base ativa.',
      highlights: ['22 Atributos', '98% Cobertura', 'API em Lote', 'LGPD'],
    },
  },
  {
    slug: 'compliance-regulatorio',
    title: 'Compliance Regulatório',
    titleItalic: ' pleno.',
    problem: 'Como cumprir LGPD, Resolução BACEN 4.893 e obrigações COAF?',
    description: 'Infraestrutura de compliance completa: PLD/FT, LGPD, Resolução BCB 4.893, CVM e COAF em um único fluxo auditável.',
    modules: ['Compliance & PEP', 'Envolvimento Político', 'Trilha de Auditoria'],
    image: '/jornadas/compliance-regulatorio.jpg',
    metrics: [
      { value: '100%', label: 'Conformidade BACEN' },
      { value: 'LGPD', label: 'Operador certificado' },
      { value: 'COAF', label: 'Cadastro ativo' },
    ],
    narrative: [
      'O desafio não é falta de conhecimento. É falta de infraestrutura para provar conformidade em tempo real. LGPD, Resolução BCB 4.893, PLD/FT e as obrigações ao COAF têm critérios distintos, prazos próprios e registros separados. A maioria das equipes ainda reconcilia fontes heterogêneas manualmente, acumulando lacunas de auditoria que só aparecem quando o regulador chega.',
      'O SNC entrega isso em uma única chamada de API. Cada etapa tem log próprio por obrigação regulatória: PLD/FT com rastreabilidade de lista, PEP com grau de exposição e parentesco, exposição política com histórico de cargos e doações, e trilha de auditoria exportável. Não é um painel genérico. É conformidade documentada por operação.',
      'O resultado prático: cada decisão fica registrada desde o primeiro onboarding. Quando o regulador chega, a evidência já está estruturada. Sua equipe para de correr atrás de dados e começa a usar os dados para decidir.',
    ],
    paraQueServe: [
      'Bancos e fintechs em processo de licenciamento ou renovação junto ao Banco Central',
      'Gestoras de fundos obrigadas a manter KYC atualizado de cotistas e parceiros',
      'Empresas com obrigação de Relatório de Inteligência Financeira ao COAF',
      'Escritórios jurídicos que assessoram clientes em fiscalizações do BCB e CVM',
      'Operadores de apostas e igaming sujeitos à Lei 14.790/2023',
    ],
    steps: [
      { title: 'PLD/FT', desc: 'Varredura em listas internacionais (OFAC, ONU, UE, Interpol) e nacionais (COAF, entre outras).' },
      { title: 'PEP e Sanções', desc: 'Identificação e monitoramento de Pessoas Politicamente Expostas.' },
      { title: 'Exposição Política', desc: 'Análise de cargos, doações e grau de risco político.' },
      { title: 'Trilha de Auditoria', desc: 'Log imutável de todas as consultas para Relatórios COAF.' },
    ],
    delivery: {
      title: 'Dossiê de Conformidade',
      desc: 'Documento estruturado e rastreável pronto para apresentação a qualquer órgão regulador. Cada consulta logada por obrigação, prova de conformidade desde o primeiro onboarding.',
      highlights: ['Auditoria BACEN', 'COAF · RIF', 'BCB 4.893', 'CVM/SFN'],
    },
    legalBasis: [
      'Resolução BCB 4.893: PLD/FT',
      'Circular BCB 3.978: COAF/RIF',
      'LGPD: Lei 13.709/2018',
      'CVM: Instrução 50 · SFN',
    ],
  },
];

// ===== SECTORS =====
export const SECTORS: SncSector[] = [
  {
    slug: 'financeiro-fintechs',
    cat: 'Financeiro & Fintechs',
    title: 'Crédito responsável em escala.',
    size: 'sz-4',
    image: '/setores/financeiro.jpg',
    description: 'SCR, SPC, Serasa e KYC regulatório integrados em uma camada única para fintechs e bancos com conformidade ao Banco Central.',
    hoverText: 'Cresça sua carteira sem crescer a inadimplência. Score multibureau, KYC regulatório e conformidade BACEN em uma API unificada. Mais aprovações seguras com custo de compliance sensívelmente reduzido.',
    stars: ['SCR BCB', 'KYC', 'PEP'],
    case: { value: '+40%', label: 'Aprovação mantendo inadimplência <3%' },
    modules: ['Score de Crédito', 'Verificação de Identidade', 'Compliance & PEP', 'Risco Financeiro'],
    narrative: [
      'O setor financeiro opera com um paradoxo: quanto mais rigorosa a análise de crédito, menor a conversão. Quanto mais permissiva, maior a inadimplência. A saída está em qualidade de dados, não em política mais conservadora. Fintechs e bancos que integram múltiplos bureaus em tempo real aprovam mais sem comprometer a carteira.',
      'O SNC conecta o setor financeiro às fontes que importam: SCR Banco Central, bureaus privados, KYC regulatório em conformidade com BCB 4.893 e PLD/FT em um único ponto de integração. Cada consulta gera log auditável pronto para fiscalização do Banco Central.',
      'Para compliance officers e analistas de crédito, o resultado é operacional: menos reconciliação entre sistemas, menos inconsistência entre fontes e evidência documentada para cada decisão.',
    ],
    paraQueServe: [
      'Fintechs de crédito que precisam escalar aprovações sem deteriorar a carteira',
      'Bancos digitais e corretoras em processo de licenciamento junto ao Banco Central',
      'Cooperativas de crédito com necessidade de conformidade COAF e PLD/FT',
      'Financeiras e emissores de cartão que operam crédito pessoal e consignado',
      'Plataformas de open finance que processam portabilidade de crédito e dados',
    ],
    sectorJourneys: [
      'credito-responsavel',
      'kyc-digital',
      'compliance-regulatorio',
    ],
    legalBasis: [
      'Resolução BCB 4.893: Política de Compliance e KYC',
      'Lei 12.414/2011: Cadastro Positivo de Crédito',
      'Circular BCB 3.978: PLD/FT e COAF',
      'LGPD: Tratamento de dados financeiros e biométricos',
    ],
  },
  {
    slug: 'rh-recrutamento',
    cat: 'RH & Recrutamento',
    title: 'Background check automatizado em 60 segundos.',
    size: 'sz-6',
    image: '/setores/rh.jpg',
    description: 'Antecedentes, formação e perfil digital integrados ao ATS para contratar com segurança em qualquer volume de candidatos.',
    hoverText: 'Contratação errada custa mais do que parece. Antecedentes, formação e perfil digital validados em 60 segundos, integrados ao seu ATS. Menos turnover, menos risco, equipe que entrega resultado.',
    stars: ['Background', 'RAIS', 'Formação'],
    case: { value: '-30%', label: 'Turnover em logística' },
    modules: ['Background Check', 'Formação & Qualificações', 'Certidões PF'],
    narrative: [
      'Uma contratação errada custa entre 1,5x e 3x o salário anual do cargo, sem contar o impacto em equipe, clientes e processos trabalhistas. O background check manual ainda é a norma em muitas empresas: lento, inconsistente e sem trilha auditável. O resultado é decisão de contratação baseada em declaração auto-referida, não em dado objetivo.',
      'O SNC automatiza a validação de candidatos em 60 segundos: antecedentes em todas as esferas, formação acadêmica via MEC, vínculo empregatício via RAIS, certidões e perfil profissional digital. O resultado chega estruturado e pronto para o ATS, sem formulários manuais.',
      'Para RH estratégico, o impacto vai além da contratação: o mesmo fluxo se aplica a promoções internas, compliance de terceirizados e vetting periódico de colaboradores em posições sensíveis.',
    ],
    paraQueServe: [
      'Departamentos de RH que realizam alto volume de contratações e precisam de escala',
      'Empresas de logística, transporte e serviços com risco operacional em campo',
      'Prestadores de serviços de saúde e segurança que exigem certificação profissional',
      'Empresas com acesso a dados sensíveis de clientes (LGPD) que exigem vetting rigoroso',
      'Escritórios de contabilidade, direito e auditoria em processo de admissão',
    ],
    sectorJourneys: [
      'due-diligence',
      'enriquecimento-de-base',
    ],
    legalBasis: [
      'CLT: Art. 442 e seguintes — Contrato de trabalho',
      'Lei 9.029/1995: Práticas discriminatórias na contratação',
      'LGPD: Art. 11 — Tratamento de dados sensíveis de candidatos',
      'ANPD: Nota Técnica sobre dados de colaboradores',
    ],
  },
  {
    slug: 'seguros',
    cat: 'Seguros',
    title: 'Sinistro fraudulento identificado antes da apólice.',
    size: 'sz-6',
    image: '/setores/seguros.jpg',
    description: 'Underwriting com identidade verificada, risco multibureau e histórico financeiro integrados para decisão em tempo real auditável.',
    hoverText: 'Sinistros fraudulentos nascem de cadastros negligenciados. Identidade verificada, histórico de risco e monitoramento contínuo reduzem perdas significativas antes da apólice sequer ser emitida.',
    stars: ['Antifraude', 'Identidade', 'Monitoramento'],
    case: { value: '-42%', label: 'Redução de sinistros fraudulentos' },
    modules: ['Verificação de Identidade', 'Antifraude', 'Risco Financeiro', 'Monitoramento 24h'],
    narrative: [
      'O sinistro fraudulento começa antes da apólice. Identidade adulterada no onboarding, histórico financeiro falseado e risco subestimado na subscrição são as origens de 70% das fraudes em seguros. O underwriting tradicional ainda depende de declaração do segurado, sem cruzamento automatizado com fontes independentes.',
      'O SNC integra o ciclo completo do seguro: biometria no onboarding, score de risco multibureau na subscrição, antifraude na regulação de sinistros e monitoramento contínuo do segurado. Cada etapa gera evidência rastreável por apólice.',
      'Para seguradoras, o impacto é direto na sinistralidade: segurados com identidade verificada, risco auditado e monitoramento ativo reduzem perdas operacionais sem aumentar o prêmio.',
    ],
    paraQueServe: [
      'Seguradoras de vida, auto e residencial com alta incidência de sinistros fraudulentos',
      'Corretoras que distribuem seguros e precisam de KYC no onboarding de clientes',
      'Resseguradoras que exigem compliance documentado de suas cedentes',
      'Insuretechs que integram análise de risco em tempo real no fluxo de cotação',
      'Plataformas de seguro embarcado com alto volume de apólices de baixo valor',
    ],
    sectorJourneys: [
      'prevencao-de-fraude',
      'kyc-digital',
      'due-diligence',
    ],
    legalBasis: [
      'SUSEP Circular 612: KYC e compliance em seguros',
      'CNSP Resolução 382: Prevenção à lavagem de dinheiro em seguradoras',
      'LGPD: Tratamento de dados de saúde e biométricos em apólices',
      'Lei 9.656/1998: Planos de saúde e regulação de sinistros',
    ],
  },
  {
    slug: 'governo-licitacoes',
    cat: 'Governo & Licitações',
    title: 'Habilitação de fornecedores sem passivo jurídico.',
    size: 'sz-6',
    image: '/setores/governo.jpg',
    description: 'Certidões, PEP e compliance público consolidados em uma consulta única para habilitação em processos licitatórios e concessões.',
    hoverText: 'Contratos com fornecedores irregulares geram passivo jurídico imediato e iniquéritos administrativos. Certidões, PEP e compliance consolidados numa consulta. Gestão pública sem surpresas.',
    stars: ['Certidões', 'PEP', 'Compliance'],
    case: { value: '100%', label: 'Conformidade em processos licitatórios' },
    modules: ['Certidões PJ', 'Compliance & PEP', 'Background Check'],
    narrative: [
      'Contratos públicos com fornecedores irregulares geram passivo jurídico imediato, inquéritos administrativos e risco de responsabilização pessoal para gestores. A habilitação via documentação não é suficiente: certidões vencidas, PEP ocultos em quadros societários e histórico de irregularidades passam despercebidos sem cruzamento automatizado.',
      'O SNC entrega habilitação técnica e compliance em uma única consulta: certidões em todas as esferas, situação Receita Federal, processos judiciais, PEP e sanções consolidadas, IBAMA e ESG para contratos ambientalmente sensíveis. Tudo rastreável por CNPJ e por processo licitatório.',
      'Para gestores públicos, o artefato SNC é defesa administrativa: cada fornecedor habilitado tem dossiê com timestamp, fonte e resultado. Quando o TCU chega, a evidência de diligência já está estruturada.',
    ],
    paraQueServe: [
      'Órgãos públicos federais, estaduais e municipais em processos licitatórios',
      'Comissões de habilitação e pregoeiros que precisam de agilidade com segurança jurídica',
      'Empresas fornecedoras do setor público que precisam demonstrar compliance',
      'Escritórios jurídicos que assessoram clientes em concessões e PPPs',
      'Controladorias e corregedorias em processos de auditoria de contratos vigentes',
    ],
    sectorJourneys: [
      'due-diligence',
      'compliance-regulatorio',
      'analise-empresarial',
    ],
    legalBasis: [
      'Lei 14.133/2021: Nova Lei de Licitações e Contratos',
      'Lei 12.846/2013: Lei Anticorrupção e Programa de Integridade',
      'Decreto 8.420/2015: Regulamenta o Programa de Integridade',
      'TCU Acórdão 1.793/2011: Due diligence em licitações',
    ],
  },
  {
    slug: 'imobiliario-locacao',
    cat: 'Imobiliário & Locação',
    title: 'Análise completa de locatário em 30 segundos.',
    size: 'sz-4',
    image: '/setores/imobiliario.jpg',
    description: 'Garantia de aluguel, score multibureau e certidões negativas integrados para análise completa de locatários em segundos.',
    hoverText: 'Analise locatários com o rigor de um banco em 30 segundos. Score, certidões e histórico financeiro consolidados numa única consulta. Contratos mais seguros e inadimplência sob controle real.',
    stars: ['Decode', 'SCPC', 'Justiça'],
    case: { value: '30s', label: 'Análise completa de locatário' },
    modules: ['Score de Crédito', 'Certidões PF', 'Risco Financeiro'],
    narrative: [
      'Inadimplência em locação residencial termina em despejo, meses de aluguel perdido e honorários advocatícios. A análise de locatário feita por imobiliárias ainda mistura impressão pessoal com score pontual de um único bureau, sem validação de renda real, sem cruzamento de processos e sem certidões. O risco fica no proprietário.',
      'O SNC analisa locatários em 30 segundos com o rigor de uma instituição financeira: score multibureau, certidões de protesto e processos em todas as esferas, validação de renda via fontes públicas e histórico de endereço. Para PJ, adiciona indicadores empresariais e situação Receita Federal.',
      'Para imobiliárias, o resultado é competitivo: menos inadimplência, mais confiança do proprietário e capacidade de analisar alto volume sem time de crédito dedicado.',
    ],
    paraQueServe: [
      'Imobiliárias que gerenciam carteiras de locação residencial e comercial',
      'Proprietários que alugam diretamente e precisam de análise sem intermediário',
      'Administradoras de condomínios que gerenciam prestadores e locatários',
      'Plataformas digitais de aluguel que precisam de KYC no onboarding',
      'Garantidoras de aluguel que subscrevem risco de inadimplência',
    ],
    sectorJourneys: [
      'credito-responsavel',
      'due-diligence',
    ],
    legalBasis: [
      'Lei 8.245/1991: Lei do Inquilinato — Locação urbana',
      'LGPD: Tratamento de dados de locatários e fiadores',
      'Código Civil: Art. 818 — Fiança e garantias locatícias',
      'Lei 12.414/2011: Cadastro Positivo no contexto de locação',
    ],
  },
  {
    slug: 'saude-planos',
    cat: 'Saúde & Planos',
    title: 'Fraude em sinistro identificada antes do pagamento.',
    size: 'sz-6',
    image: '/setores/saude.jpg',
    description: 'Identidade biométrica, processos judiciais e monitoramento contínuo para planos de saúde dentro dos padrões exigidos pela ANS.',
    hoverText: 'Fraude em sinistro começa no cadastro, não no evento. Identidade biométrica, monitoramento contínuo e conformidade ANS protegem sua operação antes do pagamento ser sequer processado.',
    stars: ['KYC', 'Biometria', 'Monitoramento'],
    case: { value: 'R$ 12M', label: 'Sinistros evitados/ano' },
    modules: ['Verificação de Identidade', 'Antifraude', 'Monitoramento 24h'],
    narrative: [
      'Fraude em planos de saúde começa no cadastro: beneficiários com identidade adulterada, vínculos falsos em contratos coletivos e prestadores com CRM irregular são as principais fontes de perda. O sinistro indevido aparece depois, mas a vulnerabilidade estava no onboarding.',
      'O SNC valida beneficiários, prestadores e contratantes com biometria, registro profissional, processos judiciais e monitoramento contínuo integrado. Para operadoras, isso significa menos fraude em sinistros, conformidade ANS documentada e evidência de due diligence por beneficiário.',
      'Para gestores de planos, o resultado prático é operacional: onboarding com identidade verificada, monitoramento de beneficiários com alertas de comportamento anômalo e trilha de auditoria por evento de saúde.',
    ],
    paraQueServe: [
      'Operadoras de planos de saúde que precisam conformar KYC de beneficiários à ANS',
      'Hospitais e clínicas que prestam serviços a múltiplas operadoras e precisam de credenciamento',
      'Cooperativas médicas que gerenciam corpo clínico com registro profissional ativo',
      'Plataformas de health tech que integram seguro de saúde no fluxo de atendimento',
      'Corretoras de benefícios que distribuem planos coletivos empresariais',
    ],
    sectorJourneys: [
      'kyc-digital',
      'prevencao-de-fraude',
      'compliance-regulatorio',
    ],
    legalBasis: [
      'RN ANS 305: Identificação de beneficiários e prestadores',
      'Lei 9.656/1998: Planos e seguros privados de saúde',
      'LGPD: Tratamento de dados de saúde — Art. 11 e 12',
      'CFM Resolução 1.821/2007: Prontuário e dados médicos',
    ],
  },
  {
    slug: 'transportes-logistica',
    cat: 'Transportes & Logística',
    title: 'Frota operando com motoristas verificados e seguros.',
    size: 'sz-6',
    image: '/setores/transportes.jpg',
    description: 'Vetting de motoristas com antecedentes, CNH e RAIS integrados para operações de transporte e logística com rastreio contínuo.',
    hoverText: 'Motorista sem habilitação regular é risco operacional e jurídico diário. Vetting automatizado com antecedentes, CNH e RAIS protege sua frota e garante apólices de seguro sem contestação.',
    stars: ['Background', 'CNH', 'RAIS'],
    case: { value: '-38%', label: 'Incidentes por motorista não verificado' },
    modules: ['Background Check', 'Formação & Qualificações', 'Certidões PF'],
    narrative: [
      'Motorista com CNH irregular, histórico de acidente ou antecedentes graves é risco operacional diário. Seguradora contesta a apólice, cliente perde carga, empresa responde solidariamente. O vetting informal não sustenta nem jurídica nem operacionalmente.',
      'O SNC automatiza o vetting de motoristas e operadores: antecedentes criminais, validação de CNH via DETRAN, vínculos trabalhistas via RAIS, certidões e checagem de pendências veiculares. Para frotas grandes, o processamento em lote atualiza toda a base em menos de 24h.',
      'Para gestores de frota e RH de transportadoras, o resultado é duplo: conformidade com seguradoras que exigem vetting documentado e redução real de incidentes por motoristas não verificados.',
    ],
    paraQueServe: [
      'Transportadoras de carga e logística que operam frotas próprias ou contratadas',
      'Empresas de transporte de passageiros e aplicativos de mobilidade urbana',
      'Distribuidoras que terceirizam entregas e precisam validar parceiros logísticos',
      'Seguradoras que subscrevem apólices de frota com exigência de vetting documentado',
      'Indústrias com operação própria de distribuição e motoristas CLT ou MEI',
    ],
    sectorJourneys: [
      'due-diligence',
      'enriquecimento-de-base',
    ],
    legalBasis: [
      'Lei 11.442/2007: Transporte rodoviário de carga — RNTRC',
      'ANTT Resolução 5.867/2021: Habilitação de transportadores',
      'LGPD: Dados de trabalhadores e prestadores de serviço',
      'CLT: Art. 927 — Responsabilidade solidária em acidentes',
    ],
  },
  {
    slug: 'varejo-e-commerce',
    cat: 'Varejo & E-commerce',
    title: 'Menos chargeback. Mais conversão.',
    size: 'sz-8',
    image: '/setores/varejo.jpg',
    description: 'Antifraude, phone score e perfil digital para proteger operações de alto volume no varejo físico e no e-commerce nacional.',
    hoverText: 'Cada transação recusada é receita perdida para sempre. Com antifraude em tempo real, phone score e perfil digital, você aprova mais, protege mais e cresce sem comprometer a margem operacional.',
    stars: ['Antifraude', 'Phone Score', 'Perfil Digital'],
    case: { value: '-68%', label: 'Chargeback · cliente enterprise' },
    modules: ['Antifraude', 'Perfil Digital', 'Verificação de Identidade'],
    narrative: [
      'Chargeback é o custo invisível do e-commerce: aparece 30 a 60 dias depois da venda, consome tempo operacional e penaliza a taxa de aprovação futura. O modelo de antifraude baseado em score único falha especialmente em sazonalidade alta, quando o volume de operações anômalas disfarça padrões genuinamente fraudulentos.',
      'O SNC combina score transacional em tempo real, fingerprint de dispositivo, phone score e perfil digital para decisão em menos de 200ms. Para varejo físico, adiciona validação de identidade no checkout e monitoramento de contas com comportamento de mula.',
      'Para gestores de e-commerce e meios de pagamento, o impacto é mensurável: redução de chargeback sem aumento de fricção, maior taxa de aprovação e menor custo operacional com contestações.',
    ],
    paraQueServe: [
      'E-commerces de alto ticket que sofrem com chargeback em cartão de crédito',
      'Marketplaces que precisam validar compradores e vendedores simultaneamente',
      'Varejistas físicos que integraram checkout digital e encontraram nova superfície de fraude',
      'Empresas de BNPL (compre agora, pague depois) com decisão em tempo real',
      'Plataformas de cashback e programas de fidelidade com risco de abuso',
    ],
    sectorJourneys: [
      'prevencao-de-fraude',
      'enriquecimento-de-base',
    ],
    legalBasis: [
      'CDC: Art. 18 — Responsabilidade por vício de produto e chargebacks',
      'LGPD: Tratamento de dados de comportamento de compra',
      'Marco Civil da Internet: Lei 12.965/2014',
      'Resolução BCB 4.893: Segurança em meios eletrônicos de pagamento',
    ],
  },
  {
    slug: 'agronegocio',
    cat: 'Agronegócio',
    title: 'Crédito rural com compliance ambiental garantido.',
    size: 'sz-6',
    image: '/setores/agronegocio.jpg',
    description: 'SICAR, IBAMA, CAR e ESG integrados em uma camada única para financiamento rural com conformidade ambiental garantida por contrato.',
    hoverText: 'Crédito rural exige compliance que vai além do CPF. SICAR, IBAMA, CAR e histórico ESG integrados numa consulta única. Libere recursos com seguraça jurídica e conformidade ambiental intacta.',
    stars: ['IBAMA', 'SICAR', 'ESG', 'CAR'],
    case: { value: '100%', label: 'Conformidade ambiental no crédito' },
    modules: ['ESG & Dados Rurais', 'Certidões PJ', 'Indicadores Empresariais'],
    narrative: [
      'Crédito rural exige compliance que vai muito além do CPF. Financiamento de imóvel com embargo IBAMA ativo, produtor com CAR irregular ou SICAR desatualizado expõe a operação a bloqueio imediato e responsabilidade solidária do credor. O processo de verificação manual de conformidade ambiental leva dias e depende de cartórios locais.',
      'O SNC verifica conformidade ambiental e financeira em uma única chamada de API: IBAMA, SICAR, CAR, embargos ambientais, certidões e situação Receita Federal. Para PJs rurais, adiciona quadro societário e indicadores empresariais do produtor ou da cooperativa.',
      'Para bancos e fundos que operam crédito rural, o SNC transforma conformidade em vantagem competitiva: libera recursos mais rápido, com segurança jurídica intacta e evidência auditável para o BACEN e o Ministério da Agricultura.',
    ],
    paraQueServe: [
      'Bancos e cooperativas que operam crédito rural e precisam de conformidade ambiental',
      'Tradings e exportadoras que precisam validar fornecedores e produtores rurais',
      'Seguradoras rurais que subscrevem risco de crédito agrícola e pecuário',
      'Fundos de investimento em cadeias produtivas do agro com exigência ESG',
      'Certificadoras de rastreabilidade que auditam conformidade ambiental de produtores',
    ],
    sectorJourneys: [
      'analise-empresarial',
      'compliance-regulatorio',
      'due-diligence',
    ],
    legalBasis: [
      'Lei 12.651/2012: Código Florestal — CAR e APPs',
      'SICAR: Sistema de Cadastro Ambiental Rural',
      'IBAMA: Monitoramento e embargos ambientais',
      'Lei 4.829/1965: Crédito rural — Conformidade BACEN',
    ],
  },
  {
    slug: 'telecomunicacoes',
    cat: 'Telecomunicações',
    title: 'Crédito para planos e dispositivos sem fraude.',
    size: 'sz-8',
    image: '/setores/telecom.jpg',
    description: 'Score multibureau, detecção de SIM swap e validação de identidade digital para operadoras de telecomunicações e provedores.',
    hoverText: 'Planos pós-pagos e dispositivos financiados exigem análise precisa. Score multibureau e detecção de SIM swap protegem sua operação do onboarding ao encerramento de contrato sem interrupção.',
    stars: ['Score', 'Antifraude', 'KYC'],
    case: { value: '-55%', label: 'Fraude em ativação de planos' },
    modules: ['Score de Crédito', 'Antifraude', 'Verificação de Identidade'],
    narrative: [
      'SIM swap, fraude de portabilidade e ativação de planos com identidade sintética são os principais vetores de ataque em telecomunicações. Operadoras que aprovam planos pós-pagos sem validação de identidade digital carregam o ônus do inadimplente e do fraudador, muitas vezes até descobrir semanas depois.',
      'O SNC valida a identidade do solicitante com biometria, cruza com base de operadoras e detecta padrões de SIM swap via phone score. Para planos empresariais, valida o CNPJ, situação Receita e representante legal antes da ativação. Tudo em menos de 15 segundos.',
      'Para operadoras e provedores de internet, o resultado é claro: menos fraude na ativação, menor inadimplência estrutural e base de clientes com identidade verificada, essencial para a oferta de serviços financeiros embarcados.',
    ],
    paraQueServe: [
      'Operadoras de telefonia móvel que oferecem planos pós-pagos e financiamento de dispositivos',
      'Provedores de internet (ISPs) que operam crédito embutido em contratos',
      'Distribuidores de chips e planos virtuais (eSIM) com risco de ativação fraudulenta',
      'Empresas que oferecem banking embarcado em plataformas telecom',
      'Gestores de frotas corporativas com planos empresariais em múltiplos dispositivos',
    ],
    sectorJourneys: [
      'kyc-digital',
      'enriquecimento-de-base',
      'prevencao-de-fraude',
    ],
    legalBasis: [
      'ANATEL Resolução 477/2007: Regulamento de Serviço Móvel Pessoal',
      'LGPD: Tratamento de dados de usuários de telecomunicações',
      'Lei 9.472/1997: Lei Geral de Telecomunicações',
      'Circular BCB 3.978: PLD/FT para serviços financeiros embarcados',
    ],
  },
  {
    slug: 'industria-b2b',
    cat: 'Indústria & B2B',
    title: 'Due diligence de toda a cadeia de fornecedores.',
    size: 'sz-8',
    image: '/setores/industria.jpg',
    description: 'Indicadores empresariais, ESG e IBAMA para validar fornecedores e parceiros de negócio em escala com rastreabilidade total.',
    hoverText: 'Sua cadeia produtiva é tão sólida quanto o elo mais fraco. Valide ESG, saúde financeira e conformidade jurídica de fornecedores simultaneamente. Due diligence que não paralisa a operação.',
    stars: ['Indicadores', 'Círculos', 'ESG', 'IBAMA', 'SICAR'],
    case: { value: '8k', label: 'Fornecedores validados/mês' },
    modules: ['Indicadores Empresariais', 'Círculos & Relacionamentos', 'ESG & Dados Rurais', 'Certidões PJ'],
    narrative: [
      'Na indústria B2B, o risco de cadeia de suprimentos é o risco do negócio. Fornecedor com dívidas trabalhistas, irregularidades fiscais ou vínculo com empresas sancionadas contamina o contrato principal, e a responsabilidade solidária pode chegar ao cliente final. A due diligence de fornecedores ainda é feita manualmente em muitas indústrias.',
      'O SNC valida toda a cadeia em escala: indicadores financeiros empresariais, quadro societário e grupo econômico, conformidade ESG e IBAMA, certidões em todas as esferas e situação de crédito via SCR. Para gestores de compras, o processamento em lote atualiza o cadastro de todos os fornecedores simultaneamente.',
      'Para empresas com cadeia de fornecimento extensa, o SNC transforma compliance de fornecedores em processo automático: onboarding seguro, renovação periódica e alerta proativo quando um parceiro muda de situação fiscal ou ambiental.',
    ],
    paraQueServe: [
      'Indústrias com cadeia extensa de fornecedores que exigem conformidade ESG e fiscal',
      'Gestores de compras que processam alto volume de novos fornecedores mensalmente',
      'Empresas exportadoras que precisam demonstrar compliance de fornecedores a clientes internacionais',
      'Fundos de private equity que realizam due diligence de empresas do portfólio',
      'Distribuidoras e representantes comerciais que creditam revendedores B2B',
    ],
    sectorJourneys: [
      'analise-empresarial',
      'due-diligence',
      'credito-responsavel',
    ],
    legalBasis: [
      'Lei 6.404/1976: Sociedades Anônimas — Responsabilidade solidária',
      'Lei 12.846/2013: Lei Anticorrupção e due diligence de cadeia',
      'Decreto-Lei 9.430/1996: SPED e obrigações fiscais',
      'Lei 12.651/2012: Conformidade ambiental em contratos industriais',
    ],
  },
  {
    slug: 'marketplace-gig',
    cat: 'Marketplace & Gig Economy',
    title: 'Habilite prestadores confiáveis em segundos, não dias.',
    size: 'sz-4',
    image: '/setores/marketplace.jpg',
    description: 'Background check, validação documental e KYC automáticos para plataformas de marketplace e trabalhadores em economia gig.',
    hoverText: 'Escalar uma plataforma exige confiar em quem você nunca viu. Background check e documentação validados em segundos protegem sua rede. Menos fraude, mais reputação e crescimento sustentável.',
    stars: ['Background', 'Identidade', 'Antifraude'],
    case: { value: '-61%', label: 'Fraude de prestadores em plataformas' },
    modules: ['Background Check', 'Verificação de Identidade', 'Antifraude'],
    narrative: [
      'Plataformas de marketplace e gig economy escalam com a confiança como produto central. Uma fraude de identidade de prestador, um golpe aplicado por um entregador ou uma transação com conta de mula compromete a reputação da plataforma. Verificar cada usuário manualmente não escala.',
      'O SNC habilita prestadores, vendedores e usuários em segundos: background check automatizado, biometria com prova de vida, validação de documentos e antifraude transacional em tempo real. Para plataformas de gig, adiciona validação de CNH e RAIS para trabalhadores mobile.',
      'Para product managers e operações de plataforma, o SNC é a camada de trust que habilita crescimento seguro: menos chargebacks, menos fraude de identidade e menos risco regulatório com a LGPD e o Marco Civil.',
    ],
    paraQueServe: [
      'Marketplaces de produtos e serviços que precisam verificar vendedores e compradores',
      'Plataformas de entrega e mobilidade que gerenciam prestadores autônomos',
      'Apps de serviços domésticos, saúde e educação com risco de identidade no onboarding',
      'Plataformas de freelancers que processam pagamentos internacionais',
      'Empresas de economia compartilhada que operam bens de terceiros (imóveis, veículos)',
    ],
    sectorJourneys: [
      'prevencao-de-fraude',
      'kyc-digital',
      'enriquecimento-de-base',
    ],
    legalBasis: [
      'LGPD: Tratamento de dados de trabalhadores por plataforma',
      'Marco Civil da Internet: Responsabilidade de provedores de plataforma',
      'CLT: Art. 4-A — Trabalho intermitente e gig economy',
      'Resolução BCB 4.893: Meios de pagamento em plataformas digitais',
    ],
  },
  {
    slug: 'energia-utilities',
    cat: 'Energia & Utilities',
    title: 'Conexões aprovadas para quem realmente vai pagar.',
    size: 'sz-4',
    image: '/setores/energia.jpg',
    description: 'Score de crédito e monitoramento de adimplência para utilities, concessionárias e operadoras de energia reguladas pelo setor.',
    hoverText: 'Ligações inadimplentes geram prejuízo operacional e regulatório. Score de crédito, histórico financeiro e monitoramento contínuo garantem que cada conexão seja um cliente que realmente paga.',
    stars: ['Score', 'Monitoramento', 'Risco'],
    case: { value: '-44%', label: 'Inadimplência em novas conexões' },
    modules: ['Score de Crédito', 'Risco Financeiro', 'Monitoramento 24h'],
    narrative: [
      'Tarifas de energia não são recuperáveis. Quando um cliente conectado não paga, o prejuízo é imediato, o processo de desligamento é regulado e a renegociação exige conformidade com a ANEEL. O risco de inadimplência estrutural começa na aprovação da nova ligação, e a maioria das concessionárias ainda aprova conexões sem score de crédito estruturado.',
      'O SNC analisa solicitantes de novas conexões com score multibureau, histórico financeiro e monitoramento contínuo pós-ativação. Para B2B empresarial, adiciona indicadores empresariais, situação Receita e conformidade ESG, especialmente relevante para empresas com consumo energético sujeito a licenciamento ambiental.',
      'Para utilities reguladas, o SNC entrega o ciclo completo: aprovação com risco avaliado, monitoramento de adimplência em tempo real e evidência auditável para a ANEEL quando necessário.',
    ],
    paraQueServe: [
      'Concessionárias de energia que aprovam novas conexões residenciais e comerciais',
      'Distribuidoras de gás e saneamento com modelo de contrato pré-pago e pós-pago',
      'Fornecedores de energia livre no mercado B2B que precisam avaliar risco de contraparte',
      'Utilities que oferecem parcelamento de dívida e precisam de análise de capacidade de pagamento',
      'Empresas de geração solar e eficiência energética com financiamento de equipamentos',
    ],
    sectorJourneys: [
      'compliance-regulatorio',
      'analise-empresarial',
      'credito-responsavel',
    ],
    legalBasis: [
      'ANEEL Resolução Normativa 1.000/2021: Fornecimento de energia',
      'ANP Portaria 116/2000: Distribuição de gás natural',
      'LGPD: Dados de consumo como dados pessoais sensíveis',
      'Lei 8.987/1995: Concessões e permissões de serviços públicos',
    ],
  },
  {
    slug: 'betting-igaming',
    cat: 'Betting & iGaming',
    title: 'Conformidade total à Lei 14.790/2023 — em D+0.',
    size: 'sz-12',
    image: '/setores/betting.jpg',
    description: 'KYC regulatório, PEP, verificação de idade e risco financeiro para operadores de apostas licenciados nos termos da Lei 14.790.',
    hoverText: 'Conformidade não é obstáculo — é vantagem competitiva. KYC regulatório, PEP e risco financeiro integrados desde D+0. Opere dentro da Lei 14.790 desde o primeiro cliente ativo na plataforma.',
    stars: ['KYC regulatório', 'PEP', 'Idade', 'Risco', 'Monitoramento contínuo'],
    case: { value: 'D+0', label: 'Conformidade desde o go-live' },
    modules: ['Mercado de Apostas', 'Verificação de Identidade', 'Compliance & PEP', 'Monitoramento 24h', 'Risco Financeiro'],
    narrative: [
      'A Lei 14.790/2023 não é uma opção, é uma condição de licenciamento. Operadores de apostas que não cumprem KYC regulatório, verificação de idade, PEP e monitoramento de comportamento suspeito desde o D+0 operam em risco de cassação da licença pelo Ministério da Fazenda.',
      'O SNC entrega o módulo de conformidade completo para apostas: biometria com prova de vida, verificação de idade via Receita Federal, KYC regulatório com PEP e sanções, risco financeiro do apostador e monitoramento contínuo de comportamento. Homologado para os requisitos do SPA/MF.',
      'Para operadores licenciados, o SNC não é um fornecedor de KYC, é a infraestrutura de compliance que sustenta o licenciamento. Cada consulta gera registro auditável por CPF, por sessão e por evento de apostas, pronto para apresentação ao regulador.',
    ],
    paraQueServe: [
      'Operadores de apostas esportivas licenciados ou em processo de licenciamento pela MF',
      'Plataformas de igaming que operam sob a Lei 14.790/2023 e precisam de KYC desde D+0',
      'Afiliadas e distribuidores de apostas que precisam demonstrar compliance próprio',
      'Processadores de pagamento que operam no ecossistema de betting e precisam de AML',
      'Escritórios jurídicos que assessoram operadores no processo de licenciamento',
    ],
    sectorJourneys: [
      'kyc-digital',
      'compliance-regulatorio',
      'prevencao-de-fraude',
    ],
    legalBasis: [
      'Lei 14.790/2023: Marco legal de apostas esportivas no Brasil',
      'Portaria MF 1.112/2023: Requisitos de licenciamento e KYC',
      'LGPD: Tratamento de dados de apostadores',
      'Circular BCB 3.978: PLD/FT em operações de apostas',
    ],
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
