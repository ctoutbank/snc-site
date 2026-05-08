'use client';

import { useState } from 'react';
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0a1428] border border-[#1e2d4a] rounded-2xl shadow-2xl overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="px-6 py-5 border-b border-[#1e2d4a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#14223d] flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-none">Validação de Protocolo</h3>
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Imutabilidade SHA-256</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!result ? (
            <div className="space-y-6">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <p className="text-[13px] text-blue-100/80 leading-relaxed italic">
                  &quot;Este validador permite verificar a integridade técnica de qualquer relatório emitido pelo SNC.
                  Ao inserir o número do protocolo, o sistema recalcula a assinatura digital e confirma se os dados
                  permanecem idênticos ao momento da consulta original.&quot;
                </p>
              </div>

              <form onSubmit={handleValidate} className="space-y-4">
                <div>
                  <label htmlFor="protocol" className="block text-[12px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Número do Protocolo
                  </label>
                  <div className="relative">
                    <input
                      id="protocol"
                      type="text"
                      placeholder="Ex: 00012345"
                      value={protocol}
                      onChange={(e) => setProtocol(e.target.value)}
                      className="w-full bg-[#14223d] border border-[#1e2d4a] rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
                      disabled={loading}
                    />
                    {loading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !protocol}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  {loading ? 'Calculando Hash...' : 'Verificar Autenticidade'}
                  {!loading && <Fingerprint className="w-4 h-4" />}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-in zoom-in-95 duration-300">
              {result.success && result.data?.hashMatches ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center py-2">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 border border-green-500/20">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Documento Autêntico</h4>
                    <p className="text-[13px] text-green-400 font-medium">Integridade Digital Confirmada</p>
                  </div>

                  <div className="bg-[#14223d] border border-[#1e2d4a] rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-white/5 border-b border-[#1e2d4a]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metadados da Auditoria</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-400">Protocolo</span>
                        <span className="text-white font-mono">{result.data.protocol}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-400">Data/Hora</span>
                        <span className="text-white">{new Date(result.data.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-400">Módulo</span>
                        <span className="text-white uppercase">{result.data.module}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span className="text-gray-400">Documento</span>
                        <span className="text-white font-mono">{result.data.document}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => setResult(null)}
                      className="text-[13px] text-gray-400 hover:text-white underline underline-offset-4"
                    >
                      Validar outro protocolo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center py-2">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Falha na Validação</h4>
                    <p className="text-[13px] text-red-400 font-medium">{result.message}</p>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-[13px] text-red-100/70 leading-relaxed text-center">
                    A assinatura digital deste protocolo não confere com os registros.
                    Isso pode indicar que o documento foi adulterado ou o protocolo é inexistente.
                  </div>

                  <button
                    onClick={() => setResult(null)}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 rounded-xl transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-black/40 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">
            Sistema Nacional de Conformidade · Consolle Data Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
