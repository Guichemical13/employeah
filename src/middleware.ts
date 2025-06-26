import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedRoutes = [
  '/app/app',
  '/app/app/admin',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    try {
      const user = await verifyToken(req);
      if (!user) throw new Error();
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/app/:path*'],
};
