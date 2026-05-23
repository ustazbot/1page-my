'use client'

import { useEffect, useState, useCallback } from 'react'
import { getPayoutDate, formatMYDate } from '@/lib/payout-date'

type PayoutLine = {
  affiliate_id: string
  nama: string
  bank_name: string
  bank_account: string
  bank_holder_name: string
  total_amount: number
}

function getMonthOptions(): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export default function AdminPayoutsPage() {
  const months = getMonthOptions()
  const [selectedMonth, setSelectedMonth] = useState(months[1])
  const [payouts, setPayouts] = useState<PayoutLine[]>([])
  const [loading, setLoading] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [paymentRef, setPaymentRef] = useState<Record<string, string>>({})

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/admin/payouts?month=${selectedMonth}`)
      .then(r => r.json())
      .then((d: { payouts?: PayoutLine[] }) => { setPayouts(d.payouts ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedMonth])

  useEffect(() => { load() }, [load])

  async function createAndMarkPaid(line: PayoutLine) {
    const ref = paymentRef[line.affiliate_id]
    if (!ref?.trim()) { alert('Masukkan rujukan pindahan bank terlebih dahulu'); return }

    setMarkingId(line.affiliate_id)
    try {
      const createRes = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          affiliate_id: line.affiliate_id,
          payout_month: selectedMonth,
          total_amount: line.total_amount,
        }),
      })
      const { payout } = await createRes.json() as { payout?: { id: string } }
      if (!payout?.id) throw new Error('Gagal buat rekod payout')

      await fetch(`/api/admin/payouts/${payout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_reference: ref.trim() }),
      })

      alert(`Payout untuk ${line.nama} ditanda sebagai dibayar.`)
      load()
    } catch (err) {
      console.error('[admin payouts]', err)
      alert('Gagal proses payout. Cuba lagi.')
    } finally {
      setMarkingId(null)
    }
  }

  const payoutDate = formatMYDate(getPayoutDate(selectedMonth))
  const total = payouts.reduce((s, p) => s + Number(p.total_amount), 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917' }}>
          Proses Payout
        </h1>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          style={{ padding: '8px 14px', fontSize: 13, border: '1px solid #e7e5e4', borderRadius: 8, background: '#fff', color: '#1C1917', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
        >
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ background: '#FFF7ED', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#92400E' }}>
        Tarikh bayar untuk komisyen <strong>{selectedMonth}</strong>: <strong>{payoutDate}</strong>
      </div>

      {loading ? (
        <p style={{ color: '#78716C', fontSize: 13 }}>Memuatkan...</p>
      ) : payouts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e7e5e4', borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#78716C' }}>Tiada komisyen tertunggak untuk bulan ini.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
            <thead>
              <tr style={{ background: '#F8F6F1' }}>
                {['Nama Affiliate', 'Bank', 'Akaun', 'Pemilik Akaun', 'Jumlah', 'Rujukan Bank', 'Tindakan'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payouts.map((p, i) => (
                <tr key={p.affiliate_id} style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined }}>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{p.nama}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>{p.bank_name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C', fontFamily: 'monospace' }}>{p.bank_account}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#78716C' }}>{p.bank_holder_name}</td>
                  <td style={{ padding: '12px 14px', fontSize: 14, fontWeight: 700, color: '#1C1917', whiteSpace: 'nowrap' }}>RM {Number(p.total_amount).toFixed(2)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <input
                      placeholder="TRF-001"
                      value={paymentRef[p.affiliate_id] ?? ''}
                      onChange={e => setPaymentRef(prev => ({ ...prev, [p.affiliate_id]: e.target.value }))}
                      style={{ padding: '6px 10px', fontSize: 12, border: '1px solid #e7e5e4', borderRadius: 6, width: 110, fontFamily: 'monospace', outline: 'none' }}
                    />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => createAndMarkPaid(p)}
                      disabled={markingId === p.affiliate_id}
                      style={{ padding: '6px 14px', fontSize: 11, fontWeight: 600, background: '#F0FDF4', color: '#16A34A', border: '1px solid rgba(22,163,74,0.3)', borderRadius: 6, cursor: markingId === p.affiliate_id ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}
                    >
                      {markingId === p.affiliate_id ? '...' : '✓ Mark Paid'}
                    </button>
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr style={{ borderTop: '2px solid #e7e5e4', background: '#F8F6F1' }}>
                <td colSpan={4} style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#1C1917' }}>JUMLAH KESELURUHAN</td>
                <td style={{ padding: '12px 14px', fontSize: 16, fontWeight: 700, color: '#F97316' }}>RM {total.toFixed(2)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
