// app/admin/(dashboard)/orders/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

// ── TYPES ──────────────────────────────────────────────────────────────────

type Order = {
  id: string
  created_at: string
  nama_bisnes: string
  nama_owner: string
  whatsapp: string
  telefon: string
  email: string | null
  alamat: string
  waktu_operasi: string
  google_maps_link: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  tagline: string | null
  jenis_bisnes: string | null
  cerita_bisnes: string | null
  produk_servis: string
  target_pelanggan: string | null
  banner_atas_url: string
  logo_url: string | null
  gallery_urls: string[] | null
  template_pilihan: string
  domain_sendiri: boolean
  domain_url: string | null
  domain_pref_1: string | null
  domain_pref_2: string | null
  domain_pref_3: string | null
  catatan: string | null
  status: string
  slug: string | null
  preview_url: string | null
  live_url: string | null
  toyyibpay_bill_code: string | null
  toyyibpay_amount: number | null
}

// ── CONSTANTS ──────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  preview_ready: 'Preview Sedia',
  approved: 'Diluluskan',
  paid: 'Paid',
  live: 'Live',
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:       { bg: '#FEF3C7', color: '#92400E' },
  preview_ready: { bg: '#DBEAFE', color: '#1E40AF' },
  approved:      { bg: '#D1FAE5', color: '#065F46' },
  paid:          { bg: '#EDE9FE', color: '#5B21B6' },
  live:          { bg: '#D1FAE5', color: '#065F46' },
}

// ── HELPERS ────────────────────────────────────────────────────────────────

function buildWaText(preview_url: string, bill_code: string): string {
  return `Salam dari 1page.my\nPreview page anda dah siap!\nBoleh tengok preview di sini:\n${preview_url}\n\nJika setuju, sila buat bayaran RM150 di pautan ini untuk aktifkan page anda:\nhttps://toyyibpay.com/${bill_code}\n\nAda soalan? Balas WhatsApp ini ya 😊`
}

// ── DETAIL SECTION COMPONENT ───────────────────────────────────────────────

function DetailSection({ title, rows }: {
  title: string
  rows: [string, string | null | undefined][]
}) {
  const filtered = rows.filter(([, v]) => v)
  if (!filtered.length) return null
  return (
    <>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#78716C', marginTop: 16, marginBottom: 8 }}>
        {title}
      </p>
      {filtered.map(([label, value]) => (
        <div key={label} style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#a8a29e', display: 'block' }}>{label}</span>
          <span style={{ fontSize: 13, color: '#1C1917', wordBreak: 'break-word' }}>{value}</span>
        </div>
      ))}
    </>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [order, setOrder]             = useState<Order | null>(null)
  const [loading, setLoading]         = useState(true)
  const [fetchError, setFetchError]   = useState('')
  const [slug, setSlug]               = useState('')
  const [previewUrl, setPreviewUrl]   = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [actionError, setActionError] = useState('')
  const [copied, setCopied]           = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  // ── Fetch order ──────────────────────────────────────────────────────────

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      const d = await res.json()
      if (d.order) {
        setOrder(d.order)
        setSlug(d.order.slug ?? (d.order.domain_pref_1 ?? '').toLowerCase().replace(/[^a-z0-9-]/g, ''))
        setPreviewUrl(d.order.preview_url ?? '')
      } else {
        setFetchError('Order tidak dijumpai')
      }
    } catch {
      setFetchError('Gagal memuatkan order. Cuba refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrder() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ──────────────────────────────────────────────────────────────

  async function handleSetPreview() {
    setSubmitting(true)
    setActionError('')
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_preview', slug, preview_url: previewUrl }),
      })
      const data = await res.json()
      if (!res.ok) { setActionError(data.error || 'Gagal'); return }
      try {
        await fetchOrder()
      } catch {
        setActionError('Tindakan berjaya tapi gagal refresh. Cuba reload halaman.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMarkLive() {
    setSubmitting(true)
    setActionError('')
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_live' }),
      })
      const data = await res.json()
      if (!res.ok) { setActionError(data.error || 'Gagal'); return }
      try {
        await fetchOrder()
      } catch {
        setActionError('Tindakan berjaya tapi gagal refresh. Cuba reload halaman.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel() {
    setSubmitting(true)
    setActionError('')
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setActionError(data.error || 'Gagal padam order')
        return
      }
      router.push('/admin/orders')
    } finally {
      setSubmitting(false)
      setConfirmCancel(false)
    }
  }

  function copyWaText() {
    if (!order?.preview_url || !order?.toyyibpay_bill_code) return
    navigator.clipboard.writeText(buildWaText(order.preview_url, order.toyyibpay_bill_code))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Render guards ────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ padding: 32, color: '#78716C', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
      Memuatkan...
    </div>
  )

  if (fetchError || !order) return (
    <div style={{ padding: 32, color: '#dc2626', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
      {fetchError || 'Order tidak dijumpai'}
    </div>
  )

  const statusStyle = STATUS_COLOR[order.status] ?? { bg: '#F5F5F4', color: '#78716C' }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => router.push('/admin/orders')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', fontSize: 22, padding: '4px 8px', lineHeight: 1, borderRadius: 6 }}
        >
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1C1917', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.nama_bisnes}
          </h1>
          <p style={{ fontSize: 12, color: '#78716C', margin: '2px 0 0' }}>
            {order.nama_owner} · {order.whatsapp}
          </p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: statusStyle.bg, color: statusStyle.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* ── Action Panel ── */}
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20, marginBottom: 16 }}>

        {/* PENDING */}
        {order.status === 'pending' && (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 16, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Tetapkan Slug & Preview
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>
                Slug (subdomain)
              </label>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="namakedai"
                  style={{ flex: 1, padding: '10px 12px', fontSize: 14, border: '1px solid #d6d3d1', borderRadius: '8px 0 0 8px', borderRight: 'none', outline: 'none', fontFamily: 'monospace' }}
                />
                <span style={{ padding: '0 12px', background: '#f5f5f4', border: '1px solid #d6d3d1', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', fontSize: 13, color: '#78716C', whiteSpace: 'nowrap' }}>
                  .1page.my
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>
                Preview URL
              </label>
              <input
                value={previewUrl}
                onChange={e => setPreviewUrl(e.target.value)}
                placeholder="https://preview.1page.my/namakedai"
                type="url"
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>

            {actionError && (
              <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 12 }}>⚠ {actionError}</p>
            )}

            <button
              onClick={handleSetPreview}
              disabled={submitting || !slug || !previewUrl}
              style={{
                width: '100%', padding: 14, fontSize: 15, fontWeight: 700,
                background: submitting || !slug || !previewUrl ? '#d6d3d1' : '#1C1917',
                color: '#fff', border: 'none', borderRadius: 10,
                cursor: submitting || !slug || !previewUrl ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Memproses...' : '📋 Jana Bill & Preview Ready'}
            </button>
          </>
        )}

        {/* PREVIEW READY */}
        {order.status === 'preview_ready' && (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 12, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Teks WhatsApp untuk Client
            </p>

            <a
              href={order.preview_url ?? '#'}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', fontSize: 12, color: '#2563EB', marginBottom: 12, wordBreak: 'break-all' }}
            >
              🔗 {order.preview_url}
            </a>

            <textarea
              readOnly
              value={order.preview_url && order.toyyibpay_bill_code
                ? buildWaText(order.preview_url, order.toyyibpay_bill_code)
                : ''}
              style={{
                width: '100%', minHeight: 150, padding: '10px 12px', fontSize: 13,
                border: '1px solid #d6d3d1', borderRadius: 8, background: '#fafaf9',
                fontFamily: 'DM Sans, sans-serif', lineHeight: 1.65,
                resize: 'none', boxSizing: 'border-box' as const, color: '#1C1917',
              }}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                onClick={copyWaText}
                style={{
                  flex: 1, padding: 12, fontSize: 14, fontWeight: 600,
                  background: copied ? '#065F46' : '#1C1917',
                  color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                }}
              >
                {copied ? '✓ Disalin!' : '📋 Copy Teks'}
              </button>
              <a
                href={`https://wa.me/${order.whatsapp.replace(/^0/, '60')}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  flex: 1, padding: 12, fontSize: 14, fontWeight: 600,
                  background: '#16a34a', color: '#fff', borderRadius: 8,
                  textDecoration: 'none', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 6,
                }}
              >
                💬 Buka WA
              </a>
            </div>

            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #f5f5f4' }} />

            {actionError && (
              <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>⚠ {actionError}</p>
            )}

            <button
              onClick={handleMarkLive}
              disabled={submitting}
              style={{
                width: '100%', padding: 12, fontSize: 14, fontWeight: 600,
                background: submitting ? '#d6d3d1' : '#F97316',
                color: '#fff', border: 'none', borderRadius: 8,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Memproses...' : '🚀 Mark as Live (Manual)'}
            </button>
          </>
        )}

        {/* PAID */}
        {order.status === 'paid' && (
          <>
            <p style={{ fontSize: 13, color: '#44403C', marginBottom: 14 }}>
              Bayaran diterima. Tandakan order sebagai live.
            </p>

            {actionError && (
              <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>⚠ {actionError}</p>
            )}

            <button
              onClick={handleMarkLive}
              disabled={submitting || !order.slug}
              style={{
                width: '100%', padding: 14, fontSize: 15, fontWeight: 700,
                background: submitting || !order.slug ? '#d6d3d1' : '#F97316',
                color: '#fff', border: 'none', borderRadius: 10,
                cursor: submitting || !order.slug ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Memproses...' : '🚀 Mark as Live'}
            </button>

            {!order.slug && (
              <p style={{ fontSize: 11, color: '#78716C', marginTop: 8, textAlign: 'center' }}>
                Slug diperlukan. Set slug dulu dalam status pending.
              </p>
            )}
          </>
        )}

        {/* LIVE */}
        {order.status === 'live' && (
          <>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
              ✅ Page sudah Live!
            </p>
            {order.live_url && (
              <a
                href={order.live_url}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 14, color: '#2563EB', wordBreak: 'break-all' }}
              >
                {order.live_url}
              </a>
            )}
          </>
        )}

        {/* FALLBACK */}
        {!['pending', 'preview_ready', 'paid', 'live'].includes(order.status) && (
          <p style={{ fontSize: 13, color: '#78716C' }}>Status: {order.status}</p>
        )}
      </div>

      {/* ── Cancel Order ── */}
      {['pending', 'preview_ready', 'paid'].includes(order.status) && (
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          {!confirmCancel ? (
            <button
              onClick={() => setConfirmCancel(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#dc2626', textDecoration: 'underline', padding: '4px 8px',
              }}
            >
              Batalkan & Padam Order
            </button>
          ) : (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 13, color: '#991B1B', marginBottom: 14, fontWeight: 600 }}>
                Padam order ini? Data tidak boleh dipulihkan.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setConfirmCancel(false)}
                  disabled={submitting}
                  style={{
                    flex: 1, padding: 10, fontSize: 14, fontWeight: 600,
                    background: '#fff', color: '#44403C', border: '1px solid #d6d3d1',
                    borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleCancel}
                  disabled={submitting}
                  style={{
                    flex: 1, padding: 10, fontSize: 14, fontWeight: 600,
                    background: submitting ? '#d6d3d1' : '#dc2626',
                    color: '#fff', border: 'none', borderRadius: 8,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Memproses...' : 'Ya, Padam'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Collapsible Order Details ── */}
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
        <button
          onClick={() => setDetailsOpen(o => !o)}
          style={{
            width: '100%', padding: '14px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#44403C', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <span>Detail Order</span>
          <span style={{ fontSize: 20, lineHeight: 1, color: '#78716C' }}>{detailsOpen ? '−' : '+'}</span>
        </button>

        {detailsOpen && (
          <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f5f5f4' }}>
            <DetailSection title="Client" rows={[
              ['Nama Owner', order.nama_owner],
              ['WhatsApp', order.whatsapp],
              ['Telefon', order.telefon],
              ['Email', order.email],
            ]} />
            <DetailSection title="Bisnes" rows={[
              ['Nama Bisnes', order.nama_bisnes],
              ['Tagline', order.tagline],
              ['Jenis Bisnes', order.jenis_bisnes],
              ['Produk / Servis', order.produk_servis],
              ['Cerita Bisnes', order.cerita_bisnes],
              ['Target Pelanggan', order.target_pelanggan],
            ]} />
            <DetailSection title="Lokasi" rows={[
              ['Alamat', order.alamat],
              ['Waktu Operasi', order.waktu_operasi],
              ['Google Maps', order.google_maps_link],
            ]} />
            <DetailSection title="Sosial Media" rows={[
              ['Instagram', order.instagram],
              ['Facebook', order.facebook],
              ['TikTok', order.tiktok],
            ]} />
            <DetailSection title="Domain" rows={[
              ['Template', order.template_pilihan],
              ['Domain Pilihan 1', order.domain_pref_1],
              ['Domain Pilihan 2', order.domain_pref_2],
              ['Domain Pilihan 3', order.domain_pref_3],
              ['Ada Domain Sendiri', order.domain_sendiri ? 'Ya' : null],
              ['Domain URL', order.domain_url],
            ]} />
            {order.catatan && (
              <DetailSection title="Catatan" rows={[['Catatan', order.catatan]]} />
            )}

            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#78716C', marginTop: 16, marginBottom: 8 }}>
              Imej
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {order.banner_atas_url && (
                <a href={order.banner_atas_url} target="_blank" rel="noopener noreferrer" title="Banner">
                  <img src={order.banner_atas_url} alt="Banner" style={{ width: 90, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #e7e5e4' }} />
                </a>
              )}
              {order.logo_url && (
                <a href={order.logo_url} target="_blank" rel="noopener noreferrer" title="Logo">
                  <img src={order.logo_url} alt="Logo" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #e7e5e4' }} />
                </a>
              )}
              {order.gallery_urls?.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" title={`Gallery ${i + 1}`}>
                  <img src={url} alt={`Gallery ${i + 1}`} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #e7e5e4' }} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
