import { NextRequest, NextResponse } from "next/server";
import { consultarDebitosV4, APIBrasilError } from "@/lib/apibrasil";

// ─── Mapeamento ───────────────────────────────────────────────────────────────

function mapearDebitoItem(item: any) {
  return {
    descricao: item?.descricao || "—",
    valor: item?.valor || "—",
    dataVencimento: item?.dataVencimento || item?.vencimento || "—",
    orgaoEmissor: item?.orgaoEmissor || item?.orgao || "—",
    tipoDebito: item?.tipoDebito || "—",
    codigoInfracao: item?.codigoInfracao || item?.codigo || "—",
    situacao: item?.situacao || "—",
  };
}

function mapearDebitosV4(raw: Record<string, any>) {
  const data = raw?.data as Record<string, any> | undefined;
  if (!data) return null;

  const rawDebitos = data.debitos || {};
  const rawVeiculo = data.veiculo || {};

  return {
    veiculo: {
      placa: rawVeiculo.placa || "—",
      renavam: rawVeiculo.renavam || "—",
      chassi: rawVeiculo.chassi || "—",
      marca_modelo: rawVeiculo.marca_modelo || rawVeiculo.marcaModelo || "—",
      anoFabricacao: rawVeiculo.anoFabricacao || "—",
      anoModelo: rawVeiculo.anoModelo || "—",
      cor: rawVeiculo.cor || "—",
      combustivel: rawVeiculo.combustivel || "—",
    },
    debitos: {
      placa: rawDebitos.placa || "—",
      renavam: rawDebitos.renavam || "—",
      chassi: rawDebitos.chassi || "—",
      marcaModelo: rawDebitos.marcaModelo || "—",
      anoFabricacao: rawDebitos.anoFabricacao || "—",
      anoModelo: rawDebitos.anoModelo || "—",
      combustivel: rawDebitos.combustivel || "—",
      cor: rawDebitos.cor || "—",
      multas: Array.isArray(rawDebitos.multas) ? rawDebitos.multas.map(mapearDebitoItem) : [],
      ipva: Array.isArray(rawDebitos.ipva) ? rawDebitos.ipva.map(mapearDebitoItem) : [],
      licenciamento: Array.isArray(rawDebitos.licenciamento) ? rawDebitos.licenciamento.map(mapearDebitoItem) : [],
      dpvat: Array.isArray(rawDebitos.dpvat) ? rawDebitos.dpvat.map(mapearDebitoItem) : [],
      outrosDebitos: Array.isArray(rawDebitos.outrosDebitos) ? rawDebitos.outrosDebitos.map(mapearDebitoItem) : [],
      totalMultas: rawDebitos.totalMultas || "R$ 0,00",
      totalIpva: rawDebitos.totalIpva || "R$ 0,00",
      totalLicenciamento: rawDebitos.totalLicenciamento || "R$ 0,00",
      totalDpvat: rawDebitos.totalDpvat || "R$ 0,00",
      totalGeral: rawDebitos.totalGeral || "R$ 0,00",
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
            marcaModelo: "VW/FOX 1.0 GII",
            anoFabricacao: "2012",
            anoModelo: "2013",
            cor: "VERMELHA",
            combustivel: "ALCOOL/GASOLINA"
          },
          debitos: {
            placa: "XXX-0000",
            renavam: "00456789012",
            chassi: "9BWZZZ377VT000000",
            marcaModelo: "VW/FOX 1.0 GII",
            anoFabricacao: "2012",
            anoModelo: "2013",
            combustivel: "ALCOOL/GASOLINA",
            cor: "VERMELHA",
            multas: [],
            ipva: [],
            licenciamento: [],
            dpvat: [],
            outrosDebitos: [],
            totalMultas: "R$ 0,00",
            totalIpva: "R$ 0,00",
            totalLicenciamento: "R$ 0,00",
            totalDpvat: "R$ 0,00",
            totalGeral: "R$ 0,00"
          }
        }
      : {
          veiculo: {
            placa: "XXX-1111",
            renavam: "00456789012",
            chassi: "9BWZZZ377VT000000",
            marcaModelo: "VW/FOX 1.0 GII",
            anoFabricacao: "2012",
            anoModelo: "2013",
            cor: "VERMELHA",
            combustivel: "ALCOOL/GASOLINA"
          },
          debitos: {
            placa: "XXX-1111",
            renavam: "00456789012",
            chassi: "9BWZZZ377VT000000",
            marcaModelo: "VW/FOX 1.0 GII",
            anoFabricacao: "2012",
            anoModelo: "2013",
            combustivel: "ALCOOL/GASOLINA",
            cor: "VERMELHA",
            multas: [
              {
                descricao: "TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ 20%",
                valor: "R$ 130,16",
                dataVencimento: "15/09/2025",
                orgaoEmissor: "DPRF - CONTAGEM/MG",
                codigoInfracao: "74550",
                situacao: "EM ABERTO"
              },
              {
                descricao: "AVANÇAR O SINAL VERMELHO DO SEMÁFORO OU O DE PARADA OBRIGATÓRIA",
                valor: "R$ 293,47",
                dataVencimento: "22/10/2025",
                orgaoEmissor: "BHTRANS - BELO HORIZONTE/MG",
                codigoInfracao: "60501",
                situacao: "EM ABERTO"
              }
            ],
            ipva: [
              {
                exercicio: "2025",
                valor: "R$ 1.312,00",
                parcela: "COTA ÚNICA",
                dataVencimento: "15/03/2025",
                situacao: "EM ABERTO"
              },
              {
                exercicio: "2026",
                valor: "R$ 1.280,00",
                parcela: "PARCELA 1/3",
                dataVencimento: "15/03/2026",
                situacao: "VENCIDO"
              }
            ],
            licenciamento: [
              {
                exercicio: "2025",
                valor: "R$ 39,36",
                dataVencimento: "31/03/2025",
                situacao: "VENCIDO"
              },
              {
                exercicio: "2026",
                valor: "R$ 41,20",
                dataVencimento: "31/03/2026",
                situacao: "VENCIDO"
              }
            ],
            dpvat: [
              {
                exercicio: "2025",
                valor: "R$ 5,23",
                dataVencimento: "31/03/2025",
                situacao: "VENCIDO"
              }
            ],
            outrosDebitos: [],
            totalMultas: "R$ 423,63",
            totalIpva: "R$ 2.592,00",
            totalLicenciamento: "R$ 80,56",
            totalDpvat: "R$ 5,23",
            totalGeral: "R$ 3.101,42"
          }
        };

    return NextResponse.json({
      debitos: mockData,
      _raw: { mock: true, placa },
    });
  }

  try {
    const raw = await consultarDebitosV4(placa);
    const debitos = mapearDebitosV4(raw as unknown as Record<string, any>);

    return NextResponse.json({
      debitos,
      _raw: raw,
    });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/debitos] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }

    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/debitos]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
