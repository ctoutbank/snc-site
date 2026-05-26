import type { Metadata } from 'next';
import { gerarProtocolo, DATASET_META, type RelatorioPayload, type DatasetTipo } from '@/lib/relatorio';

// ─── Deserialização server-side ────────────────────────────────────────────────
function deserializar(d: string): RelatorioPayload | null {
  try {
    const b64 = d.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '=='.slice(0, (4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf-8');
    const parsed = JSON.parse(json) as RelatorioPayload;
    if (!parsed.dataset || !parsed.documento || !parsed.resultado) return null;
    return parsed;
  } catch { return null; }
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ d?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const { d } = await searchParams;
  const payload = d ? deserializar(d) : null;
  const meta = payload ? DATASET_META[payload.dataset] : null;
  return {
    title: meta ? `SNC · ${meta.titulo} · ${gerarProtocolo(id)}` : `SNC · Relatório ${id}`,
    description: meta?.subtitulo ?? 'Relatório oficial SNC.',
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function v(val: unknown): string {
  return val == null || val === '' ? '—' : String(val);
}

// ─── §01 Sumário — card esquerdo por dataset ──────────────────────────────────
function SumarioCard({ payload }: { payload: RelatorioPayload }) {
  const r = payload.resultado;

  if (payload.dataset === 'vip-car' || payload.dataset === 'veiculo' || payload.dataset === 'proprietario') {
    const id = (r.identificacao ?? r.veiculo ?? r.proprietario ?? {}) as Record<string, unknown>;
    const prop = (r.proprietario ?? {}) as Record<string, unknown>;
    const dt = (r.dadosTecnicos ?? {}) as Record<string, unknown>;
    const placa = v(payload.documento);
    const modelo = v(id.marcaModelo ?? id.modelo);
    const anoFab = v(id.anoFabricacao);
    const anoMod = v(id.anoModelo);
    const comb = v(id.combustivel);
    const mun = id.municipio ? `${id.municipio}${id.uf ? ` / ${id.uf}` : ''}` : '—';
    const cor = v(prop.cor ?? dt.cor);
    const renavam = v(prop.renavam);

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>{placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">Ano Fabricação</div><div className="v">{anoFab}</div></div>
          <div><div className="l">Ano Modelo</div><div className="v">{anoMod}</div></div>
          <div><div className="l">Combustível</div><div className="v">{comb}</div></div>
          <div><div className="l">Município</div><div className="v">{mun}</div></div>
          <div><div className="l">Cor</div><div className="v">{cor}</div></div>
          <div><div className="l">RENAVAM</div><div className="v">{renavam}</div></div>
        </div>
      </div>
    );
  }

  // credito
  const scr = (r.scr ?? {}) as Record<string, unknown>;
  const score = (r.score ?? {}) as Record<string, unknown>;
  return (
    <div className="r-sl">
      <div className="label">{payload.documentoLabel}</div>
      <div className="sname">{payload.documento}</div>
      <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, marginTop: 4 }}>{payload.documentoLabel} · SNC</div>
      <div className="pfs">
        <div><div className="l">Crédito a Vencer</div><div className="v">{v(scr.totalAVencer)}</div></div>
        <div><div className="l">Score</div><div className="v">{score.pontuacao != null ? `${score.pontuacao} / 1000` : '—'}</div></div>
        <div><div className="l">Base consultada</div><div className="v">{v(scr.databaseConsultada)}</div></div>
        <div><div className="l">Faixa de Risco</div><div className="v">{v(score.faixa)}</div></div>
      </div>
    </div>
  );
}

// ─── Singular / plural de registro ──────────────────────────────────────────
function reg(n: number | string): string {
  const num = Number(n);
  return `${num} ${num === 1 ? 'REGISTRO' : 'REGISTROS'}`;
}

// ─── Abreviação de órgão autuador ─────────────────────────────────────────────
function abrOrg(s?: string): string {
  if (!s) return '—';
  return s
    .replace(/PREFEITURA\s+MUNICIPAL\s+DE\s+/gi, 'PREF. ')
    .replace(/PREFEITURA\s+DE\s+/gi, 'PREF. ')
    .replace(/SECRETARIA\s+(DE\s+ESTADO\s+)?DE\s+/gi, 'SECR. ')
    .replace(/DEPARTAMENTO\s+DE\s+/gi, 'DEP. ')
    .replace(/POLICIA\s+MILITAR/gi, 'PM')
    .replace(/POLICIA\s+CIVIL/gi, 'PC')
    .replace(/POLICIA\s+RODOVIARIA\s+FEDERAL/gi, 'PRF')
    .replace(/POLICIA\s+RODOVIARIA/gi, 'PRF')
    .trim()
    .slice(0, 24)
    .trimEnd();
}

// ─── §02 Resultados — VIP Car ─────────────────────────────────────────────────
function DadosVipCar({ r }: { r: Record<string, unknown> }) {
  const id = (r.identificacao ?? {}) as Record<string, unknown>;
  const rf = (r.rouboFurto ?? {}) as Record<string, boolean>;
  const prec = (r.precificador as Record<string, unknown>[]) ?? [];
  const renainf = r.renainf as { total?: string | number; ocorrencias?: Record<string, string>[] } | null;
  const pdf = r.pdf as string | null;
  const ocorrencias = renainf?.ocorrencias ?? [];
  const totalRenainf = renainf?.total ?? ocorrencias.length;
  const prop = (r.proprietario ?? {}) as Record<string, unknown>;
  const dt = (r.dadosTecnicos ?? {}) as Record<string, unknown>;
  const temProp = prop && prop.nome;
  const temDT = dt && (dt.cor || dt.motor || dt.carroceria);

  return (
    <>
      {/* ROW 1: Identificação + Proprietário */}
      <div className="src-badge">DENATRAN / SENATRAN</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2, marginTop: 8 }}>
        <div>
          <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO</span></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Marca/Modelo</div><div className="dv">{v(id.marcaModelo)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Categoria</div><div className="dv">{v(id.categoria)}</div></div></div>
          {(id.chassi || prop.chassi || dt.chassi) && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Chassi</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(id.chassi ?? prop.chassi ?? dt.chassi)}</div></div></div>}
          {(prop.motor || dt.motor) && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Motor</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(prop.motor ?? dt.motor)}</div></div></div>}
          {id.municipio && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Município / UF</div><div className="dv">{id.uf ? `${v(id.municipio)} / ${v(id.uf)}` : v(id.municipio)}</div></div></div>}
        </div>
        <div>
          {temProp ? (
            <>
              <div className="ds-hd"><span>PROPRIETÁRIO ATUAL</span></div>
              <div className="ds-row"><div className="ds-row-inner"><div className="dk">Nome</div><div className="dv">{v(prop.nome)}</div></div></div>
              {prop.documento && <div className="ds-row"><div className="ds-row-inner"><div className="dk">CPF/CNPJ</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(prop.documento)}</div></div></div>}
              {(prop.municipio) && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Município / UF</div><div className="dv">{prop.uf ? `${v(prop.municipio)} / ${v(prop.uf)}` : v(prop.municipio)}</div></div></div>}
              {prop.crlv && <div className="ds-row"><div className="ds-row-inner"><div className="dk">CRLV</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(prop.crlv)}</div></div></div>}
              {prop.dataAtualizacao && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Data Atualização</div><div className="dv">{v(prop.dataAtualizacao)}</div></div></div>}
            </>
          ) : (
            <>
              <div className="ds-hd"><span>PROPRIETÁRIO ATUAL</span></div>
              <div className="ds-row"><div className="ds-row-inner"><div className="dk">Resultado</div><div className="dv">Dados não disponíveis nesta consulta</div></div></div>
            </>
          )}
        </div>
      </div>

      {/* ROW 2: Roubo/Furto + Dados Técnicos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2, marginTop: 2 }}>
        <div>
          <div className="ds-hd"><span>HISTÓRICO ROUBO/FURTO</span></div>
          <div className="ds-row">
            <div className="ds-row-inner"><div className="dk">Declaração de Roubo</div><div className="dv">{rf.declaracao ? 'SIM' : 'NÃO'}</div></div>
            <span className={`chip chip-${rf.declaracao ? 'red' : 'green'}`}>{rf.declaracao ? 'CONSTA' : 'NÃO'}</span>
          </div>
          <div className="ds-row">
            <div className="ds-row-inner"><div className="dk">Devolução Registrada</div><div className="dv">{rf.devolucao ? 'SIM' : 'NÃO'}</div></div>
            <span className={`chip chip-${rf.devolucao ? 'brass' : 'green'}`}>{rf.devolucao ? 'CONSTA' : 'NÃO'}</span>
          </div>
          <div className="ds-row">
            <div className="ds-row-inner"><div className="dk">Recuperação Registrada</div><div className="dv">{rf.recuperacao ? 'SIM' : 'NÃO'}</div></div>
            <span className={`chip chip-${rf.recuperacao ? 'brass' : 'green'}`}>{rf.recuperacao ? 'CONSTA' : 'NÃO'}</span>
          </div>
        </div>
        <div>
          {temDT ? (
            <>
              <div className="ds-hd"><span>DADOS TÉCNICOS</span></div>
              {dt.carroceria && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Carroceria</div><div className="dv">{v(dt.carroceria)}</div></div></div>}
              {dt.especie && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Espécie</div><div className="dv">{v(dt.especie)}</div></div></div>}
              {dt.procedencia && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Procedência</div><div className="dv">{v(dt.procedencia)}</div></div></div>}
              {dt.potencia && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Potência</div><div className="dv">{v(dt.potencia)}</div></div></div>}
              {dt.cilindrada && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Cilindrada</div><div className="dv">{v(dt.cilindrada)}</div></div></div>}
              {dt.capacidadePassageiros && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Cap. Passageiros</div><div className="dv">{v(dt.capacidadePassageiros)}</div></div></div>}
            </>
          ) : (
            <>
              <div className="ds-hd"><span>DADOS TÉCNICOS</span></div>
              <div className="ds-row"><div className="ds-row-inner"><div className="dk">Resultado</div><div className="dv">Dados não disponíveis nesta consulta</div></div></div>
            </>
          )}
        </div>
      </div>

      {/* Badge + RENAINF tabela responsiva */}
      <div className="src-badge">RENAINF</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd">
          <span>INFRAÇÕES DE TRÂNSITO</span>
          <span className="ds-hd-badge">{reg(totalRenainf)}</span>
        </div>
        {ocorrencias.length > 0 ? (
          <div className="tbl-wrap">
            <table className="snc-tbl">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Data/Hora</th>
                  <th>AIT</th>
                  <th>Descrição</th>
                  <th>Órgão</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ocorrencias.map((o, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#faf8f1' : '#f4f1ea' }}>
                    <td className="mono">{o.codigo ?? '—'}</td>
                    <td className="mono">{o.dataHora ?? '—'}</td>
                    <td className="mono">{o.ait ?? '—'}</td>
                    <td>{o.descricao ?? '—'}</td>
                    <td>{abrOrg(o.orgao)}</td>
                    <td className="mono bold">{o.valor ?? '—'}</td>
                    <td><span className="chip chip-brass">CONSTA</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Resultado</div><div className="dv">Nenhuma infração registrada no RENAINF</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>

      {/* Badge + PRECIFICADOR FIPE tabela responsiva */}
      {prec.length > 0 && (
        <>
          <div className="src-badge">PRECIFICADOR FIPE</div>
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd"><span>TABELA DE PRECIFICAÇÃO</span><span className="ds-hd-badge">{reg(prec.length)}</span></div>
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Fabricante/Modelo</th>
                    <th>Ano Modelo</th>
                    <th>Informante</th>
                    <th>Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {prec.map((item, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#faf8f1' : '#f4f1ea' }}>
                      <td className="mono">{v(item.codigo)}</td>
                      <td className="bold">{v(item.fabricanteModelo)}</td>
                      <td className="mono">{v(item.anoModelo)}</td>
                      <td className="mono">FIPE</td>
                      <td className="green">{v(item.preco)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PDF Oficial */}
      {pdf && (
        <>
          <div className="src-badge">DOCUMENTO OFICIAL</div>
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd"><span>DOCUMENTO PDF OFICIAL · SENATRAN/DENATRAN</span></div>
            <div className="ds-row"><div className="ds-row-inner"><div className="dk">Relatório Oficial</div><div className="dv"><a href={pdf} target="_blank" rel="noopener noreferrer" style={{ color: '#2ba84a', textDecoration: 'underline' }}>↓ Download do PDF Oficial</a></div></div></div>
          </div>
        </>
      )}
    </>
  );
}

// ─── §02 Resultados — Veículo ─────────────────────────────────────────────────
function DadosVeiculo({ r }: { r: Record<string, unknown> }) {
  const vei = (r.veiculo ?? {}) as Record<string, unknown>;
  const fipe = (r.fipe ?? []) as Record<string, unknown>[];
  const principal = fipe.find((f) => f.principal) ?? fipe[0];
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2 }}>
        <div>
          <div className="ds-hd"><span>IDENTIFICAÇÃO · DENATRAN/SENATRAN</span></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Marca</div><div className="dv">{v(vei.marca)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Modelo</div><div className="dv">{v(vei.modelo)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Cor</div><div className="dv">{v(vei.cor)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Categoria</div><div className="dv">{v(vei.categoria)}</div></div></div>
        </div>
        <div>
          <div className="ds-hd"><span>DADOS TÉCNICOS</span></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Combustível</div><div className="dv">{v(vei.combustivel)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Ano Fabricação</div><div className="dv">{v(vei.anoFabricacao)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Ano Modelo</div><div className="dv">{v(vei.anoModelo)}</div></div></div>
          {vei.chassi && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Chassi</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(vei.chassi)}</div></div></div>}
        </div>
      </div>
      {principal && (
        <div className="ds-block">
          <div className="ds-hd"><span>TABELA FIPE</span><span style={{ opacity: 0.6 }}>{v(principal.mesReferencia)}</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 110px 140px', gap: 12, padding: '8px 16px', background: 'rgba(200,162,90,0.08)', borderBottom: '1px solid #d4cfc1', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--ink2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span>Código</span><span>Fabricante/Modelo</span><span>Ano Modelo</span><span>Informante</span><span>Preço</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 110px 140px', gap: 12, padding: '12px 16px', background: '#faf8f1', borderBottom: '1px solid #d4cfc1', alignItems: 'center' }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{v(principal.codigoFipe)}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{v(vei.marca)} {v(vei.modelo)}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(principal.anoModelo)}</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>FIPE</span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: 'var(--greend)' }}>{v(principal.valor)}</span>
          </div>
        </div>
      )}
    </>
  );
}

// ─── §02 Resultados — Proprietário ───────────────────────────────────────────
function DadosProprietario({ r }: { r: Record<string, unknown> }) {
  const p = (r.proprietario ?? {}) as Record<string, unknown>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2 }}>
      <div>
        <div className="ds-hd"><span>PROPRIETÁRIO ATUAL · DENATRAN/SENATRAN</span></div>
        <div className="ds-row"><div className="ds-row-inner"><div className="dk">Nome</div><div className="dv">{v(p.nome)}</div></div></div>
        <div className="ds-row"><div className="ds-row-inner"><div className="dk">Documento (CPF/CNPJ)</div><div className="dv">{v(p.documento)}</div></div></div>
        <div className="ds-row"><div className="ds-row-inner"><div className="dk">Município / UF</div><div className="dv">{p.municipio ? `${p.municipio}${p.uf ? ` / ${p.uf}` : ''}` : '—'}</div></div></div>
        <div className="ds-row"><div className="ds-row-inner"><div className="dk">Status</div><div className="dv">{v(p.statusDescricao)}</div></div>{p.statusDescricao && <span className="chip chip-green">{v(p.statusDescricao)}</span>}</div>
      </div>
      <div>
        <div className="ds-hd"><span>DADOS DO VEÍCULO</span></div>
        <div className="ds-row"><div className="ds-row-inner"><div className="dk">Marca / Modelo</div><div className="dv">{v(p.marcaModelo)}</div></div></div>
        <div className="ds-row"><div className="ds-row-inner"><div className="dk">Placa / RENAVAM</div><div className="dv">{v(p.placa)} · {v(p.renavam)}</div></div></div>
        <div className="ds-row"><div className="ds-row-inner"><div className="dk">Ano Fab. / Modelo</div><div className="dv">{v(p.anoFabricacao)} / {v(p.anoModelo)}</div></div></div>
        <div className="ds-row"><div className="ds-row-inner"><div className="dk">Cor / Combustível</div><div className="dv">{v(p.cor)} · {v(p.combustivel)}</div></div></div>
        {p.chassi && <div className="ds-row"><div className="ds-row-inner"><div className="dk">Chassi</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(p.chassi)}</div></div></div>}
      </div>
    </div>
  );
}

// ─── §02 Resultados — Crédito ─────────────────────────────────────────────────
function DadosCredito({ r }: { r: Record<string, unknown> }) {
  const scr = (r.scr ?? {}) as Record<string, unknown>;
  const score = (r.score ?? {}) as Record<string, unknown>;
  const pontuacao = typeof score.pontuacao === 'number' ? score.pontuacao : null;
  const faixa = v(score.faixa);
  const vencido = parseFloat(String(scr.totalVencido ?? '0').replace(',', '.'));
  const prejuizo = parseFloat(String(scr.totalPrejuizo ?? '0').replace(',', '.'));

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2 }}>
        <div>
          <div className="ds-hd"><span>SCR BACEN · BANCO CENTRAL DO BRASIL</span></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Crédito a Vencer</div><div className="dv">{v(scr.totalAVencer)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Crédito Vencido</div><div className="dv">{v(scr.totalVencido)}</div></div>{vencido > 0 && <span className="chip chip-red">VENCIDO</span>}</div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Prejuízo</div><div className="dv">{v(scr.totalPrejuizo)}</div></div>{prejuizo > 0 && <span className="chip chip-red">PREJUÍZO</span>}</div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Limite de Crédito</div><div className="dv">{v(scr.limiteCredito)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Qtd. Instituições / Operações</div><div className="dv">{v(scr.quantidadeInstituicoes)} / {v(scr.quantidadeOperacoes)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Base de Dados</div><div className="dv">{v(scr.databaseConsultada)}</div></div></div>
        </div>
        <div>
          <div className="ds-hd"><span>SCORE DE CRÉDITO</span></div>
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Pontuação</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: pontuacao != null && pontuacao >= 500 ? 'var(--greend)' : '#c0392b' }}>
                {pontuacao != null ? `${pontuacao}` : '—'}<span style={{ fontSize: 13, color: 'var(--ink2)', fontWeight: 400 }}> / 1000</span>
              </div>
            </div>
            {pontuacao != null && <span className={`chip chip-${pontuacao >= 500 ? 'green' : 'red'}`}>{faixa}</span>}
          </div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Faixa de Risco</div><div className="dv">{faixa}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Início Relacionamento</div><div className="dv">{v(scr.dataInicioRelacionamento)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Coobrigação Assumida</div><div className="dv">{v(scr.coobrigacaoAssumida)}</div></div></div>
        </div>
      </div>
    </>
  );
}

function DadosDataset({ dataset, resultado }: { dataset: DatasetTipo; resultado: Record<string, unknown> }) {
  if (dataset === 'vip-car') return <DadosVipCar r={resultado} />;
  if (dataset === 'veiculo') return <DadosVeiculo r={resultado} />;
  if (dataset === 'proprietario') return <DadosProprietario r={resultado} />;
  if (dataset === 'credito') return <DadosCredito r={resultado} />;
  return null;
}

// ─── CSS (idêntico ao /exemplo — toolbar e header intocados) ──────────────────
const CSS = `
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
  .r-page{max-width:960px;margin:0 auto;background:var(--paper);box-shadow:0 18px 60px rgba(10,22,40,.18);position:relative;overflow:hidden}
  .r-wm{position:absolute;top:46%;left:50%;transform:translate(-50%,-50%) rotate(-22deg);font-family:'Libre Caslon Text',serif;font-size:140px;color:rgba(10,22,40,.04);pointer-events:none;font-style:italic;z-index:0;font-weight:700;white-space:nowrap}
  .r-page>*:not(.r-wm){position:relative;z-index:1}
  .r-head{background:var(--navy);color:#fff;padding:38px 56px 30px;border-bottom:6px solid var(--green)}
  .r-head-top{display:flex;justify-content:space-between;align-items:center;gap:30px;padding-bottom:24px;border-bottom:1px solid #1a2742}
  .r-brand-meta{display:flex;align-items:center;gap:16px}
  .r-brand-meta .sep{width:1px;height:36px;background:#2a3a55}
  .r-brand-meta .t1{font-family:'Libre Caslon Text',serif;font-size:18px;line-height:1;color:#fff}
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
  .r-sh{display:flex;align-items:center;gap:2px;margin-bottom:24px}
  .r-sh .num{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--brass);letter-spacing:.16em;text-transform:uppercase;min-width:70px}
  .r-sh h2{font-family:'Libre Caslon Text',serif;font-size:22px;font-weight:400;letter-spacing:-.01em;color:var(--ink);flex:1;margin:0}
  .r-sh .badge{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;padding:4px 10px;border:1px solid #cfc7b1;color:var(--ink2)}
  .r-summary{display:grid;grid-template-columns:1fr 1.12fr;gap:36px;align-items:start}
  .r-sl .label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;color:var(--ink2);text-transform:uppercase;margin-bottom:10px}
  .r-sl .sname{font-family:'Libre Caslon Text',serif;font-size:26px;line-height:1.1;letter-spacing:-.015em;margin-bottom:4px;font-weight:400}
  .r-sl .pfs{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px;padding-top:16px;border-top:1px solid #d4cfc1}
  .r-sl .pfs>div .l{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.14em;color:var(--ink2);text-transform:uppercase;margin-bottom:3px}
  .r-sl .pfs>div .v{font-size:13px;color:var(--ink);font-weight:500}
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
  .ds-block{margin-bottom:2px}
  .ds-hd{background:var(--navy);color:#fff;font-size:9px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
  .ds-row{padding:11px 16px;display:flex;justify-content:space-between;align-items:center;background:#faf8f1;border:1px solid #d4cfc1;border-top:none;gap:16px}
  .ds-row-inner{flex:1;min-width:0}
  .ds-row .dk{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--ink2);letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;white-space:nowrap}
  .ds-row .dv{font-size:11px;font-family:'JetBrains Mono',monospace;font-weight:400;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .src-badge{display:inline-flex;align-items:center;padding:5px 12px;border:1px solid #b8b0a0;color:var(--ink2);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;background:var(--paper);margin:16px 0 0}
  .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #c8bfa8;border-top:none}
  .snc-tbl{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}
  .snc-tbl th{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--ink2);letter-spacing:.08em;text-transform:uppercase;padding:9px 14px;background:rgba(200,162,90,0.08);border-bottom:1px solid #c8bfa8;border-right:1px solid #c8bfa8;text-align:center;white-space:nowrap}
  .snc-tbl th:last-child{border-right:none}
  .snc-tbl td{padding:11px 14px;border-bottom:1px solid #c8bfa8;border-right:1px solid #c8bfa8;color:var(--ink);text-align:center;vertical-align:middle;white-space:nowrap;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:400}
  .snc-tbl td:last-child{border-right:none}
  .snc-tbl tr:last-child td{border-bottom:none}
  .snc-tbl td.mono{font-family:'JetBrains Mono',monospace;font-size:11px}
  .snc-tbl td.bold{font-size:11px}
  .snc-tbl td.green{color:var(--greend);font-family:'JetBrains Mono',monospace;font-size:11px}
  .chip{font-size:9px;padding:3px 8px;border-radius:2px;font-family:'JetBrains Mono',monospace;font-weight:700;white-space:nowrap;letter-spacing:.04em}
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
  .hash-block{margin:32px 0 0;padding-top:24px;border-top:1px solid #d4cfc1}
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
    .r-head{padding:28px 24px 22px;page-break-inside:avoid;break-inside:avoid}
    .r-head-top,.r-title,.r-ms{page-break-inside:avoid;break-inside:avoid}
    .r-ms{page-break-after:avoid;break-after:avoid}
    .r-sec:not(.r-sec-results){page-break-inside:avoid;break-inside:avoid;padding:24px}
    .r-summary,.r-sl .pfs,.r-vrd,.r-vrd-result{page-break-inside:avoid;break-inside:avoid}
    .r-sec-results{page-break-before:always !important;break-before:page !important;padding:24px}
    .ds-hd{page-break-after:avoid;break-after:avoid}
    .ds-row{page-break-inside:avoid;break-inside:avoid}
    .ds-block{page-break-inside:auto;break-inside:auto;margin-bottom:8px}
    .hash-block{page-break-inside:avoid;break-inside:avoid}
    .r-sh{page-break-after:avoid;break-after:avoid}
    h1,h2,h3,h4{page-break-after:avoid;break-after:avoid}
    .r-sig{page-break-inside:avoid;break-inside:avoid;padding:28px 24px}
    .r-foot{page-break-inside:avoid;break-inside:avoid;padding:10px 24px}
    .r-sec{padding-left:24px;padding-right:24px}
  }
`;

const TOOLBAR_JS = `
(function(){
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'back') {
      if (window.history.length > 1) window.history.back();
      else window.location.href = '/';
    } else if (action === 'print') {
      window.print();
    } else if (action === 'copy') {
      var url = window.location.href;
      var done = function(){
        var d = btn.getAttribute('data-label-copied') || '✓ Copiado';
        var o = btn.getAttribute('data-label-default') || btn.textContent;
        btn.textContent = d;
        setTimeout(function(){ btn.textContent = o; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function(){
          var ta = document.createElement('textarea');
          ta.value = url; ta.style.position='fixed'; ta.style.opacity='0';
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); } catch(_){}
          document.body.removeChild(ta); done();
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = url; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch(_){}
        document.body.removeChild(ta); done();
      }
    }
  });
})();
`;

// ─── Página principal ─────────────────────────────────────────────────────────
export default async function RelatorioPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { d } = await searchParams;

  const payload = d ? deserializar(d) : null;
  const protocolo = gerarProtocolo(id, payload ? new Date(payload.emitidoEm) : undefined);
  const meta = payload ? DATASET_META[payload.dataset] : null;

  const emitidoEm = payload
    ? new Date(payload.emitidoEm).toLocaleString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
      }).toUpperCase() + ' BRT'
    : '—';

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{CSS}</style>

      {/* TOOLBAR — idêntico ao /exemplo, intocado */}
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
      <script dangerouslySetInnerHTML={{ __html: TOOLBAR_JS }} />

      <div className="print-running-sig" aria-hidden="true">
        <span className="lbl">§ SHA-256</span>
        <span>snc-{id}-autenticado</span>
        <span className="lbl">PROTOCOLO {protocolo}</span>
      </div>

      <div className="r-page">
        <div className="r-wm">SNC · {payload?.dataset?.toUpperCase() ?? 'RELATÓRIO'}</div>

        {/* HEADER — idêntico ao /exemplo, intocado */}
        <header className="r-head">
          <div className="r-head-top">
            <div className="r-brand-meta">
              <img src="/snc-logo.png" alt="SNC" style={{ height: 48, width: 'auto' }} />
              <div className="sep" />
              <div>
                <div className="t1">Sistema Nacional de Conformidade</div>
                <div className="t2">Relatório oficial de consulta</div>
              </div>
            </div>
            <div className="r-did">
              <div className="lbl">Protocolo SNC</div>
              <div className="num">{protocolo}</div>
              <div className="sub">EMITIDO EM {emitidoEm}</div>
            </div>
          </div>
          <div className="r-title">
            <div className="r-kicker">§ Relatório Consolidado</div>
            <div>
              <h1>
                {meta?.titulo ?? 'Relatório'}
                <br />
                <span className="it">SNC AutoScore</span>
                <span className="it" style={{ color: '#9aa3b2' }}>{' — Placa: '}</span>
                <span className="it" style={{ color: 'var(--brass)' }}>{payload?.documento ?? ''}</span>
              </h1>
              <div className="lede">{meta?.subtitulo ?? 'Documento gerado a partir de fontes oficiais.'}</div>
            </div>
          </div>
        </header>

        {/* META STRIP */}
        <div className="r-ms">
          <div><div className="l">{payload?.documentoLabel ?? 'Consulta'}</div><div className="v">{payload?.documento ?? '—'}</div></div>
          <div><div className="l">Dataset</div><div className="v">SNC AutoScore</div></div>
          <div><div className="l">Módulo</div><div className="v">SNC Veículos</div></div>
          <div><div className="l">Validade do parecer</div><div className="v">30 dias corridos</div></div>
        </div>

        {!payload ? (
          <section className="r-sec">
            <div className="r-sh"><div className="num">§ ERR</div><h2>Relatório indisponível</h2></div>
            <p style={{ color: 'var(--ink2)', fontSize: 13, lineHeight: 1.7 }}>
              Não foi possível decodificar os dados deste relatório. O link pode estar corrompido.<br />
              Retorne à consulta e clique em <strong>⎙ Gerar Relatório</strong> novamente.
            </p>
          </section>
        ) : (
          <>
            {/* §01 SUMÁRIO */}
            <section className="r-sec">
              <div className="r-sh">
                <div className="num">§ 01</div>
                <h2>Sumário executivo</h2>
                <span className="badge">DADOS CADASTRAIS</span>
              </div>
              <div className="r-summary">
                <SumarioCard payload={payload} />
                <div className="r-vrd">
                  <div className="r-vrd-top">
                    <span className="r-vrd-tag">Parecer SNC consolidado</span>
                    <span className="r-vrd-stamp">✓ GERADO DIGITALMENTE</span>
                  </div>
                  {(() => {
                    const rid = (payload.resultado?.identificacao ?? payload.resultado?.veiculo ?? payload.resultado?.proprietario ?? {}) as Record<string, unknown>;
                    const status = String(rid.statusDescricao ?? 'CONSULTA CONCLUÍDA');
                    const negativo = /roubo|furto|restri|bloqueio|alena|renajud|impedimento/i.test(status);
                    return (
                      <div className="r-vrd-result">
                        <div className="r-seal" style={negativo ? { background: '#d32f2f' } : {}}>{negativo ? '✗' : '✓'}</div>
                        <div className="r-vt">
                          <h3 style={negativo ? { color: '#d32f2f' } : {}}>{status}</h3>
                          <p>{negativo ? 'Foram encontradas pendências neste veículo.' : 'Dados processados e disponíveis para análise.'}</p>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="r-vrd-msg">
                    Consulta realizada em {emitidoEm}. Documento com validade de 30 dias corridos a partir da data de emissão.
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
                <span className="badge">SNC AUTOSCORE</span>
              </div>

              <DadosDataset dataset={payload.dataset} resultado={payload.resultado} />

              <div className="hash-block">
                <div className="lbl">§ SHA-256 Hash Block</div>
                <div className="val">
                  #{new Date(payload.emitidoEm).getTime().toString(16).toUpperCase()}-{id.toUpperCase()}-SNC
                  <br />
                  <span style={{ opacity: 0.45, fontSize: 10 }}>sha256( JSON.stringify(rawData) + emitidoEm ) — protocolo {protocolo}</span>
                </div>
              </div>
            </section>

            {/* ASSINATURA */}
            <div className="r-sig">
              <div className="left">
                <div className="lbl">§ Validade jurídica &amp; autenticação</div>
                <p>Este documento é gerado de forma automatizada pelo Sistema Nacional de Conformidade — SNC, mediante consulta autorizada e finalidade declarada conforme LGPD (Lei 13.709/2018, art. 7º, V) e Resolução BACEN nº 4.893/2021. Toda informação aqui consolidada é rastreável à fonte primária.</p>
                <p>O parecer tem validade de 30 dias corridos a partir da data de emissão. Protocolo: <strong>{protocolo}</strong>.</p>
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
              <span>{meta?.titulo ?? 'Relatório'} · {payload.documento}</span>
              <span>Protocolo {protocolo}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
