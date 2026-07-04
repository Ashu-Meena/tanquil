import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_token";

export async function POST() {
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
