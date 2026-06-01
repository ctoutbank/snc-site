"use client";

// ─── CrlveDownloadButton ──────────────────────────────────────────────────────
// Client Component isolado para o botão de download do CRLV-e digital.
// Extraído de DadosCrlve (Server Component) para evitar o erro:
// "Event handlers cannot be passed to Client Component props."

interface CrlveDownloadButtonProps {
  pdfBase64: string;
  mimeType: string;
  placa: string;
}

export function CrlveDownloadButton({ pdfBase64, mimeType, placa }: CrlveDownloadButtonProps) {
  const handleDownload = () => {
    try {
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CRLVe-${placa || "VEICULO"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao baixar PDF", e);
    }
  };

  return (
    <button
      onClick={handleDownload}
      style={{
        background: "#2BA84A",
        color: "#fff",
        border: "none",
        padding: "10px 20px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap: 8,
        letterSpacing: "0.04em",
      }}
    >
      <span>⎙ BAIXAR CRLV-e OFICIAL (PDF)</span>
    </button>
  );
}
