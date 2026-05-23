'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Log masuk gagal')
        return
      }
      router.push('/admin/orders')
      router.refresh()
    } catch (err) {
      console.error('[admin login]', err)
      setError('Ralat sambungan')
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F1' }}>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 40, maxWidth: 400, width: '100%', margin: 24 }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>
          Admin 1page.my
        </h1>
        <p style={{ fontSize: 13, color: '#78716C', marginBottom: 28 }}>
          Log masuk untuk mengurus sistem
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#44403C', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#44403C', display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && (
            <p style={{ fontSize: 13, color: '#DC2626', background: '#FEF2F2', padding: '10px 14px', borderRadius: 8, margin: 0 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '11px 24px', background: '#1C1917', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'DM Sans, sans-serif', marginTop: 4,
            }}
          >
            {loading ? 'Masuk...' : 'Log Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
