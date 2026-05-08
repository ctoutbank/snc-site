'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, ShieldCheck, Fingerprint, Loader2, X } from 'lucide-react';

export type ValidationResult = {
  success: boolean;
  message: string;
  data?: {
    protocol: string;
    protocolFormatted?: string;
    timestamp: string;
    module: string;
    document: string;
    documentType?: string;
    name?: string;
    datasets?: string[];
    hashMatches: boolean;
    hashTruncated?: string;
    executedBy?: string;
  };
};

interface ProtocolValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProtocolValidationModal({ isOpen, onClose }: ProtocolValidationModalProps) {
  const [protocol, setProtocol] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    if (!protocol) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/snc/validate-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolId: protocol }),
      });
      const data: ValidationResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ success: false, message: 'Erro de comunicação com o servidor.' });
    } finally {
      setLoading(false);
    }
  }

  const reset = () => { setResult(null); setProtocol(''); };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(10, 22, 40, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--snc-paper)',
          border: '1px solid rgba(15, 26, 36, 0.12)',
          borderRadius: 4,
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header — fixo */}
        <div
          style={{
            flexShrink: 0,
            padding: '20px 24px',
            background: 'var(--snc-navy)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(184, 145, 74, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'rgba(184, 145, 74, 0.12)',
                border: '1px solid rgba(184, 145, 74, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--snc-brass)',
              }}
            >
              <ShieldCheck width={18} height={18} />
            </div>
            <div>
              <div
                className="snc-mono"
                style={{ fontSize: 9, color: 'var(--snc-brass)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}
              >
                § Validação Pública
              </div>
              <div
                className="snc-serif"
                style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.1 }}
              >
                Protocolo SNC
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              transition: 'color .15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
          >
            <X width={20} height={20} />
          </button>
        </div>

        {/* Body — rolável */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div style={{ padding: 24 }}>
            {!result ? (
              <FormState
                protocol={protocol}
                setProtocol={setProtocol}
                loading={loading}
                onSubmit={handleValidate}
              />
            ) : result.success && result.data ? (
              <ResultSuccess data={result.data} message={result.message} onReset={reset} />
            ) : (
              <ResultError message={result.message} onReset={reset} />
            )}
          </div>
        </div>

        {/* Footer — fixo */}
        <div
          className="snc-mono"
          style={{
            flexShrink: 0,
            padding: '12px 24px',
            background: 'rgba(15, 26, 36, 0.04)',
            borderTop: '1px solid rgba(15, 26, 36, 0.08)',
            fontSize: 9,
            color: 'var(--snc-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            textAlign: 'center',
          }}
        >
          SNC · Consolle Data Intelligence · SHA-256
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  );
}

function FormState({
  protocol,
  setProtocol,
  loading,
  onSubmit,
}: {
  protocol: string;
  setProtocol: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      <p
        style={{
          fontSize: 13,
          color: '#4a5662',
          lineHeight: 1.7,
          margin: '0 0 22px',
          fontStyle: 'italic',
          borderLeft: '2px solid var(--snc-brass)',
          paddingLeft: 14,
        }}
      >
        Verifique a integridade técnica de qualquer relatório emitido pelo SNC. O sistema
        recalcula a assinatura SHA-256 e confirma se os dados permanecem idênticos ao
        momento da consulta original.
      </p>

      <form onSubmit={onSubmit}>
        <label
          htmlFor="protocol"
          className="snc-mono"
          style={{
            display: 'block',
            fontSize: 10,
            color: 'var(--snc-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: 10,
          }}
        >
          Número do Protocolo
        </label>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <input
            id="protocol"
            type="text"
            placeholder="Ex: 2026.0408-00000224 ou 224"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            disabled={loading}
            autoFocus
            className="snc-mono"
            style={{
              width: '100%',
              background: '#fff',
              border: '1px solid rgba(15, 26, 36, 0.15)',
              borderRadius: 2,
              padding: '13px 16px',
              fontSize: 14,
              color: 'var(--snc-ink)',
              outline: 'none',
              letterSpacing: '0.05em',
            }}
          />
          {loading && (
            <div
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--snc-brass)',
              }}
            >
              <Loader2 width={18} height={18} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !protocol}
          style={{
            width: '100%',
            padding: '13px 18px',
            background: loading || !protocol ? 'rgba(15, 26, 36, 0.2)' : 'var(--snc-navy)',
            color: '#fff',
            border: 'none',
            borderRadius: 2,
            fontFamily: 'inherit',
            fontSize: 13,
            letterSpacing: '0.02em',
            cursor: loading || !protocol ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'background .15s',
          }}
        >
          {loading ? 'Calculando assinatura...' : (
            <>
              <Fingerprint width={16} height={16} />
              Verificar autenticidade
            </>
          )}
        </button>
      </form>
    </>
  );
}

function formatDateBR(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: '', time: '' };
  const date = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

function ResultSuccess({
  data,
  message,
  onReset,
}: {
  data: NonNullable<ValidationResult['data']>;
  message: string;
  onReset: () => void;
}) {
  const matched = data.hashMatches;
  const hasHash = !!data.hashTruncated;
  // Three states:
  //   matched + hasHash → green (verified)
  //   !matched          → red   (tampering)
  //   matched + !hasHash → brass (legacy, located but not crypto-verified)
  const state: 'verified' | 'tampered' | 'legacy' = !matched
    ? 'tampered'
    : hasHash
      ? 'verified'
      : 'legacy';

  const accent =
    state === 'verified' ? 'var(--snc-green-2)'
    : state === 'tampered' ? '#b84b4b'
    : '#c89a3a';
  const accentBg =
    state === 'verified' ? 'rgba(43, 168, 74, 0.10)'
    : state === 'tampered' ? 'rgba(184, 75, 75, 0.10)'
    : 'rgba(184, 145, 74, 0.12)';
  const accentBorder =
    state === 'verified' ? 'rgba(43, 168, 74, 0.30)'
    : state === 'tampered' ? 'rgba(184, 75, 75, 0.30)'
    : 'rgba(184, 145, 74, 0.40)';

  const title =
    state === 'verified' ? 'Consulta verificada'
    : state === 'tampered' ? 'Falha na integridade'
    : 'Consulta localizada';
  const subtitle =
    state === 'verified' ? 'Integridade digital confirmada'
    : state === 'tampered' ? 'Hash não confere com os dados'
    : 'Anterior ao registro de assinatura';

  const { date, time } = formatDateBR(data.timestamp);
  const protocolDisplay = data.protocolFormatted || data.protocol;

  // Highlight rows (auditor most-checked fields)
  const highlightRows: Array<[string, string]> = [
    ['Data/Hora', date && time ? `${date} · ${time}` : ''],
    ['Documento', data.document],
  ];

  // Secondary metadata rows
  const secondaryRows: Array<[string, string, boolean]> = [];
  if (data.module) secondaryRows.push(['Módulo', data.module.toUpperCase(), false]);
  if (data.documentType) secondaryRows.push(['Tipo', data.documentType.toUpperCase(), false]);
  if (data.name) secondaryRows.push(['Titular', data.name, false]);
  if (data.executedBy) secondaryRows.push(['Executado por', data.executedBy, true]);
  if (data.hashTruncated) secondaryRows.push(['Hash SHA-256', data.hashTruncated, true]);

  const datasets = data.datasets || [];

  return (
    <div>
      {/* Status icon + title */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: accentBg,
            border: `1px solid ${accentBorder}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            marginBottom: 10,
          }}
        >
          {state === 'tampered' ? <AlertCircle width={26} height={26} /> : <CheckCircle2 width={26} height={26} />}
        </div>
        <div
          className="snc-serif"
          style={{ fontSize: 20, fontWeight: 400, color: 'var(--snc-navy)', marginBottom: 2 }}
        >
          {title}
        </div>
        <div
          className="snc-mono"
          style={{ fontSize: 9, color: accent, textTransform: 'uppercase', letterSpacing: '0.2em' }}
        >
          {subtitle}
        </div>
      </div>

      {/* Highlight block: Protocol + Date + Document */}
      <div
        style={{
          background: '#fff',
          border: `1px solid ${accentBorder}`,
          borderTop: `3px solid ${accent}`,
          borderRadius: 2,
          padding: '18px 20px',
          marginBottom: 14,
        }}
      >
        <div
          className="snc-mono"
          style={{
            fontSize: 9,
            color: 'var(--snc-brass)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: 6,
          }}
        >
          § Protocolo
        </div>
        <div
          className="snc-serif"
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: 'var(--snc-navy)',
            lineHeight: 1.1,
            marginBottom: 14,
            wordBreak: 'break-all',
            letterSpacing: '-0.01em',
          }}
        >
          {protocolDisplay}
        </div>

        {highlightRows.map(([label, value]) =>
          value ? (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 16,
                paddingTop: 8,
                borderTop: '1px solid rgba(15, 26, 36, 0.06)',
                marginTop: 8,
                fontSize: 13,
              }}
            >
              <span
                className="snc-mono"
                style={{ fontSize: 9, color: 'var(--snc-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}
              >
                {label}
              </span>
              <span style={{ color: 'var(--snc-ink)', fontWeight: 500 }}>{value}</span>
            </div>
          ) : null
        )}
      </div>

      {/* Status message banner */}
      <p
        style={{
          fontSize: 12,
          color: '#4a5662',
          lineHeight: 1.6,
          margin: '0 0 14px',
          padding: '10px 14px',
          background: accentBg,
          border: `1px solid ${accentBorder}`,
          borderRadius: 2,
        }}
      >
        {message}
      </p>

      {/* Secondary metadata */}
      {secondaryRows.length > 0 && (
        <div
          style={{
            background: '#fff',
            border: '1px solid rgba(15, 26, 36, 0.1)',
            borderRadius: 2,
            marginBottom: 14,
            overflow: 'hidden',
          }}
        >
          <div
            className="snc-mono"
            style={{
              padding: '9px 14px',
              background: 'rgba(15, 26, 36, 0.04)',
              borderBottom: '1px solid rgba(15, 26, 36, 0.08)',
              fontSize: 9,
              color: 'var(--snc-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}
          >
            Metadados da Auditoria
          </div>
          <div style={{ padding: '4px 14px' }}>
            {secondaryRows.map(([label, value, mono], i) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 0',
                  borderBottom: i < secondaryRows.length - 1 ? '1px solid rgba(15, 26, 36, 0.05)' : 'none',
                  fontSize: 12,
                }}
              >
                <span style={{ color: 'var(--snc-muted)', flexShrink: 0 }}>{label}</span>
                <span
                  className={mono ? 'snc-mono' : ''}
                  style={{
                    color: 'var(--snc-ink)',
                    textAlign: 'right',
                    fontSize: mono ? 11 : 12,
                    wordBreak: 'break-all',
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Datasets badges */}
      {datasets.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div
            className="snc-mono"
            style={{
              fontSize: 9,
              color: 'var(--snc-brass)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              marginBottom: 10,
            }}
          >
            {datasets.length} dataset{datasets.length > 1 ? 's' : ''} consultado{datasets.length > 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {datasets.map((ds) => (
              <span
                key={ds}
                className="snc-mono"
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  background: 'rgba(184, 145, 74, 0.08)',
                  border: '1px solid rgba(184, 145, 74, 0.25)',
                  borderRadius: 2,
                  fontSize: 10,
                  color: 'var(--snc-brass)',
                  textTransform: 'lowercase',
                  letterSpacing: '0.02em',
                  lineHeight: 1.3,
                }}
              >
                {ds}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '11px',
          background: 'transparent',
          border: '1px solid rgba(15, 26, 36, 0.2)',
          borderRadius: 2,
          fontFamily: 'inherit',
          fontSize: 12,
          color: 'var(--snc-ink)',
          cursor: 'pointer',
          letterSpacing: '0.02em',
        }}
      >
        Validar outro protocolo
      </button>
    </div>
  );
}

function ResultError({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(184, 75, 75, 0.1)',
            border: '1px solid rgba(184, 75, 75, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b84b4b',
            marginBottom: 14,
          }}
        >
          <AlertCircle width={26} height={26} />
        </div>
        <div
          className="snc-serif"
          style={{ fontSize: 20, fontWeight: 400, color: 'var(--snc-navy)', marginBottom: 4 }}
        >
          Falha na validação
        </div>
        <div
          className="snc-mono"
          style={{ fontSize: 9, color: '#b84b4b', textTransform: 'uppercase', letterSpacing: '0.2em' }}
        >
          Protocolo não verificado
        </div>
      </div>

      <div
        style={{
          background: 'rgba(184, 75, 75, 0.04)',
          border: '1px solid rgba(184, 75, 75, 0.2)',
          borderRadius: 2,
          padding: 14,
          marginBottom: 16,
          fontSize: 13,
          color: '#4a5662',
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        {message}
      </div>

      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '12px',
          background: 'var(--snc-navy)',
          color: '#fff',
          border: 'none',
          borderRadius: 2,
          fontFamily: 'inherit',
          fontSize: 13,
          cursor: 'pointer',
          letterSpacing: '0.02em',
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
