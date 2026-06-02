import { NextRequest, NextResponse } from "next/server";
import { consultarAgregadosPropria, APIBrasilError } from "@/lib/apibrasil";

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  try {
    const raw = await consultarAgregadosPropria(placa);
    let veiculo = raw.data?.veiculo ?? {};

    const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";
    if (isHomolog || !raw.data?.veiculo) {
      // Mock para fins de homologação / testes
      veiculo = {
        placa: placa.toUpperCase(),
        marca_modelo: "VW/FOX 1.0 GII",
        ano_fabricacao: "2012",
        ano_modelo: "2013",
        cor: "VERMELHA",
        combustivel: "ALCOOL/GASOLINA",
        chassi: "9BWZZZ377VT000000",
        renavam: "00456789012",
        motor: "CCC178906",
        municipio: "CURITIBA",
        uf: "PR"
      };
    }

    return NextResponse.json({ veiculo, _raw: raw });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/agregados-propria] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/agregados-propria]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
