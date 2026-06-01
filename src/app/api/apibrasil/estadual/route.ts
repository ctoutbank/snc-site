import { NextRequest, NextResponse } from "next/server";
import { consultarBaseEstadual, APIBrasilError } from "@/lib/apibrasil";

// ─── Mapeamento ───────────────────────────────────────────────────────────────

function mapearDebitoItem(item: any) {
  return {
    descricao: item?.descricao || "—",
    valor: item?.valor || "—",
    dataVencimento: item?.dataVencimento || item?.vencimento || "—",
    orgaoEmissor: item?.orgaoEmissor || item?.orgao || "—",
    tipoDebito: item?.tipoDebito || "—",
  };
}

function mapearRestricaoItem(item: any) {
  return {
    tipo: item?.tipo || "Administrativa",
    descricao: item?.descricao || "—",
  };
}

function mapearBaseEstadual(raw: Record<string, any>) {
  const data = raw?.data as Record<string, any> | undefined;
  if (!data) return null;

  const rawEstadual = data.estadual || {};
  const rawVeiculo = data.veiculo || {};

  return {
    veiculo: {
      placa: rawVeiculo.placa || "—",
      renavam: rawVeiculo.renavam || "—",
      chassi: rawVeiculo.chassi || "—",
      marca_modelo: rawVeiculo.marca_modelo || rawVeiculo.marcaModelo || "—",
      uf: rawVeiculo.uf || "—",
    },
    estadual: {
      placa: rawEstadual.placa || "—",
      renavam: rawEstadual.renavam || "—",
      chassi: rawEstadual.chassi || "—",
      marcaModelo: rawEstadual.marcaModelo || "—",
      anoFabricacao: rawEstadual.anoFabricacao || "—",
      anoModelo: rawEstadual.anoModelo || "—",
      combustivel: rawEstadual.combustivel || "—",
      cor: rawEstadual.cor || "—",
      uf: rawEstadual.uf || "—",
      municipio: rawEstadual.municipio || "—",
      restricoes: Array.isArray(rawEstadual.restricoes) ? rawEstadual.restricoes.map(mapearRestricaoItem) : [],
      multas: Array.isArray(rawEstadual.multas) ? rawEstadual.multas.map(mapearDebitoItem) : [],
      ipva: Array.isArray(rawEstadual.ipva) ? rawEstadual.ipva.map(mapearDebitoItem) : [],
      licenciamento: Array.isArray(rawEstadual.licenciamento) ? rawEstadual.licenciamento.map(mapearDebitoItem) : [],
      outrosDebitos: Array.isArray(rawEstadual.outrosDebitos) ? rawEstadual.outrosDebitos.map(mapearDebitoItem) : [],
      totalDebitos: rawEstadual.totalDebitos || "R$ 0,00",
    }
  };
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();
  const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  // Intercepta em Homologação/Exemplo imediatamente
  if (isHomolog) {
    const cleanPlaca = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const isClean = cleanPlaca === "XXX0000" || cleanPlaca === "SNC2026";

    const mockData = isClean
      ? {
          veiculo: {
            placa: "XXX-0000",
            renavam: "00456789012",
            chassi: "9BWZZZ377VT000000",
            marca_modelo: "VW/FOX 1.0 GII",
            uf: "MG",
          },
          estadual: {
            placa: "XXX-0000",
            renavam: "00456789012",
            chassi: "9BWZZZ377VT000000",
            marcaModelo: "VW/FOX 1.0 GII",
            anoFabricacao: "2012",
            anoModelo: "2013",
            combustivel: "ALCOOL/GASOLINA",
            cor: "VERMELHA",
            uf: "MG",
            municipio: "BELO HORIZONTE",
            restricoes: [],
            multas: [],
            ipva: [],
            licenciamento: [],
            outrosDebitos: [],
            totalDebitos: "R$ 0,00",
          }
        }
      : {
          veiculo: {
            placa: "XXX-1111",
            renavam: "00456789012",
            chassi: "9BWZZZ377VT000000",
            marca_modelo: "VW/FOX 1.0 GII",
            uf: "SP",
          },
          estadual: {
            placa: "XXX-1111",
            renavam: "00456789012",
            chassi: "9BWZZZ377VT000000",
            marcaModelo: "VW/FOX 1.0 GII",
            anoFabricacao: "2012",
            anoModelo: "2013",
            combustivel: "ALCOOL/GASOLINA",
            cor: "VERMELHA",
            uf: "SP",
            municipio: "SAO PAULO",
            restricoes: [
              {
                tipo: "Judicial",
                descricao: "BLOQUEIO DE TRANSFERENCIA ATIVO - PROCESSO TRABALHISTA",
              },
              {
                tipo: "Administrativo",
                descricao: "RESTRICAO POR FALTA DE TRANSFERENCIA (COMUNICACAO DE VENDA)",
              }
            ],
            multas: [
              {
                descricao: "TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ 20%",
                valor: "R$ 130,16",
                dataVencimento: "15/09/2025",
                orgaoEmissor: "DETRAN-SP",
                tipoDebito: "Multa Estadual"
              }
            ],
            ipva: [
              {
                descricao: "IPVA Exercício 2026",
                valor: "R$ 1.280,00",
                dataVencimento: "15/03/2026",
                orgaoEmissor: "SEFAZ-SP",
                tipoDebito: "IPVA"
              }
            ],
            licenciamento: [
              {
                descricao: "Licenciamento Anual 2026",
                valor: "R$ 155,23",
                dataVencimento: "31/10/2026",
                orgaoEmissor: "DETRAN-SP",
                tipoDebito: "Licenciamento"
              }
            ],
            outrosDebitos: [],
            totalDebitos: "R$ 1.565,39",
          }
        };

    return NextResponse.json({
      estadual: mockData,
      _raw: { mock: true, placa },
    });
  }

  try {
    const raw = await consultarBaseEstadual(placa);
    const estadual = mapearBaseEstadual(raw as unknown as Record<string, any>);

    return NextResponse.json({
      estadual,
      _raw: raw,
    });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/estadual] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }

    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/estadual]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
