import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Special handling for delivery receipt endpoints
  if (path === '/api/delivery-receipt' || path === '/api/delivery-receipt2') {
    // Skip authentication for these endpoints
    // They'll be secured by API keys instead
    return NextResponse.next();
  }

  // Continue with default behavior for other routes
  return NextResponse.next();
}

// Configure which routes use the middleware
export const config = {
  matcher: [
    // Add routes that need special handling
    '/api/delivery-receipt',
    '/api/delivery-receipt2',
  ],
}; 