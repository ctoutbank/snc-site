import { NextResponse } from "next/server";
import { consultarCsvCompleta, APIBrasilError } from "@/lib/apibrasil";
import { CSV_COMPLETA_MOCK_CLEAN, CSV_COMPLETA_MOCK_RESTRICTED } from "@/lib/mocks";

export async function POST(req: Request) {
  try {
    const { placa, homolog } = await req.json();

    if (!placa) {
      return NextResponse.json({ error: "Placa é obrigatória." }, { status: 400 });
    }

    if (homolog) {
      const p = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (p === "XXX0000" || p === "SNC2026") return NextResponse.json(CSV_COMPLETA_MOCK_CLEAN);
      return NextResponse.json(CSV_COMPLETA_MOCK_RESTRICTED);
    }

    const data = await consultarCsvCompleta(placa, { homolog });
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("[CSV Completa Route Error]", err);
    if (err instanceof APIBrasilError) {
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
