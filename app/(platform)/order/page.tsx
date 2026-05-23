'use client'

import { useState, useRef } from 'react'

// ── CONSTANTS ──────────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: 'bold_minimal',
    name: 'Bold Minimal',
    colors: ['#0a0a0a', '#ffffff', '#e5e5e5'],
    bg: '#0a0a0a',
    text: '#ffffff',
    accent: '#e5e5e5',
    desc: 'Tegas · Moden · Clean',
    tags: ['B2C', 'Retail', 'Servis'],
  },
  {
    id: 'warm_heritage',
    name: 'Warm Heritage',
    colors: ['#78350f', '#fef3c7', '#f59e0b'],
    bg: '#fef3c7',
    text: '#78350f',
    accent: '#f59e0b',
    desc: 'Klasik · Hangat · Amanah',
    tags: ['F&B', 'Kraftangan', 'Tradisional'],
  },
  {
    id: 'cool_professional',
    name: 'Cool Professional',
    colors: ['#1e3a8a', '#dbeafe', '#3b82f6'],
    bg: '#f0f9ff',
    text: '#1e3a8a',
    accent: '#3b82f6',
    desc: 'Profesional · Bersih · Kemas',
    tags: ['Perkhidmatan', 'Klinik', 'Agensi'],
  },
  {
    id: 'fresh_editorial',
    name: 'Fresh Editorial',
    colors: ['#064e3b', '#d1fae5', '#10b981'],
    bg: '#ecfdf5',
    text: '#064e3b',
    accent: '#10b981',
    desc: 'Segar · Muda · Dinamik',
    tags: ['Wellness', 'Organic', 'Lifestyle'],
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode',
    colors: ['#0f172a', '#0ea5e9', '#38bdf8'],
    bg: '#0f172a',
    text: '#f8fafc',
    accent: '#0ea5e9',
    desc: 'Mewah · Premium · Berani',
    tags: ['Tech', 'Premium', 'Moden'],
  },
]

const JENIS_BISNES = [
  'F&B (Makanan & Minuman)',
  'Retail',
  'Servis Profesional',
  'Kecantikan & Wellness',
  'Pendidikan',
  'Lain-lain',
]

// Operator support WhatsApp — tukar kepada nombor sebenar
const SUPPORT_WA = '60103602175'

// ── TYPES ──────────────────────────────────────────────────────────────────

type FormState = {
  nama_bisnes: string; tagline: string; jenis_bisnes: string
  cerita_bisnes: string; produk_servis: string; target_pelanggan: string
  nama_owner: string; whatsapp: string; telefon: string; email: string
  alamat: string; waktu_operasi: string; google_maps_link: string
  instagram: string; facebook: string; tiktok: string
  banner_atas_url: string; logo_url: string; gallery_urls: string
  template_pilihan: string; domain_sendiri: boolean; domain_url: string
  domain_pref_1: string; domain_pref_2: string; domain_pref_3: string
  catatan: string
}

const EMPTY: FormState = {
  nama_bisnes: '', tagline: '', jenis_bisnes: '',
  cerita_bisnes: '', produk_servis: '', target_pelanggan: '',
  nama_owner: '', whatsapp: '', telefon: '', email: '',
  alamat: '', waktu_operasi: '', google_maps_link: '',
  instagram: '', facebook: '', tiktok: '',
  banner_atas_url: '', logo_url: '', gallery_urls: '',
  template_pilihan: '', domain_sendiri: false, domain_url: '',
  domain_pref_1: '', domain_pref_2: '', domain_pref_3: '',
  catatan: '',
}

// ── STYLES ─────────────────────────────────────────────────────────────────

const s = {
  label:        { display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 } as React.CSSProperties,
  hint:         { fontSize: 12, color: '#666', marginBottom: 8, lineHeight: 1.5 } as React.CSSProperties,
  input:        { width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff', outline: 'none', boxSizing: 'border-box' as const },
  textarea:     { width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff', outline: 'none', boxSizing: 'border-box' as const, minHeight: 100, resize: 'vertical' as const },
  section:      { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #eee' } as React.CSSProperties,
  sectionTitle: { fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 20 } as React.CSSProperties,
  field:        { marginBottom: 18 } as React.CSSProperties,
  required:     { color: '#e53e3e', marginLeft: 3 } as React.CSSProperties,
}

// ── IMAGE COMPRESSION ──────────────────────────────────────────────────────

const MAX_UPLOAD_MB = 4.5
const MAX_DIMENSION = 1920

async function compressImage(file: File): Promise<File> {
  // Only compress images — skip SVG/GIF
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  // Already small enough
  if (file.size <= MAX_UPLOAD_MB * 1024 * 1024) return file

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)

      let quality = 0.88
      const attempt = () => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return }
          if (blob.size <= MAX_UPLOAD_MB * 1024 * 1024 || quality < 0.15) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          } else {
            quality -= 0.12
            attempt()
          }
        }, 'image/jpeg', quality)
      }
      attempt()
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

// ── IMAGE UPLOAD FIELD ─────────────────────────────────────────────────────

function ImageUploadField({
  label, hint, required, value, onChange, folder,
}: {
  label: string; hint?: string; required?: boolean
  value: string; onChange: (url: string) => void; folder: string
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError('')
    try {
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append('file', compressed)
      fd.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload gagal')
      onChange(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={s.field}>
      <label style={s.label}>{label}{required && <span style={s.required}>*</span>}</label>
      {hint && <p style={s.hint}>{hint}</p>}

      {value ? (
        <div style={{ position: 'relative' }}>
          <img
            src={value} alt=""
            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd', display: 'block' }}
          />
          <button
            type="button"
            onClick={() => {
              const oldUrl = value
              onChange('')
              if (inputRef.current) inputRef.current.value = ''
              if (oldUrl) {
                fetch('/api/upload', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: oldUrl }),
                }).catch(() => {})
              }
            }}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,0.65)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '4px 12px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Tukar Gambar
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
          style={{
            border: `2px dashed ${error ? '#fc8181' : '#d1d5db'}`,
            borderRadius: 10, padding: '28px 20px',
            textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer',
            background: uploading ? '#f9fafb' : '#fafafa',
            transition: 'border-color 0.2s',
          }}
        >
          {uploading ? (
            <>
              <div style={{ fontSize: 28, marginBottom: 6 }}>⏳</div>
              <p style={{ color: '#888', fontSize: 14, fontWeight: 500 }}>Memuat naik...</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              <p style={{ color: '#374151', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Klik untuk pilih gambar</p>
              <p style={{ color: '#9ca3af', fontSize: 12 }}>JPG, PNG, WEBP · Gambar besar auto dikecilkan</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {error && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 6 }}>⚠ {error}</p>}
    </div>
  )
}

// ── GALLERY UPLOAD FIELD ───────────────────────────────────────────────────

function GalleryUploadField({
  value, onChange,
}: {
  value: string; onChange: (v: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const MAX = 6

  const urls = value.split('\n').map((s) => s.trim()).filter(Boolean)

  async function handleFiles(files: FileList) {
    const slots = MAX - urls.length
    if (slots <= 0) return
    setUploading(true)
    setError('')
    try {
      const toUpload = Array.from(files).slice(0, slots)
      const next = [...urls]
      for (const file of toUpload) {
        const compressed = await compressImage(file)
        const fd = new FormData()
        fd.append('file', compressed)
        fd.append('folder', 'gallery')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload gagal')
        next.push(data.url)
      }
      onChange(next.join('\n'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  function remove(idx: number) {
    const urlToDelete = urls[idx]
    onChange(urls.filter((_, i) => i !== idx).join('\n'))
    if (urlToDelete) {
      fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToDelete }),
      }).catch(() => {})
    }
  }

  const thumbStyle: React.CSSProperties = {
    aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
    border: '1px solid #ddd', position: 'relative',
  }

  return (
    <div style={s.field}>
      <label style={s.label}>Gallery / Gambar Tambahan</label>
      <p style={s.hint}>Gambar produk, suasana kedai, atau hasil kerja anda — maks {MAX} gambar</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {urls.map((url, i) => (
          <div key={i} style={thumbStyle}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button" onClick={() => remove(i)}
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                borderRadius: '50%', width: 22, height: 22, fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>
          </div>
        ))}

        {urls.length < MAX && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => !uploading && inputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
            style={{
              ...thumbStyle, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer', background: '#fafafa',
              border: '2px dashed #d1d5db',
            }}
          >
            {uploading
              ? <span style={{ color: '#888', fontSize: 12 }}>...</span>
              : <>
                  <span style={{ fontSize: 22, color: '#9ca3af' }}>+</span>
                  <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Tambah</span>
                </>
            }
          </div>
        )}
      </div>

      <input
        ref={inputRef} type="file" accept="image/*" multiple
        style={{ display: 'none' }}
        onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files) }}
      />
      {error && <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 6 }}>⚠ {error}</p>}
    </div>
  )
}

// ── TEMPLATE CARD ──────────────────────────────────────────────────────────

function TemplateCard({
  tmpl, selected, onSelect,
}: {
  tmpl: typeof TEMPLATES[0]; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        border: `2px solid ${selected ? '#1a1a1a' : '#e5e7eb'}`,
        borderRadius: 12, overflow: 'hidden',
        background: '#fff', cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(0,0,0,0.12)' : 'none',
        padding: 0, width: '100%',
      }}
    >
      {/* Mini visual preview */}
      <div style={{ background: tmpl.bg, padding: '14px 14px 10px', position: 'relative' }}>
        {selected && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: '#1a1a1a', color: '#fff', borderRadius: '50%',
            width: 20, height: 20, fontSize: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✓</div>
        )}
        {/* Fake nav bar */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 8,
        }}>
          {[1, 0.4, 0.3].map((op, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 2,
              background: tmpl.accent, opacity: op,
              width: i === 0 ? 24 : 16,
            }} />
          ))}
        </div>
        {/* Fake hero */}
        <div style={{ height: 6, background: tmpl.text, borderRadius: 3, opacity: 0.9, marginBottom: 4, width: '70%' }} />
        <div style={{ height: 4, background: tmpl.text, borderRadius: 2, opacity: 0.4, marginBottom: 8, width: '50%' }} />
        {/* Fake CTA button */}
        <div style={{ height: 16, background: tmpl.accent, borderRadius: 4, width: 48 }} />
        {/* Color dots */}
        <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
          {tmpl.colors.map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
          ))}
        </div>
      </div>

      {/* Card info */}
      <div style={{ padding: '10px 14px 12px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 2 }}>{tmpl.name}</p>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{tmpl.desc}</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {tmpl.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: 10, padding: '2px 6px', borderRadius: 4,
              background: '#f3f4f6', color: '#6b7280', fontWeight: 500,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </button>
  )
}

// ── HELP MODAL ─────────────────────────────────────────────────────────────

const HELP_SECTIONS = [
  {
    icon: '🏪',
    title: 'A — Maklumat Bisnes',
    items: [
      'Nama Bisnes: Nama rasmi bisnes seperti pada signboard atau kad nama.',
      'Tagline: Ayat pendek yang describe bisnes. Contoh: "Nasi Lemak Paling Sedap di Ampang".',
      'Cerita Bisnes: Ceritakan latar belakang — macam mana bermula, apa buat anda berbeza, kenapa pelanggan patut pilih anda.',
      'Produk/Servis: Senaraikan semua produk atau servis, pisah dengan koma.',
      'Target Pelanggan: Siapa pelanggan utama anda? Contoh: ibu bapa, pelajar, pesara.',
    ],
  },
  {
    icon: '📞',
    title: 'B — Maklumat Hubungan',
    items: [
      'WhatsApp & Telefon: Masukkan nombor tanpa +60. Contoh: 0123456789.',
      'Email: Opsional, tapi membantu jika pelanggan nak email anda.',
    ],
  },
  {
    icon: '📍',
    title: 'C — Lokasi & Operasi',
    items: [
      'Alamat: Masukkan alamat lengkap termasuk poskod dan negeri.',
      'Waktu Operasi: Contoh: Isnin–Sabtu, 9:00 pagi – 6:00 petang. Ahad tutup.',
      'Google Maps: Pergi Google Maps → cari bisnes → tekan "Share" → copy link.',
    ],
  },
  {
    icon: '📸',
    title: 'E — Imej',
    items: [
      'Banner Atas: Gambar utama halaman anda. Gunakan gambar landskap yang cantik dan jelas.',
      'Logo: Gambar logo bisnes (opsional, tapi sangat disyorkan).',
      'Gallery: Gambar produk, suasana tempat, atau hasil kerja anda — maksimum 6 gambar.',
      'Cara upload: Klik kawasan bergaris putus-putus → pilih gambar dari telefon atau komputer → tunggu seketika sehingga gambar muncul.',
    ],
  },
  {
    icon: '🎨',
    title: 'F — Template & Domain',
    items: [
      'Template: Pilih reka bentuk yang paling sesuai dengan gaya dan warna bisnes anda.',
      'Domain: Alamat web anda nanti. Contoh: kedaisaya.1page.my.',
      'Ada domain sendiri?: Jika anda dah ada domain (contoh: kedaisaya.com), pilih "Ya".',
    ],
  },
]

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: 640, maxHeight: '88vh',
          overflow: 'auto', padding: '24px 24px 40px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>Panduan Isi Borang</h2>
            <p style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Panduan ringkas untuk setiap bahagian</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6', border: 'none', borderRadius: '50%',
              width: 32, height: 32, fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555',
            }}
          >×</button>
        </div>

        {HELP_SECTIONS.map((sec) => (
          <div key={sec.title} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #f3f4f6' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{sec.icon}</span>{sec.title}
            </h3>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {sec.items.map((item, i) => (
                <li key={i} style={{
                  fontSize: 13, color: '#555', lineHeight: 1.65,
                  marginBottom: 6, paddingLeft: 14, position: 'relative',
                }}>
                  <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: 12, padding: 16, textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#166534', marginBottom: 10 }}>
            Masih keliru? Kami sedia bantu!
          </p>
          <a
            href={`https://wa.me/${SUPPORT_WA}?text=Salam%2C%20saya%20perlukan%20bantuan%20isi%20borang%20order%201page.my`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-block', background: '#16a34a', color: '#fff',
              padding: '10px 28px', borderRadius: 8,
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}
          >
            💬 Chat di WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function OrderPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    if (!form.template_pilihan) {
      setErrorMsg('Sila pilih template.')
      setStatus('error')
      return
    }
    setStatus('submitting')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal hantar.')
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Ralat berlaku. Cuba lagi.')
    }
  }

  if (status === 'done') {
    return (
      <div style={{ maxWidth: 540, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Order Diterima!</h1>
        <p style={{ color: '#555', lineHeight: 1.6 }}>
          Terima kasih, <strong>{form.nama_owner}</strong>. Kami akan review dan
          hantar preview dalam masa 24 jam bekerja. Semak WhatsApp anda.
        </p>
      </div>
    )
  }

  return (
    <>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
            Order Landing Page
          </h1>
          <p style={{ color: '#666', fontSize: 15 }}>
            Preview percuma sebelum bayar. RM150 sahaja. Siap dalam 24 jam bekerja.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── A — Maklumat Bisnes ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>A — Maklumat Bisnes</p>

            <div style={s.field}>
              <label style={s.label}>Nama Bisnes<span style={s.required}>*</span></label>
              <input style={s.input} value={form.nama_bisnes} required
                onChange={(e) => set('nama_bisnes', e.target.value)} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Tagline / Slogan</label>
              <p style={s.hint}>Ayat pendek yang mewakili bisnes anda — contoh: "Nasi Lemak Terbaik di Puchong"</p>
              <input style={s.input} value={form.tagline}
                onChange={(e) => set('tagline', e.target.value)} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Jenis Bisnes</label>
              <select style={{ ...s.input }} value={form.jenis_bisnes}
                onChange={(e) => set('jenis_bisnes', e.target.value)}>
                <option value="">-- Pilih --</option>
                {JENIS_BISNES.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>

            <div style={s.field}>
              <label style={s.label}>Produk / Servis Utama<span style={s.required}>*</span></label>
              <p style={s.hint}>Senaraikan semua produk atau servis yang anda tawarkan, pisah dengan koma</p>
              <textarea style={s.textarea} value={form.produk_servis} required
                onChange={(e) => set('produk_servis', e.target.value)} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Ceritakan Tentang Perniagaan Anda<span style={s.required}>*</span></label>
              <p style={s.hint}>
                Macam mana bisnes anda bermula? Apa yang buat anda berbeza dari pesaing? Kenapa pelanggan patut pilih anda?
                Tidak perlu panjang — 2 hingga 5 ayat sudah cukup.
              </p>
              <textarea
                style={{ ...s.textarea, minHeight: 120 }}
                placeholder="Contoh: Kedai kami dibuka sejak 2015 oleh keluarga kami sendiri. Kami guna resipi tradisional yang diturun dari nenek moyang. Apa yang beza, kami masak fresh setiap hari tanpa bahan pengawet..."
                value={form.cerita_bisnes}
                required
                onChange={(e) => set('cerita_bisnes', e.target.value)}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Target Pelanggan</label>
              <p style={s.hint}>Siapa yang anda nak reach? Contoh: ibu bapa, pelajar universiti, pejabat berdekatan</p>
              <textarea style={{ ...s.textarea, minHeight: 72 }} value={form.target_pelanggan}
                onChange={(e) => set('target_pelanggan', e.target.value)} />
            </div>
          </div>

          {/* ── B — Maklumat Hubungan ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>B — Maklumat Hubungan</p>

            <div style={s.field}>
              <label style={s.label}>Nama Owner<span style={s.required}>*</span></label>
              <input style={s.input} value={form.nama_owner} required
                onChange={(e) => set('nama_owner', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={s.field}>
                <label style={s.label}>Nombor WhatsApp<span style={s.required}>*</span></label>
                <input style={s.input} type="tel" placeholder="0123456789"
                  value={form.whatsapp} required
                  onChange={(e) => set('whatsapp', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Nombor Telefon<span style={s.required}>*</span></label>
                <input style={s.input} type="tel" placeholder="0312345678"
                  value={form.telefon} required
                  onChange={(e) => set('telefon', e.target.value)} />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" value={form.email}
                onChange={(e) => set('email', e.target.value)} />
            </div>
          </div>

          {/* ── C — Lokasi & Operasi ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>C — Lokasi & Operasi</p>

            <div style={s.field}>
              <label style={s.label}>Alamat Perniagaan<span style={s.required}>*</span></label>
              <textarea style={{ ...s.textarea, minHeight: 80 }} value={form.alamat} required
                onChange={(e) => set('alamat', e.target.value)} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Waktu Operasi<span style={s.required}>*</span></label>
              <p style={s.hint}>Contoh: Isnin–Sabtu, 9 pagi–6 petang. Ahad tutup.</p>
              <input style={s.input} value={form.waktu_operasi} required
                onChange={(e) => set('waktu_operasi', e.target.value)} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Google Business / Google Maps Link</label>
              <p style={s.hint}>Pergi Google Maps → cari bisnes anda → tekan "Share" → copy link</p>
              <input style={s.input} type="url" placeholder="https://maps.google.com/..."
                value={form.google_maps_link}
                onChange={(e) => set('google_maps_link', e.target.value)} />
            </div>
          </div>

          {/* ── D — Media Sosial ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>D — Media Sosial</p>
            {(['instagram', 'facebook', 'tiktok'] as const).map((p) => (
              <div key={p} style={s.field}>
                <label style={s.label}>{p.charAt(0).toUpperCase() + p.slice(1)}</label>
                <input style={s.input} type="url"
                  placeholder={`https://www.${p}.com/namaanda`}
                  value={form[p]}
                  onChange={(e) => set(p, e.target.value)} />
              </div>
            ))}
          </div>

          {/* ── E — Imej ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>E — Imej</p>

            <ImageUploadField
              label="Banner Atas"
              hint="Gambar utama halaman anda — landscape (lebar), kualiti tinggi, contoh: gambar produk terbaik atau suasana kedai"
              required
              value={form.banner_atas_url}
              onChange={(url) => set('banner_atas_url', url)}
              folder="banner"
            />

            <ImageUploadField
              label="Logo"
              hint="Logo bisnes anda — gunakan gambar berlatar putih atau transparent (PNG lebih baik)"
              value={form.logo_url}
              onChange={(url) => set('logo_url', url)}
              folder="logo"
            />

            <GalleryUploadField
              value={form.gallery_urls}
              onChange={(v) => set('gallery_urls', v)}
            />
          </div>

          {/* ── F — Domain & Template ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>F — Domain & Template</p>

            <div style={s.field}>
              <label style={s.label}>Template Pilihan<span style={s.required}>*</span></label>
              <p style={s.hint}>Pilih reka bentuk yang paling sesuai dengan gaya bisnes anda</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 4 }}>
                {TEMPLATES.map((tmpl) => (
                  <TemplateCard
                    key={tmpl.id}
                    tmpl={tmpl}
                    selected={form.template_pilihan === tmpl.id}
                    onSelect={() => set('template_pilihan', tmpl.id)}
                  />
                ))}
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Ada domain sendiri?</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['Ya', 'Tidak'] as const).map((opt) => (
                  <button key={opt} type="button"
                    onClick={() => set('domain_sendiri', opt === 'Ya')}
                    style={{
                      padding: '8px 24px', borderRadius: 8, fontSize: 14,
                      border: `2px solid ${form.domain_sendiri === (opt === 'Ya') ? '#1a1a1a' : '#ddd'}`,
                      background: form.domain_sendiri === (opt === 'Ya') ? '#1a1a1a' : '#fff',
                      color: form.domain_sendiri === (opt === 'Ya') ? '#fff' : '#555',
                      cursor: 'pointer',
                    }}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {form.domain_sendiri && (
              <div style={s.field}>
                <label style={s.label}>Domain URL anda</label>
                <input style={s.input} type="url" placeholder="https://namabisnessaya.com"
                  value={form.domain_url}
                  onChange={(e) => set('domain_url', e.target.value)} />
              </div>
            )}

            {(['domain_pref_1', 'domain_pref_2', 'domain_pref_3'] as const).map((field, i) => (
              <div key={field} style={s.field}>
                <label style={s.label}>Nama domain pilihan {i + 1}</label>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <input
                    style={{ ...s.input, borderRadius: '8px 0 0 8px', borderRight: 'none', flex: 1 }}
                    placeholder={i === 0 ? 'namabisnessaya' : `pilihan${i + 1}`}
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)} />
                  <span style={{
                    padding: '0 14px', background: '#f5f5f5',
                    border: '1px solid #ddd', borderRadius: '0 8px 8px 0',
                    display: 'flex', alignItems: 'center',
                    fontSize: 14, color: '#888', whiteSpace: 'nowrap',
                  }}>.1page.my</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── G — Maklumat Tambahan ── */}
          <div style={s.section}>
            <p style={s.sectionTitle}>G — Maklumat Tambahan</p>
            <textarea style={s.textarea}
              placeholder="Sebarang maklumat tambahan yang kami perlu tahu, permintaan khas, atau soalan..."
              value={form.catatan}
              onChange={(e) => set('catatan', e.target.value)} />
          </div>

          {status === 'error' && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 8,
              padding: '12px 16px', marginBottom: 20, color: '#c53030', fontSize: 14,
            }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={status === 'submitting'}
            style={{
              width: '100%', padding: 16, fontSize: 18, fontWeight: 700,
              background: status === 'submitting' ? '#999' : '#1a1a1a',
              color: '#fff', border: 'none', borderRadius: 12,
              cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'submitting' ? 'Menghantar...' : 'Hantar Order →'}
          </button>

          <p style={{ textAlign: 'center', color: '#888', fontSize: 13, marginTop: 16 }}>
            Preview percuma · Bayar RM150 hanya selepas anda setuju
          </p>
        </form>
      </div>

      {/* ── Floating Help Button ── */}
      <button
        type="button"
        onClick={() => setHelpOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 20, zIndex: 900,
          background: '#1a1a1a', color: '#fff',
          border: 'none', borderRadius: 50, padding: '12px 20px',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>💬</span> Bantuan
      </button>

      {/* ── Help Modal ── */}
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </>
  )
}
