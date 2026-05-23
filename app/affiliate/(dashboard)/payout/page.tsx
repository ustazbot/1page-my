import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'
import { supabaseServer } from '@/lib/supabase'
import { getPayoutDate, formatMYDate, currentMonth } from '@/lib/payout-date'

type PayoutRow = {
  id: string
  payout_month: string
  total_amount: number
  status: string
  paid_at: string | null
  payment_reference: string | null
}

export default async function PayoutPage() {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/affiliate/login')

  const sb = supabaseServer()
  const { data: payouts } = await sb
    .from('payouts')
    .select('*')
    .eq('affiliate_id', session.user.id)
    .order('payout_month', { ascending: false }) as { data: PayoutRow[] | null }

  const month = currentMonth()
  const payoutDate = getPayoutDate(month)

  const { data: pendingRefs } = await sb
    .from('referrals')
    .select('commission_amount')
    .eq('affiliate_id', session.user.id)
    .eq('earned_month', month)
    .neq('status', 'paid')

  const pendingAmount = (pendingRefs ?? []).reduce((s, r) => s + Number(r.commission_amount), 0)

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>
        Sejarah Payout
      </h1>
      <p style={{ fontSize: 13, color: '#78716C', marginBottom: 24 }}>
        Komisyen bulan semasa akan dibayar pada 7hb bulan berikutnya.
      </p>

      {pendingAmount > 0 && (
        <div style={{ background: '#FFF7ED', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#92400E', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>Bulan ini ({month}): <strong>RM {pendingAmount.toFixed(2)}</strong> belum dibayar</span>
          <span>Dijangka dibayar: <strong>{formatMYDate(payoutDate)}</strong></span>
        </div>
      )}

      {!payouts || payouts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e7e5e4', borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#78716C' }}>Belum ada rekod payout.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ background: '#F8F6F1' }}>
                {['Bulan', 'Jumlah', 'Status', 'Tarikh Bayar', 'Rujukan'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{p.payout_month}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#1C1917' }}>RM {Number(p.total_amount).toFixed(2)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {p.status === 'paid'
                      ? <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A' }}>✅ Dibayar</span>
                      : <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#FEF9C3', color: '#CA8A04' }}>⏳ Belum</span>
                    }
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>
                    {p.paid_at
                      ? new Date(p.paid_at).toLocaleDateString('ms-MY')
                      : `Dijangka ${formatMYDate(getPayoutDate(p.payout_month))}`
                    }
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C', fontFamily: 'monospace' }}>
                    {p.payment_reference ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
