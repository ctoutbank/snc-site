import { NextRequest, NextResponse } from "next/server";
import { consultarSCRScore, APIBrasilError } from "@/lib/apibrasil";

// ─── Tipos internos da resposta real da APIBrasil ───────────────────────────
interface Vencimento {
  codigo: string;
  descricao: string;
  percentual: string;
  qtdMeses: string;
  restritivo: string;
  valor: string;
}

interface Operacao {
  modalidade: string;
  subModalidade: string;
  percentual: string;
  total: string;
  variacaoCambial: string;
  vencimentos: Vencimento[];
}

interface CreditoConsolidado {
  operacoes: { descricao: string; percentual: string; qtdMeses: string; valor: string }[];
  percentual: string;
  valor: string;
}

interface SCRBacenRaw {
  consolidado: {
    creditoAVencer: CreditoConsolidado;
    creditoVencido: CreditoConsolidado;
    limiteCredito: CreditoConsolidado;
    prejuizo: CreditoConsolidado;
  };
  operacoes: Operacao[];
  score: { FAIXA: string; PONTUACAO: string };
  quantidadeInstituicoes: string;
  quantidadeOperacoes: string;
  quantidadeOperacoesDiscordancia: string;
  databaseConsultada: string;
  dataInicioRelacionamento: string;
  documento: string;
  tipoDocumento: string;
  responsabilidadeTotalDiscordancia: string;
  responsabilidadeTotalSubjudice: string;
  coobrigacaoAssumida: string;
  coobrigacaoRecebida: string;
}

// ─── Mapeamento para o formato esperado pelo frontend ───────────────────────
function mapearResposta(raw: Record<string, unknown>) {
  const scrBacen = (raw?.data as Record<string, unknown>)?.scrBacen as SCRBacenRaw | undefined;

  if (!scrBacen) return { scr: {}, score: {} };

  const scr = {
    totalAVencer: scrBacen.consolidado?.creditoAVencer?.valor ?? "—",
    totalVencido: scrBacen.consolidado?.creditoVencido?.valor ?? "0,00",
    totalPrejuizo: scrBacen.consolidado?.prejuizo?.valor ?? "0,00",
    limiteCredito: scrBacen.consolidado?.limiteCredito?.valor ?? "0,00",
    quantidadeInstituicoes: scrBacen.quantidadeInstituicoes ?? "—",
    quantidadeOperacoes: scrBacen.quantidadeOperacoes ?? "—",
    databaseConsultada: scrBacen.databaseConsultada ?? "—",
    dataInicioRelacionamento: scrBacen.dataInicioRelacionamento ?? "—",
    coobrigacaoAssumida: scrBacen.coobrigacaoAssumida ?? "0,00",
    coobrigacaoRecebida: scrBacen.coobrigacaoRecebida ?? "0,00",
    tipoDocumento: scrBacen.tipoDocumento ?? "—",
    // Operações detalhadas por modalidade
    operacoes: (scrBacen.operacoes ?? []).map((op) => ({
      modalidade: op.modalidade,
      subModalidade: op.subModalidade,
      total: op.total,
      percentual: op.percentual,
      vencimentos: op.vencimentos,
    })),
    // Créditos a vencer consolidados por prazo
    creditoAVencer: scrBacen.consolidado?.creditoAVencer?.operacoes ?? [],
  };

  const score = {
    pontuacao: scrBacen.score?.PONTUACAO ? parseInt(scrBacen.score.PONTUACAO, 10) : null,
    faixa: scrBacen.score?.FAIXA ?? "—",
  };

  return { scr, score };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documento = searchParams.get("documento") ?? "";
  const digits = documento.replace(/\D/g, "");

  if (digits.length !== 11) {
    return NextResponse.json(
      { error: "Informe um CPF válido com 11 dígitos. (Consulta SCR Bacen disponível apenas para CPF.)" },
      { status: 400 }
    );
  }

  try {
    const raw = await consultarSCRScore(digits);
    const { scr, score } = mapearResposta(raw as unknown as Record<string, unknown>);

    return NextResponse.json({ scr, score, _raw: raw });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/consulta] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/consulta]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
