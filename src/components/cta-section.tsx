import Link from 'next/link';
import { ContactForm } from '@/components/contact-form';

export function CtaSection() {
  return (
    <section className="snc-cta" id="contato-sec">
      <div className="snc-cta-bg">
        <img src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1920&q=80" alt="" />
      </div>
      <div className="snc-cta-in">
        <div className="snc-cta-left">
          <div className="kicker">§ 08 · CONTATO INSTITUCIONAL</div>
          <h2>
            Conversar é <span className="it">o primeiro ato</span> de conformidade.
          </h2>
          <p>
            Nossos especialistas atendem instituições financeiras, operadores regulados, governo
            e grandes corporações. Apresentação de 45 minutos com demonstração ao vivo sobre
            o seu caso concreto.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
            <Link href="/contato" className="snc-btn snc-btn-primary">
              Agendar apresentação →
            </Link>
            <Link href="/datasets" className="snc-btn snc-btn-ghost">
              Explorar datasets
            </Link>
          </div>
          <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, maxWidth: 500 }}>
            <div>
              <div style={{ fontFamily: 'monospace', color: 'var(--snc-brass)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 8 }}>
                Porto Alegre · Sede
              </div>
              <div style={{ color: '#bcc4d1', fontSize: 13, lineHeight: 1.6 }}>
                Av. Ipiranga, 40<br />Trend City Center Office · Salas 1201/1212<br />CEP 90160-090 · Porto Alegre / RS
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', color: 'var(--snc-brass)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 8 }}>
                Porto Alegre · Operação
              </div>
              <div style={{ color: '#bcc4d1', fontSize: 13, lineHeight: 1.6 }}>
                Av. Ipiranga, 40<br />Trend City Center Office · Salas 1201/1212<br />CEP 90160-090 · Porto Alegre / RS
              </div>
            </div>
          </div>
        </div>
        <ContactForm variant="embedded" />
      </div>
    </section>
  );
}
