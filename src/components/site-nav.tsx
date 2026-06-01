'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ProtocolValidationModal } from '@/components/protocol-validation-modal';

interface SubItem {
  href: string;
  label: string;
  match: (p: string) => boolean;
}

interface NavItem {
  href?: string;
  label: string;
  match: (p: string) => boolean;
  dropdown?: SubItem[];
  hidden?: boolean;
}

const NAV_LINKS: NavItem[] = [
  { href: '/',            label: 'Início',        match: (p) => p === '/' },
  {
    label: 'Serviços',
    match: (p) => p.startsWith('/superscore') || p.startsWith('/autoscore'),
    hidden: true,
    dropdown: [
      { href: '/superscore', label: 'SuperScore', match: (p) => p.startsWith('/superscore') },
      { href: '/autoscore',  label: 'AutoScore',  match: (p) => p.startsWith('/autoscore')  },
    ],
  },
  { href: '/plataforma',  label: 'Plataforma',    match: (p) => p.startsWith('/plataforma') },
  { href: '/jornadas',    label: 'Jornadas',       match: (p) => p.startsWith('/jornadas')   },
  { href: '/setores',     label: 'Setores',        match: (p) => p.startsWith('/setores')    },
  { href: '/datasets',    label: 'Datasets',       match: (p) => p.startsWith('/datasets')   },
  { href: '/sobre',       label: 'A Instituição',  match: (p) => p.startsWith('/sobre')      },
];

/* Estilos idênticos ao .snc-navlinks a do globals.css */
const linkStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 13,
  color: '#cfd6df',
  borderRadius: 2,
  letterSpacing: '0.02em',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  cursor: 'pointer',
  transition: 'background .15s, color .15s',
  background: 'none',
  border: 'none',
  fontFamily: 'inherit',
  fontWeight: 'inherit',
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
};

export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);

  return (
    <>
      {/* Apenas o posicionamento do dropdown — sem tocar em cores ou tipografia */}
      <style>{`
        .snc-dd { position: relative; }
        .snc-dd-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          min-width: 152px;
          background: var(--snc-navy);
          border: 1px solid #17243b;
          border-radius: 2px;
          box-shadow: 0 8px 24px rgba(0,0,0,.35);
          opacity: 0;
          visibility: hidden;
          transition: opacity .15s, visibility .15s;
          z-index: 200;
        }
        .snc-dd:hover .snc-dd-menu { opacity: 1; visibility: visible; }
        .snc-dd-menu a {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 14px;
          font-size: 13px;
          color: #cfd6df;
          letter-spacing: .02em;
          border-bottom: 1px solid #17243b;
          transition: background .15s, color .15s;
          text-decoration: none;
        }
        .snc-dd-menu a:last-child { border-bottom: none; }
        .snc-dd-menu a:hover { color: #fff; background: #17243b; }
        .snc-dd-menu a.active { color: var(--snc-navy); background: var(--snc-paper); }
      `}</style>

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
            {NAV_LINKS.filter(i => !i.hidden).map((item) => {
              if (item.dropdown) {
                const active = item.match(pathname);
                return (
                  <div key={item.label} className="snc-dd">
                    <button
                      style={{
                        ...linkStyle,
                        ...(active ? { color: 'var(--snc-navy)', background: 'var(--snc-paper)' } : {}),
                      }}
                    >
                      {item.label}
                      <span style={{ fontSize: 9, opacity: .55, marginLeft: 1 }}>▾</span>
                    </button>
                    <div className="snc-dd-menu">
                      {item.dropdown.map((sub) => (
                        <Link key={sub.href} href={sub.href} className={sub.match(pathname) ? 'active' : ''}>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={item.match(pathname) ? 'active' : ''}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="snc-nav-cta">
            <button
              onClick={() => setValidationOpen(true)}
              className="snc-btn snc-btn-ghost"
              style={{
                color: 'var(--snc-green-2)',
                border: '1px solid rgba(0, 240, 160, 0.4)',
                height: 40, padding: '0 18px',
                fontFamily: 'inherit', fontSize: 13,
                lineHeight: 1, boxSizing: 'border-box',
              }}
            >
              Validar Relatório
            </button>
            <a
              href="https://snc.consolle.one/auth/sign-in"
              className="snc-btn snc-btn-ghost"
              style={{
                height: 40, padding: '0 18px',
                fontFamily: 'inherit', fontSize: 13,
                lineHeight: 1, boxSizing: 'border-box',
              }}
            >
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

          {NAV_LINKS.filter(i => !i.hidden).map((item) => {
            if (item.dropdown) {
              return (
                <div key={item.label}>
                  {/* Label do grupo — mesmo estilo dos itens mas sem seta, sem link */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 0', borderBottom: '1px solid #17243b',
                    fontFamily: 'Libre Caslon Text, serif', fontSize: '22px',
                    color: '#cfd6df',
                  }}>
                    {item.label}
                  </div>
                  {item.dropdown.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 0 14px 20px', borderBottom: '1px solid #17243b',
                        fontFamily: 'Libre Caslon Text, serif', fontSize: '18px',
                        color: 'inherit', textDecoration: 'none',
                      }}
                    >
                      {sub.label}
                      <span style={{ color: 'var(--snc-green-2)', fontSize: '16px' }}>→</span>
                    </Link>
                  ))}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '18px 0', borderBottom: '1px solid #17243b',
                  fontFamily: 'Libre Caslon Text, serif', fontSize: '22px',
                  color: 'inherit', textDecoration: 'none',
                }}
              >
                {item.label}
                <span style={{ color: 'var(--snc-green-2)', fontSize: '18px' }}>→</span>
              </Link>
            );
          })}

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => { setMenuOpen(false); setValidationOpen(true); }}
              className="snc-btn snc-btn-ghost"
              style={{
                justifyContent: 'center',
                color: 'var(--snc-green-2)',
                border: '1px solid rgba(0, 240, 160, 0.4)',
                height: 44, padding: '0 18px',
                fontFamily: 'inherit', fontSize: 13,
                lineHeight: 1, boxSizing: 'border-box',
              }}
            >
              Validar Relatório
            </button>
            <a
              href="https://snc.consolle.one/auth/sign-in"
              className="snc-btn snc-btn-ghost"
              style={{
                justifyContent: 'center',
                height: 44, padding: '0 18px',
                fontFamily: 'inherit', fontSize: 13,
                lineHeight: 1, boxSizing: 'border-box',
              }}
            >
              Área Restrita
            </a>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 30, fontSize: 11, color: '#8a94a3', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Trend Office<br />Av. Ipiranga, 40 · Porto Alegre / RS
          </div>
        </div>
      )}
    </>
  );
}
