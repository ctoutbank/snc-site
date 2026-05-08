'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ProtocolValidationModal } from '@/components/protocol-validation-modal';

const NAV_LINKS = [
  { href: '/', label: 'Início', match: (p: string) => p === '/' },
  { href: '/superscore', label: 'SuperScore', match: (p: string) => p.startsWith('/superscore') },
  { href: '/plataforma', label: 'Plataforma', match: (p: string) => p.startsWith('/plataforma') },
  { href: '/jornadas', label: 'Jornadas', match: (p: string) => p.startsWith('/jornadas') },
  { href: '/setores', label: 'Setores', match: (p: string) => p.startsWith('/setores') },
  { href: '/datasets', label: 'Datasets', match: (p: string) => p.startsWith('/datasets') },
  { href: '/sobre', label: 'A Instituição', match: (p: string) => p.startsWith('/sobre') },
];

export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);

  return (
    <>
      <header className="snc-topbar">
        <div className="strip">
          <span>
            <span className="dot" />
            Plataforma operacional · SLA 99,98%
          </span>
          <span>Porto Alegre / RS &nbsp;·&nbsp; Trend Office &nbsp;·&nbsp; Av. Ipiranga, 40 · sala 1212</span>
        </div>
        <nav className="snc-nav">
          <Link href="/" className="snc-brand">
            <img src="/snc-logo.png" alt="SNC" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="bd">
              <div className="t1">Sistema Nacional de Conformidade</div>
              <div className="t2">Consolle Data Intelligence</div>
            </div>
          </Link>

          <div className="snc-navlinks">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={link.match(pathname) ? 'active' : ''}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="snc-nav-cta">
            <button
              onClick={() => setValidationOpen(true)}
              className="snc-btn snc-btn-ghost"
              style={{ color: 'var(--snc-green-2)', border: '1px solid rgba(0, 240, 160, 0.2)' }}
            >
              Validar Relatório
            </button>
            <a href="https://snc.consolle.one/auth/sign-in" className="snc-btn snc-btn-ghost">
              Área Restrita
            </a>
            <button className="snc-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <ProtocolValidationModal
        isOpen={validationOpen}
        onClose={() => setValidationOpen(false)}
      />

      {menuOpen && (
        <div className="snc-mobile-menu">
          <div className="mm-top">
            <img src="/snc-logo.png" alt="SNC" height={36} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <button className="mm-close" onClick={() => setMenuOpen(false)} aria-label="Fechar">×</button>
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #17243b', fontFamily: 'Libre Caslon Text, serif', fontSize: '22px', color: 'inherit', textDecoration: 'none' }}
            >
              {link.label}
              <span style={{ color: 'var(--snc-green-2)', fontSize: '18px' }}>→</span>
            </Link>
          ))}
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => { setMenuOpen(false); setValidationOpen(true); }}
              className="snc-btn snc-btn-ghost"
              style={{ justifyContent: 'center', color: 'var(--snc-green-2)', border: '1px solid rgba(0, 240, 160, 0.2)' }}
            >
              Validar Relatório
            </button>
            <a href="https://snc.consolle.one/auth/sign-in" className="snc-btn snc-btn-ghost" style={{ justifyContent: 'center' }}>Área Restrita</a>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 30, fontSize: 11, color: '#8a94a3', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Trend Office<br />Av. Ipiranga, 40 · Porto Alegre / RS
          </div>
        </div>
      )}
    </>
  );
}
