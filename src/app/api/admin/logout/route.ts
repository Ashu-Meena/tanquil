import { NextRequest, NextResponse } from "next/server";
import { checkFixedWindow, RATE_LIMIT_CONFIG } from "@/lib/rate-limit";

const COOKIE_NAME = "admin_token";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rateLimitResult = checkFixedWindow(ip, RATE_LIMIT_CONFIG.AUTHED_MAX_REQUESTS, RATE_LIMIT_CONFIG.AUTHED_WINDOW_MS);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429, 
        headers: { "Retry-After": Math.ceil(rateLimitResult.retryAfterMs! / 1000).toString() }
      }
    );
  }

  const response = NextResponse.json({ ok: true });
  // Clear the cookie by setting it with maxAge=0
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}
