'use client';

import { useState } from 'react';

interface Props {
  variant?: 'embedded' | 'full';
}

const NATURES = [
  'Instituição financeira / Fintech',
  'Varejo / E-commerce',
  'Imobiliário / Locação',
  'Indústria / Atacado',
  'RH / Recrutamento',
  'Saúde / Planos',
  'Apostas reguladas',
  'Governo / Órgão público',
  'Parcerias',
  'Outro',
];

export function ContactForm({ variant = 'embedded' }: Props) {
  const [form, setForm] = useState({ fullName: '', email: '', institution: '', nature: NATURES[0], context: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || 'Erro desconhecido.'); setStatus('error'); return; }
      setStatus('success');
    } catch { setErrorMsg('Falha de conexão. Tente novamente.'); setStatus('error'); }
  }

  if (status === 'success') {
    return (
      <div className="snc-form-success">
        <div className="icon">✓</div>
        <h4>Solicitação recebida.</h4>
        <p>Nossa equipe responderá em até 24 horas úteis.<br />Verifique também a pasta de spam.</p>
      </div>
    );
  }

  return (
    <form className="snc-form-wrap" onSubmit={handleSubmit}>
      <h3>Solicitação de acesso</h3>
      <div className="fl">Todos os campos são obrigatórios · Resposta em 24h úteis</div>
      <div className="fg"><label htmlFor="c-name">Nome completo</label><input id="c-name" required placeholder="Ana Maria Ribeiro" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} /></div>
      <div className="fg"><label htmlFor="c-email">E-mail corporativo</label><input id="c-email" type="email" required placeholder="ana@empresa.com.br" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
      <div className="fg"><label htmlFor="c-inst">Instituição · CNPJ</label><input id="c-inst" required placeholder="Instituição Financeira S.A." value={form.institution} onChange={(e) => set('institution', e.target.value)} /></div>
      <div className="fg"><label htmlFor="c-nat">Natureza da operação</label><select id="c-nat" value={form.nature} onChange={(e) => set('nature', e.target.value)}>{NATURES.map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
      <div className="fg"><label htmlFor="c-ctx">Contexto</label><textarea id="c-ctx" placeholder="Descreva brevemente o caso de uso…" value={form.context} onChange={(e) => set('context', e.target.value)} /></div>
      {status === 'error' && <div style={{ padding: '10px 14px', background: 'rgba(220,38,38,.15)', border: '1px solid rgba(220,38,38,.3)', color: '#fca5a5', fontSize: 13, marginBottom: 12 }}>{errorMsg}</div>}
      <button
        type="submit"
        className="snc-form-submit"
        disabled={status === 'loading'}
        style={{
          background: status === 'loading' ? '#1d7a35' : '#2BA84A',
          color: '#06240e',
          border: 'none',
        }}
      >
        {status === 'loading' ? 'Enviando…' : 'Enviar solicitação →'}
      </button>
    </form>
  );
}
