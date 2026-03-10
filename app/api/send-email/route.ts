import { NextRequest, NextResponse } from "next/server";

interface Body {
  name: string;
  email: string;
  project: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not set." },
      { status: 500 }
    );
  }

  try {
    const { name, email, project }: Body = await req.json();

    if (!name || !email || !project) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const subject = `Thanks for exploring ${project}`;

    const textBody = `
Hello ${name},

Thank you for exploring "${project}" on our Interactive ArchViz platform.

Our team will contact you shortly with more information about the project.

Best regards,
Interactive ArchViz Studio
`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#0d1117;color:#e6edf3;padding:40px;">
  <div style="max-width:600px;margin:auto;background:#161b22;padding:30px;border-radius:12px;border:1px solid #30363d;">
    <h2>Hello ${name}</h2>

    <p>
      Thank you for exploring <b>${project}</b>.
    </p>

    <p>
      Our team will contact you shortly with more details about the project.
    </p>

    <br/>

    <p style="font-size:13px;color:#8b949e;">
      Interactive ArchViz Studio
    </p>
  </div>
</body>
</html>
`;

    const resend = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Interactive ArchViz <onboarding@resend.dev>",
        to: [email],
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!resend.ok) {
      const errorText = await resend.text();
      console.error("Resend error:", errorText);
      return NextResponse.json({ error: "Email failed to send." });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}