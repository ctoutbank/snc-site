import { NextRequest, NextResponse } from "next/server";
import { consultarAnaliticoVeicular, APIBrasilError } from "@/lib/apibrasil";
import { ANALITICO_VEICULAR_MOCK_CLEAN, ANALITICO_VEICULAR_MOCK_RESTRICTED } from "@/lib/mocks";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placa = (searchParams.get("placa") ?? "").trim();

  if (!placa) {
    return NextResponse.json({ error: "Placa é obrigatória." }, { status: 400 });
  }

  const isHomolog = process.env.APIBRASIL_HOMOLOG === "true";

  // ── HML: dados fictícios para qualquer placa ──
  if (isHomolog) {
    const p = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (p === "XXX0000" || p === "SNC2026") {
      return NextResponse.json(ANALITICO_VEICULAR_MOCK_CLEAN);
    }
    return NextResponse.json(ANALITICO_VEICULAR_MOCK_RESTRICTED);
  }

  // ── Produção: chamada real ──
  try {
    const raw = await consultarAnaliticoVeicular(placa);
    
    // Mapeamento robusto dos sub-datasets retornados pela APIBrasil para as chaves camelCase esperadas pela UI
    const veiculoRaw = (raw.data?.veiculo || {}) as Record<string, any>;
    const veiculo = {
      placa: veiculoRaw.placa || placa.toUpperCase(),
      marca_modelo: veiculoRaw.marca_modelo || "—",
      ano_fabricacao: veiculoRaw.ano_fabricacao || "—",
      ano_modelo: veiculoRaw.ano_modelo || "—",
      cor: veiculoRaw.cor || "—",
      combustivel: veiculoRaw.combustivel || "—",
      chassi: veiculoRaw.chassi || "—",
      renavam: veiculoRaw.renavam || "—",
      motor: veiculoRaw.motor || "—",
      municipio: veiculoRaw.municipio || "—",
      uf: veiculoRaw.uf || "—",
      ...veiculoRaw
    };

    const proprietarioRaw = (raw.data?.["proprietario-atual"] || raw.data?.proprietario_atual || raw.data?.proprietario || {}) as Record<string, any>;
    const proprietario = {
      nome: proprietarioRaw.nome || proprietarioRaw.proprietario_nome || "—",
      documento: proprietarioRaw.documento || proprietarioRaw.proprietario_documento || "—",
      municipio: proprietarioRaw.municipio || veiculo.municipio || "—",
      uf: proprietarioRaw.uf || veiculo.uf || "—"
    };

    const fipeRaw = (raw.data?.fipe || {}) as Record<string, any>;
    const fipe = {
      codigoFipe: fipeRaw.codigoFipe || fipeRaw.codigo_fipe || "—",
      modelo: fipeRaw.modelo || "—",
      anoModelo: fipeRaw.anoModelo || fipeRaw.ano_modelo || "—",
      combustivel: fipeRaw.combustivel || "—",
      mesReferencia: fipeRaw.mesReferencia || fipeRaw.referencia || "—",
      valor: fipeRaw.valor || "—"
    };

    const kmRaw = (raw.data?.["historico-km"] || raw.data?.historicoKm || {}) as Record<string, any>;
    const historicoKm = {
      registros: ((kmRaw.registros) || []).map((reg: any) => ({
        data: reg.data || "—",
        km: reg.km || 0,
        fonte: reg.fonte || "—",
        uf: reg.uf || reg.estado || "—"
      })),
      anomalia: kmRaw.anomalia ?? false,
      motivoAnomalia: kmRaw.motivoAnomalia || kmRaw.motivo_anomalia || "Anomalia detectada no hodômetro"
    };

    const renajudRaw = (raw.data?.renajud || {}) as Record<string, any>;
    const renajud = {
      temRestricao: renajudRaw.temRestricao ?? renajudRaw.tem_restricao ?? false,
      restricoes: renajudRaw.restricoes || [],
      processo: renajudRaw.processo || null,
      orgaoJudicial: renajudRaw.orgaoJudicial || renajudRaw.orgao_judicial || null,
      tribunal: renajudRaw.tribunal || null
    };

    const renainfRaw = (raw.data?.renainf || {}) as Record<string, any>;
    const renainf = {
      totalMultas: renainfRaw.totalMultas ?? renainfRaw.total_multas ?? (renainfRaw.multas ? renainfRaw.multas.length : 0),
      valorTotal: renainfRaw.valorTotal || renainfRaw.valor_total || "R$ 0,00",
      multas: (renainfRaw.multas || []).map((m: any) => ({
        data: m.data || m.data_infracao || m.dataHora || "—",
        descricao: m.descricao || "—",
        valor: m.valor || m.valor_infracao || "—",
        orgao: m.orgao || m.orgao_atuador || "—",
        situacao: m.situacao || "PENDENTE"
      }))
    };

    const rfRaw = (raw.data?.["roubo-furto"] || raw.data?.rouboFurto || {}) as Record<string, any>;
    const rouboFurto = {
      temOcorrencia: rfRaw.temOcorrencia ?? rfRaw.tem_ocorrencia ?? false,
      ocorrencias: (rfRaw.ocorrencias || []).map((o: any) => ({
        data: o.data || "—",
        tipo: o.tipo || "—",
        boletim: o.boletim || "—",
        localidade: o.localidade || "—",
        situacao: o.situacao || "—"
      }))
    };

    const recallRaw = (raw.data?.recall || {}) as Record<string, any>;
    const recall = {
      temRecall: recallRaw.temRecall ?? recallRaw.tem_recall ?? false,
      ocorrencias: (recallRaw.ocorrencias || []).map((oc: any) => ({
        fabricante: oc.fabricante || "—",
        modelo: oc.modelo || "—",
        campanha: oc.campanha || "—",
        defeito: oc.defeito || "—",
        situacao: oc.situacao || "—"
      }))
    };

    return NextResponse.json({
      veiculo,
      proprietario,
      fipe,
      historicoKm,
      renajud,
      renainf,
      rouboFurto,
      recall,
      _raw: raw
    });
  } catch (err) {
    if (err instanceof APIBrasilError) {
      console.error(`[/api/apibrasil/analitico-veicular] ${err.message}`, err.details);
      return NextResponse.json(
        { error: err.message, statusCode: err.statusCode, details: err.details },
        { status: err.statusCode >= 400 ? err.statusCode : 500 }
      );
    }
    const message = err instanceof Error ? err.message : "Erro inesperado.";
    console.error("[/api/apibrasil/analitico-veicular]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
