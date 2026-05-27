import { NextRequest, NextResponse } from "next/server";
import { consultarLeilaoScore, APIBrasilError } from "@/lib/apibrasil";

// ─── Interfaces da resposta real ──────────────────────────────────────────────

interface LeilaoOcorrencia {
  data_leilao?: string;
  leiloeiro?: string;
  lote?: string;
  comitente?: string;
  patio?: string;
  condicao_geral_veiculo?: string;
  condicao_motor?: string;
  condicao_mecanica?: string;
  condicao_cambio?: string;
  situacao_chassi?: string;
  observacoes?: string;
  imagens?: string[];
}

interface LeilaoScore {
  aceitacao?: string;
  descricao_pontuacao?: string;
  exige_vistoria_especial?: string;
  percentual_sobre_tabela_referencia?: string;
  pontuacao?: string;
}

interface DadosVeiculo {
  ano_fabricacao?: string;
  ano_modelo?: string;
  cambio?: string;
  carroceria?: string;
  categoria?: string;
  chassi?: string;
  combustivel?: string;
  cor?: string;
  eixo_traseiro?: string;
  kilometragem?: string;
  marca_modelo?: string;
  motor?: string;
  placa?: string;
  qtd_eixos?: string;
  renavam?: string;
}

interface CheckListVeiculo {
  existe_informacao?: string;
  airbags_rompidos?: string;
  frente?: { codigo?: string; descricao?: string };
  traseira?: { codigo?: string; descricao?: string };
  lateral_direita?: { codigo?: string; descricao?: string };
  lateral_esquerda?: { codigo?: string; descricao?: string };
  teto?: { codigo?: string; descricao?: string };
  interior?: { codigo?: string; descricao?: string };
  local_queimado?: string;
  rodas_faltantes?: string;
  observacoes?: string;
}

interface LeilaoRaw {
  dados_veiculo?: DadosVeiculo;
  ocorrencias?: LeilaoOcorrencia[];
  quantidade_ocorrencias?: string;
  score?: LeilaoScore;
  check_list_veiculo?: CheckListVeiculo;
  status_retorno?: { codigo?: string; descricao?: string };
}

interface IndicioSinistro {
  descricao_ocorrencia?: string;
  existe_ocorrencia?: string;
  status_retorno?: { codigo?: string; descricao?: string };
}

// ─── Mapeamento ───────────────────────────────────────────────────────────────

function mapearLeilao(raw: Record<string, unknown>) {
  const data = raw?.data as Record<string, unknown> | undefined;
  const veicular = data?.veicular as Record<string, unknown> | undefined;
  const leilao = veicular?.leilao as LeilaoRaw | undefined;
  const sinistro = veicular?.indicio_sinistro as IndicioSinistro | undefined;

  if (!leilao) return null;

  const dv = leilao.dados_veiculo;
  const sc = leilao.score;
  const cl = leilao.check_list_veiculo;

  return {
    // Score
    score: {
      pontuacao: sc?.pontuacao ?? null,
      aceitacao: sc?.aceitacao ?? null,
      descricaoPontuacao: sc?.descricao_pontuacao ?? null,
      exigeVistoriaEspecial: sc?.exige_vistoria_especial ?? null,
      percentualSobreFipe: sc?.percentual_sobre_tabela_referencia ?? null,
    },

    // Dados do veículo no leilão
    dadosVeiculo: dv ? {
      placa: dv.placa ?? null,
      marcaModelo: dv.marca_modelo ?? null,
      anoFabricacao: dv.ano_fabricacao ?? null,
      anoModelo: dv.ano_modelo ?? null,
      chassi: dv.chassi ?? null,
      renavam: dv.renavam ?? null,
      cor: dv.cor ?? null,
      combustivel: dv.combustivel ?? null,
      motor: dv.motor ?? null,
      cambio: dv.cambio ?? null,
      carroceria: dv.carroceria ?? null,
      categoria: dv.categoria ?? null,
      kilometragem: dv.kilometragem ?? null,
      qtdEixos: dv.qtd_eixos ?? null,
      eixoTraseiro: dv.eixo_traseiro ?? null,
    } : null,

    // Indício de sinistro
    sinistro: sinistro ? {
      existeOcorrencia: sinistro.existe_ocorrencia === "1",
      descricao: sinistro.descricao_ocorrencia ?? null,
    } : null,

    // Checklist do veículo
    checkList: cl ? {
      airbags: cl.airbags_rompidos || null,
      frente: cl.frente?.descricao || null,
      traseira: cl.traseira?.descricao || null,
      lateralDireita: cl.lateral_direita?.descricao || null,
      lateralEsquerda: cl.lateral_esquerda?.descricao || null,
      teto: cl.teto?.descricao || null,
      interior: cl.interior?.descricao || null,
      localQueimado: cl.local_queimado || null,
      rodasFaltantes: cl.rodas_faltantes || null,
      observacoes: cl.observacoes || null,
    } : null,

    // Ocorrências de leilão
    totalOcorrencias: parseInt(leilao.quantidade_ocorrencias ?? "0", 10),
    ocorrencias: (leilao.ocorrencias ?? []).map((o) => ({
      dataLeilao: o.data_leilao ?? "—",
      leiloeiro: o.leiloeiro ?? "—",
      lote: o.lote ?? "—",
      comitente: o.comitente ?? "—",
      patio: o.patio ?? "—",
      condicaoGeral: o.condicao_geral_veiculo ?? "—",
      condicaoMotor: o.condicao_motor ?? "—",
      condicaoMecanica: o.condicao_mecanica ?? "—",
      condicaoCambio: o.condicao_cambio ?? "—",
      situacaoChassi: o.situacao_chassi ?? "—",
      observacoes: o.observacoes ?? "—",
      imagens: o.imagens ?? [],
    })),

    // Histórico de sinistros (registros detalhados)
    historicoSinistros: [] as { data: string; tipo: string; seguradora: string; valor: string; situacao: string; descricao: string }[],
  };
}

// ─── Mock checklist para HML ──────────────────────────────────────────────────

const mockCheckList = {
  airbags: "NÃO ROMPIDOS",
  frente: "AVARIA MÉDIA",
  traseira: "SEM AVARIA",
  lateralDireita: "AVARIA LEVE — RISCO SUPERFICIAL",
  lateralEsquerda: "SEM AVARIA",
  teto: "SEM AVARIA",
  interior: "DESGASTE NATURAL",
  localQueimado: "NÃO IDENTIFICADO",
  rodasFaltantes: "NENHUMA",
  observacoes: "VEÍCULO EM CONDIÇÕES REGULARES PARA CIRCULAÇÃO",
};

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();
  const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  try {
    const raw = await consultarLeilaoScore(placa);
    const leilao = mapearLeilao(raw as unknown as Record<string, unknown>);

    if (isHomolog && leilao) {
      leilao.dadosVeiculo = {
        placa: placa.toUpperCase(),
        marcaModelo: "CHEVROLET/PRISMA ELX",
        anoFabricacao: "2019",
        anoModelo: "2020",
        chassi: "9BWZZZ99Z99999999",
        renavam: "123456789",
        cor: "PRATA",
        combustivel: "FLEX",
        motor: "12345678",
        cambio: "MANUAL",
        carroceria: "SEDAN",
        categoria: "PARTICULAR",
        kilometragem: "45000",
        qtdEixos: "2",
        eixoTraseiro: "SIMPLES",
      };
      leilao.checkList = mockCheckList;
      leilao.sinistro = {
        existeOcorrencia: true,
        descricao: "SINISTRO PARCIAL — COLISÃO FRONTAL REGISTRADA EM 12/2021",
      };
      leilao.historicoSinistros = [
        {
          data: "12/12/2021",
          tipo: "COLISÃO FRONTAL",
          seguradora: "PORTO SEGURO S/A",
          valor: "R$ 18.500,00",
          situacao: "INDENIZADO PARCIAL",
          descricao: "DANOS NA PARTE FRONTAL — PARA-CHOQUE, CAPÔ E FARÓIS",
        },
        {
          data: "03/08/2020",
          tipo: "ALAGAMENTO",
          seguradora: "BRADESCO SEGUROS",
          valor: "R$ 7.200,00",
          situacao: "INDENIZADO PARCIAL",
          descricao: "INFILTRAÇÃO NO PAINEL E MÓDULO ELETRÔNICO",
        },
        {
          data: "15/01/2019",
          tipo: "COLISÃO TRASEIRA",
          seguradora: "LIBERTY SEGUROS",
          valor: "R$ 4.800,00",
          situacao: "REPARADO",
          descricao: "DANOS LEVES — PARA-CHOQUE TRASEIRO E LANTERNA",
        },
      ];
      leilao.totalOcorrencias = 4;
      leilao.ocorrencias = [
        {
          dataLeilao: "14/03/2022",
          leiloeiro: "ALFA LEILÕES LTDA",
          lote: "208",
          comitente: "BANCO CENTRAL S/A",
          patio: "CURITIBA-PR",
          condicaoGeral: "REGULAR",
          condicaoMotor: "FUNCIONANDO",
          condicaoMecanica: "VERIFICAR",
          condicaoCambio: "VERIFICAR",
          situacaoChassi: "ÍNTEGRO",
          observacoes: "VEÍCULO APTO PARA CIRCULAÇÃO COM RESSALVAS",
          imagens: [],
        },
        {
          dataLeilao: "27/09/2021",
          leiloeiro: "BETA LEILÕES",
          lote: "512",
          comitente: "SEGURADORA PREMIUM LTDA",
          patio: "LONDRINA-PR",
          condicaoGeral: "AVARIADO",
          condicaoMotor: "NÃO FUNCIONA",
          condicaoMecanica: "COMPROMETIDA",
          condicaoCambio: "N/C",
          situacaoChassi: "ÍNTEGRO",
          observacoes: "SINISTRO PARCIAL — COLISÃO FRONTAL",
          imagens: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
        },
        {
          dataLeilao: "05/06/2020",
          leiloeiro: "GAMMA LEILÕES S/A",
          lote: "74",
          comitente: "TRANSPORTES RODOVIÁRIOS ME",
          patio: "MARINGÁ-PR",
          condicaoGeral: "BOM",
          condicaoMotor: "FUNCIONANDO",
          condicaoMecanica: "BOM ESTADO",
          condicaoCambio: "BOM ESTADO",
          situacaoChassi: "NÃO DIVULGADO",
          observacoes: "",
          imagens: [],
        },
        {
          dataLeilao: "18/07/2019",
          leiloeiro: "DELTA LEILÕES",
          lote: "940",
          comitente: "JUSTIÇA FEDERAL — 3ª VARA",
          patio: "SÃO PAULO-SP",
          condicaoGeral: "SUCATA",
          condicaoMotor: "INOPERANTE",
          condicaoMecanica: "COMPROMETIDA",
          condicaoCambio: "AVARIADO",
          situacaoChassi: "ADULTERADO",
          observacoes: "VEÍCULO PARA DESMONTE — SEM CONDIÇÕES DE CIRCULAÇÃO",
          imagens: ["https://example.com/img3.jpg"],
        },
      ];
    }

    return NextResponse.json({
      leilao,
      _raw: raw,
    });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/leilao-score] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/leilao-score]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
