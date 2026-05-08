'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, ShieldCheck, Fingerprint, Loader2, X } from 'lucide-react';

export type ValidationResult = {
  success: boolean;
  message: string;
  data?: {
    protocol: string;
    timestamp: string;
    module: string;
    document: string;
    hashMatches: boolean;
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
          maxWidth: 520,
          background: 'var(--snc-paper)',
          border: '1px solid rgba(15, 26, 36, 0.12)',
          borderRadius: 4,
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            background: 'var(--snc-navy)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(184, 145, 74, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 38,
                height: 38,
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
                style={{ fontSize: 20, fontWeight: 400, lineHeight: 1.1 }}
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

        {/* Content */}
        <div style={{ padding: 28 }}>
          {!result ? (
            <>
              <p
                style={{
                  fontSize: 13,
                  color: '#4a5662',
                  lineHeight: 1.7,
                  margin: '0 0 24px',
                  fontStyle: 'italic',
                  borderLeft: '2px solid var(--snc-brass)',
                  paddingLeft: 14,
                }}
              >
                Verifique a integridade técnica de qualquer relatório emitido pelo SNC. O sistema
                recalcula a assinatura SHA-256 e confirma se os dados permanecem idênticos ao
                momento da consulta original.
              </p>

              <form onSubmit={handleValidate}>
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
                <div style={{ position: 'relative', marginBottom: 18 }}>
                  <input
                    id="protocol"
                    type="text"
                    placeholder="Ex: 00012345"
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
                      padding: '14px 16px',
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
                    padding: '14px 18px',
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
          ) : result.success && result.data?.hashMatches ? (
            <ResultSuccess data={result.data} onReset={reset} />
          ) : (
            <ResultError message={result.message} onReset={reset} />
          )}
        </div>

        {/* Footer */}
        <div
          className="snc-mono"
          style={{
            padding: '14px 28px',
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

function ResultSuccess({ data, onReset }: { data: NonNullable<ValidationResult['data']>; onReset: () => void }) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(43, 168, 74, 0.1)',
            border: '1px solid rgba(43, 168, 74, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--snc-green-2)',
            marginBottom: 16,
          }}
        >
          <CheckCircle2 width={28} height={28} />
        </div>
        <div
          className="snc-serif"
          style={{ fontSize: 22, fontWeight: 400, color: 'var(--snc-navy)', marginBottom: 4 }}
        >
          Documento autêntico
        </div>
        <div
          className="snc-mono"
          style={{ fontSize: 10, color: 'var(--snc-green-2)', textTransform: 'uppercase', letterSpacing: '0.2em' }}
        >
          Integridade digital confirmada
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(15, 26, 36, 0.1)',
          borderRadius: 2,
          marginBottom: 18,
          overflow: 'hidden',
        }}
      >
        <div
          className="snc-mono"
          style={{
            padding: '10px 16px',
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
        <div style={{ padding: '4px 16px' }}>
          {[
            ['Protocolo', data.protocol, true],
            ['Data/Hora', new Date(data.timestamp).toLocaleString('pt-BR'), false],
            ['Módulo', (data.module || '').toUpperCase(), false],
            ['Documento', data.document, true],
          ].map(([label, value, mono]) => (
            <div
              key={label as string}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(15, 26, 36, 0.05)',
                fontSize: 13,
              }}
            >
              <span style={{ color: 'var(--snc-muted)' }}>{label}</span>
              <span
                className={mono ? 'snc-mono' : ''}
                style={{ color: 'var(--snc-ink)' }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '12px',
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
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(184, 75, 75, 0.1)',
            border: '1px solid rgba(184, 75, 75, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b84b4b',
            marginBottom: 16,
          }}
        >
          <AlertCircle width={28} height={28} />
        </div>
        <div
          className="snc-serif"
          style={{ fontSize: 22, fontWeight: 400, color: 'var(--snc-navy)', marginBottom: 4 }}
        >
          Falha na validação
        </div>
        <div
          className="snc-mono"
          style={{ fontSize: 10, color: '#b84b4b', textTransform: 'uppercase', letterSpacing: '0.2em' }}
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
          marginBottom: 18,
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
          padding: '14px',
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
