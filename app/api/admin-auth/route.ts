import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";

// ── Secure admin password check ───────────────────────────────────────────────
//
//  Set ADMIN_PASSWORD_HASH in Vercel env vars (never store plain text).
//
//  To generate your hash, run this in your terminal:
//    node -e "const {createHash}=require('crypto'); console.log(createHash('sha256').update('YourPasswordHere').digest('hex'))"
//
//  Then add ADMIN_PASSWORD_HASH=<the output> to Vercel environment variables.
//
//  Falls back to ADMIN_PASSWORD (plain text) for local dev convenience only.
// ─────────────────────────────────────────────────────────────────────────────

function checkPassword(input: string): boolean {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const plain = process.env.ADMIN_PASSWORD;

  if (hash) {
    // Compare SHA-256 hashes using timing-safe comparison (prevents timing attacks)
    const inputHash = createHash("sha256").update(input).digest();
    const storedHash = Buffer.from(hash, "hex");
    if (inputHash.length !== storedHash.length) return false;
    return timingSafeEqual(inputHash, storedHash);
  }

  if (plain) {
    // Plain text fallback — only for local dev, not recommended for production
    const inputBuf  = Buffer.from(input);
    const plainBuf  = Buffer.from(plain);
    if (inputBuf.length !== plainBuf.length) return false;
    return timingSafeEqual(inputBuf, plainBuf);
  }

  // Neither env var set — deny all access and log a warning
  console.warn("⚠️  ADMIN_PASSWORD_HASH not set. Admin panel is locked. Add it to Vercel env vars.");
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (checkPassword(password)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Deliberate delay to slow down brute-force attempts
    await new Promise(r => setTimeout(r, 500));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
