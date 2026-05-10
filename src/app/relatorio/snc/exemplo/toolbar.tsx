"use client";

import { useState } from "react";

interface Props {
  protocol: string;
}

export function RelatorioToolbar({ protocol }: Props) {
  const [copied, setCopied] = useState(false);

  const handleBack = () => {
    // Se foi aberta em nova aba (sem histórico real), tenta fechar; senão navega à home
    if (typeof window === "undefined") return;
    const noHistory = window.history.length <= 1;
    if (noHistory) {
      if (window.opener && !window.opener.closed) {
        try { window.close(); return; } catch { /* fall through */ }
      }
      window.location.href = "/";
    } else {
      window.history.back();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Fallback para browsers/contextos sem Clipboard API
      const ta = document.createElement("textarea");
      ta.value = window.location.href;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="r-tb">
      <div className="left">
        <span className="ref">Documento <strong>Nº {protocol}</strong></span>
        <span className="ref" style={{ opacity: 0.6 }}>Versão Digital · Autenticada</span>
      </div>
      <div className="right">
        <button type="button" className="r-btn" onClick={handleBack}>← Voltar</button>
        <button type="button" className="r-btn" onClick={handleCopy}>
          {copied ? "✓ Copiado" : "Copiar link"}
        </button>
        <button type="button" className="r-btn primary" onClick={handlePrint}>⎙ Baixar PDF</button>
      </div>
    </div>
  );
}
