"use client";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  fallback?: string;
  color?: string;
}

export function BackButton({ fallback = "/", color = "#D4A843" }: BackButtonProps) {
  const router = useRouter();

  // Navega sempre para o destino fixo (fallback).
  // Não usa router.back() pois o destino deve ser previsível e independente
  // do histórico do browser. Os relatórios têm sua própria lógica de retorno
  // via TOOLBAR_JS + datasetFallbackMap.
  const handleBack = () => {
    router.push(fallback);
  };

  return (
    <button
      onClick={handleBack}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        color,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        border: `1px solid ${color}66`,
        padding: "6px 14px",
        borderRadius: 4,
        background: `${color}0D`,
        transition: "all 0.2s",
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 14, marginTop: -2 }}>←</span> Voltar
    </button>
  );
}
