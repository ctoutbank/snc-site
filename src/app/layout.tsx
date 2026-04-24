import type { Metadata } from 'next';
import { Libre_Caslon_Text, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const libreCaslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-caslon',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'SNC — Sistema Nacional de Conformidade',
    template: '%s · SNC',
  },
  description:
    'A infraestrutura decisiva da conformidade no Brasil. 253 datasets de 9 bureaus oficiais em uma única camada operacional de decisão.',
  keywords: [
    'conformidade', 'compliance', 'KYC', 'antifraude', 'due diligence',
    'bureaus de crédito', 'SPC', 'Serasa', 'Boa Vista', 'SCR', 'BACEN',
    'LGPD', 'PEP', 'score de crédito', 'datasets', 'API',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'SNC — Sistema Nacional de Conformidade',
    title: 'SNC — Sistema Nacional de Conformidade',
    description: '253 datasets. 9 bureaus. Uma única camada de decisão.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${libreCaslon.variable} ${inter.variable} ${jetbrainsMono.variable}`}
        style={{
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          background: '#0A1628',
          color: '#0F1A24',
          WebkitFontSmoothing: 'antialiased',
          overflowX: 'hidden',
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
