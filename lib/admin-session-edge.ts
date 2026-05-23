// Edge-safe admin session verification — no next/headers import.
// Used by middleware.ts (Edge Runtime).
import { NextRequest } from 'next/server'

const COOKIE_NAME = '__admin_session'

interface AdminSession {
  loggedIn: boolean
  exp: number
}

async function getSecret(): Promise<CryptoKey> {
  const raw = process.env.ADMIN_SESSION_SECRET
  if (!raw) throw new Error('ADMIN_SESSION_SECRET not set')
  return crypto.subtle.importKey(
    'raw', new TextEncoder().encode(raw),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  )
}

async function sign(payload: string): Promise<string> {
  const key = await getSecret()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Buffer.from(sig).toString('hex')
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
