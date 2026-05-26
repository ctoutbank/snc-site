import { NextRequest, NextResponse } from "next/server";
import {
  consultarPlacaFIPE,
  APIBrasilError,
  type PlacaFIPEResponse,
  type FIPEItem,
  type VeiculoDados,
  type VeiculoChassi,
} from "@/lib/apibrasil";

// ─── Extração flexível dos blocos da resposta ─────────────────────────────────
// A APIBrasil pode retornar dados em diferentes níveis dependendo da versão
function extrairDados(raw: PlacaFIPEResponse): {
  veiculo: VeiculoDados;
  fipe: FIPEItem[];
  chassi: VeiculoChassi;
} {
  const d = raw?.data as Record<string, unknown> | undefined;

  const veiculo: VeiculoDados =
    (d?.veiculo as VeiculoDados) ??
    (d?.dados as VeiculoDados) ??
    {};

  const fipe: FIPEItem[] =
    (d?.fipe as FIPEItem[]) ??
    (veiculo?.fipe as FIPEItem[]) ??
    [];

  const chassi: VeiculoChassi =
    (d?.chassi as VeiculoChassi) ??
    (veiculo?.chassi as VeiculoChassi) ??
    {};

  return { veiculo, fipe, chassi };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();

  if (!placa) {
    return NextResponse.json(
      { error: "Informe a placa do veículo." },
      { status: 400 }
    );
  }

  try {
    const raw = await consultarPlacaFIPE(placa);
    const { veiculo, fipe, chassi } = extrairDados(raw);

    return NextResponse.json({ veiculo, fipe, chassi, _raw: raw });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/veiculo] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/veiculo]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
