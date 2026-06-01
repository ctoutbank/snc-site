import { NextResponse } from "next/server";
import { consultarCrlve } from "@/lib/apibrasil";
import { CRLV_MOCK_CLEAN, CRLV_MOCK_RESTRICTED } from "@/lib/mocks";

export async function POST(req: Request) {
  try {
    const { placa, uf, homolog } = await req.json();

    if (!placa) {
      return NextResponse.json(
        { error: "Placa é obrigatória." },
        { status: 400 }
      );
    }

    if (!uf) {
      return NextResponse.json(
        { error: "UF é obrigatória para emissão de CRLV-e." },
        { status: 400 }
      );
    }

    if (homolog) {
      const p = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (p === "XXX0000" || p === "SNC2026") return NextResponse.json(CRLV_MOCK_CLEAN);
      return NextResponse.json(CRLV_MOCK_RESTRICTED);
    }

    const data = await consultarCrlve(placa, uf, { homolog });
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[CRLV-e Route Error]", err);
    return NextResponse.json(
      { error: err.message || "Erro ao emitir CRLV-e" },
      { status: err.statusCode || 500 }
    );
  }
}
