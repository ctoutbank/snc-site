import { NextResponse } from "next/server";
import { consultarRenainf } from "@/lib/apibrasil";
import { RENAINF_MOCK_CLEAN, RENAINF_MOCK_RESTRICTED } from "@/lib/mocks";

export async function POST(req: Request) {
  try {
    const { placa, homolog } = await req.json();

    if (!placa) {
      return NextResponse.json(
        { error: "Placa é obrigatória." },
        { status: 400 }
      );
    }

    if (homolog) {
      const p = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (p === "XXX0000" || p === "SNC2026") return NextResponse.json(RENAINF_MOCK_CLEAN);
      return NextResponse.json(RENAINF_MOCK_RESTRICTED);
    }

    const data = await consultarRenainf(placa, { homolog });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[Renainf Route Error]", err);
    return NextResponse.json(
      { error: err.message || "Erro ao consultar Renainf" },
      { status: err.statusCode || 500 }
    );
  }
}
