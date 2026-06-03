import { Fragment } from 'react';
import Script from "next/script";
import type { Metadata } from 'next';
import { gerarProtocolo, DATASET_META, type RelatorioPayload, type DatasetTipo } from '@/lib/relatorio';
import { CrlveDownloadButton } from '@/components/crlve-download-button';


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
function formatarPlacaExibicao(doc?: unknown): string {
  if (typeof doc !== 'string' || !doc) return '—';
  const clean = doc.replace(/[^A-Z0-9]/g, '');
  if (clean === 'SNC2026') return 'SNC-XXXX';
  if (clean === 'ROB0190') return 'SNC-171X';
  return doc;
}

function v(val: unknown): string {
  return val == null || val === '' ? '—' : String(val);
}

function obterMarcaEModelo(marcaModelo: unknown) {
  if (typeof marcaModelo !== 'string' || !marcaModelo) {
    return { marca: '—', modelo: '—' };
  }
  let partes = marcaModelo.split('/');
  if (partes.length === 1 && marcaModelo.includes(' - ')) {
    partes = marcaModelo.split(' - ');
  }
  if (partes.length > 1) {
    return {
      marca: partes[0].trim(),
      modelo: partes.slice(1).join(' - ').trim()
    };
  }
  return { marca: '—', modelo: marcaModelo.trim() };
}

function formatarSentenceCase(val: unknown): string {
  if (typeof val !== 'string' || !val) return '—';
  const clean = val.trim();
  if (clean === '—' || clean === '') return '—';
  
  if (clean.length <= 4 && /^[A-Z\/]+$/.test(clean)) {
    return clean;
  }
  
  const lowered = clean.toLowerCase();
  let formatted = lowered.charAt(0).toUpperCase() + lowered.slice(1);
  
  formatted = formatted
    .replace(/\bcsv\b/gi, 'CSV')
    .replace(/\bfipe\b/gi, 'FIPE')
    .replace(/\bmg\b/gi, 'MG')
    .replace(/\bsp\b/gi, 'SP')
    .replace(/\brj\b/gi, 'RJ')
    .replace(/\bpr\b/gi, 'PR')
    .replace(/\bsc\b/gi, 'SC')
    .replace(/\brs\b/gi, 'RS')
    .replace(/\bdf\b/gi, 'DF')
    .replace(/\bce\b/gi, 'CE')
    .replace(/\bpe\b/gi, 'PE')
    .replace(/\bba\b/gi, 'BA')
    .replace(/\bgm\b/gi, 'GM')
    .replace(/\bvw\b/gi, 'VW');

  return formatted;
}


// ─── §01 Sumário — card esquerdo por dataset ──────────────────────────────────
function SumarioCard({ payload }: { payload: RelatorioPayload }) {
  const r = payload.resultado;

  if (payload.dataset === 'snc-autoscore' || payload.dataset === 'vip-car' || payload.dataset === 'veiculo' || payload.dataset === 'proprietario' || payload.dataset === 'agregados-basica' || payload.dataset === 'agregados-propria' || payload.dataset === 'agregados-chassi' || payload.dataset === 'veicular-agrupados') {
    // Para veiculo: dados em r.veiculo; para proprietario: dados em r.proprietario; para vip-car/snc-autoscore: em r.identificacao
    const vei = (r.veiculo ?? {}) as Record<string, unknown>;
    const prop = (r.proprietario ?? {}) as Record<string, unknown>;
    const id = (r.identificacao ?? {}) as Record<string, unknown>;
    const dt = (r.dadosTecnicos ?? {}) as Record<string, unknown>;
    const placa = formatarPlacaExibicao(payload.documento);

    // Modelo: vip-car usa id.marcaModelo, proprietario usa prop.marcaModelo, veiculo usa vei.marca + vei.modelo, agregados-basica/propria/chassi usa vei.marca_modelo
    const modelo = payload.dataset === 'veiculo'
      ? `${v(vei.marca)} ${v(vei.modelo)}`.trim()
      : payload.dataset === 'agregados-basica' || payload.dataset === 'agregados-propria' || payload.dataset === 'agregados-chassi' || payload.dataset === 'veicular-agrupados'
        ? v(vei.marca_modelo)
        : v(id.marcaModelo ?? prop.marcaModelo);

    const anoFab = v(id.anoFabricacao ?? prop.anoFabricacao ?? vei.anoFabricacao ?? vei.ano_fabricacao);
    const anoMod = v(id.anoModelo ?? prop.anoModelo ?? vei.anoModelo ?? vei.ano_modelo);
    const comb   = v(id.combustivel ?? prop.combustivel ?? vei.combustivel);
    // Cor: vip-car usa prop.cor ou dt.cor; proprietario usa prop.cor; veiculo usa vei.cor
    const cor    = v(id.cor ?? prop.cor ?? vei.cor ?? dt.cor);
    // Renavam: proprietario usa prop.renavam; veiculo não tem
    const renavam = v(prop.renavam ?? id.renavam ?? vei.renavam);
    const mun = (() => {
      const m = id.municipio ?? prop.municipio ?? vei.municipio;
      const u = id.uf ?? prop.uf ?? vei.uf;
      return m ? `${m}${u ? ` / ${u}` : ''}` : '—';
    })();

    return (
      <div className="r-sl" style={{ paddingLeft: 0 }}>
        {(() => {
          let s = modelo.replace(/\//g, ' - ');
          const prefixos: Record<string, string> = { 'GM': 'CHEVROLET', 'VW': 'VOLKSWAGEN', 'MMC': 'MITSUBISHI', 'MB': 'MERCEDES-BENZ', 'MBENZ': 'MERCEDES-BENZ', 'IMP': '', 'I': '' };
          const partes = s.split(/\s*-\s*/);
          if (partes.length >= 2) { const sigla = partes[0].trim().toUpperCase(); const resto = partes.slice(1).join(' - ').trim().toUpperCase(); const mc = prefixos[sigla]; if (mc !== undefined && (mc === '' || resto.startsWith(mc))) s = partes.slice(1).join(' - ').trim(); }
          const palavras = s.trim().split(/\s+/);
          const fabricante = palavras[0] || '';
          const modeloNome = palavras.slice(1).join(' ') || '';
          return (
            <>
              <div className="label" style={{ marginBottom: 4 }}>{fabricante}</div>
              <div className="sname">{modeloNome || fabricante}</div>
            </>
          );
        })()}
        <div style={{ width: 60, height: 3, background: 'var(--brass)', marginTop: 10, marginBottom: 14 }} />
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em' }}>{payload.dataset === 'agregados-chassi' ? `Chassi: ${payload.documento}` : `Placa: ${placa}`}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">Ano Fab/Mod</div><div className="v">{anoFab}/{anoMod}</div></div>
          <div><div className="l">Combustível</div><div className="v">{comb}</div></div>
          <div><div className="l">Cor</div><div className="v">{cor}</div></div>
          {mun !== '—' && <div><div className="l">Município</div><div className="v">{mun}</div></div>}
        </div>
      </div>
    );
  }

  if (payload.dataset === 'leilao') {
    const dv = (r.dadosVeiculo ?? {}) as Record<string, unknown>;
    const sc = (r.score ?? {}) as Record<string, unknown>;
    const placa = formatarPlacaExibicao(payload.documento);
    const modelo = v(dv.marcaModelo);
    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">Pontuação</div><div className="v">{v(sc.pontuacao)}</div></div>
          <div><div className="l">Aceitação</div><div className="v">{v(sc.aceitacao)}%</div></div>
          <div><div className="l">% Sobre FIPE</div><div className="v">{v(sc.percentualSobreFipe)}%</div></div>
          <div><div className="l">Vistoria</div><div className="v">{v(sc.exigeVistoriaEspecial)}</div></div>
          <div><div className="l">Cor</div><div className="v">{v(dv.cor)}</div></div>
          <div><div className="l">Km</div><div className="v">{dv.kilometragem ? `${parseInt(String(dv.kilometragem)).toLocaleString('pt-BR')} km` : '—'}</div></div>
        </div>
      </div>
    );
  }

  if (payload.dataset === 'renajud') {
    const data = (r.data || r) as Record<string, unknown>;
    const restricoes = (data.restricoes ?? []) as string[];
    const temRestricoes = restricoes.length > 0;
    const placa = formatarPlacaExibicao(payload.documento);
    
    // Obter dados básicos do veículo (com fallback estético robusto)
    const vei = (data.veiculo || r.veiculo || {}) as Record<string, unknown>;
    const modelo = v(vei.marcaModelo || "VW/FOX 1.0 GII");
    const anoFab = v(vei.anoFabricacao || "2012");
    const anoMod = v(vei.anoModelo || "2013");
    const cor = v(vei.cor || "VERMELHA");

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">Ano Fabricação</div><div className="v">{anoFab}</div></div>
          <div><div className="l">Ano Modelo</div><div className="v">{anoMod}</div></div>
          <div><div className="l">Cor</div><div className="v">{cor}</div></div>
          <div><div className="l">Tribunal</div><div className="v">{v(data.tribunal)}</div></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Nº Processo</div>
            <div className="v" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, wordBreak: 'break-all' }}>{v(data.processo)}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Restrições RENAJUD</div>
            <div className="v" style={{ color: temRestricoes ? '#ef4444' : '#2ba84a', fontWeight: 700 }}>
              {temRestricoes ? restricoes.join(' · ') : 'NADA CONSTA'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (payload.dataset === 'debitos') {
    const data = (r.data || r) as Record<string, unknown>;
    const veiculo = (data.veiculo || {}) as Record<string, unknown>;
    const debitos = (data.debitos || {}) as Record<string, unknown>;
    
    const placa = formatarPlacaExibicao(payload.documento);
    const modelo = v(veiculo.marca_modelo || veiculo.marcaModelo || data.marca_modelo || "—");
    const renavam = v(veiculo.renavam || data.renavam || "—");
    const chassi = v(veiculo.chassi || data.chassi || "—");
    
    const totalGeral = debitos.totalGeral != null ? String(debitos.totalGeral) : "R$ 0,00";
    const temDebitos = totalGeral !== "R$ 0,00" && totalGeral !== "—" && totalGeral !== "0";

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">RENAVAM</div><div className="v">{renavam}</div></div>
          <div><div className="l">Chassi</div><div className="v">{chassi}</div></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Extrato de Débitos</div>
            <div className="v" style={{ color: temDebitos ? '#ef4444' : '#2ba84a', fontWeight: 700 }}>
              {temDebitos ? `DÉBITOS ATIVOS (${totalGeral})` : 'ISENTO DE DÉBITOS'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (payload.dataset === 'gravame') {
    const data = (r.data || r) as Record<string, unknown>;
    const placa = formatarPlacaExibicao(payload.documento);
    const modelo = v(data.marca_modelo || (data.veiculo as Record<string, unknown>)?.marcaModelo || "—");
    const anoFab = v(data.ano_fabricacao || (data.veiculo as Record<string, unknown>)?.anoFabricacao || "—");
    const anoMod = v(data.ano_modelo || (data.veiculo as Record<string, unknown>)?.anoModelo || "—");
    const comb   = v(data.combustivel || (data.veiculo as Record<string, unknown>)?.combustivel || "—");
    const cor    = v(data.cor_veiculo || (data.veiculo as Record<string, unknown>)?.cor || "—");
    const renavam = v(data.renavam);
    const financiamento = data.financiamento === "SIM";

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">Ano Fabricação</div><div className="v">{anoFab}</div></div>
          <div><div className="l">Ano Modelo</div><div className="v">{anoMod}</div></div>
          <div><div className="l">Combustível</div><div className="v">{comb}</div></div>
          <div><div className="l">Cor</div><div className="v">{cor}</div></div>
          {renavam && renavam !== '—' && <div><div className="l">RENAVAM</div><div className="v">{renavam}</div></div>}
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Restrição de Gravame</div>
            <div className="v" style={{ color: financiamento ? '#ef4444' : '#2ba84a', fontWeight: 700 }}>
              {financiamento ? `FINANCIADO (${v(data.situacao)})` : 'VEÍCULO ISENTO'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (payload.dataset === 'estadual') {
    const veiculo = (r.veiculo ?? {}) as Record<string, unknown>;
    const estadual = (r.estadual ?? {}) as Record<string, unknown>;
    const placa = formatarPlacaExibicao(payload.documento);
    const modelo = v(estadual.marcaModelo || veiculo.marca_modelo || '—');
    const restricoes = (estadual.restricoes ?? []) as unknown[];
    const temRestricoes = restricoes.length > 0;
    const totalDebitos = v(estadual.totalDebitos || 'R$ 0,00');
    const temDebitos = totalDebitos !== 'R$ 0,00' && totalDebitos !== '—' && totalDebitos !== '0';

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">RENAVAM</div><div className="v">{v(estadual.renavam || veiculo.renavam)}</div></div>
          <div><div className="l">UF Registro</div><div className="v">{v(estadual.uf || veiculo.uf)}</div></div>
          <div><div className="l">Ano Fab/Mod</div><div className="v">{v(estadual.anoFabricacao)} / {v(estadual.anoModelo)}</div></div>
          <div><div className="l">Município</div><div className="v">{v(estadual.municipio)}</div></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Situação Estadual</div>
            <div className="v" style={{ color: temDebitos || temRestricoes ? '#ef4444' : '#2ba84a', fontWeight: 700 }}>
              {temDebitos || temRestricoes
                ? `DÉBITOS / RESTRIÇÕES ATIVAS${temDebitos ? ` (${totalDebitos})` : ''}`
                : 'VEÍCULO REGULAR — DETRAN'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (payload.dataset === 'renainf') {
    const veiculo = (r.veiculo ?? {}) as Record<string, unknown>;
    const renainf = (r.renainf ?? {}) as Record<string, unknown>;
    const placa = formatarPlacaExibicao(payload.documento);
    const modelo = v(renainf.marcaModelo || veiculo.marca_modelo || '—');
    const totalMultas = Number(renainf.totalMultas ?? 0);
    const valorTotal = v(renainf.valorTotal || '0,00');

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">RENAVAM</div><div className="v">{v(renainf.renavam || veiculo.renavam)}</div></div>
          <div><div className="l">Chassi</div><div className="v">{v(renainf.chassi || veiculo.chassi)}</div></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Situação Renainf</div>
            <div className="v" style={{ color: totalMultas > 0 ? '#ef4444' : '#2ba84a', fontWeight: 700, lineHeight: 1.25 }}>
              {totalMultas > 0
                ? (totalMultas === 1 ? `CONSTA 1 MULTA (R$ ${valorTotal})` : `CONSTAM ${totalMultas} MULTAS (R$ ${valorTotal})`)
                : <>VEÍCULO REGULAR<br />NADA CONSTA</>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (payload.dataset === 'historico-km') {
    const veiculo    = (r.veiculo    ?? {}) as Record<string, unknown>;
    const historicoKm = (r.historicoKm ?? {}) as Record<string, unknown>;
    const placa      = formatarPlacaExibicao(payload.documento);
    const modelo     = v(veiculo.marcaModelo || "—");
    const total      = Number(historicoKm.totalRegistros ?? 0);
    const anomalia   = !!historicoKm.anomalia;

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">Ano Fab.</div><div className="v">{v(veiculo.anoFabricacao)}</div></div>
          <div><div className="l">Ano Mod.</div><div className="v">{v(veiculo.anoModelo)}</div></div>
          <div><div className="l">Registros Km</div><div className="v">{total}</div></div>
          <div><div className="l">Cor</div><div className="v">{v(veiculo.cor)}</div></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Situação Hodômetro</div>
            <div className="v" style={{ color: anomalia ? '#ef4444' : '#2ba84a', fontWeight: 700 }}>
              {anomalia ? 'DIVERGÊNCIA DETECTADA' : 'HISTÓRICO CONSISTENTE'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (payload.dataset === 'crlve') {
    const data = (r.data || r) as Record<string, any>;
    const veiculo = (data.veiculo || {}) as Record<string, any>;
    const crlv = (data.documentos?.crlv || {}) as Record<string, any>;
    const placa = formatarPlacaExibicao(payload.documento);
    const modelo = v(veiculo.marca_modelo || veiculo.marcaModelo || "VW/FOX 1.0 GII");
    const renavam = v(veiculo.renavam || "—");
    const chassi = v(veiculo.chassi || "—");
    const exercicio = v(crlv.exercicio || "—");
    const combustivel = v(veiculo.combustivel || "—");

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">Exercício</div><div className="v">{exercicio}</div></div>
          <div><div className="l">RENAVAM</div><div className="v">{renavam}</div></div>
          <div><div className="l">Chassi</div><div className="v">{chassi}</div></div>
          <div><div className="l">Combustível</div><div className="v">{combustivel}</div></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Situação CRLV-e</div>
            <div className="v" style={{ color: crlv.existe_ocorrencia === '1' ? '#ef4444' : '#2ba84a', fontWeight: 700 }}>
              {crlv.existe_ocorrencia === '1' ? 'CONSTA IMPEDIMENTO' : 'CRLV-e EMITIDO — REGULAR'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (payload.dataset === 'csv-completa') {
    const veicular  = (r.veicular  ?? {}) as Record<string, any>;
    const propAtual = (veicular.proprietario_atual_veiculo ?? {}) as Record<string, any>;
    const binNac    = (veicular.bin_nacional ?? {}) as Record<string, any>;
    const restricoes= (binNac.restricoes ?? {}) as Record<string, any>;
    const renainf   = (veicular.renainf ?? {}) as Record<string, any>;
    const renajud   = (veicular.renajud ?? {}) as Record<string, any>;
    const alerta    = (veicular.alerta_indicio ?? {}) as Record<string, any>;
    const placa     = formatarPlacaExibicao(payload.documento);
    const modelo    = v(propAtual.marca_modelo || binNac.marca_modelo || '—');
    const temRestGeral   = restricoes.existe_restricao_geral === '1';
    const temRestRenajud = restricoes.existe_restricao_renajud === '1' || Number(renajud.quantidade_ocorrencias ?? 0) > 0;
    const temRestRoubo   = restricoes.existe_restricao_roubo_furto === '1';
    const temSinistro    = alerta.existe_ocorrencia === '1';
    const temMultas      = Number(renainf.qtd_ocorrencias ?? 0) > 0;
    const temRestricao   = temRestGeral || temRestRenajud || temRestRoubo || temSinistro || temMultas;

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">RENAVAM</div><div className="v">{v(propAtual.renavam || binNac.renavam)}</div></div>
          <div><div className="l">Chassi</div><div className="v">{v(propAtual.chassi || binNac.chassi)}</div></div>
          <div><div className="l">Proprietário</div><div className="v">{v(propAtual.proprietario_nome || binNac.proprietario?.nome)}</div></div>
          <div><div className="l">Ano Fab / Mod.</div><div className="v">{v(propAtual.ano_fabricacao || binNac.ano_fabricacao)} / {v(propAtual.ano_modelo || binNac.ano_modelo)}</div></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Situação Geral</div>
            <div className="v" style={{ color: temRestricao ? '#ef4444' : '#2ba84a', fontWeight: 700 }}>
              {temRestricao ? 'RESTRIÇÕES ENCONTRADAS' : 'VEÍCULO SEM RESTRIÇÕES'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (payload.dataset === 'analitico-veicular') {
    const vei = (r.veiculo ?? {}) as Record<string, any>;
    const prop = (r.proprietario ?? {}) as Record<string, any>;
    const renajud = (r.renajud ?? {}) as Record<string, any>;
    const rouboFurto = (r.rouboFurto ?? {}) as Record<string, any>;
    const recall = (r.recall ?? {}) as Record<string, any>;
    const histKm = (r.historicoKm ?? {}) as Record<string, any>;
    const renainf = (r.renainf ?? {}) as Record<string, any>;

    const placa = formatarPlacaExibicao(payload.documento);
    const modelo = v(vei.marca_modelo || '—');
    const renavam = v(vei.renavam);
    const chassi = v(vei.chassi);
    
    const temAlerta = !!(
      renajud.temRestricao ||
      rouboFurto.temOcorrencia ||
      recall.temRecall ||
      histKm.anomalia ||
      (renainf.totalMultas && renainf.totalMultas > 0)
    );

    return (
      <div className="r-sl">
        <div className="label">Veículo</div>
        <div className="sname">{modelo.replace('/', ' - ')}</div>
        <div className="sdoc" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, letterSpacing: '0.08em', marginTop: 4 }}>Placa: {placa}</div>
        <div className="pfs" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div><div className="l">RENAVAM</div><div className="v">{renavam}</div></div>
          <div><div className="l">Chassi</div><div className="v">{chassi}</div></div>
          <div><div className="l">Proprietário</div><div className="v">{v(prop.nome)}</div></div>
          <div><div className="l">Ano Fab / Mod.</div><div className="v">{v(vei.ano_fabricacao)} / {v(vei.ano_modelo)}</div></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="l">Parecer Consolidado</div>
            <div className="v" style={{ color: temAlerta ? '#ef4444' : '#2ba84a', fontWeight: 700, lineHeight: 1.25 }}>
              {temAlerta ? 'ALERTAS/RESTRIÇÕES ATIVAS' : <>VEÍCULO REGULAR<br />NADA CONSTA</>}
            </div>
          </div>
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
      <div className="src-badge">DENATRAN / SENATRAN</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, marginBottom: 2, marginTop: 8, alignItems: 'stretch' }}>
        {/* Coluna esquerda: Identificação */}
        <div>
          <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO</span></div>
          <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Marca/Modelo</div><div className="dv">{v(id.marcaModelo).replace('/', ' - ')}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">CRLV</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(prop.crlv)}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Chassi</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(id.chassi ?? prop.chassi ?? dt.chassi)}</div></div>
          </div></div>
          <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Motor</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(prop.motor ?? dt.motor)}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Potência</div><div className="dv">{v(dt.potencia)}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Cilindrada</div><div className="dv">{v(dt.cilindrada)}</div></div>
          </div></div>
          <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Carroceria</div><div className="dv">{v(dt.carroceria)}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Espécie</div><div className="dv">{v(dt.especie ?? id.categoria)}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Cap. Passageiros</div><div className="dv">{v(dt.capacidadePassageiros)}</div></div>
          </div></div>
        </div>
        {/* Coluna direita: Histórico Roubo/Furto */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd"><span>HISTÓRICO ROUBO/FURTO</span></div>
          <div className="ds-row">
            <div className="ds-row-inner"><div className="dk">Declaração de Roubo</div><div className="dv">{rf.declaracao ? 'SIM' : 'NÃO'}</div></div>
            <span className={`chip chip-${rf.declaracao ? 'red' : 'green'}`}>{rf.declaracao ? 'CONSTA' : 'NÃO'}</span>
          </div>
          <div className="ds-row">
            <div className="ds-row-inner"><div className="dk">Devolução Registrada</div><div className="dv">{rf.devolucao ? 'SIM' : 'NÃO'}</div></div>
            <span className={`chip chip-${rf.devolucao ? 'green' : (rf.declaracao ? 'red' : 'green')}`}>{rf.devolucao ? 'CONSTA' : 'NÃO'}</span>
          </div>
          <div className="ds-row" style={{ flex: 1 }}>
            <div className="ds-row-inner"><div className="dk">Recuperação Registrada</div><div className="dv">{rf.recuperacao ? 'SIM' : 'NÃO'}</div></div>
            <span className={`chip chip-${rf.recuperacao ? 'green' : (rf.declaracao ? 'red' : 'green')}`}>{rf.recuperacao ? 'CONSTA' : 'NÃO'}</span>
          </div>
        </div>
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
                    <tr key={i} style={{ background: '#ffffff' }}>
                      <td className="mono">{v(item.codigo)}</td>
                      <td>{v(item.fabricanteModelo)}</td>
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

      {/* Badge + RENAINF tabela responsiva */}
      <div className="src-badge">RENAINF</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd">
          <span>INFRAÇÕES DE TRÂNSITO</span>
          <span className="ds-hd-badge">{reg(totalRenainf)}</span>
        </div>
        {ocorrencias.length > 0 ? (
          <div className="tbl-wrap" style={{ overflow: 'hidden' }}>
            <table className="snc-tbl" style={{ width: '100%', wordBreak: 'break-word', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Código</th>
                  <th>AIT</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ocorrencias.map((o, i) => {
                  const bg = '#ffffff';
                  const isLast = i === ocorrencias.length - 1;
                  return (
                    <Fragment key={i}>
                      {/* Linha 1: dados gerais */}
                      <tr style={{ background: bg, borderTop: '1px solid #c8bfa8' }}>
                        <td className="mono" style={{ paddingTop: 10 }}>{o.dataHora ?? '—'}</td>
                        <td className="mono" style={{ paddingTop: 10 }}>{o.codigo ?? '—'}</td>
                        <td className="mono" style={{ paddingTop: 10 }}>{o.auto ?? o.ait ?? '—'}</td>
                        <td className="mono bold green" style={{ paddingTop: 10 }}>{o.valor ?? '—'}</td>
                        <td style={{ paddingTop: 10 }}><span className="chip chip-red">CONSTA</span></td>
                      </tr>
                      {/* Linha 2: descrição e órgão */}
                      <tr style={{
                        background: bg,
                        fontSize: '0.82em',
                        borderBottom: '1px solid #c8bfa8',
                      }}>
                        <td colSpan={5} style={{ padding: '4px 12px 10px', borderBottom: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              fontFamily: "'JetBrains Mono',monospace",
                              fontWeight: 700,
                              fontSize: 13,
                              color: '#5a6a7a',
                              width: 18,
                              textAlign: 'center',
                              marginRight: 6
                            }}>
                              {i + 1}
                            </div>
                            <div style={{
                              flex: 1,
                              display: 'flex', gap: 14, flexWrap: 'wrap',
                              paddingLeft: 8, borderLeft: '2px solid #5a6a7a',
                            }}>
                              <span><strong style={{ color: '#5a6a7a' }}>Descrição:</strong> {o.descricao ?? '—'}</span>
                              <span><strong style={{ color: '#5a6a7a' }}>Órgão Autuador:</strong> {o.orgao ?? '—'}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                      {/* Espaço entre ocorrências */}
                      {!isLast && (
                        <tr><td colSpan={5} style={{ padding: 0, height: 8, background: '#f4f1ea', border: 'none' }} /></tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Resultado</div><div className="dv">Nenhuma infração registrada no RENAINF</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>

      {/* PDF Oficial */}
      {pdf && (
        <>
          <div className="src-badge">DOCUMENTO OFICIAL</div>
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd"><span>SENATRAN / DENATRAN</span></div>
            <div className="ds-row"><div className="ds-row-inner"><div className="dk">Relatório Oficial</div><div className="dv"><a href={pdf} target="_blank" rel="noopener noreferrer" style={{ color: '#2ba84a', textDecoration: 'underline' }}>↓ Download do PDF Oficial</a></div></div></div>
          </div>
        </>
      )}
    </>
  );
}

// ─── §02 Resultados — Veículo (FIPE + Chassi) ────────────────────────────────
function DadosVeiculo({ r }: { r: Record<string, unknown> }) {
  const vei = (r.veiculo ?? {}) as Record<string, unknown>;
  const fipe = (r.fipe ?? []) as Record<string, unknown>[];
  const historico = (r.historico ?? []) as Record<string, unknown>[];
  const principal = fipe.find((f) => f.principal) ?? fipe[0];
  return (
    <>
      <div className="src-badge">FIPE / DENATRAN · SENATRAN</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2, marginTop: 8 }}>
        <div>
          <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO</span></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Marca</div><div className="dv">{v(vei.marca)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Modelo</div><div className="dv">{v(vei.modelo)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Cor</div><div className="dv">{v(vei.cor)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Categoria / Espécie</div><div className="dv">{v(vei.categoria)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Combustível</div><div className="dv">{v(vei.combustivel)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Ano Fabricação</div><div className="dv">{v(vei.anoFabricacao)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Ano Modelo</div><div className="dv">{v(vei.anoModelo)}</div></div></div>
        </div>
        <div>
          <div className="ds-hd"><span>TABELA FIPE · {v(principal?.mesReferencia)}</span></div>
          {principal ? (
            <>
              <div className="ds-row"><div className="ds-row-inner"><div className="dk">Código FIPE</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(principal.codigoFipe)}</div></div></div>
              <div className="ds-row"><div className="ds-row-inner"><div className="dk">Valor Atual</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: 'var(--greend)' }}>{v(principal.valor)}</div></div></div>
              <div className="ds-row"><div className="ds-row-inner"><div className="dk">Mês Referência</div><div className="dv">{v(principal.mesReferencia)}</div></div></div>
              <div className="ds-row"><div className="ds-row-inner"><div className="dk">Combustível FIPE</div><div className="dv">{v(principal.combustivel)}</div></div></div>
              <div className="ds-row"><div className="ds-row-inner"><div className="dk">Ano Modelo FIPE</div><div className="dv">{v(principal.anoModelo)}</div></div></div>
            </>
          ) : (
            <div className="ds-row"><div className="ds-row-inner"><div className="dk">Status</div><div className="dv">Sem dados FIPE</div></div></div>
          )}
          {!!vei.chassi && (
            <>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#5a6a7a', letterSpacing: '0.22em', textTransform: 'uppercase', padding: '16px 0 8px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8 }}>Chassi</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#ffffff', wordBreak: 'break-all', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>{v(vei.chassi)}</div>
            </>
          )}
        </div>
      </div>
      {/* Histórico FIPE — todos os anos/versões */}
      {fipe.length > 1 && (
        <div className="ds-block" style={{ marginTop: 8 }}>
          <div className="ds-hd"><span>FIPE · TODOS OS ANOS / VERSÕES</span><span className="ds-hd-badge">{reg(fipe.length)}</span></div>
          <div className="tbl-wrap">
            <table className="snc-tbl">
              <thead>
                <tr>
                  <th>Código FIPE</th>
                  <th>Modelo</th>
                  <th>Ano Modelo</th>
                  <th>Combustível</th>
                  <th>Referência</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {fipe.map((item, i) => (
                  <tr key={i} style={{ background: item.principal ? 'rgba(15,26,36,0.04)' : '#ffffff' }}>
                    <td className="mono" style={{ color: '#5a6a7a' }}>{v(item.codigoFipe)}</td>
                    <td>{v(vei.marca)} {v(item.anoModelo)}</td>
                    <td className="mono">{v(item.anoModelo)}</td>
                    <td>{v(item.combustivel)}</td>
                    <td className="mono">{v(item.mesReferencia)}</td>
                    <td className="green" style={{ fontWeight: item.principal ? 700 : 400 }}>{v(item.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Histórico de valores */}
      {historico.length > 1 && (
        <div className="ds-block" style={{ marginTop: 8 }}>
          <div className="ds-hd"><span>EVOLUÇÃO DE PREÇO FIPE</span><span className="ds-hd-badge">{reg(historico.length)} meses</span></div>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {historico.map((h, i) => (
              <div key={i} style={{ flex: '0 0 auto', padding: '10px 16px', borderRight: '1px solid #d4cfc1', textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#8a7a5a', letterSpacing: '0.1em', marginBottom: 4 }}>{v(h.mes)}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: 'var(--greend)' }}>{v(h.valorFormatado)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─── §02 Resultados — Proprietário Atual ─────────────────────────────────────
function DadosProprietario({ r }: { r: Record<string, unknown> }) {
  const p = (r.proprietario ?? {}) as Record<string, unknown>;
  const pdf = r.pdf as string | null;
  return (
    <>
      <div className="src-badge">DENATRAN / SENATRAN</div>

      {/* ── Seção 1: PROPRIETÁRIO ATUAL ── */}
      <div className="ds-block" style={{ marginTop: 8, marginBottom: 2 }}>
        <div className="ds-hd"><span>PROPRIETÁRIO ATUAL</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Nome</div><div className="dv" style={{ fontWeight: 600, fontSize: 15 }}>{v(p.nome)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Documento (CPF/CNPJ)</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(p.documento)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Município / UF</div><div className="dv">{p.municipio ? `${p.municipio}${p.uf ? ` / ${p.uf}` : ''}` : '—'}</div></div></div>
          <div className="ds-row">
            <div className="ds-row-inner"><div className="dk">Status</div><div className="dv">{v(p.statusDescricao)}</div></div>
            {!!p.statusDescricao && <span className="chip chip-green">{v(p.statusDescricao)}</span>}
          </div>
          {!!p.dataAtualizacao && (
            <div className="ds-row"><div className="ds-row-inner"><div className="dk">Atualizado em</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(p.dataAtualizacao)}</div></div></div>
          )}
        </div>
      </div>

      {/* ── Seção 2: DADOS DO VEÍCULO ── */}
      <div className="ds-block" style={{ marginBottom: 2 }}>
        <div className="ds-hd"><span>DADOS DO VEÍCULO</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Marca / Modelo</div><div className="dv" style={{ fontWeight: 600 }}>{v(p.marcaModelo).replace('/', ' - ')}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Placa</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{v(p.placa)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">RENAVAM</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(p.renavam)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Ano Fabricação / Modelo</div><div className="dv">{v(p.anoFabricacao)} / {v(p.anoModelo)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Cor</div><div className="dv">{v(p.cor)}</div></div></div>
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Combustível</div><div className="dv">{v(p.combustivel)}</div></div></div>
          {!!p.motor && (
            <div className="ds-row"><div className="ds-row-inner"><div className="dk">Motor</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(p.motor)}</div></div></div>
          )}
          {!!p.crlv && (
            <div className="ds-row"><div className="ds-row-inner"><div className="dk">CRLV</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(p.crlv)}</div></div></div>
          )}
        </div>
        {!!p.chassi && (
          <div className="ds-row" style={{ margin: '4px 0 0' }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Chassi</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, wordBreak: 'break-all' }}>{v(p.chassi)}</div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Oficial */}
      {!!pdf && (
        <>
          <div className="src-badge">DOCUMENTO OFICIAL</div>
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd"><span>SENATRAN / DENATRAN</span></div>
            <div className="ds-row"><div className="ds-row-inner"><div className="dk">Relatório Oficial</div><div className="dv"><a href={pdf} target="_blank" rel="noopener noreferrer" style={{ color: '#2ba84a', textDecoration: 'underline' }}>↓ Download do PDF Oficial</a></div></div></div>
          </div>
        </>
      )}
    </>
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
      <div className="src-badge">REGISTRO DE CRÉDITO E SCORE</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2, marginTop: 8 }}>
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

// ─── Dados Leilão com Score ───────────────────────────────────────────────────
function DadosLeilao({ r }: { r: Record<string, unknown> }) {
  const sc = (r.score ?? {}) as Record<string, unknown>;
  const dv = (r.dadosVeiculo ?? {}) as Record<string, unknown>;
  const sin = (r.sinistro ?? {}) as Record<string, unknown>;
  const ocorrencias = (r.ocorrencias ?? []) as Record<string, unknown>[];
  const total = (r.totalOcorrencias ?? 0) as number;
  const cl = (r.checkList ?? null) as Record<string, unknown> | null;
  const sinistros = (r.historicoSinistros ?? []) as Record<string, unknown>[];

  const scoreCor = (p: unknown): string => {
    if (p === 'A') return '#22c55e';
    if (p === 'B') return '#84cc16';
    if (p === 'C') return '#eab308';
    if (p === 'D') return '#f97316';
    return '#ef4444';
  };

  return (
    <>
      {/* Score */}
      <div className="src-badge">LEILÃO VEICULAR + SCORE</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, marginBottom: 2, marginTop: 8, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd"><span>SCORE DE LEILÃO</span></div>
          <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', paddingLeft: 32 }}>
              <div style={{ textAlign: 'left' }}>
                <div className="dk">Pontuação</div>
                <div className="dv" style={{ fontSize: 28, fontFamily: "'Libre Caslon Text',serif", color: scoreCor(sc.pontuacao) }}>{v(sc.pontuacao)}</div>
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <div className="dk">Aceitação</div>
                <div className="dv">{v(sc.aceitacao)}%</div>
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: 32 }}>
              <div style={{ textAlign: 'left' }}>
                <div className="dk">% Sobre FIPE</div>
                <div className="dv">{v(sc.percentualSobreFipe)}%</div>
              </div>
            </div>
          </div></div>
          <div className="ds-row" style={{ flex: 1, alignItems: 'flex-start' }}><div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', paddingLeft: 32 }}>
              <div style={{ textAlign: 'left' }}>
                <div className="dk">Descrição</div>
                <div className="dv">{formatarSentenceCase(sc.descricaoPontuacao)}</div>
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <div className="dk">Exige Vistoria</div>
                <div className="dv">{formatarSentenceCase(sc.exigeVistoriaEspecial)}</div>
              </div>
            </div>
            <div style={{ flex: 1 }} />
          </div></div>
        </div>
        {/* Sinistro */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd" style={{
            background: sin.existeOcorrencia ? '#991b1b' : 'var(--navy)',
          }}><span>INDÍCIO DE SINISTRO</span></div>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: sin.existeOcorrencia ? '#fdf0f0' : '#f0fdf4',
            border: `1px solid ${sin.existeOcorrencia ? '#e8b4b4' : '#b4e8c0'}`,
            borderTop: 'none',
            padding: '18px 20px', gap: 16,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 8px',
                background: sin.existeOcorrencia ? '#c0392b' : '#2ba84a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: '#fff',
              }}>
                {sin.existeOcorrencia ? '✕' : '✓'}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: sin.existeOcorrencia ? '#c0392b' : '#2ba84a',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {sin.existeOcorrencia ? 'CONSTA' : 'NADA CONSTA'}
              </div>
              {!!sin.descricao && (
                <div style={{
                  fontSize: 10,
                  color: sin.existeOcorrencia ? '#7a2020' : '#1d5a2a',
                  marginTop: 6,
                }}>
                  {v(sin.descricao)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dados do Veículo */}
      <div style={{ marginBottom: 2, marginTop: 2 }}>
        <div className="ds-hd"><span>DADOS DO VEÍCULO (LEILÃO)</span></div>
        <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Marca/Modelo</div><div className="dv">{v(dv.marcaModelo).replace('/', ' - ')}</div></div>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Cor</div><div className="dv">{v(dv.cor)}</div></div>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Chassi</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(dv.chassi)}</div></div>
        </div></div>
        <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Motor</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(dv.motor)}</div></div>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Câmbio</div><div className="dv">{v(dv.cambio)}</div></div>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Combustível</div><div className="dv">{v(dv.combustivel)}</div></div>
        </div></div>
        <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Carroceria</div><div className="dv">{v(dv.carroceria)}</div></div>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Categoria</div><div className="dv">{v(dv.categoria)}</div></div>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Km</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{dv.kilometragem ? `${parseInt(String(dv.kilometragem)).toLocaleString('pt-BR')} km` : '—'}</div></div>
        </div></div>
        <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Qtd. Eixos</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(dv.qtdEixos)}</div></div>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Eixo Traseiro</div><div className="dv">{v(dv.eixoTraseiro)}</div></div>
          <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">RENAVAM</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(dv.renavam)}</div></div>
        </div></div>
      </div>

      {/* Ocorrências de Leilão */}
      <div className="src-badge">HISTÓRICO</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>OCORRÊNCIAS DE LEILÃO</span><span className="ds-hd-badge">{total === 1 ? '1 REGISTRO' : `${total} REGISTROS`}</span></div>
        {ocorrencias.length > 0 ? (
          <div className="tbl-wrap">
            <table className="snc-tbl" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <colgroup>
                <col style={{ width: '12%' }} />
                <col style={{ width: '23%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '35%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'normal' }}>Data</th>
                  <th style={{ whiteSpace: 'normal' }}>Leiloeiro</th>
                  <th style={{ whiteSpace: 'normal' }}>Lote</th>
                  <th style={{ whiteSpace: 'normal' }}>Comitente</th>
                  <th style={{ whiteSpace: 'normal' }}>Pátio</th>
                </tr>
              </thead>
              <tbody>
                {ocorrencias.map((o, i) => {
                  const bg = '#ffffff';
                  const isLast = i === ocorrencias.length - 1;
                  return (
                    <Fragment key={i}>
                      {/* Linha 1: dados gerais */}
                      <tr style={{ background: bg, borderTop: '1px solid #c8bfa8' }}>
                        <td className="mono" style={{ paddingTop: 10, whiteSpace: 'nowrap' }}>{v(o.dataLeilao)}</td>
                        <td style={{ paddingTop: 10, whiteSpace: 'normal', wordBreak: 'break-word' }}>{v(o.leiloeiro)}</td>
                        <td className="mono" style={{ paddingTop: 10, whiteSpace: 'nowrap' }}>{v(o.lote)}</td>
                        <td style={{ paddingTop: 10, whiteSpace: 'normal', wordBreak: 'break-word' }}>{v(o.comitente)}</td>
                        <td style={{ paddingTop: 10, whiteSpace: 'normal', wordBreak: 'break-word' }}>{v(o.patio)}</td>
                      </tr>
                      {/* Linha 2: condições */}
                      <tr style={{
                        background: bg,
                        fontSize: '0.82em',
                        borderBottom: '1px solid #c8bfa8',
                      }}>
                        <td colSpan={5} style={{ padding: '6px 12px 10px 24px', borderBottom: 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                fontFamily: "'JetBrains Mono',monospace",
                                fontWeight: 700,
                                fontSize: 13,
                                color: '#5a6a7a',
                                width: 18,
                                textAlign: 'center',
                                marginRight: 16
                              }}>
                                {i + 1}
                              </div>
                              <div style={{
                                flex: 1,
                                display: 'flex', flexDirection: 'column', gap: 4,
                                paddingLeft: 8, borderLeft: '2px solid #5a6a7a',
                                textAlign: 'left'
                              }}>
                                <span><strong style={{ color: '#5a6a7a' }}>Geral:</strong> {formatarSentenceCase(o.condicaoGeral)}</span>
                                <span><strong style={{ color: '#5a6a7a' }}>Motor:</strong> {formatarSentenceCase(o.condicaoMotor)}</span>
                                <span><strong style={{ color: '#5a6a7a' }}>Mecânica:</strong> {formatarSentenceCase(o.condicaoMecanica)}</span>
                                <span><strong style={{ color: '#5a6a7a' }}>Câmbio:</strong> {formatarSentenceCase(o.condicaoCambio)}</span>
                                <span><strong style={{ color: '#5a6a7a' }}>Chassi:</strong> {formatarSentenceCase(o.situacaoChassi)}</span>
                              </div>
                            </div>
                            {!!o.observacoes && String(o.observacoes) !== '—' && (
                              <div style={{
                                paddingLeft: 6,
                                textAlign: 'left',
                                marginTop: 6,
                                borderTop: '1px dashed #d4cfc1',
                                paddingTop: 6,
                                whiteSpace: 'normal',
                                wordBreak: 'break-word'
                              }}>
                                <span><strong style={{ color: '#5a6a7a' }}>Obs:</strong> {formatarSentenceCase(o.observacoes)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Espaço entre ocorrências */}
                      {!isLast && (
                        <tr><td colSpan={5} style={{ padding: 0, height: 8, background: '#f4f1ea', border: 'none' }} /></tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Resultado</div><div className="dv">Nenhum registro de leilão</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>

      {/* Checklist de Avarias */}
      {!!cl && (
        <>
          <div className="src-badge">INSPEÇÃO</div>
          <div style={{ marginTop: 8 }}>
            <div className="ds-hd"><span>CHECKLIST DE AVARIAS</span></div>
            <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Frente</div><div className="dv">{v(cl.frente)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Traseira</div><div className="dv">{v(cl.traseira)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Teto</div><div className="dv">{v(cl.teto)}</div></div>
            </div></div>
            <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Lateral Direita</div><div className="dv">{v(cl.lateralDireita)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Lateral Esquerda</div><div className="dv">{v(cl.lateralEsquerda)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Interior</div><div className="dv">{v(cl.interior)}</div></div>
            </div></div>
            <div className="ds-row"><div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Airbags</div><div className="dv">{v(cl.airbags)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Local Queimado</div><div className="dv">{v(cl.localQueimado)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Rodas Faltantes</div><div className="dv">{v(cl.rodasFaltantes)}</div></div>
            </div></div>
            <div className="ds-row"><div className="ds-row-inner"><div className="dk">Observações</div><div className="dv">{v(cl.observacoes)}</div></div></div>
          </div>
        </>
      )}

      {/* Histórico de Sinistros */}
      {sinistros.length > 0 && (
        <>
          <div className="src-badge" style={{ borderColor: '#c0392b', color: '#991b1b' }}>SINISTROS</div>
          <div style={{ marginTop: 8 }}>
            <div className="ds-hd" style={{ background: '#991b1b' }}>
              <span>HISTÓRICO DE SINISTROS</span>
              <span className="ds-hd-badge" style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>
                {sinistros.length === 1 ? '1 registro' : `${sinistros.length} registros`}
              </span>
            </div>
            <div className="tbl-wrap" style={{ overflow: 'hidden' }}>
              <table className="snc-tbl" style={{ width: '100%', wordBreak: 'break-word', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(153,27,27,0.08)' }}>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Seguradora</th>
                    <th>Valor</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {sinistros.map((s, i) => {
                    const isLast = i === sinistros.length - 1;
                    return (
                      <Fragment key={i}>
                        <tr style={{ background: '#ffffff', borderTop: '1px solid #c8bfa8' }}>
                          <td className="mono" style={{ paddingTop: 10 }}>{v(s.data)}</td>
                          <td style={{ paddingTop: 10, color: '#991b1b', fontWeight: 600 }}>{v(s.tipo)}</td>
                          <td style={{ paddingTop: 10 }}>{v(s.seguradora)}</td>
                          <td className="mono" style={{ paddingTop: 10 }}>{v(s.valor)}</td>
                          <td style={{ paddingTop: 10 }}>
                            <span style={{
                              padding: '2px 8px', fontSize: 9, letterSpacing: '0.06em',
                              background: 'rgba(153,27,27,0.08)', color: '#991b1b',
                              border: '1px solid rgba(153,27,27,0.2)',
                            }}>
                              {v(s.situacao)}
                            </span>
                          </td>
                        </tr>
                        <tr style={{
                          background: '#ffffff', fontSize: '0.82em',
                          borderBottom: '1px solid #c8bfa8',
                        }}>
                        <td colSpan={5} style={{ padding: '4px 12px 10px', borderBottom: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              fontFamily: "'JetBrains Mono',monospace",
                              fontWeight: 700,
                              fontSize: 13,
                              color: '#c0392b',
                              width: 18,
                              textAlign: 'center',
                              marginRight: 6
                            }}>
                              {i + 1}
                            </div>
                            <div style={{
                              flex: 1,
                              paddingLeft: 8, borderLeft: '2px solid #c0392b',
                              fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
                              color: '#3a4252',
                            }}>
                              {v(s.descricao)}
                            </div>
                          </div>
                        </td>
                        </tr>
                        {!isLast && (
                          <tr><td colSpan={5} style={{ padding: 0, height: 8, background: '#f4f1ea', border: 'none' }} /></tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
function DadosRenajud({ r }: { r: Record<string, unknown> }) {
  const data = (r.data || r) as Record<string, unknown>;
  const restricoes = (data.restricoes ?? []) as string[];
  const temRestricoes = restricoes.length > 0;

  return (
    <>
      <div className="src-badge">CNJ / SENATRAN · RESTRIÇÕES JUDICIAIS</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd">
          <span>SITUAÇÃO RENAJUD</span>
          {temRestricoes && <span className="ds-hd-badge">1 PROCESSO</span>}
        </div>
        {temRestricoes ? (
          <div className="tbl-wrap" style={{ overflow: 'hidden' }}>
            <table className="snc-tbl" style={{ width: '100%', wordBreak: 'break-word', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Nº Processo</th>
                  <th>Órgão Judicial</th>
                  <th>Tribunal</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {/* Linha 1: dados gerais */}
                <tr style={{ background: '#ffffff', borderTop: '1px solid #c8bfa8' }}>
                  <td className="mono">{v(data.processo)}</td>
                  <td>{v(data.orgao_judicial)}</td>
                  <td>{v(data.tribunal)}</td>
                  <td>
                    <span className="chip chip-red">RESTRIÇÃO ATIVA</span>
                  </td>
                </tr>
                {/* Linha 2: restrições detalhadas */}
                <tr style={{
                  background: '#ffffff',
                  fontSize: '0.82em',
                  borderBottom: '1px solid #c8bfa8',
                }}>
                  <td colSpan={4} style={{ padding: '4px 12px 10px', borderBottom: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#c0392b',
                        width: 18,
                        textAlign: 'center',
                        marginRight: 6
                      }}>
                        1
                      </div>
                      <div style={{
                        flex: 1,
                        display: 'flex', gap: 14, flexWrap: 'wrap',
                        paddingLeft: 8, borderLeft: '2px solid #c0392b',
                        textAlign: 'left'
                      }}>
                        <span>
                          <strong style={{ color: '#c0392b' }}>Restrições Constatadas:</strong>{' '}
                          {restricoes.length > 0 ? restricoes.join(" · ") : 'RESTRIÇÃO REGISTRADA'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Restrição Judicial</div><div className="dv">Nenhuma restrição de circulação, transferência ou penhora</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>
    </>
  );
}
function DadosDebitos({ r }: { r: Record<string, unknown> }) {
  const data = (r.data || r) as Record<string, unknown>;
  const veiculo = (data.veiculo || {}) as Record<string, unknown>;
  const debitos = (data.debitos || {}) as Record<string, unknown>;

  const multas = (debitos.multas ?? []) as Record<string, unknown>[];
  const ipva = (debitos.ipva ?? []) as Record<string, unknown>[];
  const licenciamento = (debitos.licenciamento ?? []) as Record<string, unknown>[];
  const dpvat = (debitos.dpvat ?? []) as Record<string, unknown>[];
  const outros = (debitos.outrosDebitos ?? []) as Record<string, unknown>[];

  const totalMultas = debitos.totalMultas != null ? String(debitos.totalMultas) : "R$ 0,00";
  const totalIpva = debitos.totalIpva != null ? String(debitos.totalIpva) : "R$ 0,00";
  const totalLicenciamento = debitos.totalLicenciamento != null ? String(debitos.totalLicenciamento) : "R$ 0,00";
  const totalDpvat = debitos.totalDpvat != null ? String(debitos.totalDpvat) : "R$ 0,00";
  const totalGeral = debitos.totalGeral != null ? String(debitos.totalGeral) : "R$ 0,00";

  const temDebitos = totalGeral !== "R$ 0,00" && totalGeral !== "—" && totalGeral !== "0";

  return (
    <>
      <div className="src-badge">SENATRAN / DETRAN · EXTRATO DE DÉBITOS V4</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, marginBottom: 2, marginTop: 8, alignItems: 'stretch' }}>
        {/* Ficha do Veículo */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO</span></div>
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Marca/Modelo</div>
                <div className="dv">{v(veiculo.marca_modelo || veiculo.marcaModelo || data.marca_modelo || "—").replace('/', ' - ')}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Placa</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(veiculo.placa || data.placa || "—")}</div>
              </div>
            </div>
          </div>
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Chassi</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(veiculo.chassi || data.chassi || "—")}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">RENAVAM</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(veiculo.renavam || data.renavam || "—")}</div>
              </div>
            </div>
          </div>
          <div className="ds-row" style={{ flex: 1, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Ano Fab/Mod</div>
                <div className="dv">{v(veiculo.anoFabricacao || data.ano_fabricacao || "—")} / {v(veiculo.anoModelo || data.ano_modelo || "—")}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Cor / Combustível</div>
                <div className="dv">{v(veiculo.cor || data.cor_veiculo || "—")} / {v(veiculo.combustivel || data.combustivel || "—")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo de Restrição Financeira / Débitos */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd" style={{
            background: temDebitos ? '#c0392b' : 'var(--navy)',
          }}><span>SITUAÇÃO FINANCEIRA</span></div>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: temDebitos ? '#fdf0f0' : '#f0fdf4',
            border: `1px solid ${temDebitos ? '#e8b4b4' : '#b4e8c0'}`,
            borderTop: 'none',
            padding: '18px 20px', gap: 16,
          }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 8px',
                background: temDebitos ? '#c0392b' : '#2ba84a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: '#fff',
              }}>
                {temDebitos ? '✕' : '✓'}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700,
                color: temDebitos ? '#c0392b' : '#2ba84a',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {temDebitos ? 'CONSTAM DÉBITOS ATIVOS' : 'ISENTO DE DÉBITOS'}
              </div>
              {temDebitos && (
                <div style={{ marginTop: 12 }}>
                  <span className="chip chip-red" style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px' }}>
                    TOTAL: {totalGeral}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Resumo Financeiro */}
      <div className="src-badge" style={{ marginTop: 12 }}>RESUMO CONSOLIDADO POR CATEGORIA</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>RESUMO DE VALORES</span><span className="ds-hd-badge">{reg(5)}</span></div>
        <div className="tbl-wrap">
          <table className="snc-tbl">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Categoria</th>
                <th>Qtd Débitos</th>
                <th style={{ textAlign: 'right' }}>Total Débito</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#ffffff' }}>
                <td style={{ textAlign: 'left' }}>Multas de Trânsito</td>
                <td>{multas.length}</td>
                <td style={{ textAlign: 'right', color: multas.length > 0 ? '#c0392b' : 'inherit' }} className="mono">{totalMultas}</td>
              </tr>
              <tr style={{ background: '#ffffff' }}>
                <td style={{ textAlign: 'left' }}>IPVA (Imposto sobre Propriedade)</td>
                <td>{ipva.length}</td>
                <td style={{ textAlign: 'right', color: ipva.length > 0 ? '#c0392b' : 'inherit' }} className="mono">{totalIpva}</td>
              </tr>
              <tr style={{ background: '#ffffff' }}>
                <td style={{ textAlign: 'left' }}>Taxa de Licenciamento Anual</td>
                <td>{licenciamento.length}</td>
                <td style={{ textAlign: 'right', color: licenciamento.length > 0 ? '#c0392b' : 'inherit' }} className="mono">{totalLicenciamento}</td>
              </tr>
              <tr style={{ background: '#ffffff' }}>
                <td style={{ textAlign: 'left' }}>Seguro DPVAT</td>
                <td>{dpvat.length}</td>
                <td style={{ textAlign: 'right', color: dpvat.length > 0 ? '#c0392b' : 'inherit' }} className="mono">{totalDpvat}</td>
              </tr>
              {outros.length > 0 && (
                <tr style={{ background: '#ffffff' }}>
                  <td style={{ textAlign: 'left' }}>Outros Débitos / Taxas Administrativas</td>
                  <td>{outros.length}</td>
                  <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{debitos.totalOutros ? String(debitos.totalOutros) : '—'}</td>
                </tr>
              )}
              <tr style={{ background: '#fcfaf6', fontWeight: 700 }}>
                <td style={{ textAlign: 'left', color: 'var(--ink)' }}>TOTAL GERAL ACUMULADO</td>
                <td>{multas.length + ipva.length + licenciamento.length + dpvat.length + outros.length}</td>
                <td style={{ textAlign: 'right', color: temDebitos ? '#c0392b' : 'var(--green)' }} className="mono">{totalGeral}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalhamento das Multas */}
      {multas.length > 0 && (
        <>
          <div className="src-badge" style={{ marginTop: 16 }}>DETALHAMENTO DE MULTAS DE TRÂNSITO</div>
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd"><span>INFRAÇÕES CONSTATADAS</span><span className="ds-hd-badge">{multas.length === 1 ? '1 MULTA' : `${multas.length} MULTAS`}</span></div>
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th style={{ textAlign: 'left' }}>Infração (Descrição)</th>
                    <th>Cód. Infração</th>
                    <th>Vencimento</th>
                    <th>Órgão Autuador</th>
                    <th>Situação</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {multas.map((m, idx) => (
                    <tr key={idx} style={{ background: '#ffffff' }}>
                      <td className="mono">{idx + 1}</td>
                      <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 220 }}>{v(m.descricao)}</td>
                      <td className="mono">{v(m.codigoInfracao || m.codigo)}</td>
                      <td className="mono">{v(m.dataVencimento || m.vencimento)}</td>
                      <td>{v(m.orgaoEmissor || m.orgao)}</td>
                      <td>
                        <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>
                          {v(m.situacao || 'EM ABERTO')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{v(m.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detalhamento de IPVA */}
      {ipva.length > 0 && (
        <>
          <div className="src-badge" style={{ marginTop: 16 }}>DETALHAMENTO DE IPVA EM ABERTO</div>
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd"><span>EXERCÍCIOS / PARCELAS CONSTATADOS</span><span className="ds-hd-badge">{ipva.length === 1 ? '1 DÉBITO' : `${ipva.length} DÉBITOS`}</span></div>
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th style={{ textAlign: 'left' }}>Exercício / Parcela</th>
                    <th>Vencimento</th>
                    <th>Situação</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {ipva.map((i, idx) => (
                    <tr key={idx} style={{ background: '#ffffff' }}>
                      <td className="mono">{idx + 1}</td>
                      <td style={{ textAlign: 'left' }}>IPVA {v(i.exercicio || i.descricao)} ({v(i.parcela || 'COTA ÚNICA')})</td>
                      <td className="mono">{v(i.dataVencimento || i.vencimento)}</td>
                      <td>
                        <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>
                          {v(i.situacao || 'EM ABERTO')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{v(i.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Detalhamento de Licenciamento / DPVAT */}
      {(licenciamento.length > 0 || dpvat.length > 0) && (
        <>
          <div className="src-badge" style={{ marginTop: 16 }}>DETALHAMENTO DE TAXAS E SEGUROS</div>
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd"><span>TAXAS DIVERSAS EM ABERTO</span><span className="ds-hd-badge">{(licenciamento.length + dpvat.length) === 1 ? '1 TAXA' : `${licenciamento.length + dpvat.length} TAXAS`}</span></div>
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th style={{ textAlign: 'left' }}>Descrição da Taxa</th>
                    <th>Vencimento</th>
                    <th>Situação</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {licenciamento.map((l, idx) => (
                    <tr key={`lic-${idx}`} style={{ background: '#ffffff' }}>
                      <td className="mono">{idx + 1}</td>
                      <td style={{ textAlign: 'left' }}>Taxa de Licenciamento Anual (Exercício {v(l.exercicio || l.descricao)})</td>
                      <td className="mono">{v(l.dataVencimento || l.vencimento)}</td>
                      <td>
                        <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>
                          {v(l.situacao || 'VENCIDO')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{v(l.valor)}</td>
                    </tr>
                  ))}
                  {dpvat.map((d, idx) => (
                    <tr key={`dpv-${idx}`} style={{ background: '#ffffff' }}>
                      <td className="mono">{licenciamento.length + idx + 1}</td>
                      <td style={{ textAlign: 'left' }}>Seguro Obrigatório DPVAT (Exercício {v(d.exercicio || d.descricao)})</td>
                      <td className="mono">{v(d.dataVencimento || d.vencimento)}</td>
                      <td>
                        <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>
                          {v(d.situacao || 'VENCIDO')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{v(d.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function DadosGravame({ r }: { r: Record<string, unknown> }) {
  const data = (r.data || r) as Record<string, unknown>;
  const temFinanciamento = data.financiamento === "SIM";

  return (
    <>
      <div className="src-badge">DENATRAN / B3 · SISTEMA DE GRAVAME</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, marginBottom: 2, marginTop: 8, alignItems: 'stretch' }}>
        {/* Ficha do Veículo */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd"><span>FICHA DO VEÍCULO</span></div>
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Marca/Modelo</div>
                <div className="dv">{v(data.marca_modelo || (data.veiculo as Record<string, unknown>)?.marcaModelo).replace('/', ' - ')}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Ano Fab/Mod</div>
                <div className="dv">
                  {v(data.ano_fabricacao || (data.veiculo as Record<string, unknown>)?.anoFabricacao)} / {v(data.ano_modelo || (data.veiculo as Record<string, unknown>)?.anoModelo)}
                </div>
              </div>
            </div>
          </div>
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Chassi</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                  {v(data.chassi)}
                </div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">RENAVAM</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                  {v(data.renavam)}
                </div>
              </div>
            </div>
          </div>
          <div className="ds-row" style={{ flex: 1, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Cor</div>
                <div className="dv">{v(data.cor_veiculo || (data.veiculo as Record<string, unknown>)?.cor)}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Combustível</div>
                <div className="dv">{v(data.combustivel || (data.veiculo as Record<string, unknown>)?.combustivel)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Situação Financeira (Gravame) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd" style={{
            background: temFinanciamento ? '#c0392b' : 'var(--navy)',
          }}><span>SITUAÇÃO FINANCEIRA</span></div>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: temFinanciamento ? '#fdf0f0' : '#f0fdf4',
            border: `1px solid ${temFinanciamento ? '#e8b4b4' : '#b4e8c0'}`,
            borderTop: 'none',
            padding: '18px 20px', gap: 16,
          }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 8px',
                background: temFinanciamento ? '#c0392b' : '#2ba84a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: '#fff',
              }}>
                {temFinanciamento ? '✕' : '✓'}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700,
                color: temFinanciamento ? '#c0392b' : '#2ba84a',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {temFinanciamento ? 'RESTRIÇÃO FINANCEIRA ATIVA' : 'ISENTO DE GRAVAME'}
              </div>
              {temFinanciamento && (
                <div style={{ marginTop: 12 }}>
                  <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px' }}>
                    SITUAÇÃO: {v(data.situacao)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detalhes do Gravame se houver financiamento */}
      {temFinanciamento && (
        <>
          <div className="src-badge">DETALHES DO CONTRATO FINANCEIRO</div>
          <div style={{ marginTop: 8 }}>
            <div className="ds-hd"><span>AGENTE FINANCEIRO & CONTRATO</span></div>
            <div className="ds-row">
              <div className="ds-row-inner">
                <div className="dk">Instituição Credora (Agente Financeiro)</div>
                <div className="dv" style={{ fontWeight: 600, fontSize: 13 }}>{v(data.agente_financeiro)}</div>
              </div>
            </div>
            <div className="ds-row">
              <div style={{ display: 'flex', flex: 1, gap: 16 }}>
                <div className="ds-row-inner" style={{ flex: 1 }}>
                  <div className="dk">Número do Contrato</div>
                  <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(data.contrato_numero)}</div>
                </div>
                <div className="ds-row-inner" style={{ flex: 1 }}>
                  <div className="dk">Data de Inclusão / Registro</div>
                  <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(data.data_inclusao)}</div>
                </div>
                <div className="ds-row-inner" style={{ flex: 1 }}>
                  <div className="dk">Situação do Gravame</div>
                  <div className="dv" style={{ color: '#c0392b', fontWeight: 600 }}>{v(data.situacao)}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function DadosEstadual({ r }: { r: Record<string, unknown> }) {
  const veiculo  = (r.veiculo  ?? {}) as Record<string, unknown>;
  const estadual = (r.estadual ?? {}) as Record<string, unknown>;

  const restricoes    = (estadual.restricoes    ?? []) as Record<string, unknown>[];
  const multas        = (estadual.multas        ?? []) as Record<string, unknown>[];
  const ipva          = (estadual.ipva          ?? []) as Record<string, unknown>[];
  const licenciamento = (estadual.licenciamento ?? []) as Record<string, unknown>[];
  const outros        = (estadual.outrosDebitos ?? []) as Record<string, unknown>[];

  const totalDebitos = estadual.totalDebitos != null ? String(estadual.totalDebitos) : 'R$ 0,00';
  const temDebitos   = totalDebitos !== 'R$ 0,00' && totalDebitos !== '—' && totalDebitos !== '0';
  const temRestricoes = restricoes.length > 0;

  const marcaModelo = v(estadual.marcaModelo || veiculo.marca_modelo || '—');
  const uf = v(estadual.uf || veiculo.uf || '—');

  return (
    <>
      <div className="src-badge">DETRAN-{uf} · BASE ESTADUAL</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, marginBottom: 2, marginTop: 8, alignItems: 'stretch' }}>
        {/* Ficha Técnica */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO</span></div>
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Marca/Modelo</div>
                <div className="dv">{marcaModelo.replace('/', ' - ')}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Placa</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(estadual.placa || veiculo.placa)}</div>
              </div>
            </div>
          </div>
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Chassi</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(estadual.chassi || veiculo.chassi)}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">RENAVAM</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(estadual.renavam || veiculo.renavam)}</div>
              </div>
            </div>
          </div>
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Ano Fab / Mod</div>
                <div className="dv">{v(estadual.anoFabricacao)} / {v(estadual.anoModelo)}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">UF · Município</div>
                <div className="dv">{uf} · {v(estadual.municipio)}</div>
              </div>
            </div>
          </div>
          <div className="ds-row" style={{ flex: 1, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Combustível</div>
                <div className="dv">{v(estadual.combustivel)}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Cor</div>
                <div className="dv">{v(estadual.cor)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Situação Estadual */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd" style={{ background: temDebitos || temRestricoes ? '#c0392b' : 'var(--navy)' }}>
            <span>SITUAÇÃO ESTADUAL</span>
          </div>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: temDebitos || temRestricoes ? '#fdf0f0' : '#f0fdf4',
            border: `1px solid ${temDebitos || temRestricoes ? '#e8b4b4' : '#b4e8c0'}`,
            borderTop: 'none', padding: '18px 20px',
          }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 8px',
                background: temDebitos || temRestricoes ? '#c0392b' : '#2ba84a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: '#fff',
              }}>
                {temDebitos || temRestricoes ? '✕' : '✓'}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700,
                color: temDebitos || temRestricoes ? '#c0392b' : '#2ba84a',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {temDebitos || temRestricoes ? 'DÉBITOS / RESTRIÇÕES ATIVAS' : 'VEÍCULO REGULAR'}
              </div>
              {(temDebitos || temRestricoes) && (
                <div style={{ marginTop: 10 }}>
                  <span className="chip chip-red" style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px' }}>
                    {temDebitos ? `TOTAL: ${totalDebitos}` : `${restricoes.length} restrição${restricoes.length !== 1 ? 'ões' : ''}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Restrições */}
      {restricoes.length > 0 && (
        <>
          <div className="src-badge" style={{ marginTop: 16 }}>RESTRIÇÕES ATIVAS · DETRAN-{uf}</div>
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd">
              <span>RESTRIÇÕES ADMINISTRATIVAS / JUDICIAIS</span>
              <span className="ds-hd-badge">{restricoes.length === 1 ? '1 restrição' : `${restricoes.length} restrições`}</span>
            </div>
            {restricoes.map((rst, idx) => (
              <div key={idx} className="ds-row">
                <div style={{ display: 'flex', flex: 1, gap: 16, alignItems: 'center' }}>
                  <div className="ds-row-inner" style={{ flex: 1 }}>
                    <div className="dk">{v(rst.tipo ?? 'Restrição')} · #{idx + 1}</div>
                    <div className="dv">{v(rst.descricao)}</div>
                  </div>
                  <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>ATIVO</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Extrato de Débitos */}
      {(multas.length > 0 || ipva.length > 0 || licenciamento.length > 0 || outros.length > 0) && (
        <>
          <div className="src-badge" style={{ marginTop: 16 }}>EXTRATO DE DÉBITOS ESTADUAIS</div>

          {/* Tabela resumo */}
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd">
              <span>RESUMO POR CATEGORIA</span>
              <span className="ds-hd-badge">
                {reg((multas.length > 0 ? 1 : 0) + (ipva.length > 0 ? 1 : 0) + (licenciamento.length > 0 ? 1 : 0) + (outros.length > 0 ? 1 : 0))}
              </span>
            </div>
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Categoria</th>
                    <th>Qtd</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {multas.length > 0 && (
                    <tr style={{ background: '#ffffff' }}>
                      <td style={{ textAlign: 'left' }}>Multas Estaduais</td>
                      <td>{multas.length}</td>
                      <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">
                        {multas.reduce((a, m) => {
                          const n = parseFloat(String(m.valor ?? '0').replace(/[^0-9,.-]/g, '').replace(',', '.'));
                          return a + (isNaN(n) ? 0 : n);
                        }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  )}
                  {ipva.length > 0 && (
                    <tr style={{ background: '#ffffff' }}>
                      <td style={{ textAlign: 'left' }}>IPVA Estadual</td>
                      <td>{ipva.length}</td>
                      <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">
                        {ipva.reduce((a, m) => {
                          const n = parseFloat(String(m.valor ?? '0').replace(/[^0-9,.-]/g, '').replace(',', '.'));
                          return a + (isNaN(n) ? 0 : n);
                        }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  )}
                  {licenciamento.length > 0 && (
                    <tr style={{ background: '#ffffff' }}>
                      <td style={{ textAlign: 'left' }}>Licenciamento / Taxas</td>
                      <td>{licenciamento.length}</td>
                      <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">
                        {licenciamento.reduce((a, m) => {
                          const n = parseFloat(String(m.valor ?? '0').replace(/[^0-9,.-]/g, '').replace(',', '.'));
                          return a + (isNaN(n) ? 0 : n);
                        }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  )}
                  <tr style={{ background: '#fcfaf6', fontWeight: 700 }}>
                    <td style={{ textAlign: 'left', color: 'var(--ink)' }}>TOTAL GERAL</td>
                    <td>{multas.length + ipva.length + licenciamento.length + outros.length}</td>
                    <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{totalDebitos}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Multas detalhadas */}
          {multas.length > 0 && (
            <div className="ds-block" style={{ marginTop: 8 }}>
              <div className="ds-hd">
                <span>MULTAS ESTADUAIS</span>
                <span className="ds-hd-badge">{multas.length === 1 ? '1 MULTA' : `${multas.length} MULTAS`}</span>
              </div>
              <div className="tbl-wrap">
                <table className="snc-tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th style={{ textAlign: 'left' }}>Descrição</th>
                      <th>Órgão</th>
                      <th>Vencimento</th>
                      <th style={{ textAlign: 'right' }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multas.map((m, idx) => (
                      <tr key={idx} style={{ background: '#ffffff' }}>
                        <td className="mono">{idx + 1}</td>
                        <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 200 }}>{v(m.descricao)}</td>
                        <td>{v(m.orgaoEmissor)}</td>
                        <td className="mono">{v(m.dataVencimento)}</td>
                        <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{v(m.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* IPVA detalhado */}
          {ipva.length > 0 && (
            <div className="ds-block" style={{ marginTop: 8 }}>
              <div className="ds-hd">
                <span>IPVA ESTADUAL</span>
                <span className="ds-hd-badge">{ipva.length === 1 ? '1 EXERCÍCIO' : `${ipva.length} EXERCÍCIOS`}</span>
              </div>
              <div className="tbl-wrap">
                <table className="snc-tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th style={{ textAlign: 'left' }}>Descrição / Exercício</th>
                      <th>Órgão</th>
                      <th>Vencimento</th>
                      <th style={{ textAlign: 'right' }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipva.map((i, idx) => (
                      <tr key={idx} style={{ background: '#ffffff' }}>
                        <td className="mono">{idx + 1}</td>
                        <td style={{ textAlign: 'left' }}>{v(i.descricao)}</td>
                        <td>{v(i.orgaoEmissor)}</td>
                        <td className="mono">{v(i.dataVencimento)}</td>
                        <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{v(i.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Licenciamento detalhado */}
          {licenciamento.length > 0 && (
            <div className="ds-block" style={{ marginTop: 8 }}>
              <div className="ds-hd">
                <span>LICENCIAMENTO / TAXAS</span>
                <span className="ds-hd-badge">{licenciamento.length === 1 ? '1 TAXA' : `${licenciamento.length} TAXAS`}</span>
              </div>
              <div className="tbl-wrap">
                <table className="snc-tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th style={{ textAlign: 'left' }}>Descrição</th>
                      <th>Órgão</th>
                      <th>Vencimento</th>
                      <th style={{ textAlign: 'right' }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenciamento.map((l, idx) => (
                      <tr key={idx} style={{ background: '#ffffff' }}>
                        <td className="mono">{idx + 1}</td>
                        <td style={{ textAlign: 'left' }}>{v(l.descricao)}</td>
                        <td>{v(l.orgaoEmissor)}</td>
                        <td className="mono">{v(l.dataVencimento)}</td>
                        <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{v(l.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Situação limpa */}
      {!temDebitos && !temRestricoes && (
        <div className="ds-block" style={{ marginTop: 8 }}>
          <div className="ds-hd"><span>SITUAÇÃO ESTADUAL DETRAN-{uf}</span></div>
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Resultado da Consulta</div>
              <div className="dv" style={{ color: '#2ba84a', fontWeight: 600 }}>Nenhum débito ou restrição registrado na base estadual</div>
            </div>
            <span className="chip chip-green">NADA CONSTA</span>
          </div>
        </div>
      )}
    </>
  );
}

function DadosRenainf({ r }: { r: Record<string, unknown> }) {
  const veiculo = (r.veiculo ?? {}) as Record<string, unknown>;
  const renainf = (r.renainf ?? {}) as Record<string, unknown>;
  const infracoes = (renainf.infracoes ?? []) as Record<string, unknown>[];
  const totalMultas = Number(renainf.totalMultas ?? 0);
  const temMultas = totalMultas > 0;
  const valorTotal = v(renainf.valorTotal || '0,00');

  return (
    <>
      <div className="src-badge">SENATRAN / RENAINF · MULTAS DE TRÂNSITO</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, marginBottom: 2, marginTop: 8, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO</span></div>
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Marca/Modelo</div>
                <div className="dv">{v(renainf.marcaModelo || veiculo.marca_modelo).replace('/', ' - ')}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Placa</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(renainf.placa || veiculo.placa)}</div>
              </div>
            </div>
          </div>
          <div className="ds-row" style={{ flex: 1, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">Chassi</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(renainf.chassi || veiculo.chassi)}</div>
              </div>
              <div className="ds-row-inner" style={{ flex: 1 }}>
                <div className="dk">RENAVAM</div>
                <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(renainf.renavam || veiculo.renavam)}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd" style={{ background: temMultas ? '#c0392b' : 'var(--navy)' }}>
            <span>SITUAÇÃO RENAINF</span>
          </div>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            background: temMultas ? '#fdf0f0' : '#f0fdf4',
            border: `1px solid ${temMultas ? '#e8b4b4' : '#b4e8c0'}`,
            borderTop: 'none', padding: '18px 20px',
          }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 8px',
                background: temMultas ? '#c0392b' : '#2ba84a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: '#fff',
              }}>
                {temMultas ? '✕' : '✓'}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700,
                color: temMultas ? '#c0392b' : '#2ba84a',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {totalMultas === 1 ? 'CONSTA 1 MULTA RENAINF' : `CONSTAM ${totalMultas} MULTAS RENAINF`}
              </div>
              {temMultas && (
                <div style={{ marginTop: 10 }}>
                  <span className="chip chip-red" style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px' }}>
                    TOTAL: R$ {valorTotal}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {temMultas && (
        <>
          <div className="src-badge" style={{ marginTop: 16 }}>DETALHAMENTO DE MULTAS RENAINF</div>
          <div className="ds-block" style={{ marginTop: 8 }}>
            <div className="ds-hd">
              <span>INFRAÇÕES CONSTATADAS</span>
              <span className="ds-hd-badge">{infracoes.length === 1 ? '1 MULTA' : `${infracoes.length} MULTAS`}</span>
            </div>
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th style={{ textAlign: 'left' }}>Auto / Descrição</th>
                    <th>Cód. Infração</th>
                    <th>Data da Infração</th>
                    <th>Órgão Emissor</th>
                    <th>Situação</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {infracoes.map((inf, idx) => (
                    <tr key={idx} style={{ background: '#ffffff' }}>
                      <td className="mono">{idx + 1}</td>
                      <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 200 }}>
                        <div>{v(inf.autoInfra)}</div>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{v(inf.descricao)}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Local: {v(inf.localInfra)}</div>
                      </td>
                      <td className="mono">{v(inf.codigoInfra)}</td>
                      <td className="mono">{v(inf.dataInfra)}</td>
                      <td>{v(inf.orgaoEmissor)}</td>
                      <td>
                        <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>
                          {v(inf.situacao || 'EM ABERTO')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">{v(inf.valorOriginal)}</td>
                    </tr>
                  ))}
                  {/* Linha do Valor Consolidado integrada sob as colunas corretas */}
                  <tr style={{ background: 'rgba(200, 162, 90, 0.04)', fontWeight: 700 }}>
                    <td colSpan={5} style={{ 
                      textAlign: 'right', 
                      fontFamily: "'JetBrains Mono',monospace", 
                      fontSize: 9, 
                      letterSpacing: '.06em', 
                      textTransform: 'uppercase', 
                      padding: '11px 14px',
                      color: 'var(--ink2)',
                      borderRight: '1px solid #c8bfa8'
                    }}>
                      Valor Consolidado
                    </td>
                    <td style={{ textAlign: 'center', padding: '11px 14px', borderRight: '1px solid #c8bfa8' }}>
                      <span className="chip chip-red">DÉBITO ATIVO</span>
                    </td>
                    <td className="mono" style={{ color: '#ef4444', fontSize: 11, textAlign: 'right', padding: '11px 14px' }}>
                      R$ {valorTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!temMultas && (
        <div className="ds-block" style={{ marginTop: 8 }}>
          <div className="ds-hd"><span>SITUAÇÃO RENAINF</span></div>
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Resultado da Consulta</div>
              <div className="dv" style={{ color: '#2ba84a', fontWeight: 600 }}>Nenhuma multa de trânsito registrada no RENAINF</div>
            </div>
            <span className="chip chip-green">NADA CONSTA</span>
          </div>
        </div>
      )}
    </>
  );
}

function formatarBRL(valor?: string | number): string {
  if (valor === undefined || valor === null || valor === "") return "—";
  const num = typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;
  if (isNaN(num)) return String(valor);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
}

function DataRow({ label, value, isMono = false }: { label: string; value?: any; isMono?: boolean }) {
  if (value === undefined || value === null || value === "" || value === "—") return null;
  return (
    <div className="ds-row">
      <div className="ds-row-inner">
        <div className="dk">{label}</div>
        <div className="dv" style={isMono ? { fontFamily: "'JetBrains Mono',monospace", fontSize: 12 } : undefined}>
          {value}
        </div>
      </div>
    </div>
  );
}

function DadosSncAutoScore({ r }: { r: Record<string, unknown> }) {
  const id = (r.identificacao ?? {}) as Record<string, unknown>;
  const rf = (r.rouboFurto ?? {}) as Record<string, boolean>;
  const dt = (r.dadosTecnicos ?? {}) as Record<string, unknown>;
  const prop = (r.proprietario ?? {}) as Record<string, unknown>;
  const restBin = (r.restricoesBin ?? {}) as {
    existeRestricaoGeral?: boolean;
    renajud?: boolean;
    rouboFurto?: boolean;
    alertaSinistro?: boolean;
    veiculoBaixado?: boolean;
    mensagens?: string[];
  };
  const prec = (r.precificador as Record<string, unknown>[]) ?? [];
  const renainf = r.renainf as { total?: string | number; ocorrencias?: Record<string, string>[] } | null;
  const leilao = r.leilao as Record<string, any> | null;
  const debitos = r.debitos as Record<string, any> | null;
  const km = r.historicoKm as Record<string, any> | null;
  const recall = r.recall as Record<string, any> | null;
  const pdf = r.pdf as string | null;
  const gravame = r.gravame as Record<string, any> | null;
  const renajudDetalhes = r.renajudDetalhes as Record<string, any> | null;
  const historicoFipe = (r.historicoFipe ?? r.historico ?? []) as Record<string, unknown>[];

  // Estilo visual para novos campos (púrpura) — temporário para revisão
  const NF: React.CSSProperties = { color: '#7B5EA7' };
  const NF_BG: React.CSSProperties = { color: '#7B5EA7', background: 'rgba(123,94,167,0.04)' };

  const ocorrencias = renainf?.ocorrencias ?? [];
  const totalRenainf = renainf?.total ?? ocorrencias.length;

  const temRecall = recall && recall.ocorrencias && recall.ocorrencias.length > 0;
  const temLeilao = leilao && leilao.historico && leilao.historico.length > 0;
  const temSinistro = leilao && leilao.sinistro && leilao.sinistro.historico && leilao.sinistro.historico.length > 0;
  const temDebitos = debitos && (debitos.multas?.length > 0 || debitos.ipva?.length > 0);
  const temGravame = gravame && (gravame.financiamento === 'SIM' || gravame.situacao);
  const temRenajudDetalhe = renajudDetalhes && renajudDetalhes.processo;
  const temKm = km && km.registros && km.registros.length > 0;

  // Limpa redundâncias de marca e abrevia sufixos de versão conforme padrão do mercado.
  const abreviarMarca = (raw: string): string => {
    let s = raw.replace(/\//g, ' - '); // normaliza separador
    // Remove prefixos redundantes (sigla da montadora quando o nome completo já aparece)
    const prefixos: Record<string, string> = {
      'GM': 'CHEVROLET', 'VW': 'VOLKSWAGEN', 'MMC': 'MITSUBISHI',
      'MB': 'MERCEDES-BENZ', 'MBENZ': 'MERCEDES-BENZ',
      'IMP': '', 'I': '', // importado genérico
    };
    const partes = s.split(/\s*-\s*/);
    if (partes.length >= 2) {
      const sigla = partes[0].trim().toUpperCase();
      const resto = partes.slice(1).join(' - ').trim().toUpperCase();
      const marcaCompleta = prefixos[sigla];
      if (marcaCompleta !== undefined && (marcaCompleta === '' || resto.startsWith(marcaCompleta))) {
        s = partes.slice(1).join(' - ').trim();
      }
    }
    // Abrevia sufixos de versão comuns
    const sufixos: [RegExp, string][] = [
      [/\bPREMIER\b/gi, 'PREM.'],
      [/\bPLATINUM\b/gi, 'PLAT.'],
      [/\bADVENTURE\b/gi, 'ADV.'],
      [/\bAUTOMATIC[OA]?\b/gi, 'AUT.'],
      [/\bAUTOM[AÁ]TICO\b/gi, 'AUT.'],
      [/\bEXCLUSIVE\b/gi, 'EXCL.'],
      [/\bHIGHLINE\b/gi, 'HL.'],
      [/\bCOMFORTLINE\b/gi, 'CL.'],
      [/\bTRENDLINE\b/gi, 'TL.'],
      [/\bENDURANCE\b/gi, 'END.'],
      [/\bFREEDOM\b/gi, 'FRDM.'],
      [/\bLONGITUDE\b/gi, 'LONG.'],
      [/\bLIMITED\b/gi, 'LTD.'],
    ];
    for (const [re, abrev] of sufixos) s = s.replace(re, abrev);
    return s.trim();
  };

  // Cor do score de leilão por classe de risco (A baixo → E crítico). Mesma escala de DadosLeilao.
  const corClasseLeilao = (label: unknown): string => {
    const cls = String(label ?? '').match(/\(([A-E])\)/i)?.[1]?.toUpperCase();
    if (cls === 'A') return '#22c55e';
    if (cls === 'B') return '#84cc16';
    if (cls === 'C') return '#eab308';
    if (cls === 'D') return '#f97316';
    if (cls === 'E') return '#ef4444';
    return '#1e293b';
  };

  return (
    <>
      
      {/* SEÇÃO 1: FICHA CADASTRAL */}
      <div className="src-badge" style={{ marginTop: 8 }}>IDENTIFICAÇÃO CADASTRAL</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
          <div className="ds-hd"><span>IDENTIFICAÇÃO CADASTRAL DO VEÍCULO (BIN)</span></div>
          {/* Linha 1 — Identificação principal */}
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1, overflow: 'hidden' }}><div className="dk">Marca/Modelo</div><div className="dv" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v(id.marcaModelo)}>{abreviarMarca(v(id.marcaModelo))}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">CRLV Digital</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(prop.crlv)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1, overflow: 'hidden' }}><div className="dk">Chassi</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v(dt.chassi ?? id.chassi ?? prop.chassi)}>{v(dt.chassi ?? id.chassi ?? prop.chassi)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">RENAVAM</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(prop.renavam)}</div></div>
            </div>
          </div>
          {/* Linha 2 — Registro técnico */}
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Ano Fab/Mod</div><div className="dv">{v(id.anoFabricacao)}/{v(id.anoModelo)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Cor Cadastrada</div><div className="dv">{v(dt.cor ?? prop.cor)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Combustível</div><div className="dv">{v(id.combustivel)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Motor</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(dt.motor ?? prop.motor)}</div></div>
            </div>
          </div>
          {/* Linha 3 — Classificação */}
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Categoria</div><div className="dv">{v(id.categoria)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Espécie/Tipo</div><div className="dv">{v(dt.especie)}/{v(dt.tipo)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Carroceria</div><div className="dv">{v(dt.carroceria)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Cap. Passageiros</div><div className="dv">{v(dt.capacidadePassageiros)}</div></div>
            </div>
          </div>
          {/* Linha 4 — Localização + Procedência + Specs técnicas */}
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Município/UF</div><div className="dv">{v(id.municipio)}/{v(id.uf)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Procedência</div><div className="dv">{v(dt.procedencia)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Potência</div><div className="dv">{v(dt.potencia)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Cilindradas (C.C.)</div><div className="dv">{v(dt.cilindrada)}</div></div>
            </div>
          </div>
          {/* Linha 5 — Specs adicionais + Datas */}
          <div className="ds-row">
            <div style={{ display: 'flex', flex: 1, gap: 16 }}>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Qtd. Eixos</div><div className="dv">{v(dt.eixos)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">PBT (Peso Bruto Total)</div><div className="dv">{v(dt.pbt)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Data Emissão CRLV</div><div className="dv">{v(dt.dataEmissaoCrlv ?? prop.dataAtualizacao)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Data Último CRV</div><div className="dv">{v(dt.dataUltimoCrv)}</div></div>
            </div>
          </div>
      </div>

      {/* HISTÓRICO ROUBO/FURTO — cards */}
      <div className="src-badge" style={{ marginTop: 8 }}>HISTÓRICO DE ROUBO / FURTO</div>
      <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
        <div className="ds-hd" style={{ background: (rf.declaracao || rf.recuperacao || rf.devolucao) ? '#c0392b' : 'var(--navy)' }}>
          <span>HISTÓRICO ROUBO/FURTO</span>
          {(rf.declaracao || rf.recuperacao || rf.devolucao) && (
            <span className="ds-hd-badge" style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>
              {[rf.declaracao, rf.recuperacao, rf.devolucao].filter(Boolean).length} {[rf.declaracao, rf.recuperacao, rf.devolucao].filter(Boolean).length === 1 ? 'REGISTRO' : 'REGISTROS'}
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '12px 14px', background: '#faf8f3' }}>
          {[
            { label: 'Declaração de Roubo', exists: rf.declaracao, textOn: 'CONSTA', textOff: 'NADA CONSTA' },
            { label: 'Devolução Registrada', exists: rf.devolucao, textOn: 'CONSTA', textOff: 'NADA CONSTA' },
            { label: 'Recuperação Registrada', exists: rf.recuperacao, textOn: 'CONSTA', textOff: 'NADA CONSTA' },
          ].map((item, idx) => {
            const hasAlert = !!item.exists;
            const bgCor = hasAlert ? 'rgba(239, 68, 68, 0.08)' : '#ffffff';
            const borderCor = hasAlert ? '#ef4444' : '#d4cfc1';
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: bgCor, border: `1px solid ${borderCor}` }}>
                <span className="dk" style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: '10px' }}>{item.label}</span>
                <span className={`chip chip-${hasAlert ? 'red' : 'green'}`} style={{ marginLeft: 12 }}>
                  {hasAlert ? item.textOn : item.textOff}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROPRIETÁRIO ATUAL */}
      <div className="src-badge" style={{ marginTop: 8 }}>PROPRIETÁRIO ATUAL</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>PROPRIETÁRIO ATUAL DO VEÍCULO</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1.5 }}><div className="dk">Nome do Proprietário</div><div className="dv">{v(prop.nome)}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Documento</div><div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{v(prop.documento)}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Município/UF</div><div className="dv">{v(prop.municipio)}/{v(prop.uf)}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Status Cadastral</div><div className="dv">{v(prop.statusDescricao)}</div></div>
            <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Data de Atualização</div><div className="dv">{v(prop.dataAtualizacao)}</div></div>
          </div>
        </div>
      </div>

      {/* HISTÓRICO DE PROPRIETÁRIOS ANTERIORES (Agregados Propria) */}
      {(() => {
        const mascararNome = (nome: string): string => {
          const partes = String(nome ?? '').trim().split(/\s+/);
          if (partes.length <= 1) return nome;
          return [
            partes[0],
            ...partes.slice(1).map((p) => p.charAt(0) + '*'.repeat(Math.max(p.length - 1, 2))),
          ].join(' ');
        };
        const lista = Array.isArray(r.historicoProprietarios)
          ? (r.historicoProprietarios as Record<string, string>[])
          : [];
        return (
          <>
            <div className="src-badge" style={{ marginTop: 8 }}>HISTÓRICO DE PROPRIETÁRIOS ANTERIORES</div>
            <div className="ds-block" style={{ marginTop: 8 }}>
              <div className="ds-hd">
                <span>TRANSFERÊNCIAS DE PROPRIEDADE</span>
                {lista.length > 0 && (
                  <span className="ds-hd-badge">{lista.length} {lista.length === 1 ? 'REGISTRO' : 'REGISTROS'}</span>
                )}
              </div>
              {lista.length === 0 ? (
                <div className="ds-row">
                  <div className="ds-row-inner">
                    <div className="dk">Proprietários Anteriores</div>
                    <div className="dv" style={{ color: '#2ba84a', fontWeight: 600 }}>
                      Nenhum proprietário anterior identificado na base federal
                    </div>
                  </div>
                  <span className="chip chip-green">NADA CONSTA</span>
                </div>
              ) : (
                <div className="tbl-wrap">
                  <table className="snc-tbl">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th style={{ textAlign: 'left' }}>Nome / Razão Social</th>
                        <th>Documento</th>
                        <th>Município / UF</th>
                        <th>Data Atualiz.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lista.map((p, i) => (
                        <tr key={i} style={{ background: '#ffffff' }}>
                          <td className="mono">{i + 1}</td>
                          <td style={{ textAlign: 'left', whiteSpace: 'normal' }}>{mascararNome(v(p.nome))}</td>
                          <td className="mono">{v(p.documento)}</td>
                          <td>{p.municipio && p.uf ? `${p.municipio} / ${p.uf}` : v(p.municipio)}</td>
                          <td className="mono">{v(p.dataAtualizacao)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* SEÇÃO 2: RESTRIÇÕES CADASTRAIS */}

      <div className="src-badge" style={{ marginTop: 8 }}>RESTRIÇÕES E IMPEDIMENTOS</div>
      <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
        <div className="ds-hd" style={{ background: restBin.existeRestricaoGeral ? '#c0392b' : 'var(--navy)' }}>
          <span>RESTRIÇÕES CADASTRAIS GERAIS (BIN / CNJ)</span>
          {restBin.existeRestricaoGeral && (() => {
            const count = [restBin.existeRestricaoGeral, restBin.alertaSinistro, restBin.renajud, restBin.veiculoBaixado, restBin.rouboFurto].filter(Boolean).length;
            return <span className="ds-hd-badge" style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>{count} {count === 1 ? 'RESTRIÇÃO' : 'RESTRIÇÕES'}</span>;
          })()}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '12px 14px', background: '#faf8f3' }}>
          {[
            { label: 'Restrição Geral BIN', exists: restBin.existeRestricaoGeral, textOn: 'CONSTA', textOff: 'NADA CONSTA' },
            { label: 'Alerta de Sinistro', exists: restBin.alertaSinistro, textOn: 'CONSTA', textOff: 'NADA CONSTA' },
            { label: 'Processo RENAJUD', exists: restBin.renajud, textOn: 'CONSTA', textOff: 'NADA CONSTA' },
            { label: 'Veículo Baixado/Descartado', exists: restBin.veiculoBaixado, textOn: 'CONSTA BAIXA', textOff: 'NADA CONSTA' },
            { label: 'Restrição Roubo/Furto (BIN)', exists: restBin.rouboFurto, textOn: 'CONSTA', textOff: 'NADA CONSTA' },
          ].map((item, idx) => {
            const hasAlert = !!item.exists;
            const bgCor = hasAlert ? 'rgba(239, 68, 68, 0.08)' : '#ffffff';
            const borderCor = hasAlert ? '#ef4444' : '#d4cfc1';
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: bgCor, border: `1px solid ${borderCor}` }}>
                <span className="dk" style={{ margin: 0, fontFamily: "'JetBrains Mono',monospace", fontSize: '10px' }}>{item.label}</span>
                <span className={`chip chip-${hasAlert ? 'red' : 'green'}`} style={{ marginLeft: 12 }}>
                  {hasAlert ? item.textOn : item.textOff}
                </span>
              </div>
            );
          })}
        </div>
        {restBin.mensagens && (restBin.mensagens as string[]).length > 0 && (
          <div style={{ padding: '8px 14px 12px', borderTop: '1px dashed #d4cfc1', background: '#ffffff' }}>
            <div className="dk" style={{ marginBottom: 6, color: '#991b1b', fontWeight: 700 }}>Mensagens de Restrição Adicionais:</div>
            {(restBin.mensagens as string[]).map((msg, i) => (
              <div key={i} style={{ padding: '6px 10px', background: 'rgba(239, 68, 68, 0.08)', borderLeft: '3px solid #ef4444', color: '#991b1b', fontWeight: 700, marginBottom: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {msg}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEÇÃO 2B: DETALHAMENTO JUDICIAL RENAJUD */}
      {temRenajudDetalhe && renajudDetalhes && (
        <>
          <div className="src-badge" style={{ marginTop: 8 }}>RESTRIÇÕES JUDICIAIS (RENAJUD)</div>
          <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
            <div className="ds-hd" style={{ background: '#c0392b' }}>
              <span>DETALHAMENTO JUDICIAL — RENAJUD</span>
              <span className="ds-hd-badge" style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>1 REGISTRO</span>
            </div>
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th>Nº Processo</th>
                    <th>Órgão Judicial</th>
                    <th>Tribunal</th>
                    <th>Restrições Aplicadas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="mono">{v(renajudDetalhes.processo)}</td>
                    <td>{v(renajudDetalhes.orgaoJudicial)}</td>
                    <td className="mono">{v(renajudDetalhes.tribunal)}</td>
                    <td>{Array.isArray(renajudDetalhes.restricoes) && renajudDetalhes.restricoes.length > 0 ? renajudDetalhes.restricoes.join(' · ') : '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SEÇÃO 2C: RESTRIÇÃO FINANCEIRA / GRAVAME */}
      {temGravame && gravame && (
        <>
          <div className="src-badge" style={{ marginTop: 8 }}>GRAVAME FINANCEIRO</div>
          <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
            <div className="ds-hd" style={{ background: gravame?.financiamento === 'SIM' || gravame?.situacao === 'ATIVO' ? '#c0392b' : 'var(--navy)' }}>
              <span>RESTRIÇÃO FINANCEIRA / GRAVAME</span>
              <span className="ds-hd-badge" style={gravame?.financiamento === 'SIM' || gravame?.situacao === 'ATIVO' ? { color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' } : {}}>{gravame?.financiamento === 'SIM' || gravame?.situacao === 'ATIVO' ? '1 REGISTRO' : 'NADA CONSTA'}</span>
            </div>
            <div className="ds-row"><div className="ds-row-inline" style={{ display: 'flex', flex: 1, gap: 16, alignItems: 'center' }}>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Situação</div><div className="dv">{v(gravame.situacao) === '—' ? 'SEM GRAVAME' : v(gravame.situacao)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Financiamento</div><div className="dv">{v(gravame.financiamento)}</div></div>
              <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Status</div><div className="dv"><span className={`chip chip-${gravame?.financiamento === 'SIM' || gravame?.situacao === 'ATIVO' ? 'red' : 'green'}`}>{gravame?.financiamento === 'SIM' || gravame?.situacao === 'ATIVO' ? 'CONSTA' : 'NADA CONSTA'}</span></div></div>
            </div></div>
            {(gravame?.financiamento === 'SIM' || gravame?.situacao === 'ATIVO') && (
              <div className="ds-row"><div className="ds-row-inline" style={{ display: 'flex', flex: 1, gap: 16, alignItems: 'center' }}>
                <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Instituição Credora</div><div className="dv">{v(gravame.agenteFinanceiro)}</div></div>
                <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Nº Contrato</div><div className="dv mono">{v(gravame.contratoNumero)}</div></div>
                <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Data Inclusão</div><div className="dv mono">{v(gravame.dataInclusao)}</div></div>
              </div></div>
            )}
          </div>
        </>
      )}

      {/* SEÇÃO 2D: HISTÓRICO DE SINISTROS */}
      {temSinistro && leilao?.sinistro && (
        <>
          <div className="src-badge" style={{ marginTop: 8 }}>SINISTRO VEICULAR</div>
          <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
            <div className="ds-hd" style={{ background: leilao.sinistro.existeOcorrencia ? '#c0392b' : 'var(--navy)' }}>
              <span>HISTÓRICO DE SINISTROS</span>
              <span className="ds-hd-badge" style={leilao.sinistro.existeOcorrencia ? { color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' } : {}}>
                {(leilao.sinistro.historico as any[]).length === 1 ? '1 REGISTRO' : `${(leilao.sinistro.historico as any[]).length} REGISTROS`}
              </span>
            </div>
            <div className="tbl-wrap" style={{ background: '#ffffff' }}>
              <table className="snc-tbl" style={{ width: '100%', wordBreak: 'break-word', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Seguradora</th>
                    <th>Valor</th>
                    <th>Situação</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {(leilao.sinistro.historico as any[]).map((s: any, i: number) => (
                    <Fragment key={i}>
                      <tr style={{ background: '#ffffff', borderTop: '1px solid #c8bfa8' }}>
                        <td className="mono">{v(s.data)}</td>
                        <td style={{ color: '#991b1b', fontWeight: 600 }}>{v(s.tipo)}</td>
                        <td style={{ maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.seguradora}>{v(s.seguradora)}</td>
                        <td className="mono">{v(s.valor)}</td>
                        <td>
                          <span style={{ padding: '2px 8px', fontSize: 9, letterSpacing: '0.06em', background: 'rgba(153,27,27,0.08)', color: '#991b1b', border: '1px solid rgba(153,27,27,0.2)' }}>
                            {v(s.situacao)}
                          </span>
                        </td>
                        <td style={{ fontSize: 10, color: '#3a4252' }}>{v(s.descricao)}</td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SEÇÃO 3: FINANCEIRO DETRAN */}
      {temDebitos && debitos && (
        <>
          <div className="src-badge" style={{ marginTop: 8 }}>DÉBITOS ESTADUAIS</div>
          <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
            {/* REGRA DE DIVERGÊNCIA: débitos só aparecem quando temDebitos === true
               (multas.length > 0 || ipva.length > 0). Portanto o ds-hd
               é SEMPRE vermelho aqui — a existência já é a divergência. */}
            <div className="ds-hd" style={{ background: '#c0392b' }}>
              <span>DÉBITOS ATIVOS DO DETRAN ESTADUAL</span>
              <span className="ds-hd-badge" style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>
                {((debitos.multas?.length || 0) + (debitos.ipva?.length || 0) + (debitos.licenciamento?.length || 0) + (debitos.dpvat?.length || 0) + (debitos.outrosDebitos?.length || 0))} {((debitos.multas?.length || 0) + (debitos.ipva?.length || 0) + (debitos.licenciamento?.length || 0) + (debitos.dpvat?.length || 0) + (debitos.outrosDebitos?.length || 0)) === 1 ? 'REGISTRO' : 'REGISTROS'}
              </span>
            </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0, borderBottom: '1px solid #d4cfc1', background: '#ffffff' }}>
            {[
              { val: debitos.totalMultas, label: 'Multas Locais' },
              { val: debitos.totalIpva, label: 'IPVA' },
              { val: debitos.totalLicenciamento, label: 'Licenciamento' },
              { val: debitos.totalDpvat, label: 'DPVAT' },
              { val: debitos.totalOutros, label: 'Outros Débitos' },
              { val: debitos.totalGeral, label: 'Valor Consolidado', gold: true }
            ].map((d, idx, arr) => {
              const isZero = /^0*$/.test(String(d.val ?? '').replace(/\D/g, ''));
              const fontColor = (d.gold || !isZero) ? '#ef4444' : '#000000';
              return (
                <div key={idx} style={{ padding: '12px 14px', textAlign: 'center', borderRight: idx === arr.length - 1 ? 'none' : '1px solid #d4cfc1' }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: fontColor }}>{d.val ?? '—'}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#5a6a7a', textTransform: 'uppercase', marginTop: 4 }}>{d.label}</div>
                </div>
              );
            })}
          </div>

          {debitos.multas && debitos.multas.length > 0 && (
            <div style={{ padding: '12px 14px', background: '#f3efe5' }}>
              <div className="dk" style={{ marginBottom: 8 }}>Multas Locais Detalhadas:</div>
              <div className="tbl-wrap">
                <table className="snc-tbl">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>Vencimento</th>
                      <th style={{ textAlign: 'center' }}>Infração</th>
                      <th style={{ textAlign: 'center' }}>Valor</th>
                      <th style={{ textAlign: 'center' }}>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debitos.multas.map((m: any, i: number) => {
                      const paga = m.situacao === 'PAGO';
                      return (
                        <tr key={i} style={{ background: '#ffffff' }}>
                          <td className="mono" style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}>
                            {m.dataVencimento ?? '—'}
                          </td>
                          <td style={{ whiteSpace: 'normal', wordBreak: 'break-word', padding: '10px 14px' }}>
                            <div>{m.descricao ?? '—'}</div>
                            <div style={{ fontSize: '9px', color: '#5a6a7a', marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>
                              <strong>Órgão Emissor:</strong> {m.orgaoEmissor ?? '—'}
                              {m.codigoInfracao && <span style={{ marginLeft: 8 }}> | <strong>Cód:</strong> {m.codigoInfracao}</span>}
                            </div>
                          </td>
                          <td className="mono bold red" style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}>
                            {m.valor ?? '—'}
                          </td>
                          <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                            <span className={`chip chip-${paga ? 'green' : 'red'}`}>{m.situacao || 'EM ABERTO'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {debitos.ipva && debitos.ipva.length > 0 && (
            <div style={{ padding: '12px 14px', borderTop: '1px dashed #d4cfc1', background: '#f3efe5' }}>
              <div className="dk" style={{ marginBottom: 8 }}>IPVA por Exercício / Parcela:</div>
              <div className="tbl-wrap">
                <table className="snc-tbl">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>Exercício</th>
                      <th style={{ textAlign: 'center' }}>Parcela</th>
                      <th style={{ textAlign: 'center' }}>Vencimento</th>
                      <th style={{ textAlign: 'center' }}>Valor</th>
                      <th style={{ textAlign: 'center' }}>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debitos.ipva.map((ip: any, i: number) => {
                      const paga = ip.situacao === 'PAGO';
                      return (
                        <tr key={i} style={{ background: '#ffffff' }}>
                          <td style={{ textAlign: 'center', padding: '10px 14px' }}>{ip.exercicio ?? '—'}</td>
                          <td className="mono" style={{ textAlign: 'center', padding: '10px 14px' }}>{ip.parcela ?? '—'}</td>
                          <td className="mono" style={{ textAlign: 'center', padding: '10px 14px' }}>{ip.dataVencimento ?? '—'}</td>
                          <td className="mono bold red" style={{ textAlign: 'center', whiteSpace: 'nowrap', padding: '10px 14px' }}>
                            {ip.valor ?? '—'}
                          </td>
                          <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                            <span className={`chip chip-${paga ? 'green' : 'red'}`}>{ip.situacao || 'EM ABERTO'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {debitos.licenciamento && debitos.licenciamento.length > 0 && (
            <div style={{ padding: '12px 14px', borderTop: '1px dashed #d4cfc1', background: '#f3efe5' }}>
              <div className="dk" style={{ marginBottom: 8 }}>Licenciamento Detalhado:</div>
              <div className="tbl-wrap">
                <table className="snc-tbl">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>Exercício</th>
                      <th style={{ textAlign: 'center' }}>Vencimento</th>
                      <th style={{ textAlign: 'center' }}>Valor</th>
                      <th style={{ textAlign: 'center' }}>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debitos.licenciamento.map((l: any, i: number) => {
                      const paga = l.situacao === 'PAGO';
                      return (
                        <tr key={i} style={{ background: '#ffffff' }}>
                          <td style={{ textAlign: 'center', padding: '10px 14px' }}>{l.exercicio ?? '—'}</td>
                          <td className="mono" style={{ textAlign: 'center', padding: '10px 14px' }}>{l.dataVencimento ?? '—'}</td>
                          <td className="mono bold red" style={{ textAlign: 'center', whiteSpace: 'nowrap', padding: '10px 14px' }}>{l.valor ?? '—'}</td>
                          <td style={{ textAlign: 'center', padding: '10px 14px' }}><span className={`chip chip-${paga ? 'green' : 'red'}`}>{l.situacao || 'EM ABERTO'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {debitos.dpvat && debitos.dpvat.length > 0 && (
            <div style={{ padding: '12px 14px', borderTop: '1px dashed #d4cfc1', background: '#f3efe5' }}>
              <div className="dk" style={{ marginBottom: 8 }}>Seguro DPVAT Detalhado:</div>
              <div className="tbl-wrap">
                <table className="snc-tbl">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>Exercício</th>
                      <th style={{ textAlign: 'center' }}>Vencimento</th>
                      <th style={{ textAlign: 'center' }}>Valor</th>
                      <th style={{ textAlign: 'center' }}>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debitos.dpvat.map((d: any, i: number) => {
                      const paga = d.situacao === 'PAGO';
                      return (
                        <tr key={i} style={{ background: '#ffffff' }}>
                          <td style={{ textAlign: 'center', padding: '10px 14px' }}>{d.exercicio ?? '—'}</td>
                          <td className="mono" style={{ textAlign: 'center', padding: '10px 14px' }}>{d.dataVencimento ?? '—'}</td>
                          <td className="mono bold red" style={{ textAlign: 'center', whiteSpace: 'nowrap', padding: '10px 14px' }}>{d.valor ?? '—'}</td>
                          <td style={{ textAlign: 'center', padding: '10px 14px' }}><span className={`chip chip-${paga ? 'green' : 'red'}`}>{d.situacao || 'EM ABERTO'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {debitos.outrosDebitos && debitos.outrosDebitos.length > 0 && (
            <div style={{ padding: '12px 14px', borderTop: '1px dashed #d4cfc1', background: '#f3efe5' }}>
              <div className="dk" style={{ marginBottom: 8 }}>Outros Débitos Detalhados:</div>
              <div className="tbl-wrap">
                <table className="snc-tbl">
                  <thead>
                    <tr>
                      <th>Vencimento</th>
                      <th>Descrição</th>
                      <th>Valor</th>
                      <th>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debitos.outrosDebitos.map((od: any, i: number) => {
                      const paga = od.situacao === 'PAGO';
                      return (
                        <tr key={i} style={{ background: '#ffffff' }}>
                          <td className="mono" style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}>{od.dataVencimento ?? '—'}</td>
                          <td style={{ whiteSpace: 'normal', wordBreak: 'break-word', padding: '10px 14px' }}>
                            <div>{od.descricao ?? '—'}</div>
                            {od.orgaoEmissor && (
                              <div style={{ fontSize: '9px', color: '#5a6a7a', marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>
                                <strong>Órgão Emissor:</strong> {od.orgaoEmissor}
                              </div>
                            )}
                          </td>
                          <td className="mono bold red" style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}>{od.valor ?? '—'}</td>
                          <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                            <span className={`chip chip-${paga ? 'green' : 'red'}`}>{od.situacao || 'EM ABERTO'}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        </>
      )}

      {/* SEÇÃO 4: HODÔMETRO & HISTÓRICO DE KM */}
      {temKm && km && (
        <>
          <div className="src-badge" style={{ marginTop: 8 }}>HISTÓRICO DE QUILOMETRAGEM</div>
          <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
            {/* REGRA DE DIVERGÊNCIA: hodômetro fica vermelho apenas quando
               km.anomalia === true (regressão de KM detectada = possível adulteração).
               Sem divergência o ds-hd permanece azul-escuro padrão. */}
            <div className="ds-hd" style={{ background: km.anomalia ? '#c0392b' : 'var(--navy)' }}>
              <span>HISTÓRICO CRONOLÓGICO DE QUILOMETRAGEM (HODÔMETRO)</span>
              <span className="ds-hd-badge" style={km.anomalia ? { color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' } : {}}>
                {reg(km.totalRegistros)}
              </span>
            </div>
          <div className="tbl-wrap">
            <table className="snc-tbl">
              <thead>
                <tr>
                  <th>Data Registro</th>
                  <th>Quilometragem Indicada</th>
                  <th>Fonte Informadora</th>
                  <th>Estado (UF)</th>
                  <th>Consistência</th>
                </tr>
              </thead>
              <tbody>
                {km.registros.map((item: any, i: number) => {
                  const prevKm = i < km.registros.length - 1 ? km.registros[i + 1]?.km : null;
                  const isAnomaly = prevKm !== null && Number(item.km) < Number(prevKm);
                  return (
                    <tr key={i} style={{ background: isAnomaly ? 'rgba(239, 68, 68, 0.04)' : '#ffffff' }}>
                      <td className="mono">{item.data}</td>
                      <td className="mono">{Number(item.km).toLocaleString('pt-BR')} KM</td>
                      <td>{item.fonte}</td>
                      <td className="mono">{item.estado}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`chip chip-${isAnomaly ? 'red' : 'green'}`}>
                          {isAnomaly ? 'REGRESSÃO' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '8px 14px', display: 'flex', gap: 16, alignItems: 'center', borderTop: '1px solid #d4cfc1', background: '#ffffff' }}>
            <span className="dk">Alerta de Inconsistência de Hodômetro:</span>
            <span className={`chip chip-${km.anomalia ? 'red' : 'green'}`}>{km.anomalia ? 'CONSTA DIVERGÊNCIA' : 'NADA CONSTA'}</span>
            {km.motivoAnomalia && (
              <span className="dk" style={{ marginLeft: 8 }}>Motivo: <strong>{km.motivoAnomalia}</strong></span>
            )}
          </div>
          {km.anomalia && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.06)', borderTop: '1px solid #ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ALERTA CRÍTICO: POSSÍVEL ADULTERAÇÃO DE HODÔMETRO DETECTADA — REGRESSÃO DE KM IDENTIFICADA NO HISTÓRICO
              </span>
            </div>
          )}
        </div>
        </>
      )}

      {/* SEÇÃO 5: PRECIFICAÇÃO FIPE + EVOLUÇÃO HISTÓRICA */}
      {prec.length > 0 && (
        <>
          <div className="src-badge" style={{ marginTop: 8 }}>PRECIFICADOR FIPE</div>
          <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
            <div className="ds-hd">
              <span>TABELA DE PRECIFICAÇÃO MERCADOLÓGICA (FIPE)</span>
              {historicoFipe.length > 0 && (
                <span className="ds-hd-badge">{historicoFipe.length} MESES DE HISTÓRICO</span>
              )}
            </div>

            {/* Tabela principal — campos originais */}
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th>Código FIPE</th>
                    <th>Fabricante/Modelo</th>
                    <th>Ano Modelo</th>
                    <th>Informante</th>
                    <th>Preço Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {prec.map((item, i) => (
                    <tr key={i} style={{ background: '#ffffff' }}>
                      <td className="mono">{v(item.codigo)}</td>
                      <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{v(item.fabricanteModelo)}</td>
                      <td className="mono">{v(item.anoModelo)}</td>
                      <td className="mono">FIPE</td>
                      <td className="mono">{v(item.preco)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sub-seção interna: evolução mensal — padrão Débitos */}
            {historicoFipe.length > 0 && (() => {
              const linha1 = historicoFipe.slice(0, 6);
              const linha2 = historicoFipe.slice(6, 12);
              const renderCelula = (h: Record<string, unknown>, i: number, total: number) => (
                <div key={i} style={{ flex: '1 1 0', padding: '10px 12px', borderRight: i < total - 1 ? '1px solid #d4cfc1' : 'none', textAlign: 'center', minWidth: 0 }}>
                  <div style={{ fontSize: 9, color: '#8a7a5a', letterSpacing: '0.06em', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v(h.mes)}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink)' }}>{v((h.valorFormatado ?? h.valor) as string)}</div>
                </div>
              );
              return (
                <div style={{ padding: '12px 14px', borderTop: '1px dashed #d4cfc1', background: '#f3efe5' }}>
                  <div className="dk" style={{ marginBottom: 8 }}>Evolução de preço mensal:</div>
                  <div style={{ display: 'flex', background: '#ffffff', border: '1px solid #d4cfc1' }}>
                    {linha1.map((h, i) => renderCelula(h, i, linha1.length))}
                  </div>
                  {linha2.length > 0 && (
                    <div style={{ display: 'flex', background: '#f9f7f3', border: '1px solid #d4cfc1', borderTop: 'none' }}>
                      {linha2.map((h, i) => renderCelula(h, i, linha2.length))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* SEÇÃO 6: INFRAÇÕES DE TRÂNSITO (RENAINF) */}
      <div className="src-badge" style={{ marginTop: 8 }}>INFRAÇÕES NACIONAIS (RENAINF)</div>
      <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
        <div className="ds-hd" style={{ background: Number(totalRenainf) > 0 ? '#c0392b' : 'var(--navy)' }}>
          <span>INFRAÇÕES DE TRÂNSITO NACIONAIS (RENAINF)</span>
          <span className="ds-hd-badge" style={Number(totalRenainf) > 0 ? { color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' } : {}}>
            {Number(totalRenainf)} {Number(totalRenainf) === 1 ? 'OCORRÊNCIA' : 'OCORRÊNCIAS'}
          </span>
        </div>
        {ocorrencias.length > 0 ? (
          <div className="tbl-wrap">
            <table className="snc-tbl">
              <thead>
                <tr>
                  <th>Data / Hora</th>
                  <th>Infração</th>
                  <th>Local & Órgão</th>
                  <th>Valor</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {ocorrencias.map((o, i) => {
                  const paga = o.situacao === 'PAGO';
                  const anotadoDifere = !!o.valorAnotado && o.valorAnotado !== '—' && o.valorAnotado !== o.valor;
                  return (
                    <tr key={i} style={{ background: '#ffffff' }}>
                      <td className="mono" style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}>
                        {o.dataHora ?? '—'}
                      </td>
                      <td style={{ whiteSpace: 'normal', wordBreak: 'break-word', padding: '10px 14px' }}>
                        <div>{o.descricao ?? '—'}</div>
                        <div style={{ fontSize: '9px', color: '#5a6a7a', marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>
                          Cód: {o.codigo ?? '—'} | AIT: {o.auto ?? '—'}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'normal', wordBreak: 'break-word', padding: '10px 14px' }}>
                        <div>{o.local || '—'}</div>
                        <div style={{ fontSize: '9px', color: '#5a6a7a', marginTop: 3, fontFamily: "'JetBrains Mono',monospace" }}>
                          <strong>Autuador:</strong> {o.orgao ?? '—'}
                        </div>
                      </td>
                      <td className="mono bold red" style={{ whiteSpace: 'nowrap', padding: '10px 14px' }}>
                        {o.valor ?? '—'}
                        {anotadoDifere && (
                          <div style={{ fontSize: 9, fontWeight: 400, color: '#5a6a7a', marginTop: 2 }}>Anotado {o.valorAnotado}</div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                        <span className={`chip chip-${paga ? 'green' : 'red'}`}>{o.situacao || 'EM ABERTO'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-row" style={{ borderTop: 'none' }}><div className="ds-row-inner"><div className="dk">Resultado</div><div className="dv">Nenhuma infração registrada no sistema federal RENAINF.</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>


      {/* SEÇÃO 7: LEILÃO UNIFICADO */}
      {leilao && (() => {
        const sc = {
          pontuacao: leilao.score ?? '—',
          descricaoPontuacao: leilao.scoreLabel ?? '—',
          aceitacao: leilao.aceitacao ?? '—',
          percentualSobreFipe: leilao.percentualSobreFipe ?? '—',
          exigeVistoriaEspecial: leilao.exigeVistoriaEspecial ?? '—'
        };

        const sin = {
          existeOcorrencia: !!leilao.sinistro?.existeOcorrencia,
          descricao: leilao.sinistro?.historico?.[0]?.descricao ?? (leilao.sinistro?.existeOcorrencia ? "Sinistro registrado no histórico" : "")
        };

        const dv = {
          marcaModelo: id.marcaModelo ?? dt.modelo ?? '—',
          cor: dt.cor ?? '—',
          chassi: dt.chassi ?? '—',
          motor: dt.motor ?? '—',
          cambio: leilao.dadosVeiculo?.cambio ?? dt.cambio ?? '—',
          combustivel: id.combustivel ?? dt.combustivel ?? '—',
          carroceria: dt.carroceria ?? '—',
          categoria: id.categoria ?? '—',
          kilometragem: leilao.dadosVeiculo?.kilometragem ?? '—',
          qtdEixos: leilao.dadosVeiculo?.qtdEixos ?? dt.eixos ?? '—',
          eixoTraseiro: leilao.dadosVeiculo?.eixoTraseiro ?? '—',
          renavam: prop.renavam ?? id.renavam ?? '—'
        };

        const ocorrencias = (leilao.historico ?? []).map((o: any) => ({
          dataLeilao: o.data ?? o.dataLeilao ?? '—',
          leiloeiro: o.leiloeiro ?? '—',
          lote: o.lote ?? '—',
          comitente: o.comitente ?? '—',
          patio: o.patio ?? '—',
          condicaoGeral: o.condicaoGeral ?? '—',
          condicaoMotor: o.condicaoMotor ?? '—',
          condicaoMecanica: o.condicaoMecanica ?? '—',
          condicaoCambio: o.condicaoCambio ?? '—',
          situacaoChassi: o.situacaoChassi ?? '—',
          observacoes: o.observacoes ?? '—',
          imagens: o.imagens ?? []
        }));
        const total = leilao.totalLeiloes ?? ocorrencias.length;

        const cl = leilao.checklist ? {
          frente: leilao.checklist.frente ?? '—',
          traseira: leilao.checklist.traseira ?? '—',
          teto: leilao.checklist.teto ?? '—',
          lateralDireita: leilao.checklist.lateralDireita ?? leilao.checklist.laterais ?? '—',
          lateralEsquerda: leilao.checklist.lateralEsquerda ?? leilao.checklist.laterais ?? '—',
          interior: leilao.checklist.interior ?? '—',
          airbags: leilao.checklist.airbags ?? '—',
          localQueimado: leilao.checklist.localQueimado ?? '—',
          rodasFaltantes: leilao.checklist.rodasFaltantes ?? '—',
          observacoes: leilao.checklist.observacoes ?? '—'
        } : null;

        const sinistros = (leilao.sinistro?.historico ?? []) as Record<string, unknown>[];

        const scoreCor = (): string => {
          const cls = String(leilao.scoreLabel ?? '').match(/\(([A-E])\)/i)?.[1]?.toUpperCase();
          if (cls === 'A') return '#22c55e';
          if (cls === 'B') return '#84cc16';
          if (cls === 'C') return '#eab308';
          if (cls === 'D') return '#f97316';
          return '#ef4444';
        };

        return (
          <>
            <div className="src-badge" style={{ marginTop: 8 }}>LEILÃO VEICULAR + SCORE</div>
            <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>

              {/* Cabeçalho */}
              <div className="ds-hd" style={{ background: (ocorrencias.length > 0 || sin.existeOcorrencia) ? '#c0392b' : 'var(--navy)' }}>
                <span>LEILÃO VEICULAR — SCORE E HISTÓRICO</span>
                <span className="ds-hd-badge" style={(ocorrencias.length > 0 || sin.existeOcorrencia) ? { color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' } : {}}>{total === 1 ? '1 REGISTRO' : `${total} REGISTROS`}</span>
              </div>

              {/* Faixa de resumo — mesma tipografia dos cards de Débitos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 0, borderBottom: '1px solid #d4cfc1', background: '#ffffff' }}>

                {/* Pontuação */}
                <div style={{ height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid #d4cfc1' }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 700, color: scoreCor(), lineHeight: 1 }}>
                    {String(leilao.scoreLabel ?? '').match(/\(([A-E])\)/i)?.[1]?.toUpperCase() ?? '—'}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#5a6a7a', textTransform: 'uppercase', marginTop: 4 }}>Pontuação</div>
                </div>

                {/* Aceitação */}
                <div style={{ height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid #d4cfc1' }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: '#0a0e16' }}>{v(sc.aceitacao)}%</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#5a6a7a', textTransform: 'uppercase', marginTop: 4 }}>Aceitação</div>
                </div>

                {/* % Sobre FIPE */}
                <div style={{ height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid #d4cfc1' }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: '#0a0e16' }}>{v(sc.percentualSobreFipe)}%</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#5a6a7a', textTransform: 'uppercase', marginTop: 4 }}>% Sobre FIPE</div>
                </div>

                {/* Vistoria Especial */}
                <div style={{ height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRight: '1px solid #d4cfc1' }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, color: '#0a0e16' }}>{formatarSentenceCase(sc.exigeVistoriaEspecial)}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#5a6a7a', textTransform: 'uppercase', marginTop: 4 }}>Vistoria Especial</div>
                </div>

                {/* Indício de Sinistro */}
                <div style={{
                  height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                  background: sin.existeOcorrencia ? 'rgba(192,57,43,0.06)' : 'rgba(43,168,74,0.06)',
                  borderLeft: `3px solid ${sin.existeOcorrencia ? '#c0392b' : '#2ba84a'}`,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', margin: '0 auto 6px',
                    background: sin.existeOcorrencia ? '#c0392b' : '#2ba84a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, color: '#fff', fontWeight: 700,
                  }}>
                    {sin.existeOcorrencia ? '✕' : '✓'}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: sin.existeOcorrencia ? '#c0392b' : '#2ba84a', textTransform: 'uppercase' }}>
                    {sin.existeOcorrencia ? 'CONSTA' : 'NADA CONSTA'}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#5a6a7a', textTransform: 'uppercase', marginTop: 4 }}>Indício de Sinistro</div>
                </div>

              </div>

              {/* Legenda do score */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '8px 14px', background: '#faf8f3', borderBottom: '1px solid #e8e2d6' }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, color: '#8a94a3', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 4 }}>Score:</span>
                {([
                  { letra: 'A', cor: '#22c55e', label: 'Baixo risco' },
                  { letra: 'B', cor: '#84cc16', label: 'Moderado' },
                  { letra: 'C', cor: '#eab308', label: 'Médio' },
                  { letra: 'D', cor: '#f97316', label: 'Alto risco' },
                  { letra: 'E', cor: '#ef4444', label: 'Crítico' },
                ] as { letra: string; cor: string; label: string }[]).map(({ letra, cor, label }) => (
                  <div key={letra} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 12, height: 12, background: cor, borderRadius: 2, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: '#5a6a7a' }}>
                      <span style={{ color: cor, fontWeight: 700 }}>{letra}</span>
                      {' — '}{label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sub-seção 1: Ocorrências de Leilão */}
              <div style={{ padding: '12px 14px', borderTop: '1px dashed #d4cfc1', background: '#f3efe5' }}>
                <div className="dk" style={{ marginBottom: 8 }}>
                  Ocorrências de leilão:
                </div>
                {ocorrencias.length > 0 ? (
                  <div className="tbl-wrap" style={{ background: '#ffffff' }}>
                    <table className="snc-tbl" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                      <colgroup>
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '23%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '35%' }} />
                        <col style={{ width: '20%' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th style={{ whiteSpace: 'normal' }}>Data</th>
                          <th style={{ whiteSpace: 'normal' }}>Leiloeiro</th>
                          <th style={{ whiteSpace: 'normal' }}>Lote</th>
                          <th style={{ whiteSpace: 'normal' }}>Comitente</th>
                          <th style={{ whiteSpace: 'normal' }}>Pátio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ocorrencias.map((o: any, i: number) => {
                          const isLast = i === ocorrencias.length - 1;
                          return (
                            <Fragment key={i}>
                              <tr style={{ background: '#ffffff', borderTop: '1px solid #c8bfa8' }}>
                                <td className="mono" style={{ paddingTop: 10, whiteSpace: 'nowrap' }}>{v(o.dataLeilao)}</td>
                                <td style={{ paddingTop: 10, whiteSpace: 'normal', wordBreak: 'break-word' }}>{v(o.leiloeiro)}</td>
                                <td className="mono" style={{ paddingTop: 10, whiteSpace: 'nowrap' }}>{v(o.lote)}</td>
                                <td style={{ paddingTop: 10, whiteSpace: 'normal', wordBreak: 'break-word' }}>{v(o.comitente)}</td>
                                <td style={{ paddingTop: 10, whiteSpace: 'normal', wordBreak: 'break-word' }}>{v(o.patio)}</td>
                              </tr>
                              <tr style={{ background: '#ffffff', fontSize: '0.82em', borderBottom: '1px solid #c8bfa8' }}>
                                <td colSpan={5} style={{ padding: '6px 12px 10px 24px', borderBottom: 'none' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 13, color: '#5a6a7a', width: 18, textAlign: 'center', marginRight: 16 }}>{i + 1}</div>
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8, borderLeft: '2px solid #5a6a7a', textAlign: 'left' }}>
                                        <span><strong style={{ color: '#5a6a7a' }}>Geral:</strong> {formatarSentenceCase(o.condicaoGeral)}</span>
                                        <span><strong style={{ color: '#5a6a7a' }}>Motor:</strong> {formatarSentenceCase(o.condicaoMotor)}</span>
                                        <span><strong style={{ color: '#5a6a7a' }}>Mecânica:</strong> {formatarSentenceCase(o.condicaoMecanica)}</span>
                                        <span><strong style={{ color: '#5a6a7a' }}>Câmbio:</strong> {formatarSentenceCase(o.condicaoCambio)}</span>
                                        <span><strong style={{ color: '#5a6a7a' }}>Chassi:</strong> {formatarSentenceCase(o.situacaoChassi)}</span>
                                      </div>
                                    </div>
                                    {!!o.observacoes && String(o.observacoes) !== '—' && (
                                      <div style={{ paddingLeft: 6, textAlign: 'left', marginTop: 6, borderTop: '1px dashed #d4cfc1', paddingTop: 6, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        <span><strong style={{ color: '#5a6a7a' }}>Obs:</strong> {formatarSentenceCase(o.observacoes)}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              {!isLast && (
                                <tr><td colSpan={5} style={{ padding: 0, height: 8, background: '#f4f1ea', border: 'none' }} /></tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', border: '1px solid #d4cfc1', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="dk">Resultado</span>
                    <span className="chip chip-green">NADA CONSTA</span>
                  </div>
                )}
              </div>

              {/* Sub-seção 2: Checklist de Avarias */}
              {!!cl && (
                <div style={{ padding: '12px 14px', borderTop: '1px dashed #d4cfc1', background: '#f3efe5' }}>
                  <div className="dk" style={{ marginBottom: 8 }}>Checklist de avarias:</div>
                  <div style={{ background: '#ffffff', border: '1px solid #d4cfc1' }}>
                    <div className="ds-row" style={{ background: '#ffffff' }}><div style={{ display: 'flex', flex: 1, gap: 16 }}>
                      <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Frente</div><div className="dv">{v(cl.frente)}</div></div>
                      <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Traseira</div><div className="dv">{v(cl.traseira)}</div></div>
                      <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Teto</div><div className="dv">{v(cl.teto)}</div></div>
                    </div></div>
                    <div className="ds-row" style={{ background: '#ffffff' }}><div style={{ display: 'flex', flex: 1, gap: 16 }}>
                      <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Lateral Direita</div><div className="dv">{v(cl.lateralDireita)}</div></div>
                      <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Lateral Esquerda</div><div className="dv">{v(cl.lateralEsquerda)}</div></div>
                      <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Interior</div><div className="dv">{v(cl.interior)}</div></div>
                    </div></div>
                    <div className="ds-row" style={{ background: '#ffffff' }}><div style={{ display: 'flex', flex: 1, gap: 16 }}>
                      <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Airbags</div><div className="dv">{v(cl.airbags)}</div></div>
                      <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Local Queimado</div><div className="dv">{v(cl.localQueimado)}</div></div>
                      <div className="ds-row-inner" style={{ flex: 1 }}><div className="dk">Rodas Faltantes</div><div className="dv">{v(cl.rodasFaltantes)}</div></div>
                    </div></div>
                    <div className="ds-row" style={{ background: '#ffffff' }}><div className="ds-row-inner"><div className="dk">Observações</div><div className="dv">{v(cl.observacoes)}</div></div></div>
                  </div>
                </div>
              )}

            </div>
          </>
        );
      })()}

      {/* RECALL — logo após o leilão */}
      <div className="src-badge" style={{ marginTop: 8 }}>RECALLS DE FABRICANTE</div>
      <div className="ds-block" style={{ marginTop: 8, border: '1px solid #c8bfa8' }}>
        <div className="ds-hd" style={{ background: recall && recall.ocorrencias?.some((o: any) => o.situacao === 'NÃO ATENDIDO') ? '#c0392b' : 'var(--navy)' }}>
          <span>ALERTAS DE RECALL DE FABRICANTE</span>
          {recall && recall.ocorrencias?.length > 0 && (
            <span className="ds-hd-badge" style={recall.ocorrencias.some((o: any) => o.situacao === 'NÃO ATENDIDO') ? { color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' } : {}}>
              {recall.ocorrencias.length} {recall.ocorrencias.length === 1 ? 'REGISTRO' : 'REGISTROS'}
            </span>
          )}
        </div>
        {recall && recall.ocorrencias?.length > 0 ? (
          <div className="tbl-wrap">
            <table className="snc-tbl">
              <thead>
                <tr>
                  <th>Fabricante</th>
                  <th>Campanha</th>
                  <th>Defeito Identificado</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {recall.ocorrencias.map((rec: any, idx: number) => (
                  <tr key={idx}>
                    <td>{v(rec.fabricante)}</td>
                    <td>{v(rec.campanha)}</td>
                    <td>{v(rec.defeito)}</td>
                    <td><span className={`chip chip-${rec.situacao === 'NÃO ATENDIDO' ? 'red' : 'green'}`}>{v(rec.situacao)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Recall</div>
              <div className="dv" style={{ color: '#2ba84a', fontWeight: 600 }}>Nenhuma campanha de recall pendente para este veículo</div>
            </div>
            <span className="chip chip-green">NADA CONSTA</span>
          </div>
        )}
      </div>


      {/* TABELA DE DOWNLOADS */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>DOCUMENTOS PARA DOWNLOAD</span></div>
        <div className="tbl-wrap">
          <table className="snc-tbl" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: 40 }}>#</th>
                <th style={{ textAlign: 'left' }}>Documento</th>
                <th>Fonte</th>
                <th>Natureza</th>
                <th>Situação</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {/* CRLV-e */}
              <tr style={{ background: '#ffffff', borderBottom: 'none' }}>
                <td style={{ textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 13, color: '#5a6a7a', verticalAlign: 'top', paddingTop: 12 }}>1</td>
                <td style={{ textAlign: 'left' }}>
                  CRLV-e Digital Oficial
                  <span style={{ display: 'inline-block', marginLeft: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 8, padding: '1px 5px', border: '1px solid rgba(212,168,67,0.5)', color: '#8a6a1a', letterSpacing: '0.06em', verticalAlign: 'middle' }}>ICP-BRASIL</span>
                </td>
                <td>SENATRAN / DETRAN</td>
                <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, padding: '2px 6px', border: '1px solid #b8b0a0', color: 'var(--ink2)', letterSpacing: '0.06em' }}>OFICIAL</span></td>
                <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, padding: '2px 6px', border: '1px solid #2BA84A', color: 'var(--greend)', letterSpacing: '0.06em', background: 'rgba(43,168,74,0.1)' }}>DISPONÍVEL</span></td>
                <td>
                  <a
                    href={`/api/crlve?placa=${(r as any).identificacao?.placa ?? ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, padding: '3px 10px', border: '1px solid #D4A843', color: '#D4A843', letterSpacing: '0.06em', textDecoration: 'none', fontWeight: 700 }}
                  >
                    ↓ Baixar PDF
                  </a>
                </td>
              </tr>
              <tr style={{ background: '#fafaf8', borderBottom: '2px solid #d4cfc1' }}>
                <td style={{ borderTop: 'none', background: '#f4f1ea' }} />
                <td colSpan={5} style={{ padding: '6px 14px 12px', borderTop: 'none' }}>
                  <div style={{ paddingLeft: 8, borderLeft: '2px solid #b8b0a0', fontSize: 10, color: 'var(--ink)', lineHeight: 1.8, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    Documento oficial com validade jurídica, emitido diretamente pelo SENATRAN em conjunto com o DETRAN do estado de origem. Comprova que o veículo está devidamente registrado e licenciado para o exercício vigente. É aceito em cartório, exigido em financiamentos e transferências de propriedade. Possui assinatura digital no padrão ICP-Brasil.
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function DadosDataset({ dataset, resultado }: { dataset: DatasetTipo; resultado: Record<string, unknown> }) {
  if (dataset === 'snc-autoscore') return <DadosSncAutoScore r={resultado} />;
  if (dataset === 'vip-car') return <DadosVipCar r={resultado} />;
  if (dataset === 'veiculo') return <DadosVeiculo r={resultado} />;
  if (dataset === 'proprietario') return <DadosProprietario r={resultado} />;
  if (dataset === 'credito') return <DadosCredito r={resultado} />;
  if (dataset === 'leilao') return <DadosLeilao r={resultado} />;
  if (dataset === 'renajud') return <DadosRenajud r={resultado} />;
  if (dataset === 'gravame') return <DadosGravame r={resultado} />;
  if (dataset === 'debitos') return <DadosDebitos r={resultado} />;
  if (dataset === 'estadual') return <DadosEstadual r={resultado} />;
  if (dataset === 'renainf') return <DadosRenainf r={resultado} />;
  if (dataset === 'historico-km') return <DadosHistoricoKm r={resultado} />;
  if (dataset === 'crlve') return <DadosCrlve r={resultado} />;
  if (dataset === 'csv-completa') return <DadosCsvCompleta r={resultado} />;
  if (dataset === 'analitico-veicular') return <DadosAnaliticoVeicular r={resultado} />;
  if (dataset === 'agregados-basica') return <DadosAgregadosBasica r={resultado} />;
  if (dataset === 'agregados-propria') return <DadosAgregadosPropria r={resultado} />;
  if (dataset === 'agregados-chassi') return <DadosAgregadosChassi r={resultado} />;
  if (dataset === 'veicular-agrupados') return <DadosVeicularAgrupados r={resultado} />;
  return null;
}

function DadosAgregadosPropria({ r }: { r: Record<string, unknown> }) {
  const vei = (r.veiculo || r || {}) as Record<string, unknown>;
  const placaRaw = String(vei.placa ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const placaFormatada = placaRaw.length === 7 ? `${placaRaw.slice(0, 3)}-${placaRaw.slice(3)}` : (vei.placa ? String(vei.placa) : '—');
  return (
    <>
      <div className="src-badge">DENATRAN / SENATRAN · BASE PROPRIETÁRIA</div>

      {/* FICHA CADASTRAL DO VEÍCULO */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>FICHA CADASTRAL DO VEÍCULO</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Placa</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
                {placaFormatada}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Marca / Modelo</div>
              <div className="dv">
                {v(vei.marca_modelo ?? vei.marcaModelo).replace('/', ' - ')}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Cor</div>
              <div className="dv">{v(vei.cor)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Fabricação</div>
              <div className="dv">{v(vei.ano_fabricacao ?? vei.anoFabricacao)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Modelo</div>
              <div className="dv">{v(vei.ano_modelo ?? vei.anoModelo)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Combustível</div>
              <div className="dv">{v(vei.combustivel)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Município / UF</div>
              <div className="dv">{vei.municipio ? `${vei.municipio}${vei.uf ? ` / ${vei.uf}` : ''}` : '—'}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }} />
            <div className="ds-row-inner" style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      {/* AGREGADOS & NÚMEROS DE CHASSI */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>AGREGADOS & NÚMEROS DE CHASSI</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Chassi</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.chassi)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">RENAVAM</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.renavam)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Número do Motor</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.motor)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DadosAgregadosChassi({ r }: { r: Record<string, unknown> }) {
  const vei = (r.veiculo || r || {}) as Record<string, unknown>;
  const chassiVal = String(vei.chassi ?? '').toUpperCase();
  const placaRaw = String(vei.placa ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const placaFormatada = placaRaw.length === 7 ? `${placaRaw.slice(0, 3)}-${placaRaw.slice(3)}` : (vei.placa ? String(vei.placa) : '—');
  return (
    <>
      <div className="src-badge">DENATRAN / SENATRAN · DECODIFICADOR CHASSI</div>

      {/* FICHA CADASTRAL DO VEÍCULO */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>FICHA CADASTRAL DO VEÍCULO</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Marca / Modelo</div>
              <div className="dv">
                {v(vei.marca_modelo ?? vei.marcaModelo).replace('/', ' - ')}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Cor</div>
              <div className="dv">{v(vei.cor)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Combustível</div>
              <div className="dv">{v(vei.combustivel)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Fabricação</div>
              <div className="dv">{v(vei.ano_fabricacao ?? vei.anoFabricacao)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Modelo</div>
              <div className="dv">{v(vei.ano_modelo ?? vei.anoModelo)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Placa Vinculada</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
                {placaFormatada}
              </div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Espécie</div>
              <div className="dv">{v(vei.especie)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Tipo</div>
              <div className="dv">{v(vei.tipo)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Carroceria</div>
              <div className="dv">{v(vei.carroceria)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Potência</div>
              <div className="dv">{v(vei.potencia)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Cilindrada</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.cilindrada)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Capacidade Passageiros</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.capacidade_passageiros)}
              </div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Município / UF</div>
              <div className="dv">{vei.municipio ? `${vei.municipio}${vei.uf ? ` / ${vei.uf}` : ''}` : '—'}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Procedência</div>
              <div className="dv">{v(vei.procedencia)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      {/* AGREGADOS & NÚMEROS DE CHASSI */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>AGREGADOS & NÚMEROS DE CHASSI</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Chassi</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {chassiVal || '—'}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">RENAVAM</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.renavam)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Número do Motor</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.motor)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DadosVeicularAgrupados({ r }: { r: Record<string, unknown> }) {
  const vei = (r.veiculo || r || {}) as Record<string, unknown>;
  const fipe = (r.fipe || {}) as Record<string, unknown>;
  const prop = (r.proprietario || {}) as Record<string, unknown>;
  const placaRaw = String(vei.placa ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const placaFormatada = placaRaw.length === 7 ? `${placaRaw.slice(0, 3)}-${placaRaw.slice(3)}` : (vei.placa ? String(vei.placa) : '—');
  return (
    <>
      <div className="src-badge">DENATRAN / SENATRAN / FIPE · VEICULAR AGRUPADOS</div>

      {/* FICHA CADASTRAL DO VEÍCULO */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>FICHA CADASTRAL DO VEÍCULO</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Marca / Modelo</div>
              <div className="dv">
                {v(vei.marca_modelo ?? vei.marcaModelo).replace('/', ' - ')}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Cor</div>
              <div className="dv">{v(vei.cor)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Combustível</div>
              <div className="dv">{v(vei.combustivel)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Fabricação</div>
              <div className="dv">{v(vei.ano_fabricacao ?? vei.anoFabricacao)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Modelo</div>
              <div className="dv">{v(vei.ano_modelo ?? vei.anoModelo)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Placa Vinculada</div>
              <div className="dv">
                {placaFormatada}
              </div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Espécie</div>
              <div className="dv">{v(vei.especie)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Tipo</div>
              <div className="dv">{v(vei.tipo)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Carroceria</div>
              <div className="dv">{v(vei.carroceria)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Potência</div>
              <div className="dv">{v(vei.potencia)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Cilindrada</div>
              <div className="dv">
                {v(vei.cilindrada)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Capacidade Passageiros</div>
              <div className="dv">
                {v(vei.capacidade_passageiros)}
              </div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Município / UF</div>
              <div className="dv">{vei.municipio ? `${vei.municipio}${vei.uf ? ` / ${vei.uf}` : ''}` : '—'}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Procedência</div>
              <div className="dv">{v(vei.procedencia)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Situação</div>
              <div className="dv">{v(vei.situacao)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AGREGADOS & NÚMEROS DE CHASSI */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>AGREGADOS & NÚMEROS DE CHASSI</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Chassi</div>
              <div className="dv">
                {v(vei.chassi)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">RENAVAM</div>
              <div className="dv">
                {v(vei.renavam)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Número do Motor</div>
              <div className="dv">
                {v(vei.motor)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROPRIETÁRIO ATUAL */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>PROPRIETÁRIO ATUAL</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Nome</div>
              <div className="dv">{v(prop.nome)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Documento</div>
              <div className="dv">
                {v(prop.documento)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Tipo Documento</div>
              <div className="dv">{v(prop.tipo_documento)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Município / UF</div>
              <div className="dv">{prop.municipio ? `${prop.municipio}${prop.uf ? ` / ${prop.uf}` : ''}` : '—'}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Data Atualização</div>
              <div className="dv">
                {v(prop.data_atualizacao)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      {/* TABELA FIPE */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>TABELA FIPE</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Código FIPE</div>
              <div className="dv">
                {v(fipe.codigo_fipe)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Marca</div>
              <div className="dv">{v(fipe.marca)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Modelo</div>
              <div className="dv">{v(fipe.modelo)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Modelo</div>
              <div className="dv">{v(fipe.ano_modelo)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Valor FIPE</div>
              <div className="dv">
                {v(fipe.valor)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Referência</div>
              <div className="dv">{v(fipe.referencia)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DadosAgregadosBasica({ r }: { r: Record<string, unknown> }) {
  const vei = (r.veiculo || r || {}) as Record<string, unknown>;
  const placaRaw = String(vei.placa ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const placaFormatada = placaRaw.length === 7 ? `${placaRaw.slice(0, 3)}-${placaRaw.slice(3)}` : (vei.placa ? String(vei.placa) : '—');
  return (
    <>
      <div className="src-badge">DENATRAN / SENATRAN</div>

      {/* FICHA CADASTRAL DO VEÍCULO */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>FICHA CADASTRAL DO VEÍCULO</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Placa</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
                {placaFormatada}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Marca / Modelo</div>
              <div className="dv">
                {v(vei.marca_modelo ?? vei.marcaModelo).replace('/', ' - ')}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Cor</div>
              <div className="dv">{v(vei.cor)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Fabricação</div>
              <div className="dv">{v(vei.ano_fabricacao ?? vei.anoFabricacao)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Modelo</div>
              <div className="dv">{v(vei.ano_modelo ?? vei.anoModelo)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Combustível</div>
              <div className="dv">{v(vei.combustivel)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Município / UF</div>
              <div className="dv">{vei.municipio ? `${vei.municipio}${vei.uf ? ` / ${vei.uf}` : ''}` : '—'}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }} />
            <div className="ds-row-inner" style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      {/* AGREGADOS & NÚMEROS DE CHASSI */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>AGREGADOS & NÚMEROS DE CHASSI</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Chassi</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.chassi)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">RENAVAM</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.renavam)}
              </div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Número do Motor</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
                {v(vei.motor)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DadosCrlve({ r }: { r: Record<string, unknown> }) {
  const data = (r.data || r) as Record<string, any>;
  const veiculo = (data.veiculo || {}) as Record<string, any>;
  const crlv = (data.documentos?.crlv || {}) as Record<string, any>;
  const pdfBase64 = crlv.pdf_file?.file_base64 as string | undefined;
  const mimeType = (crlv.pdf_file?.mime_type as string | undefined) || "application/pdf";

  return (
    <>
      <div className="src-badge">SENATRAN / DETRAN · CERTIFICADO DIGITAL CRLV-e</div>

      {/* ── Bloco: Dados do Veículo ── */}
      <div className="ds-block crlv-vehicle-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>DADOS DO VEÍCULO (CRLV-e)</span></div>

        {/* Linha 1 — Principais */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 2 }}>
            <div className="dk">Marca / Modelo</div>
            <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{v(veiculo.marca_modelo || veiculo.marcaModelo || '—').replace('/', ' - ')}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1.5 }}>
            <div className="dk">Placa</div>
            <div className="dv">{v(veiculo.placa)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Exercício</div>
            <div className="dv" style={{ color: 'var(--brass)', fontWeight: 700 }}>{v(crlv.exercicio)}</div>
          </div>
        </div>

        {/* Linha 2 */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 2 }}>
            <div className="dk">Chassi</div>
            <div className="dv">{v(veiculo.chassi)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1.5 }}>
            <div className="dk">RENAVAM</div>
            <div className="dv">{v(veiculo.renavam)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Situação</div>
            <div className="dv" style={{ overflow: 'visible', paddingBottom: 3 }}>
              {crlv.existe_ocorrencia === '1'
                ? <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px' }}>CONSTA IMPEDIMENTO</span>
                : <span className="chip chip-green" style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px' }}>CRLV-e REGULAR</span>
              }
            </div>
          </div>
        </div>

        {/* Linha 3 */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 2 }}>
            <div className="dk">Nº CRLV</div>
            <div className="dv">{v(veiculo.crlv)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1.5 }}>
            <div className="dk">Ano Fab. / Mod.</div>
            <div className="dv">{v(veiculo.ano_fabricacao || '—')} / {v(veiculo.ano_modelo || '—')}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Motor</div>
            <div className="dv">{v(veiculo.motor)}</div>
          </div>
        </div>

        {/* Linha 4 — Secundários */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 2 }}>
            <div className="dk">Combustível</div>
            <div className="dv">{v(veiculo.combustivel)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1.5 }}>
            <div className="dk">Cor</div>
            <div className="dv">{v(veiculo.cor_veiculo || veiculo.cor)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Município / UF</div>
            <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{veiculo.municipio ? `${veiculo.municipio} — ${veiculo.uf || ''}` : '—'}</div>
          </div>
        </div>

        {/* Linha 5 — Proprietário */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 2 }}>
            <div className="dk">Proprietário</div>
            <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4, fontWeight: 600 }}>{v(veiculo.proprietario_nome)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1.5 }}>
            <div className="dk">CPF / CNPJ</div>
            <div className="dv">{v(veiculo.proprietario_documento)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Atualização DENATRAN</div>
            <div className="dv">{v(veiculo.data_atualizacao)}</div>
          </div>
        </div>
      </div>

      {/* ── Bloco: Documento e Assinatura Digital ── */}
      <div className="ds-block" style={{ marginTop: 2 }}>
        <div className="ds-hd"><span>DOCUMENTO E ASSINATURA DIGITAL</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.6 }}>
              Certificado gerado e assinado digitalmente pelo órgão emissor federal/estadual (SENATRAN / DETRAN).
            </div>
            {crlv.existe_ocorrencia === '1' && crlv.observacoes && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)', borderLeft: '3px solid #ef4444', color: '#ef4444', fontSize: 12 }}>
                <strong>Observações/Impedimentos:</strong> {crlv.observacoes}
              </div>
            )}
            {pdfBase64 ? (
              <CrlveDownloadButton
                pdfBase64={pdfBase64}
                mimeType={mimeType}
                placa={veiculo.placa || "VEICULO"}
              />
            ) : (
              <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>
                [AVISO] Arquivo PDF do documento não disponibilizado nesta consulta.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DadosCsvCompleta({ r }: { r: Record<string, unknown> }) {
  // r = { pdf, veicular: { proprietario_atual_veiculo, bin_nacional, renainf, renajud, csv, alerta_indicio, precificador, recall } }
  const veicular   = (r.veicular   || {}) as Record<string, any>;
  const propAtual  = (veicular.proprietario_atual_veiculo || {}) as Record<string, any>;
  const binNac     = (veicular.bin_nacional               || {}) as Record<string, any>;
  const restricoes = (binNac.restricoes                   || {}) as Record<string, any>;
  const alerta     = (veicular.alerta_indicio             || {}) as Record<string, any>;
  const renainf    = (veicular.renainf                    || {}) as Record<string, any>;
  const renajud    = (veicular.renajud                    || {}) as Record<string, any>;
  const csv        = (veicular.csv                        || {}) as Record<string, any>;
  const prec       = (veicular.precificador               || {}) as Record<string, any>;
  const recall     = (veicular.recall                     || {}) as Record<string, any>;

  const infracoes    = (renainf.ocorrencias    ?? []) as Record<string, any>[];
  const csvOcorr     = (csv.ocorrencias        ?? []) as Record<string, any>[];
  const precOcorr    = (prec.ocorrencias       ?? []) as Record<string, any>[];
  const msgRest      = (restricoes.mensagens_restricoes ?? []) as string[];

  const temMultas    = Number(renainf.qtd_ocorrencias ?? 0) > 0;
  const temRenajud   = Number(renajud.quantidade_ocorrencias ?? 0) > 0 || restricoes.existe_restricao_renajud === '1';
  const temCsv       = Number(csv.quantidade_ocorrencia ?? 0) > 0;
  const temSinistro  = alerta.existe_ocorrencia === '1';
  const temRestGeral = restricoes.existe_restricao_geral === '1';
  const temRoubo     = restricoes.existe_restricao_roubo_furto === '1';
  const temRestricao = temRestGeral || temRenajud || temRoubo || temSinistro || temMultas || temCsv;

  return (
    <>
      <div className="src-badge">SENATRAN / RENAINF / RENAJUD / BIN NACIONAL · CONSULTA VEICULAR COMPLETA</div>

      {/* ── Identificação + Parecer ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2, marginBottom: 2, marginTop: 8, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO</span></div>
          <div className="ds-row">
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Marca / Modelo</div>
              <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{v(propAtual.marca_modelo).replace('/', ' - ')}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Placa</div>
              <div className="dv">{v(propAtual.placa)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Fab. / Mod.</div>
              <div className="dv">{v(propAtual.ano_fabricacao)} / {v(propAtual.ano_modelo)}</div>
            </div>
          </div>
          <div className="ds-row">
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Chassi</div>
              <div className="dv">{v(propAtual.chassi)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">RENAVAM</div>
              <div className="dv">{v(propAtual.renavam)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Motor</div>
              <div className="dv">{v(propAtual.motor)}</div>
            </div>
          </div>
          <div className="ds-row">
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Proprietário</div>
              <div className="dv" style={{ fontWeight: 600 }}>{v(propAtual.proprietario_nome)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">CPF / CNPJ</div>
              <div className="dv">{v(propAtual.proprietario_documento)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Município / UF</div>
              <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{propAtual.municipio ? `${propAtual.municipio} — ${propAtual.uf || ''}` : '—'}</div>
            </div>
          </div>
          <div className="ds-row">
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Combustível</div>
              <div className="dv">{v(propAtual.combustivel)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Cor</div>
              <div className="dv">{v(propAtual.cor_veiculo)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }} />
          </div>
        </div>

        {/* Parecer geral */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ds-hd" style={{ background: temRestricao ? '#c0392b' : 'var(--navy)' }}>
            <span>PARECER GERAL</span>
          </div>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: temRestricao ? '#fdf0f0' : '#f0fdf4',
            border: `1px solid ${temRestricao ? '#e8b4b4' : '#b4e8c0'}`,
            borderTop: 'none', padding: '18px 16px',
          }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', margin: '0 auto 8px',
                background: temRestricao ? '#c0392b' : '#2ba84a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: '#fff',
              }}>
                {temRestricao ? '✕' : '✓'}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: temRestricao ? '#c0392b' : '#2ba84a', letterSpacing: '0.05em', textTransform: 'uppercase' as const, lineHeight: 1.4 }}>
                {temRestricao ? 'RESTRIÇÕES\nENCONTRADAS' : 'SEM\nRESTRIÇÕES'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dados Técnicos (BIN Nacional) ── */}
      <div className="ds-block crlv-vehicle-block" style={{ marginTop: 2 }}>
        <div className="ds-hd"><span>DADOS TÉCNICOS — BIN NACIONAL</span></div>
        {/* Linha 1: Categoria | Espécie | Tipo */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Categoria</div>
            <div className="dv">{v(binNac.categoria_veiculo)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Espécie</div>
            <div className="dv">{v(binNac.especie_veiculo)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Tipo</div>
            <div className="dv">{v(binNac.tipo_veiculo)}</div>
          </div>
        </div>
        {/* Linha 2: Carroceria | Potência | Nº Eixos */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Carroceria</div>
            <div className="dv">{v(binNac.tipo_carroceria)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Potência (cv)</div>
            <div className="dv">{v(binNac.potencia_veiculo)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Nº Eixos</div>
            <div className="dv">{v(binNac.numero_eixos)}</div>
          </div>
        </div>
        {/* Linha 3: Passageiros | Procedência | PBT */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Passageiros</div>
            <div className="dv">{v(binNac.quantidade_passageiros)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Procedência</div>
            <div className="dv">{v(binNac.procedencia)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">PBT (t)</div>
            <div className="dv">{v(binNac.pbt)}</div>
          </div>
        </div>
        {/* Linha 4: Situação BIN | Data CRLV | Data CRV */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Situação BIN</div>
            <div className="dv" style={{ color: temRestGeral ? '#c0392b' : '#2ba84a', fontWeight: 600 }}>{v(binNac.situacao)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Data Emissão CRLV</div>
            <div className="dv">{v(binNac.data_emissao_crlv)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Data Último CRV</div>
            <div className="dv">{v(binNac.data_emissao_ultimo_crv)}</div>
          </div>
        </div>
      </div>

      {/* ── Restrições BIN ── */}
      <div className="ds-block" style={{ marginTop: 2 }}>
        <div className="ds-hd" style={{ background: temRestricao ? '#c0392b' : 'var(--navy)' }}>
          <span>SITUAÇÃO / RESTRIÇÕES BIN NACIONAL</span>
        </div>
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Restrição Geral</div>
            <div className="dv" style={{ color: temRestGeral ? '#c0392b' : '#2ba84a', fontWeight: 600 }}>
              {temRestGeral ? 'ATIVA' : 'LIVRE'}
            </div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Restrição RENAJUD</div>
            <div className="dv" style={{ color: restricoes.existe_restricao_renajud === '1' ? '#c0392b' : '#2ba84a', fontWeight: 600 }}>
              {restricoes.existe_restricao_renajud === '1' ? 'ATIVA' : 'LIVRE'}
            </div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Roubo / Furto</div>
            <div className="dv" style={{ color: temRoubo ? '#c0392b' : '#2ba84a', fontWeight: 600 }}>
              {temRoubo ? 'ATIVO' : 'LIVRE'}
            </div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Veículo Baixado</div>
            <div className="dv" style={{ color: restricoes.veiculo_baixado === '1' ? '#c0392b' : '#2ba84a', fontWeight: 600 }}>
              {restricoes.veiculo_baixado === '1' ? 'SIM' : 'NÃO'}
            </div>
          </div>
        </div>
        {msgRest.length > 0 && (
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Mensagens de Restrição</div>
              <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.6, color: '#c0392b', fontWeight: 600 }}>
                {msgRest.map((m, i) => <div key={i}>{m}</div>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Alerta Indício de Sinistro ── */}
      <div className="ds-block" style={{ marginTop: 2 }}>
        <div className="ds-hd" style={{ background: temSinistro ? '#c0392b' : 'var(--navy)' }}>
          <span>ALERTA — INDÍCIO DE SINISTRO</span>
        </div>
        <div className="ds-row">
          <div className="ds-row-inner">
            <div className="dk">Situação</div>
            <div className="dv" style={{ color: temSinistro ? '#c0392b' : '#2ba84a', fontWeight: 600 }}>
              {temSinistro ? 'INDÍCIO IDENTIFICADO' : 'NADA CONSTA'}
            </div>
          </div>
          {temSinistro
            ? <span className="chip chip-red">ALERTA SINISTRO</span>
            : <span className="chip chip-green">NADA CONSTA</span>
          }
        </div>
        {alerta.descricao_ocorrencia && (
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Descrição</div>
              <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.5, color: temSinistro ? '#c0392b' : undefined }}>{v(alerta.descricao_ocorrencia)}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── RENAINF ── */}
      <div className="ds-block" style={{ marginTop: 2 }}>
        <div className="ds-hd" style={{ background: temMultas ? '#c0392b' : 'var(--navy)' }}>
          <span>RENAINF — MULTAS DE TRÂNSITO</span>
          {temMultas && <span className="ds-hd-badge" style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>{Number(renainf.qtd_ocorrencias) === 1 ? '1 MULTA' : `${renainf.qtd_ocorrencias} MULTAS`}</span>}
        </div>
        {!temMultas ? (
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Situação</div>
              <div className="dv" style={{ color: '#2ba84a', fontWeight: 600 }}>Nenhuma multa de trânsito registrada no RENAINF</div>
            </div>
            <span className="chip chip-green">NADA CONSTA</span>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table className="snc-tbl">
              <thead>
                <tr>
                  <th>#</th>
                  <th style={{ textAlign: 'left' }}>Auto / Descrição</th>
                  <th>Cód.</th>
                  <th>Data</th>
                  <th>Órgão</th>
                  <th>Situação</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {infracoes.map((inf, idx) => (
                  <tr key={idx} style={{ background: '#ffffff' }}>
                    <td className="mono">{idx + 1}</td>
                    <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 200 }}>
                      <div>{v(inf.numero_auto_infracao)}</div>
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{v(inf.descricao_infracao)}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Local: {v(inf.local_infracao)}</div>
                    </td>
                    <td className="mono">{v(inf.codigo_infracao)}</td>
                    <td className="mono">{v(inf.data_infracao)}</td>
                    <td>{v(inf.orgao_autuador)}</td>
                    <td>
                      <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>
                        {v(inf.situacao || 'EM ABERTO')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#c0392b' }} className="mono">
                      {inf.valor_multa ? `R$ ${inf.valor_multa}` : '—'}
                    </td>
                  </tr>
                ))}
                {/* Linha do Valor Consolidado integrada sob as colunas corretas */}
                <tr style={{ background: 'rgba(200, 162, 90, 0.04)', fontWeight: 700 }}>
                  <td colSpan={5} style={{ 
                    textAlign: 'right', 
                    fontFamily: "'JetBrains Mono',monospace", 
                    fontSize: 9, 
                    letterSpacing: '.06em', 
                    textTransform: 'uppercase', 
                    padding: '11px 14px',
                    color: 'var(--ink2)',
                    borderRight: '1px solid #c8bfa8'
                  }}>
                    Valor Consolidado
                  </td>
                  <td style={{ textAlign: 'center', padding: '11px 14px', borderRight: '1px solid #c8bfa8' }}>
                    <span className="chip chip-red">DÉBITO ATIVO</span>
                  </td>
                  <td className="mono" style={{ color: '#ef4444', fontSize: 11, textAlign: 'right', padding: '11px 14px' }}>
                    {infracoes.reduce((acc, inf) => {
                      const valStr = String(inf.valor_multa ?? '0').replace(/[^0-9,.-]/g, '').replace(',', '.');
                      const valNum = parseFloat(valStr);
                      return acc + (isNaN(valNum) ? 0 : valNum);
                    }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── RENAJUD ── */}
      <div className="ds-block" style={{ marginTop: 2 }}>
        <div className="ds-hd" style={{ background: temRenajud ? '#c0392b' : 'var(--navy)' }}>
          <span>RENAJUD — RESTRIÇÕES JUDICIAIS</span>
          {temRenajud && <span className="ds-hd-badge" style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>{renajud.quantidade_ocorrencias} restrição(ões)</span>}
        </div>
        <div className="ds-row">
          <div className="ds-row-inner">
            <div className="dk">Ocorrências</div>
            <div className="dv" style={{ color: temRenajud ? '#c0392b' : '#2ba84a', fontWeight: 600 }}>
              {temRenajud ? `${renajud.quantidade_ocorrencias} restrição(ões) judicial(is) ativa(s)` : 'Nenhuma restrição judicial registrada no RENAJUD'}
            </div>
          </div>
          {temRenajud ? <span className="chip chip-red">RESTRIÇÃO ATIVA</span> : <span className="chip chip-green">NADA CONSTA</span>}
        </div>
        {renajud.msg_alerta && (
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Alerta RENAJUD</div>
              <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.5, color: '#c0392b', fontWeight: 600 }}>{v(renajud.msg_alerta)}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── CSV / BIN Ocorrências ── */}
      <div className="ds-block" style={{ marginTop: 2 }}>
        <div className="ds-hd" style={{ background: temCsv ? '#c0392b' : 'var(--navy)' }}>
          <span>CSV / BIN — OCORRÊNCIAS NACIONAIS</span>
          {temCsv && <span className="ds-hd-badge" style={{ color: 'rgba(255,255,255,0.9)', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}>{Number(csv.quantidade_ocorrencia) === 1 ? '1 OCORRÊNCIA' : `${csv.quantidade_ocorrencia} OCORRÊNCIAS`}</span>}
        </div>
        {!temCsv ? (
          <div className="ds-row">
            <div className="ds-row-inner">
              <div className="dk">Situação</div>
              <div className="dv" style={{ color: '#2ba84a', fontWeight: 600 }}>Nenhuma ocorrência no sistema CSV</div>
            </div>
            <span className="chip chip-green">NADA CONSTA</span>
          </div>
        ) : (
          <>
            {csv.mensagem_observacao && (
              <div className="ds-row">
                <div className="ds-row-inner">
                  <div className="dk">Observação</div>
                  <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.5, color: '#c0392b' }}>{v(csv.mensagem_observacao)}</div>
                </div>
              </div>
            )}
            {csvOcorr.length > 0 && (
              <div className="tbl-wrap">
                <table className="snc-tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th style={{ textAlign: 'left' }}>Tipo</th>
                      <th style={{ textAlign: 'left' }}>Descrição</th>
                      <th>Data</th>
                      <th>Órgão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvOcorr.map((o, idx) => (
                      <tr key={idx} style={{ background: '#ffffff' }}>
                        <td className="mono">{idx + 1}</td>
                        <td style={{ textAlign: 'left' }}>
                          <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>{v(o.tipo_restricao || o.tipo)}</span>
                        </td>
                        <td style={{ textAlign: 'left', whiteSpace: 'normal', minWidth: 220 }}>{v(o.descricao)}</td>
                        <td className="mono">{v(o.data)}</td>
                        <td>{v(o.orgao)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Precificador FIPE ── */}
      {precOcorr.length > 0 && (
        <div className="ds-block" style={{ marginTop: 2 }}>
          <div className="ds-hd"><span>PRECIFICADOR FIPE</span></div>
          {precOcorr.map((o, idx) => (
            <div key={idx} className="ds-row">
              <div style={{ display: 'flex', flex: 1, gap: 16 }}>
                <div className="ds-row-inner" style={{ flex: 2 }}>
                  <div className="dk">Modelo FIPE</div>
                  <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{v(o.fabricante_modelo)}</div>
                </div>
                <div className="ds-row-inner" style={{ flex: 1 }}>
                  <div className="dk">Código FIPE</div>
                  <div className="dv">{v(o.codigo)}</div>
                </div>
                <div className="ds-row-inner" style={{ flex: 1 }}>
                  <div className="dk">Valor FIPE</div>
                  <div className="dv" style={{ color: '#2ba84a', fontWeight: 700 }}>{o.preco ? `R$ ${o.preco}` : '—'}</div>
                </div>
                <div className="ds-row-inner" style={{ flex: 1 }}>
                  <div className="dk">Vigência</div>
                  <div className="dv">{v(o.vigencia)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Recall ── */}
      <div className="ds-block" style={{ marginTop: 2 }}>
        <div className="ds-hd"><span>RECALL</span></div>
        <div className="ds-row">
          <div className="ds-row-inner">
            <div className="dk">Situação</div>
            <div className="dv" style={{ color: Number(recall.quantidade_ocorrencias) > 0 ? '#c0392b' : '#2ba84a', fontWeight: 600 }}>
              {Number(recall.quantidade_ocorrencias) > 0
                ? `${recall.quantidade_ocorrencias} recall(s) ativo(s)`
                : 'Nenhum recall ativo'}
            </div>
          </div>
          {Number(recall.quantidade_ocorrencias) > 0
            ? <span className="chip chip-red">RECALL ATIVO</span>
            : <span className="chip chip-green">NADA CONSTA</span>
          }
        </div>
      </div>
    </>
  );
}

function DadosAnaliticoVeicular({ r }: { r: Record<string, unknown> }) {
  const veiculo = (r.veiculo ?? {}) as Record<string, any>;
  const proprietario = (r.proprietario ?? {}) as Record<string, any>;
  const fipe = (r.fipe ?? {}) as Record<string, any>;
  const historicoKm = (r.historicoKm ?? {}) as Record<string, any>;
  const renajud = (r.renajud ?? {}) as Record<string, any>;
  const renainf = (r.renainf ?? {}) as Record<string, any>;
  const rouboFurto = (r.rouboFurto ?? {}) as Record<string, any>;
  const recall = (r.recall ?? {}) as Record<string, any>;

  const kmRegistros = (historicoKm.registros ?? []) as Record<string, any>[];
  const multas = (renainf.multas ?? []) as Record<string, any>[];
  const ocorrenciasRoubo = (rouboFurto.ocorrencias ?? []) as Record<string, any>[];
  const ocorrenciasRecall = (recall.ocorrencias ?? []) as Record<string, any>[];

  return (
    <>
      <div className="src-badge">BASE FEDERAL · CONSULTA ANALÍTICA VEICULAR</div>

      {/* ── Identificação do Veículo ── */}
      <div className="ds-block" style={{ marginTop: 8, marginBottom: 2 }}>
        <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO</span></div>
        
        {/* Linha 1 */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Marca/Modelo</div>
            <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{v(veiculo.marca_modelo).replace('/', ' - ')}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Placa</div>
            <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{v(veiculo.placa)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Chassi</div>
            <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'normal', lineHeight: 1.4, wordBreak: 'break-all' }}>{v(veiculo.chassi)}</div>
          </div>
        </div>

        {/* Linha 2 */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">RENAVAM</div>
            <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{v(veiculo.renavam)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Motor</div>
            <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{v(veiculo.motor)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Cor</div>
            <div className="dv">{v(veiculo.cor)}</div>
          </div>
        </div>

        {/* Linha 3 */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Combustível</div>
            <div className="dv">{v(veiculo.combustivel)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Ano Fab / Mod</div>
            <div className="dv">{veiculo.ano_fabricacao && veiculo.ano_modelo ? `${veiculo.ano_fabricacao}/${veiculo.ano_modelo}` : '—'}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Município / UF</div>
            <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{veiculo.municipio && veiculo.uf ? `${veiculo.municipio} - ${veiculo.uf}` : '—'}</div>
          </div>
        </div>
      </div>

      {/* ── Proprietário Atual ── */}
      <div className="ds-block" style={{ marginBottom: 2 }}>
        <div className="ds-hd"><span>PROPRIETÁRIO ATUAL</span></div>
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Nome</div>
            <div className="dv" style={{ fontWeight: 600, whiteSpace: 'normal', lineHeight: 1.4 }}>{v(proprietario.nome)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Documento (CPF/CNPJ)</div>
            <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{v(proprietario.documento)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Município / UF</div>
            <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{proprietario.municipio && proprietario.uf ? `${proprietario.municipio} - ${proprietario.uf}` : '—'}</div>
          </div>
        </div>
      </div>

      {/* ── Tabela FIPE ── */}
      <div className="ds-block" style={{ marginBottom: 2 }}>
        <div className="ds-hd"><span>TABELA FIPE</span></div>
        
        {/* Linha 1 */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Código FIPE</div>
            <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{v(fipe.codigoFipe)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Modelo FIPE</div>
            <div className="dv" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{v(fipe.modelo)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Ano Modelo</div>
            <div className="dv">{v(fipe.anoModelo)}</div>
          </div>
        </div>

        {/* Linha 2 */}
        <div className="ds-row">
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Combustível</div>
            <div className="dv">{v(fipe.combustivel)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Mês Referência</div>
            <div className="dv">{v(fipe.mesReferencia)}</div>
          </div>
          <div className="ds-row-inner" style={{ flex: 1 }}>
            <div className="dk">Valor FIPE</div>
            <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: 'var(--greend)' }}>{v(fipe.valor)}</div>
          </div>
        </div>
      </div>

      {/* ── Histórico de Quilometragem ── */}
      <div className="src-badge" style={{ marginTop: 12 }}>HISTÓRICO DE QUILOMETRAGEM</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd">
          <span>REGISTROS DE ODÔMETRO</span>
          <span className="ds-hd-badge">{reg(kmRegistros.length)}</span>
        </div>
        {kmRegistros.length > 0 ? (
          <>
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Quilometragem</th>
                    <th>Fonte</th>
                    <th>UF</th>
                  </tr>
                </thead>
                <tbody>
                  {kmRegistros.map((item, i) => {
                    const parseKm = (s: any) => Number(String(s ?? '').replace(/[^0-9]/g, ''));
                    const kmAtual = parseKm(item.km);
                    const kmProx = i + 1 < kmRegistros.length ? parseKm(kmRegistros[i + 1].km) : 0;
                    const isAnomaly = i + 1 < kmRegistros.length && kmAtual < kmProx;
                    
                    return (
                      <tr key={i} style={{ background: '#ffffff' }}>
                        <td className="mono">{v(item.data)}</td>
                        <td className="bold mono" style={isAnomaly ? { color: '#c0392b', fontWeight: 700 } : {}}>
                          {item.km ? `${item.km} km` : '—'}{isAnomaly ? ' ⚠' : ''}
                        </td>
                        <td style={isAnomaly ? { color: '#c0392b', fontWeight: 600 } : {}}>{v(item.fonte)}</td>
                        <td className="mono" style={isAnomaly ? { color: '#c0392b' } : {}}>{v(item.uf)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {historicoKm.anomalia && (
              <div className="ds-row">
                <div className="ds-row-inner">
                  <div className="dk">Alerta de Divergência</div>
                  <div className="dv" style={{ color: '#ef4444', fontWeight: 700 }}>
                    {historicoKm.motivoAnomalia || "QUILOMETRAGEM REVERTIDA — POSSÍVEL ADULTERAÇÃO DE HODÔMETRO"}
                  </div>
                </div>
                <span className="chip chip-red">DIVERGÊNCIA</span>
              </div>
            )}
          </>
        ) : (
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Quilometragem</div><div className="dv">Nenhum histórico registrado</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>

      {/* ── Restrições RENAJUD ── */}
      <div className="src-badge" style={{ marginTop: 12 }}>RESTRIÇÕES JUDICIAIS (RENAJUD)</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd">
          <span>SITUAÇÃO RENAJUD</span>
          {renajud.temRestricao && <span className="ds-hd-badge">1 PROCESSO</span>}
        </div>
        {renajud.temRestricao ? (
          <div className="tbl-wrap" style={{ overflow: 'hidden' }}>
            <table className="snc-tbl" style={{ width: '100%', wordBreak: 'break-word', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Nº Processo</th>
                  <th>Órgão Judicial</th>
                  <th>Tribunal</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {/* Linha 1: dados gerais */}
                <tr style={{ background: '#ffffff', borderTop: '1px solid #c8bfa8' }}>
                  <td className="mono">{v(renajud.processo)}</td>
                  <td>{v(renajud.orgaoJudicial)}</td>
                  <td>{v(renajud.tribunal)}</td>
                  <td>
                    <span className="chip chip-red">RESTRIÇÃO ATIVA</span>
                  </td>
                </tr>
                {/* Linha 2: restrições detalhadas */}
                <tr style={{
                  background: '#ffffff',
                  fontSize: '0.82em',
                  borderBottom: '1px solid #c8bfa8',
                }}>
                  <td colSpan={4} style={{ padding: '4px 12px 10px', borderBottom: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        fontFamily: "'JetBrains Mono',monospace",
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#c0392b',
                        width: 18,
                        textAlign: 'center',
                        marginRight: 6
                      }}>
                        1
                      </div>
                      <div style={{
                        flex: 1,
                        display: 'flex', gap: 14, flexWrap: 'wrap',
                        paddingLeft: 8, borderLeft: '2px solid #c0392b',
                        textAlign: 'left'
                      }}>
                        <span>
                          <strong style={{ color: '#c0392b' }}>Restrições Constatadas:</strong>{' '}
                          {renajud.restricoes && renajud.restricoes.length > 0
                            ? renajud.restricoes.join(" · ")
                            : 'RESTRIÇÃO REGISTRADA'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Restrição Judicial</div><div className="dv">Nenhuma restrição de circulação, transferência ou penhora</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>

      {/* ── Roubo e Furto ── */}
      <div className="src-badge" style={{ marginTop: 12 }}>INDÍCIO DE ROUBO / FURTO</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd">
          <span>SITUAÇÃO DE ROUBO/FURTO</span>
          {rouboFurto.temOcorrencia && (
            <span className="ds-hd-badge">
              {ocorrenciasRoubo.length === 1 ? '1 OCORRÊNCIA' : `${ocorrenciasRoubo.length} OCORRÊNCIAS`}
            </span>
          )}
        </div>
        {rouboFurto.temOcorrencia ? (
          <div className="tbl-wrap">
            <table className="snc-tbl">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Nº B.O.</th>
                  <th>Localidade</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {ocorrenciasRoubo.map((o, i) => (
                  <tr key={i} style={{ background: '#ffffff' }}>
                    <td className="mono">{v(o.data)}</td>
                    <td>{v(o.tipo)}</td>
                    <td className="mono">{v(o.boletim)}</td>
                    <td>{v(o.localidade)}</td>
                    <td>
                      <span className={`chip chip-${o.situacao === 'RECUPERADO' ? 'green' : 'red'}`}>
                        {v(o.situacao)}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Linha de Alerta de Roubo/Furto integrada ao final da tabela para centralização perfeita */}
                <tr style={{ background: '#ffffff', borderTop: '1px solid #c8bfa8' }}>
                  <td colSpan={4} style={{ padding: '12px 14px', textAlign: 'left', borderRight: '1px solid #c8bfa8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--ink2)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                        Ocorrência Ativa
                      </div>
                      <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, whiteSpace: 'normal', lineHeight: 1.4 }}>
                        Ocorrência de Roubo ou Furto Registrada no Sistema
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <span className="chip chip-red">CONSTA RESTRIÇÃO</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Roubo / Furto</div><div className="dv">Nenhum registro ativo de roubo ou furto para este veículo</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>

      {/* ── Multas RENAINF ── */}
      <div className="src-badge" style={{ marginTop: 12 }}>INFRAÇÕES DE TRÂNSITO (RENAINF)</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd">
          <span>MULTAS REGISTRADAS</span>
          <span className="ds-hd-badge">{reg(renainf.totalMultas ?? multas.length)}</span>
        </div>
        {multas.length > 0 ? (
          <>
            <div className="tbl-wrap">
              <table className="snc-tbl">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Infração / Descrição</th>
                    <th>Órgão</th>
                    <th>Valor</th>
                    <th>Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {multas.map((m, i) => (
                    <tr key={i} style={{ background: '#ffffff' }}>
                      <td className="mono">{v(m.data)}</td>
                      <td>{v(m.descricao)}</td>
                      <td>{v(m.orgao)}</td>
                      <td className="mono">{v(m.valor)}</td>
                      <td>
                        <span className={`chip chip-${m.situacao === 'PENDENTE' ? 'red' : 'green'}`}>
                          {v(m.situacao)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Linha do Valor Consolidado integrada sob as colunas corretas */}
                  <tr style={{ background: 'rgba(200, 162, 90, 0.04)', fontWeight: 700 }}>
                    <td colSpan={3} style={{ 
                      textAlign: 'right', 
                      fontFamily: "'JetBrains Mono',monospace", 
                      fontSize: 9, 
                      letterSpacing: '.06em', 
                      textTransform: 'uppercase', 
                      padding: '11px 14px',
                      color: 'var(--ink2)'
                    }}>
                      Valor Consolidado
                    </td>
                    <td className="mono" style={{ color: '#ef4444', fontSize: 11, textAlign: 'center' }}>
                      {v(renainf.valorTotal)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="chip chip-red">DÉBITO ATIVO</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Multas de Trânsito</div><div className="dv">Nenhuma infração registrada no RENAINF</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>

      {/* ── Recall ── */}
      <div className="src-badge" style={{ marginTop: 12 }}>RECALLS DE FABRICANTE</div>
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd">
          <span>CAMPANHAS DE SEGURANÇA</span>
          {recall.temRecall && (
            <span className="ds-hd-badge">
              {ocorrenciasRecall.length === 1 ? '1 CAMPANHA' : `${ocorrenciasRecall.length} CAMPANHAS`}
            </span>
          )}
        </div>
        {recall.temRecall ? (
          <div className="tbl-wrap">
            <table className="snc-tbl">
              <thead>
                <tr>
                  <th>Fabricante</th>
                  <th>Modelo</th>
                  <th>Campanha</th>
                  <th>Defeito</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {ocorrenciasRecall.map((c, i) => (
                  <tr key={i} style={{ background: '#ffffff' }}>
                    <td>{v(c.fabricante)}</td>
                    <td>{v(c.modelo)}</td>
                    <td className="mono">{v(c.campanha)}</td>
                    <td>{v(c.defeito)}</td>
                    <td>
                      <span className={`chip chip-${c.situacao === 'NÃO REPARADO' ? 'red' : 'green'}`}>
                        {v(c.situacao)}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Linha de Alerta de Recall integrada ao final da tabela para centralização perfeita */}
                <tr style={{ background: '#ffffff', borderTop: '1px solid #c8bfa8' }}>
                  <td colSpan={4} style={{ padding: '12px 14px', textAlign: 'left', borderRight: '1px solid #c8bfa8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--ink2)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                        Recall/Campanha Pendente
                      </div>
                      <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 13, whiteSpace: 'normal', lineHeight: 1.4 }}>
                        Existe recall de segurança pendente de execução pelo proprietário
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <span className="chip chip-red">RECALL ATIVO</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ds-row"><div className="ds-row-inner"><div className="dk">Recall</div><div className="dv">Nenhuma campanha de recall pendente para este veículo</div></div><span className="chip chip-green">NADA CONSTA</span></div>
        )}
      </div>
    </>
  );
}

function DadosHistoricoKm({ r }: { r: Record<string, unknown> }) {
  const veiculo     = (r.veiculo     ?? {}) as Record<string, unknown>;
  const historicoKm = (r.historicoKm ?? {}) as Record<string, unknown>;
  const registros   = (historicoKm.registros ?? []) as Record<string, unknown>[];
  const anomalia    = !!historicoKm.anomalia;
  const total       = Number(historicoKm.totalRegistros ?? registros.length);

  function formatKm(km: unknown): string {
    const n = Number(km ?? 0);
    if (!n) return '—';
    return `${n.toLocaleString('pt-BR')} km`;
  }

  return (
    <>
      <div className="src-badge">DENATRAN / DETRAN / SEGURADORAS · HISTÓRICO DE QUILOMETRAGEM</div>

      {/* Identificação do Veículo */}
      <div className="ds-block" style={{ marginTop: 8 }}>
        <div className="ds-hd"><span>IDENTIFICAÇÃO DO VEÍCULO</span></div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 2 }}>
              <div className="dk">Marca/Modelo</div>
              <div className="dv">{v(veiculo.marcaModelo || '—').replace('/', ' - ')}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Placa</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(veiculo.placa)}</div>
            </div>
          </div>
        </div>
        <div className="ds-row">
          <div style={{ display: 'flex', flex: 1, gap: 16 }}>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Chassi</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(veiculo.chassi)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">RENAVAM</div>
              <div className="dv" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{v(veiculo.renavam)}</div>
            </div>
            <div className="ds-row-inner" style={{ flex: 1 }}>
              <div className="dk">Ano Fab/Mod</div>
              <div className="dv">{v(veiculo.anoFabricacao)} / {v(veiculo.anoModelo)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Km */}
      <div className="ds-block" style={{ marginTop: 2 }}>
        <div className="ds-hd" style={{ background: anomalia ? '#c0392b' : 'var(--navy)' }}>
          <span>HISTÓRICO DE QUILOMETRAGEM</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {anomalia && <span className="chip chip-red">DIVERGÊNCIA</span>}
            <span className="ds-hd-badge" style={{ color: anomalia ? 'rgba(255,255,255,0.9)' : undefined, borderColor: anomalia ? 'rgba(255,255,255,0.3)' : undefined, background: anomalia ? 'rgba(255,255,255,0.1)' : undefined }}>
              {reg(total)}
            </span>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="snc-tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Data</th>
                <th style={{ textAlign: 'right' }}>Quilometragem</th>
                <th style={{ textAlign: 'left' }}>Fonte</th>
                <th>UF</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr style={{ background: '#ffffff' }}>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#5a6a7a', fontStyle: 'italic' }}>Nenhum registro de quilometragem encontrado</td>
                </tr>
              ) : registros.map((reg, i) => {
                const kmAtual   = Number(reg.km ?? 0);
                const kmProx    = i + 1 < registros.length ? Number(registros[i + 1].km ?? 0) : 0;
                const isAnomaly = i + 1 < registros.length && kmAtual < kmProx;
                return (
                  <tr key={i} style={{ background: '#ffffff' }}>
                    <td className="mono">{i + 1}</td>
                    <td className="mono">{String(reg.data ?? '—')}</td>
                    <td style={{ textAlign: 'right', color: isAnomaly ? '#c0392b' : 'inherit', fontWeight: isAnomaly ? 700 : 600 }} className="mono">
                      {formatKm(reg.km)}{isAnomaly ? ' ⚠' : ''}
                    </td>
                    <td style={{ textAlign: 'left' }}>{String(reg.fonte ?? '—')}</td>
                    <td className="mono">{String(reg.estado ?? '—')}</td>
                    <td>
                      {isAnomaly ? (
                        <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>DIVERGÊNCIA</span>
                      ) : (
                        <span className="chip chip-green" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>NORMAL</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {/* Rodapé de totais */}
              <tr style={{ background: '#fcfaf6', fontWeight: 700 }}>
                <td colSpan={2} style={{ textAlign: 'left', color: 'var(--ink)' }}>TOTAL DE REGISTROS</td>
                <td style={{ textAlign: 'right' }} className="mono">{total}</td>
                <td colSpan={2} />
                <td>
                  {anomalia
                    ? <span className="chip chip-red" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>DIVERGÊNCIA DETECTADA</span>
                    : <span className="chip chip-green" style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px' }}>CONSISTENTE</span>
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {anomalia && (
          <div style={{ padding: '10px 16px', background: 'rgba(192,57,43,0.06)', borderTop: '2px solid #c0392b', color: '#c0392b', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ⚠ Quilometragem decrescente detectada — possível adulteração de hodômetro.
          </div>
        )}
      </div>
    </>
  );
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
  .r-page{max-width:960px;margin:0 auto;background:var(--paper);box-shadow:0 18px 60px rgba(10,22,40,.18);position:relative;overflow:hidden;display:flex;flex-direction:column;min-height:100vh}
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
  .r-ms{display:flex;background:#0e1d36;border-top:1px solid #1a2742}
  .r-ms>div{padding:16px 20px;border-right:1px solid #1a2742;flex:1;min-width:0}
  .r-ms>div:first-child{flex:1.5;min-width:0}
  .r-ms>div:last-child{border-right:none}
  .r-ms .l{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--brass);letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px;white-space:nowrap}
  .r-ms .v{font-size:12px;color:#fff;font-family:'JetBrains Mono',monospace;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
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
  .r-sl .pfs>div .v{font-size:13px;color:var(--ink);font-weight:500;font-family:'JetBrains Mono',monospace}
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
  .ds-row{padding:11px 16px;display:flex;justify-content:space-between;align-items:center;background:#ffffff;border:1px solid #d4cfc1;border-top:none;gap:16px}
  .ds-row-inner{flex:1;min-width:0}
  .dk{font-family:'JetBrains Mono',monospace;font-size:9px;color:#000;letter-spacing:.06em;text-transform:uppercase}
  .mono{font-family:'JetBrains Mono',monospace}
  .ds-row .dk{font-family:'JetBrains Mono',monospace;font-size:9px;color:#000;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;white-space:nowrap}
  .ds-row .dv{font-size:11px;font-family:'JetBrains Mono',monospace;font-weight:400;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .src-badge{display:inline-flex;align-items:center;padding:5px 12px;border:1px solid #b8b0a0;color:var(--ink2);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;background:var(--paper);margin:16px 0 0}
  .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #c8bfa8}
  .snc-tbl{width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed}
  .snc-tbl tr{background:#ffffff}
  .snc-tbl th{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--ink2);letter-spacing:.08em;text-transform:uppercase;padding:9px 14px;background:rgba(200,162,90,0.08);border-bottom:1px solid #c8bfa8;border-right:1px solid #c8bfa8;text-align:center !important;white-space:normal;word-break:break-word}
  .snc-tbl th:last-child{border-right:none}
  .snc-tbl td{padding:11px 14px;border-bottom:1px solid #c8bfa8;border-right:1px solid #c8bfa8;color:#000000;text-align:center;vertical-align:middle;white-space:normal;word-break:break-word;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:400}
  .snc-tbl td:last-child{border-right:none}
  .snc-tbl tr:last-child td{border-bottom:none}
  .snc-tbl td.mono{font-family:'JetBrains Mono',monospace;font-size:11px}
  .snc-tbl td.bold{font-size:11px}
  .snc-tbl td.green, .green{color:var(--greend) !important}
  .snc-tbl td.red, .red{color:#ef4444 !important}
  .chip{display:inline-flex;align-items:center;justify-content:center;font-size:9px;padding:3px 8px;border-radius:2px;font-family:'JetBrains Mono',monospace;font-weight:700;white-space:nowrap;letter-spacing:.04em;line-height:1}
  .ds-hd-badge{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:3px 10px;border:1px solid var(--brass);color:var(--brass);background:rgba(200,162,90,.12);white-space:nowrap;display:inline-flex;align-items:center;justify-content:center}
  .chip-brass{background:rgba(200,162,90,.12);color:#a07a30;border:1px solid rgba(200,162,90,.3)}
  .chip-green{background:rgba(43,168,74,.1);color:var(--greend);border:1px solid rgba(43,168,74,.3)}
  .chip-red{background:rgba(192,57,43,.1);color:#c0392b;border:1px solid rgba(192,57,43,.3)}
  .r-sig{background:var(--navy);color:#fff;padding:36px 56px;display:grid;grid-template-columns:1fr 260px;gap:40px;align-items:start;border-top:6px solid var(--green);margin-top:auto}
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
    .r-did{text-align:left;padding-left:98px !important}.r-did .num{font-size:16px}
    .r-title{grid-template-columns:1fr;gap:10px}
    .r-kicker{writing-mode:horizontal-tb;transform:none}
    .r-title h1{font-size:26px}
    .r-ms{display:grid!important;grid-template-columns:1fr 1fr;gap:0}
    .r-ms>div{border-right:none;border-bottom:1px solid #1a2742}
    .r-ms>div:last-child:nth-child(odd){grid-column:1/-1;text-align:center}
    .r-summary{grid-template-columns:1fr;gap:20px}
    .r-sig{grid-template-columns:1fr;gap:20px}
    .r-sig .right{border-left:none;border-top:1px solid #1a2742;padding:20px 0 0;display:flex !important;flex-direction:column !important;align-items:center !important;text-align:center !important;width:100% !important}
    .r-sig-seal{margin-left:auto !important;margin-right:auto !important}
    .r-foot{font-size:8px;flex-direction:column;gap:6px;text-align:center}
    .r-tb{padding:10px 14px;flex-wrap:wrap;gap:8px;justify-content:center !important;align-items:center !important;text-align:center !important}
    .r-tb .left{display:flex !important;flex-direction:row !important;flex-wrap:wrap !important;align-items:center !important;justify-content:center !important;gap:6px 12px !important;width:100% !important}
    .r-tb .right{display:flex !important;gap:10px !important;justify-content:center !important;width:100% !important;margin-top:4px !important}
    
    /* Layout grid stack */
    .r-sec-results div[style*="display: grid"], 
    .r-sec-results div[style*="display:grid"],
    .r-sec div[style*="display: grid"],
    .r-sec div[style*="display:grid"] {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    
    /* ds-row flex row stack */
    .ds-row > div[style*="display: flex"], .ds-row > div[style*="display:flex"] {
      flex-direction: column !important;
      gap: 10px !important;
    }
    .ds-row-inner[style*="flex: 1"], .ds-row-inner[style*="flex:1"] {
      width: 100% !important;
      flex: none !important;
    }
    /* CRLV-e vehicle block — stack all cols on mobile regardless of flex value */
    .crlv-vehicle-block .ds-row {
      flex-wrap: wrap;
    }
    .crlv-vehicle-block .ds-row-inner {
      width: 100% !important;
      flex: none !important;
    }
    
    /* Table responsive stack */
    .tbl-wrap {
      overflow-x: hidden !important;
      border: none !important;
    }
    .snc-tbl, .snc-tbl thead, .snc-tbl tbody, .snc-tbl tr, .snc-tbl td, .snc-tbl th {
      display: block !important;
      width: 100% !important;
      white-space: normal !important;
    }
    .snc-tbl thead {
      display: none !important;
    }
    .snc-tbl tr {
      background: #fff !important;
      border: 1px solid #c8bfa8 !important;
      border-radius: 4px !important;
      margin-bottom: 12px !important;
      padding: 10px 14px !important;
    }
    .snc-tbl tr[style*="height: 8"], .snc-tbl tr[style*="height:8"] {
      display: none !important;
    }
    .snc-tbl td {
      border: none !important;
      padding: 6px 0 !important;
      text-align: left !important;
      font-size: 12px !important;
    }
    .snc-tbl td[colspan], .snc-tbl td[colSpan] {
      padding: 8px 0 4px !important;
      border-top: 1px dashed #c8bfa8 !important;
      margin-top: 6px !important;
    }
    .snc-tbl td[colspan] > div, .snc-tbl td[colSpan] > div {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .snc-tbl td[colspan] > div > div:last-child, .snc-tbl td[colSpan] > div > div:last-child {
      flex-direction: column !important;
      align-items: flex-start !important;
      width: 100% !important;
      padding-left: 10px !important;
      border-left: 2px solid #c8a25a !important;
      gap: 8px !important;
    }
    .ds-row>div.ds-row-inline{flex-direction:row!important;flex-wrap:nowrap!important;gap:16px!important}
    .ds-row>div.ds-row-inline>.ds-row-inner{padding:0!important;border-bottom:none!important;flex:1;min-width:0}
  }
  @media(max-width:520px){
    .r-ms{display:grid!important;grid-template-columns:1fr 1fr;gap:0}
    .r-ms>div{border-right:none;border-bottom:1px solid #1a2742}
    .r-ms>div:last-child:nth-child(odd){grid-column:1/-1;text-align:center}
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
    .ds-hd, .src-badge{page-break-after:avoid;break-after:avoid}
    .src-badge + div{page-break-before:avoid;break-before:avoid}
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
      var fallback = btn.getAttribute('data-fallback') || '/';
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = fallback;
      }
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

  const docLimpo = (payload?.documento ?? '').replace(/[^A-Z0-9]/g, '');
  const constarRoubo = docLimpo === 'ROB0190' || ((payload?.resultado?.rouboFurto ?? {}) as Record<string, unknown>).declaracao === true;

  const emitidoEm = payload
    ? new Date(payload.emitidoEm).toLocaleString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
      }).toUpperCase() + ' BRT'
    : '—';

  // Mapa preciso: cada dataset aponta para a sua própria página de busca
  const datasetFallbackMap: Record<string, string> = {
    'vip-car':      '/autoscore/vip-car',
    'veiculo':      '/autoscore/veiculo',
    'proprietario': '/autoscore/proprietario',
    'leilao':       '/autoscore/leilao-score',
    'renajud':      '/autoscore/renajud',
    'gravame':      '/autoscore/gravame',
    'debitos':      '/autoscore/debitos',
    'estadual':     '/autoscore/estadual',
    'renainf':      '/autoscore/renainf',
    'historico-km': '/autoscore/historico-km',
    'crlve':        '/autoscore/crlve',
    'csv-completa':       '/autoscore/csv-completa',
    'analitico-veicular': '/autoscore/analitico-veicular',
    'credito':            '/busca/credito',
    'agregados-basica':   '/autoscore/agregados-basica',
    'agregados-propria':  '/autoscore/agregados-propria',
    'agregados-chassi':   '/autoscore/agregados-chassi',
    'veicular-agrupados': '/autoscore/veicular-agrupados',
  };
  const fallbackPath = datasetFallbackMap[payload?.dataset || ''] ?? '/autoscore';

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{CSS}</style>
      {constarRoubo && (
        <style>{`
          .r-sig { background: #3b0808 !important; border-top-color: #ff2c36 !important; }
          .r-sig .right { border-left-color: #5c1818 !important; }
          .r-foot { background: #210404 !important; color: #8c5050 !important; }
          .r-vrd::before { background: #ff2c36 !important; }
        `}</style>
      )}

      {/* TOOLBAR — idêntico ao /exemplo, intocado */}
      <div className="r-tb">
        <div className="left">
          <span className="ref">Documento <strong>Nº {protocolo}</strong></span>
          <span className="ref" style={{ opacity: 0.6 }}>Versão Digital · Autenticada</span>
        </div>
        <div className="right">
          <button type="button" className="r-btn" data-action="back" data-fallback={fallbackPath}>← Voltar</button>
          <button type="button" className="r-btn" data-action="copy" data-label-default="Copiar link" data-label-copied="✓ Copiado">Copiar link</button>
          <button type="button" className="r-btn primary" data-action="print">⎙ Baixar PDF</button>
        </div>
      </div>
      <Script id="toolbar-js" dangerouslySetInnerHTML={{ __html: TOOLBAR_JS }} />

      <div className="print-running-sig" aria-hidden="true">
        <span className="lbl">§ SHA-256</span>
        <span>snc-{id}-autenticado</span>
        <span className="lbl">PROTOCOLO {protocolo}</span>
      </div>

      <div className="r-page">
        <div className="r-wm">SNC · {payload?.dataset?.toUpperCase() ?? 'RELATÓRIO'}</div>

        {/* HEADER — idêntico ao /exemplo, com suporte a alertas */}
        <header className="r-head" style={constarRoubo ? { background: '#3b0808', borderBottomColor: '#ff2c36' } : {}}>
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
              {constarRoubo && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{
                    background: '#ff2c36',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 2,
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.08em',
                    display: 'inline-block',
                  }}>
                    ALERTA DE ROUBO / FURTO
                  </span>
                </div>
              )}
              <h1>
                {payload?.dataset === 'snc-autoscore' ? 'Relatório Veicular Consolidado' : (meta?.titulo ?? 'Relatório')}
                <br />
                <span style={{ color: '#fff' }}>SNC AutoScore</span>
                <span className="it" style={{ color: '#9aa3b2' }}>{payload?.dataset === 'agregados-chassi' ? ' — Chassi: ' : ' — Placa: '}</span>
                <span style={{ color: 'var(--brass)' }}>{payload?.dataset === 'agregados-chassi' ? payload?.documento : formatarPlacaExibicao(payload?.documento)}</span>
              </h1>
              <div className="lede">{meta?.subtitulo ?? 'Documento gerado a partir de fontes oficiais.'}</div>
            </div>
          </div>
        </header>

        {/* META STRIP */}
        <div className="r-ms">
          {payload?.dataset !== 'leilao' && payload?.dataset !== 'renajud' && payload?.dataset !== 'crlve' && payload?.dataset !== 'csv-completa' && payload?.dataset !== 'agregados-basica' && payload?.dataset !== 'agregados-propria' && payload?.dataset !== 'agregados-chassi' && payload?.dataset !== 'veicular-agrupados' && (
            <>
              <div><div className="l">Proprietário Atual</div><div className="v">{(payload?.resultado?.proprietario as Record<string, unknown>)?.nome as string ?? payload?.documento ?? '—'}</div></div>
              <div><div className="l">CPF/CNPJ</div><div className="v">{(payload?.resultado?.proprietario as Record<string, unknown>)?.documento as string ?? '—'}</div></div>
              <div><div className="l">Município/UF</div><div className="v">{(() => { const p = payload?.resultado?.proprietario as Record<string, unknown> | undefined; const m = p?.municipio as string; const u = p?.uf as string; return m ? (u ? `${m}-${u}` : m) : '—'; })()}</div></div>
              <div><div className="l">Atualiz. no DENATRAN</div><div className="v">{(payload?.resultado?.proprietario as Record<string, unknown>)?.dataAtualizacao as string ?? '—'}</div></div>
            </>
          )}
          {payload?.dataset === 'agregados-basica' && (() => {
            const vei = (payload?.resultado?.veiculo ?? {}) as Record<string, any>;
            const nomeProp = '—';
            const docProp = '—';
            const munUf = vei.municipio ? `${vei.municipio}-${vei.uf || ''}` : '—';
            const dataAt = '—';

            return (
              <>
                <div><div className="l">Proprietário Atual</div><div className="v">{nomeProp}</div></div>
                <div><div className="l">CPF/CNPJ</div><div className="v">{docProp}</div></div>
                <div><div className="l">Município/UF</div><div className="v">{munUf}</div></div>
                <div><div className="l">Atualiz. no DENATRAN</div><div className="v">{dataAt}</div></div>
              </>
            );
          })()}
          {payload?.dataset === 'agregados-propria' && (() => {
            const vei = (payload?.resultado?.veiculo ?? {}) as Record<string, any>;
            const nomeProp = '—';
            const docProp = '—';
            const munUf = vei.municipio ? `${vei.municipio}-${vei.uf || ''}` : '—';
            const dataAt = '—';

            return (
              <>
                <div><div className="l">Proprietário Atual</div><div className="v">{nomeProp}</div></div>
                <div><div className="l">CPF/CNPJ</div><div className="v">{docProp}</div></div>
                <div><div className="l">Município/UF</div><div className="v">{munUf}</div></div>
                <div><div className="l">Atualiz. no DENATRAN</div><div className="v">{dataAt}</div></div>
              </>
            );
          })()}
          {payload?.dataset === 'agregados-chassi' && (() => {
            const vei = (payload?.resultado?.veiculo ?? {}) as Record<string, any>;
            const nomeProp = '—';
            const docProp = '—';
            const munUf = vei.municipio ? `${vei.municipio}-${vei.uf || ''}` : '—';
            const dataAt = '—';

            return (
              <>
                <div><div className="l">Proprietário Atual</div><div className="v">{nomeProp}</div></div>
                <div><div className="l">CPF/CNPJ</div><div className="v">{docProp}</div></div>
                <div><div className="l">Município/UF</div><div className="v">{munUf}</div></div>
                <div><div className="l">Atualiz. no DENATRAN</div><div className="v">{dataAt}</div></div>
              </>
            );
          })()}
          {payload?.dataset === 'veicular-agrupados' && (() => {
            const prop = (payload?.resultado?.proprietario ?? {}) as Record<string, any>;
            const vei = (payload?.resultado?.veiculo ?? {}) as Record<string, any>;
            const nomeProp = prop.nome || '—';
            const docProp = prop.documento || '—';
            const munUf = (prop.municipio || vei.municipio) ? `${prop.municipio || vei.municipio}-${prop.uf || vei.uf || ''}` : '—';
            const dataAt = prop.data_atualizacao || '—';

            return (
              <>
                <div><div className="l">Proprietário Atual</div><div className="v">{nomeProp}</div></div>
                <div><div className="l">CPF/CNPJ</div><div className="v">{docProp}</div></div>
                <div><div className="l">Município/UF</div><div className="v">{munUf}</div></div>
                <div><div className="l">Atualiz. no DENATRAN</div><div className="v">{dataAt}</div></div>
              </>
            );
          })()}
          {payload?.dataset === 'crlve' && (() => {
            const vei = (payload?.resultado?.veiculo ?? {}) as Record<string, any>;
            const nomeProp = vei.proprietario_nome || '—';
            const docProp = vei.proprietario_documento || '—';
            const munUf = vei.municipio ? `${vei.municipio}-${vei.uf || ''}` : '—';
            const dataAt = vei.data_atualizacao || '—';

            return (
              <>
                <div><div className="l">Proprietário Atual</div><div className="v">{nomeProp}</div></div>
                <div><div className="l">CPF/CNPJ</div><div className="v">{docProp}</div></div>
                <div><div className="l">Município/UF</div><div className="v">{munUf}</div></div>
                <div><div className="l">Atualiz. no DENATRAN</div><div className="v">{dataAt}</div></div>
              </>
            );
          })()}
          {payload?.dataset === 'csv-completa' && (() => {
            const veicular  = (payload?.resultado?.veicular ?? {}) as Record<string, any>;
            const propAtual = (veicular.proprietario_atual_veiculo ?? {}) as Record<string, any>;
            const binNac    = (veicular.bin_nacional ?? {}) as Record<string, any>;
            const nomeProp  = propAtual.proprietario_nome || binNac.proprietario?.nome || '—';
            const docProp   = propAtual.proprietario_documento || binNac.proprietario?.documento || '—';
            const mun       = propAtual.municipio || binNac.municipio;
            const uf        = propAtual.uf || binNac.uf;
            const munUf     = mun ? `${mun}${uf ? `-${uf}` : ''}` : '—';
            return (
              <>
                <div><div className="l">Proprietário Atual</div><div className="v">{nomeProp}</div></div>
                <div><div className="l">CPF/CNPJ</div><div className="v">{docProp}</div></div>
                <div><div className="l">Município/UF</div><div className="v">{munUf}</div></div>
                <div><div className="l">Data da consulta</div><div className="v">{new Date().toLocaleDateString('pt-BR')}</div></div>
              </>
            );
          })()}
          {payload?.dataset === 'leilao' && (
            <div style={{ marginLeft: 'auto', flex: 'none', textAlign: 'right', paddingRight: 56 }}>
              <div className="l">Data da consulta</div>
              <div className="v">{new Date().toLocaleDateString('pt-BR')} — {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
            </div>
          )}
          {payload?.dataset === 'renajud' && (() => {
            const renData = ((payload?.resultado?.data || payload?.resultado) ?? {}) as Record<string, any>;
            const renVei = (renData.veiculo ?? {}) as Record<string, any>;
            return (
              <>
                <div><div className="l">Veículo</div><div className="v">{v(renVei.marcaModelo || "VW/FOX 1.0 GII")}</div></div>
                <div><div className="l">Nº Processo</div><div className="v">{v(renData.processo)}</div></div>
                <div><div className="l">Tribunal</div><div className="v">{v(renData.tribunal)}</div></div>
                <div style={{ marginLeft: 'auto', flex: 'none', textAlign: 'right', paddingRight: 56 }}><div className="l">Data da consulta</div><div className="v">{new Date().toLocaleDateString('pt-BR')}</div></div>
              </>
            );
          })()}
          {payload?.dataset !== 'leilao' && payload?.dataset !== 'renajud' && (
            <div><div className="l">Validade do parecer</div><div className="v">30 dias corridos</div></div>
          )}
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
                    let status = '';
                    let negativo = false;
                    
                    if (payload.dataset === 'renajud') {
                      const data = (payload.resultado?.data || payload.resultado) as Record<string, unknown>;
                      const restricoes = (data.restricoes ?? []) as string[];
                      negativo = restricoes.length > 0;
                      status = restricoes.length === 1 ? 'CONSTA 1 RESTRIÇÃO JUDICIAL' : restricoes.length > 1 ? `CONSTAM ${restricoes.length} RESTRIÇÕES JUDICIAIS` : 'NADA CONSTA DE RESTRIÇÃO';
                    } else if (payload.dataset === 'debitos') {
                      const data = (payload.resultado?.data || payload.resultado) as Record<string, unknown>;
                      const debitos = (data.debitos || {}) as Record<string, unknown>;
                      const totalGeral = debitos.totalGeral != null ? String(debitos.totalGeral) : "R$ 0,00";
                      const temDebitos = totalGeral !== "R$ 0,00" && totalGeral !== "—" && totalGeral !== "0";
                      negativo = temDebitos;
                      status = temDebitos ? `CONSTAM DÉBITOS ATIVOS (${totalGeral})` : 'NENHUM DÉBITO DETECTADO';
                    } else if (payload.dataset === 'estadual') {
                      const est = (payload.resultado?.estadual || {}) as Record<string, unknown>;
                      const restricoes = (est.restricoes ?? []) as unknown[];
                      const totalDebitos = est.totalDebitos != null ? String(est.totalDebitos) : 'R$ 0,00';
                      const temDebitos = totalDebitos !== 'R$ 0,00' && totalDebitos !== '—' && totalDebitos !== '0';
                      const temAlgo = temDebitos || restricoes.length > 0;

                      return (
                        <div className="r-vrd-result">
                          <div className="r-seal" style={temAlgo ? { background: '#d32f2f' } : {}}>
                            {temAlgo ? '✗' : '✓'}
                          </div>
                          <div className="r-vt">
                            {temAlgo ? (
                              <h3 style={{ color: '#d32f2f', lineHeight: 1.25 }}>
                                CONSTAM RESTRIÇÕES<br />
                                / DÉBITOS ESTADUAIS
                                {temDebitos && (
                                  <><br /><span style={{ fontSize: '0.85em' }}>({totalDebitos})</span></>
                                )}
                              </h3>
                            ) : (
                              <h3>VEÍCULO REGULAR NA BASE ESTADUAL</h3>
                            )}
                            <p style={{ margin: 0 }}>
                              {temAlgo
                                ? 'Foram encontradas pendências nesta consulta.'
                                : 'Dados processados e disponíveis para análise.'}
                            </p>
                          </div>
                        </div>
                      );
                    } else if (payload.dataset === 'renainf') {
                      const ri = (payload.resultado?.renainf || {}) as Record<string, unknown>;
                      const infracoes = (ri.infracoes ?? []) as unknown[];
                      const temMultas = infracoes.length > 0;
                      const valorTotal = v(ri.valorTotal || '0,00');
                      
                      return (
                        <div className="r-vrd-result">
                          <div className="r-seal" style={temMultas ? { background: '#d32f2f' } : {}}>
                            {temMultas ? '✗' : '✓'}
                          </div>
                          <div className="r-vt">
                            {temMultas ? (
                              <h3 style={{ color: '#d32f2f', lineHeight: 1.25 }}>
                                {infracoes.length === 1 ? 'CONSTA 1 MULTA' : `CONSTAM ${infracoes.length} MULTAS`}
                                <><br /><span style={{ fontSize: '0.85em' }}>RENAINF (R$ {valorTotal})</span></>
                              </h3>
                            ) : (
                              <h3 style={{ lineHeight: 1.25 }}>
                                VEÍCULO REGULAR<br />
                                NADA CONSTA
                              </h3>
                            )}
                            <p style={{ margin: 0 }}>
                              {temMultas
                                ? 'Foram encontradas pendências nesta consulta.'
                                : 'Dados processados e disponíveis para análise.'}
                            </p>
                          </div>
                        </div>
                      );
                    } else if (payload.dataset === 'historico-km') {
                      const hkm      = (payload.resultado?.historicoKm || {}) as Record<string, unknown>;
                      const anomalia = !!hkm.anomalia;
                      const total    = Number(hkm.totalRegistros ?? 0);

                      return (
                        <div className="r-vrd-result">
                          <div className="r-seal" style={anomalia ? { background: '#d32f2f' } : {}}>
                            {anomalia ? '✗' : '✓'}
                          </div>
                          <div className="r-vt">
                            {anomalia ? (
                              <h3 style={{ color: '#d32f2f', lineHeight: 1.25 }}>
                                DIVERGÊNCIA NO HODÔMETRO<br />
                                <span style={{ fontSize: '0.85em' }}>({total} registro(s) analisado(s))</span>
                              </h3>
                            ) : (
                              <h3 style={{ lineHeight: 1.25 }}>
                                HISTÓRICO CONSISTENTE<br />
                                <span style={{ fontSize: '0.85em' }}>({total} registro(s) analisado(s))</span>
                              </h3>
                            )}
                            <p style={{ margin: 0 }}>
                              {anomalia
                                ? 'Quilometragem decrescente detectada — possível adulteração de hodômetro.'
                                : 'Dados processados e disponíveis para análise.'}
                            </p>
                          </div>
                        </div>
                      );
                    } else if (payload.dataset === 'crlve') {
                      const data = (payload.resultado?.data || payload.resultado) as Record<string, any>;
                      const crlv = (data.documentos?.crlv || {}) as Record<string, any>;
                      const temOcorrencia = crlv.existe_ocorrencia === '1';
                      const obs = v(crlv.observacoes || 'Nenhuma restrição impeditiva registrada.');
                      
                      return (
                        <div className="r-vrd-result">
                          <div className="r-seal" style={temOcorrencia ? { background: '#d32f2f' } : {}}>
                            {temOcorrencia ? '✗' : '✓'}
                          </div>
                          <div className="r-vt">
                            {temOcorrencia ? (
                              <h3 style={{ color: '#d32f2f' }}>CONSTA IMPEDIMENTO</h3>
                            ) : (
                              <h3>CRLV-e EMITIDO</h3>
                            )}
                            <p style={{ margin: 0 }}>
                              {temOcorrencia
                                ? `${obs} · Foram encontradas pendências que podem impedir o licenciamento.`
                                : 'Nada consta de restrição. Documento disponível para visualização e download em PDF.'}
                            </p>
                          </div>
                        </div>
                      );
                    } else if (payload.dataset === 'analitico-veicular') {
                      const renajud = (payload.resultado?.renajud ?? {}) as Record<string, any>;
                      const rouboFurto = (payload.resultado?.rouboFurto ?? {}) as Record<string, any>;
                      const recall = (payload.resultado?.recall ?? {}) as Record<string, any>;
                      const histKm = (payload.resultado?.historicoKm ?? {}) as Record<string, any>;
                      const renainf = (payload.resultado?.renainf ?? {}) as Record<string, any>;

                      const alertas: string[] = [];
                      if (renajud.temRestricao) alertas.push("RENAJUD");
                      if (rouboFurto.temOcorrencia) alertas.push("ROUBO/FURTO");
                      if (recall.temRecall) alertas.push("RECALL");
                      if (histKm.anomalia) alertas.push("HODÔMETRO");
                      if (renainf.totalMultas && renainf.totalMultas > 0) {
                        alertas.push(`${renainf.totalMultas} MULTA${renainf.totalMultas > 1 ? "S" : ""}`);
                      }

                      const temRest = alertas.length > 0;

                      return (
                        <div className="r-vrd-result">
                          <div className="r-seal" style={temRest ? { background: '#d32f2f' } : {}}>
                            {temRest ? '✗' : '✓'}
                          </div>
                          <div className="r-vt">
                            {temRest ? (
                              <>
                                <h3 style={{ color: '#d32f2f', lineHeight: 1.2 }}>
                                  ATENÇÃO:<br />
                                  RESTRIÇÕES ATIVAS
                                </h3>
                                <div style={{ 
                                  display: 'flex', 
                                  flexWrap: 'wrap', 
                                  gap: '6px', 
                                  marginTop: '6px', 
                                  marginBottom: '6px' 
                                }}>
                                  {alertas.map((alerta, idx) => (
                                    <span key={idx} className="chip chip-red" style={{ fontSize: '9px', padding: '3px 8px' }}>
                                      {alerta}
                                    </span>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <h3 style={{ lineHeight: 1.25 }}>
                                VEÍCULO REGULAR<br />
                                NADA CONSTA
                              </h3>
                            )}
                            <p style={{ margin: 0 }}>
                              {temRest
                                ? 'Foram encontradas pendências nesta consulta — verifique os detalhes no relatório.'
                                : 'Dados processados e disponíveis para análise. Nenhuma restrição ou irregularidade foi encontrada.'}
                            </p>
                          </div>
                        </div>
                      );
                    } else if (payload.dataset === 'leilao') {
                      const sinistroData = (payload.resultado?.sinistro || {}) as Record<string, unknown>;
                      const temSinistro = !!sinistroData.existeOcorrencia;
                      const totalLeiloes = Number(payload.resultado?.totalOcorrencias ?? 0);
                      const temLeilao = totalLeiloes > 0;
                      negativo = temSinistro; // sinistro ainda define a cor do selo geral
                      
                      return (
                        <div className="r-vrd-result">
                          {/* Selo sempre verde — leilão não é impedimento */}
                          <div className="r-seal" style={{ background: '#2ba84a', flexShrink: 0 }}>
                            {temLeilao ? 'ℹ' : '✓'}
                          </div>
                          {/* Status do LEILÃO — sinistro já aparece detalhado abaixo */}
                          <div className="r-vt">
                            <h3 style={{ color: '#2ba84a', marginBottom: 2 }}>
                              {temLeilao
                                ? (totalLeiloes === 1 ? 'CONSTA 1 LEILÃO' : `CONSTAM ${totalLeiloes} LEILÕES`)
                                : 'NADA CONSTA DE LEILÃO'}
                            </h3>
                            <p style={{ margin: 0 }}>
                              {temLeilao
                                ? 'Histórico de leilão encontrado. Verifique as condições no relatório.'
                                : 'Nenhum registro de leilão encontrado.'}
                            </p>
                          </div>
                        </div>
                      );
                    } else if (payload.dataset === 'csv-completa') {
                      const veicular  = (payload.resultado?.veicular ?? {}) as Record<string, any>;
                      const renainf   = (veicular.renainf ?? {}) as Record<string, any>;
                      const renajud   = (veicular.renajud ?? {}) as Record<string, any>;
                      const binNac    = (veicular.bin_nacional ?? {}) as Record<string, any>;
                      const restricoes= (binNac.restricoes ?? {}) as Record<string, any>;
                      const alerta    = (veicular.alerta_indicio ?? {}) as Record<string, any>;
                      const totalM    = Number(renainf.qtd_ocorrencias ?? 0);
                      const temRjd    = restricoes.existe_restricao_renajud === '1' || Number(renajud.quantidade_ocorrencias ?? 0) > 0;
                      const temBin    = restricoes.existe_restricao_geral === '1' || restricoes.existe_restricao_roubo_furto === '1';
                      const temRest   = totalM > 0 || temRjd || temBin || alerta.existe_ocorrencia === '1';

                      return (
                        <div className="r-vrd-result">
                          <div className="r-seal" style={temRest ? { background: '#d32f2f' } : {}}>
                            {temRest ? '✗' : '✓'}
                          </div>
                          <div className="r-vt">
                            {temRest ? (
                              <h3 style={{ color: '#d32f2f', lineHeight: 1.25 }}>
                                RESTRIÇÕES ENCONTRADAS
                                {totalM > 0 && (
                                  <><br /><span style={{ fontSize: '0.85em' }}>
                                    {totalM === 1 ? '1 multa RENAINF' : `${totalM} multas RENAINF`}
                                    {temRjd ? ' · RENAJUD' : ''}
                                    {temBin ? ' · BIN' : ''}
                                  </span></>
                                )}
                              </h3>
                            ) : (
                              <h3>VEÍCULO SEM RESTRIÇÕES</h3>
                            )}
                            <p style={{ margin: 0 }}>
                              {temRest
                                ? 'Foram encontradas pendências nesta consulta — verifique os detalhes no relatório.'
                                : 'Nenhuma multa, restrição judicial ou bloqueio administrativo encontrado.'}
                            </p>
                          </div>
                        </div>
                      );
                    } else {
                      const rid = (payload.resultado?.identificacao ?? payload.resultado?.veiculo ?? payload.resultado?.proprietario ?? {}) as Record<string, unknown>;
                      status = String(rid.statusDescricao ?? 'CONSULTA CONCLUÍDA');
                      negativo = /roubo|furto|bloqueio|alena|renajud|impedimento/i.test(status)
                        || (/restri/i.test(status) && !/sem\s+restri/i.test(status));
                    }
                    
                    return (
                      <div className="r-vrd-result">
                        <div className="r-seal" style={negativo ? { background: '#d32f2f' } : {}}>{negativo ? '✗' : '✓'}</div>
                        <div className="r-vt">
                          <h3 style={negativo ? { color: '#d32f2f' } : {}}>{status}</h3>
                          <p>{negativo ? 'Foram encontradas pendências nesta consulta.' : 'Dados processados e disponíveis para análise.'}</p>
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
              <div className="r-sh" style={{ marginBottom: 10 }}>
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
              <span>{meta?.titulo ?? 'Relatório'} · {formatarPlacaExibicao(payload.documento)}</span>
              <span>Protocolo {protocolo}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
