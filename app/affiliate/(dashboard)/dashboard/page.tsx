import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'
import { supabaseServer } from '@/lib/supabase'
import type { AffiliateRow } from '@/lib/affiliate-auth'
import { currentMonth } from '@/lib/payout-date'
import { CopyButton } from '@/components/affiliate/CopyButton'

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#F5F5F4', color: '#78716C', label: 'Menunggu Kelulusan' },
  active:    { bg: '#FFF7ED', color: '#EA580C', label: 'Aktif' },
  suspended: { bg: '#FEF2F2', color: '#DC2626', label: 'Digantung' },
}

export default async function DashboardPage() {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/affiliate/login')

  const sb = supabaseServer()
  const { data: affiliate } = await sb
    .from('affiliates')
    .select('*')
    .eq('id', session.user.id)
    .single() as { data: AffiliateRow | null }

  if (!affiliate) redirect('/affiliate/login')

  const month = currentMonth()
  const { data: thisMonthRefs } = await sb
    .from('referrals')
    .select('commission_amount')
    .eq('affiliate_id', session.user.id)
    .eq('earned_month', month)

  const thisMonthEarned = (thisMonthRefs ?? []).reduce((s, r) => s + Number(r.commission_amount), 0)
  const thisMonthCount = (thisMonthRefs ?? []).length
  const pending = Number(affiliate.total_earned) - Number(affiliate.total_paid)
  const refLink = `${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${affiliate.ref_code}`
  const badge = STATUS_BADGE[affiliate.status] ?? STATUS_BADGE.pending

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, color: '#1C1917', marginBottom: 4 }}>
            Selamat datang, {affiliate.nama.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 13, color: '#78716C' }}>Dashboard Affiliate 1page.my</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </div>

      {/* Ref link card */}
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Pautan Referral Anda
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <code style={{ flex: 1, fontSize: 13, color: '#F97316', background: '#FFF7ED', padding: '10px 14px', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {refLink}
          </code>
          <CopyButton text={refLink} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Dijana', value: `RM ${Number(affiliate.total_earned).toFixed(2)}`, highlight: false },
          { label: 'Total Dibayar', value: `RM ${Number(affiliate.total_paid).toFixed(2)}`, highlight: false },
          { label: 'Belum Dibayar', value: `RM ${pending.toFixed(2)}`, highlight: pending > 0 },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff',
            border: `1px solid ${stat.highlight ? 'rgba(249,115,22,0.3)' : '#e7e5e4'}`,
            borderRadius: 10, padding: '20px 18px',
          }}>
            <p style={{ fontSize: 12, color: '#78716C', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 22, fontWeight: 700, color: stat.highlight ? '#F97316' : '#1C1917', fontFamily: 'Plus Jakarta Sans, sans-serif', margin: 0 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* This month bar */}
      <div style={{ background: '#FFF7ED', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#92400E' }}>
        Bulan ini ({month}): <strong>{thisMonthCount} referral</strong> · <strong>RM {thisMonthEarned.toFixed(2)}</strong> dijana
      </div>
    </div>
  )
}
