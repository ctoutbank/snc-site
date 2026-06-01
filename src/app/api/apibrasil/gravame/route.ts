import { NextRequest, NextResponse } from "next/server";
import { consultarGravame, APIBrasilError } from "@/lib/apibrasil";

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface GravameData {
  placa?: string;
  chassi?: string;
  renavam?: string;
  marca_modelo?: string;
  ano_fabricacao?: string;
  ano_modelo?: string;
  cor_veiculo?: string;
  combustivel?: string;
  financiamento?: string;
  agente_financeiro?: string;
  data_inclusao?: string;
  contrato_numero?: string;
  situacao?: string;
}

// ─── Mapeamento ───────────────────────────────────────────────────────────────

function mapearGravame(raw: Record<string, any>): GravameData | null {
  const data = raw?.data as Record<string, any> | undefined;
  if (!data) return null;

  return {
    placa: data.placa || "—",
    chassi: data.chassi || "—",
    renavam: data.renavam || "—",
    marca_modelo: data.marca_modelo || "—",
    ano_fabricacao: data.ano_fabricacao || "—",
    ano_modelo: data.ano_modelo || "—",
    cor_veiculo: data.cor_veiculo || "—",
    combustivel: data.combustivel || "—",
    financiamento: data.financiamento || "NÃO",
    agente_financeiro: data.agente_financeiro || "—",
    data_inclusao: data.data_inclusao || "—",
    contrato_numero: data.contrato_numero || "—",
    situacao: data.situacao || "—",
  };
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();
  const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  // Intercepta em Homologação/Exemplo imediatamente
  if (isHomolog) {
    const cleanPlaca = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const isClean = cleanPlaca === "XXX0000" || cleanPlaca === "SNC2026";
    
    const gravame = isClean
      ? {
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
        }
      : {
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
        };
        
    return NextResponse.json({
      gravame,
      _raw: { mock: true, placa },
    });
  }

  try {
    const raw = await consultarGravame(placa);
    const gravame = mapearGravame(raw as unknown as Record<string, any>);

    return NextResponse.json({
      gravame,
      _raw: raw,
    });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/gravame] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }

    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/gravame]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
