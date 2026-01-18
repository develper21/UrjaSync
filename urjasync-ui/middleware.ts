import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Route aliases for shorter URLs
  const routeAliases = {
    '/login': '/auth/login',
    '/register': '/auth/register',
    '/forgot-password': '/auth/forgot-password',
    '/verify-email': '/auth/verify-email',
    '/reset-password': '/auth/reset-password',
  };

  // Check if current path matches any alias
  if (routeAliases[pathname as keyof typeof routeAliases]) {
    const newUrl = new URL(routeAliases[pathname as keyof typeof routeAliases], request.url);
    return NextResponse.redirect(newUrl);
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register', 
    '/forgot-password',
    '/verify-email',
    '/reset-password',
  ],
};
