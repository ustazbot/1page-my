import { NextResponse } from 'next/server'
import { clearAdminSessionCookie } from '@/lib/admin-session'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const res = NextResponse.redirect(new URL('/admin', baseUrl))
  clearAdminSessionCookie(res)
  return res
}
