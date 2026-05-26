import { NextRequest, NextResponse } from "next/server";
import { consultarCNPJ } from "@/lib/apibrasil";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const { cnpj } = await params;

  if (!cnpj) {
    return NextResponse.json({ error: "CNPJ não informado." }, { status: 400 });
  }

  const cnpjLimpo = cnpj.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) {
    return NextResponse.json(
      { error: "CNPJ deve ter 14 dígitos." },
      { status: 400 }
    );
  }

  try {
    const data = await consultarCNPJ(cnpjLimpo);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
