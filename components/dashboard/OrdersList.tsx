'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppState } from '@/lib/store'
import { orderToClientData, type SupabaseOrder } from '@/lib/intake'
import { markProcessed } from '@/lib/jobs'

type OrderSummary = {
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
  pending:       '#6b7280',
  preview_ready: '#3b82f6',
  approved:      '#f59e0b',
  paid:          '#22c55e',
  live:          '#15803d',
}

const STATUS_LABEL: Record<string, string> = {
  pending:       'Pending',
  preview_ready: 'Preview Sedia',
  approved:      'Diluluskan',
  paid:          'Paid',
  live:          'Live',
}

export default function OrdersList() {
  const { dispatch } = useAppState()
  const [orders, setOrders]   = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [loadedId, setLoadedId]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then((d: { orders?: OrderSummary[] }) => { setOrders(d.orders ?? []); setLoading(false) })
      .catch(() => { setError('Gagal load orders'); setLoading(false) })
  }, [])

  const handleLoad = useCallback(async (id: string, bisnes: string) => {
    setLoadingId(id)
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) throw new Error()
      const { order } = await res.json() as { order: SupabaseOrder }
      const clientData = orderToClientData(order)
      dispatch({ type: 'SET_CLIENT', payload: clientData })
      dispatch({ type: 'SET_MODULE_STATUS', module: 'intake', status: 'complete' })
      markProcessed(id, bisnes, clientData.project.slug)
      setLoadedId(id)
    } catch {
      alert('Gagal load order. Cuba lagi.')
    } finally {
      setLoadingId(null)
    }
  }, [dispatch])

  if (loading) return <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Memuatkan...</p>
  if (error)   return <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>
  if (orders.length === 0) return (
    <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
      Tiada order lagi. Order akan muncul di sini setelah client isi borang.
    </p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      {orders.map((order) => {
        const isLoaded  = loadedId === order.id
        const isLoading = loadingId === order.id
        const color     = STATUS_COLOR[order.status] ?? '#6b7280'

        return (
          <div key={order.id} style={{
            padding: '12px 16px',
            background: 'var(--color-surface)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            {/* status dot */}
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: color, flexShrink: 0,
            }} />

            {/* info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {order.nama_bisnes}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {order.nama_owner} · {order.whatsapp}
                {order.preview_url && (
                  <> · <a href={order.preview_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-info)' }}>preview</a></>
                )}
                {order.live_url && (
                  <> · <a href={order.live_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-success)' }}>live</a></>
                )}
              </p>
            </div>

            {/* status badge */}
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: `${color}22`, color,
              flexShrink: 0, letterSpacing: '0.04em',
            }}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>

            {/* load button */}
            <button
              onClick={() => handleLoad(order.id, order.nama_bisnes)}
              disabled={isLoading}
              style={{
                height: 28, padding: '0 12px', flexShrink: 0,
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)',
                background: isLoaded ? 'rgba(34,197,94,0.1)' : 'rgba(232,160,32,0.1)',
                color: isLoaded ? 'var(--color-success)' : 'var(--color-accent)',
                border: `1px solid ${isLoaded ? 'rgba(34,197,94,0.3)' : 'rgba(232,160,32,0.3)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: isLoading ? 'wait' : 'pointer',
                transition: 'all 0.1s',
                letterSpacing: '0.02em',
              }}
            >
              {isLoading ? '...' : isLoaded ? '✓ Loaded' : 'Load'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
