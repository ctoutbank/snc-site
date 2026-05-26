import { NextRequest, NextResponse } from "next/server";
import { consultarSCR, consultarScore } from "@/lib/apibrasil";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documento = searchParams.get("documento") ?? "";
  const digits = documento.replace(/\D/g, "");

  if (digits.length !== 11 && digits.length !== 14) {
    return NextResponse.json(
      { error: "Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido." },
      { status: 400 }
    );
  }

  try {
    const [scr, score] = await Promise.allSettled([
      consultarSCR(digits),
      consultarScore(digits),
    ]);

    return NextResponse.json({
      scr: scr.status === "fulfilled" ? scr.value : { error: scr.reason?.message },
      score: score.status === "fulfilled" ? score.value : { error: score.reason?.message },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[/api/apibrasil/consulta]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
