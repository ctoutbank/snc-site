import { NextRequest, NextResponse } from "next/server";
import { consultarLeilaoScore, APIBrasilError } from "@/lib/apibrasil";

/**
 * GET /api/apibrasil/leilao-score?placa=ABC1234
 *
 * Consulta Leilão com Score via APIBrasil.
 * Em HML retorna os dados brutos para inspeção da estrutura real.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  try {
    const raw = await consultarLeilaoScore(placa);

    return NextResponse.json({
      leilao: raw?.data ?? null,
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
