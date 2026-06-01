import { NextRequest, NextResponse } from "next/server";
import { consultarRenajud, APIBrasilError } from "@/lib/apibrasil";

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface RenajudData {
  processo?: string;
  orgao_judicial?: string;
  tribunal?: string;
  restricoes?: string[];
}

// ─── Mapeamento ───────────────────────────────────────────────────────────────

function mapearRenajud(raw: Record<string, unknown>): RenajudData | null {
  const data = raw?.data as Record<string, unknown> | undefined;
  if (!data) return null;

  return {
    processo: (data.processo as string) || "—",
    orgao_judicial: (data.orgao_judicial as string) || "—",
    tribunal: (data.tribunal as string) || "—",
    restricoes: Array.isArray(data.restricoes) ? (data.restricoes as string[]) : [],
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
    const isClean = cleanPlaca === "SNC2026";
    
    const renajud = isClean
      ? {
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
        }
      : {
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
        
    return NextResponse.json({
      renajud,
      _raw: { mock: true, placa },
    });
  }

  try {
    const raw = await consultarRenajud(placa);
    const renajud = mapearRenajud(raw as unknown as Record<string, unknown>);

    return NextResponse.json({
      renajud,
      _raw: raw,
    });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/renajud] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }

    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/renajud]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
