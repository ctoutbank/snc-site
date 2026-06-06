"use client";

/* primitives.tsx — shared UI primitives for the SNC AutoScore cockpit.
   Navy glass surfaces, hairline borders, JetBrains Mono data, Caslon serif. */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";

/* ── eyebrow label ── */
export function Eyebrow({
  children,
  color = "var(--accent)",
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: 9.5,
        letterSpacing: "0.26em",
        color,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

/* ── card / bloco ── */
export function Bloco({
  title,
  accent,
  right,
  children,
  style,
  glow,
}: {
  title?: ReactNode;
  accent?: string;
  right?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
  glow?: string;
}) {
  return (
    <div
      className="bloco"
      style={{
        background: "rgba(255,255,255,0.022)",
        border: "1px solid rgba(255,255,255,0.07)",
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        boxShadow: glow ? `0 0 30px ${glow}10` : "none",
        ...style,
      }}
    >
      {(title || right) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          {title ? <Eyebrow color={accent || "var(--accent)"}>{title}</Eyebrow> : <span />}
          {right}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

/* ── status badge (uppercase, hairline) — verde/vermelho sempre em contorno ── */
type BadgeTone = "accent" | "good" | "bad" | "warn" | "muted" | "neutral";

export function Badge({
  children,
  tone = "accent",
  solid,
}: {
  children: ReactNode;
  tone?: BadgeTone | string;
  solid?: boolean;
}) {
  const map: Record<string, string> = {
    accent: "var(--accent)",
    good: "#2BA84A",
    bad: "#E5484D",
    warn: "#D4A843",
    muted: "#8a94a3",
    neutral: "#2BA84A",
  };
  const c = map[tone] || tone;
  const outlineOnly = tone === "good" || tone === "bad" || tone === "neutral";
  const useSolid = solid && !outlineOnly;
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: useSolid ? "#0A1628" : c,
        background: useSolid ? c : "transparent",
        border: `1px solid ${c}${useSolid ? "" : outlineOnly ? "" : "4D"}`,
        padding: "3px 9px",
        fontWeight: outlineOnly || useSolid ? 700 : 500,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: "8px",
      }}
    >
      {children}
    </span>
  );
}

/* ── key/value row ── */
export function DataRow({
  label,
  value,
  mono = true,
  tone,
}: {
  label: ReactNode;
  value: ReactNode;
  mono?: boolean;
  tone?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(96px,40%) 1fr",
        gap: 12,
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 8.5,
          letterSpacing: "0.1em",
          color: "#5a6a7a",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? "var(--mono)" : "var(--sans)",
          fontSize: mono ? 11.5 : 12.5,
          color: tone || "#e2e8f0",
          fontWeight: mono ? 500 : 400,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── status pill (verdict; ícone neutro, sem verde) ── */
export function StatusPill({
  icon,
  label,
  ok,
  okText,
  badText,
  detail,
}: {
  icon: IconName;
  label: ReactNode;
  ok: boolean;
  okText: ReactNode;
  badText: ReactNode;
  detail?: ReactNode;
}) {
  const c = ok ? "#2BA84A" : "#E5484D";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        background: ok ? "rgba(43,168,74,0.06)" : "rgba(229,72,77,0.07)",
        border: `1px solid ${ok ? "rgba(43,168,74,0.28)" : "rgba(229,72,77,0.3)"}`,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          color: "#8a94a3",
          border: "1px solid rgba(255,255,255,0.12)",
          flexShrink: 0,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <Icon name={icon} size={15} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 8.5,
            letterSpacing: "0.12em",
            color: "#8a94a3",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: c,
            fontWeight: 700,
            marginTop: 3,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {ok ? okText : badText}
        </div>
      </div>
      {detail && (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 9,
            color: "#8a94a3",
            flexShrink: 0,
          }}
        >
          {detail}
        </span>
      )}
    </div>
  );
}

/* ── compact metric chip (ícone neutro) ── */
export function MetricChip({
  icon,
  value,
  unit,
  caption,
  tone = "#cfd6df",
}: {
  icon: IconName;
  value: ReactNode;
  unit?: ReactNode;
  caption: ReactNode;
  tone?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, flex: 1, minWidth: 0 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: "#8a94a3",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={17} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 19,
              color: tone,
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {value}
          </span>
          {unit && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#8a94a3" }}>
              {unit}
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 8,
            letterSpacing: "0.1em",
            color: "#5a6a7a",
            textTransform: "uppercase",
            marginTop: 5,
          }}
        >
          {caption}
        </div>
      </div>
    </div>
  );
}

/* ── avatar neutro (nunca usa a cor do perfil) ── */
export function Avatar({
  children,
  size = 38,
  fontSize = 12,
}: {
  children: ReactNode;
  size?: number;
  fontSize?: number;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--mono)",
        fontSize,
        fontWeight: 700,
        letterSpacing: "0.04em",
        color: "#cfd6df",
        background: "linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,255,255,0.16)",
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

export function avatarInitials(nome: string): string {
  return (
    (nome || "")
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

const menuItemStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 11,
  padding: "12px 16px",
  fontFamily: "var(--mono)",
  fontSize: 10.5,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#cfd6df",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
};

/* ── menu do usuário (avatar + dropdown Perfil/Configurações/Sair) ── */
export function UserMenu({
  nome = "Ana Nogueira",
  email = "analista@sncautoscore.com.br",
  userName,
  userEmail,
  onPerfil,
  onLogout,
  onConfig,
  isAdmin,
}: {
  nome?: string;
  email?: string;
  userName?: string;
  userEmail?: string;
  onPerfil?: () => void;
  onLogout?: () => void;
  onConfig?: () => void;
  isAdmin?: boolean;
}) {
  /* Real auth props take precedence over legacy defaults */
  const displayName = userName || nome;
  const displayEmail = userEmail || email;

  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const h = () => setOpen(false);
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [open]);
  return (
    <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu do usuário"
        title={displayName}
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
        }}
      >
        <Avatar>{avatarInitials(displayName)}</Avatar>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 48,
            width: 220,
            background: "#0e1c30",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 18px 44px rgba(0,0,0,0.45)",
            zIndex: 50,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Avatar size={34} fontSize={11}>
              {avatarInitials(displayName)}
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 8.5,
                  color: "#5a6a7a",
                  marginTop: 3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayEmail}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onPerfil?.();
            }}
            style={menuItemStyle}
          >
            <Icon name="doc" size={15} /> Meu perfil
          </button>
          {isAdmin && onConfig && (
            <button
              onClick={() => {
                setOpen(false);
                onConfig();
              }}
              style={menuItemStyle}
            >
              <Icon name="gear" size={15} /> Configurações
            </button>
          )}
          <button
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            style={{
              ...menuItemStyle,
              color: "#E5484D",
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Icon name="arrowUp" size={15} style={{ transform: "rotate(90deg)" }} /> Sair da conta
          </button>
        </div>
      )}
    </div>
  );
}
