import { NextResponse } from 'next/server'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'

export async function GET() {
  const supabase = createAffiliateServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/affiliate/login', process.env.NEXT_PUBLIC_BASE_URL!))
}
