/**
 * transform.ts — Transforma a resposta da API /api/apibrasil/snc-autoscore
 * no tipo VehicleReport consumido pelo frontend.
 */

import type {
  VehicleReport,
  Parecer,
  ParecerTom,
  Score,
  Identificacao,
  Proprietario,
  ProprietarioAnterior,
  RouboFurto,
  RestricoesBin,
  Renajud,
  Gravame,
  Debitos,
  Odometro,
  HistoricoKm,
  Fipe,
  FipePonto,
  RenainfInfracao,
  Renainf,
  LeilaoOcorrencia,
  Leilao,
  Recall,
  Crlve,
} from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Gera um ID alfanumérico aleatório de 8 caracteres (ex: "49XCJD5X"). */
function gerarReportId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/** Gera hash no formato "HEX12-REPORTID-SNC". */
function gerarHash(reportId: string): string {
  const hex = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase()
  ).join("");
  return `${hex}-${reportId}-SNC`;
}

/** Gera protocolo no formato "AAAA.MMDD-HHmm". */
function gerarProtocolo(now: Date): string {
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  const hora = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${ano}.${mes}${dia}-${hora}${min}`;
}

/** Formata a data de emissão no padrão "DD MMM AAAA · HH:MM:SS BRT". */
function formatarEmitidoEm(now: Date): string {
  const meses = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
  ];
  const dia = String(now.getDate()).padStart(2, "0");
  const mes = meses[now.getMonth()];
  const ano = now.getFullYear();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${dia} ${mes} ${ano} · ${h}:${m}:${s} BRT`;
}

/**
 * Converte string BRL ("R$ 1.234,56" | "R$ 0,00" | "—") para número.
 * Retorna 0 se não for possível parsear.
 */
function parseBRL(valor: string | number | null | undefined): number {
  if (valor === null || valor === undefined) return 0;
  if (typeof valor === "number") return valor;
  const limpo = valor
    .replace(/R\$\s*/gi, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const n = parseFloat(limpo);
  return isNaN(n) ? 0 : n;
}

/** Formata número para BRL (R$ 1.234,56). */
function formatBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

/** Retorno seguro de string. */
function str(v: any, fallback = "—"): string {
  if (v === null || v === undefined || v === "") return fallback;
  return String(v);
}

/** Retorno seguro de boolean. */
function bool(v: any): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v === "1" || v.toUpperCase() === "SIM" || v.toUpperCase() === "TRUE";
  return !!v;
}

/** Calcula o grau (A/B/C/D/E) a partir do score numérico. */
function scoreParaGrau(score: number): string {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "E";
}

// ─── Transform Principal ──────────────────────────────────────────────────────

export function transformApiToReport(api: any, placa: string): VehicleReport {
  const now = new Date();
  const reportId = gerarReportId();

  // ── Dados primitivos da API ──
  const ident = api?.identificacao ?? {};
  const tec = api?.dadosTecnicos ?? {};
  const prop = api?.proprietario ?? {};
  const rf = api?.rouboFurto ?? {};
  const resBin = api?.restricoesBin ?? {};
  const leilaoApi = api?.leilao ?? {};
  const debitosApi = api?.debitos ?? {};
  const kmApi = api?.historicoKm ?? {};
  const gravameApi = api?.gravame ?? {};
  const renajudApi = api?.renajudDetalhes ?? {};
  const renainfApi = api?.renainf ?? {};
  const recallApi = api?.recall ?? {};
  const crlveApi = api?.crlve ?? {};
  const precificadorApi = api?.precificador ?? [];
  const historicoFipeApi = api?.historicoFipe ?? [];
  const historicoPropsApi = api?.historicoProprietarios ?? [];

  // ── Score ──
  const scoreValor = typeof leilaoApi.score === "number"
    ? leilaoApi.score
    : parseInt(leilaoApi.score, 10) || 0;
  const scoreGrau = scoreParaGrau(scoreValor);
  const scoreRotulo = str(leilaoApi.scoreLabel, scoreGrau === "A" ? "BAIXO RISCO" : "ALTO RISCO");

  const score: Score = {
    valor: scoreValor,
    grau: scoreGrau,
    rotulo: scoreRotulo,
    aceitacao: typeof leilaoApi.aceitacao === "number"
      ? leilaoApi.aceitacao
      : parseInt(leilaoApi.aceitacao, 10) || 0,
    sobreFipe: typeof leilaoApi.percentualSobreFipe === "number"
      ? leilaoApi.percentualSobreFipe
      : parseInt(leilaoApi.percentualSobreFipe, 10) || 0,
    vistoria: str(leilaoApi.exigeVistoriaEspecial, "NÃO"),
    indicioSinistro: bool(leilaoApi.indicio),
  };

  // ── Restrições flag ──
  const temRestricaoGeral = bool(resBin.existeRestricaoGeral);
  const temSinistro = bool(resBin.alertaSinistro);
  const temRenajud = bool(resBin.renajud);
  const temRouboFurto = bool(resBin.rouboFurto);
  const temBaixado = bool(resBin.veiculoBaixado);
  const temGravameAtivo =
    gravameApi.situacao != null &&
    gravameApi.situacao !== "SEM GRAVAME" &&
    gravameApi.financiamento != null;

  const temAlgumaRestricao =
    temRestricaoGeral || temSinistro || temRenajud || temRouboFurto || temBaixado || temGravameAtivo;

  // ── Parecer ──
  const parecer: Parecer = temAlgumaRestricao
    ? {
        status: "Reprovado · Alto risco",
        tom: "bad" as ParecerTom,
        titulo: "Restrições impeditivas identificadas nos registros nacionais",
        resumo: buildResumoRestrito(resBin, gravameApi, kmApi, leilaoApi, debitosApi),
        recomendacao: "Aquisição NÃO recomendada até regularização.",
      }
    : {
        status: "Aprovado · Baixo risco",
        tom: "ok" as ParecerTom,
        titulo: "Veículo sem restrições impeditivas nos registros nacionais",
        resumo:
          "Nenhuma restrição cadastral, judicial ou financeira identificada. " +
          "Nenhum registro de roubo/furto no BIN Nacional. Sem sinistro, sem gravame ativo e sem débitos pendentes. " +
          "Histórico de quilometragem consistente.",
        recomendacao: "Veículo recomendado para aquisição.",
      };

  // ── Identificação ──
  const marcaRaw = str(tec.marca, ident.marcaModelo?.split("/")[0] ?? "—");
  const modeloRaw = str(tec.modelo, ident.marcaModelo?.split("/").slice(1).join("/") ?? "—");

  const identificacao: Identificacao = {
    marca: marcaRaw,
    modelo: modeloRaw,
    marcaModelo: str(ident.marcaModelo, `${marcaRaw}/${modeloRaw}`),
    crlv: str(prop.crlv),
    chassi: str(tec.chassi),
    renavam: str(prop.renavam),
    anoFab: str(ident.anoFabricacao),
    anoMod: str(ident.anoModelo),
    cor: str(tec.cor),
    combustivel: str(ident.combustivel),
    motor: str(tec.motor),
    categoria: str(ident.categoria),
    especieTipo: [str(tec.especie, ""), str(tec.tipo, "")]
      .filter(Boolean)
      .join("/") || "—",
    carroceria: str(tec.carroceria),
    capacidade: str(tec.capacidadePassageiros),
    procedencia: str(tec.procedencia),
    potencia: str(tec.potencia),
    cilindrada: str(tec.cilindrada),
    eixos: str(tec.eixos),
    pbt: str(tec.pbt),
    emissaoCrlv: str(tec.dataEmissaoCrlv),
    ultimoCrv: str(tec.dataUltimoCrv),
    placa: placa.toUpperCase().replace(/[^A-Z0-9]/g, ""),
    municipio: str(ident.municipio),
    uf: str(ident.uf),
  };

  // ── Proprietário ──
  const proprietario: Proprietario = {
    nome: str(prop.nome),
    documento: str(prop.documento),
    municipioUf: [str(prop.municipio, ""), str(prop.uf, "")]
      .filter(Boolean)
      .join("/") || "—",
    status: str(prop.statusDescricao ?? ident.statusDescricao, "SITUAÇÃO REGULAR"),
    atualizacao: str(prop.dataAtualizacao),
  };

  // ── Proprietários Anteriores ──
  const proprietariosAnteriores: ProprietarioAnterior[] = (
    Array.isArray(historicoPropsApi) ? historicoPropsApi : []
  ).map((p: any) => ({
    nome: str(p.nome),
    documento: str(p.documento),
    municipioUf: [str(p.municipio, ""), str(p.uf, "")]
      .filter(Boolean)
      .join("/") || "—",
    data: str(p.dataAtualizacao),
  }));

  // ── Roubo/Furto ──
  const rouboFurto: RouboFurto = {
    declaracao: bool(rf.declaracao),
    devolucao: bool(rf.devolucao),
    recuperacao: bool(rf.recuperacao),
  };

  // ── Restrições BIN ──
  const restricoesBin: RestricoesBin = {
    geral: temRestricaoGeral,
    sinistro: temSinistro,
    renajud: temRenajud,
    baixado: temBaixado,
    rouboFurto: temRouboFurto,
    mensagens: Array.isArray(resBin.mensagens) ? resBin.mensagens : [],
  };

  // ── RENAJUD ──
  const renajud: Renajud = {
    temRestricao: temRenajud || renajudApi != null,
    processo: renajudApi?.processo ?? null,
    tribunal: renajudApi?.tribunal ?? renajudApi?.orgaoJudicial ?? null,
    restricoes: Array.isArray(renajudApi?.restricoes) ? renajudApi.restricoes : [],
  };

  // ── Gravame ──
  const gravame: Gravame = {
    situacao: str(gravameApi.situacao, "SEM GRAVAME"),
    financiamento: bool(gravameApi.financiamento),
    status: gravameApi.situacao === "ATIVO" || bool(gravameApi.financiamento) ? "ATIVO" : "NADA CONSTA",
    agente: str(gravameApi.agenteFinanceiro),
    contrato: str(gravameApi.contratoNumero),
    inclusao: str(gravameApi.dataInclusao),
  };

  // ── Débitos ──
  const multasVal = parseBRL(debitosApi.totalMultas);
  const ipvaVal = parseBRL(debitosApi.totalIpva);
  const licVal = parseBRL(debitosApi.totalLicenciamento);
  const dpvatVal = parseBRL(debitosApi.totalDpvat);
  const outrosVal = parseBRL(debitosApi.totalOutros);
  const totalVal = parseBRL(debitosApi.totalGeral) || (multasVal + ipvaVal + licVal + dpvatVal + outrosVal);

  const debitos: Debitos = {
    multas: multasVal,
    ipva: ipvaVal,
    licenciamento: licVal,
    dpvat: dpvatVal,
    outros: outrosVal,
    total: totalVal,
    totalFmt: formatBRL(totalVal),
    multasFmt: formatBRL(multasVal),
    ipvaFmt: formatBRL(ipvaVal),
    licenciamentoFmt: formatBRL(licVal),
    dpvatFmt: formatBRL(dpvatVal),
    outrosFmt: formatBRL(outrosVal),
  };

  // ── Odômetro ──
  const registrosKm = Array.isArray(kmApi.registros) ? kmApi.registros : [];
  const kmMaisRecente = registrosKm.length > 0
    ? Math.max(...registrosKm.map((r: any) => Number(r.km) || 0))
    : 0;

  const odometro: Odometro = {
    atual: kmMaisRecente,
    anomalia: bool(kmApi.anomalia),
    motivo: str(kmApi.motivoAnomalia, "NENHUMA DIVERGÊNCIA IDENTIFICADA"),
  };

  // ── Histórico KM ──
  const historicoKm: HistoricoKm[] = registrosKm.map((r: any) => ({
    data: str(r.data),
    km: Number(r.km) || 0,
    fonte: str(r.fonte),
    uf: str(r.estado),
    consistencia: detectarConsistencia(r, registrosKm, bool(kmApi.anomalia)),
  }));

  // ── FIPE (precificador) ──
  const precFirst = precificadorApi[0] ?? {};
  const fipeValor = parseBRL(precFirst.preco);

  const fipe: Fipe = {
    codigo: str(precFirst.codigo),
    modelo: str(precFirst.fabricanteModelo),
    anoModelo: str(precFirst.anoModelo ?? ident.anoModelo),
    informante: str(precFirst.informante, "FIPE"),
    valor: fipeValor,
    valorFmt: fipeValor > 0 ? formatBRL(fipeValor) : "—",
    referencia: gerarReferenciaFipe(now),
  };

  // ── Histórico FIPE ──
  const fipeHistorico: FipePonto[] = (Array.isArray(historicoFipeApi) ? historicoFipeApi : []).map(
    (item: any) => ({
      mes: str(item.mes),
      valor: typeof item.valor === "number" ? item.valor : parseBRL(item.valor ?? item.valorFormatado),
    })
  );

  // ── RENAINF ──
  const renainfOcorrencias = Array.isArray(renainfApi.ocorrencias) ? renainfApi.ocorrencias : [];
  const renainfTotal = parseInt(renainfApi.total, 10) || renainfOcorrencias.length;
  const renainfValorTotal = renainfOcorrencias.reduce(
    (acc: number, o: any) => acc + parseBRL(o.valor),
    0
  );

  const renainf: Renainf = {
    total: renainfTotal,
    valorTotal: formatBRL(renainfValorTotal),
    infracoes: renainfOcorrencias.map(
      (o: any): RenainfInfracao => ({
        data: str(o.dataHora ?? o.data),
        local: str(o.local),
        orgao: str(o.orgao),
        descricao: str(o.descricao),
        valor: str(o.valor),
        situacao: str(o.situacao),
      })
    ),
  };

  // ── Leilão ──
  const leilaoHistorico = Array.isArray(leilaoApi.historico) ? leilaoApi.historico : [];

  const leilao: Leilao = {
    grau: scoreGrau,
    pontuacao: scoreValor,
    aceitacao: score.aceitacao,
    sobreFipe: score.sobreFipe,
    vistoria: score.vistoria,
    indicioSinistro: score.indicioSinistro,
    total: typeof leilaoApi.totalLeiloes === "number" ? leilaoApi.totalLeiloes : leilaoHistorico.length,
    rotulo: scoreRotulo,
    ocorrencias: leilaoHistorico.map(
      (o: any): LeilaoOcorrencia => ({
        data: str(o.data),
        leiloeiro: str(o.leiloeiro),
        comitente: str(o.comitente),
        lote: str(o.lote),
        condicao: str(o.condicaoGeral ?? o.condicao),
        uf: str(o.patio?.split(" - ").pop() ?? o.uf),
      })
    ),
  };

  // ── Recall ──
  const recallTotal = parseInt(recallApi.total, 10) || 0;
  const recallOcorrencias = Array.isArray(recallApi.ocorrencias) ? recallApi.ocorrencias : [];

  const recall: Recall = {
    total: recallTotal,
    reparado: recallTotal === 0 ||
      recallOcorrencias.every((o: any) =>
        (o.situacao ?? "").toUpperCase().includes("ATENDIDO") ||
        (o.situacao ?? "").toUpperCase().includes("REPARADO")
      ),
    descricao: recallTotal === 0
      ? "Nenhum recall pendente"
      : recallOcorrencias
          .map((o: any) => `${str(o.campanha ?? o.defeito)} — ${str(o.situacao)}`)
          .join("; "),
  };

  // ── CRLV-e ──
  const crlve: Crlve = {
    exercicio: str(crlveApi.exercicio),
    ocorrencia: bool(crlveApi.existeOcorrencia) ? "SIM" : "NÃO",
    observacoes: str(crlveApi.observacoes, "SEM OBSERVAÇÕES REGISTRADAS"),
    status: str(crlveApi.statusDescricao, "CONSULTA CONCLUÍDA COM SUCESSO"),
  };

  // ── Cenário ──
  const cenario = temAlgumaRestricao ? "restrito" : "limpo";

  // ── Montagem Final ──
  return {
    cenario,
    protocolo: gerarProtocolo(now),
    reportId,
    hash: gerarHash(reportId),
    emitidoEm: formatarEmitidoEm(now),
    parecer,
    score,
    identificacao,
    proprietario,
    proprietariosAnteriores,
    rouboFurto,
    restricoesBin,
    renajud,
    gravame,
    debitos,
    odometro,
    historicoKm,
    fipe,
    fipeHistorico,
    renainf,
    leilao,
    recall,
    crlve,
  };
}

// ─── Funções Auxiliares Internas ───────────────────────────────────────────────

/** Constrói o resumo descritivo para veículos com restrições. */
function buildResumoRestrito(
  resBin: any,
  gravame: any,
  km: any,
  leilao: any,
  debitos: any
): string {
  const partes: string[] = [];

  if (bool(resBin.renajud)) partes.push("Bloqueio judicial ativo (RENAJUD)");
  if (bool(resBin.rouboFurto)) partes.push("registro de roubo/furto no BIN Nacional");
  if (bool(resBin.alertaSinistro)) partes.push("alerta de sinistro");
  if (bool(resBin.veiculoBaixado)) partes.push("veículo baixado");

  if (
    gravame?.situacao != null &&
    gravame.situacao !== "SEM GRAVAME" &&
    bool(gravame.financiamento)
  ) {
    partes.push("gravame financeiro em aberto");
  }

  if (parseBRL(debitos?.totalGeral) > 0) partes.push("débitos pendentes no DETRAN");
  if (bool(km?.anomalia)) partes.push("divergência de hodômetro detectada");
  if (bool(leilao?.indicio)) partes.push("registros de leilão com indício de sinistro");

  if (partes.length === 0) {
    return "Restrições identificadas nos registros nacionais.";
  }

  // Capitaliza a primeira parte e junta com vírgula + "e"
  const first = partes[0].charAt(0).toUpperCase() + partes[0].slice(1);
  if (partes.length === 1) return `${first}.`;

  const rest = partes.slice(1);
  const last = rest.pop()!;
  const mid = rest.length > 0 ? rest.join(", ") + ", " : "";
  return `${first}, ${mid}${last}.`;
}

/**
 * Detecta a consistência de um registro de KM com base na anomalia global
 * e na posição relativa (registros já devem vir ordenados do mais recente
 * ao mais antigo pela API).
 */
function detectarConsistencia(
  registro: any,
  todosRegistros: any[],
  anomaliaGlobal: boolean
): string {
  if (!anomaliaGlobal) return "OK";

  const km = Number(registro.km) || 0;
  const idx = todosRegistros.indexOf(registro);

  // Se há um registro mais antigo (índice maior) com KM maior, é divergente
  for (let i = idx + 1; i < todosRegistros.length; i++) {
    const kmAnterior = Number(todosRegistros[i].km) || 0;
    if (kmAnterior > km) return "DIVERGENTE";
  }

  // Se há um registro mais recente (índice menor) com KM menor, é divergente
  for (let i = 0; i < idx; i++) {
    const kmPosterior = Number(todosRegistros[i].km) || 0;
    if (kmPosterior < km) return "DIVERGENTE";
  }

  return "OK";
}

/** Gera a referência FIPE no formato "MMM/AAAA" (ex: "JUN/2026"). */
function gerarReferenciaFipe(now: Date): string {
  const meses = [
    "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
    "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
  ];
  return `${meses[now.getMonth()]}/${now.getFullYear()}`;
}
