import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const PUBLIC_ROUTES = ['/login', '/register', '/api/auth/login', '/api/auth/register', '/api/health'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // If it's an API route without token, return 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // For UI pages, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const payload = await verifyToken(token);

    // RBAC: Check if accessing Admin endpoints/pages
    const isAdminArea =
      pathname.startsWith('/api/admin') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/users');

    if (isAdminArea) {
      if (payload.role !== 'ADMIN') {
        // Return 403 Forbidden for API
        if (pathname.startsWith('/api')) {
          return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
        // Redirect to dashboard for UI
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Attach user to headers so API routes can access the context
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Invalid token
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
