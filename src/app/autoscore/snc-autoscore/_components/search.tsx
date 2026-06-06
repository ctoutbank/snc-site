"use client";

/* search.tsx — Tela de busca padrão do SNC AutoScore (estado inicial).
   Nav + action bar + header (meta + título dourado) + barra de PLACA + exemplos.
   Adaptado: chama API real em vez de alternar cenários mock. */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icons";
import { SncShield } from "./icons";
import { UserMenu } from "./primitives";

export function formatarPlacaInput(valor: string): string {
  const clean = valor
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
  if (clean.length > 3) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return clean;
}

interface SiteNavProps {
  active?: string;
  onNova?: () => void;
  onPerfil?: () => void;
  onLogout?: () => void;
  onConfig?: () => void;
  isAdmin?: boolean;
  userName?: string;
  userEmail?: string;
}

const NAV_ROUTES: Record<string, string> = {
  autoscore: "/autoscore/snc-autoscore",
  datasets: "/autoscore",
  historico: "/autoscore",
  financeiro: "/autoscore",
};

export function SiteNav({ active = "autoscore", onNova, onPerfil, onLogout, onConfig, isAdmin, userName, userEmail }: SiteNavProps) {
  const router = useRouter();
  const links: { id: string; label: string }[] = [
    { id: "autoscore", label: "AutoScore" },
    { id: "datasets", label: "Datasets" },
    { id: "historico", label: "Histórico" },
    { id: "financeiro", label: "Financeiro" },
  ];
  return (
    <nav
      style={{
        height: 64,
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(10,22,40,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <button
        onClick={onNova}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <SncShield size={26} />
        <span style={{ fontFamily: "var(--serif)", fontSize: 18, color: "#fff" }}>
          SNC <span style={{ color: "var(--accent)" }}>AutoScore</span>
        </span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <div className="nav-links" style={{ display: "flex", gap: 8 }}>
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                if (l.id === "autoscore" && onNova) {
                  onNova();
                } else {
                  router.push(NAV_ROUTES[l.id] || "/autoscore");
                }
              }}
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: l.id === active ? "var(--accent)" : "#8a94a3",
                background:
                  l.id === active ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
                border:
                  l.id === active
                    ? "1px solid color-mix(in srgb, var(--accent) 28%, transparent)"
                    : "1px solid transparent",
                padding: "8px 14px",
                cursor: "pointer",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={onNova}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#0A1628",
            background: "var(--accent)",
            padding: "10px 16px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Icon name="search" size={14} /> Nova Consulta
        </button>
        <UserMenu
          onPerfil={onPerfil}
          onLogout={onLogout}
          onConfig={onConfig}
          isAdmin={isAdmin}
          userName={userName}
          userEmail={userEmail}
        />
      </div>
    </nav>
  );
}

interface SearchScreenProps {
  onConsultar: (placa: string) => void;
  onExemplo: (placa: string) => void;
  loading: boolean;
  loadingPlaca: string | null;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function SearchScreen({ onConsultar, onExemplo, loading, loadingPlaca, userName, userEmail, onLogout }: SearchScreenProps) {
  const [placa, setPlaca] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const buscar = () => {
    const clean = placa.replace(/[^A-Z0-9]/g, "");
    if (clean.length < 7) {
      setErro("Placa inválida. Use o formato ABC-1234 ou ABC-1D23.");
      return;
    }
    setErro(null);
    onConsultar(placa);
  };

  const manualLoading = loading && loadingPlaca === null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav
        active="autoscore"
        onNova={() => setPlaca("")}
        userName={userName}
        userEmail={userEmail}
        onLogout={onLogout}
      />

      {/* action bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            padding: "12px 28px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 9,
              letterSpacing: "0.16em",
              color: "#3e4c5c",
              textTransform: "uppercase",
            }}
          >
            Sessão segura · LGPD
          </span>
        </div>
      </div>

      {/* main */}
      <section style={{ flex: 1, padding: "60px 28px 80px", borderTop: "1px solid #17243b" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* header */}
          <div style={{ marginBottom: 36 }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: "#a0aec0",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              DATASET 00 · SNC AUTOSCORE · SUPER-RELATÓRIO UNIFICADO · PLACA · LGPD ART. 7º III
            </div>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 400,
                fontSize: 48,
                color: "#fff",
                margin: "12px 0 14px",
                lineHeight: 1.05,
              }}
            >
              SNC <span style={{ color: "var(--accent)" }}>AutoScore</span>
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#8a94a3",
                lineHeight: 1.7,
                maxWidth: 760,
                margin: 0,
                fontFamily: "var(--sans)",
              }}
            >
              O mais avançado relatório unificado da plataforma. Combina Ficha Cadastral Completa
              (BIN), Proprietário Atual (Nome/Doc), restrições detalhadas, débitos em tempo real do
              DETRAN, precificação FIPE, histórico cronológico de quilometragem e análise de risco de
              leilão com score.
            </p>
          </div>

          {/* search bar */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "32px 36px",
              marginBottom: 28,
            }}
          >
            <div className="search-row" style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "var(--mono)",
                    fontSize: 10,
                    color: "#5a6a7a",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    pointerEvents: "none",
                  }}
                >
                  PLACA
                </div>
                <input
                  type="text"
                  autoComplete="off"
                  value={placa}
                  maxLength={8}
                  placeholder="ABC-1234"
                  onChange={(e) => {
                    setPlaca(formatarPlacaInput(e.target.value));
                    setErro(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && buscar()}
                  style={{
                    width: "100%",
                    background: "rgba(14,28,48,1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontFamily: "var(--mono)",
                    fontSize: 28,
                    letterSpacing: "0.14em",
                    padding: "18px 18px 18px 82px",
                    outline: "none",
                    textTransform: "uppercase",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
                />
              </div>
              <button
                onClick={buscar}
                disabled={loading}
                style={{
                  padding: "18px 36px",
                  background: manualLoading ? "rgba(212,168,67,0.4)" : "var(--accent)",
                  color: "#0A1628",
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {manualLoading ? (
                  <>
                    <span className="spin" />
                    Consultando…
                  </>
                ) : (
                  "Consultar"
                )}
              </button>
            </div>

            {erro && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 16px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#ef4444",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                }}
              >
                {erro}
              </div>
            )}

            <p
              style={{
                marginTop: 14,
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "#5a6a7a",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Formatos aceitos: ABC-1234 (Cinza/Mercosul) · SNC AutoScore 100% Integrado
            </p>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "flex-start",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                paddingTop: 16,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  color: "#5a6a7a",
                  display: "flex",
                  alignItems: "center",
                  textTransform: "uppercase",
                  paddingTop: 6,
                }}
              >
                Exemplos:
              </span>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => onExemplo("SNC-2026")}
                  disabled={loading}
                  className="ex-btn ex-green"
                >
                  {loading && loadingPlaca === "SNC-2026" ? (
                    <>
                      <span className="spin spin-green" />
                      Carregando…
                    </>
                  ) : (
                    "Exemplo de Relatório (Nada Consta)"
                  )}
                </button>
                <button
                  onClick={() => onExemplo("SNC-1990")}
                  disabled={loading}
                  className="ex-btn ex-red"
                >
                  {loading && loadingPlaca === "SNC-1990" ? (
                    <>
                      <span className="spin spin-red" />
                      Carregando…
                    </>
                  ) : (
                    "Exemplo de Relatório (Com Restrições)"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: "18px 28px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          fontFamily: "var(--mono)",
          fontSize: 8.5,
          letterSpacing: "0.1em",
          color: "#3e4c5c",
          textTransform: "uppercase",
        }}
      >
        <span>SNC · Sistema Nacional de Conformidade · Fontes: B3 · SENATRAN · DETRAN · CNJ</span>
        <span>Consolle Data Intelligence</span>
      </footer>
    </div>
  );
}
