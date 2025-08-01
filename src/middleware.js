import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  console.log('Middleware: Path:', pathname, 'Token:', token);

  // Allow access to login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/logo.png')) {
    console.log('Middleware: Allowing access to', pathname);
    return NextResponse.next();
  }

  // Check for valid token
  if (!token) {
    console.log('Middleware: No token, redirecting to /login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = JSON.parse(atob(token));
    console.log('Middleware: Decoded token:', decoded);
    if (decoded.username !== 'admin') {
      console.log('Middleware: Invalid username, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log('Middleware: Valid token, proceeding to', pathname);
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware: Invalid token:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/api/:path*'],
};