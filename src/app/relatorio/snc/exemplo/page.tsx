import type { Metadata } from 'next';
import { RelatorioToolbar } from './toolbar';

export const metadata: Metadata = {
  title: 'SNC · Relatório Exemplo #9999',
  description: 'Modelo demonstrativo de relatório SNC — Sistema Nacional de Conformidade.',
};

export default function RelatorioExemploPage() {
  const protocol = '2026.0505-9999';

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <style>{`
        *{box-sizing:border-box}
        :root{--navy:#0a1628;--paper:#f4f1ea;--ink:#0a0e16;--ink2:#3a4252;--rule:#1a2742;--green:#2ba84a;--greend:#1d7a36;--brass:#c8a25a;}
        html,body{background:#dad6cb;font-family:'Inter',sans-serif;color:var(--ink);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;margin:0;padding:0}
        .r-tb{position:sticky;top:0;z-index:50;background:var(--navy);color:#fff;padding:14px 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--rule)}
        .r-tb .left{display:flex;align-items:center;gap:18px}
        .r-tb .right{display:flex;gap:10px}
        .r-tb .ref{font-family:'JetBrains Mono',monospace;font-size:11px;color:#8a94a3;letter-spacing:.1em;text-transform:uppercase}
        .r-tb .ref strong{color:#fff;font-weight:500}
        .r-btn{padding:10px 16px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;font-family:'Inter',sans-serif;font-weight:500;border:1px solid #2a3a55;color:#fff;background:transparent;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:all .15s;text-decoration:none}
        .r-btn:hover{background:#17243b}
        .r-btn.primary{background:var(--green);border-color:var(--green);color:#0a1628;font-weight:600}
        .r-btn.primary:hover{background:var(--greend);color:#fff}
        .r-page{max-width:960px;margin:24px auto;background:var(--paper);box-shadow:0 18px 60px rgba(10,22,40,.18);position:relative;overflow:hidden}
        .r-wm{position:absolute;top:46%;left:50%;transform:translate(-50%,-50%) rotate(-22deg);font-family:'Libre Caslon Text',serif;font-size:140px;color:rgba(10,22,40,.04);pointer-events:none;font-style:italic;z-index:0;font-weight:700;white-space:nowrap}
        .r-page>*:not(.r-wm){position:relative;z-index:1}
        .r-head{background:var(--navy);color:#fff;padding:38px 56px 30px;border-bottom:6px solid var(--green)}
        .r-head-top{display:flex;justify-content:space-between;align-items:flex-start;gap:30px;padding-bottom:24px;border-bottom:1px solid #1a2742}
        .r-brand-meta .t1{font-family:'Libre Caslon Text',serif;font-size:16px;line-height:1}
        .r-brand-meta .t2{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#8a94a3;margin-top:6px}
        .r-did{text-align:right;font-family:'JetBrains Mono',monospace}
        .r-did .lbl{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--brass);margin-bottom:6px}
        .r-did .num{font-size:22px;color:#fff;font-weight:500;letter-spacing:.04em}
        .r-did .sub{font-size:10px;color:#8a94a3;margin-top:6px;letter-spacing:.06em}
        .r-title{padding-top:26px;display:grid;grid-template-columns:auto 1fr;gap:30px;align-items:end}
        .r-kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;color:var(--brass);text-transform:uppercase;writing-mode:vertical-rl;transform:rotate(180deg);align-self:start;padding-top:8px}
        .r-title h1{font-family:'Libre Caslon Text',serif;font-size:38px;font-weight:400;line-height:1.05;letter-spacing:-.015em;margin:0}
        .r-title h1 .it{font-style:italic;color:#9aa3b2}
        .r-title .lede{margin-top:14px;font-size:13px;color:#bcc4d1;max-width:560px;line-height:1.55}
        .r-ms{display:grid;grid-template-columns:repeat(4,1fr);background:#0e1d36;border-top:1px solid #1a2742}
        .r-ms>div{padding:16px 20px;border-right:1px solid #1a2742}
        .r-ms>div:last-child{border-right:none}
        .r-ms .l{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--brass);letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}
        .r-ms .v{font-size:12px;color:#fff;font-family:'JetBrains Mono',monospace;letter-spacing:.02em}
        .r-sec{padding:40px 56px}
        .r-sec+.r-sec{border-top:1px solid #d4cfc1}
        .r-sh{display:flex;align-items:baseline;gap:18px;margin-bottom:24px}
        .r-sh .num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--brass);letter-spacing:.16em;text-transform:uppercase;min-width:70px}
        .r-sh h2{font-family:'Libre Caslon Text',serif;font-size:22px;font-weight:400;letter-spacing:-.01em;color:var(--ink);flex:1;margin:0}
        .r-sh .badge{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:4px 10px;border:1px solid #cfc7b1;color:var(--ink2)}
        .r-summary{display:grid;grid-template-columns:1fr 1.4fr;gap:36px;align-items:start}
        .r-sl .label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;color:var(--ink2);text-transform:uppercase;margin-bottom:12px}
        .r-sl .sname{font-family:'Libre Caslon Text',serif;font-size:28px;line-height:1.1;letter-spacing:-.01em;margin-bottom:12px}
        .r-sl .sdoc{font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--ink2);letter-spacing:.04em}
        .r-sl .pfs{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px;padding-top:16px;border-top:1px solid #d4cfc1}
        .r-sl .pfs>div .l{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;color:var(--ink2);text-transform:uppercase;margin-bottom:3px}
        .r-sl .pfs>div .v{font-size:13px;color:var(--ink)}
        .r-vrd{background:#fff;border:1px solid #d4cfc1;padding:24px 26px;position:relative}
        .r-vrd::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--green)}
        .r-vrd-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
        .r-vrd-tag{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;color:var(--ink2);text-transform:uppercase}
        .r-vrd-stamp{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--greend)}
        .r-vrd-result{display:flex;align-items:center;gap:20px;padding:12px 0;border-top:1px solid #ece7d8;border-bottom:1px solid #ece7d8}
        .r-seal{width:56px;height:56px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;font-size:24px}
        .r-vt h3{font-family:'Libre Caslon Text',serif;font-size:20px;font-weight:400;color:var(--greend);margin:0}
        .r-vt p{font-size:12px;color:var(--ink2);margin-top:3px;margin-bottom:0}
        .r-vrd-msg{font-size:12px;color:var(--ink);line-height:1.65;margin-top:14px}
        .ds-block{margin-bottom:32px}
        .ds-hd{background:var(--navy);color:#fff;font-size:9px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;letter-spacing:.06em}
        .ds-row{padding:14px 16px;display:flex;justify-content:space-between;align-items:center;background:#faf8f1;border:1px solid #d4cfc1;border-top:none;gap:16px}
        .ds-row-inner{flex:1}
        .ds-row .dk{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--ink2);letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}
        .ds-row .dv{font-size:13px;color:var(--ink);font-weight:500}
        .chip{font-size:9px;padding:3px 8px;border-radius:2px;font-family:'JetBrains Mono',monospace;font-weight:700;white-space:nowrap}
        .chip-brass{background:rgba(200,162,90,.12);color:#a07a30;border:1px solid rgba(200,162,90,.3)}
        .chip-green{background:rgba(43,168,74,.1);color:var(--greend);border:1px solid rgba(43,168,74,.3)}
        .r-sig{background:var(--navy);color:#fff;padding:36px 56px;display:grid;grid-template-columns:1fr 260px;gap:40px;align-items:start;border-top:6px solid var(--green)}
        .r-sig .left .lbl{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--brass);letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px}
        .r-sig .left p{font-size:12px;color:#bcc4d1;line-height:1.65;margin-bottom:8px;max-width:480px}
        .r-sig .right{text-align:left;border-left:1px solid #1a2742;padding-left:28px}
        .r-sig-seal{width:76px;height:76px;border:1.5px solid var(--brass);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--brass);font-family:'Libre Caslon Text',serif;font-size:10px;text-align:center;line-height:1.2;font-style:italic;margin-bottom:12px}
        .r-sig .right .lbl{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--brass);letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
        .r-sig .right .nm{font-family:'Libre Caslon Text',serif;font-size:15px;color:#fff;line-height:1.3}
        .r-sig .right .role{font-size:10px;color:#8a94a3;margin-top:3px}
        .r-foot{padding:14px 56px;background:#06101e;color:#5a6a7a;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center}
        .hash-block{margin-top:32px;padding-top:24px;border-top:1px solid #d4cfc1}
        .hash-block .lbl{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--brass);letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px}
        .hash-block .val{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--ink2);word-break:break-all;line-height:1.6;background:#fff;border:1px solid #d4cfc1;padding:12px 16px}
        @media(max-width:720px){
          .r-page{margin:8px;width:auto}
          .r-head,.r-sec,.r-data,.r-sig,.r-foot{padding-left:20px;padding-right:20px}
          .r-head{padding-top:24px;padding-bottom:20px}
          .r-head-top{flex-direction:column;gap:14px}
          .r-did{text-align:left}.r-did .num{font-size:16px}
          .r-title{grid-template-columns:1fr;gap:10px}
          .r-kicker{writing-mode:horizontal-tb;transform:none}
          .r-title h1{font-size:26px}
          .r-ms{grid-template-columns:1fr 1fr}
          .r-ms>div{border-bottom:1px solid #1a2742}
          .r-ms>div:nth-child(2n){border-right:none}
          .r-summary{grid-template-columns:1fr;gap:20px}
          .r-sig{grid-template-columns:1fr;gap:20px}
          .r-sig .right{border-left:none;border-top:1px solid #1a2742;padding:20px 0 0}
          .r-foot{font-size:8px;flex-direction:column;gap:6px;text-align:center}
          .r-tb{padding:10px 14px;flex-wrap:wrap;gap:8px}
        }
        @media print{
          @page{size:A4;margin:1cm}
          html,body{background:#fff !important}
          .r-tb{display:none !important}
          .r-page{margin:0;box-shadow:none;max-width:100%;overflow:visible}
          *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;color-adjust:exact !important}
          h1,h2,h3,h4{page-break-after:avoid;break-after:avoid}
          .r-sec{page-break-inside:avoid;break-inside:avoid}
          .r-sec-results{page-break-before:always !important;break-before:page !important}
          .r-sig{page-break-before:always;break-before:page;page-break-inside:avoid;break-inside:avoid}
          .ds-block{page-break-inside:avoid;break-inside:avoid}
          .r-head,.r-ms{page-break-after:avoid;break-after:avoid}
        }
      `}</style>

      {/* TOOLBAR */}
      <RelatorioToolbar protocol={protocol} />

      <div className="r-page">
        <div className="r-wm">SNC · DEMONSTRAÇÃO</div>

        {/* HEADER */}
        <header className="r-head">
          <div className="r-head-top">
            <div className="r-brand-meta">
              <div className="t1">Sistema Nacional de Conformidade</div>
              <div className="t2">Relatório oficial de consulta · Documento demonstrativo</div>
            </div>
            <div className="r-did">
              <div className="lbl">Protocolo SNC</div>
              <div className="num">{protocol}</div>
              <div className="sub">EMITIDO EM 05 MAI 2026 · 09:00 BRT</div>
            </div>
          </div>
          <div className="r-title">
            <div className="r-kicker">§ Relatório Consolidado</div>
            <div>
              <h1>Consulta de <span className="it">conformidade integral</span><br />e indicadores de risco.</h1>
              <div className="lede">
                Documento gerado a partir de 4 datasets institucionais.
                Validade jurídica conforme Resolução BACEN 4.893 e LGPD Art. 18.
              </div>
            </div>
          </div>
        </header>

        {/* META STRIP */}
        <div className="r-ms">
          <div><div className="l">Sujeito da consulta</div><div className="v">JOÃO DA SILVA EXEMPLO</div></div>
          <div><div className="l">CPF</div><div className="v">000.000.000-00</div></div>
          <div><div className="l">Módulo</div><div className="v">SNC</div></div>
          <div><div className="l">Validade do parecer</div><div className="v">30 dias corridos</div></div>
        </div>

        {/* §01 SUMÁRIO */}
        <section className="r-sec">
          <div className="r-sh">
            <div className="num">§ 01</div>
            <h2>Sumário executivo</h2>
            <span className="badge">DADOS CADASTRAIS</span>
          </div>
          <div className="r-summary">
            <div className="r-sl">
              <div className="label">Sujeito da consulta</div>
              <div className="sname">JOÃO DA SILVA EXEMPLO</div>
              <div className="sdoc">CPF 000.000.000-00</div>
              <div className="pfs">
                <div>
                  <div className="l">Nascimento</div>
                  <div className="v">20/05/1985 · 39 anos</div>
                </div>
                <div>
                  <div className="l">Naturalidade</div>
                  <div className="v">São Paulo / SP</div>
                </div>
                <div>
                  <div className="l">Situação CPF</div>
                  <div className="v">REGULAR · Receita Federal</div>
                </div>
                <div>
                  <div className="l">Sexo</div>
                  <div className="v">Masculino</div>
                </div>
              </div>
            </div>

            <div className="r-vrd">
              <div className="r-vrd-top">
                <span className="r-vrd-tag">Parecer SNC consolidado</span>
                <span className="r-vrd-stamp">✓ GERADO DIGITALMENTE</span>
              </div>
              <div className="r-vrd-result">
                <div className="r-seal">✓</div>
                <div className="r-vt">
                  <h3>Consulta registrada</h3>
                  <p>Dados processados e disponíveis para análise.</p>
                </div>
              </div>
              <div className="r-vrd-msg">
                Consulta realizada em 05 de maio de 2026 às 09:00 BRT.
                Foram ativados 4 datasets institucionais. Documento com validade
                de 30 dias corridos a partir da data de emissão. Rastreável à fonte
                primária conforme LGPD Lei 13.709/2018, art. 7º, V.
              </div>
            </div>
          </div>
        </section>

        {/* §02 RESULTADOS */}
        <section className="r-sec r-sec-results">
          <div className="r-sh">
            <div className="num">§ 02</div>
            <h2>Resultados da consulta</h2>
            <span className="badge">4 DATASETS</span>
          </div>

          {/* Dados Cadastrais */}
          <div className="ds-block">
            <div className="ds-hd">
              <span>DADOS CADASTRAIS · RECEITA FEDERAL</span>
              <span style={{ opacity: 0.6 }}>basic_data</span>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Nome completo</div>
                <div className="dv">JOÃO DA SILVA EXEMPLO</div>
              </div>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Data de nascimento</div>
                <div className="dv">20/05/1985</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="dk">Idade</div>
                <div className="dv">39 anos</div>
              </div>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Nome da mãe</div>
                <div className="dv">MARIA DA SILVA EXEMPLO</div>
              </div>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Situação cadastral CPF</div>
                <div className="dv">REGULAR · Receita Federal do Brasil</div>
              </div>
              <span className="chip chip-green">REGULAR</span>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Naturalidade</div>
                <div className="dv">São Paulo / SP</div>
              </div>
            </div>
          </div>

          {/* Processos Judiciais */}
          <div className="ds-block">
            <div className="ds-hd">
              <span>PROCESSOS JUDICIAIS</span>
              <span style={{ opacity: 0.6 }}>1 REGISTRO ENCONTRADO</span>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Número do processo</div>
                <div className="dv">1002845-12.2024.8.26.0100</div>
                <div className="dk" style={{ marginTop: 4 }}>TJSP · Cível · Execução de Título · Arquivado / Baixado</div>
              </div>
              <span className="chip chip-brass">CONSTA (BAIXADO)</span>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Valor da causa</div>
                <div className="dv">R$ 150.000,00</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="dk">Polo processual</div>
                <div className="dv">Réu</div>
              </div>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Juiz responsável</div>
                <div className="dv">Dr. Ricardo Santos</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="dk">Data</div>
                <div className="dv">15/01/2024</div>
              </div>
            </div>
          </div>

          {/* Antecedentes PF */}
          <div className="ds-block">
            <div className="ds-hd">
              <span>ANTECEDENTES CRIMINAIS · FEDERAL (POLÍCIA FEDERAL)</span>
              <span style={{ opacity: 0.6 }}>ondemand_antecedentes_pf</span>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Resultado da consulta</div>
                <div className="dv">Nenhum antecedente criminal federal localizado</div>
              </div>
              <span className="chip chip-green">NADA CONSTA</span>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Protocolo interno</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>SNC-PF-9999</div>
              </div>
            </div>
          </div>

          {/* Antecedentes PC */}
          <div className="ds-block">
            <div className="ds-hd">
              <span>ANTECEDENTES CRIMINAIS · ESTADUAL (POLÍCIA CIVIL)</span>
              <span style={{ opacity: 0.6 }}>ondemand_antecedentes_pc</span>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Resultado da consulta</div>
                <div className="dv">Nenhum antecedente criminal estadual localizado</div>
              </div>
              <span className="chip chip-green">NADA CONSTA</span>
            </div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Protocolo interno</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>SNC-PC-9999</div>
              </div>
            </div>
          </div>

          {/* Hash */}
          <div className="hash-block">
            <div className="lbl">§ Assinatura Digital · SHA-256</div>
            <div className="val">
              e3b0c44298fc1c149afbf4c8996fb924<span style={{ opacity: 0.4 }}>…</span>7852b855
              <br />
              <span style={{ opacity: 0.45, fontSize: 10 }}>sha256( JSON.stringify(rawData) + dtinsert.toISOString() ) — documento demonstrativo</span>
            </div>
          </div>
        </section>

        {/* ASSINATURA */}
        <div className="r-sig">
          <div className="left">
            <div className="lbl">§ Validade jurídica &amp; autenticação</div>
            <p>
              Este documento é gerado de forma automatizada pelo Sistema Nacional de Conformidade — SNC,
              mediante consulta autorizada e finalidade declarada conforme LGPD (Lei 13.709/2018, art. 7º, V)
              e Resolução BACEN nº 4.893/2021. Toda informação aqui consolidada é rastreável à fonte primária.
            </p>
            <p>
              O parecer tem validade de 30 dias corridos a partir da data de emissão.
              Protocolo: <strong>{protocol}</strong>. Este exemplar é uma demonstração com dados fictícios.
            </p>
          </div>
          <div className="right">
            <div className="r-sig-seal">SNC<br />VALIDADO<br />2026</div>
            <div className="lbl">Emitente</div>
            <div className="nm">SNC</div>
            <div className="role">Sistema Nacional de Conformidade · SNC</div>
          </div>
        </div>

        <div className="r-foot">
          <span>SNC · Sistema Nacional de Conformidade · 2026</span>
          <span>Documento demonstrativo · Dados fictícios</span>
          <span>Protocolo {protocol}</span>
        </div>
      </div>
    </>
  );
}
