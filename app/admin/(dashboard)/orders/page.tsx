'use client'

import { useEffect, useState } from 'react'

type Order = {
  id: string
  created_at: string
  nama_bisnes: string
  status: string
  affiliate_ref_code: string | null
  toyyibpay_amount: number | null
  slug: string | null
}

const STATUS_LABELS: Record<string, string> = {
  all: 'Semua',
  pending: 'Pending',
  preview_ready: 'Preview Sedia',
  approved: 'Diluluskan',
  paid: 'Paid',
  live: 'Live',
}

const FILTERS = ['all', 'pending', 'preview_ready', 'approved', 'paid', 'live']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/orders?status=${filter}`)
      .then(r => r.json())
      .then((d: { orders?: Order[] }) => { setOrders(d.orders ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 20 }}>
        Orders
      </h1>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: `1px solid ${filter === f ? '#F97316' : '#e7e5e4'}`,
              background: filter === f ? '#FFF7ED' : '#fff',
              color: filter === f ? '#F97316' : '#78716C',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {STATUS_LABELS[f] ?? f}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#78716C', fontSize: 13 }}>Memuatkan...</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#F8F6F1' }}>
                {['Tarikh', 'Nama Bisnes', 'Status', 'Ref Affiliate', 'Jumlah', 'Slug'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#78716C', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#78716C', fontSize: 13 }}>Tiada order</td>
                </tr>
              ) : orders.map((o, i) => (
                <tr
                  key={o.id}
                  onClick={() => { window.location.href = `/admin/orders/${o.id}` }}
                  style={{ borderTop: i > 0 ? '1px solid #f5f5f4' : undefined, cursor: 'pointer' }}
                >
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C', whiteSpace: 'nowrap' }}>
                    {new Date(o.created_at).toLocaleDateString('ms-MY')}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{o.nama_bisnes}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: '#F5F5F4', color: '#78716C', whiteSpace: 'nowrap' }}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: o.affiliate_ref_code ? '#F97316' : '#78716C', fontFamily: 'monospace', fontWeight: o.affiliate_ref_code ? 700 : 400 }}>
                    {o.affiliate_ref_code ?? '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: '#1C1917', whiteSpace: 'nowrap' }}>
                    {o.toyyibpay_amount ? `RM ${Number(o.toyyibpay_amount).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#78716C', fontFamily: 'monospace' }}>
                    {o.slug ?? '—'}
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
