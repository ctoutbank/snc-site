/**
 * email-autoscore.ts — E-mail de notificação do relatório SNC Auto Score
 *
 * Notificação ENXUTA: resumo do veículo + link para o relatório completo.
 * O CRLV-e oficial segue como anexo PDF (mecanismo em enviarEmailAutoScore).
 *
 * Template email-safe (tabelas + estilos inline, sem CSS vars/grid/flex/SVG),
 * irmão visual do e-mail do SuperScore.
 *
 * Exporta:
 *   • gerarHtmlEmailAutoScore(data, placa, protocolo, fullUrl) → HTML string
 *   • enviarEmailAutoScore(data, placa) → envia via Resend com anexo PDF
 */

import { getResend } from '@/lib/resend';
import { gerarUrlRelatorio } from '@/lib/relatorio';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AutoScoreEmailData {
  identificacao?: {
    placa?: string;
    marcaModelo?: string;
    anoFabricacao?: string;
    anoModelo?: string;
    uf?: string;
    statusDescricao?: string;
  };
  leilao?: {
    score?: number;
    scoreLabel?: string;
    aceitacao?: number;
    totalLeiloes?: number;
    indicio?: boolean;
    sinistro?: { existeOcorrencia?: boolean };
  };
  debitos?: {
    totalGeral?: string;
    totalMultas?: string;
    totalIpva?: string;
    multas?: any[];
  };
  precificador?: { preco?: string }[];
  gravame?: {
    financiamento?: string;
    situacao?: string;
    agenteFinanceiro?: string;
  };
  rouboFurto?: { declaracao?: boolean };
  restricoesBin?: {
    existeRestricaoGeral?: boolean;
    renajud?: boolean;
    rouboFurto?: boolean;
    veiculoBaixado?: boolean;
    alertaSinistro?: boolean;
  };
  historicoKm?: { anomalia?: boolean; motivoAnomalia?: string };
  crlve?: { pdfBase64?: string; pdf?: string; veiculo?: any };
  status?: Record<string, string>;
}

// ─── Paleta (email-safe: valores literais, sem CSS vars) ────────────────────────

const C = {
  navy: '#0a1628', navy2: '#13243f',
  paper: '#f4f1ea', ink: '#0a0e16', ink2: '#3a4252',
  green: '#2ba84a', greenD: '#1d7a36',
  brass: '#c8a25a',
  red: '#9c2a2a', redD: '#6e1e1e',
  amber: '#a37b1f',
  cream: '#faf8f1', line: '#d4cfc1', line2: '#ece7d8',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fb(val: string | number | undefined | null, def = '—'): string {
  if (val === undefined || val === null || val === '') return def;
  return String(val);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function scoreColor(score: number | undefined): 'green' | 'amber' | 'red' | 'muted' {
  if (score === undefined || score === null) return 'muted';
  if (score >= 70) return 'green';
  if (score >= 40) return 'amber';
  return 'red';
}

// Hex do número de score, derivado da classe (sem clamp/invenção — só cor).
function scoreHex(c: 'green' | 'amber' | 'red' | 'muted'): string {
  switch (c) {
    case 'green': return C.greenD;
    case 'amber': return C.amber;
    case 'red': return C.redD;
    default: return C.ink2;
  }
}

function scoreGrade(score: number | undefined): string {
  if (score === undefined || score === null) return '—';
  if (score >= 90) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'E';
}

function formatDate(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd} ${mm} ${yyyy} · ${hh}:${min} BRT`;
}

function fipePrice(precificador: AutoScoreEmailData['precificador']): string {
  if (!precificador || precificador.length === 0) return '—';
  const p = precificador[0]?.preco;
  return p ? `R$ ${p}` : '—';
}

// Largura da barra (score 0-100 → %); preserva o valor nativo, só visual.
function barWidth(score: number | undefined): string {
  if (score === undefined || score === null) return '0%';
  return `${Math.min(100, Math.max(0, score))}%`;
}

// ─── HTML Generator ───────────────────────────────────────────────────────────

export function gerarHtmlEmailAutoScore(
  data: AutoScoreEmailData,
  placa: string,
  protocolo: string,
  fullUrl: string
): string {
  const ident = data.identificacao;
  const leilao = data.leilao;
  const debitos = data.debitos;
  const gravame = data.gravame;
  const restricoes = data.restricoesBin;
  const crlve = data.crlve;

  const score = leilao?.score;
  const hasScore = score !== undefined && score !== null;
  const sColor = scoreColor(score);
  const sHex = scoreHex(sColor);
  const sGrade = scoreGrade(score);
  const sLabel = fb(leilao?.scoreLabel, 'Sem classificação');

  const hasRestrictions = restricoes?.existeRestricaoGeral === true;

  // Severidade combinada (restrições > score) — guia cor estrutural do e-mail.
  type Sev = 'good' | 'warn' | 'bad';
  const sev: Sev = hasRestrictions
    ? 'bad'
    : sColor === 'green' ? 'good' : sColor === 'amber' ? 'warn' : sColor === 'red' ? 'bad' : 'warn';
  const accentMain = sev === 'good' ? C.green : sev === 'warn' ? C.amber : C.red;
  const accentDeep = sev === 'good' ? C.greenD : sev === 'warn' ? C.amber : C.redD;

  // Rótulo de situação (topo do hero) — não contradiz o acento.
  const situLabel = hasRestrictions ? 'COM RESTRIÇÕES' : sLabel.toUpperCase();

  // Parecer (título + descrição curta, só com sinais reais).
  const parecerTitle = hasRestrictions ? 'Restrições ativas nos registros' : sLabel;
  const parecerDesc = hasRestrictions
    ? `Foram identificadas restrições nos registros nacionais consultados${restricoes?.rouboFurto ? ' · alerta de roubo/furto' : ''}${restricoes?.renajud ? ' · bloqueio RENAJUD' : ''}. Consulte o relatório para o detalhamento.`
    : `Sem restrições impeditivas nos registros nacionais consultados. Score de leilão ${hasScore ? score : '—'}/100.`;

  // ── Tiles do resumo (valores reais; cor segue hierarquia de design) ──
  const fipe = fipePrice(data.precificador);
  const fipeColor = fipe === '—' ? C.ink2 : C.brass; // ouro = destaque de valor, não "positivo"

  const totalDebitos = fb(debitos?.totalGeral, 'R$ 0,00');
  const debitosIsZero = /^0*$/.test(totalDebitos.replace(/\D/g, '')); // robusto a formato
  const debitosColor = debitosIsZero ? C.greenD : C.redD;
  const multasCount = debitos?.multas?.length ?? 0;

  const gravameSituation = gravame?.financiamento ? fb(gravame.situacao, 'Ativo') : 'Livre';
  const gravameColor = gravame?.financiamento ? C.amber : C.greenD;
  const gravameSub = gravame?.financiamento ? fb(gravame.agenteFinanceiro) : 'sem alienação';

  const hasCrlvePdf = Boolean(crlve?.pdfBase64 || crlve?.pdf);

  // ── Escala A–E (pior→melhor, esq→dir), realçando a faixa atual ──
  const letters = ['E', 'D', 'C', 'B', 'A'];
  const escala = letters.map((L, idx) => {
    const is = L === sGrade;
    const br = idx < letters.length - 1 ? `border-right:1px solid ${C.line};` : '';
    return `<td align="center" style="font-family:'JetBrains Mono',monospace;font-size:9px;color:${is ? accentMain : C.ink2};font-weight:${is ? 700 : 400};${br}padding:3px 0;">${L}</td>`;
  }).join('');

  const tile = (l: string, v: string, x: string, color: string, last: boolean) => `
    <td width="33.33%" valign="top" style="padding:12px 16px;${last ? '' : `border-right:1px solid ${C.line2};`}">
      <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.12em;color:${C.ink2};text-transform:uppercase;">${escapeHtml(l)}</div>
      <div style="font-family:'Libre Caslon Text',Georgia,serif;font-size:20px;color:${color};margin-top:4px;">${escapeHtml(v)}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:${C.ink2};margin-top:4px;">${escapeHtml(x)}</div>
    </td>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Seu relatório Auto Score está pronto</title>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#dad6cb;font-family:Helvetica,Arial,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#dad6cb;"><tr><td align="center" style="padding:24px 12px 50px;">
    <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #c8c2b1;">

      <!-- ── Head band (navy) ── -->
      <tr><td style="background:${C.navy};border-bottom:5px solid ${accentMain};padding:24px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td valign="middle" style="width:44px;height:44px;border:1.5px solid ${C.brass};text-align:center;font-family:'Libre Caslon Text',Georgia,serif;font-style:italic;font-size:18px;color:#fff;">S</td>
              <td valign="middle" style="padding-left:14px;">
                <div style="font-family:'Libre Caslon Text',Georgia,serif;font-size:14px;color:#fff;line-height:1.1;">Sistema Nacional de Conformidade</div>
                <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#8a94a3;margin-top:5px;">Auto Score · Relatório veicular</div>
              </td>
            </tr></table>
          </td>
          <td valign="middle" align="right">
            <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:${C.brass};">Protocolo SNC</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:15px;color:#fff;margin-top:4px;">${escapeHtml(protocolo)}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;color:#8a94a3;margin-top:4px;">Emitido em ${formatDate()}</div>
          </td>
        </tr></table>
      </td></tr>

      <!-- ── Body ── -->
      <tr><td style="background:${C.paper};padding:34px 40px 28px;">

        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${C.brass};">§ Notificação automatizada</div>
        <div style="font-family:'Libre Caslon Text',Georgia,serif;font-size:28px;line-height:1.15;color:${C.ink};margin:12px 0 14px;">A consulta Auto Score do veículo <span style="font-style:italic;color:#8a8170;">${escapeHtml(placa)}</span> foi concluída.</div>
        <p style="font-size:14px;color:${C.ink2};line-height:1.7;margin:0;">
          O relatório do veículo <strong style="color:${C.ink};">${escapeHtml(fb(ident?.marcaModelo))}</strong>, ano <strong style="color:${C.ink};">${escapeHtml(fb(ident?.anoFabricacao))}/${escapeHtml(fb(ident?.anoModelo))}</strong>, registrado em <strong style="color:${C.ink};">${escapeHtml(fb(ident?.uf))}</strong>, foi processado. ${hasRestrictions ? `<strong style="color:${C.redD};">Há restrições ativas</strong> nos registros nacionais.` : 'Sem restrições impeditivas nos registros nacionais consultados.'}
        </p>

        <!-- ── HERO CARD (resumo) ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 26px;background:#fff;border:1px solid ${C.line};border-left:5px solid ${accentMain};">
          <tr><td style="padding:14px 20px;border-bottom:1px solid ${C.line2};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:${C.ink2};">SNC Auto Score · Risco veicular</td>
              <td align="right" style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;color:${accentDeep};text-transform:uppercase;">${escapeHtml(situLabel)}</td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:22px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="190" valign="middle" style="border-right:1px solid ${C.line2};padding-right:20px;">
                <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:${C.ink2};">Score de risco</div>
                <div style="font-family:'Libre Caslon Text',Georgia,serif;font-size:72px;line-height:.95;color:${sHex};">${hasScore ? score : '—'}</div>
                <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${C.ink2};margin-top:4px;">/ 100 · FAIXA ${sGrade}</div>
              </td>
              <td valign="middle" style="padding-left:22px;">
                <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:${C.ink2};">Parecer Auto Score</div>
                <div style="font-family:'Libre Caslon Text',Georgia,serif;font-size:22px;line-height:1.1;color:${accentDeep};margin:6px 0;">${escapeHtml(parecerTitle)}</div>
                <p style="font-size:12.5px;color:${C.ink2};line-height:1.55;margin:0;">${escapeHtml(parecerDesc)}</p>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:0 24px 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;"><tr>
              <td style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:${C.ink2};">0 — Risco crítico</td>
              <td align="right" style="font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:${C.ink2};">100 — Excelente</td>
            </tr></table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.line2};border:1px solid ${C.line};"><tr>
              <td style="width:${barWidth(score)};background:${accentMain};font-size:0;line-height:10px;height:10px;">&nbsp;</td>
              <td style="font-size:0;line-height:10px;height:10px;">&nbsp;</td>
            </tr></table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;"><tr>${escala}</tr></table>
          </td></tr>
          <tr><td style="background:${C.cream};border-top:1px solid ${C.line2};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              ${tile('Valor FIPE', fipe, data.precificador?.[0]?.preco ? 'Tabela FIPE vigente' : '—', fipeColor, false)}
              ${tile('Débitos totais', totalDebitos, `${multasCount} multa${multasCount !== 1 ? 's' : ''}`, debitosColor, false)}
              ${tile('Gravame', gravameSituation, gravameSub, gravameColor, true)}
            </tr></table>
          </td></tr>
        </table>

        <!-- ── CTA (link para o relatório) ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td align="center" style="background:${C.navy};border:1px solid ${C.navy};">
            <a href="${fullUrl}" target="_blank" style="display:block;padding:15px 24px;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:.04em;text-transform:uppercase;color:#ffffff;text-decoration:none;">Abrir relatório completo &rarr;</a>
          </td>
        </tr></table>
        <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${C.ink2};letter-spacing:.04em;margin-top:10px;text-align:center;">Ou acesse · <a href="${fullUrl}" target="_blank" style="color:${C.greenD};text-decoration:none;">${escapeHtml(fullUrl.replace(/^https?:\/\//, ''))}</a></div>

        ${hasCrlvePdf ? `<!-- ── CRLV-e anexo ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;background:${C.cream};border:1px solid ${C.line};"><tr>
          <td style="padding:14px 18px;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.16em;text-transform:uppercase;color:${C.brass};">Documento anexo</div>
            <div style="font-size:13px;color:${C.ink2};line-height:1.6;margin-top:5px;">O <strong style="color:${C.ink};">CRLV-e oficial</strong> do veículo segue anexado a este e-mail em PDF, pronto para download e impressão.</div>
          </td>
        </tr></table>` : ''}

        <!-- ── Dados do veículo ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 14px;"><tr>
          <td width="40" style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${C.brass};white-space:nowrap;">§ 01</td>
          <td style="font-family:'Libre Caslon Text',Georgia,serif;font-size:18px;color:${C.ink};padding:0 12px;white-space:nowrap;">Dados do veículo</td>
          <td style="border-bottom:1px solid ${C.line};">&nbsp;</td>
        </tr></table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};border:1px solid ${C.line};"><tr>
          <td width="50%" valign="top" style="padding:11px 14px;border-right:1px solid ${C.line2};border-bottom:1px solid ${C.line2};">
            <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:${C.ink2};">Placa</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${C.ink};margin-top:3px;">${escapeHtml(placa)}</div>
          </td>
          <td width="50%" valign="top" style="padding:11px 14px;border-bottom:1px solid ${C.line2};">
            <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:${C.ink2};">Marca / Modelo</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${C.ink};margin-top:3px;">${escapeHtml(fb(ident?.marcaModelo))}</div>
          </td>
        </tr><tr>
          <td width="50%" valign="top" style="padding:11px 14px;border-right:1px solid ${C.line2};">
            <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:${C.ink2};">Ano fab. / modelo</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${C.ink};margin-top:3px;">${escapeHtml(fb(ident?.anoFabricacao))}/${escapeHtml(fb(ident?.anoModelo))}</div>
          </td>
          <td width="50%" valign="top" style="padding:11px 14px;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:${C.ink2};">UF</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${C.ink};margin-top:3px;">${escapeHtml(fb(ident?.uf))}</div>
          </td>
        </tr></table>

        <p style="font-size:13px;color:${C.ink2};line-height:1.7;margin:22px 0 0;">
          O relatório completo traz a identificação do veículo, a relação integral de débitos e multas, o histórico de hodômetro, a análise de leilão e sinistro, o gravame e o CRLV-e oficial${hasCrlvePdf ? ' (também anexado a este e-mail)' : ''}. Abra o documento na web ou compartilhe o link com sua equipe.
        </p>
        <p style="font-size:13px;color:${C.ink2};line-height:1.7;margin:14px 0 0;">
          Dúvidas sobre os critérios de cálculo do Auto Score ou para contestar uma informação, fale com o encarregado SNC (DPO): <a href="mailto:dpo@snc.consolle.one" style="color:${C.greenD};text-decoration:none;font-weight:bold;">dpo@snc.consolle.one</a>.
        </p>

        <div style="margin-top:22px;padding-top:16px;border-top:1px solid ${C.line};">
          <div style="font-family:'Libre Caslon Text',Georgia,serif;font-size:15px;color:${C.ink};">Auto Score · Sistema Nacional de Conformidade</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8a8170;margin-top:3px;">Emissão automatizada · Relatório veicular</div>
        </div>
      </td></tr>

      <!-- ── Legal ── -->
      <tr><td style="background:${C.cream};border-top:1px solid ${C.line};padding:20px 40px;font-size:11px;color:${C.ink2};line-height:1.6;">
        <p style="margin:0;"><strong style="color:${C.ink2};">§ Validade jurídica.</strong> Documento emitido de forma automatizada pelo Sistema Nacional de Conformidade — SNC, plataforma de inteligência documental que agrega, padroniza e unifica registros provenientes de bases de dados públicas e privadas, mediante requisição autorizada com finalidade declarada. O tratamento dos dados observa a LGPD (Lei nº 13.709/2018, art. 7º, II, V e X; art. 11, II, "d"; art. 18), o Marco Civil da Internet (Lei nº 12.965/2014, art. 7º) e a Resolução BACEN nº 4.893/2021. Toda informação consolidada é rastreável à fonte primária e apresentada sem alteração de conteúdo.</p>
        <p style="margin:8px 0 0;"><strong style="color:${C.ink2};">Confidencialidade.</strong> Este e-mail destina-se exclusivamente ao(s) destinatário(s) acima. Caso o tenha recebido por engano, notifique o remetente e exclua a mensagem.</p>
      </td></tr>

      <!-- ── Footer ── -->
      <tr><td style="background:${C.navy};padding:20px 40px;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#8a94a3;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td>SNC · Documento Nº ${escapeHtml(protocolo)}</td>
          <td align="right" style="color:${C.brass};">snc.consolle.one</td>
        </tr></table>
      </td></tr>

    </table>
  </td></tr></table>
</body>
</html>`;
}

// ─── Email Sender ─────────────────────────────────────────────────────────────

export async function enviarEmailAutoScore(
  data: AutoScoreEmailData,
  placa: string
) {
  const { url, protocolo } = gerarUrlRelatorio(
    'snc-autoscore',
    placa,
    'PLACA',
    data as Record<string, unknown>
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://snc.consolle.one';
  const fullUrl = `${baseUrl}${url}`;
  const html = gerarHtmlEmailAutoScore(data, placa, protocolo, fullUrl);

  const attachments: { filename: string; content: string }[] = [];
  if (data.crlve?.pdfBase64) {
    attachments.push({
      filename: `CRLVE_${placa}.pdf`,
      content: data.crlve.pdfBase64,
    });
  }

  await getResend().emails.send({
    from: 'SNC · Auto Score <relatorios@consolle.one>',
    to: ['ceo@outbank.com.br'],
    subject: `Seu relatório Auto Score está pronto · Nº ${protocolo}`,
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}
