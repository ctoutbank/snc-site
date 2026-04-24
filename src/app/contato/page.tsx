import type { Metadata } from 'next';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ContactForm } from '@/components/contact-form';

export const metadata: Metadata = {
  title: 'Contato — Solicitar acesso ao SNC',
  description:
    'Responsabilidade de agendar uma apresentação de 45 minutos com demonstração ao vivo para o seu caso concreto. Resposta em 24h úteis.',
};

export default function ContatoPage() {
  return (
    <div className="snc-root">
      <SiteNav />
      <main>
        <section className="snc-cta" style={{ minHeight: '100vh' }}>
          <div className="snc-cta-bg">
            <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1920&q=80" alt="" />
          </div>
          <div className="snc-cta-in">
            <div className="snc-cta-left">
              <div className="kicker">§ CONTATO INSTITUCIONAL</div>
              <h2>
                Conversar é<br />
                <span className="it">o primeiro ato</span><br />
                de conformidade.
              </h2>
              <p>
                Resposta em até 24 horas úteis. Apresentação de 45 minutos
                com demonstração sobre o seu caso concreto.
              </p>

              <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 32 }}>
                {[
                  {
                    label: 'Porto Alegre · Sede',
                    value: 'Av. Ipiranga, 40\nTrend Office\nSala 1212\nCEP 90160-090 · Porto Alegre / RS',
                  },
                  {
                    label: 'E-mail institucional',
                    value: 'contato@snc.consolle.one',
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--snc-brass)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 8 }}>
                      {item.label}
                    </div>
                    <div style={{ color: '#bcc4d1', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ContactForm variant="full" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
