// lib/admin-session.ts
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = '__admin_session'
const MAX_AGE = 60 * 60 * 24 // 24 hours

async function getSecret(): Promise<CryptoKey> {
  const raw = process.env.ADMIN_SESSION_SECRET
  if (!raw) throw new Error('ADMIN_SESSION_SECRET not set')
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw', enc.encode(raw), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  )
}

async function sign(payload: string): Promise<string> {
  const key = await getSecret()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Buffer.from(sig).toString('hex')
}

interface AdminSession {
  loggedIn: boolean
  exp: number
}

export async function createAdminSessionCookie(res: NextResponse): Promise<void> {
  const payload = JSON.stringify({ loggedIn: true, exp: Date.now() + MAX_AGE * 1000 })
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = await sign(encoded)
  const value = `${encoded}.${sig}`
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true, sameSite: 'lax', maxAge: MAX_AGE, path: '/',
  })
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return null

  const dotIdx = raw.lastIndexOf('.')
  if (dotIdx === -1) return null
  const encoded = raw.slice(0, dotIdx)
  const sig = raw.slice(dotIdx + 1)

  const expectedSig = await sign(encoded)
  if (expectedSig !== sig) return null

  try {
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as AdminSession
    if (Date.now() > session.exp) return null
    return session
  } catch {
    return null
  }
}

export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
}

export async function getAdminSessionFromRequest(req: NextRequest): Promise<AdminSession | null> {
  const raw = req.cookies.get(COOKIE_NAME)?.value
  if (!raw) return null

  const dotIdx = raw.lastIndexOf('.')
  if (dotIdx === -1) return null
  const encoded = raw.slice(0, dotIdx)
  const sig = raw.slice(dotIdx + 1)

  const expectedSig = await sign(encoded)
  if (expectedSig !== sig) return null

  try {
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as AdminSession
    if (Date.now() > session.exp) return null
    return session
  } catch {
    return null
  }
}
