import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'admin_token';

// We duplicate verifyToken here because we can't import from route.ts in middleware easily due to edge runtime limitations (though next-server might allow it, it's safer to inline)
// Note: crypto is polyfilled in Edge but WebCrypto is preferred. However, since middleware runs in edge, we use WebCrypto for token verification.

async function verifyTokenEdge(token: string, sessionSecret: string, adminSecret: string): Promise<boolean> {
  try {
    const { payload, sig } = JSON.parse(atob(token.replace(/-/g, '+').replace(/_/g, '/')));
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(sessionSecret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    
    const dataToSign = encoder.encode(`${adminSecret}:${payload}`);
    const expectedSigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, dataToSign);
    
    // Convert ArrayBuffer to hex
    const expectedSigArray = Array.from(new Uint8Array(expectedSigBuffer));
    const expectedSigHex = expectedSigArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return sig === expectedSigHex;
  } catch (e) {
    return false;
  }
}


export default async function proxy(request: NextRequest) {
  // Only protect /admin and subpaths, except /admin/login
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const adminSecret = process.env.ADMIN_SECRET;
    const sessionSecret = process.env.SESSION_SECRET;

    if (!token || !adminSecret || !sessionSecret) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const isValid = await verifyTokenEdge(token, sessionSecret, adminSecret);

    if (!isValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
