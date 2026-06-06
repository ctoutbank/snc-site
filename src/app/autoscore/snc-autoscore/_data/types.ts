/* types.ts — SNC AutoScore — TypeScript interfaces for the Relatório Veicular Consolidado.
   Extracted from the prototype (snc-data.ts). Types only — no mock data. */

export type ParecerTom = "ok" | "bad" | "warn";

export interface Parecer {
  status: string;
  tom: ParecerTom;
  titulo: string;
  resumo: string;
  recomendacao: string;
}

export interface Score {
  valor: number;
  grau: string;
  rotulo: string;
  aceitacao: number;
  sobreFipe: number;
  vistoria: string;
  indicioSinistro: boolean;
}

export interface Identificacao {
  marca: string;
  modelo: string;
  marcaModelo: string;
  crlv: string;
  chassi: string;
  renavam: string;
  anoFab: string;
  anoMod: string;
  cor: string;
  combustivel: string;
  motor: string;
  categoria: string;
  especieTipo: string;
  carroceria: string;
  capacidade: string;
  procedencia: string;
  potencia: string;
  cilindrada: string;
  eixos: string;
  pbt: string;
  emissaoCrlv: string;
  ultimoCrv: string;
  placa: string;
  municipio: string;
  uf: string;
}

export interface Proprietario {
  nome: string;
  documento: string;
  municipioUf: string;
  status: string;
  atualizacao: string;
}

export interface ProprietarioAnterior {
  nome: string;
  documento: string;
  municipioUf: string;
  data: string;
}

export interface RouboFurto {
  declaracao: boolean;
  devolucao: boolean;
  recuperacao: boolean;
}

export interface RestricoesBin {
  geral: boolean;
  sinistro: boolean;
  renajud: boolean;
  baixado: boolean;
  rouboFurto: boolean;
  mensagens: string[];
}

export interface Renajud {
  temRestricao: boolean;
  processo: string | null;
  tribunal: string | null;
  restricoes: string[];
}

export interface Gravame {
  situacao: string;
  financiamento: boolean;
  status: string;
  agente: string;
  contrato: string;
  inclusao: string;
}

export interface Debitos {
  multas: number;
  ipva: number;
  licenciamento: number;
  dpvat: number;
  outros: number;
  total: number;
  totalFmt: string;
  multasFmt: string;
  ipvaFmt: string;
  licenciamentoFmt: string;
  dpvatFmt: string;
  outrosFmt: string;
}

export interface Odometro {
  atual: number;
  anomalia: boolean;
  motivo: string;
}

export interface HistoricoKm {
  data: string;
  km: number;
  fonte: string;
  uf: string;
  consistencia: string;
}

export interface Fipe {
  codigo: string;
  modelo: string;
  anoModelo: string;
  informante: string;
  valor: number;
  valorFmt: string;
  referencia: string;
}

export interface FipePonto {
  mes: string;
  valor: number;
}

export interface RenainfInfracao {
  data: string;
  local: string;
  orgao: string;
  descricao: string;
  valor: string;
  situacao: string;
}

export interface Renainf {
  total: number;
  valorTotal: string;
  infracoes: RenainfInfracao[];
}

export interface LeilaoOcorrencia {
  data: string;
  leiloeiro: string;
  comitente: string;
  lote: string;
  condicao: string;
  uf: string;
}

export interface Leilao {
  grau: string;
  pontuacao: number;
  aceitacao: number;
  sobreFipe: number;
  vistoria: string;
  indicioSinistro: boolean;
  total: number;
  rotulo: string;
  ocorrencias: LeilaoOcorrencia[];
}

export interface Recall {
  total: number;
  reparado: boolean;
  descricao: string;
}

export interface Crlve {
  exercicio: string;
  ocorrencia: string;
  observacoes: string;
  status: string;
}

export interface VehicleReport {
  cenario: string;
  protocolo: string;
  reportId: string;
  hash: string;
  emitidoEm: string;
  parecer: Parecer;
  score: Score;
  identificacao: Identificacao;
  proprietario: Proprietario;
  proprietariosAnteriores: ProprietarioAnterior[];
  rouboFurto: RouboFurto;
  restricoesBin: RestricoesBin;
  renajud: Renajud;
  gravame: Gravame;
  debitos: Debitos;
  odometro: Odometro;
  historicoKm: HistoricoKm[];
  fipe: Fipe;
  fipeHistorico: FipePonto[];
  renainf: Renainf;
  leilao: Leilao;
  recall: Recall;
  crlve: Crlve;
}

export type Cenario = "limpo" | "restrito";
