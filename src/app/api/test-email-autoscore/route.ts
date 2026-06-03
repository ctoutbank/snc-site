/**
 * Rota temporária para teste de e-mail do AutoScore.
 * Usa dados mock para gerar e enviar o e-mail sem consultar a APIBrasil.
 * DELETE APÓS TESTAR.
 */
import { NextResponse } from "next/server";
import { gerarHtmlEmailAutoScore, enviarEmailAutoScore } from "@/lib/email-autoscore";
import { getResend } from "@/lib/resend";
import { gerarUrlRelatorio } from "@/lib/relatorio";

export async function GET(request: Request) {
  // ?preview=1 → renderiza o HTML SEM enviar e-mail (visualização local).
  // ?preview=restrito → cenário com restrições/débitos (testa caminho vermelho).
  const previewMode = new URL(request.url).searchParams.get("preview");
  const isRestrito = previewMode === "restrito";

  // Dados mock simulando resposta completa do AutoScore (cenário clean)
  const mockData = {
    identificacao: {
      placa: "SNC2026",
      marcaModelo: "VW/FOX 1.0 GII",
      anoFabricacao: "2012",
      anoModelo: "2013",
      uf: "PR",
      statusDescricao: "EM CIRCULAÇÃO",
    },
    leilao: {
      score: 85,
      scoreLabel: "BAIXO RISCO",
      aceitacao: 95,
      totalLeiloes: 0,
      indicio: false,
      sinistro: { existeOcorrencia: false },
    },
    debitos: {
      totalGeral: "R$ 0,00",
      totalMultas: "R$ 0,00",
      totalIpva: "R$ 0,00",
      multas: [],
    },
    precificador: [{ preco: "24.500,00" }],
    gravame: {
      financiamento: null,
      situacao: "SEM GRAVAME",
      agenteFinanceiro: null,
    },
    rouboFurto: { declaracao: false },
    restricoesBin: {
      existeRestricaoGeral: false,
      renajud: false,
      rouboFurto: false,
      veiculoBaixado: false,
      alertaSinistro: false,
    },
    historicoKm: { anomalia: false },
    crlve: {
      exercicio: "2026",
      codigoSegurancaCla: "3512345678901234567890123456789012345678",
      existeOcorrencia: false,
      observacoes: "SEM OBSERVACOES REGISTRADAS",
      pdfBase64: "JVBERi0xLjQKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCjIgMCBvYmoKICA8PCAvVHlwZSAvUGFnZXMKICAgICAvS2lkcyBbIDMgMCBSIF0KICAgICAvQ291bnQgMQogID4+CmVuZG9iagozIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2UKICAgICAvUGFyZW50IDIgMCBSCiAgICAgL01lZGlhQm94IFsgMCAwIDU5NSA4NDIgXQogID4+CmVuZG9iago=",
      pdf: null,
      statusDescricao: "CONSULTA CONCLUIDA COM SUCESSO",
      veiculo: null,
    },
    status: {
      csv: "success",
      leilao: "success",
      debitos: "success",
      km: "success",
      gravame: "success",
      renajud: "success",
      fipe: "success",
      agregadosPropria: "success",
      crlve: "success",
    },
  };

  // Cenário com restrições/débitos para validar o caminho vermelho/âmbar.
  if (isRestrito) {
    mockData.leilao.score = 28;
    mockData.leilao.scoreLabel = "ALTO RISCO";
    mockData.leilao.indicio = true;
    mockData.leilao.totalLeiloes = 2;
    mockData.debitos.totalGeral = "R$ 3.482,15";
    mockData.debitos.totalMultas = "R$ 1.230,00";
    mockData.debitos.totalIpva = "R$ 2.252,15";
    mockData.debitos.multas = [{}, {}, {}] as never[];
    mockData.gravame.financiamento = "ALIENACAO FIDUCIARIA" as never;
    mockData.gravame.situacao = "Ativo";
    mockData.gravame.agenteFinanceiro = "BANCO XYZ FINANCEIRA S.A." as never;
    mockData.restricoesBin.existeRestricaoGeral = true;
    mockData.restricoesBin.renajud = true;
  }

  const placa = "SNC2026";

  try {
    // Gerar URL e protocolo
    const { url, protocolo } = gerarUrlRelatorio(
      "snc-autoscore",
      placa,
      "PLACA",
      mockData as Record<string, unknown>
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://snc.consolle.one";
    const fullUrl = `${baseUrl}${url}`;

    // Gerar HTML
    const html = gerarHtmlEmailAutoScore(mockData as any, placa, protocolo, fullUrl);

    // ?preview → devolve o HTML direto, sem enviar e-mail.
    if (previewMode) {
      return new NextResponse(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    // Preparar anexo CRLV-e
    const attachments: { filename: string; content: string }[] = [];
    if (mockData.crlve?.pdfBase64) {
      attachments.push({
        filename: `CRLVE_${placa}.pdf`,
        content: mockData.crlve.pdfBase64,
      });
    }

    // Enviar para e-mail de teste
    const resend = getResend();
    const result = await resend.emails.send({
      from: "SNC · Auto Score <relatorios@consolle.one>",
      to: ["denisonzl@gmail.com"],
      subject: `[TESTE] Seu relatório Auto Score está pronto · Nº ${protocolo}`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "E-mail de teste enviado para denisonzl@gmail.com",
      protocolo,
      resendId: result,
    });
  } catch (err: any) {
    console.error("[test-email-autoscore] Erro:", err);
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
