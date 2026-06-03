import { NextRequest, NextResponse } from "next/server";
import { consultarHistoricoKm, APIBrasilError } from "@/lib/apibrasil";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface HistoricoKmRegistro {
  data?: string;
  km?: number | string;
  fonte?: string;
  estado?: string;
}

interface HistoricoKmData {
  placa?: string;
  totalRegistros?: number;
  anomalia?: boolean;
  registros?: HistoricoKmRegistro[];
}

interface VeiculoData {
  placa?: string;
  chassi?: string;
  renavam?: string;
  marcaModelo?: string;
  anoFabricacao?: string;
  anoModelo?: string;
  cor?: string;
  combustivel?: string;
}

// ─── Mapeamento ───────────────────────────────────────────────────────────────

function mapearHistoricoKm(raw: Record<string, unknown>): {
  veiculo: VeiculoData;
  historicoKm: HistoricoKmData;
} | null {
  const data = (raw?.data ?? raw) as Record<string, unknown>;
  if (!data) return null;

  const registrosRaw = (data.historico ?? data.registros ?? []) as Record<string, unknown>[];

  const registros: HistoricoKmRegistro[] = registrosRaw.map((r) => ({
    data:   String(r.data   ?? r.date   ?? "—"),
    km:     Number(r.km     ?? r.quilometragem ?? r.odometer ?? 0),
    fonte:  String(r.fonte  ?? r.source ?? "—"),
    estado: String(r.estado ?? r.uf     ?? "—"),
  }));

  // Detecta divergência: km decrescente entre registros (possível adulteração)
  const anomalia = registros.length >= 2 && registros.some((r, i) => {
    if (i === 0) return false;
    return Number(r.km) > Number(registros[i - 1].km);
  });

  const veiculo: VeiculoData = {
    placa:          String(data.placa          ?? "—"),
    chassi:         String(data.chassi         ?? "—"),
    renavam:        String(data.renavam        ?? "—"),
    marcaModelo:    String(data.marca_modelo   ?? data.marcaModelo ?? "—"),
    anoFabricacao:  String(data.ano_fabricacao ?? data.anoFabricacao ?? "—"),
    anoModelo:      String(data.ano_modelo     ?? data.anoModelo ?? "—"),
    cor:            String(data.cor            ?? data.cor_veiculo ?? "—"),
    combustivel:    String(data.combustivel    ?? "—"),
  };

  const historicoKm: HistoricoKmData = {
    placa:          String(data.placa ?? "—"),
    totalRegistros: registros.length,
    anomalia,
    registros,
  };

  return { veiculo, historicoKm };
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();
  const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  // Intercepta em Homologação imediatamente — retorna mocks sem chamar a API
  if (isHomolog) {
    const cleanPlaca = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const isClean = cleanPlaca === "XXX0000" || cleanPlaca === "SNC2026";

    const veiculo: VeiculoData = {
      placa:         isClean ? "XXX-0000" : "XXX-1111",
      chassi:        isClean ? "9BWZZZ377VT000000" : "9BWZZZ377VT111111",
      renavam:       isClean ? "00456789012" : "11111111111",
      marcaModelo:   "VW/FOX 1.0 GII",
      anoFabricacao: "2012",
      anoModelo:     "2013",
      cor:           "VERMELHA",
      combustivel:   "ALCOOL/GASOLINA",
    };

    const historicoKm: HistoricoKmData = isClean
      ? {
          placa: "XXX-0000",
          totalRegistros: 3,
          anomalia: false,
          registros: [
            { data: "14/03/2026", km: 58200, fonte: "REVISÃO CONCESSIONÁRIA", estado: "SP" },
            { data: "10/09/2025", km: 51800, fonte: "VISTORIA DETRAN",        estado: "SP" },
            { data: "22/02/2025", km: 47400, fonte: "REVISÃO CONCESSIONÁRIA", estado: "SP" },
          ],
        }
      : {
          placa: "XXX-1111",
          totalRegistros: 4,
          anomalia: true,
          registros: [
            { data: "05/04/2026", km: 39200, fonte: "REVISÃO CONCESSIONÁRIA", estado: "RJ" },
            { data: "18/11/2025", km: 62500, fonte: "VISTORIA DETRAN",        estado: "SP" },
            { data: "03/07/2025", km: 58900, fonte: "REVISÃO CONCESSIONÁRIA", estado: "SP" },
            { data: "14/01/2025", km: 54300, fonte: "SEGURADORA",             estado: "SP" },
          ],
        };

    return NextResponse.json({
      veiculo,
      historicoKm,
      _raw: { mock: true, placa },
    });
  }

  // Chamada real à APIBrasil
  try {
    const raw = await consultarHistoricoKm(placa);
    const mapped = mapearHistoricoKm(raw as unknown as Record<string, unknown>);

    if (!mapped) {
      return NextResponse.json(
        { error: "Resposta da API sem dados de histórico." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      veiculo:    mapped.veiculo,
      historicoKm: mapped.historicoKm,
      _raw: raw,
    });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/historico-km] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }

    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/historico-km]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
