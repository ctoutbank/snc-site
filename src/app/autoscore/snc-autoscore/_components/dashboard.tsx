"use client";

/* dashboard.tsx — Resultado da consulta.
   mode="relatorio" → ReportTabular (tabelas) · mode="painel" → cards + gráficos.
   Ícones neutros (sem cor), sem verde; vermelho só para pendências. */
import { Icon } from "./icons";
import { Eyebrow, Bloco, Badge, DataRow, StatusPill, MetricChip } from "./primitives";
import { ScoreGauge, BreakdownBar, LineChart } from "./charts";
import { ModeToggle, ParecerBanner, ReportTabular, type Mode } from "./report";
import type { VehicleReport } from "../_data/types";

export function scoreColor(v: number, accentHex?: string): string {
  return v >= 70 ? accentHex || "#D4A843" : "#E5484D";
}

const OK = "#cfd6df";
const BAD = "#E5484D";
const NEU = "#8a94a3";

function Footer({ d }: { d: VehicleReport }) {
  return (
    <footer
      style={{
        marginTop: 22,
        paddingTop: 16,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        fontFamily: "var(--mono)",
        fontSize: 8.5,
        letterSpacing: "0.1em",
        color: "#3e4c5c",
        textTransform: "uppercase",
      }}
    >
      <span>SNC · Sistema Nacional de Conformidade · Fontes: B3 · SENATRAN · DETRAN · CNJ</span>
      <span>Dados 100% fictícios para demonstração · {d.protocolo}</span>
    </footer>
  );
}

export function Dashboard({
  data: d,
  accent,
  mode,
  setMode,
}: {
  data: VehicleReport;
  accent?: string;
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const accentHex = accent || "#D4A843";
  const sc = scoreColor(d.score.valor, accentHex);
  const temDeb = d.debitos.total > 0;

  const maxDeb = Math.max(d.debitos.ipva, d.debitos.multas, d.debitos.licenciamento, d.debitos.dpvat, 1);
  const kmPts = d.historicoKm.map((r) => ({ v: r.km, label: r.data.slice(0, 5) }));
  const anomalyIdx = d.odometro.anomalia
    ? d.historicoKm.reduce((acc, r, i, arr) => (i > 0 && r.km < arr[i - 1].km ? i : acc), -1)
    : -1;
  const fipePts = d.fipeHistorico.map((h) => ({ v: h.valor, label: h.mes.slice(0, 3) }));

  const Header = (
    <div className="cockpit-head">
      <div style={{ minWidth: 0 }}>
        <Eyebrow>Relatório Veicular · Super-Consulta Integrada</Eyebrow>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: 44,
            color: "#fff",
            margin: "12px 0 0",
            lineHeight: 1.0,
            letterSpacing: "-0.01em",
          }}
        >
          {d.identificacao.marcaModelo.replace("/", " · ")}
        </h1>
        <div
          style={{
            display: "flex",
            gap: 18,
            marginTop: 14,
            flexWrap: "wrap",
            fontFamily: "var(--mono)",
            fontSize: 10.5,
            color: "#8a94a3",
            letterSpacing: "0.06em",
          }}
        >
          <span style={{ color: "var(--accent)" }}>{d.identificacao.placa}</span>
          <span>
            {d.identificacao.anoFab}/{d.identificacao.anoMod}
          </span>
          <span>{d.identificacao.cor}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="pin" size={12} style={{ color: NEU }} />
            {d.identificacao.municipio} · {d.identificacao.uf}
          </span>
        </div>
      </div>
      <ModeToggle value={mode} onChange={setMode} />
    </div>
  );

  if (mode === "relatorio") {
    return (
      <div className="cockpit-main">
        {Header}
        <ReportTabular data={d} />
        <Footer d={d} />
      </div>
    );
  }

  return (
    <div className="cockpit-main">
      {Header}
      <ParecerBanner data={d} />

      <div className="cockpit-grid">
        {/* LEFT COLUMN */}
        <div className="col col-left">
          <div className="row-gauge">
            {/* hero gauge */}
            <Bloco style={{ minWidth: 0 }} glow={sc}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 4,
                }}
              >
                <Eyebrow>SNC AutoScore</Eyebrow>
                <Badge tone={d.score.valor >= 70 ? "neutral" : "bad"} solid>
                  GRAU {d.score.grau}
                </Badge>
              </div>
              <ScoreGauge value={d.score.valor} grade={d.score.grau} color={sc} />
              <div style={{ textAlign: "center", marginTop: 2 }}>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: sc,
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  {d.score.rotulo}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 22, marginTop: 14 }}>
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: "#fff", fontWeight: 600 }}>
                      {d.score.aceitacao}%
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 7.5,
                        color: "#5a6a7a",
                        letterSpacing: "0.1em",
                        marginTop: 3,
                      }}
                    >
                      ACEITAÇÃO
                    </div>
                  </div>
                  <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: "#fff", fontWeight: 600 }}>
                      {d.score.sobreFipe}%
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 7.5,
                        color: "#5a6a7a",
                        letterSpacing: "0.1em",
                        marginTop: 3,
                      }}
                    >
                      SOBRE FIPE
                    </div>
                  </div>
                </div>
              </div>
            </Bloco>

            {/* situação + metric trio */}
            <Bloco title="Situação Cadastral do Veículo">
              <div className="pill-grid">
                <StatusPill
                  icon="shield"
                  label="Roubo / Furto"
                  ok={!d.rouboFurto.declaracao}
                  okText="Nada Consta"
                  badText="Bloqueio Ativo"
                />
                <StatusPill
                  icon="gavel"
                  label="RENAJUD"
                  ok={!d.renajud.temRestricao}
                  okText="Sem Restrição"
                  badText="Penhora · Circulação"
                />
                <StatusPill
                  icon="coins"
                  label="Gravame"
                  ok={!d.gravame.financiamento}
                  okText="Sem Gravame"
                  badText="Financiado Ativo"
                />
                <StatusPill
                  icon="gavel"
                  label="Leilão"
                  ok={d.leilao.total === 0}
                  okText="Nunca Leiloado"
                  badText={`${d.leilao.total} Ocorrência${d.leilao.total !== 1 ? "s" : ""}`}
                />
              </div>
              <div className="metric-trio">
                <MetricChip icon="coins" value={d.fipe.valorFmt} caption={`FIPE · ${d.fipe.referencia}`} tone={OK} />
                <MetricChip icon="alert" value={d.debitos.totalFmt} caption="Débitos DETRAN" tone={temDeb ? BAD : OK} />
                <MetricChip
                  icon="bolt"
                  value={d.renainf.total}
                  caption="Infrações RENAINF"
                  tone={d.renainf.total > 0 ? BAD : OK}
                />
              </div>
            </Bloco>
          </div>

          {/* débitos breakdown */}
          <Bloco
            title="Débitos DETRAN · Composição"
            right={<Badge tone={temDeb ? "bad" : "neutral"}>{temDeb ? "Pendências" : "Quitado"}</Badge>}
          >
            <div className="deb-layout">
              <div
                style={{
                  flexShrink: 0,
                  width: 150,
                  padding: "14px 18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 7.5,
                    color: "#5a6a7a",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Total · BRL
                </div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 26,
                    color: temDeb ? BAD : "#fff",
                    fontWeight: 700,
                    marginTop: 8,
                    lineHeight: 1,
                  }}
                >
                  {d.debitos.totalFmt.replace("R$ ", "")}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 8.5,
                    color: temDeb ? BAD : "#2BA84A",
                    letterSpacing: "0.06em",
                    marginTop: 10,
                  }}
                >
                  {temDeb ? "EM ABERTO" : "NADA CONSTA"}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <BreakdownBar
                  label="IPVA"
                  valueFmt={d.debitos.ipvaFmt}
                  frac={d.debitos.ipva / maxDeb}
                  color={d.debitos.ipva > 0 ? BAD : "rgba(255,255,255,0.18)"}
                />
                <BreakdownBar
                  label="Multas"
                  valueFmt={d.debitos.multasFmt}
                  frac={d.debitos.multas / maxDeb}
                  color={d.debitos.multas > 0 ? BAD : "rgba(255,255,255,0.18)"}
                />
                <BreakdownBar
                  label="Licenciamento"
                  valueFmt={d.debitos.licenciamentoFmt}
                  frac={d.debitos.licenciamento / maxDeb}
                  color={d.debitos.licenciamento > 0 ? BAD : "rgba(255,255,255,0.18)"}
                />
                <BreakdownBar
                  label="DPVAT"
                  valueFmt={d.debitos.dpvatFmt}
                  frac={d.debitos.dpvat / maxDeb}
                  color={d.debitos.dpvat > 0 ? BAD : "rgba(255,255,255,0.18)"}
                />
              </div>
            </div>
          </Bloco>

          {/* status tiles */}
          <div className="tile-grid">
            <Bloco style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Icon name="clock" size={18} style={{ color: NEU }} />
                {d.odometro.anomalia && <Badge tone="bad">Adulteração</Badge>}
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 26,
                  color: "#fff",
                  fontWeight: 700,
                  marginTop: 14,
                  lineHeight: 1,
                }}
              >
                {d.odometro.atual.toLocaleString("pt-BR")}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 8,
                  color: "#5a6a7a",
                  letterSpacing: "0.12em",
                  marginTop: 7,
                  textTransform: "uppercase",
                }}
              >
                Quilômetros · Odômetro
              </div>
            </Bloco>
            <Bloco style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Icon name="gavel" size={18} style={{ color: NEU }} />
                <Badge tone={d.leilao.grau === "A" || d.leilao.grau === "B" ? "neutral" : "bad"} solid>
                  {d.leilao.grau}
                </Badge>
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 26,
                  color: "#fff",
                  fontWeight: 700,
                  marginTop: 14,
                  lineHeight: 1,
                }}
              >
                {d.leilao.total}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 8,
                  color: "#5a6a7a",
                  letterSpacing: "0.12em",
                  marginTop: 7,
                  textTransform: "uppercase",
                }}
              >
                Registros de Leilão
              </div>
            </Bloco>
            <Bloco style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Icon name="alert" size={18} style={{ color: NEU }} />
                <Badge tone={d.recall.total > 0 ? "bad" : "neutral"}>{d.recall.total > 0 ? "Aberto" : "OK"}</Badge>
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 26,
                  color: "#fff",
                  fontWeight: 700,
                  marginTop: 14,
                  lineHeight: 1,
                }}
              >
                {d.recall.total}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 8,
                  color: "#5a6a7a",
                  letterSpacing: "0.12em",
                  marginTop: 7,
                  textTransform: "uppercase",
                }}
              >
                Recall · Sinistro
              </div>
            </Bloco>
          </div>

          {/* FIPE evolution */}
          <Bloco
            title="Precificação FIPE · Evolução 12 meses"
            right={<span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>{d.fipe.valorFmt}</span>}
          >
            <LineChart points={fipePts} color={accentHex} fmt={(v) => (v / 1000).toFixed(1) + "k"} />
            <div
              style={{
                display: "flex",
                gap: 22,
                marginTop: 6,
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: "#5a6a7a",
                letterSpacing: "0.06em",
                flexWrap: "wrap",
              }}
            >
              <span>
                CÓD. FIPE <span style={{ color: "#cfd6df" }}>{d.fipe.codigo}</span>
              </span>
              <span>
                MODELO <span style={{ color: "#cfd6df" }}>{d.fipe.modelo} {d.fipe.anoModelo}</span>
              </span>
              <span>
                REF. <span style={{ color: "#cfd6df" }}>{d.fipe.referencia}</span>
              </span>
            </div>
          </Bloco>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col col-right">
          {/* resumo / summary */}
          <Bloco title="Resumo da Consulta">
            <DataRow label="Documento" value={d.identificacao.placa} />
            <DataRow label="Proprietário" value={d.proprietario.nome} mono={false} />
            <DataRow label="Renavam" value={d.identificacao.renavam} />
            <DataRow label="Chassi" value={d.identificacao.chassi} />
            <DataRow label="Emitido em" value={d.emitidoEm} />
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 8.5,
                    letterSpacing: "0.12em",
                    color: "#8a94a3",
                    textTransform: "uppercase",
                  }}
                >
                  Cobertura das Bases
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)" }}>6/6 · 100%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", overflow: "hidden", borderRadius: 3 }}>
                <div style={{ height: "100%", width: "100%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
                {["BIN/CSV", "Leilão", "DETRAN", "Hodômetro", "RENAINF", "FIPE"].map((b) => (
                  <span
                    key={b}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontFamily: "var(--mono)",
                      fontSize: 8.5,
                      letterSpacing: "0.06em",
                      color: "#a0aec0",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.03)",
                      padding: "4px 8px",
                      textTransform: "uppercase",
                    }}
                  >
                    <Icon name="check" size={10} style={{ color: NEU }} />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </Bloco>

          {/* histórico KM line chart */}
          <Bloco
            title="Histórico de Quilometragem"
            right={
              d.odometro.anomalia ? (
                <Badge tone="bad">
                  <Icon name="alert" size={10} />
                  Anomalia
                </Badge>
              ) : null
            }
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 30, color: "#fff", fontWeight: 700 }}>
                {d.odometro.atual.toLocaleString("pt-BR")}
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#8a94a3" }}>km · última leitura</span>
            </div>
            <LineChart
              points={kmPts}
              color={d.odometro.anomalia ? BAD : accentHex}
              anomalyIdx={anomalyIdx}
              fmt={(v) => (v / 1000).toFixed(1) + "k"}
            />
            <div
              style={{
                marginTop: 6,
                padding: "10px 12px",
                background: d.odometro.anomalia ? "rgba(229,72,77,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${d.odometro.anomalia ? "rgba(229,72,77,0.3)" : "rgba(255,255,255,0.1)"}`,
                borderLeft: `2px solid ${d.odometro.anomalia ? BAD : "var(--accent)"}`,
                fontFamily: "var(--mono)",
                fontSize: 9.5,
                color: d.odometro.anomalia ? "#f3b0b2" : "#a0aec0",
                lineHeight: 1.5,
                letterSpacing: "0.02em",
              }}
            >
              {d.odometro.motivo}
            </div>
          </Bloco>

          {/* proprietário + histórico */}
          <Bloco title="Proprietário & Histórico">
            <DataRow label="Atual" value={d.proprietario.nome} mono={false} />
            <DataRow label="Documento" value={d.proprietario.documento} />
            <DataRow label="Situação" value={d.proprietario.status} tone={d.cenario === "restrito" ? BAD : OK} />
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 8,
                letterSpacing: "0.12em",
                color: "#5a6a7a",
                textTransform: "uppercase",
                margin: "16px 0 8px",
              }}
            >
              Proprietários anteriores
            </div>
            {d.proprietariosAnteriores.map((p) => (
              <div
                key={p.nome}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--sans)",
                    fontSize: 12,
                    color: "#cfd6df",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.nome}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "#8a94a3", flexShrink: 0 }}>
                  {p.data}
                </span>
              </div>
            ))}
          </Bloco>
        </div>
      </div>

      <Footer d={d} />
    </div>
  );
}
