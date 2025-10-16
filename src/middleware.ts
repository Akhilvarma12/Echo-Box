import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = request.nextUrl

  // Redirect logged-in users away from auth pages
  if (token && (
      pathname.startsWith('/sign-in') ||
      pathname.startsWith('/sign-up') ||
      pathname.startsWith('/verify')
    )
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users trying to access protected pages
  if (!token && (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/home')
    )
  ) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Otherwise, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/dashboard/:path*',
    '/verify/:path*',
    '/home'
  ],
}
