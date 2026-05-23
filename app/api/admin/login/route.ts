import { NextRequest, NextResponse } from 'next/server'
import { createAdminSessionCookie } from '@/lib/admin-session'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email?: string; password?: string }

  if (
    !email || !password ||
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Kredensial tidak sah' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  await createAdminSessionCookie(res)
  return res
}
