/**
 * mocks.ts — Dados de simulação ricos e 100% fictícios para relatórios de exemplo
 *
 * Evita o uso de placas que possam existir no mundo real (como SNC-2026 ou ROB-0190)
 * utilizando o formato óbvio de teste "XXX-0000" (Nada Consta) e "XXX-1111" (Restrições/Alerta de Roubo).
 */

// ─── 1. VEÍCULO / FIPE ────────────────────────────────────────────────────────
export const VEICULO_MOCK_CLEAN = {
  veiculo: {
    placa: "XXX-0000",
    marca: "VW",
    modelo: "FOX 1.0 GII",
    anoFabricacao: 2012,
    anoModelo: 2013,
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA",
    categoria: "AUTOMÓVEL",
    chassi: "9BWZZZ377VT000000",
  },
  fipe: [
    {
      codigoFipe: "005277-9",
      modelo: "Fox 1.0 Mi Total Flex 8V 5d",
      anoModelo: "2013",
      combustivel: "Gasolina",
      mesReferencia: "Maio de 2026",
      valor: "R$ 32.800",
      valorNum: 32800,
      principal: true,
    }
  ],
  historico: [
    { mes: "05/2026", valor: 32800, valorFormatado: "R$ 32.800" },
    { mes: "04/2026", valor: 32500, valorFormatado: "R$ 32.500" },
    { mes: "03/2026", valor: 32900, valorFormatado: "R$ 32.900" },
    { mes: "02/2026", valor: 33100, valorFormatado: "R$ 33.100" },
    { mes: "01/2026", valor: 33400, valorFormatado: "R$ 33.400" },
    { mes: "12/2025", valor: 33600, valorFormatado: "R$ 33.600" },
  ],
};

// ─── 2. PROPRIETÁRIO ATUAL ───────────────────────────────────────────────────
export const PROPRIETARIO_MOCK_CLEAN = {
  proprietario: {
    nome: "JOÃO DA SILVA",
    documento: "123.456.789-00",
    placa: "XXX-0000",
    renavam: "00456789012",
    municipio: "BELO HORIZONTE",
    uf: "MG",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA",
    motor: "CCC178906",
    chassi: "9BWZZZ377VT000000",
    crlv: "00123456789",
    dataAtualizacao: "15/03/2025",
    statusCodigo: "0",
    statusDescricao: "SEM RESTRIÇÃO",
  },
  pdf: null,
};

export const PROPRIETARIO_MOCK_RESTRICTED = {
  proprietario: {
    nome: "JOÃO DA SILVA",
    documento: "123.456.789-00",
    placa: "XXX-1111",
    renavam: "00456789012",
    municipio: "BELO HORIZONTE",
    uf: "MG",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA",
    motor: "CCC178906",
    chassi: "9BWZZZ377VT000000",
    crlv: "00123456789",
    dataAtualizacao: "15/03/2025",
    statusCodigo: "1",
    statusDescricao: "BLOQUEIO DE ROUBO/FURTO ATIVO",
  },
  pdf: null,
};

// ─── 3. RESTRIÇÕES RENAJUD ───────────────────────────────────────────────────
export const RENAJUD_MOCK_CLEAN = {
  processo: "—",
  orgao_judicial: "—",
  tribunal: "—",
  restricoes: [],
  veiculo: {
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA"
  }
};

export const RENAJUD_MOCK_RESTRICTED = {
  processo: "0010948-23.2025.5.03.0012",
  orgao_judicial: "2ª Vara do Trabalho de Belo Horizonte",
  tribunal: "TRT3",
  restricoes: ["TRANSFERENCIA", "CIRCULACAO", "PENHORA"],
  veiculo: {
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA"
  }
};

// ─── 4. LEILÃO COM SCORE ─────────────────────────────────────────────────────
// Estrutura compatível com LeilaoResult do busca-leilao-score-panel.tsx
export const LEILAO_MOCK_CLEAN = {
  score: {
    pontuacao: "A",
    descricaoPontuacao: "EXCELENTE — BAIXÍSSIMO RISCO",
    aceitacao: "95",
    percentualSobreFipe: "92",
    exigeVistoriaEspecial: "NÃO",
  },
  totalOcorrencias: 0,
  ocorrencias: [],
  dadosVeiculo: {
    placa: "XXX-0000",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    chassi: "9BWZZZ377VT000000",
    renavam: "00456789012",
    cor: "VERMELHA",
    motor: "CCC178906",
    cambio: "MANUAL",
    carroceria: "HATCHBACK",
    categoria: "AUTOMÓVEL",
    combustivel: "ALCOOL/GASOLINA",
    kilometragem: "85200",
    qtdEixos: "2",
    eixoTraseiro: "SIMPLES",
  },
  sinistro: {
    existeOcorrencia: false,
    descricao: null,
  },
  checkList: {
    frente: "SEM AVARIA",
    traseira: "SEM AVARIA",
    teto: "SEM AVARIA",
    lateralDireita: "SEM AVARIA",
    lateralEsquerda: "SEM AVARIA",
    interior: "SEM AVARIA",
    airbags: "NÃO ACIONADO",
    localQueimado: "NÃO",
    rodasFaltantes: "NÃO",
    observacoes: "Veículo em perfeitas condições estruturais.",
  },
  historicoSinistros: [],
};

export const LEILAO_MOCK_RESTRICTED = {
  score: {
    pontuacao: "E",
    descricaoPontuacao: "INACEITÁVEL — ALTÍSSIMO RISCO",
    aceitacao: "35",
    percentualSobreFipe: "52",
    exigeVistoriaEspecial: "SIM",
  },
  totalOcorrencias: 2,
  ocorrencias: [
    {
      dataLeilao: "27/09/2021",
      leiloeiro: "BETA LEILÕES S/A",
      lote: "512",
      comitente: "SULAMÉRICA COMPANHIA NACIONAL DE SEGUROS",
      patio: "CONTAGEM - MG",
      condicaoGeral: "RECUPERADO DE SINISTRO (MÉDIA MONTA)",
      situacaoChassi: "ADULTERADO / REGRAVADO",
      condicaoMotor: "AVARIADO / INCOMPLETO",
      condicaoMecanica: "AVARIADA",
      condicaoCambio: "AVARIADO",
      observacoes: "CHASSI REGRAVADO E MOTOR SUBSTITUÍDO",
      imagens: [],
    },
    {
      dataLeilao: "05/06/2020",
      leiloeiro: "GAMMA LEILÕES",
      lote: "74",
      comitente: "PORTO SEGURO CIA DE SEGUROS",
      patio: "BETIM - MG",
      condicaoGeral: "RECUPERADO DE FINANCIAMENTO",
      situacaoChassi: "ÍNTEGRO",
      condicaoMotor: "REGULAR",
      condicaoMecanica: "REGULAR",
      condicaoCambio: "NORMAL",
      observacoes: "VEÍCULO COMPACTADO PARA RETIRADA",
      imagens: [],
    }
  ],
  dadosVeiculo: {
    placa: "XXX-1111",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    chassi: "9BWZZZ377VT000000",
    renavam: "00456789012",
    cor: "VERMELHA",
    motor: "CCC178906",
    cambio: "MANUAL",
    carroceria: "HATCHBACK",
    categoria: "AUTOMÓVEL",
    combustivel: "ALCOOL/GASOLINA",
    kilometragem: "142500",
    qtdEixos: "2",
    eixoTraseiro: "SIMPLES",
  },
  sinistro: {
    existeOcorrencia: true,
    descricao: "Sinistro de média monta registrado em 15/08/2021",
  },
  checkList: {
    frente: "AMASSADA",
    traseira: "SEM AVARIA",
    teto: "SEM AVARIA",
    lateralDireita: "RISCADA",
    lateralEsquerda: "SEM AVARIA",
    interior: "QUEIMADO",
    airbags: "ACIONADO",
    localQueimado: "SIM",
    rodasFaltantes: "NÃO",
    observacoes: "Chassi regravado. Motor substituído. Airbags acionados.",
  },
  historicoSinistros: [
    {
      data: "15/08/2021",
      tipo: "MÉDIA MONTA",
      seguradora: "SULAMÉRICA SEGUROS",
      valor: "R$ 16.800,00",
      situacao: "RECUPERADO",
      descricao: "Danos estruturais na dianteira. Chassi adulterado.",
    }
  ],
};

// ─── 5. VIP CAR ──────────────────────────────────────────────────────────────
export const VIP_CAR_MOCK_CLEAN = {
  identificacao: {
    placa: "XXX-0000",
    marcaModelo: "VW/FOX 1.0 GII",
    categoria: "AUTOMÓVEL",
    anoFabricacao: 2012,
    anoModelo: 2013,
    combustivel: "ALCOOL/GASOLINA",
    municipio: "BELO HORIZONTE",
    uf: "MG",
    chassi: "9BWZZZ377VT000000",
    statusDescricao: "SEM RESTRIÇÃO",
  },
  rouboFurto: {
    declaracao: false,
    devolucao: false,
    recuperacao: false,
  },
  dadosTecnicos: {
    cor: "VERMELHA",
    chassi: "9BWZZZ377VT000000",
    marca: "VW",
    modelo: "FOX 1.0 GII",
    anoFabricacao: 2012,
    anoModelo: 2013,
    combustivel: "ALCOOL/GASOLINA",
    categoria: "AUTOMÓVEL",
    motor: "CCC178906",
    potencia: "76CV",
    cilindrada: "999",
    capacidadePassageiros: "5",
    carroceria: "HATCHBACK",
    especie: "PASSAGEIRO",
    tipo: "AUTOMÓVEL",
    procedencia: "NACIONAL",
  },
  proprietario: {
    nome: "JOÃO DA SILVA",
    documento: "123.456.789-00",
    renavam: "00456789012",
    municipio: "BELO HORIZONTE",
    uf: "MG",
    cor: "VERMELHA",
    motor: "CCC178906",
    chassi: "9BWZZZ377VT000000",
    crlv: "00123456789",
    dataAtualizacao: "15/03/2025",
    statusDescricao: "SEM RESTRIÇÃO",
  },
  leilao: {
    score: 95,
    scoreLabel: "BAIXO RISCO",
    totalLeiloes: 0,
    indicio: false,
    historico: [],
  },
  renainf: {
    total: "0",
    ocorrencias: [],
  },
  pdf: null,
};

export const VIP_CAR_MOCK_RESTRICTED = {
  identificacao: {
    placa: "XXX-1111",
    marcaModelo: "VW/FOX 1.0 GII",
    categoria: "AUTOMÓVEL",
    anoFabricacao: 2012,
    anoModelo: 2013,
    combustivel: "ALCOOL/GASOLINA",
    municipio: "BELO HORIZONTE",
    uf: "MG",
    chassi: "9BWZZZ377VT000000",
    statusDescricao: "RESTRIÇÃO DE ROUBO E LEILÃO",
  },
  rouboFurto: {
    declaracao: true,
    devolucao: false,
    recuperacao: true,
  },
  dadosTecnicos: {
    cor: "VERMELHA",
    chassi: "9BWZZZ377VT000000",
    marca: "VW",
    modelo: "FOX 1.0 GII",
    anoFabricacao: 2012,
    anoModelo: 2013,
    combustivel: "ALCOOL/GASOLINA",
    categoria: "AUTOMÓVEL",
    motor: "CCC178906",
    potencia: "76CV",
    cilindrada: "999",
    capacidadePassageiros: "5",
    carroceria: "HATCHBACK",
    especie: "PASSAGEIRO",
    tipo: "AUTOMÓVEL",
    procedencia: "NACIONAL",
  },
  proprietario: {
    nome: "JOÃO DA SILVA",
    documento: "123.456.789-00",
    renavam: "00456789012",
    municipio: "BELO HORIZONTE",
    uf: "MG",
    cor: "VERMELHA",
    motor: "CCC178906",
    chassi: "9BWZZZ377VT000000",
    crlv: "00123456789",
    dataAtualizacao: "15/03/2025",
    statusDescricao: "BLOQUEIO DE ROUBO/FURTO ATIVO",
  },
  leilao: {
    score: 35,
    scoreLabel: "ALTO RISCO",
    totalLeiloes: 2,
    indicio: true,
    historico: [
      {
        data: "27/09/2021",
        leiloeiro: "BETA LEILÕES S/A",
        lote: "512",
        comitente: "SULAMÉRICA COMPANHIA NACIONAL DE SEGUROS",
        patio: "CONTAGEM - MG",
        valorArremate: "R$ 18.500,00",
        condicaoGeral: "RECUPERADO DE SINISTRO (MÉDIA MONTA)",
        situacaoChassi: "ADULTERADO / REGRAVADO",
      }
    ],
  },
  renainf: {
    total: "3",
    ocorrencias: [
      {
        auto: "A10892736",
        dataHora: "12/12/2021 14:30:00",
        descricao: "TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ 20%",
        orgao: "DPRF - BRASÍLIA/DF",
        codigo: "74550",
        valor: "R$ 130,16",
      }
    ],
  },
  pdf: null,
};

// ─── 6. GRAVAME ──────────────────────────────────────────────────────────────
export const GRAVAME_MOCK_CLEAN = {
  placa: "XXX-0000",
  chassi: "9BWZZZ377VT000000",
  renavam: "00456789012",
  marca_modelo: "VW/FOX 1.0 GII",
  ano_fabricacao: "2012",
  ano_modelo: "2013",
  cor_veiculo: "VERMELHA",
  combustivel: "ALCOOL/GASOLINA",
  financiamento: "NÃO",
  agente_financeiro: "—",
  data_inclusao: "—",
  contrato_numero: "—",
  situacao: "—",
  // Inclui o objeto veiculo para conformidade estética de cabeçalho
  veiculo: {
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA"
  }
};

export const GRAVAME_MOCK_RESTRICTED = {
  placa: "XXX-1111",
  chassi: "9BWZZZ377VT000000",
  renavam: "00456789012",
  marca_modelo: "VW/FOX 1.0 GII",
  ano_fabricacao: "2012",
  ano_modelo: "2013",
  cor_veiculo: "VERMELHA",
  combustivel: "ALCOOL/GASOLINA",
  financiamento: "SIM",
  agente_financeiro: "BANCO ITAÚ VEÍCULOS S.A.",
  data_inclusao: "22/10/2021",
  contrato_numero: "938.481.082/12",
  situacao: "ATIVO",
  // Inclui o objeto veiculo para conformidade estética de cabeçalho
  veiculo: {
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA"
  }
};

// ─── 7. DÉBITOS V4 ────────────────────────────────────────────────────────────
export const DEBITOS_V4_MOCK_CLEAN = {
  veiculo: {
    placa: "XXX-0000",
    renavam: "00456789012",
    chassi: "9BWZZZ377VT000000",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA"
  },
  debitos: {
    placa: "XXX-0000",
    renavam: "00456789012",
    chassi: "9BWZZZ377VT000000",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    combustivel: "ALCOOL/GASOLINA",
    cor: "VERMELHA",
    multas: [],
    ipva: [],
    licenciamento: [],
    dpvat: [],
    outrosDebitos: [],
    totalMultas: "R$ 0,00",
    totalIpva: "R$ 0,00",
    totalLicenciamento: "R$ 0,00",
    totalDpvat: "R$ 0,00",
    totalGeral: "R$ 0,00"
  }
};

export const DEBITOS_V4_MOCK_RESTRICTED = {
  veiculo: {
    placa: "XXX-1111",
    renavam: "00456789012",
    chassi: "9BWZZZ377VT000000",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA"
  },
  debitos: {
    placa: "XXX-1111",
    renavam: "00456789012",
    chassi: "9BWZZZ377VT000000",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    combustivel: "ALCOOL/GASOLINA",
    cor: "VERMELHA",
    multas: [
      {
        descricao: "TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ 20%",
        valor: "R$ 130,16",
        dataVencimento: "15/09/2025",
        orgaoEmissor: "DPRF - CONTAGEM/MG",
        codigoInfracao: "74550",
        situacao: "EM ABERTO"
      },
      {
        descricao: "AVANÇAR O SINAL VERMELHO DO SEMÁFORO OU O DE PARADA OBRIGATÓRIA",
        valor: "R$ 293,47",
        dataVencimento: "22/10/2025",
        orgaoEmissor: "BHTRANS - BELO HORIZONTE/MG",
        codigoInfracao: "60501",
        situacao: "EM ABERTO"
      }
    ],
    ipva: [
      {
        exercicio: "2025",
        valor: "R$ 1.312,00",
        parcela: "COTA ÚNICA",
        dataVencimento: "15/03/2025",
        situacao: "EM ABERTO"
      },
      {
        exercicio: "2026",
        valor: "R$ 1.280,00",
        parcela: "PARCELA 1/3",
        dataVencimento: "15/03/2026",
        situacao: "VENCIDO"
      }
    ],
    licenciamento: [
      {
        exercicio: "2025",
        valor: "R$ 39,36",
        dataVencimento: "31/03/2025",
        situacao: "VENCIDO"
      },
      {
        exercicio: "2026",
        valor: "R$ 41,20",
        dataVencimento: "31/03/2026",
        situacao: "VENCIDO"
      }
    ],
    dpvat: [
      {
        exercicio: "2025",
        valor: "R$ 5,23",
        dataVencimento: "31/03/2025",
        situacao: "VENCIDO"
      }
    ],
    outrosDebitos: [],
    totalMultas: "R$ 423,63",
    totalIpva: "R$ 2.592,00",
    totalLicenciamento: "R$ 80,56",
    totalDpvat: "R$ 5,23",
    totalGeral: "R$ 3.101,42"
  }
};

// ─── 9. BASE ESTADUAL DETRAN ──────────────────────────────────────────────────
export const ESTADUAL_MOCK_CLEAN = {
  veiculo: {
    placa: "XXX-0000",
    renavam: "00456789012",
    chassi: "9BWZZZ377VT000000",
    marca_modelo: "VW/FOX 1.0 GII",
    uf: "MG",
  },
  estadual: {
    placa: "XXX-0000",
    renavam: "00456789012",
    chassi: "9BWZZZ377VT000000",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    combustivel: "ALCOOL/GASOLINA",
    cor: "VERMELHA",
    uf: "MG",
    municipio: "BELO HORIZONTE",
    restricoes: [],
    multas: [],
    ipva: [],
    licenciamento: [],
    outrosDebitos: [],
    totalDebitos: "R$ 0,00",
  }
};

export const ESTADUAL_MOCK_RESTRICTED = {
  veiculo: {
    placa: "XXX-1111",
    renavam: "00456789012",
    chassi: "9BWZZZ377VT000000",
    marca_modelo: "VW/FOX 1.0 GII",
    uf: "SP",
  },
  estadual: {
    placa: "XXX-1111",
    renavam: "00456789012",
    chassi: "9BWZZZ377VT000000",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    combustivel: "ALCOOL/GASOLINA",
    cor: "VERMELHA",
    uf: "SP",
    municipio: "SAO PAULO",
    restricoes: [
      {
        tipo: "Judicial",
        descricao: "BLOQUEIO DE TRANSFERENCIA ATIVO - PROCESSO TRABALHISTA",
      },
      {
        tipo: "Administrativo",
        descricao: "RESTRICAO POR FALTA DE TRANSFERENCIA (COMUNICACAO DE VENDA)",
      }
    ],
    multas: [
      {
        descricao: "TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ 20%",
        valor: "R$ 130,16",
        dataVencimento: "15/09/2025",
        orgaoEmissor: "DETRAN-SP",
        tipoDebito: "Multa Estadual"
      }
    ],
    ipva: [
      {
        descricao: "IPVA Exercício 2026",
        valor: "R$ 1.280,00",
        dataVencimento: "15/03/2026",
        orgaoEmissor: "SEFAZ-SP",
        tipoDebito: "IPVA"
      }
    ],
    licenciamento: [
      {
        descricao: "Licenciamento Anual 2026",
        valor: "R$ 155,23",
        dataVencimento: "31/10/2026",
        orgaoEmissor: "DETRAN-SP",
        tipoDebito: "Licenciamento"
      }
    ],
    outrosDebitos: [],
    totalDebitos: "R$ 1.565,39",
  }
};
// ─── Renainf (Multas) ────────────────────────────────────────────────────────

export const RENAINF_MOCK_CLEAN = {
  status_code: 200,
  error: false,
  message: "Sucesso",
  homolog: true,
  data: {
    veiculo: {
      placa: "XXX-0000",
      renavam: "00000000000",
      chassi: "9BWZZZ377VT000000",
      marca_modelo: "VW/FOX 1.0 GII",
      uf: "SP"
    },
    renainf: {
      placa: "XXX-0000",
      chassi: "9BWZZZ377VT000000",
      renavam: "00000000000",
      marcaModelo: "VW/FOX 1.0 GII",
      totalMultas: 0,
      valorTotal: "0,00",
      infracoes: []
    }
  }
};

export const RENAINF_MOCK_RESTRICTED = {
  status_code: 200,
  error: false,
  message: "Sucesso",
  homolog: true,
  data: {
    veiculo: {
      placa: "XXX-1111",
      renavam: "11111111111",
      chassi: "9BWZZZ377VT111111",
      marca_modelo: "VW/FOX 1.0 GII",
      uf: "SP"
    },
    renainf: {
      placa: "XXX-1111",
      chassi: "9BWZZZ377VT111111",
      renavam: "11111111111",
      marcaModelo: "VW/FOX 1.0 GII",
      totalMultas: 2,
      valorTotal: "426,38",
      infracoes: [
        {
          autoInfra: "S000123456",
          codigoInfra: "7455",
          dataInfra: "15/04/2026",
          descricao: "Transitar em velocidade superior a maxima permitida em ate 20%",
          orgaoEmissor: "DER/SP",
          valorOriginal: "130,16",
          valorAnotado: "130,16",
          situacao: "Nao Paga",
          localInfra: "ROD SP 330 KM 024+300 METROS SUL"
        },
        {
          autoInfra: "S000789012",
          codigoInfra: "6050",
          dataInfra: "10/05/2026",
          descricao: "Avancar o sinal vermelho do semaforo - fiscalizacao eletronica",
          orgaoEmissor: "CET/SP",
          valorOriginal: "293,47",
          valorAnotado: "296,22",
          situacao: "Autuacao",
          localInfra: "AV PAULISTA X RUA AUGUSTA"
        }
      ]
    }
  }
};

// ─── 11. HISTÓRICO KM ─────────────────────────────────────────────────────────
export const HISTORICO_KM_MOCK_CLEAN = {
  veiculo: {
    placa: "XXX-0000",
    chassi: "9BWZZZ377VT000000",
    renavam: "00456789012",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA",
  },
  historicoKm: {
    placa: "XXX-0000",
    totalRegistros: 3,
    registros: [
      { data: "14/03/2026", km: 58200, fonte: "REVISÃO CONCESSIONÁRIA", estado: "SP" },
      { data: "10/09/2025", km: 51800, fonte: "VISTORIA DETRAN", estado: "SP" },
      { data: "22/02/2025", km: 47400, fonte: "REVISÃO CONCESSIONÁRIA", estado: "SP" },
    ],
  },
};

export const HISTORICO_KM_MOCK_RESTRICTED = {
  veiculo: {
    placa: "XXX-1111",
    chassi: "9BWZZZ377VT111111",
    renavam: "11111111111",
    marcaModelo: "VW/FOX 1.0 GII",
    anoFabricacao: "2012",
    anoModelo: "2013",
    cor: "VERMELHA",
    combustivel: "ALCOOL/GASOLINA",
  },
  historicoKm: {
    placa: "XXX-1111",
    totalRegistros: 4,
    anomalia: true,
    registros: [
      { data: "05/04/2026", km: 39200, fonte: "REVISÃO CONCESSIONÁRIA", estado: "RJ" },
      { data: "18/11/2025", km: 62500, fonte: "VISTORIA DETRAN", estado: "SP" },
      { data: "03/07/2025", km: 58900, fonte: "REVISÃO CONCESSIONÁRIA", estado: "SP" },
      { data: "14/01/2025", km: 54300, fonte: "SEGURADORA", estado: "SP" },
    ],
  },
};

// ─── 12. EMISSÃO DE CRLV-e ───────────────────────────────────────────────────

export const CRLV_MOCK_CLEAN = {
  status_code: 200,
  error: false,
  message: "Sucesso",
  homolog: true,
  data: {
    documentos: {
      crlv: {
        chave_retorno: "3512345678901234567890123456789012345678",
        exercicio: "2026",
        existe_ocorrencia: "0",
        observacoes: "SEM OBSERVACOES REGISTRADAS",
        pdf_file: {
          file_base64: "JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9SZXNvdXJjZXMgPDwKICAgICAgICAvRm9udCA8PAogICAgICAgICAgIC9GMSA0IDAgUgogICAgICAgID4+CiAgICAgPj4KICAgICAvQ29udGVudHMgNSAwIFIKICA+PgplbmRvYmoKNCAgb2JqCiAgPDwgL1R5cGUgL0ZvbnQKICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAvQmFzZUZvbnQgL0hlbHZldGljYQogID4+CmVuZG9iago1IDAgb2JqCiAgPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKICAvRjEgMjQgVGYKICA3MCA3MDAgVGQKICAoQ1JMVkUtRSBESUdJVEFMIExJQ0VOQ0lBTUVOVE8pIFRqCkVOCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNjIgMDAwMDAgbCArCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDI3OCAwMDAwMCBuIAowMDAwMDAwMzY4IDAwMDAwIG4gCnRyYWlsZXIKICA8PCAvU2l6ZSA2CiAgICAgL1Jvb3QgMSAwIFIKICA+PgpzdGFydHhyZWYKNDYzCiUlRU9GCg==",
          mime_type: "APPLICATION/PDF"
        },
        status_retorno: {
          codigo: "1",
          descricao: "CONSULTA CONCLUIDA COM SUCESSO"
        }
      }
    },
    uf: "PR",
    veiculo: {
      ano_fabricacao: "2012",
      ano_modelo: "2013",
      chassi: "9BWZZZ377VT000000",
      combustivel: "ALCOOL/GASOLINA",
      cor_veiculo: "VERMELHA",
      crlv: "00123456789",
      data_atualizacao: "15/03/2026",
      marca_modelo: "VW/FOX 1.0 GII",
      motor: "CCC178906",
      municipio: "CURITIBA",
      placa: "XXX-0000",
      proprietario_documento: "123.456.789-00",
      proprietario_nome: "JOÃO DA SILVA",
      renavam: "00456789012",
      status_retorno: {
        codigo: "1",
        descricao: "CONSULTA COM SUCESSO"
      },
      uf: "PR"
    }
  }
};

export const CRLV_MOCK_RESTRICTED = {
  status_code: 200,
  error: false,
  message: "Sucesso",
  homolog: true,
  data: {
    documentos: {
      crlv: {
        chave_retorno: "3512345678901234567890123456789012345678",
        exercicio: "2025",
        existe_ocorrencia: "1",
        observacoes: "RESTRIÇÃO JUDICIAL RENAJUD CIRCULAÇÃO ATIVA",
        pdf_file: {
          file_base64: "JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogICAgIC9SZXNvdXJjZXMgPDwKICAgICAgICAvRm9udCA8PAogICAgICAgICAgIC9GMSA0IDAgUgogICAgICAgID4+CiAgICAgPj4KICAgICAvQ29udGVudHMgNSAwIFIKICA+PgplbmRvYmoKNCAgb2JqCiAgPDwgL1R5cGUgL0ZvbnQKICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAvQmFzZUZvbnQgL0hlbHZldGljYQogID4+CmVuZG9iago1IDAgb2JqCiAgPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKICAvRjEgMjQgVGYKICA3MCA3MDAgVGQKICAoQ1JMVkUtRSBESUdJVEFMIExJQ0VOQ0lBTUVOVE8pIFRqCkVOCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNjIgMDAwMDAgbCArCjAwMDAwMDAxMjUgMDAwMDAgbiAKMDAwMDAwMDI3OCAwMDAwMCBuIAowMDAwMDAwMzY4IDAwMDAwIG4gCnRyYWlsZXIKICA8PCAvU2l6ZSA2CiAgICAgL1Jvb3QgMSAwIFIKICA+PgpzdGFydHhyZWYKNDYzCiUlRU9GCg==",
          mime_type: "APPLICATION/PDF"
        },
        status_retorno: {
          codigo: "1",
          descricao: "CONSULTA CONCLUIDA COM ALERTA DE OCORRENCIA"
        }
      }
    },
    uf: "PR",
    veiculo: {
      ano_fabricacao: "2012",
      ano_modelo: "2013",
      chassi: "9BWZZZ377VT000000",
      combustivel: "ALCOOL/GASOLINA",
      cor_veiculo: "VERMELHA",
      crlv: "00123456789",
      data_atualizacao: "15/03/2025",
      marca_modelo: "VW/FOX 1.0 GII",
      motor: "CCC178906",
      municipio: "CURITIBA",
      placa: "XXX-1111",
      proprietario_documento: "123.456.789-00",
      proprietario_nome: "JOÃO DA SILVA",
      renavam: "00456789012",
      status_retorno: {
        codigo: "1",
        descricao: "CONSULTA COM SUCESSO"
      },
      uf: "PR"
    }
  }
};

// ─── CSV Completa — estrutura real da API (/api/v2/consulta/veiculos/credits) ──

const _csvStatusOk = { codigo: "1", descricao: "CONSULTA CONCLUIDA COM SUCESSO" };

export const CSV_COMPLETA_MOCK_CLEAN = {
  status_code: 200, error: false, homolog: true,
  message: "Dados validos em homologacao!",
  data: {
    pdf: "https://api-csv-renainf-renajud-bin-proprietario.apiveiculos.com.br/pdf/mockpdf",
    veicular: {
      proprietario_atual_veiculo: {
        placa: "XXX-0000", marca_modelo: "VW/FOX 1.0 GII",
        chassi: "9BWZZZ377VT000000", renavam: "00456789012",
        ano_fabricacao: "2012", ano_modelo: "2013",
        combustivel: "ALCOOL/GASOLINA", cor_veiculo: "VERMELHA",
        municipio: "CURITIBA", uf: "PR", motor: "CCC178906",
        proprietario_nome: "JOÃO DA SILVA",
        proprietario_documento: "123.456.789-00",
        status_retorno: _csvStatusOk,
      },
      bin_nacional: {
        placa: "XXX-0000", marca_modelo: "VW/FOX 1.0 GII",
        chassi: "9BWZZZ377VT000000", renavam: "00456789012",
        ano_fabricacao: "2012", ano_modelo: "2013",
        combustivel: "ALCOOL/GASOLINA", cor_veiculo: "VERMELHA",
        municipio: "CURITIBA", uf: "PR",
        categoria_veiculo: "PARTICULAR", especie_veiculo: "PASSAGEIRO",
        tipo_veiculo: "AUTOMOVEL", tipo_carroceria: "NAO APLICAVEL",
        potencia_veiculo: "76", numero_eixos: "2",
        quantidade_passageiros: "5", procedencia: "NACIONAL",
        pbt: "2", situacao: "EM CIRCULACAO",
        data_emissao_crlv: "10/03/2025", data_emissao_ultimo_crv: "10/03/2025",
        proprietario: { nome: "JOÃO DA SILVA", documento: "123.456.789-00" },
        restricoes: {
          existe_restricao_geral: "0", existe_restricao_renajud: "0",
          existe_restricao_roubo_furto: "0", mensagens_restricoes: [],
          veiculo_baixado: "0",
        },
        status_retorno: _csvStatusOk,
      },
      alerta_indicio: {
        existe_ocorrencia: "0",
        descricao_ocorrencia: "NENHUM ALERTA DE INDICIO DE SINISTRO ENCONTRADO NAS BASES CONSULTADAS",
        status_retorno: _csvStatusOk,
      },
      renainf: { qtd_ocorrencias: "0", ocorrencias: [], status_retorno: _csvStatusOk },
      renajud: { quantidade_ocorrencias: "0", msg_alerta: "", status_retorno: _csvStatusOk },
      csv: { quantidade_ocorrencia: "0", ocorrencias: [], mensagem_observacao: "", status_retorno: _csvStatusOk },
      precificador: {
        ocorrencias: [{
          ano_modelo: "2013", codigo: "005274-7",
          fabricante_modelo: "VW/FOX 1.0 GII FLEX",
          informante: "FIPE", preco: "24.500,00", vigencia: "MARÇO DE 2026",
        }],
        status_retorno: _csvStatusOk,
      },
      recall: { quantidade_ocorrencias: "0", status_retorno: _csvStatusOk },
    },
  },
};

export const CSV_COMPLETA_MOCK_RESTRICTED = {
  status_code: 200, error: false, homolog: true,
  message: "Dados validos em homologacao!",
  data: {
    pdf: "https://api-csv-renainf-renajud-bin-proprietario.apiveiculos.com.br/pdf/mockpdf-restricted",
    veicular: {
      proprietario_atual_veiculo: {
        placa: "XXX-1111", marca_modelo: "VW/GOL TRACK 1.0",
        chassi: "9BWZZZ377VT000001", renavam: "00456789013",
        ano_fabricacao: "2018", ano_modelo: "2019",
        combustivel: "FLEX", cor_veiculo: "PRATA",
        municipio: "SÃO PAULO", uf: "SP", motor: "DDD291807",
        proprietario_nome: "JOÃO DA SILVA",
        proprietario_documento: "123.456.789-00",
        status_retorno: _csvStatusOk,
      },
      bin_nacional: {
        placa: "XXX-1111", marca_modelo: "VW/GOL TRACK 1.0",
        chassi: "9BWZZZ377VT000001", renavam: "00456789013",
        ano_fabricacao: "2018", ano_modelo: "2019",
        combustivel: "FLEX", cor_veiculo: "PRATA",
        municipio: "SÃO PAULO", uf: "SP",
        categoria_veiculo: "PARTICULAR", especie_veiculo: "PASSAGEIRO",
        tipo_veiculo: "AUTOMOVEL", tipo_carroceria: "NAO APLICAVEL",
        potencia_veiculo: "74", numero_eixos: "2",
        quantidade_passageiros: "5", procedencia: "NACIONAL",
        pbt: "2", situacao: "COM RESTRICAO",
        data_emissao_crlv: "15/03/2024", data_emissao_ultimo_crv: "15/03/2024",
        proprietario: { nome: "JOÃO DA SILVA", documento: "123.456.789-00" },
        restricoes: {
          existe_restricao_geral: "1", existe_restricao_renajud: "1",
          existe_restricao_roubo_furto: "0",
          mensagens_restricoes: [
            "BLOQUEIO JUDICIAL ATIVO - TRT2 - PROCESSO 0010948-23.2025.5.03.0012",
            "RESTRICAO ADMINISTRATIVA ATIVA - DETRAN-SP",
          ],
          veiculo_baixado: "0",
        },
        status_retorno: _csvStatusOk,
      },
      alerta_indicio: {
        existe_ocorrencia: "1",
        descricao_ocorrencia: "INDICIO DE SINISTRO IDENTIFICADO NAS BASES CONSULTADAS — VERIFIQUE HISTORICO COMPLETO",
        status_retorno: _csvStatusOk,
      },
      renainf: {
        qtd_ocorrencias: "2",
        ocorrencias: [
          {
            numero_auto_infracao: "AA0012345", codigo_infracao: "55412",
            data_infracao: "12/08/2024",
            descricao_infracao: "VELOCIDADE SUPERIOR A MAXIMA PERMITIDA EM ATE 20%",
            orgao_autuador: "DETRAN-SP", valor_multa: "880,41",
            situacao: "EM ABERTO", local_infracao: "ROD. ANHANGUERA KM 42 - SP",
          },
          {
            numero_auto_infracao: "BB0098765", codigo_infracao: "73662",
            data_infracao: "03/11/2024",
            descricao_infracao: "CONDUZIR VEICULO COM CNH VENCIDA",
            orgao_autuador: "PMC-SP", valor_multa: "367,99",
            situacao: "EM ABERTO", local_infracao: "AV. PAULISTA 1500 - SP",
          },
        ],
        status_retorno: _csvStatusOk,
      },
      renajud: {
        quantidade_ocorrencias: "1",
        msg_alerta: "RESTRICAO JUDICIAL — PROCESSO 0010948-23.2025.5.03.0012 · TRT2 · TRANSFERENCIA, CIRCULACAO, PENHORA",
        status_retorno: _csvStatusOk,
      },
      csv: {
        quantidade_ocorrencia: "1",
        ocorrencias: [{
          tipo_restricao: "BLOQUEIO ADMINISTRATIVO",
          descricao: "BLOQUEIO DE TRANSFERENCIA ATIVO - PROCESSO TRABALHISTA",
          data: "20/08/2024", orgao: "DETRAN-SP",
        }],
        mensagem_observacao: "VEICULO COM RESTRICOES ATIVAS NO SISTEMA CSV",
        status_retorno: _csvStatusOk,
      },
      precificador: {
        ocorrencias: [{
          ano_modelo: "2019", codigo: "005890-4",
          fabricante_modelo: "VW/GOL TRACK 1.0 FLEX",
          informante: "FIPE", preco: "52.800,00", vigencia: "MARÇO DE 2026",
        }],
        status_retorno: _csvStatusOk,
      },
      recall: { quantidade_ocorrencias: "0", status_retorno: _csvStatusOk },
    },
  },
};
