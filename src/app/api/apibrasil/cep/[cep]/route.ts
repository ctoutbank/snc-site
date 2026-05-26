import { NextRequest, NextResponse } from "next/server";
import { consultarCEP } from "@/lib/apibrasil";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cep: string }> }
) {
  const { cep } = await params;

  if (!cep) {
    return NextResponse.json({ error: "CEP não informado." }, { status: 400 });
  }

  const cepLimpo = cep.replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    return NextResponse.json(
      { error: "CEP deve ter 8 dígitos." },
      { status: 400 }
    );
  }

  try {
    const data = await consultarCEP(cepLimpo);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
