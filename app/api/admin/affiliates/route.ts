import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { supabaseServer } from '@/lib/supabase'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = supabaseServer()
  const { data: affiliates, error } = await sb
    .from('affiliates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get emails from auth.users via admin API
  const { data: usersData } = await sb.auth.admin.listUsers({ perPage: 1000 })
  const emailMap: Record<string, string> = {}
  for (const u of usersData?.users ?? []) {
    emailMap[u.id] = u.email ?? ''
  }

  const result = (affiliates ?? []).map(a => ({
    ...a,
    email: emailMap[a.id] ?? '',
  }))

  return NextResponse.json({ affiliates: result })
}
