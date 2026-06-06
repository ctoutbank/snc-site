"use client";

/* report.tsx — Resultado da consulta · versão RELATÓRIO (tabelas corridas).
   Ícones neutros, sem verde; vermelho só para pendências/dívidas, âmbar em títulos. */
import type { CSSProperties, ReactNode } from "react";
import { Icon, SncShield } from "./icons";
import type { VehicleReport } from "../_data/types";

export type Mode = "painel" | "relatorio";

/* toggle Painel / Relatório */
export function ModeToggle({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const opts: { id: Mode; label: string; icon: "grid" | "doc" }[] = [
    { id: "painel", label: "Painel", icon: "grid" },
    { id: "relatorio", label: "Relatório", icon: "doc" },
  ];
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 4,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        gap: 4,
      }}
    >
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              fontFamily: "var(--mono)",
              fontSize: 10.5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: on ? "#0A1628" : "#8a94a3",
              background: on ? "var(--accent)" : "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all .18s",
            }}
          >
            <Icon name={o.icon} size={14} /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* banner de parecer (ok = verde · bad = vermelho) */
export function ParecerBanner({ data }: { data: VehicleReport }) {
  const bad = data.parecer.tom === "bad";
  const c = bad ? "#E5484D" : "#2BA84A";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        padding: "18px 22px",
        marginBottom: 16,
        background: bad ? "rgba(229,72,77,0.08)" : "rgba(43,168,74,0.08)",
        border: `1px solid ${bad ? "rgba(229,72,77,0.35)" : "rgba(43,168,74,0.35)"}`,
        borderLeft: `3px solid ${c}`,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          display: "grid",
          placeItems: "center",
          color: c,
          border: `1px solid ${c}55`,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Icon name={bad ? "alert" : "check"} size={19} stroke={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: c,
            }}
          >
            {data.parecer.status}
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#5a6a7a", letterSpacing: "0.06em" }}>
            SCORE {data.score.valor} · GRAU {data.score.grau}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: 17,
            color: "#fff",
            margin: "8px 0 6px",
            lineHeight: 1.2,
          }}
        >
          {data.parecer.titulo}
        </div>
        <p style={{ fontFamily: "var(--sans)", fontSize: 12.5, color: "#a0aec0", lineHeight: 1.6, margin: 0 }}>
          {data.parecer.resumo}
        </p>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: c, marginTop: 8, letterSpacing: "0.04em" }}>
          ▸ {data.parecer.recomendacao}
        </div>
      </div>
    </div>
  );
}

/* ── primitivas de tabela ── */
type Align = "left" | "center" | "right";

function SecHead({ n, title, right }: { n?: string; title: ReactNode; right?: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: "color-mix(in srgb, var(--accent) 8%, rgba(255,255,255,0.015))",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        borderLeft: "2px solid var(--accent)",
      }}
    >
      {n && (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9,
            color: "#0A1628",
            background: "var(--accent)",
            padding: "2px 7px",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {n}
        </span>
      )}
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--accent)",
          flex: 1,
        }}
      >
        {title}
      </span>
      {right}
    </div>
  );
}

function Sec({
  n,
  title,
  right,
  children,
  span,
}: {
  n?: string;
  title: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  span?: boolean;
}) {
  return (
    <section
      className={span ? "rep-span" : ""}
      style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.015)" }}
    >
      <SecHead n={n} title={title} right={right} />
      <div>{children}</div>
    </section>
  );
}

/* grade chave/valor (zebra por faixa · cols configurável) */
type KVRow = [ReactNode, ReactNode] | [ReactNode, ReactNode, string];

function KVGrid({ rows, cols = 2 }: { rows: KVRow[]; cols?: 2 | 3 | 4 }) {
  return (
    <div className={"rep-kv kv" + cols}>
      {rows.map((row, i) => {
        const [k, v, tone] = row;
        const faixaPar = Math.floor(i / cols) % 2 === 0;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
              padding: "11px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              background: faixaPar ? "transparent" : "rgba(255,255,255,0.018)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 8,
                letterSpacing: "0.12em",
                color: "#5a6a7a",
                textTransform: "uppercase",
              }}
            >
              {k}
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 12,
                color: tone || "#e2e8f0",
                wordBreak: "break-word",
              }}
            >
              {v}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface Col {
  label: string;
  align?: Align;
}
interface CellObj {
  v: ReactNode;
  tone?: string;
  align?: Align;
}
type Cell = string | number | CellObj;

function isCellObj(c: Cell): c is CellObj {
  return typeof c === "object" && c !== null && "v" in c;
}

/* tabela com cabeçalho e linhas */
function Tbl({ cols, rows, widths }: { cols: Col[]; rows: Cell[][]; widths?: string }) {
  const grid = widths || cols.map(() => "1fr").join(" ");
  return (
    <div>
      <div
        className="rep-row"
        style={{
          gridTemplateColumns: grid,
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {cols.map((c, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--mono)",
              fontSize: 8,
              letterSpacing: "0.1em",
              color: "#5a6a7a",
              textTransform: "uppercase",
              textAlign: c.align || "left",
            }}
          >
            {c.label}
          </span>
        ))}
      </div>
      {rows.length === 0 ? (
        <div style={{ padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 10.5, color: "#5a6a7a" }}>
          Nada consta.
        </div>
      ) : (
        rows.map((r, ri) => (
          <div
            key={ri}
            className="rep-row"
            style={{
              gridTemplateColumns: grid,
              borderBottom: ri < rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              background: ri % 2 ? "rgba(255,255,255,0.025)" : "transparent",
            }}
          >
            {r.map((cell, ci) => {
              const obj = isCellObj(cell);
              const display = obj ? cell.v : cell;
              return (
                <span
                  key={ci}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    color: obj && cell.tone ? cell.tone : "#e2e8f0",
                    textAlign: cols[ci]?.align || "left",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={obj ? String(cell.v) : String(cell)}
                >
                  {display}
                </span>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

/* chip de status — contorno apenas (verde positivo · vermelho negativo) */
function Chip({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  const c = ok ? "#2BA84A" : "#E5484D";
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: 9,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: c,
        background: "transparent",
        border: `1px solid ${c}`,
        padding: "2px 8px",
        fontWeight: 700,
      }}
    >
      {ok ? okText : badText}
    </span>
  );
}

export function ReportTabular({ data: d }: { data: VehicleReport }) {
  const restr = d.cenario === "restrito";
  const monoRight: CSSProperties = { fontFamily: "var(--mono)" };
  const flags: [string, boolean][] = [
    ["Restrição Geral (BIN)", !d.restricoesBin.geral],
    ["Roubo / Furto", !d.rouboFurto.declaracao],
    ["RENAJUD (Judicial)", !d.renajud.temRestricao],
    ["Gravame Financeiro", !d.gravame.financiamento],
    ["Indício de Sinistro", !d.score.indicioSinistro],
    ["Baixa / Sucata", !d.restricoesBin.baixado],
  ];
  return (
    <div style={{ width: "100%" }}>
      {/* cabeçalho do documento */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
          padding: "0 2px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <SncShield size={38} />
          <div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 25, color: "#fff", margin: 0, lineHeight: 1.1 }}>
              Relatório Veicular Consolidado
            </h1>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: "0.14em",
                color: "#5a6a7a",
                textTransform: "uppercase",
                marginTop: 6,
              }}
            >
              SNC AutoScore · Super-Consulta Integrada
            </div>
          </div>
        </div>
        <div
          style={{
            textAlign: "right",
            fontFamily: "var(--mono)",
            fontSize: 9.5,
            color: "#8a94a3",
            lineHeight: 1.7,
          }}
        >
          <div>
            <span style={{ color: "#5a6a7a" }}>PROTOCOLO </span>
            <span style={{ color: "var(--accent)" }}>{d.protocolo}</span>
          </div>
          <div>
            <span style={{ color: "#5a6a7a" }}>EMITIDO EM </span>
            {d.emitidoEm}
          </div>
          <div>
            <span style={{ color: "#5a6a7a" }}>PLACA </span>
            <span style={{ color: "#fff", letterSpacing: "0.1em" }}>{d.identificacao.placa}</span>
          </div>
        </div>
      </div>

      <ParecerBanner data={d} />

      <div className="rep-grid">
        <Sec span n="01" title="Identificação do Veículo · BIN Nacional">
          <KVGrid
            cols={4}
            rows={[
              ["Placa", d.identificacao.placa],
              ["Marca / Modelo", d.identificacao.marcaModelo],
              ["Ano Fab / Modelo", `${d.identificacao.anoFab} / ${d.identificacao.anoMod}`],
              ["Cor", d.identificacao.cor],
              ["Chassi", d.identificacao.chassi],
              ["RENAVAM", d.identificacao.renavam],
              ["Motor", d.identificacao.motor],
              ["Combustível", d.identificacao.combustivel],
              ["Espécie / Tipo", d.identificacao.especieTipo],
              ["Carroceria", d.identificacao.carroceria],
              ["Potência / Cilindrada", `${d.identificacao.potencia} · ${d.identificacao.cilindrada} cm³`],
              ["Procedência", d.identificacao.procedencia],
              ["Município / UF", `${d.identificacao.municipio} / ${d.identificacao.uf}`],
              ["CRLV", d.identificacao.crlv],
            ]}
          />
        </Sec>

        <Sec n="02" title="Proprietário Atual">
          <KVGrid
            rows={[
              ["Nome", d.proprietario.nome],
              ["Documento", d.proprietario.documento],
              ["Município / UF", d.proprietario.municipioUf],
              ["Situação", d.proprietario.status, restr ? "#E5484D" : "#e2e8f0"],
            ]}
          />
        </Sec>

        <Sec n="03" title="Histórico de Proprietários">
          <Tbl
            cols={[
              { label: "Nome" },
              { label: "Documento" },
              { label: "Município / UF" },
              { label: "Desde", align: "right" },
            ]}
            widths="1.6fr 1.1fr 1.3fr 0.8fr"
            rows={d.proprietariosAnteriores.map((p) => [
              p.nome,
              p.documento,
              p.municipioUf,
              { v: p.data, tone: "#8a94a3" },
            ])}
          />
        </Sec>

        <Sec span n="04" title="Restrições · Roubo / Furto · Judicial · Gravame">
          <div className="rep-flags">
            {flags.map(([label, ok]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "11px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#a0aec0", letterSpacing: "0.04em" }}>
                  {label}
                </span>
                <Chip ok={ok} okText="Nada Consta" badText="Consta" />
              </div>
            ))}
          </div>
          {restr && d.renajud.temRestricao && (
            <div style={{ padding: "11px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <KVGrid
                rows={[
                  ["Processo", d.renajud.processo, "#E5484D"],
                  ["Tribunal", d.renajud.tribunal],
                  ["Restrições", d.renajud.restricoes.join(" · "), "#E5484D"],
                  ["Agente / Contrato", `${d.gravame.agente} · ${d.gravame.contrato}`],
                ]}
              />
            </div>
          )}
        </Sec>

        <Sec
          span
          n="05"
          title="Débitos DETRAN"
          right={
            <span
              style={{
                ...monoRight,
                fontSize: 11,
                color: d.debitos.total > 0 ? "#E5484D" : "#cfd6df",
                fontWeight: 700,
              }}
            >
              {d.debitos.totalFmt}
            </span>
          }
        >
          <Tbl
            cols={[{ label: "Natureza" }, { label: "Situação", align: "center" }, { label: "Valor", align: "right" }]}
            widths="1.6fr 1fr 1fr"
            rows={[
              [
                "IPVA",
                { v: d.debitos.ipva > 0 ? "EM ABERTO" : "QUITADO", tone: d.debitos.ipva > 0 ? "#E5484D" : "#cfd6df" },
                { v: d.debitos.ipvaFmt, align: "right" },
              ],
              [
                "Multas DETRAN",
                { v: d.debitos.multas > 0 ? "EM ABERTO" : "QUITADO", tone: d.debitos.multas > 0 ? "#E5484D" : "#cfd6df" },
                { v: d.debitos.multasFmt },
              ],
              [
                "Licenciamento",
                {
                  v: d.debitos.licenciamento > 0 ? "EM ABERTO" : "QUITADO",
                  tone: d.debitos.licenciamento > 0 ? "#E5484D" : "#cfd6df",
                },
                { v: d.debitos.licenciamentoFmt },
              ],
              [
                "DPVAT",
                { v: d.debitos.dpvat > 0 ? "EM ABERTO" : "QUITADO", tone: d.debitos.dpvat > 0 ? "#E5484D" : "#cfd6df" },
                { v: d.debitos.dpvatFmt },
              ],
            ]}
          />
        </Sec>

        <Sec
          span
          n="06"
          title="Infrações RENAINF"
          right={
            <span style={{ ...monoRight, fontSize: 10, color: d.renainf.total > 0 ? "#E5484D" : "#8a94a3" }}>
              {d.renainf.total} registro(s) · {d.renainf.valorTotal}
            </span>
          }
        >
          <Tbl
            cols={[
              { label: "Data" },
              { label: "Local / Órgão" },
              { label: "Descrição" },
              { label: "Valor", align: "right" },
              { label: "Situação", align: "right" },
            ]}
            widths="0.8fr 1.4fr 1.6fr 0.8fr 0.9fr"
            rows={d.renainf.infracoes.map((i) => [
              i.data,
              `${i.local} · ${i.orgao}`,
              i.descricao,
              { v: i.valor, align: "right" },
              { v: i.situacao, tone: i.situacao === "PAGA" ? "#8a94a3" : "#E5484D", align: "right" },
            ])}
          />
        </Sec>

        <Sec
          span
          n="07"
          title="Histórico de Quilometragem"
          right={
            d.odometro.anomalia ? (
              <span style={{ ...monoRight, fontSize: 9, color: "#E5484D", fontWeight: 700 }}>⚠ DIVERGÊNCIA</span>
            ) : (
              <span style={{ ...monoRight, fontSize: 9, color: "#2BA84A" }}>CONSISTENTE</span>
            )
          }
        >
          <Tbl
            cols={[
              { label: "Data" },
              { label: "KM", align: "right" },
              { label: "Fonte" },
              { label: "UF", align: "center" },
              { label: "Consistência", align: "right" },
            ]}
            widths="1fr 1fr 1.6fr 0.6fr 1fr"
            rows={d.historicoKm.map((r) => [
              r.data,
              { v: r.km.toLocaleString("pt-BR"), align: "right" },
              r.fonte,
              { v: r.uf, align: "center" },
              { v: r.consistencia, tone: r.consistencia === "OK" ? "#8a94a3" : "#E5484D", align: "right" },
            ])}
          />
          {d.odometro.anomalia && (
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                fontFamily: "var(--mono)",
                fontSize: 9.5,
                color: "#f3b0b2",
                lineHeight: 1.5,
              }}
            >
              {d.odometro.motivo}
            </div>
          )}
        </Sec>

        <Sec
          span
          n="08"
          title="Precificação FIPE"
          right={<span style={{ ...monoRight, fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>{d.fipe.valorFmt}</span>}
        >
          <KVGrid
            cols={4}
            rows={[
              ["Código FIPE", d.fipe.codigo],
              ["Modelo", d.fipe.modelo],
              ["Ano Modelo", d.fipe.anoModelo],
              ["Referência", d.fipe.referencia],
            ]}
          />
          <div
            style={{
              padding: "8px 16px 4px",
              fontFamily: "var(--mono)",
              fontSize: 8,
              letterSpacing: "0.12em",
              color: "#5a6a7a",
              textTransform: "uppercase",
            }}
          >
            Evolução · 12 meses
          </div>
          <div className="fipe-strip">
            {d.fipeHistorico.map((h) => (
              <div
                key={h.mes}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "8px 6px",
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  textAlign: "center",
                }}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 7.5, color: "#5a6a7a" }}>{h.mes}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "#cfd6df" }}>
                  {(h.valor / 1000).toFixed(1)}k
                </span>
              </div>
            ))}
          </div>
        </Sec>

        <Sec
          span
          n="09"
          title="Leilão & Score de Risco"
          right={
            <span
              style={{
                ...monoRight,
                fontSize: 11,
                color: d.leilao.grau === "A" || d.leilao.grau === "B" ? "#2BA84A" : "#E5484D",
                fontWeight: 700,
              }}
            >
              GRAU {d.leilao.grau} · {d.leilao.pontuacao}
            </span>
          }
        >
          <KVGrid
            cols={4}
            rows={[
              ["Pontuação", String(d.leilao.pontuacao)],
              ["Aceitação", `${d.leilao.aceitacao}%`],
              ["% Sobre FIPE", `${d.leilao.sobreFipe}%`],
              [
                "Indício de Sinistro",
                d.leilao.indicioSinistro ? "SIM" : "NÃO",
                d.leilao.indicioSinistro ? "#E5484D" : "#e2e8f0",
              ],
            ]}
          />
          <Tbl
            cols={[
              { label: "Data" },
              { label: "Leiloeiro / Comitente" },
              { label: "Lote", align: "center" },
              { label: "Condição", align: "right" },
            ]}
            widths="0.9fr 1.8fr 0.7fr 1.3fr"
            rows={d.leilao.ocorrencias.map((o) => [
              o.data,
              `${o.leiloeiro} · ${o.comitente}`,
              { v: o.lote, align: "center" },
              { v: o.condicao, tone: "#E5484D", align: "right" },
            ])}
          />
        </Sec>

        <Sec span n="10" title="Recall & CRLV-e">
          <KVGrid
            cols={4}
            rows={[
              ["Recall Pendente", d.recall.total > 0 ? "SIM" : "NÃO", d.recall.total > 0 ? "#E5484D" : "#e2e8f0"],
              ["Descrição", d.recall.descricao, d.recall.total > 0 ? "#E5484D" : "#e2e8f0"],
              ["CRLV-e Exercício", d.crlve.exercicio],
              ["Ocorrência CRLV-e", d.crlve.ocorrencia, d.crlve.ocorrencia === "SIM" ? "#E5484D" : "#e2e8f0"],
            ]}
          />
        </Sec>
      </div>

      {/* rodapé jurídico + hash */}
      <div
        style={{
          marginTop: 18,
          padding: "16px 18px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Icon name="shield" size={14} style={{ color: "#8a94a3" }} />
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "#5a6a7a",
              textTransform: "uppercase",
            }}
          >
            Autenticidade · SHA-256
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10.5,
            color: "var(--accent)",
            wordBreak: "break-all",
            letterSpacing: "0.04em",
          }}
        >
          {d.hash}
        </div>
        <p style={{ fontFamily: "var(--sans)", fontSize: 10.5, color: "#5a6a7a", lineHeight: 1.6, margin: "12px 0 0" }}>
          Documento gerado eletronicamente pelo SNC — Sistema Nacional de Conformidade. Fontes: B3 ·
          SENATRAN · DETRAN · CNJ · FIPE. Dados 100% fictícios para demonstração. A validade jurídica
          depende da confirmação do hash no portal oficial.
        </p>
      </div>
    </div>
  );
}
