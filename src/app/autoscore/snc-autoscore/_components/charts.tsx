/* charts.tsx — SVG data-viz primitives for the SNC AutoScore cockpit.
   All pure SVG, no libs. Colors are passed in (semantic, derived from data). */
import type { ReactNode } from "react";

/* ── polar helpers ── */
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

/* ── Hero gauge — SNC AutoScore index (0–100) with A–E grade ── */
export function ScoreGauge({
  value,
  grade,
  color,
}: {
  value: number;
  grade: string;
  color: string;
  label?: string;
}) {
  const cx = 130;
  const cy = 130;
  const r = 104;
  const START = -135;
  const SWEEP = 270;
  const end = START + (value / 100) * SWEEP;
  const knob = polar(cx, cy, r, end);
  const ticks: ReactNode[] = [];
  for (let i = 0; i <= 30; i++) {
    const major = i % 5 === 0;
    const deg = START + (i / 30) * SWEEP;
    const o = polar(cx, cy, r + 12, deg);
    const inn = polar(cx, cy, r + (major ? 4 : 7), deg);
    ticks.push(
      <line
        key={i}
        x1={o.x}
        y1={o.y}
        x2={inn.x}
        y2={inn.y}
        stroke={major ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.10)"}
        strokeWidth={major ? 1.4 : 1}
      />
    );
  }
  return (
    <svg
      viewBox="0 0 260 260"
      style={{ width: "100%", maxWidth: 280, display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <defs>
        <radialGradient id="gaugeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="70%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gaugeArc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r="118" fill="url(#gaugeGlow)" />
      {ticks}
      <path
        d={arcPath(cx, cy, r, START, START + SWEEP)}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d={arcPath(cx, cy, r, START, end)}
        fill="none"
        stroke="url(#gaugeArc)"
        strokeWidth="10"
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 8px ${color}66)`,
          transition: "all .8s cubic-bezier(.2,.8,.2,1)",
        }}
      />
      <circle
        cx={knob.x}
        cy={knob.y}
        r="7"
        fill="#0A1628"
        stroke={color}
        strokeWidth="2.5"
        style={{
          filter: `drop-shadow(0 0 6px ${color})`,
          transition: "all .8s cubic-bezier(.2,.8,.2,1)",
        }}
      />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill="#5a6a7a"
        style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.22em" }}
      >
        ÍNDICE
      </text>
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        fill="#fff"
        style={{ fontFamily: "var(--serif)", fontSize: 56, fontWeight: 700 }}
      >
        {value}
      </text>
      <text
        x={cx}
        y={cy + 44}
        textAnchor="middle"
        fill={color}
        style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.28em" }}
      >
        GRAU {grade}
      </text>
    </svg>
  );
}

/* ── Donut — coverage / proportion ── */
export function Donut({
  value,
  max,
  color,
  track = "rgba(255,255,255,0.07)",
  size = 132,
  stroke = 12,
  children,
}: {
  value: number;
  max: number;
  color: string;
  track?: string;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - stroke) / 2 - 6;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
      >
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
          style={{
            transition: "stroke-dasharray .8s cubic-bezier(.2,.8,.2,1)",
            filter: `drop-shadow(0 0 5px ${color}55)`,
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Horizontal breakdown bar ── */
export function BreakdownBar({
  label,
  valueFmt,
  frac,
  color,
}: {
  label: ReactNode;
  valueFmt: ReactNode;
  frac: number;
  color: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9,
            letterSpacing: "0.12em",
            color: "#8a94a3",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span
          style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}
        >
          {valueFmt}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(frac * 100, frac > 0 ? 4 : 0)}%`,
            background: color,
            borderRadius: 3,
            transition: "width .8s cubic-bezier(.2,.8,.2,1)",
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

export interface LinePoint {
  v: number;
  label: string;
}

/* ── Line chart — odometer / FIPE history with anomaly highlight ── */
export function LineChart({
  points,
  color,
  anomalyIdx = -1,
  fmt,
}: {
  points: LinePoint[];
  color: string;
  anomalyIdx?: number;
  unit?: string;
  fmt?: (v: number) => string;
}) {
  const W = 560;
  const H = 190;
  const padX = 14;
  const padTop = 28;
  const padBot = 34;
  const xs = points.map((_, i) => padX + (i / (points.length - 1)) * (W - padX * 2));
  const vals = points.map((p) => p.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min === 0 ? 1 : max - min;
  const ys = vals.map((v) => padTop + (1 - (v - min) / range) * (H - padTop - padBot));
  const line = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const area = `${xs[0]},${H - padBot} ` + line + ` ${xs[xs.length - 1]},${H - padBot}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g) => {
        const y = padTop + g * (H - padTop - padBot);
        return (
          <line
            key={g}
            x1={padX}
            y1={y}
            x2={W - padX}
            y2={y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        );
      })}
      <polygon points={area} fill="url(#lineFill)" />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
      />
      {points.map((p, i) => {
        const bad = i === anomalyIdx;
        const c = bad ? "#E5484D" : color;
        return (
          <g key={i}>
            {bad && (
              <circle
                cx={xs[i]}
                cy={ys[i]}
                r="11"
                fill="none"
                stroke="#E5484D"
                strokeWidth="1.2"
                opacity="0.5"
              >
                <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={xs[i]}
              cy={ys[i]}
              r={bad ? 5 : 3.5}
              fill="#0A1628"
              stroke={c}
              strokeWidth="2.5"
              style={{ filter: `drop-shadow(0 0 5px ${c})` }}
            />
            <text
              x={xs[i]}
              y={ys[i] - 12}
              textAnchor="middle"
              fill={bad ? "#E5484D" : "#8a94a3"}
              style={{ fontFamily: "var(--mono)", fontSize: 8.5, fontWeight: bad ? 700 : 400 }}
            >
              {fmt ? fmt(p.v) : p.v.toLocaleString("pt-BR")}
            </text>
            <text
              x={xs[i]}
              y={H - 12}
              textAnchor="middle"
              fill="#5a6a7a"
              style={{ fontFamily: "var(--mono)", fontSize: 8.5, letterSpacing: "0.04em" }}
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
