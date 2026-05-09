'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Fingerprint, ExternalLink } from 'lucide-react';

export function RelatorioExemploSection() {
  return (
    <section className="snc-ds-premium-alt" id="relatorio-demo">
      {/* Cabeçalho */}
      <div className="snc-ds-header">
        <div className="snc-ds-header-left">
          <div className="snc-ds-header-num">§ 05 · DEMONSTRAÇÃO</div>
          <h2>
            Relatórios de <span className="it">Alta Fidelidade</span> e <br />
            Segurança Jurídica.
          </h2>
        </div>
        <div className="snc-ds-header-right">
          Cada consulta no SNC gera um dossiê digital completo, com validade jurídica,
          rastreabilidade por hash e evidências estruturadas para auditoria.
        </div>
      </div>

      {/* Corpo */}
      <div className="snc-ds-body">
        {/* Coluna esquerda - Texto e CTAs */}
        <div className="snc-ds-col-left">
          <p className="snc-ds-copy" style={{ fontSize: '1.1rem', lineHeight: '1.7', maxWidth: '100%' }}>
            Nossa infraestrutura não entrega apenas dados brutos. Entregamos autoridade.
            O relatório SNC é a peça fundamental para processos de Know Your Customer (KYC),
            Onboarding de alto risco e Compliance regulatório.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '10px' }}>
             <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: 'rgba(184, 145, 74, 0.1)', borderRadius: '8px' }}>
                   <ShieldCheck className="snc-brass" size={24} />
                </div>
                <div>
                   <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>Fé Pública e Evidência</h4>
                   <p style={{ fontSize: '14px', color: '#8a94a3', margin: 0, lineHeight: '1.5' }}>
                      Dados extraídos diretamente de fontes soberanas com registro de timestamp imutável.
                   </p>
                </div>
             </div>

             <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: 'rgba(184, 145, 74, 0.1)', borderRadius: '8px' }}>
                   <Fingerprint className="snc-brass" size={24} />
                </div>
                <div>
                   <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>Rastreabilidade Digital</h4>
                   <p style={{ fontSize: '14px', color: '#8a94a3', margin: 0, lineHeight: '1.5' }}>
                      Assinatura digital SHA-256 única para cada dossiê, garantindo a integridade absoluta da informação.
                   </p>
                </div>
             </div>
          </div>

          <div className="snc-ds-ctas" style={{ marginTop: '20px' }}>
            <Link
              href="/plataforma"
              className="snc-btn snc-btn-primary"
              style={{ padding: '16px 28px', fontSize: '14px' }}
            >
              Conheça a Plataforma <ExternalLink size={16} />
            </Link>
          </div>
        </div>

        {/* Coluna direita - Preview Visual do Relatório */}
        <div style={{
          padding: '20px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent'
        }}>
           <div style={{
             width: '100%',
             maxWidth: '520px',
             background: '#f4f1ea',
             border: '1px solid #d4cfc1',
             borderRadius: '2px',
             boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
             position: 'relative',
             transition: 'all 0.4s ease',
             overflow: 'hidden'
           }}>

              {/* Filtro de Ruído de Papel */}
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.04,
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                zIndex: 10
              }}></div>

              {/* Header Principal Navy */}
              <div style={{ background: '#0a1628', color: '#fff', padding: '24px 30px', borderBottom: '4px solid #2ba84a' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '14px' }}>
                    <div>
                       <div style={{ fontSize: '11px', fontFamily: 'var(--font-caslon)', fontWeight: 'bold', color: '#fff', letterSpacing: '0.02em' }}>Sistema Nacional de Conformidade</div>
                       <div style={{ fontSize: '8px', color: '#b8914a', marginTop: '2px', fontWeight: '500' }}>GOVERNANÇA E SEGURANÇA JURÍDICA</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '7px', color: '#b8914a', letterSpacing: '0.12em', fontWeight: 'bold' }}>PROTOCOLO SNC</div>
                       <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#fff' }}>2026.0505-9999</div>
                    </div>
                 </div>
                 <h3 style={{ fontSize: '26px', fontFamily: 'var(--font-caslon)', lineHeight: '1.1', fontStyle: 'italic', margin: 0, color: '#fff' }}>
                    Consulta de conformidade <br/> integral e risco.
                 </h3>
              </div>

              {/* Meta Strip */}
              <div style={{ background: '#0e1d36', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #1a2742' }}>
                 {[
                   { l: 'SUJEITO', v: 'JOÃO DA SILVA' },
                   { l: 'CPF', v: '000.000...' },
                   { l: 'MÓDULO', v: 'SNC' },
                   { l: 'VALIDADE', v: '30 DIAS' }
                 ].map((m, i) => (
                   <div key={i} style={{ padding: '8px 12px', borderRight: i < 3 ? '1px solid #1a2742' : 'none' }}>
                      <div style={{ fontSize: '6px', color: '#b8914a', letterSpacing: '0.05em', fontWeight: 'bold', marginBottom: '2px' }}>{m.l}</div>
                      <div style={{ fontSize: '9px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: 'var(--font-mono)' }}>{m.v}</div>
                   </div>
                 ))}
              </div>

              {/* Conteúdo Paper */}
              <div style={{ padding: '32px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ height: '1px', flex: 1, background: '#d4cfc1' }}></div>
                    <span style={{ fontSize: '9px', color: '#b8914a', fontFamily: 'var(--font-mono)', fontWeight: 'bold', letterSpacing: '0.1em' }}>§ 01 · SUMÁRIO</span>
                    <div style={{ height: '1px', flex: 1, background: '#d4cfc1' }}></div>
                 </div>

                 {/* Perfil e Status */}
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: '24px', marginBottom: '28px' }}>
                    <div>
                       <div style={{ fontSize: '8px', color: '#6a7282', letterSpacing: '0.05em', fontWeight: 'bold' }}>PESSOA FÍSICA IDENTIFICADA</div>
                       <div style={{ fontSize: '20px', fontFamily: 'var(--font-caslon)', margin: '6px 0', color: '#0a1628' }}>JOÃO DA SILVA EXEMPLO</div>
                       <div style={{ display: 'flex', gap: '12px' }}>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#3a4252' }}>000.000.000-00</span>
                          <span style={{ fontSize: '10px', color: '#2ba84a', fontWeight: 'bold' }}>REGULAR</span>
                       </div>
                    </div>

                    {/* Box de Parecer */}
                    <div style={{ background: '#fff', border: '1px solid #d4cfc1', padding: '14px', position: 'relative' }}>
                       <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#2ba84a' }}></div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '18px', height: '18px', background: '#2ba84a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                             <ShieldCheck size={10} />
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0a1628' }}>SNC VALIDADO</div>
                       </div>
                       <div style={{ fontSize: '8px', color: '#6a7282', lineHeight: '1.4' }}>
                          Nenhuma ocorrência impeditiva encontrada.
                       </div>
                    </div>
                 </div>

                 {/* Seção Judicial */}
                 <div style={{ marginBottom: '24px' }}>
                    <div style={{ background: '#0a1628', color: '#fff', fontSize: '9px', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                       <span>PROCESSOS JUDICIAIS</span>
                       <span style={{ opacity: 0.7 }}>1 REGISTRO</span>
                    </div>
                    <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf8f1', border: '1px solid #d4cfc1', borderTop: 'none' }}>
                       <div>
                          <div style={{ fontSize: '11px', fontWeight: '600', color: '#0a1628' }}>1002845-12.2024.8.26.0100</div>
                          <div style={{ fontSize: '8px', color: '#6a7282', marginTop: '2px' }}>TJSP · Cível · Arquivado</div>
                       </div>
                       <div style={{ fontSize: '9px', padding: '3px 8px', background: 'rgba(184, 145, 74, 0.1)', color: '#b8914a', border: '1px solid rgba(184, 145, 74, 0.2)', fontWeight: 'bold', borderRadius: '2px' }}>CONSTA</div>
                    </div>
                 </div>

                 {/* Antecedentes Grid */}
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ border: '1px solid #d4cfc1', background: '#faf8f1', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          <div style={{ fontSize: '6px', color: '#6a7282', fontWeight: 'bold' }}>FEDERAL</div>
                          <div style={{ fontSize: '10px', color: '#0a1628' }}>Antecedentes PF</div>
                       </div>
                       <span style={{ fontSize: '9px', color: '#2ba84a', fontWeight: 'bold' }}>NADA CONSTA</span>
                    </div>
                    <div style={{ border: '1px solid #d4cfc1', background: '#faf8f1', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div>
                          <div style={{ fontSize: '6px', color: '#6a7282', fontWeight: 'bold' }}>ESTADUAL</div>
                          <div style={{ fontSize: '10px', color: '#0a1628' }}>Antecedentes PC</div>
                       </div>
                       <span style={{ fontSize: '9px', color: '#2ba84a', fontWeight: 'bold' }}>NADA CONSTA</span>
                    </div>
                 </div>

                 {/* Digital Fingerprint */}
                 <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #d4cfc1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                       <div style={{ maxWidth: '70%' }}>
                          <div style={{ fontSize: '7px', color: '#b8914a', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '0.05em' }}>DIGITAL FINGERPRINT · SHA-256</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: '#6a7282', wordBreak: 'break-all', fontStyle: 'italic', lineHeight: '1.4' }}>
                             e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                          </div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <div style={{ width: '40px', height: '40px', border: '1px solid #b8914a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6px', color: '#b8914a', textAlign: 'center', lineHeight: '1', fontStyle: 'italic' }}>
                             SNC<br/>VAL
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
