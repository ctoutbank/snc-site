import { NextRequest, NextResponse } from "next/server";
import { consultarPlacaFIPE, APIBrasilError } from "@/lib/apibrasil";

// ─── Tipos da resposta real da APIBrasil ──────────────────────────────────────
interface ResultadoItem {
  anoFabricacao?: number;
  anoModelo?: string | number;
  categoria?: string;
  chassi?: string;
  codigoFipe?: string;
  combustivel?: string;
  cor?: string;
  marca?: string;
  mesReferencia?: string;
  modelo?: string;
  principal?: boolean;
  url?: string;
  valor?: number;
  historico?: { mes: string; valor: number }[];
  extra?: {
    categoria?: { descricao: string; sintetico: string };
    combustivel?: { descricao: string; sintetico: string };
  };
}

interface APIBrasilVeiculoRaw {
  status_code?: number;
  error?: boolean;
  message?: string;
  valor_consulta?: number;
  homolog?: boolean;
  data?: {
    resultados?: ResultadoItem[];
  };
}

// ─── Formatação de moeda ───────────────────────────────────────────────────────
function formatarBRL(valor?: number): string {
  if (valor === undefined || valor === null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

// ─── Mapeia a resposta real para o formato da UI ──────────────────────────────
function mapearResultados(raw: APIBrasilVeiculoRaw) {
  const resultados: ResultadoItem[] = raw?.data?.resultados ?? [];

  // Item principal (marcado como principal: true ou o primeiro da lista)
  const principal = resultados.find((r) => r.principal === true) ?? resultados[0];

  const veiculo = principal
    ? {
        placa: "",                         // a placa não vem na resposta
        marca: principal.marca ?? "—",
        modelo: principal.modelo ?? "—",
        anoFabricacao: principal.anoFabricacao ?? "—",
        anoModelo: principal.anoModelo ?? "—",
        cor: principal.cor ?? "—",
        combustivel: principal.combustivel ?? "—",
        categoria: principal.categoria ?? "—",
        chassi: principal.chassi ?? "—",
      }
    : {};

  // Tabela FIPE — um item por resultado único (sem duplicatas por codigoFipe)
  const vistosCodigosStr = new Set<string>();
  const fipe = resultados
    .filter((r) => {
      const key = `${r.codigoFipe}-${r.anoModelo}`;
      if (vistosCodigosStr.has(key)) return false;
      vistosCodigosStr.add(key);
      return true;
    })
    .map((r) => ({
      codigoFipe: r.codigoFipe ?? "—",
      modelo: r.modelo ?? "—",
      anoModelo: r.anoModelo ?? "—",
      combustivel: r.combustivel ?? "—",
      mesReferencia: r.mesReferencia ?? "—",
      valor: formatarBRL(r.valor),
      valorNum: r.valor ?? 0,
      principal: r.principal ?? false,
    }));

  // Histórico de valores (do item principal)
  const historico = (principal?.historico ?? []).map((h) => ({
    mes: h.mes,
    valor: h.valor,
    valorFormatado: formatarBRL(h.valor),
  }));

  return { veiculo, fipe, historico };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();

  if (!placa) {
    return NextResponse.json({ error: "Informe a placa do veículo." }, { status: 400 });
  }

  try {
    const raw = await consultarPlacaFIPE(placa);
    let { veiculo, fipe, historico } = mapearResultados(
      raw as unknown as APIBrasilVeiculoRaw
    );

    const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";
    if (isHomolog) {
      veiculo = {
        placa: placa.toUpperCase(),
        marca: "VW",
        modelo: "FOX 1.0 GII",
        anoFabricacao: 2012,
        anoModelo: 2013,
        cor: "VERMELHA",
        combustivel: "ALCOOL/GASOLINA",
        categoria: "AUTOMÓVEL",
        chassi: "9BWZZZ377VT004251",
      };
      fipe = [
        {
          codigoFipe: "005277-9",
          modelo: "Fox 1.0 Mi Total Flex 8V 5d",
          anoModelo: "2013",
          combustivel: "Gasolina",
          mesReferencia: "Maio de 2026",
          valor: "R$ 32.800",
          valorNum: 32800,
          principal: true,
        }
      ];
      historico = [
        { mes: "05/2026", valor: 32800, valorFormatado: "R$ 32.800" },
        { mes: "04/2026", valor: 32500, valorFormatado: "R$ 32.500" },
        { mes: "03/2026", valor: 32900, valorFormatado: "R$ 32.900" },
        { mes: "02/2026", valor: 33100, valorFormatado: "R$ 33.100" },
        { mes: "01/2026", valor: 33400, valorFormatado: "R$ 33.400" },
        { mes: "12/2025", valor: 33600, valorFormatado: "R$ 33.600" },
      ];
    }

    return NextResponse.json({ veiculo, fipe, historico, _raw: raw });
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
