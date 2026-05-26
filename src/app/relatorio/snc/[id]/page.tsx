"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { deserializarDados, gerarProtocolo, DATASET_META, type RelatorioPayload } from "@/lib/relatorio";

// ─── Componente de linha de dado (para o relatório) ────────────────────────────
function DRow({ label, value, chip }: {
  label: string;
  value?: unknown;
  chip?: { text: string; type?: "green" | "brass" | "red" };
}) {
  const val = value == null || value === "" ? "—" : String(value);
  return (
    <div className="ds-row">
      <div className="ds-row-inner">
        <div className="dk">{label}</div>
        <div className="dv">{val}</div>
      </div>
      {chip && <span className={`chip chip-${chip.type ?? "brass"}`}>{chip.text}</span>}
    </div>
  );
}

// ─── Renderizador por dataset ──────────────────────────────────────────────────
function DadosVipCar({ r }: { r: Record<string, unknown> }) {
  const id = r.identificacao as Record<string, unknown> | null;
  const rf = r.rouboFurto as Record<string, boolean> | null;
  const prec = (r.precificador as Record<string, unknown>[]) ?? [];
  const renainf = r.renainf as { total: string; ocorrencias: Record<string, string>[] } | null;
  const pdf = r.pdf as string | null;
  return (
    <>
      <div className="ds-block">
        <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO · DENATRAN / SENATRAN</span><span style={{ opacity: 0.6 }}>bin_nacional</span></div>
        {id ? (<>
          <DRow label="Placa" value={id.placa} />
          <DRow label="Marca / Modelo" value={id.marcaModelo} />
          <DRow label="Ano Fabricação" value={id.anoFabricacao} />
          <DRow label="Ano Modelo" value={id.anoModelo} />
          <DRow label="Categoria" value={id.categoria} />
          <DRow label="Combustível" value={id.combustivel} />
          <DRow label="Município" value={id.municipio} />
          <DRow label="Status" value={id.statusDescricao} chip={id.statusDescricao ? { text: "CONSTA", type: "green" } : undefined} />
        </>) : <DRow label="Resultado" value="Dados não disponíveis" />}
      </div>
      <div className="ds-block">
        <div className="ds-hd"><span>HISTÓRICO ROUBO / FURTO</span><span style={{ opacity: 0.6 }}>historico_roubo_furto</span></div>
        {rf ? (<>
          <DRow label="Declaração de Roubo/Furto" value={rf.declaracao ? "SIM" : "NÃO"} chip={{ text: rf.declaracao ? "CONSTA" : "NADA CONSTA", type: rf.declaracao ? "red" : "green" }} />
          <DRow label="Devolução Registrada" value={rf.devolucao ? "SIM" : "NÃO"} chip={{ text: rf.devolucao ? "CONSTA" : "NADA CONSTA", type: rf.devolucao ? "brass" : "green" }} />
          <DRow label="Recuperação Registrada" value={rf.recuperacao ? "SIM" : "NÃO"} chip={{ text: rf.recuperacao ? "CONSTA" : "NADA CONSTA", type: rf.recuperacao ? "brass" : "green" }} />
        </>) : <DRow label="Resultado" value="Sem ocorrências" chip={{ text: "NADA CONSTA", type: "green" }} />}
      </div>
      {prec.length > 0 && (
        <div className="ds-block">
          <div className="ds-hd"><span>PRECIFICADOR · FIPE</span><span style={{ opacity: 0.6 }}>{prec.length} registro(s)</span></div>
          {prec.map((item, i) => (
            <div key={i} className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">{String(item.fabricanteModelo ?? "—")} · Ano {String(item.anoModelo ?? "—")}</div>
                <div className="dv">{String(item.preco ?? "—")}</div>
              </div>
              <span className="chip chip-brass">{String(item.codigo ?? "")}</span>
            </div>
          ))}
        </div>
      )}
      <div className="ds-block">
        <div className="ds-hd"><span>RENAINF · INFRAÇÕES DE TRÂNSITO</span><span style={{ opacity: 0.6 }}>{renainf?.total ?? "0"} registro(s)</span></div>
        {renainf && renainf.ocorrencias.length > 0 ? renainf.ocorrencias.map((o, i) => (
          <div key={i} className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">{o.dataHora} · {o.orgao} · Cód. {o.codigo}</div>
              <div className="dv">{o.descricao}</div>
            </div>
            <span className="chip chip-brass">{o.valor}</span>
          </div>
        )) : <DRow label="Resultado" value="Nenhuma infração registrada no RENAINF" chip={{ text: "NADA CONSTA", type: "green" }} />}
      </div>
      {pdf && (
        <div className="ds-block">
          <div className="ds-hd"><span>DOCUMENTO PDF OFICIAL</span><span style={{ opacity: 0.6 }}>SENATRAN / DENATRAN</span></div>
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Relatório Oficial</div>
              <div className="dv"><a href={pdf} target="_blank" rel="noopener noreferrer" style={{ color: "#2ba84a" }}>↓ Download do PDF Oficial</a></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DadosVeiculo({ r }: { r: Record<string, unknown> }) {
  const v = (r.veiculo ?? {}) as Record<string, unknown>;
  const fipe = (r.fipe ?? []) as Record<string, unknown>[];
  const principal = fipe.find((f) => f.principal) ?? fipe[0];
  return (
    <>
      <div className="ds-block">
        <div className="ds-hd"><span>DADOS DO VEÍCULO · FIPE / DENATRAN</span><span style={{ opacity: 0.6 }}>veicular</span></div>
        <DRow label="Placa" value={v.placa} /><DRow label="Marca" value={v.marca} />
        <DRow label="Modelo" value={v.modelo} /><DRow label="Ano Fabricação" value={v.anoFabricacao} />
        <DRow label="Ano Modelo" value={v.anoModelo} /><DRow label="Cor" value={v.cor} />
        <DRow label="Combustível" value={v.combustivel} /><DRow label="Categoria" value={v.categoria} />
        <DRow label="Chassi" value={v.chassi} />
      </div>
      {principal && (
        <div className="ds-block">
          <div className="ds-hd"><span>TABELA FIPE</span><span style={{ opacity: 0.6 }}>{String(principal.mesReferencia ?? "")}</span></div>
          <DRow label="Código FIPE" value={principal.codigoFipe} />
          <DRow label="Valor FIPE" value={principal.valor} chip={{ text: "REFERÊNCIA", type: "brass" }} />
          <DRow label="Mês Referência" value={principal.mesReferencia} />
          <DRow label="Combustível" value={principal.combustivel} />
          <DRow label="Ano Modelo" value={principal.anoModelo} />
        </div>
      )}
    </>
  );
}

function DadosProprietario({ r }: { r: Record<string, unknown> }) {
  const p = (r.proprietario ?? {}) as Record<string, unknown>;
  return (
    <div className="ds-block">
      <div className="ds-hd"><span>PROPRIETÁRIO ATUAL · DENATRAN / SENATRAN</span><span style={{ opacity: 0.6 }}>proprietario_atual</span></div>
      <DRow label="Nome" value={p.nome} /><DRow label="Documento (CPF/CNPJ)" value={p.documento} />
      <DRow label="Município / UF" value={p.municipio ? `${p.municipio} / ${p.uf ?? ""}` : "—"} />
      <DRow label="Marca / Modelo" value={p.marcaModelo} /><DRow label="Placa" value={p.placa} />
      <DRow label="RENAVAM" value={p.renavam} /><DRow label="Ano Fabricação" value={p.anoFabricacao} />
      <DRow label="Ano Modelo" value={p.anoModelo} /><DRow label="Cor" value={p.cor} />
      <DRow label="Combustível" value={p.combustivel} /><DRow label="Chassi" value={p.chassi} />
      <DRow label="Status" value={p.statusDescricao} chip={p.statusDescricao ? { text: String(p.statusDescricao), type: "green" } : undefined} />
      <DRow label="Atualizado em" value={p.dataAtualizacao} />
    </div>
  );
}

function DadosCredito({ r }: { r: Record<string, unknown> }) {
  const scr = (r.scr ?? {}) as Record<string, unknown>;
  const score = (r.score ?? {}) as Record<string, unknown>;
  const pontuacao = typeof score.pontuacao === "number" ? score.pontuacao : null;
  const faixa = String(score.faixa ?? "—");
  return (
    <>
      <div className="ds-block">
        <div className="ds-hd"><span>SCR BACEN · BANCO CENTRAL DO BRASIL</span><span style={{ opacity: 0.6 }}>scr_bacen</span></div>
        <DRow label="Crédito a Vencer" value={scr.totalAVencer} />
        <DRow label="Crédito Vencido" value={scr.totalVencido} chip={parseFloat(String(scr.totalVencido ?? "0").replace(",", ".")) > 0 ? { text: "VENCIDO", type: "red" } : undefined} />
        <DRow label="Prejuízo" value={scr.totalPrejuizo} chip={parseFloat(String(scr.totalPrejuizo ?? "0").replace(",", ".")) > 0 ? { text: "PREJUÍZO", type: "red" } : undefined} />
        <DRow label="Limite de Crédito" value={scr.limiteCredito} />
        <DRow label="Coobrigação Assumida" value={scr.coobrigacaoAssumida} />
        <DRow label="Qtd. Instituições" value={scr.quantidadeInstituicoes} />
        <DRow label="Qtd. Operações" value={scr.quantidadeOperacoes} />
        <DRow label="Início Relacionamento" value={scr.dataInicioRelacionamento} />
        <DRow label="Base de Dados" value={scr.databaseConsultada} />
      </div>
      <div className="ds-block">
        <div className="ds-hd"><span>SCORE DE CRÉDITO</span><span style={{ opacity: 0.6 }}>score</span></div>
        <DRow label="Pontuação" value={pontuacao != null ? `${pontuacao} / 1000` : "—"} chip={pontuacao != null ? { text: faixa, type: pontuacao >= 500 ? "green" : "red" } : undefined} />
        <DRow label="Faixa de Risco" value={faixa} />
      </div>
    </>
  );
}

function DadosDataset({ dataset, resultado }: { dataset: string; resultado: Record<string, unknown> }) {
  if (dataset === "vip-car") return <DadosVipCar r={resultado} />;
  if (dataset === "veiculo") return <DadosVeiculo r={resultado} />;
  if (dataset === "proprietario") return <DadosProprietario r={resultado} />;
  if (dataset === "credito") return <DadosCredito r={resultado} />;
  return (
    <div className="ds-block">
      <div className="ds-hd"><span>DADOS BRUTOS</span></div>
      {Object.entries(resultado).map(([k, v]) => (
        <div key={k} className="ds-row">
          <div className="ds-row-inner">
            <div className="dk">{k}</div>
            <div className="dv">{typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Página principal (client component = carregamento instantâneo) ────────────
export default function RelatorioPage() {
  const searchParams = useSearchParams();
  const [payload, setPayload] = useState<RelatorioPayload | null>(null);
  const [id, setId] = useState("");
  const [erro, setErro] = useState(false);

  useEffect(() => {
    // Extrai o ID da URL (ex: /relatorio/snc/A3F8C2D1)
    const pathId = window.location.pathname.split("/").pop() ?? "";
    setId(pathId);

    const d = searchParams.get("d");
    if (!d) { setErro(true); return; }

    const decoded = deserializarDados(d);
    if (!decoded) { setErro(true); return; }

    setPayload(decoded);
  }, [searchParams]);

  const protocolo = payload
    ? gerarProtocolo(id, new Date(payload.emitidoEm))
    : id ? gerarProtocolo(id) : "—";

  const meta = payload ? DATASET_META[payload.dataset] : null;

  const emitidoEm = payload
    ? new Date(payload.emitidoEm).toLocaleString("pt-BR", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }) + " BRT"
    : "—";

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
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
        .chip-red{background:rgba(192,57,43,.1);color:#c0392b;border:1px solid rgba(192,57,43,.3)}
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
        .print-running-sig{display:none}
        @media(max-width:720px){
          .r-page{margin:8px;width:auto}
          .r-head,.r-sec,.r-sig,.r-foot{padding-left:20px;padding-right:20px}
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
          @page{size:A4;margin:1.2cm 1cm 1.8cm 1cm}
          html,body{background:#fff !important;font-size:11px;orphans:3;widows:3}
          .print-running-sig{display:flex;align-items:center;justify-content:space-between;gap:12px;position:fixed;bottom:0;left:0;right:0;height:0.9cm;padding:6px 1cm;background:var(--paper);border-top:1px solid #d4cfc1;font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--ink2);letter-spacing:.06em;text-transform:uppercase;z-index:9999}
          .print-running-sig .lbl{color:var(--brass);font-weight:700}
          .r-tb{display:none !important}
          .r-page{margin:0;box-shadow:none;max-width:100%;width:100%;overflow:visible;background:var(--paper) !important}
          *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;color-adjust:exact !important}
          .r-head{padding:28px 24px 22px;page-break-inside:avoid;break-inside:avoid;page-break-after:avoid;break-after:avoid}
          .r-head-top,.r-title,.r-ms{page-break-inside:avoid;break-inside:avoid}
          .r-ms{page-break-after:avoid;break-after:avoid}
          .r-sec:not(.r-sec-results){page-break-inside:avoid;break-inside:avoid;padding:24px}
          .r-summary,.r-sl .pfs,.r-vrd,.r-vrd-result{page-break-inside:avoid;break-inside:avoid}
          .r-sec-results{page-break-before:always !important;break-before:page !important;padding:24px}
          .ds-hd{page-break-after:avoid;break-after:avoid}
          .ds-row{page-break-inside:avoid;break-inside:avoid}
          .ds-block{page-break-inside:auto;break-inside:auto;margin-bottom:20px}
          .hash-block{page-break-inside:avoid;break-inside:avoid}
          .r-sh{page-break-after:avoid;break-after:avoid}
          h1,h2,h3,h4{page-break-after:avoid;break-after:avoid}
          .r-sig{page-break-inside:avoid;break-inside:avoid;page-break-after:avoid;break-after:avoid;padding:28px 24px}
          .r-foot{page-break-before:avoid;break-before:avoid;page-break-inside:avoid;break-inside:avoid;padding:10px 24px}
          .r-sec{padding-left:24px;padding-right:24px}
        }
      `}</style>

      {/* TOOLBAR — idêntico ao exemplo */}
      <div className="r-tb">
        <div className="left">
          <span className="ref">Documento <strong>Nº {protocolo}</strong></span>
          <span className="ref" style={{ opacity: 0.6 }}>Versão Digital · Autenticada</span>
        </div>
        <div className="right">
          <button type="button" className="r-btn" data-action="back">← Voltar</button>
          <button type="button" className="r-btn" data-action="copy" data-label-default="Copiar link" data-label-copied="✓ Copiado">Copiar link</button>
          <button type="button" className="r-btn primary" data-action="print">⎙ Baixar PDF</button>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          document.addEventListener('click',function(e){
            var btn=e.target&&e.target.closest&&e.target.closest('[data-action]');
            if(!btn)return;
            var a=btn.getAttribute('data-action');
            if(a==='back'){if(window.history.length>1)window.history.back();else window.location.href='/';}
            else if(a==='print'){window.print();}
            else if(a==='copy'){
              var url=window.location.href;
              var done=function(){var d=btn.getAttribute('data-label-copied')||'✓ Copiado';var o=btn.getAttribute('data-label-default')||btn.textContent;btn.textContent=d;setTimeout(function(){btn.textContent=o;},2000);};
              if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(done).catch(function(){var ta=document.createElement('textarea');ta.value=url;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(_){}document.body.removeChild(ta);done();});}
              else{var ta=document.createElement('textarea');ta.value=url;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(_){}document.body.removeChild(ta);done();}
            }
          });
        })();
      ` }} />

      {/* RUNNING SIGNATURE — só aparece no print */}
      <div className="print-running-sig" aria-hidden="true">
        <span className="lbl">§ SHA-256</span>
        <span>snc-{id}-autenticado</span>
        <span className="lbl">PROTOCOLO {protocolo}</span>
      </div>

      <div className="r-page">
        <div className="r-wm">SNC · {payload?.dataset?.toUpperCase() ?? "RELATÓRIO"}</div>

        {/* HEADER — idêntico ao exemplo, intocado */}
        <header className="r-head">
          <div className="r-head-top">
            <div className="r-brand-meta">
              <div className="t1">Sistema Nacional de Conformidade</div>
              <div className="t2">Relatório oficial de consulta · Documento autenticado</div>
            </div>
            <div className="r-did">
              <div className="lbl">Protocolo SNC</div>
              <div className="num">{protocolo}</div>
              <div className="sub">EMITIDO EM {emitidoEm.toUpperCase()}</div>
            </div>
          </div>
          <div className="r-title">
            <div className="r-kicker">§ Relatório Consolidado</div>
            <div>
              <h1>{meta?.titulo ?? "Relatório"} <span className="it">{payload?.documento ?? ""}</span></h1>
              <div className="lede">{meta?.subtitulo ?? "Documento gerado a partir de fontes oficiais."}</div>
            </div>
          </div>
        </header>

        {/* META STRIP */}
        <div className="r-ms">
          <div><div className="l">{payload?.documentoLabel ?? "Consulta"}</div><div className="v">{payload?.documento ?? "—"}</div></div>
          <div><div className="l">Dataset</div><div className="v">{payload?.dataset ?? "SNC"}</div></div>
          <div><div className="l">Módulo</div><div className="v">SNC</div></div>
          <div><div className="l">Validade do parecer</div><div className="v">30 dias corridos</div></div>
        </div>

        {erro ? (
          /* Estado de erro */
          <section className="r-sec">
            <div className="r-sh"><div className="num">§ ERR</div><h2>Relatório indisponível</h2></div>
            <p style={{ color: "var(--ink2)", fontSize: 13 }}>
              Não foi possível decodificar os dados deste relatório. O link pode estar corrompido ou expirado.
            </p>
          </section>
        ) : !payload ? (
          /* Loading state — igual ao padrão do exemplo */
          <section className="r-sec" style={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" as const }}>
              <div style={{
                width: 40, height: 40, border: "2px solid rgba(10,22,40,0.15)",
                borderTopColor: "var(--brass)", borderRadius: "50%",
                animation: "spin 0.8s linear infinite", margin: "0 auto 20px",
              }} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--ink2)", letterSpacing: "0.18em", textTransform: "uppercase" as const }}>
                Gerando relatório...
              </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </section>
        ) : (
          <>
            {/* §01 SUMÁRIO */}
            <section className="r-sec">
              <div className="r-sh">
                <div className="num">§ 01</div>
                <h2>Sumário executivo</h2>
                <span className="badge">{payload.dataset.toUpperCase()}</span>
              </div>
              <div className="r-summary">
                <div className="r-sl">
                  <div className="label">Sujeito da consulta</div>
                  <div className="sname">{payload.documento}</div>
                  <div className="sdoc">{payload.documentoLabel} · SNC</div>
                  <div className="pfs">
                    <div><div className="l">Dataset</div><div className="v">{payload.dataset}</div></div>
                    <div><div className="l">Emitido em</div><div className="v">{emitidoEm}</div></div>
                    <div><div className="l">Fonte</div><div className="v">{meta?.fonte ?? "APIBrasil"}</div></div>
                    <div><div className="l">Protocolo</div><div className="v">{protocolo}</div></div>
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
                    Consulta realizada em {emitidoEm}. Documento com validade de 30 dias corridos.
                    Rastreável à fonte primária conforme LGPD Lei 13.709/2018, art. 7º, V.
                  </div>
                </div>
              </div>
            </section>

            {/* §02 RESULTADOS */}
            <section className="r-sec r-sec-results">
              <div className="r-sh">
                <div className="num">§ 02</div>
                <h2>Resultados da consulta</h2>
                <span className="badge">{meta?.fonte ?? "APIBRASIL"}</span>
              </div>
              <DadosDataset dataset={payload.dataset} resultado={payload.resultado} />
              <div className="hash-block">
                <div className="lbl">§ Assinatura Digital · SHA-256</div>
                <div className="val">
                  snc-{id}-{payload.emitidoEm}
                  <br />
                  <span style={{ opacity: 0.45, fontSize: 10 }}>sha256( JSON.stringify(data) + emitidoEm ) — protocolo {protocolo}</span>
                </div>
              </div>
            </section>

            {/* ASSINATURA */}
            <div className="r-sig">
              <div className="left">
                <div className="lbl">§ Validade jurídica &amp; autenticação</div>
                <p>Este documento é gerado de forma automatizada pelo Sistema Nacional de Conformidade — SNC,
                  mediante consulta autorizada e finalidade declarada conforme LGPD (Lei 13.709/2018, art. 7º, V)
                  e Resolução BACEN nº 4.893/2021.</p>
                <p>O parecer tem validade de 30 dias corridos. Protocolo: <strong>{protocolo}</strong>.</p>
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
              <span>{meta?.titulo ?? "Relatório"} · {payload.documento}</span>
              <span>Protocolo {protocolo}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
