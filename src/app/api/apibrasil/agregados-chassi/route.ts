import { NextRequest, NextResponse } from "next/server";
import { consultarAgregadosChassi, APIBrasilError } from "@/lib/apibrasil";

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chassi = (searchParams.get("chassi") ?? "").trim();

  if (!chassi) {
    return NextResponse.json({ error: "Informe o chassi do veículo." }, { status: 400 });
  }

  try {
    const raw = await consultarAgregadosChassi(chassi);
    let veiculo = raw.data?.veiculo ?? {};

    const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";
    if (isHomolog || !raw.data?.veiculo) {
      // Mock para fins de homologação / testes
      veiculo = {
        placa: "SDD4545",
        marca_modelo: "VW/FOX 1.0 GII",
        ano_fabricacao: "2012",
        ano_modelo: "2013",
        cor: "VERMELHA",
        combustivel: "ALCOOL/GASOLINA",
        chassi: chassi.toUpperCase(),
        renavam: "00456789012",
        motor: "CCC178906",
        municipio: "CURITIBA",
        uf: "PR",
        especie: "PASSAGEIRO",
        tipo: "AUTOMOVEL",
        carroceria: "HATCH",
        potencia: "76CV",
        cilindrada: "999",
        capacidade_passageiros: "5",
        procedencia: "NACIONAL",
      };
    }

    return NextResponse.json({ veiculo, _raw: raw });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/agregados-chassi] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/agregados-chassi]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
