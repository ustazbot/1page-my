'use client'

import { useState } from 'react'

const TEMPLATES = ['T1', 'T2', 'T3', 'T4', 'T5']
const JENIS_BISNES = ['F&B', 'Retail', 'Servis', 'Lain-lain']

type FormState = {
  nama_bisnes: string; tagline: string; jenis_bisnes: string
  produk_servis: string; target_pelanggan: string
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
  produk_servis: '', target_pelanggan: '',
  nama_owner: '', whatsapp: '', telefon: '', email: '',
  alamat: '', waktu_operasi: '', google_maps_link: '',
  instagram: '', facebook: '', tiktok: '',
  banner_atas_url: '', logo_url: '', gallery_urls: '',
  template_pilihan: '', domain_sendiri: false, domain_url: '',
  domain_pref_1: '', domain_pref_2: '', domain_pref_3: '',
  catatan: '',
}

const s = {
  label:        { display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 } as React.CSSProperties,
  hint:         { fontSize: 12, color: '#666', marginBottom: 8 } as React.CSSProperties,
  input:        { width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff', outline: 'none', boxSizing: 'border-box' as const },
  textarea:     { width: '100%', padding: '12px 14px', fontSize: 16, border: '1px solid #ddd', borderRadius: 8, background: '#fff', outline: 'none', boxSizing: 'border-box' as const, minHeight: 100, resize: 'vertical' as const },
  section:      { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid #eee' } as React.CSSProperties,
  sectionTitle: { fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#888', marginBottom: 20 } as React.CSSProperties,
  field:        { marginBottom: 18 } as React.CSSProperties,
  required:     { color: '#e53e3e', marginLeft: 3 } as React.CSSProperties,
}

export default function OrderPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
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
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
          Order Landing Page
        </h1>
        <p style={{ color: '#666', fontSize: 15 }}>
          Preview percuma sebelum bayar. RM150 sahaja. Siap dalam 24 jam bekerja.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Seksyen A — Maklumat Bisnes */}
        <div style={s.section}>
          <p style={s.sectionTitle}>A — Maklumat Bisnes</p>

          <div style={s.field}>
            <label style={s.label}>Nama Bisnes<span style={s.required}>*</span></label>
            <input style={s.input} value={form.nama_bisnes} required
              onChange={(e) => set('nama_bisnes', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Tagline / Slogan</label>
            <p style={s.hint}>Ayat pendek — contoh: "Nasi Lemak Terbaik di Puchong"</p>
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
            <p style={s.hint}>Senaraikan, pisah dengan koma</p>
            <textarea style={s.textarea} value={form.produk_servis} required
              onChange={(e) => set('produk_servis', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Target Pelanggan</label>
            <p style={s.hint}>Contoh: ibu bapa, pelajar universiti, pejabat berdekatan</p>
            <textarea style={{ ...s.textarea, minHeight: 72 }} value={form.target_pelanggan}
              onChange={(e) => set('target_pelanggan', e.target.value)} />
          </div>
        </div>

        {/* Seksyen B — Maklumat Hubungan */}
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

        {/* Seksyen C — Lokasi & Operasi */}
        <div style={s.section}>
          <p style={s.sectionTitle}>C — Lokasi & Operasi</p>

          <div style={s.field}>
            <label style={s.label}>Alamat Perniagaan<span style={s.required}>*</span></label>
            <textarea style={{ ...s.textarea, minHeight: 80 }} value={form.alamat} required
              onChange={(e) => set('alamat', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Waktu Operasi<span style={s.required}>*</span></label>
            <p style={s.hint}>Contoh: Isnin–Sabtu, 9pagi–6ptg</p>
            <input style={s.input} value={form.waktu_operasi} required
              onChange={(e) => set('waktu_operasi', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Google Business / Google Maps Link</label>
            <p style={s.hint}>Tampal link Google Business Profile atau Google Maps anda</p>
            <input style={s.input} type="url" placeholder="https://maps.google.com/..."
              value={form.google_maps_link}
              onChange={(e) => set('google_maps_link', e.target.value)} />
          </div>
        </div>

        {/* Seksyen D — Media Sosial */}
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

        {/* Seksyen E — Imej */}
        <div style={s.section}>
          <p style={s.sectionTitle}>E — Imej</p>
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8,
            padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e', lineHeight: 1.6,
          }}>
            <strong>Cara upload gambar:</strong> Upload ke Google Drive → klik kanan →
            "Dapatkan link" → tukar kepada "Sesiapa yang ada link boleh lihat" → tampal link di sini.
          </div>

          <div style={s.field}>
            <label style={s.label}>Banner Atas<span style={s.required}>*</span></label>
            <p style={s.hint}>Gambar utama halaman — landscape, kualiti tinggi</p>
            <input style={s.input} type="url" placeholder="https://drive.google.com/..."
              value={form.banner_atas_url} required
              onChange={(e) => set('banner_atas_url', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Logo</label>
            <input style={s.input} type="url" placeholder="https://drive.google.com/..."
              value={form.logo_url}
              onChange={(e) => set('logo_url', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Gallery / Gambar Tambahan</label>
            <p style={s.hint}>Satu link setiap baris — maksimum 6 gambar</p>
            <textarea style={{ ...s.textarea, minHeight: 120 }} value={form.gallery_urls}
              onChange={(e) => set('gallery_urls', e.target.value)} />
          </div>
        </div>

        {/* Seksyen F — Domain & Template */}
        <div style={s.section}>
          <p style={s.sectionTitle}>F — Domain & Template</p>

          <div style={s.field}>
            <label style={s.label}>Template Pilihan<span style={s.required}>*</span></label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TEMPLATES.map((t) => (
                <button key={t} type="button" onClick={() => set('template_pilihan', t)}
                  style={{
                    padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                    border: `2px solid ${form.template_pilihan === t ? '#1a1a1a' : '#ddd'}`,
                    background: form.template_pilihan === t ? '#1a1a1a' : '#fff',
                    color: form.template_pilihan === t ? '#fff' : '#555', cursor: 'pointer',
                  }}
                >{t}</button>
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

        {/* Seksyen G — Maklumat Tambahan */}
        <div style={s.section}>
          <p style={s.sectionTitle}>G — Maklumat Tambahan</p>
          <textarea style={s.textarea}
            placeholder="Sebarang maklumat tambahan yang kami perlu tahu..."
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
  )
}
