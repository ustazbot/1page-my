// lib/affiliate-auth.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createAffiliateServerClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll()
        },
        async setAll(cookiesToSet) {
          try {
            const store = await cookieStore
            for (const { name, value, options } of cookiesToSet) {
              store.set(name, value, options)
            }
          } catch {
            // Called from a Server Component — safe to ignore.
            // Cookie refresh is handled by middleware.
          }
        },
      },
    }
  )
}

/**
 * Generates a 6-character alphanumeric ref code (no ambiguous chars).
 * Caller must verify uniqueness against the affiliates table.
 */
export function generateRefCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export type AffiliateRow = {
  id: string
  nama: string
  telefon: string
  bank_name: string
  bank_account: string
  bank_holder_name: string
  ref_code: string
  status: string
  total_earned: number
  total_paid: number
  created_at: string
}
