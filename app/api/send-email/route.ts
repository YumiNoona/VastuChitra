import { NextRequest, NextResponse } from "next/server";

interface Visitor {
  name: string; email: string; project: string;
}
interface Body {
  recipients: Visitor[];
  subject: string;
  body: string;
}

// ── Template interpolation ───────────────────────────────────────────────────
function interpolate(template: string, v: Visitor) {
  return template
    .replace(/\{\{name\}\}/g, v.name)
    .replace(/\{\{project\}\}/g, v.project);
}

// ── POST /api/send-email ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not set. Add it to Vercel environment variables.", sent: 0, failed: 0 },
      { status: 500 }
    );
  }

  const { recipients, subject, body }: Body = await req.json();

  if (!recipients?.length) {
    return NextResponse.json({ sent: 0, failed: 0 });
  }

  let sent = 0;
  let failed = 0;

  // Send sequentially to stay within Resend rate limits on free tier (2 req/sec)
  for (const v of recipients) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "ArchViz Studio <onboarding@resend.dev>",
          to: [v.email],
          subject: interpolate(subject, v),
          text: interpolate(body, v),
          // html version — wraps plain text in a minimal dark-styled template
          html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${interpolate(subject, v)}</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:16px;border:1px solid #30363d;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:#c9a84c;height:4px;font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:40px;">
          <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8b949e;margin:0 0 24px;">Interactive ArchViz Studio</p>
          <div style="font-size:15px;line-height:1.8;color:#e6edf3;white-space:pre-wrap;">${interpolate(body, v).replace(/\n/g,"<br>")}</div>
          <hr style="border:none;border-top:1px solid #30363d;margin:32px 0;">
          <p style="font-size:12px;color:#8b949e;margin:0;">You received this because you explored an Interactive ArchViz project.</p>
        </td></tr>
        <tr><td style="background:#0d1117;padding:20px 40px;border-top:1px solid #30363d;">
          <p style="font-size:11px;color:#484f58;margin:0;">© Interactive ArchViz Studio</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
        }),
      });

      if (res.ok) { sent++; }
      else { failed++; console.error(`Resend error for ${v.email}:`, await res.text()); }

      // Rate limit: Resend free tier allows ~2 req/sec
      await new Promise(r => setTimeout(r, 600));
    } catch (err) {
      failed++;
      console.error(`Failed to send to ${v.email}:`, err);
    }
  }

  return NextResponse.json({ sent, failed });
}
