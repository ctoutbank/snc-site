"use client";

import { useState } from "react";

interface Props {
  protocol: string;
}

export function RelatorioToolbar({ protocol }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="r-tb">
      <div className="left">
        <span className="ref">Documento <strong>Nº {protocol}</strong></span>
        <span className="ref" style={{ opacity: 0.6 }}>Versão Digital · Autenticada</span>
      </div>
      <div className="right">
        <button className="r-btn" onClick={() => window.history.back()}>← Voltar</button>
        <button className="r-btn" onClick={handleCopy}>
          {copied ? "✓ Copiado" : "Copiar link"}
        </button>
        <button className="r-btn primary" onClick={() => window.print()}>⎙ Baixar PDF</button>
      </div>
    </div>
  );
}
