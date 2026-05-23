'use client'

import { useEffect, useState } from 'react'

type Order = {
  id: string
  created_at: string
  nama_bisnes: string
  nama_owner: string
  whatsapp: string
  status: string
  slug: string | null
  preview_url: string | null
  live_url: string | null
}

const STATUS_COLOR: Record<string, string> = {
  pending:       '#9ca3af',
  preview_ready: '#3b82f6',
  approved:      '#f59e0b',
  paid:          '#22c55e',
  live:          '#15803d',
}

export default function OrdersList() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((d: { orders?: Order[] }) => { setOrders(d.orders ?? []); setLoading(false) })
      .catch(() => { setError('Gagal load orders'); setLoading(false) })
  }, [])

  if (loading) return <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Memuatkan...</p>
  if (error)   return <p style={{ color: 'red', fontSize: 13 }}>{error}</p>
  if (orders.length === 0) return <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Tiada order lagi.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {orders.map((order) => (
        <div key={order.id} style={{
          padding: '14px 16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 3 }}>
              {order.nama_bisnes}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {order.nama_owner} · {order.whatsapp}
            </p>
            {order.preview_url && (
              <a href={order.preview_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: 'var(--color-accent)', display: 'block', marginTop: 4 }}>
                {order.preview_url}
              </a>
            )}
            {order.live_url && (
              <a href={order.live_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 11, color: 'var(--color-success)', display: 'block', marginTop: 2 }}>
                {order.live_url}
              </a>
            )}
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: `${STATUS_COLOR[order.status] ?? '#999'}22`,
            color: STATUS_COLOR[order.status] ?? '#999',
            flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {order.status}
          </span>
        </div>
      ))}
    </div>
  )
}
