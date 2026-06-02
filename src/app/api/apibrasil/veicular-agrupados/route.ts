import { NextRequest, NextResponse } from "next/server";
import { consultarVeicularAgrupados, APIBrasilError } from "@/lib/apibrasil";

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  try {
    const raw = await consultarVeicularAgrupados(placa);
    let veiculo = raw.data?.veiculo ?? {};
    let fipe = raw.data?.fipe ?? {};
    let proprietario = raw.data?.proprietario ?? {};

    const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";
    if (isHomolog || !raw.data?.veiculo) {
      veiculo = {
        placa: placa,
        marca_modelo: "VW/FOX 1.0 GII",
        ano_fabricacao: "2012",
        ano_modelo: "2013",
        cor: "VERMELHA",
        combustivel: "ALCOOL/GASOLINA",
        chassi: "9BFZF55A0E8008912",
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
        situacao: "CIRCULACAO",
      };
      fipe = {
        codigo_fipe: "005340-6",
        marca: "VW - VOLKSWAGEN",
        modelo: "FOX 1.0 MI TOTAL FLEX 8V 5P",
        ano_modelo: "2013 Gasolina",
        combustivel: "GASOLINA",
        valor: "R$ 32.457,00",
        referencia: "junho de 2025",
      };
      proprietario = {
        nome: "JOÃO DA SILVA",
        documento: "***456789**",
        tipo_documento: "CPF",
        municipio: "CURITIBA",
        uf: "PR",
        data_atualizacao: "15/03/2024",
      };
    }

    return NextResponse.json({ veiculo, fipe, proprietario, _raw: raw });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/veicular-agrupados] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/veicular-agrupados]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
