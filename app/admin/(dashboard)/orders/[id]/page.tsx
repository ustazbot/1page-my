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
  stats_bar: { nilai: string; label: string }[] | null
  usp:       { tajuk: string; huraian: string }[] | null
  pakej:     { nama: string; harga: string; ciri: string[]; popular?: boolean }[] | null
  testimoni: { nama: string; dari: string; ulasan: string }[] | null
  faq:       { soalan: string; jawapan: string }[] | null
  cta_button_text: string | null
  cta_subtext:     string | null
  cta_wa_message:  string | null
}

type CTAVariant = {
  id: number
  tone: 'direct' | 'soft' | 'value'
  cta_button_text: string
  cta_subtext: string
  cta_wa_message: string
}

// ── CONSTANTS ──────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending:       'Pending',
  draft:         'Draft',
  preview_ready: 'Preview Sedia',
  approved:      'Diluluskan',
  paid:          'Paid',
  live:          'Live',
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:       { bg: '#F5F5F4', color: '#44403C' },
  draft:         { bg: '#FEF3C7', color: '#92400E' },
  preview_ready: { bg: '#DBEAFE', color: '#1E40AF' },
  approved:      { bg: '#D1FAE5', color: '#065F46' },
  paid:          { bg: '#EDE9FE', color: '#5B21B6' },
  live:          { bg: '#D1FAE5', color: '#065F46' },
}

const TEMPLATES = [
  { id: 'bold_minimal',      name: 'Bold Minimal',     accent: '#C8A96E', bg: '#0a0a0a' },
  { id: 'warm_heritage',     name: 'Warm Heritage',     accent: '#8B5E3C', bg: '#fdf6ee' },
  { id: 'cool_professional', name: 'Cool Professional', accent: '#3B82F6', bg: '#0f172a' },
  { id: 'fresh_editorial',   name: 'Fresh Editorial',   accent: '#16A34A', bg: '#f9fafb' },
  { id: 'dark_mode',         name: 'Dark Mode',         accent: '#E8A020', bg: '#0d0d0d' },
] as const

// ── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [order, setOrder]             = useState<Order | null>(null)
  const [loading, setLoading]         = useState(true)
  const [fetchError, setFetchError]   = useState('')
  const [slug, setSlug]               = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [actionError, setActionError] = useState('')

  // Generate copy
  const [generating, setGenerating]       = useState(false)
  const [generateError, setGenerateError] = useState('')

  // Edit fields
  const [editFields, setEditFields]       = useState<Record<string, string>>({})
  const [saveSubmitting, setSaveSubmitting] = useState(false)
  const [saveError, setSaveError]         = useState('')
  const [saveSuccess, setSaveSuccess]     = useState(false)

  // Image upload
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [uploadError, setUploadError]     = useState('')

  // WA copy
  const [copied, setCopied] = useState(false)

  // Preview iframe
  const [iframeKey, setIframeKey] = useState(0)

  // Confirm cancel
  const [confirmCancel, setConfirmCancel] = useState(false)

  // CTA variants from AI generation
  const [ctaVariants, setCtaVariants]             = useState<CTAVariant[]>([])
  const [selectedVariantId, setSelectedVariantId] = useState<number>(1)
  const [ctaError, setCTAError]                   = useState('')

  // Conversion segments
  const [statsBar,      setStatsBar]      = useState<{ nilai: string; label: string }[]>([])
  const [uspList,       setUspList]       = useState<{ tajuk: string; huraian: string }[]>([])
  const [pakejList,     setPakejList]     = useState<{ nama: string; harga: string; ciri: string; popular: boolean }[]>([])
  const [testimoniList, setTestimoniList] = useState<{ nama: string; dari: string; ulasan: string }[]>([])
  const [faqList,       setFaqList]       = useState<{ soalan: string; jawapan: string }[]>([])

  // ── Data fetching ────────────────────────────────────────────────────────

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      const d = await res.json()
      if (d.order) {
        const o = d.order as Order
        setOrder(o)
        setSlug(o.slug ?? (o.domain_pref_1 ?? '').toLowerCase().replace(/[^a-z0-9-]/g, ''))
        setEditFields({
          nama_bisnes:      o.nama_bisnes      ?? '',
          tagline:          o.tagline          ?? '',
          cerita_bisnes:    o.cerita_bisnes    ?? '',
          produk_servis:    o.produk_servis    ?? '',
          target_pelanggan: o.target_pelanggan ?? '',
          waktu_operasi:    o.waktu_operasi    ?? '',
          alamat:           o.alamat           ?? '',
          google_maps_link: o.google_maps_link ?? '',
          instagram:        o.instagram        ?? '',
          facebook:         o.facebook         ?? '',
          tiktok:           o.tiktok           ?? '',
          template_pilihan: o.template_pilihan ?? 'bold_minimal',
        })
        setStatsBar(o.stats_bar ?? [])
        setUspList(o.usp ?? [])
        setPakejList((o.pakej ?? []).map(p => ({ ...p, ciri: p.ciri.join('\n'), popular: p.popular ?? false })))
        setTestimoniList(o.testimoni ?? [])
        setFaqList(o.faq ?? [])
      } else {
        setFetchError('Order tidak dijumpai')
      }
    } catch {
      setFetchError('Gagal memuatkan order. Cuba refresh.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrder() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps,react-hooks/set-state-in-effect

  // ── Handlers ─────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!slug) { setGenerateError('Set slug dulu sebelum jana copy.'); return }
    setGenerating(true)
    setGenerateError('')
    setCTAError('')
    try {
      // Save slug to DB first so generate-copy endpoint can read it
      if (!order?.slug || order.slug !== slug) {
        const saveRes = await fetch(`/api/admin/orders/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'edit_fields', slug }),
        })
        if (!saveRes.ok) {
          const d = await saveRes.json()
          setGenerateError(d.error || 'Gagal simpan slug. Cuba lagi.')
          return
        }
      }
      const res = await fetch(`/api/admin/orders/${id}/generate-copy`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setGenerateError(data.error || 'Gagal jana copy'); return }
      setEditFields(prev => ({ ...prev, ...data.copy }))
      if (Array.isArray(data.cta_variants) && data.cta_variants.length === 3) {
        setCtaVariants(data.cta_variants)
        setSelectedVariantId(1)
      }
      if (data.cta_error) setCTAError(data.cta_error)
      setIframeKey(k => k + 1)
      await fetchOrder()
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveFields() {
    setSaveSubmitting(true)
    setSaveError('')
    setSaveSuccess(false)
    const payload: Record<string, unknown> = { action: 'edit_fields' }
    for (const [k, v] of Object.entries(editFields)) {
      payload[k] = v.trim() === '' ? null : v.trim()
    }
    payload.slug = slug || null
    payload.stats_bar  = statsBar.filter(s => s.nilai.trim() && s.label.trim())
    payload.usp        = uspList.filter(u => u.tajuk.trim())
    payload.pakej      = pakejList
      .filter(p => p.nama.trim())
      .map(p => ({ ...p, ciri: p.ciri.split('\n').map(c => c.trim()).filter(Boolean) }))
    payload.testimoni  = testimoniList.filter(t => t.ulasan.trim())
    payload.faq        = faqList.filter(f => f.soalan.trim())
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(data.error || 'Gagal simpan'); return }
      setSaveSuccess(true)
      setIframeKey(k => k + 1)
      await fetchOrder()
    } finally {
      setSaveSubmitting(false)
    }
  }

  async function handleUploadImage(slot: 'banner_atas_url' | 'logo_url', file: File) {
    setUploadingSlot(slot)
    setUploadError('')
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'orders')
    try {
      // Best-effort delete old image from R2
      const oldUrl = slot === 'banner_atas_url' ? order?.banner_atas_url : order?.logo_url
      if (oldUrl) {
        fetch('/api/upload', {
          method: 'DELETE',
          body: JSON.stringify({ url: oldUrl }),
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => { /* ignore delete errors */ })
      }
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setUploadError(data.error || 'Upload gagal'); return }
      const patchRes = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_fields', [slot]: data.url }),
      })
      const patchData = await patchRes.json()
      if (!patchRes.ok) { setUploadError(patchData.error || 'Gagal simpan URL gambar'); return }
      setIframeKey(k => k + 1)
      await fetchOrder()
    } finally {
      setUploadingSlot(null)
    }
  }

  async function handleSetPreview() {
    setSubmitting(true)
    setActionError('')
    try {
      const selectedVariant = ctaVariants.find(v => v.id === selectedVariantId)
      const payload: Record<string, unknown> = { action: 'set_preview', slug }
      if (selectedVariant) {
        payload.cta_button_text = selectedVariant.cta_button_text
        payload.cta_subtext     = selectedVariant.cta_subtext
        payload.cta_wa_message  = selectedVariant.cta_wa_message
      }
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setActionError(data.error || 'Gagal'); return }
      await fetchOrder()
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
      await fetchOrder()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel() {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); setActionError(d.error || 'Gagal padam'); return }
      router.push('/admin/orders')
    } finally {
      setSubmitting(false)
      setConfirmCancel(false)
    }
  }

  function copyWaText() {
    if (!order?.preview_url || !order?.toyyibpay_bill_code) return
    const text = `Salam dari 1page.my\nPreview page anda dah siap!\nBoleh tengok preview di sini:\n${order.preview_url}\n\nJika setuju, sila buat bayaran RM150 di pautan ini untuk aktifkan page anda:\nhttps://toyyibpay.com/${order.toyyibpay_bill_code}\n\nAda soalan? Balas WhatsApp ini ya 😊`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Render guards ─────────────────────────────────────────────────────────

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
  const isEditable = true
  const showIframe = !!order.slug && ['draft', 'preview_ready', 'paid', 'live'].includes(order.status)
  const showGenerateButton = ['pending', 'draft'].includes(order.status)

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: '0 4px' }}>
        <button onClick={() => router.push('/admin/orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', fontSize: 22, padding: '4px 8px', lineHeight: 1, borderRadius: 6 }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1C1917', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {order.nama_bisnes}
          </h1>
          <p style={{ fontSize: 12, color: '#78716C', margin: '2px 0 0' }}>{order.nama_owner} · {order.whatsapp}</p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: statusStyle.bg, color: statusStyle.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* 2-panel grid */}
      <div style={{ display: 'grid', gridTemplateColumns: showIframe ? '1fr 1fr' : '640px', gap: 20, alignItems: 'start' }}>

        {/* ── Panel Kiri ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Slug & Template */}
          <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 14 }}>Slug & Template</p>

            {/* Slug */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>Subdomain</label>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <input
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  disabled={!isEditable}
                  placeholder="namakedai"
                  style={{ flex: 1, padding: '10px 12px', fontSize: 14, border: '1px solid #d6d3d1', borderRadius: '8px 0 0 8px', borderRight: 'none', outline: 'none', fontFamily: 'monospace', background: isEditable ? '#fff' : '#f5f5f4' }}
                />
                <span style={{ padding: '0 12px', background: '#f5f5f4', border: '1px solid #d6d3d1', borderRadius: '0 8px 8px 0', display: 'flex', alignItems: 'center', fontSize: 13, color: '#78716C' }}>.1page.my</span>
              </div>
            </div>

            {/* Template picker */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 8 }}>Template</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => isEditable && setEditFields(prev => ({ ...prev, template_pilihan: t.id }))}
                    disabled={!isEditable}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8, textAlign: 'left', cursor: isEditable ? 'pointer' : 'default',
                      border: `2px solid ${editFields.template_pilihan === t.id ? t.accent : '#e7e5e4'}`,
                      background: editFields.template_pilihan === t.id ? t.bg + '14' : '#fff',
                      transition: 'border-color 0.1s',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: t.bg, border: `2px solid ${t.accent}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: editFields.template_pilihan === t.id ? 700 : 500, color: '#1C1917' }}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Jana dengan AI */}
          {showGenerateButton && (
            <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 10 }}>Jana Copy AI</p>
              {generateError && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>⚠ {generateError}</p>}
              <button
                onClick={handleGenerate}
                disabled={generating || !slug}
                style={{
                  width: '100%', padding: 14, fontSize: 15, fontWeight: 700, borderRadius: 10, border: 'none', cursor: generating || !slug ? 'not-allowed' : 'pointer',
                  background: generating || !slug ? '#d6d3d1' : '#1C1917', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {generating ? (
                  <>
                    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Menjana copy...
                  </>
                ) : order.status === 'draft' ? '↺ Jana Semula dengan AI' : '✦ Jana dengan AI'}
              </button>
              {!slug && <p style={{ fontSize: 11, color: '#78716C', marginTop: 8, textAlign: 'center' }}>Set slug dulu sebelum jana copy.</p>}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* CTA Variants — muncul selepas generate */}
          {ctaVariants.length > 0 && showGenerateButton && (
            <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 14 }}>Pilih CTA</p>

              {/* Tone tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {ctaVariants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    style={{
                      flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600,
                      borderRadius: 8, border: '2px solid',
                      borderColor: selectedVariantId === v.id ? '#1C1917' : '#e7e5e4',
                      background: selectedVariantId === v.id ? '#1C1917' : '#fff',
                      color: selectedVariantId === v.id ? '#fff' : '#78716C',
                      cursor: 'pointer',
                    }}
                  >
                    {v.tone === 'direct' ? 'Terus' : v.tone === 'soft' ? 'Lembut' : 'Nilai'}
                  </button>
                ))}
              </div>

              {/* Preview kad */}
              {(() => {
                const v = ctaVariants.find(x => x.id === selectedVariantId)
                if (!v) return null
                return (
                  <div style={{ background: '#F8F6F1', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'inline-block', background: '#1C1917', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 8, marginBottom: 6 }}>
                      💬 {v.cta_button_text}
                    </div>
                    {v.cta_subtext ? (
                      <p style={{ fontSize: 12, color: '#78716C', margin: '4px 0 8px' }}>{v.cta_subtext}</p>
                    ) : (
                      <p style={{ fontSize: 11, color: '#a8a29e', margin: '4px 0 8px', fontStyle: 'italic' }}>Tiada subtext</p>
                    )}
                    <p style={{ fontSize: 11, color: '#a8a29e', margin: 0, fontStyle: 'italic' }}>
                      WA: &ldquo;{v.cta_wa_message}&rdquo;
                    </p>
                  </div>
                )
              })()}

              {ctaError && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>⚠ {ctaError}</p>}
            </div>
          )}

          {/* Edit Copy & Fields */}
          {isEditable && (
            <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 14 }}>Edit Copy & Maklumat</p>

              {[
                { key: 'tagline',          label: 'Tagline',           type: 'input' },
                { key: 'cerita_bisnes',    label: 'Cerita Bisnes',     type: 'textarea' },
                { key: 'produk_servis',    label: 'Produk & Servis',   type: 'textarea' },
                { key: 'target_pelanggan', label: 'Target Pelanggan',  type: 'input' },
                { key: 'waktu_operasi',    label: 'Waktu Operasi',     type: 'input' },
                { key: 'alamat',           label: 'Alamat',            type: 'textarea' },
                { key: 'google_maps_link', label: 'Google Maps Link',  type: 'input' },
                { key: 'instagram',        label: 'Instagram',         type: 'input' },
                { key: 'facebook',         label: 'Facebook',          type: 'input' },
                { key: 'tiktok',           label: 'TikTok',            type: 'input' },
              ].map(({ key, label, type }) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={editFields[key] ?? ''}
                      onChange={e => setEditFields(p => ({ ...p, [key]: e.target.value }))}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', boxSizing: 'border-box' as const }}
                    />
                  ) : (
                    <input
                      value={editFields[key] ?? ''}
                      onChange={e => setEditFields(p => ({ ...p, [key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' as const }}
                    />
                  )}
                </div>
              ))}

              {/* Stats Bar */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>Pencapaian Bisnes (Stats Bar)</label>
                {statsBar.map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 6, marginBottom: 6 }}>
                    <input placeholder="200+" value={row.nilai}
                      onChange={e => setStatsBar(p => p.map((r, j) => j === i ? { ...r, nilai: e.target.value } : r))}
                      style={{ padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none' }} />
                    <input placeholder="Pelanggan Berpuas Hati" value={row.label}
                      onChange={e => setStatsBar(p => p.map((r, j) => j === i ? { ...r, label: e.target.value } : r))}
                      style={{ padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none' }} />
                    <button type="button" onClick={() => setStatsBar(p => p.filter((_, j) => j !== i))}
                      style={{ padding: '8px 10px', background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#dc2626', fontSize: 13 }}>✕</button>
                  </div>
                ))}
                {statsBar.length < 4 && (
                  <button type="button" onClick={() => setStatsBar(p => [...p, { nilai: '', label: '' }])}
                    style={{ fontSize: 12, color: '#44403C', background: 'none', border: '1px dashed #d6d3d1', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
                    + Tambah Statistik
                  </button>
                )}
              </div>

              {/* USP */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>Kenapa Pilih Kami (USP)</label>
                {uspList.map((row, i) => (
                  <div key={i} style={{ border: '1px solid #e7e5e4', borderRadius: 8, padding: 10, marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#78716C' }}>Point {i + 1}</span>
                      <button type="button" onClick={() => setUspList(p => p.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Padam</button>
                    </div>
                    <input placeholder="Tajuk ringkas" value={row.tajuk}
                      onChange={e => setUspList(p => p.map((r, j) => j === i ? { ...r, tajuk: e.target.value } : r))}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', marginBottom: 6, boxSizing: 'border-box' as const }} />
                    <input placeholder="Huraian 1 ayat" value={row.huraian}
                      onChange={e => setUspList(p => p.map((r, j) => j === i ? { ...r, huraian: e.target.value } : r))}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', boxSizing: 'border-box' as const }} />
                  </div>
                ))}
                {uspList.length < 4 && (
                  <button type="button" onClick={() => setUspList(p => [...p, { tajuk: '', huraian: '' }])}
                    style={{ fontSize: 12, color: '#44403C', background: 'none', border: '1px dashed #d6d3d1', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
                    + Tambah Point
                  </button>
                )}
              </div>

              {/* Pakej */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>Pakej & Harga</label>
                {pakejList.map((row, i) => (
                  <div key={i} style={{ border: '1px solid #e7e5e4', borderRadius: 8, padding: 10, marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#78716C' }}>Pakej {i + 1}</span>
                      <button type="button" onClick={() => setPakejList(p => p.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Padam</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                      <input placeholder="Nama Pakej" value={row.nama}
                        onChange={e => setPakejList(p => p.map((r, j) => j === i ? { ...r, nama: e.target.value } : r))}
                        style={{ padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none' }} />
                      <input placeholder="Harga (RM150)" value={row.harga}
                        onChange={e => setPakejList(p => p.map((r, j) => j === i ? { ...r, harga: e.target.value } : r))}
                        style={{ padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none' }} />
                    </div>
                    <textarea placeholder={'Ciri-ciri (satu per baris)\nDeliveri dalam 3 hari\nGaransi 30 hari'} value={row.ciri}
                      onChange={e => setPakejList(p => p.map((r, j) => j === i ? { ...r, ciri: e.target.value } : r))}
                      rows={3}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const, marginBottom: 6 }} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={row.popular}
                        onChange={e => setPakejList(p => p.map((r, j) => j === i ? { ...r, popular: e.target.checked } : r))} />
                      Tandai sebagai &ldquo;Pilihan Ramai&rdquo;
                    </label>
                  </div>
                ))}
                {pakejList.length < 3 && (
                  <button type="button" onClick={() => setPakejList(p => [...p, { nama: '', harga: '', ciri: '', popular: false }])}
                    style={{ fontSize: 12, color: '#44403C', background: 'none', border: '1px dashed #d6d3d1', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
                    + Tambah Pakej
                  </button>
                )}
              </div>

              {/* Testimoni */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>Testimoni Pelanggan</label>
                {testimoniList.map((row, i) => (
                  <div key={i} style={{ border: '1px solid #e7e5e4', borderRadius: 8, padding: 10, marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#78716C' }}>Testimoni {i + 1}</span>
                      <button type="button" onClick={() => setTestimoniList(p => p.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Padam</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                      <input placeholder="Nama" value={row.nama}
                        onChange={e => setTestimoniList(p => p.map((r, j) => j === i ? { ...r, nama: e.target.value } : r))}
                        style={{ padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none' }} />
                      <input placeholder="Dari (Kuala Lumpur)" value={row.dari}
                        onChange={e => setTestimoniList(p => p.map((r, j) => j === i ? { ...r, dari: e.target.value } : r))}
                        style={{ padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none' }} />
                    </div>
                    <textarea placeholder="Ulasan pelanggan..." value={row.ulasan}
                      onChange={e => setTestimoniList(p => p.map((r, j) => j === i ? { ...r, ulasan: e.target.value } : r))}
                      rows={2}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const }} />
                  </div>
                ))}
                {testimoniList.length < 3 && (
                  <button type="button" onClick={() => setTestimoniList(p => [...p, { nama: '', dari: '', ulasan: '' }])}
                    style={{ fontSize: 12, color: '#44403C', background: 'none', border: '1px dashed #d6d3d1', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
                    + Tambah Testimoni
                  </button>
                )}
              </div>

              {/* FAQ */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44403C', marginBottom: 6 }}>Soalan Lazim (FAQ)</label>
                {faqList.map((row, i) => (
                  <div key={i} style={{ border: '1px solid #e7e5e4', borderRadius: 8, padding: 10, marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#78716C' }}>Soalan {i + 1}</span>
                      <button type="button" onClick={() => setFaqList(p => p.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Padam</button>
                    </div>
                    <input placeholder="Soalan..." value={row.soalan}
                      onChange={e => setFaqList(p => p.map((r, j) => j === i ? { ...r, soalan: e.target.value } : r))}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', marginBottom: 6, boxSizing: 'border-box' as const }} />
                    <textarea placeholder="Jawapan..." value={row.jawapan}
                      onChange={e => setFaqList(p => p.map((r, j) => j === i ? { ...r, jawapan: e.target.value } : r))}
                      rows={2}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #d6d3d1', borderRadius: 8, outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const }} />
                  </div>
                ))}
                {faqList.length < 5 && (
                  <button type="button" onClick={() => setFaqList(p => [...p, { soalan: '', jawapan: '' }])}
                    style={{ fontSize: 12, color: '#44403C', background: 'none', border: '1px dashed #d6d3d1', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
                    + Tambah Soalan
                  </button>
                )}
              </div>

              {saveError && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>⚠ {saveError}</p>}
              {saveSuccess && <p style={{ color: '#065F46', fontSize: 12, marginBottom: 10 }}>✓ Disimpan. Iframe akan refresh.</p>}

              <button
                onClick={handleSaveFields}
                disabled={saveSubmitting}
                style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 600, background: saveSubmitting ? '#d6d3d1' : '#1C1917', color: '#fff', border: 'none', borderRadius: 8, cursor: saveSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {saveSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          )}

          {/* Gambar */}
          <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 14 }}>Gambar</p>
            {uploadError && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>⚠ {uploadError}</p>}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* Banner */}
              <div>
                <p style={{ fontSize: 11, color: '#78716C', marginBottom: 6 }}>Banner</p>
                {order.banner_atas_url && <img src={order.banner_atas_url} alt="Banner" style={{ width: 120, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #e7e5e4', display: 'block', marginBottom: 6 }} />}
                {isEditable && (
                  <label style={{ fontSize: 12, color: '#2563EB', cursor: 'pointer', display: 'block' }}>
                    {uploadingSlot === 'banner_atas_url' ? 'Uploading...' : '↑ Ganti'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleUploadImage('banner_atas_url', e.target.files[0])} />
                  </label>
                )}
              </div>

              {/* Logo */}
              <div>
                <p style={{ fontSize: 11, color: '#78716C', marginBottom: 6 }}>Logo</p>
                {order.logo_url && <img src={order.logo_url} alt="Logo" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #e7e5e4', display: 'block', marginBottom: 6 }} />}
                {isEditable && (
                  <label style={{ fontSize: 12, color: '#2563EB', cursor: 'pointer', display: 'block' }}>
                    {uploadingSlot === 'logo_url' ? 'Uploading...' : '↑ Ganti'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleUploadImage('logo_url', e.target.files[0])} />
                  </label>
                )}
              </div>

              {/* Gallery */}
              {order.gallery_urls?.map((url, i) => (
                <div key={i}>
                  <p style={{ fontSize: 11, color: '#78716C', marginBottom: 6 }}>Gallery {i + 1}</p>
                  <img src={url} alt={`Gallery ${i + 1}`} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #e7e5e4' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 14 }}>Tindakan</p>
            {actionError && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 10 }}>⚠ {actionError}</p>}

            {/* draft: Set Preview & Jana Bill */}
            {order.status === 'draft' && (
              <button onClick={handleSetPreview} disabled={submitting || !slug} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 700, background: submitting || !slug ? '#d6d3d1' : '#1C1917', color: '#fff', border: 'none', borderRadius: 10, cursor: submitting || !slug ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
                {submitting ? 'Memproses...' : '📋 Set Preview & Jana Bill'}
              </button>
            )}

            {/* preview_ready: WA text + Mark Live */}
            {order.status === 'preview_ready' && order.preview_url && order.toyyibpay_bill_code && (
              <>
                <a href={order.preview_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12, color: '#2563EB', marginBottom: 12, wordBreak: 'break-all' }}>
                  🔗 {order.preview_url}
                </a>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button onClick={copyWaText} style={{ flex: 1, padding: 12, fontSize: 13, fontWeight: 600, background: copied ? '#065F46' : '#1C1917', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                    {copied ? '✓ Disalin!' : '📋 Copy Teks WA'}
                  </button>
                  <a href={`https://wa.me/${order.whatsapp.replace(/^0/, '60')}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: 12, fontSize: 13, fontWeight: 600, background: '#16a34a', color: '#fff', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    💬 Buka WA
                  </a>
                </div>
                <button onClick={handleMarkLive} disabled={submitting} style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 600, background: submitting ? '#d6d3d1' : '#F97316', color: '#fff', border: 'none', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Memproses...' : '🚀 Mark as Live (Manual)'}
                </button>
              </>
            )}

            {/* paid: Mark Live */}
            {order.status === 'paid' && (
              <button onClick={handleMarkLive} disabled={submitting || !order.slug} style={{ width: '100%', padding: 14, fontSize: 15, fontWeight: 700, background: submitting || !order.slug ? '#d6d3d1' : '#F97316', color: '#fff', border: 'none', borderRadius: 10, cursor: submitting || !order.slug ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Memproses...' : '🚀 Mark as Live'}
              </button>
            )}

            {/* live */}
            {order.status === 'live' && order.live_url && (
              <p style={{ fontSize: 14, fontWeight: 700, color: '#065F46' }}>
                ✅ Live: <a href={order.live_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', fontWeight: 400 }}>{order.live_url}</a>
              </p>
            )}

            {/* Cancel */}
            {['pending', 'draft', 'preview_ready', 'paid', 'live'].includes(order.status) && (
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                {!confirmCancel ? (
                  <button onClick={() => setConfirmCancel(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#dc2626', textDecoration: 'underline' }}>
                    Batalkan & Padam Order
                  </button>
                ) : (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: 14 }}>
                    <p style={{ fontSize: 13, color: '#991B1B', marginBottom: 12, fontWeight: 600 }}>Padam order ini? Tidak boleh dipulihkan.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setConfirmCancel(false)} style={{ flex: 1, padding: 10, fontSize: 13, background: '#fff', color: '#44403C', border: '1px solid #d6d3d1', borderRadius: 8, cursor: 'pointer' }}>Batal</button>
                      <button onClick={handleCancel} disabled={submitting} style={{ flex: 1, padding: 10, fontSize: 13, fontWeight: 600, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Ya, Padam</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detail Order (collapsible) */}
          <DetailSection order={order} />
        </div>

        {/* ── Panel Kanan: Live Preview ── */}
        {showIframe && (
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', margin: 0 }}>
                  Live Preview — {order.slug}.1page.my
                </p>
                <button onClick={() => setIframeKey(k => k + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#78716C', padding: '4px 8px' }} title="Refresh">↺</button>
              </div>
              <iframe
                key={iframeKey}
                src={`https://${order.slug}.1page.my`}
                style={{ width: '100%', height: 'calc(100vh - 160px)', border: 'none', minHeight: 500 }}
                title="Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── DETAIL SECTION (collapsible) ──────────────────────────────────────────

function DetailSection({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)

  const rows: [string, string | null | undefined][] = [
    ['Nama Owner', order.nama_owner],
    ['WhatsApp', order.whatsapp],
    ['Telefon', order.telefon],
    ['Email', order.email],
    ['Jenis Bisnes', order.jenis_bisnes],
    ['Catatan', order.catatan],
    ['Domain Pilihan 1', order.domain_pref_1],
    ['Domain Pilihan 2', order.domain_pref_2],
    ['Domain Pilihan 3', order.domain_pref_3],
    ['Domain Sendiri', order.domain_sendiri ? 'Ya' : null],
    ['Domain URL', order.domain_url],
  ].filter(([, v]) => v) as [string, string][]

  return (
    <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#44403C', fontFamily: 'DM Sans, sans-serif' }}>
        <span>Detail Order</span>
        <span style={{ fontSize: 20, lineHeight: 1, color: '#78716C' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f5f5f4' }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#a8a29e', display: 'block' }}>{label}</span>
              <span style={{ fontSize: 13, color: '#1C1917', wordBreak: 'break-word' }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
