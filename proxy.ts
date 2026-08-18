import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Optimistic, fast first-line check only (redirect unauthenticated visitors
// away from /admin before rendering anything). This is NOT the real access
// control — role checks happen server-side per-page via requireRole()/
// requireOneOfRoles() in src/lib/dal.ts, close to the data, per Next.js's
// own guidance (see node_modules/next/dist/docs/.../16-proxy.md: "Proxy ...
// should not be used as a full session management or authorization
// solution").
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/apply/:path*'],
};
