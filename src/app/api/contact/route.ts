import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resend } from '@/lib/resend';

const schema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  institution: z.string().min(2),
  nature: z.string().min(2),
  context: z.string().optional(),
});

const RATE_MAP = new Map<string, { count: number; ts: number }>();
function checkRate(ip: string) {
  const now = Date.now();
  const e = RATE_MAP.get(ip);
  if (!e || now - e.ts > 60000) { RATE_MAP.set(ip, { count: 1, ts: now }); return true; }
  if (e.count >= 3) return false;
  e.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRate(ip)) return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

  const { fullName, email, institution, nature, context } = parsed.data;

  const result = await resend.emails.send({
    from: 'SNC — Consolle <noreply@consolle.one>',
    to: ['ceo@outbank.com.br'],
    replyTo: email,
    subject: `[SNC] Solicitação de acesso — ${institution}`,
    html: `
      <div style="font-family:Georgia,serif;background:#F4EFE4;padding:40px 48px">
        <div style="background:#0A1628;padding:32px 40px;margin-bottom:32px">
          <div style="font-size:11px;color:#B8914A;letter-spacing:.2em;text-transform:uppercase;margin-bottom:12px">§ NOVA SOLICITAÇÃO DE ACESSO</div>
          <div style="font-size:28px;color:#fff;font-weight:400">${fullName}</div>
          <div style="color:#8a94a3;font-size:13px;margin-top:6px;font-family:sans-serif">${institution} · ${nature}</div>
        </div>
        ${[['Nome', fullName],['E-mail', email],['Instituição', institution],['Natureza', nature]].map(([l,v]) => `<div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(15,26,36,.1);font-family:sans-serif"><span style="font-size:10px;color:#B8914A;letter-spacing:.12em;text-transform:uppercase">${l}</span><span style="font-size:13px;color:#0F1A24">${v}</span></div>`).join('')}
        ${context ? `<div style="margin-top:20px;background:#EDE6D4;padding:16px 20px;font-size:14px;color:#4a5662;line-height:1.6;font-family:sans-serif">${context}</div>` : ''}
        <div style="margin-top:28px"><a href="mailto:${email}?subject=Re: SNC — ${institution}" style="display:inline-block;padding:12px 22px;background:#2BA84A;color:#06240e;font-family:sans-serif;font-size:12px;font-weight:600;text-decoration:none;text-transform:uppercase;letter-spacing:.08em">Responder solicitação →</a></div>
      </div>
    `,
  });

  if (result.error) return NextResponse.json({ error: 'Erro ao enviar.' }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
