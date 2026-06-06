import type { Metadata } from "next";
import { Libre_Caslon_Text, Inter, JetBrains_Mono } from "next/font/google";
import "./autoscore.css";

const libreCaslon = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caslon",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SNC AutoScore · Painel de Conformidade Veicular",
  description:
    "Relatório Veicular Consolidado — Ficha BIN, restrições, débitos DETRAN, FIPE, histórico de quilometragem e análise de risco de leilão com score.",
};

export default function AutoScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`as-root ${libreCaslon.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      {children}
    </div>
  );
}
