import { NextRequest, NextResponse } from "next/server";
import { consultarProprietarioAtual, APIBrasilError } from "@/lib/apibrasil";

// ─── Estrutura real confirmada em homolog ─────────────────────────────────────
// _raw.data.veicular.proprietario_atual_veiculo
interface ProprietarioAtualVeiculo {
  ano_fabricacao?: string;
  ano_modelo?: string;
  chassi?: string;
  combustivel?: string;
  cor_veiculo?: string;
  crlv?: string;
  data_atualizacao?: string;
  marca_modelo?: string;
  motor?: string;
  municipio?: string;
  placa?: string;
  proprietario_documento?: string;
  proprietario_nome?: string;
  renavam?: string;
  uf?: string;
  status_retorno?: {
    codigo?: string;
    descricao?: string;
  };
}

function mapearProprietario(raw: Record<string, unknown>) {
  const data = raw?.data as Record<string, unknown> | undefined;
  const veicular = data?.veicular as Record<string, unknown> | undefined;
  const p = veicular?.proprietario_atual_veiculo as ProprietarioAtualVeiculo | undefined;
  const pdf = (data?.pdf as string) ?? null;

  if (!p) return { proprietario: null, pdf, _sem_dados: true };

  return {
    pdf,
    proprietario: {
      nome: p.proprietario_nome ?? null,
      documento: p.proprietario_documento ?? null,
      placa: p.placa ?? null,
      renavam: p.renavam ?? null,
      municipio: p.municipio ?? null,
      uf: p.uf ?? null,
      marcaModelo: p.marca_modelo ?? null,
      anoFabricacao: p.ano_fabricacao ?? null,
      anoModelo: p.ano_modelo ?? null,
      cor: p.cor_veiculo ?? null,
      combustivel: p.combustivel ?? null,
      motor: p.motor ?? null,
      chassi: p.chassi ?? null,
      crlv: p.crlv ?? null,
      dataAtualizacao: p.data_atualizacao ?? null,
      statusCodigo: p.status_retorno?.codigo ?? null,
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

  const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";

  if (isHomolog) {
    const cleanPlaca = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const isRob = cleanPlaca === "ROB0190";
    
    const proprietario = {
      nome: isRob ? "JOÃO DA SILVA (ALERTA DE ROUBO)" : "JOÃO DA SILVA",
      documento: "123.456.789-00",
      placa: placa.toUpperCase(),
      renavam: "00456789012",
      municipio: "BELO HORIZONTE",
      uf: "MG",
      marcaModelo: "VW/FOX 1.0 GII",
      anoFabricacao: "2012",
      anoModelo: "2013",
      cor: "VERMELHA",
      combustivel: "ALCOOL/GASOLINA",
      motor: "CCC178906",
      chassi: "9BWZZZ377VT004251",
      crlv: "00123456789",
      dataAtualizacao: "15/03/2025",
      statusCodigo: isRob ? "1" : "0",
      statusDescricao: isRob ? "BLOQUEIO DE ROUBO/FURTO ATIVO" : "SEM RESTRIÇÃO",
    };
    
    return NextResponse.json({ proprietario, pdf: null, _raw: { mock: true, placa } });
  }

  try {
    const raw = await consultarProprietarioAtual(placa);
    const { proprietario, pdf } = mapearProprietario(
      raw as unknown as Record<string, unknown>
    );

    return NextResponse.json({ proprietario, pdf, _raw: raw });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/proprietario] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/proprietario]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
