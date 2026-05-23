import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'
import { supabaseServer } from '@/lib/supabase'

type ReferralRow = {
  id: string
  created_at: string
  order_amount: number
  commission_amount: number
  earned_month: string
  status: string
  orders: { nama_bisnes: string } | null
}

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: '#F5F5F4', color: '#78716C', label: 'Menunggu' },
  approved: { bg: '#FEF9C3', color: '#CA8A04', label: 'Disahkan' },
  paid:     { bg: '#F0FDF4', color: '#16A34A', label: 'Dibayar' },
}

export default async function ReferralsPage() {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/affiliate/login')

  const sb = supabaseServer()
  const { data: referrals } = await sb
    .from('referrals')
    .select('*, orders(nama_bisnes)')
    .eq('affiliate_id', session.user.id)
    .order('created_at', { ascending: false }) as { data: ReferralRow[] | null }

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>
        Referral Saya
      </h1>
      <p style={{ fontSize: 13, color: '#78716C', marginBottom: 24 }}>
        Senarai semua order yang dirujuk oleh anda
      </p>

      {!referrals || referrals.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e7e5e4', borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#78716C' }}>
            Belum ada referral. Kongsi pautan anda untuk mula menjana komisyen!
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ background: '#F8F6F1' }}>
                {['Tarikh', 'Nama Bisnes', 'Jumlah Order', 'Komisyen', 'Bulan', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {referrals.map((r, i) => {
                const badge = STATUS_BADGE[r.status] ?? STATUS_BADGE.pending
                return (
                  <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>
                      {new Date(r.created_at).toLocaleDateString('ms-MY')}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>
                      {r.orders?.nama_bisnes ?? '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#1C1917' }}>
                      RM {Number(r.order_amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#F97316' }}>
                      RM {Number(r.commission_amount).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>
                      {r.earned_month}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
