import { NextRequest, NextResponse } from "next/server";
import { consultarProprietarioAtual, APIBrasilError } from "@/lib/apibrasil";

/**
 * Mapeia a resposta bruta da APIBrasil para o formato da UI.
 *
 * ATENÇÃO: Estrutura provisória — campos reais confirmados após
 * inspecionar _raw no DevTools durante o primeiro teste em homolog.
 */
function mapearProprietario(raw: Record<string, unknown>) {
  // A estrutura exata ainda não é conhecida — extração defensiva em múltiplos níveis
  const data = raw?.data as Record<string, unknown> | undefined;

  // Tentativas de localizar o bloco de proprietário em diferentes paths
  const prop =
    (data?.proprietario as Record<string, unknown>) ??
    (data?.dados as Record<string, unknown>) ??
    (data as Record<string, unknown>) ??
    {};

  return {
    nome: prop?.nome ?? prop?.nomeProprietario ?? prop?.razaoSocial ?? null,
    cpfCnpj: prop?.cpf ?? prop?.cnpj ?? prop?.cpfCnpj ?? prop?.documento ?? null,
    municipio: prop?.municipio ?? prop?.cidade ?? null,
    uf: prop?.uf ?? prop?.estado ?? null,
    dataAquisicao: prop?.dataAquisicao ?? prop?.dataCompra ?? null,
    restricoes: (prop?.restricoes as string[]) ?? [],
    // Campos adicionais que podem aparecer (a confirmar)
    renavam: prop?.renavam ?? null,
    placa: prop?.placa ?? null,
    situacao: prop?.situacao ?? null,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  try {
    const raw = await consultarProprietarioAtual(placa);

    // _raw SEMPRE retornado para inspecionar estrutura real via DevTools
    const proprietario = mapearProprietario(raw as unknown as Record<string, unknown>);

    return NextResponse.json({ proprietario, _raw: raw });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/proprietario] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/proprietario]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
