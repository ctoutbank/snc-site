import { NextRequest, NextResponse } from "next/server";
import { consultarVipCar, consultarPlacaFIPE, consultarProprietarioAtual, consultarLeilaoScore, APIBrasilError } from "@/lib/apibrasil";

// ─── Estrutura real confirmada em homolog ─────────────────────────────────────
// _raw.data.veicular:
//   bin_nacional, historico_roubo_furto, precificador, renainf
// _raw.data.pdf

interface BinNacional {
  ano_fabricacao?: string;
  ano_modelo?: string;
  categoria_veiculo?: string;
  combustivel?: string;
  marca_modelo?: string;
  municipio?: string;
  placa?: string;
  status_retorno?: { codigo?: string; descricao?: string };
}

interface Renainfracao {
  auto_infracao?: string;
  data_infracao?: string;
  descricao?: string;
  orgao_atuador?: string;
  detalhes?: {
    dados_notificacao?: {
      codigo_infracao?: string;
      placa?: string;
      valor_infracao?: string;
    };
  };
}

interface PrecificadorOcorrencia {
  ano_modelo?: string;
  codigo?: string;
  fabricante_modelo?: string;
  informante?: string;
  preco?: string;
}

interface Veicular {
  bin_nacional?: BinNacional;
  historico_roubo_furto?: {
    indicador?: {
      houve_declaracao_de_roubo_furto?: string;
      houve_devolucao_de_roubo_furto?: string;
      houve_recuperacao_de_roubo_furto?: string;
    };
    status_retorno?: { codigo?: string; descricao?: string };
  };
  precificador?: {
    ocorrencias?: PrecificadorOcorrencia[];
    status_retorno?: { codigo?: string; descricao?: string };
  };
  renainf?: {
    ocorrencias?: Renainfracao[];
    qtd_ocorrencias?: string;
    status_retorno?: { codigo?: string; descricao?: string };
  };
  [key: string]: unknown;
}

function formatarBRL(valor?: string): string {
  if (!valor) return "—";
  const num = parseFloat(valor.replace(",", "."));
  if (isNaN(num)) return valor;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function mapearVipCar(raw: Record<string, unknown>) {
  const data     = raw?.data as Record<string, unknown> | undefined;
  const veicular = data?.veicular as Veicular | undefined;
  const pdf      = (data?.pdf as string) ?? null;

  const bin = veicular?.bin_nacional;

  const identificacao = bin ? {
    placa:          bin.placa ?? null,
    marcaModelo:    bin.marca_modelo ?? null,
    anoFabricacao:  bin.ano_fabricacao ?? null,
    anoModelo:      bin.ano_modelo ?? null,
    categoria:      bin.categoria_veiculo ?? null,
    combustivel:    bin.combustivel ?? null,
    municipio:      bin.municipio ?? null,
    statusDescricao: bin.status_retorno?.descricao ?? null,
  } : null;

  const rouboFurto = veicular?.historico_roubo_furto?.indicador
    ? {
        declaracao:  veicular.historico_roubo_furto.indicador.houve_declaracao_de_roubo_furto === "1",
        devolucao:   veicular.historico_roubo_furto.indicador.houve_devolucao_de_roubo_furto === "1",
        recuperacao: veicular.historico_roubo_furto.indicador.houve_recuperacao_de_roubo_furto === "1",
      }
    : null;

  const precificador = (veicular?.precificador?.ocorrencias ?? []).map((o) => ({
    anoModelo:       o.ano_modelo ?? "—",
    codigo:          o.codigo ?? "—",
    fabricanteModelo: o.fabricante_modelo ?? "—",
    informante:      o.informante ?? "—",
    preco:           formatarBRL(o.preco),
  }));

  const renainf = {
    total:       veicular?.renainf?.qtd_ocorrencias ?? "0",
    ocorrencias: (veicular?.renainf?.ocorrencias ?? []).map((o) => ({
      auto:        o.auto_infracao ?? "—",
      dataHora:    o.data_infracao ?? "—",
      descricao:   o.descricao ?? "—",
      orgao:       o.orgao_atuador ?? "—",
      codigo:      o.detalhes?.dados_notificacao?.codigo_infracao ?? "—",
      valor:       o.detalhes?.dados_notificacao?.valor_infracao
                     ? `R$ ${o.detalhes.dados_notificacao.valor_infracao}`
                     : "—",
    })),
  };

  return { identificacao, rouboFurto, precificador, renainf, pdf };
}

// ─── Mapear dados do fipe-chassi ──────────────────────────────────────────────
interface ResultadoFipe {
  anoFabricacao?: number;
  anoModelo?: string | number;
  categoria?: string;
  chassi?: string;
  codigoFipe?: string;
  combustivel?: string;
  cor?: string;
  marca?: string;
  modelo?: string;
  principal?: boolean;
  valor?: number;
  historico?: { mes: string; valor: number }[];
  extra?: {
    categoria?: { descricao: string; sintetico: string };
    combustivel?: { descricao: string; sintetico: string };
  };
  [key: string]: unknown;
}

function mapearFipeChassi(raw: Record<string, unknown>) {
  const data = raw?.data as Record<string, unknown> | undefined;
  const resultados = (data?.resultados as ResultadoFipe[]) ?? [];
  const principal = resultados.find((r) => r.principal === true) ?? resultados[0];

  if (!principal) return { dadosTecnicos: null };

  return {
    dadosTecnicos: {
      cor: principal.cor ?? null,
      chassi: principal.chassi ?? null,
      marca: principal.marca ?? null,
      modelo: principal.modelo ?? null,
      anoFabricacao: principal.anoFabricacao ?? null,
      anoModelo: principal.anoModelo ?? null,
      combustivel: principal.combustivel ?? null,
      categoria: principal.categoria ?? null,
      // Campos extras vindos do objeto raiz (se existirem)
      motor: (principal as Record<string, unknown>).motor ?? null,
      potencia: (principal as Record<string, unknown>).potencia ?? null,
      cilindrada: (principal as Record<string, unknown>).cilindrada ?? null,
      capacidadePassageiros: (principal as Record<string, unknown>).capacidadePassageiros ?? null,
      carroceria: (principal as Record<string, unknown>).carroceria ?? null,
      especie: (principal as Record<string, unknown>).especie ?? null,
      tipo: (principal as Record<string, unknown>).tipo ?? null,
      procedencia: (principal as Record<string, unknown>).procedencia ?? null,
    },
  };
}

// ─── Mapear dados do proprietário ─────────────────────────────────────────────
interface ProprietarioRaw {
  proprietario_nome?: string;
  proprietario_documento?: string;
  placa?: string;
  renavam?: string;
  municipio?: string;
  uf?: string;
  marca_modelo?: string;
  ano_fabricacao?: string;
  ano_modelo?: string;
  cor_veiculo?: string;
  combustivel?: string;
  motor?: string;
  chassi?: string;
  crlv?: string;
  data_atualizacao?: string;
  status_retorno?: { codigo?: string; descricao?: string };
}

function mapearProprietarioParaVipCar(raw: Record<string, unknown>) {
  const data = raw?.data as Record<string, unknown> | undefined;
  const veicular = data?.veicular as Record<string, unknown> | undefined;
  const p = veicular?.proprietario_atual_veiculo as ProprietarioRaw | undefined;

  if (!p) return { proprietario: null };

  return {
    proprietario: {
      nome: p.proprietario_nome ?? null,
      documento: p.proprietario_documento ?? null,
      renavam: p.renavam ?? null,
      municipio: p.municipio ?? null,
      uf: p.uf ?? null,
      cor: p.cor_veiculo ?? null,
      motor: p.motor ?? null,
      chassi: p.chassi ?? null,
      crlv: p.crlv ?? null,
      dataAtualizacao: p.data_atualizacao ?? null,
      statusDescricao: p.status_retorno?.descricao ?? null,
    },
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  try {
    // Chamadas paralelas — se fipe, proprietário ou leilão falhar, o relatório funciona com VIP Car
    const [vipRes, fipeRes, propRes, leilaoRes] = await Promise.allSettled([
      consultarVipCar(placa),
      consultarPlacaFIPE(placa),
      consultarProprietarioAtual(placa),
      consultarLeilaoScore(placa),
    ]);

    // VIP Car é obrigatório
    if (vipRes.status === "rejected") throw vipRes.reason;
    const vipRaw = vipRes.value;
    const mapeado = mapearVipCar(vipRaw as unknown as Record<string, unknown>);

    // FIPE-Chassi (opcional — graceful degradation)
    let dadosTecnicos = null;
    if (fipeRes.status === "fulfilled") {
      const fipeMapeado = mapearFipeChassi(fipeRes.value as unknown as Record<string, unknown>);
      dadosTecnicos = fipeMapeado.dadosTecnicos;
    } else {
      console.warn("[vip-car] fipe-chassi falhou:", fipeRes.reason);
    }

    // Proprietário (opcional — graceful degradation)
    let proprietario = null;
    if (propRes.status === "fulfilled") {
      const propMapeado = mapearProprietarioParaVipCar(propRes.value as unknown as Record<string, unknown>);
      proprietario = propMapeado.proprietario;
    } else {
      console.warn("[vip-car] proprietario falhou:", propRes.reason);
    }

    // Leilão com Score (opcional — graceful degradation)
    let leilao = null;
    if (leilaoRes.status === "fulfilled") {
      leilao = (leilaoRes.value as Record<string, unknown>)?.data ?? null;
    } else {
      console.warn("[vip-car] leilao-score falhou:", leilaoRes.reason);
    }

    const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";

    // Em HML, forçar dados mock completos (API retorna dados genéricos/vazios)
    const mockDadosTecnicos = {
      cor: "VERMELHA",
      chassi: "9BWZZZ377VT004251",
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
    };

    const mockProprietario = {
      nome: "João da Silva",
      documento: "123.456.789-00",
      renavam: "00456789012",
      municipio: "BELO HORIZONTE",
      uf: "MG",
      cor: "VERMELHA",
      motor: "CCC178906",
      chassi: "9BWZZZ377VT004251",
      crlv: "00123456789",
      dataAtualizacao: "15/03/2025",
      statusDescricao: "SEM RESTRIÇÃO",
    };

    const mockLeilao = {
      score: 68,
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
        },
        {
          data: "05/06/2020",
          leiloeiro: "GAMMA LEILÕES",
          lote: "74",
          comitente: "PORTO SEGURO CIA DE SEGUROS",
          patio: "BETIM - MG",
          valorArremate: "R$ 31.200,00",
          condicaoGeral: "RECUPERADO DE FINANCIAMENTO",
          situacaoChassi: "ÍNTEGRO",
        }
      ],
    };

    if (isHomolog) {
      // Injetar dados ricos de roubo/furto no mapeado
      mapeado.rouboFurto = {
        declaracao: true,
        devolucao: false,
        recuperacao: true,
      };

      // Injetar dados ricos de infrações (RENAINF) no mapeado
      mapeado.renainf = {
        total: "3",
        ocorrencias: [
          {
            auto: "A10892736",
            dataHora: "12/12/2021 14:30:00",
            descricao: "TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ 20%",
            orgao: "DPRF - BRASÍLIA/DF",
            codigo: "74550",
            valor: "R$ 130,16",
          },
          {
            auto: "B28938746",
            dataHora: "03/08/2020 09:15:00",
            descricao: "DIRIGIR VEÍCULO MANUSEANDO TELEFONE CELULAR",
            orgao: "DETRAN/MG - BELO HORIZONTE",
            codigo: "76332",
            valor: "R$ 293,47",
          },
          {
            auto: "C92837462",
            dataHora: "15/01/2019 18:45:00",
            descricao: "ESTACIONAR EM DESACORDO COM A REGULAMENTAÇÃO",
            orgao: "BHTRANS - BELO HORIZONTE/MG",
            codigo: "55412",
            valor: "R$ 195,23",
          },
        ],
      };
    }

    return NextResponse.json({
      ...mapeado,
      dadosTecnicos: isHomolog ? mockDadosTecnicos : (dadosTecnicos ?? null),
      proprietario: isHomolog ? mockProprietario : (proprietario ?? null),
      leilao: isHomolog ? mockLeilao : (leilao ?? null),
      _raw: vipRaw,
    });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/vip-car] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/vip-car]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

