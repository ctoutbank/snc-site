import { NextRequest, NextResponse } from "next/server";
import { 
  consultarCsvCompleta, 
  consultarLeilaoScore, 
  consultarDebitosV4, 
  consultarHistoricoKm, 
  consultarGravame,
  consultarRenajud,
  consultarPlacaFIPE,
  consultarAgregadosPropria,
  APIBrasilError 
} from "@/lib/apibrasil";

// Best-effort in-memory cache for serverless environments
// Evita requisições repetidas acidentais na mesma placa na mesma instância
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

function formatarBRL(valor?: string | number): string {
  if (valor === undefined || valor === null || valor === "") return "—";
  const num = typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;
  if (isNaN(num)) return String(valor);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

// ─── Normalização de Placa ───────────────────────────────────────────────────
function normalizarPlaca(placa: string): string {
  return placa.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
}

// ─── Mapeamento de Dados Mapeados ─────────────────────────────────────────────

function mapearCsvCompleta(raw: Record<string, any>) {
  const data = raw?.data as Record<string, any> | undefined;
  const veicular = data?.veicular as Record<string, any> | undefined;
  const bin = veicular?.bin_nacional;
  const prop = bin?.proprietario;

  const identificacao = bin ? {
    placa:          bin.placa ?? null,
    marcaModelo:    bin.marca_modelo ?? null,
    anoFabricacao:  bin.ano_fabricacao ?? null,
    anoModelo:      bin.ano_modelo ?? null,
    categoria:      bin.categoria_veiculo ?? null,
    combustivel:    bin.combustivel ?? null,
    municipio:      bin.municipio ?? null,
    uf:             bin.uf ?? null,
    statusDescricao: bin.situacao ?? bin.status_retorno?.descricao ?? null,
  } : null;

  const dadosTecnicos = bin ? {
    cor: bin.cor_veiculo ?? null,
    chassi: bin.chassi ?? null,
    marca: bin.marca_modelo ? bin.marca_modelo.split("/")[0] : null,
    modelo: bin.marca_modelo ? bin.marca_modelo.split("/").slice(1).join("/") : null,
    motor: bin.motor ?? null,
    potencia: bin.potencia_veiculo ?? null,
    cilindrada: bin.cilindradas ?? bin.cilindrada ?? null,
    capacidadePassageiros: bin.quantidade_passageiros ?? null,
    carroceria: bin.tipo_carroceria ?? null,
    especie: bin.especie_veiculo ?? null,
    tipo: bin.tipo_veiculo ?? null,
    procedencia: bin.procedencia ?? null,
    eixos: bin.quantidade_eixos ?? bin.qtd_eixos ?? null,
    pbt: bin.peso_bruto_total ?? bin.pbt ?? null,
    dataEmissaoCrlv: bin.data_emissao_crlv ?? null,
    dataUltimoCrv: bin.data_ultimo_crv ?? null,
  } : null;

  const proprietario = bin ? {
    nome: prop?.nome ?? veicular?.proprietario_atual_veiculo?.proprietario_nome ?? null,
    documento: prop?.documento ?? veicular?.proprietario_atual_veiculo?.proprietario_documento ?? null,
    renavam: bin.renavam ?? veicular?.proprietario_atual_veiculo?.renavam ?? null,
    municipio: bin.municipio ?? null,
    uf: bin.uf ?? null,
    crlv: bin.crlv ?? veicular?.proprietario_atual_veiculo?.crlv ?? null,
    dataAtualizacao: bin.data_emissao_crlv ?? veicular?.proprietario_atual_veiculo?.data_atualizacao ?? null,
    statusDescricao: bin.situacao ?? null,
  } : null;

  const rouboFurto = veicular?.bin_nacional?.restricoes
    ? {
        declaracao:  veicular.bin_nacional.restricoes.existe_restricao_roubo_furto === "1" || veicular.bin_nacional.restricoes.existe_restricao_roubo_furto === "SIM",
        devolucao:   false, // CSV Completa traz flag agregada de roubo geral
        recuperacao: false,
      }
    : { declaracao: false, devolucao: false, recuperacao: false };

  const restricoesBin = veicular?.bin_nacional?.restricoes ? {
    existeRestricaoGeral: veicular.bin_nacional.restricoes.existe_restricao_geral === "1" || veicular.bin_nacional.restricoes.existe_restricao_geral === "SIM",
    renajud: veicular.bin_nacional.restricoes.existe_restricao_renajud === "1" || veicular.bin_nacional.restricoes.existe_restricao_renajud === "SIM",
    rouboFurto: veicular.bin_nacional.restricoes.existe_restricao_roubo_furto === "1" || veicular.bin_nacional.restricoes.existe_restricao_roubo_furto === "SIM",
    veiculoBaixado: veicular.bin_nacional.restricoes.veiculo_baixado === "1" || veicular.bin_nacional.restricoes.veiculo_baixado === "SIM",
    alertaSinistro: veicular.alerta_indicio?.existe_ocorrencia === "1" || veicular.alerta_indicio?.existe_ocorrencia === "SIM",
    mensagens: veicular.bin_nacional.restricoes.mensagens_restricoes ?? [],
  } : null;

  const precificador = (veicular?.precificador?.ocorrencias ?? []).map((o: any) => ({
    anoModelo:       o.ano_modelo ?? "—",
    codigo:          o.codigo ?? "—",
    fabricanteModelo: o.fabricante_modelo ?? "—",
    informante:      o.informante ?? "—",
    preco:           formatarBRL(o.preco),
  }));

  const renainf = {
    total:       veicular?.renainf?.qtd_ocorrencias ?? "0",
    ocorrencias: (veicular?.renainf?.ocorrencias ?? []).map((o: any) => ({
      auto:        o.auto_infracao ?? o.autoInfra ?? "—",
      dataHora:    o.data_infracao ?? o.dataInfra ?? "—",
      descricao:   o.descricao ?? "—",
      orgao:       o.orgao_atuador ?? o.orgaoEmissor ?? "—",
      codigo:      o.codigo_infracao ?? o.codigoInfra ?? o.detalhes?.dados_notificacao?.codigo_infracao ?? "—",
      valor:       o.valor_infracao ?? o.valorOriginal ?? o.detalhes?.dados_notificacao?.valor_infracao
                     ? `R$ ${o.valor_infracao ?? o.valorOriginal ?? o.detalhes?.dados_notificacao?.valor_infracao}`
                     : "—",
      local:       o.localInfra ?? o.detalhes?.dados_infracao?.local_infracao ?? "—",
      valorAnotado: o.valorAnotado ? `R$ ${o.valorAnotado}` : "—",
      situacao:    o.situacao ?? "—",
    })),
  };

  const recall = {
    total: veicular?.recall?.quantidade_ocorrencias ?? "0",
    ocorrencias: []
  };

  return { identificacao, dadosTecnicos, proprietario, rouboFurto, restricoesBin, precificador, renainf, recall, pdf: data?.pdf ?? null };
}

function mapearLeilao(raw: Record<string, any>) {
  const data = raw?.data as Record<string, any> | undefined;
  const veicular = data?.veicular as Record<string, any> | undefined;
  const leilao = veicular?.leilao as Record<string, any> | undefined;
  const sinistro = veicular?.indicio_sinistro as Record<string, any> | undefined;

  // Se já vier mapeado (ex: mock ou chamada manual)
  if (raw && !veicular && raw.score !== undefined) {
    return raw;
  }

  const dv = leilao?.dados_veiculo as Record<string, any> | undefined;
  const sc = leilao?.score as Record<string, any> | undefined;
  const cl = leilao?.check_list_veiculo as Record<string, any> | undefined;

  const scoreVal = sc?.pontuacao ? parseInt(sc.pontuacao, 10) : null;

  return {
    score: scoreVal,
    scoreLabel: sc?.descricao_pontuacao || "—",
    aceitacao: sc?.aceitacao || null,
    percentualSobreFipe: sc?.percentual_sobre_tabela_referencia || null,
    exigeVistoriaEspecial: sc?.exige_vistoria_especial || null,
    
    dadosVeiculo: dv ? {
      cambio: dv.cambio || null,
      qtdEixos: dv.qtd_eixos || null,
      eixoTraseiro: dv.eixo_traseiro || null,
      kilometragem: dv.kilometragem || null,
    } : null,

    totalLeiloes: leilao?.quantidade_ocorrencias ? parseInt(leilao.quantidade_ocorrencias, 10) : 0,
    indicio: sinistro?.existe_ocorrencia === "1" || sinistro?.existe_ocorrencia === "SIM" || false,
    
    historico: (leilao?.ocorrencias ?? []).map((o: any) => ({
      data: o.data_leilao || "—",
      leiloeiro: o.leiloeiro || "—",
      lote: o.lote || "—",
      comitente: o.comitente || "—",
      patio: o.patio || "—",
      valorArremate: o.valor_arremate || o.preco || "—",
      condicaoGeral: o.condicao_geral_veiculo || "—",
      condicaoMotor: o.condicao_motor || "—",
      condicaoMecanica: o.condicao_mecanica || "—",
      condicaoCambio: o.condicao_cambio || "—",
      situacaoChassi: o.situacao_chassi || "—",
      observacoes: o.observacoes || "—",
      imagens: o.imagens || [],
    })),
    
    checklist: {
      frente: cl?.frente?.descricao || null,
      traseira: cl?.traseira?.descricao || null,
      laterais: cl?.lateral_direita?.descricao || cl?.lateral_esquerda?.descricao || null,
      lateralDireita: cl?.lateral_direita?.descricao || null,
      lateralEsquerda: cl?.lateral_esquerda?.descricao || null,
      teto: cl?.teto?.descricao || null,
      interior: cl?.interior?.descricao || null,
      airbags: cl?.airbags_rompidos || null,
      localQueimado: cl?.local_queimado || null,
      rodasFaltantes: cl?.rodas_faltantes || null,
      observacoes: cl?.observacoes || null,
    },
    
    sinistro: {
      existeOcorrencia: sinistro?.existe_ocorrencia === "1" || sinistro?.existe_ocorrencia === "SIM" || false,
      historico: sinistro?.historico_ocorrencias || []
    }
  };
}

function mapearDebitos(raw: Record<string, any>) {
  const data = raw?.data?.debitos;
  if (!data) return null;

  return {
    totalMultas: formatarBRL(data.totalMultas),
    totalIpva: formatarBRL(data.totalIpva),
    totalLicenciamento: formatarBRL(data.totalLicenciamento),
    totalDpvat: formatarBRL(data.totalDpvat),
    totalGeral: formatarBRL(data.totalGeral),
    totalOutros: formatarBRL(data.totalOutros),
    multas: (data.multas ?? []).map((m: any) => ({
      descricao: m.descricao ?? "—",
      valor: formatarBRL(m.valor),
      dataVencimento: m.dataVencimento ?? "—",
      orgaoEmissor: m.orgaoEmissor ?? "—",
      codigoInfracao: m.codigoInfracao ?? m.codigo ?? null,
      situacao: m.situacao ?? "ATIVO",
    })),
    ipva: (data.ipva ?? []).map((i: any) => ({
      exercicio: i.exercicio ?? "—",
      parcela: i.parcela ?? "—",
      valor: formatarBRL(i.valor),
      dataVencimento: i.dataVencimento ?? "—",
      situacao: i.situacao ?? "ATIVO",
    })),
    licenciamento: (data.licenciamento ?? []).map((l: any) => ({
      exercicio: l.exercicio ?? "—",
      valor: formatarBRL(l.valor),
      dataVencimento: l.dataVencimento ?? "—",
      situacao: l.situacao ?? "ATIVO",
    })),
    dpvat: (data.dpvat ?? []).map((d: any) => ({
      exercicio: d.exercicio ?? "—",
      valor: formatarBRL(d.valor),
      dataVencimento: d.dataVencimento ?? "—",
      situacao: d.situacao ?? "ATIVO",
    })),
  };
}

function mapearHistoricoKm(raw: Record<string, any>) {
  const data = raw?.data;
  if (!data) return null;

  return {
    totalRegistros: data.totalRegistros ?? 0,
    anomalia: data.anomalia ?? false,
    motivoAnomalia: data.motivoAnomalia ?? null,
    registros: (data.registros ?? []).map((r: any) => ({
      data: r.data ?? "—",
      km: r.km ?? 0,
      fonte: r.fonte ?? "—",
      estado: r.estado ?? "—",
    })),
  };
}

function mapearGravame(raw: Record<string, any>) {
  const data = raw?.data;
  if (!data) return null;

  return {
    financiamento: data.financiamento ?? null,
    situacao: data.situacao ?? null,
    agenteFinanceiro: data.agente_financeiro ?? null,
    contratoNumero: data.contrato_numero ?? null,
    dataInclusao: data.data_inclusao ?? null,
  };
}

function mapearRenajud(raw: Record<string, any>) {
  const data = raw?.data;
  if (!data) return null;

  return {
    processo: data.processo ?? null,
    orgaoJudicial: data.orgao_judicial ?? null,
    tribunal: data.tribunal ?? null,
    restricoes: data.restricoes ?? [],
  };
}

function mapearHistoricoFipe(raw: Record<string, any>) {
  // A API fipe-chassi retorna data.fipe ou data.veiculo.fipe como array de FIPEItem
  const items: any[] = raw?.data?.fipe ?? raw?.data?.veiculo?.fipe ?? [];
  if (!items.length) return [];

  return items.map((item: any) => ({
    mes: item.MesReferencia ?? item.mes_referencia ?? "—",
    valor: item.Valor ?? item.valor ?? "—",
    valorFormatado: item.Valor ?? item.valor ?? "—",
    codigoFipe: item.CodigoFipe ?? item.codigo_fipe ?? item.Codigo ?? null,
  }));
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  const cleanPlaca = normalizarPlaca(placa);

  // 1. Verificação de Cache Local
  const cached = cache.get(cleanPlaca);
  if (cached && cached.expiry > Date.now()) {
    console.log(`[snc-autoscore] Cache hit para placa ${cleanPlaca}`);
    return NextResponse.json(cached.data);
  }

  const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";

  // ─── Mocks para Homologação ──────────────────────────────────────────────────
  if (isHomolog) {
    const isClean = cleanPlaca === "XXX0000" || cleanPlaca === "SNC2026";
    
    const mockData = {
      status: {
        csv: "success",
        leilao: "success",
        debitos: "success",
        km: "success",
        gravame: "success",
        renajud: "success",
      },
      identificacao: {
        placa: cleanPlaca,
        marcaModelo: isClean ? "VW/FOX 1.0 GII" : "GM/CHEVROLET TRACKER PREMIER",
        anoFabricacao: isClean ? "2014" : "2020",
        anoModelo: isClean ? "2015" : "2021",
        categoria: "PARTICULAR",
        combustivel: "ALCOOL/GASOLINA",
        municipio: "BELO HORIZONTE",
        uf: "MG",
        statusDescricao: isClean ? "SEM RESTRIÇÃO" : "VEÍCULO COM RESTRIÇÕES",
      },
      dadosTecnicos: {
        cor: isClean ? "VERMELHA" : "PRETA",
        chassi: isClean ? "9BWZZZ377VT000000" : "9BGKSRSB5LS048375",
        marca: isClean ? "VW" : "GM",
        modelo: isClean ? "FOX 1.0 GII" : "TRACKER PREMIER",
        motor: isClean ? "CCC178906" : "Ecotec149283",
        potencia: isClean ? "76CV" : "153CV",
        cilindrada: isClean ? "999" : "1399",
        capacidadePassageiros: "5",
        carroceria: isClean ? "HATCHBACK" : "SUV",
        especie: "PASSAGEIRO",
        tipo: "AUTOMÓVEL",
        procedencia: "NACIONAL",
        eixos: "2",
        pbt: isClean ? "1.280 kg" : "1.847 kg",
        dataEmissaoCrlv: "15/03/2025",
        dataUltimoCrv: "10/09/2024",
      },
      proprietario: {
        nome: isClean ? "JOÃO DA SILVA" : "ANA OLIVEIRA DE MEDEIROS",
        documento: isClean ? "123.***.***-00" : "098.***.***-11",
        renavam: isClean ? "00456789012" : "01298473849",
        municipio: "BELO HORIZONTE",
        uf: "MG",
        crlv: isClean ? "00123456789" : "00984738493",
        dataAtualizacao: "15/03/2025",
        statusDescricao: "SITUAÇÃO REGULAR",
      },
      rouboFurto: {
        declaracao: !isClean,
        devolucao: false,
        recuperacao: !isClean,
      },
      restricoesBin: {
        existeRestricaoGeral: !isClean,
        renajud: false,
        rouboFurto: !isClean,
        veiculoBaixado: false,
        alertaSinistro: !isClean,
        mensagens: isClean ? [] : ["ALERTA DE SINISTRO - SEGURADORA", "VEÍCULO PERICIADO"],
      },
      precificador: [
        {
          anoModelo: isClean ? "2015" : "2021",
          codigo: isClean ? "004123-0" : "005278-7",
          fabricanteModelo: isClean ? "Fox 1.0 GII" : "Tracker Premier 1.4 Turbo",
          informante: "FIPE",
          preco: isClean ? "R$ 38.900,00" : "R$ 119.500,00",
        }
      ],
      historicoFipe: (() => {
        // Gera 12 meses de histórico retroativo com variação realista
        const basePreco = isClean ? 38900 : 119500;
        const meses = [
          "junho/2026", "maio/2026", "abril/2026", "março/2026",
          "fevereiro/2026", "janeiro/2026", "dezembro/2025", "novembro/2025",
          "outubro/2025", "setembro/2025", "agosto/2025", "julho/2025"
        ];
        return meses.map((mes, i) => {
          // Variação gradual: preço cresce ~0.5% ao mês retroativamente
          const fator = 1 - (i * 0.005);
          const valor = Math.round(basePreco * fator);
          const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
          return { mes, valor: String(valor), valorFormatado };
        });
      })(),
      renainf: {
        total: isClean ? "0" : "2",
        ocorrencias: isClean ? [] : [
          {
            auto: "A10892736",
            dataHora: "12/12/2023 14:30:00",
            descricao: "TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ 20%",
            orgao: "DPRF - BRASÍLIA/DF",
            codigo: "74550",
            valor: "R$ 130,16",
            local: "BR 381 KM 480 - CONTAGEM MG",
            valorAnotado: "R$ 130,16",
            situacao: "PAGO",
          },
          {
            auto: "B28938746",
            dataHora: "03/08/2024 09:15:00",
            descricao: "DIRIGIR VEÍCULO MANUSEANDO TELEFONE CELULAR",
            orgao: "DETRAN/MG - BELO HORIZONTE",
            codigo: "76332",
            valor: "R$ 293,47",
            local: "AV AFONSO PENA 1500 - BELO HORIZONTE MG",
            valorAnotado: "R$ 293,47",
            situacao: "EM ABERTO",
          }
        ],
      },
      leilao: isClean ? {
        score: 95,
        scoreLabel: "BAIXO RISCO (A)",
        aceitacao: 95,
        percentualSobreFipe: 98,
        exigeVistoriaEspecial: "NÃO",
        totalLeiloes: 0,
        indicio: false,
        dadosVeiculo: {
          cambio: "MANUAL",
          qtdEixos: "2",
          eixoTraseiro: "SIMPLES",
          kilometragem: "28000"
        },
        historico: [],
        checklist: {
          frente: "ÍNTEGRA",
          traseira: "ÍNTEGRA",
          lateralDireita: "ÍNTEGRA",
          lateralEsquerda: "ÍNTEGRA",
          teto: "ÍNTEGRO",
          interior: "EXCELENTE",
          airbags: "ÍNTEGROS",
          localQueimado: "NÃO",
          rodasFaltantes: "NÃO",
          observacoes: "Nenhuma avaria observada no veículo."
        },
        sinistro: { existeOcorrencia: false, historico: [] }
      } : {
        score: 42,
        scoreLabel: "ALTO RISCO (D)",
        aceitacao: 35,
        percentualSobreFipe: 52,
        exigeVistoriaEspecial: "SIM",
        totalLeiloes: 1,
        indicio: true,
        dadosVeiculo: {
          cambio: "AUTOMÁTICO",
          qtdEixos: "2",
          eixoTraseiro: "SIMPLES",
          kilometragem: "12500"
        },
        historico: [
          {
            data: "27/09/2022",
            leiloeiro: "BETA LEILÕES S/A",
            lote: "512",
            comitente: "SULAMÉRICA COMPANHIA NACIONAL DE SEGUROS",
            patio: "CONTAGEM - MG",
            valorArremate: "R$ 68.500,00",
            condicaoGeral: "RECUPERADO DE SINISTRO (MÉDIA MONTA - COLISÃO)",
            condicaoMotor: "FUNCIONANDO (TESTADO NO PÁTIO, PORÉM COM VAZAMENTO DE ÓLEO NO CARTER)",
            condicaoMecanica: "AVARIADA (PONTAS DE EIXO DIANTEIRO ESQUERDO E BALANÇAS EMPENADAS)",
            condicaoCambio: "FUNCIONANDO (TRANSMISSÃO AUTOMÁTICA ENGATANDO, SEM VAZAMENTOS)",
            situacaoChassi: "ÍNTEGRO (SEM SINAIS DE ADULTERAÇÃO, MAS COM CORTE NA COLUNA B)",
            observacoes: "Veículo com danos estruturais severos na parte frontal e lateral esquerda. Airbags frontal e cortina acionados. Vidro para-brisa trincado. Radiador e condensador perfurados. Sem chave reserva e sem manual de proprietário. Regularização do CSV (Certificado de Segurança Veicular) por conta do arrematante.",
            imagens: [
              "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=400&h=250&q=80",
              "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&h=250&q=80"
            ]
          }
        ],
        checklist: {
          frente: "AVARIADA (MÉDIA)",
          traseira: "ÍNTEGRA",
          lateralDireita: "RISCADA",
          lateralEsquerda: "ÍNTEGRA",
          teto: "ÍNTEGRO",
          interior: "QUEIMADO",
          airbags: "ACIONADOS",
          localQueimado: "SIM",
          rodasFaltantes: "NÃO",
          observacoes: "Chassi regravado. Motor substituído. Airbags acionados."
        },
        sinistro: {
          existeOcorrencia: true,
          historico: [
            {
              data: "15/06/2022",
              tipo: "COLISÃO",
              seguradora: "SULAMÉRICA",
              valor: "R$ 58.000,00",
              situacao: "INDENIZAÇÃO INTEGRAL",
              descricao: "MÉDIA MONTA CONSTATADA POR PERÍCIA"
            }
          ]
        }
      },
      debitos: {
        totalMultas: isClean ? "R$ 0,00" : "R$ 423,63",
        totalIpva: isClean ? "R$ 0,00" : "R$ 2.689,20",
        totalLicenciamento: isClean ? "R$ 0,00" : "R$ 262,71",
        totalDpvat: "R$ 0,00",
        totalOutros: isClean ? "R$ 0,00" : "R$ 558,30",
        totalGeral: isClean ? "R$ 0,00" : "R$ 3.933,84",
        multas: isClean ? [] : [
          {
            descricao: "TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ 20%",
            valor: "R$ 130,16",
            dataVencimento: "20/02/2024",
            orgaoEmissor: "DPRF",
            codigoInfracao: "74550",
            situacao: "EM ABERTO"
          },
          {
            descricao: "DIRIGIR VEÍCULO MANUSEANDO TELEFONE CELULAR",
            valor: "R$ 293,47",
            dataVencimento: "15/10/2024",
            orgaoEmissor: "DETRAN/MG",
            codigoInfracao: "76332",
            situacao: "EM ABERTO"
          }
        ],
        ipva: isClean ? [] : [
          { exercicio: "2026", parcela: "ÚNICA", valor: "R$ 2.689,20", dataVencimento: "15/03/2026", situacao: "EM ABERTO" }
        ],
        licenciamento: isClean ? [] : [
          { exercicio: "2025", valor: "R$ 262,71", dataVencimento: "30/04/2025", situacao: "EM ABERTO" }
        ],
        dpvat: [],
        outrosDebitos: isClean ? [] : [
          {
            descricao: "TAXA DE VISTORIA CAUTELAR",
            valor: "R$ 198,30",
            dataVencimento: "10/11/2024",
            orgaoEmissor: "DETRAN/MG",
            situacao: "EM ABERTO"
          },
          {
            descricao: "DIÁRIAS DE PÁTIO — REMOÇÃO ADMINISTRATIVA",
            valor: "R$ 360,00",
            dataVencimento: "05/01/2025",
            orgaoEmissor: "DETRAN/MG",
            situacao: "EM ABERTO"
          }
        ]
      },
      historicoKm: {
        totalRegistros: 4,
        anomalia: isClean ? false : true,
        motivoAnomalia: isClean ? null : "QUILOMETRAGEM REVERTIDA — POSSÍVEL ADULTERAÇÃO DE HODÔMETRO",
        registros: [
          { data: "15/03/2025", km: isClean ? 58000 : 42000, fonte: "DETRAN (CRLV-e)", estado: "MG" },
          { data: "10/01/2024", km: isClean ? 45000 : 15200, fonte: "VISTORIA CAUTELAR", estado: "MG" },
          { data: "08/11/2022", km: isClean ? 32000 : 18000, fonte: "SEGURADORA", estado: "MG" },
          { data: "22/10/2022", km: isClean ? 28000 : 12500, fonte: isClean ? "OFICINA" : "LEILÃO", estado: "MG" }
        ]
      },
      recall: {
        total: isClean ? "0" : "1",
        ocorrencias: isClean ? [] : [
          {
            fabricante: "GM DO BRASIL",
            campanha: "RECALL SENSOR DE IMPACTO",
            defeito: "SINAL INCORRETO DO SENSOR DE IMPACTO DO AIRBAG LATERAL",
            situacao: "NÃO ATENDIDO"
          }
        ]
      },
      pdf: "https://api-csv-renainf-renajud-bin-proprietario.apiveiculos.com.br/pdf/mockpdf",
      gravame: {
        financiamento: isClean ? null : "SIM",
        situacao: isClean ? "SEM GRAVAME" : "ATIVO",
        agenteFinanceiro: isClean ? null : "BANCO BRADESCO S.A.",
        contratoNumero: isClean ? null : "202100483726",
        dataInclusao: isClean ? null : "15/09/2021",
      },
      renajudDetalhes: isClean ? null : {
        processo: "0012345-67.2023.8.13.0024",
        orgaoJudicial: "VARA CÍVEL DE BELO HORIZONTE",
        tribunal: "TJMG",
        restricoes: ["APREENSÃO", "TRANSFERÊNCIA"],
      },
      historicoProprietarios: isClean
        ? [
            { nome: "CARLOS ALBERTO SOUZA", documento: "045.***.***-89", municipio: "CONTAGEM", uf: "MG", dataAtualizacao: "10/03/2018" },
          ]
        : [
            { nome: "CARLOS ALBERTO SOUZA",     documento: "045.***.***-89", municipio: "CONTAGEM",        uf: "MG", dataAtualizacao: "10/03/2018" },
            { nome: "DISTRIBUIDORA JR LTDA",     documento: "12.***.***/0001-44", municipio: "BELO HORIZONTE", uf: "MG", dataAtualizacao: "22/07/2019" },
            { nome: "PAULO HENRIQUE FERREIRA",   documento: "078.***.***-12", municipio: "BELO HORIZONTE", uf: "MG", dataAtualizacao: "15/09/2021" },
          ],
    };

    cache.set(cleanPlaca, { data: mockData, expiry: Date.now() + CACHE_TTL_MS });
    return NextResponse.json(mockData);
  }

  // ─── Chamadas de Produção Reais (Graceful Degradation) ───────────────────────
  try {
    const [csvRes, leilaoRes, debitosRes, kmRes, gravameRes, renajudRes, fipeRes, propriaRes] = await Promise.allSettled([
      consultarCsvCompleta(cleanPlaca),
      consultarLeilaoScore(cleanPlaca),
      consultarDebitosV4(cleanPlaca),
      consultarHistoricoKm(cleanPlaca),
      consultarGravame(cleanPlaca),
      consultarRenajud(cleanPlaca),
      consultarPlacaFIPE(cleanPlaca),
      consultarAgregadosPropria(cleanPlaca),
    ]);

    // O CSV Completa é considerado a âncora principal do AutoScore (BIN + Ficha + Proprietário)
    if (csvRes.status === "rejected") {
      throw csvRes.reason;
    }

    const csvData = mapearCsvCompleta(csvRes.value as any);

    let historicoFipeData: any[] = [];
    if (fipeRes.status === "fulfilled") {
      historicoFipeData = mapearHistoricoFipe(fipeRes.value as any);
    } else {
      console.warn(`[snc-autoscore] fipe-chassi falhou para ${cleanPlaca}:`, fipeRes.reason);
    }

    let leilaoData = null;
    if (leilaoRes.status === "fulfilled") {
      leilaoData = mapearLeilao(leilaoRes.value as any);
    } else {
      console.warn(`[snc-autoscore] leilao-score falhou para ${cleanPlaca}:`, leilaoRes.reason);
    }

    let debitosData = null;
    if (debitosRes.status === "fulfilled") {
      debitosData = mapearDebitos(debitosRes.value as any);
    } else {
      console.warn(`[snc-autoscore] debitos-v4 falhou para ${cleanPlaca}:`, debitosRes.reason);
    }

    let kmData = null;
    if (kmRes.status === "fulfilled") {
      kmData = mapearHistoricoKm(kmRes.value as any);
    } else {
      console.warn(`[snc-autoscore] historico-km falhou para ${cleanPlaca}:`, kmRes.reason);
    }

    let gravameData = null;
    if (gravameRes.status === "fulfilled") {
      gravameData = mapearGravame(gravameRes.value as any);
    } else {
      console.warn(`[snc-autoscore] gravame falhou para ${cleanPlaca}:`, gravameRes.reason);
    }

    let renajudData = null;
    if (renajudRes.status === "fulfilled") {
      renajudData = mapearRenajud(renajudRes.value as any);
    } else {
      console.warn(`[snc-autoscore] renajud falhou para ${cleanPlaca}:`, renajudRes.reason);
    }

    // ── Antigos Proprietários (Agregados Propria) ──
    let historicoProprietariosData: any[] = [];
    if (propriaRes.status === "fulfilled") {
      const raw = (propriaRes.value as any)?.data;
      const lista = raw?.proprietarios ?? raw?.historico_proprietarios ?? raw?.antigos_proprietarios ?? [];
      historicoProprietariosData = Array.isArray(lista)
        ? lista.map((p: any) => ({
            nome:            p.nome ?? p.proprietario_nome ?? "—",
            documento:       p.documento ?? p.proprietario_documento ?? "—",
            municipio:       p.municipio ?? "—",
            uf:              p.uf ?? "—",
            dataAtualizacao: p.data_atualizacao ?? p.dataAtualizacao ?? "—",
          }))
        : [];
    } else {
      console.warn(`[snc-autoscore] agregados-propria falhou para ${cleanPlaca}:`, propriaRes.reason);
    }

    const responseData = {
      status: {
        csv: "success",
        leilao: leilaoRes.status === "fulfilled" ? "success" : "failed",
        debitos: debitosRes.status === "fulfilled" ? "success" : "failed",
        km: kmRes.status === "fulfilled" ? "success" : "failed",
        gravame: gravameRes.status === "fulfilled" ? "success" : "failed",
        renajud: renajudRes.status === "fulfilled" ? "success" : "failed",
        fipe: fipeRes.status === "fulfilled" ? "success" : "failed",
        agregadosPropria: propriaRes.status === "fulfilled" ? "success" : "failed",
      },
      identificacao: csvData.identificacao,
      dadosTecnicos: csvData.dadosTecnicos,
      proprietario: csvData.proprietario,
      rouboFurto: csvData.rouboFurto,
      restricoesBin: csvData.restricoesBin,
      precificador: csvData.precificador,
      historicoFipe: historicoFipeData,
      renainf: csvData.renainf,
      recall: csvData.recall,
      leilao: leilaoData,
      debitos: debitosData,
      historicoKm: kmData,
      pdf: csvData.pdf,
      gravame: gravameData,
      renajudDetalhes: renajudData,
      historicoProprietarios: historicoProprietariosData,
    };

    // Salva no cache
    cache.set(cleanPlaca, { data: responseData, expiry: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(responseData);

  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/snc-autoscore] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/snc-autoscore]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
