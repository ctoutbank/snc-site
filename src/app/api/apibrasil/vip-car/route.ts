import { NextRequest, NextResponse } from "next/server";
import { consultarVipCar, APIBrasilError } from "@/lib/apibrasil";

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  try {
    const raw    = await consultarVipCar(placa);
    const mapeado = mapearVipCar(raw as unknown as Record<string, unknown>);
    return NextResponse.json({ ...mapeado, _raw: raw });
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
