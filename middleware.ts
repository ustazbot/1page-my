import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/admin-session'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const response = NextResponse.next()

  // 1. Tracking cookie — set ref on any page visit with ?ref=
  const ref = searchParams.get('ref')
  if (ref && /^[A-Z0-9]{6}$/i.test(ref)) {
    response.cookies.set('ref', ref, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Must be false so order form JS can read it
      sameSite: 'lax',
      path: '/',
    })
  }

  // 2. Admin route protection — all /admin/* except /admin (login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const session = await getAdminSessionFromRequest(request)
    if (!session) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
