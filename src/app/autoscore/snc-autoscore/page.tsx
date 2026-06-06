"use client";

/* page.tsx — SNC AutoScore · Novo Design
   Fluxo: BUSCA (SearchScreen) → fetch API real → RESULTADO (Dashboard com toggle Relatório/Painel).
   Usa o design do protótipo com dados reais da API /api/apibrasil/snc-autoscore. */

import { useCallback, useRef, useState, useEffect } from "react";
import { SearchScreen, SiteNav } from "./_components/search";
import { Dashboard } from "./_components/dashboard";
import type { Mode } from "./_components/report";
import type { VehicleReport } from "./_data/types";
import { transformApiToReport } from "./_data/transform";

type View = "busca" | "dashboard";

export default function AutoScorePage() {
  const [view, setView] = useState<View>("busca");
  const [data, setData] = useState<VehicleReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlaca, setLoadingPlaca] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("relatorio");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth: fetch user info from API
  const [userName, setUserName] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | undefined>();

  useEffect(() => {
    // Attempt to read user info from cookie-based session
    // The snc-site proxies auth from outbank-one via /auth/*
    fetch("/api/apibrasil/me", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((u) => {
        if (u?.name) setUserName(u.name);
        if (u?.email) setUserEmail(u.email);
      })
      .catch(() => { /* silent — guest mode */ });
  }, []);

  const consultar = useCallback(async (placa: string) => {
    const clean = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setLoading(true);
    setLoadingPlaca(null);
    setErro(null);

    try {
      const res = await fetch(`/api/apibrasil/snc-autoscore?placa=${clean}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Erro ${res.status}`);
      }

      const report = transformApiToReport(json, clean);
      setData(report);
      setMode("relatorio");
      setView("dashboard");
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao consultar. Tente novamente.");
    } finally {
      setLoading(false);
      setLoadingPlaca(null);
    }
  }, []);

  const consultarExemplo = useCallback(async (placa: string) => {
    const clean = placa.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setLoading(true);
    setLoadingPlaca(placa);
    setErro(null);

    try {
      const res = await fetch(`/api/apibrasil/snc-autoscore?placa=${clean}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || `Erro ${res.status}`);
      }

      const report = transformApiToReport(json, clean);
      setData(report);
      setMode("relatorio");
      setView("dashboard");
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao consultar exemplo.");
    } finally {
      setLoading(false);
      setLoadingPlaca(null);
    }
  }, []);

  const novaConsulta = useCallback(() => {
    setView("busca");
    setErro(null);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const handleLogout = useCallback(() => {
    // Redirect to auth sign-in (proxied from outbank-one)
    window.location.href = "https://snc.consolle.one/auth/sign-in";
  }, []);

  return (
    <div className="as-scroll" ref={scrollRef}>
      {view === "busca" ? (
        <SearchScreen
          onConsultar={consultar}
          onExemplo={consultarExemplo}
          loading={loading}
          loadingPlaca={loadingPlaca}
          userName={userName}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      ) : data ? (
        <>
          <SiteNav
            active="autoscore"
            onNova={novaConsulta}
            userName={userName}
            userEmail={userEmail}
            onLogout={handleLogout}
          />
          <div className="as-cockpit-pad">
            <Dashboard data={data} mode={mode} setMode={setMode} />
          </div>
        </>
      ) : null}

      {/* Erro global (aparece na tela de busca como fallback) */}
      {erro && view === "busca" && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(229,72,77,0.95)",
            color: "#fff",
            padding: "12px 24px",
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
            zIndex: 100,
            maxWidth: 500,
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(229,72,77,0.5)",
          }}
        >
          {erro}
        </div>
      )}
    </div>
  );
}
