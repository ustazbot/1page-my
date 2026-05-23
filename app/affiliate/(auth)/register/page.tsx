'use client'

import { useState } from 'react'

const BANKS = ['Maybank', 'CIMB', 'RHB', 'Public Bank', 'Hong Leong Bank', 'AmBank', 'Bank Islam', 'Bank Rakyat', 'BSN', 'OCBC', 'Standard Chartered', 'HSBC']

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: '', email: '', telefon: '', password: '',
    bank_name: 'Maybank', bank_account: '', bank_holder_name: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed) { setError('Sila tandakan kotak persetujuan'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setError(data.error ?? 'Ralat berlaku'); return }
      setDone(true)
    } catch {
      setError('Ralat sambungan. Cuba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    border: '1px solid #e7e5e4', borderRadius: 8,
    background: '#fff', color: '#1C1917', outline: 'none',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: '#44403C', display: 'block', marginBottom: 6,
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F1', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 40, maxWidth: 480, textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#1C1917' }}>
          Permohonan Diterima
        </h2>
        <p style={{ fontSize: 14, color: '#78716C', lineHeight: 1.6 }}>
          Permohonan anda sedang disemak. Kami akan maklumkan melalui email apabila akaun anda diaktifkan.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F1', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 40, maxWidth: 520, width: '100%' }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1C1917' }}>
          Daftar Affiliate
        </h1>
        <p style={{ fontSize: 13, color: '#78716C', marginBottom: 28 }}>
          Daftar dan mula jana komisyen RM60 setiap referral.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label style={labelStyle}>Nama Penuh</label><input style={inputStyle} value={form.nama} onChange={e => set('nama', e.target.value)} required /></div>
          <div><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} required /></div>
          <div><label style={labelStyle}>Nombor Telefon</label><input style={inputStyle} value={form.telefon} onChange={e => set('telefon', e.target.value)} required /></div>
          <div><label style={labelStyle}>Password (min. 8 aksara)</label><input type="password" style={inputStyle} value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} /></div>

          <hr style={{ border: 'none', borderTop: '1px solid #e7e5e4' }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Maklumat Bank</p>

          <div>
            <label style={labelStyle}>Nama Bank</label>
            <select style={inputStyle} value={form.bank_name} onChange={e => set('bank_name', e.target.value)}>
              {BANKS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Nombor Akaun Bank</label><input style={inputStyle} value={form.bank_account} onChange={e => set('bank_account', e.target.value)} required /></div>
          <div><label style={labelStyle}>Nama Pemilik Akaun</label><input style={inputStyle} value={form.bank_holder_name} onChange={e => set('bank_holder_name', e.target.value)} required /></div>

          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginTop: 4 }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#78716C', lineHeight: 1.6 }}>
              Saya faham dan bersetuju dengan terma komisyen: Komisyen yang diperoleh dalam sesuatu bulan akan dibayar pada 7hb bulan berikutnya. Sekiranya 7hb jatuh pada hari cuti umum atau hujung minggu, pembayaran akan dibuat pada hari bekerja yang berikutnya. Pembayaran dibuat melalui pindahan bank ke akaun yang didaftarkan.
            </span>
          </label>

          {error && (
            <p style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px', background: '#F97316', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {loading ? 'Mendaftar...' : 'Hantar Permohonan'}
          </button>

          <p style={{ fontSize: 13, color: '#78716C', textAlign: 'center' }}>
            Sudah ada akaun?{' '}
            <a href="/affiliate/login" style={{ color: '#F97316', fontWeight: 600 }}>Log Masuk</a>
          </p>
        </form>
      </div>
    </div>
  )
}
