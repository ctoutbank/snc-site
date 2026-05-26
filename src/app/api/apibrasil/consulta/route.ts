import { NextRequest, NextResponse } from "next/server";
import { consultarSCRScore, APIBrasilError, type SCRScoreResponse } from "@/lib/apibrasil";

/** Extrai os blocos SCR e Score da resposta, independente de onde a APIBrasil os coloca */
function extrairBlocos(raw: SCRScoreResponse) {
  const scr = raw.data?.scr ?? raw.scr ?? {};
  const score = raw.data?.score ?? raw.score ?? {};
  return { scr, score };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documento = searchParams.get("documento") ?? "";
  const digits = documento.replace(/\D/g, "");

  // Validação: por ora só CPF é suportado no endpoint v2
  if (digits.length !== 11) {
    return NextResponse.json(
      { error: "Informe um CPF válido com 11 dígitos. (Consulta SCR Bacen disponível apenas para CPF.)" },
      { status: 400 }
    );
  }

  try {
    const raw = await consultarSCRScore(digits);
    const { scr, score } = extrairBlocos(raw);

    return NextResponse.json({ scr, score, _raw: raw });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/consulta] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/consulta]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
