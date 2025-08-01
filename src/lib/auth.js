import { NextResponse } from 'next/server';

export function authMiddleware(handler) {
  return async (request, context) => {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.username !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return await handler(request, context);
    } catch (error) {
      console.error('Invalid token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}