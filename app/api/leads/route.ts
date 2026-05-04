import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Default fallbacks if env isn't configured. Override per-environment
// via RESEND_API_KEY, LEAD_NOTIFY_TO, LEAD_NOTIFY_FROM.
const DEFAULT_NOTIFY_TO   = 'justin@luxrentalmgmt.com';
const DEFAULT_NOTIFY_FROM = 'InvestSMA <leads@investsma.com>';

type LeadInput = {
  name: string;
  email: string;
  phone?: string | null;
  budget?: string | null;
  timeline?: string | null;
  buyerType?: string | null;
  neighborhoods?: string[] | null;
  message?: string | null;
  sourcePage?: string | null;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as LeadInput;
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('leads').insert({
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      budget: body.budget ?? null,
      timeline: body.timeline ?? null,
      buyer_type: body.buyerType ?? null,
      neighborhoods: body.neighborhoods ?? null,
      message: body.message ?? null,
      source_page: body.sourcePage ?? 'unknown',
      status: 'new',
    });
    if (error) throw error;

    // Best-effort: notify the LRM team. We never fail the request when
    // email errors — the lead is already captured. TODO(crm): Pipedrive
    // sync once pipeline stages are defined.
    void notifyLead(body);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Lead capture failed' }, { status: 500 });
  }
}

async function notifyLead(body: LeadInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[leads] RESEND_API_KEY not set — skipping email notification');
    }
    return;
  }
  const to = process.env.LEAD_NOTIFY_TO || DEFAULT_NOTIFY_TO;
  const from = process.env.LEAD_NOTIFY_FROM || DEFAULT_NOTIFY_FROM;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      subject: `New investor lead · ${body.name}`,
      html: renderLeadEmail(body),
      replyTo: body.email,
    });
  } catch (e) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('[leads] Resend send failed', e);
    }
  }
}

function escape(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderLeadEmail(b: LeadInput): string {
  const rows: Array<[string, string]> = [
    ['Name', escape(b.name)],
    ['Email', `<a href="mailto:${escape(b.email)}">${escape(b.email)}</a>`],
    ['Phone', b.phone ? `<a href="tel:${escape(b.phone)}">${escape(b.phone)}</a>` : '—'],
    ['Budget', escape(b.budget) || '—'],
    ['Timeline', escape(b.timeline) || '—'],
    ['Buyer type', escape(b.buyerType) || '—'],
    ['Neighborhoods', (b.neighborhoods ?? []).map(escape).join(', ') || '—'],
    ['Source page', escape(b.sourcePage) || 'unknown'],
  ];

  const tableRows = rows.map(([k, v]) => `
    <tr>
      <td style="padding:8px 12px;color:#71717A;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;border-bottom:1px solid #E4E4E7;vertical-align:top;width:140px;">${k}</td>
      <td style="padding:8px 12px;font-family:'Inter',sans-serif;font-size:14px;color:#14130F;border-bottom:1px solid #E4E4E7;">${v}</td>
    </tr>
  `).join('');

  const messageBlock = b.message
    ? `<div style="margin-top:16px;padding:14px 16px;background:#FBF8F0;border-left:3px solid #C9A55A;font-family:'Inter',sans-serif;font-size:14px;color:#2A2722;line-height:1.55;">${escape(b.message).replace(/\n/g, '<br/>')}</div>`
    : '';

  return `
    <div style="background:#FBF8F0;padding:32px 16px;font-family:'Inter',sans-serif;color:#14130F;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E4E4E7;border-radius:6px;overflow:hidden;">
        <div style="padding:20px 24px;background:#14130F;color:#F5EFE2;">
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A55A;">New lead · InvestSMA</div>
          <div style="font-size:20px;font-weight:600;margin-top:6px;">${escape(b.name)}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">${tableRows}</table>
        ${messageBlock}
        <div style="padding:14px 24px;background:#FAF6EC;font-family:'JetBrains Mono',monospace;font-size:11px;color:#71717A;letter-spacing:0.06em;">
          Reply directly to this email to reach ${escape(b.name)}.
        </div>
      </div>
    </div>
  `;
}
