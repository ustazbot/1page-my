'use client'

import { useEffect, useState } from 'react'

const BANKS = ['Maybank', 'CIMB', 'RHB', 'Public Bank', 'Hong Leong Bank', 'AmBank', 'Bank Islam', 'Bank Rakyat', 'BSN', 'OCBC', 'Standard Chartered', 'HSBC']

type ProfileData = {
  affiliate: {
    nama: string
    telefon: string
    bank_name: string
    bank_account: string
    bank_holder_name: string
  }
  email: string
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
const cardStyle: React.CSSProperties = {
  background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, padding: '24px',
}
const sectionTitle: React.CSSProperties = {
  fontSize: 15, fontWeight: 700, color: '#1C1917',
  fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 18,
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  // Bank form
  const [bank, setBank] = useState({ nama: '', telefon: '', bank_name: 'Maybank', bank_account: '', bank_holder_name: '' })
  const [bankSaving, setBankSaving] = useState(false)
  const [bankMsg, setBankMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Password form
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/affiliate/profile')
      .then(r => r.json())
      .then((d: ProfileData) => {
        setProfile(d)
        setBank({
          nama: d.affiliate.nama,
          telefon: d.affiliate.telefon,
          bank_name: d.affiliate.bank_name,
          bank_account: d.affiliate.bank_account,
          bank_holder_name: d.affiliate.bank_holder_name,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function saveBank(e: React.FormEvent) {
    e.preventDefault()
    setBankSaving(true)
    setBankMsg(null)
    try {
      const res = await fetch('/api/affiliate/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bank', ...bank }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setBankMsg({ ok: false, text: data.error ?? 'Ralat berlaku' }); return }
      setBankMsg({ ok: true, text: 'Maklumat berjaya dikemaskini.' })
    } catch {
      setBankMsg({ ok: false, text: 'Ralat sambungan.' })
    } finally {
      setBankSaving(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (pw.new !== pw.confirm) { setPwMsg({ ok: false, text: 'Password baru tidak sepadan.' }); return }
    if (pw.new.length < 8) { setPwMsg({ ok: false, text: 'Password baru minimum 8 aksara.' }); return }
    setPwSaving(true)
    try {
      const res = await fetch('/api/affiliate/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'password', current_password: pw.current, new_password: pw.new }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setPwMsg({ ok: false, text: data.error ?? 'Ralat berlaku' }); return }
      setPwMsg({ ok: true, text: 'Password berjaya ditukar.' })
      setPw({ current: '', new: '', confirm: '' })
    } catch {
      setPwMsg({ ok: false, text: 'Ralat sambungan.' })
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) return <p style={{ color: '#78716C', fontSize: 13 }}>Memuatkan...</p>
  if (!profile) return <p style={{ color: '#DC2626', fontSize: 13 }}>Gagal memuatkan profil.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, color: '#1C1917', marginBottom: 4 }}>
          Profil Saya
        </h1>
        <p style={{ fontSize: 13, color: '#78716C' }}>{profile.email}</p>
      </div>

      {/* Bank details */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Maklumat Peribadi &amp; Bank</p>
        <form onSubmit={saveBank} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nama Penuh</label>
            <input style={inputStyle} value={bank.nama} onChange={e => setBank(b => ({ ...b, nama: e.target.value }))} required />
          </div>
          <div>
            <label style={labelStyle}>Nombor Telefon</label>
            <input style={inputStyle} value={bank.telefon} onChange={e => setBank(b => ({ ...b, telefon: e.target.value }))} required />
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #e7e5e4' }} />
          <div>
            <label style={labelStyle}>Nama Bank</label>
            <select style={inputStyle} value={bank.bank_name} onChange={e => setBank(b => ({ ...b, bank_name: e.target.value }))}>
              {BANKS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Nombor Akaun Bank</label>
            <input style={inputStyle} value={bank.bank_account} onChange={e => setBank(b => ({ ...b, bank_account: e.target.value }))} required />
          </div>
          <div>
            <label style={labelStyle}>Nama Pemilik Akaun</label>
            <input style={inputStyle} value={bank.bank_holder_name} onChange={e => setBank(b => ({ ...b, bank_holder_name: e.target.value }))} required />
          </div>
          {bankMsg && (
            <p style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, margin: 0, background: bankMsg.ok ? '#F0FDF4' : '#FEF2F2', color: bankMsg.ok ? '#166534' : '#DC2626' }}>
              {bankMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={bankSaving}
            style={{ padding: '10px 24px', background: '#F97316', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: bankSaving ? 'wait' : 'pointer', opacity: bankSaving ? 0.7 : 1, fontFamily: 'DM Sans, sans-serif', alignSelf: 'flex-start' }}
          >
            {bankSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div style={cardStyle}>
        <p style={sectionTitle}>Tukar Password</p>
        <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Password Semasa</label>
            <input type="password" style={inputStyle} value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} required />
          </div>
          <div>
            <label style={labelStyle}>Password Baru (min. 8 aksara)</label>
            <input type="password" style={inputStyle} value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))} required minLength={8} />
          </div>
          <div>
            <label style={labelStyle}>Ulang Password Baru</label>
            <input type="password" style={inputStyle} value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required />
          </div>
          {pwMsg && (
            <p style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, margin: 0, background: pwMsg.ok ? '#F0FDF4' : '#FEF2F2', color: pwMsg.ok ? '#166534' : '#DC2626' }}>
              {pwMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={pwSaving}
            style={{ padding: '10px 24px', background: '#1C1917', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: pwSaving ? 'wait' : 'pointer', opacity: pwSaving ? 0.7 : 1, fontFamily: 'DM Sans, sans-serif', alignSelf: 'flex-start' }}
          >
            {pwSaving ? 'Menukar...' : 'Tukar Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
