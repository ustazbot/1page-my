import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/admin-session-edge'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Subdomain detection — rewrite [subdomain].1page.my → /candidate/[subdomain]
  const hostname = request.headers.get('host') || ''
  const isMainDomain =
    hostname === '1page.my' ||
    hostname === 'www.1page.my' ||
    hostname.startsWith('localhost')

  if (!isMainDomain && hostname.endsWith('.1page.my')) {
    const subdomain = hostname.replace('.1page.my', '')
    const url = request.nextUrl.clone()

    // Skip if already rewritten
    if (!url.pathname.startsWith('/bisnes/') && !url.pathname.startsWith('/candidate/')) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

      let isBisnes = false
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/orders?slug=eq.${subdomain}&status=in.(preview_ready,paid,live)&select=id&limit=1`,
          { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
        )
        const rows = await res.json()
        isBisnes = Array.isArray(rows) && rows.length > 0
      } catch {
        // On fetch error, fall through to candidate
      }

      url.pathname = isBisnes
        ? `/bisnes/${subdomain}${url.pathname}`
        : `/candidate/${subdomain}${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

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

  // 3. Builder (web builder) protection — same admin credentials
  const BUILDER_ROUTES = ['/operator', '/assets', '/build', '/copywrite', '/deploy', '/intake', '/preview']
  if (BUILDER_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
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
