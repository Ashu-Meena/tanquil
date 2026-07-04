import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function signToken(secret: string, sessionSecret: string): string {
  const payload = `${Date.now()}`;
  const sig = createHmac("sha256", sessionSecret)
    .update(`${secret}:${payload}`)
    .digest("hex");
  return Buffer.from(JSON.stringify({ payload, sig })).toString("base64url");
}

export function verifyToken(token: string, sessionSecret: string): boolean {
  try {
    const { payload, sig } = JSON.parse(Buffer.from(token, "base64url").toString());
    const expected = createHmac("sha256", sessionSecret)
      .update(`${process.env.ADMIN_SECRET}:${payload}`)
      .digest("hex");
    // timingSafeEqual prevents timing attacks
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!adminSecret || !sessionSecret) {
    return NextResponse.json(
      { error: "Server misconfiguration. Contact administrator." },
      { status: 500 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const submitted = body.password ?? "";

  // timingSafeEqual prevents timing-based password guessing
  const isMatch = (() => {
    try {
      const a = Buffer.from(submitted.padEnd(64));
      const b = Buffer.from(adminSecret.padEnd(64));
      return timingSafeEqual(a, b) && submitted === adminSecret;
    } catch {
      return false;
    }
  })();

  if (!isMatch) {
    // Uniform delay to prevent timing enumeration
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const token = signToken(adminSecret, sessionSecret);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,       // JS cannot read this cookie — DevTools Application tab shows it but JS cannot access it
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict",   // CSRF protection — cookie not sent on cross-site requests
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
