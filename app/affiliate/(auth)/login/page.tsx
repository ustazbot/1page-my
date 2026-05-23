'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'

export default function LoginPage() {
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
      const supabase = supabaseBrowser()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('Email atau password salah')
        return
      }
      router.push('/affiliate/dashboard')
      router.refresh()
    } catch (err) {
      console.error('[login]', err)
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F1', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 12, padding: 40, maxWidth: 420, width: '100%' }}>
        <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#1C1917' }}>
          Log Masuk Affiliate
        </h1>
        <p style={{ fontSize: 13, color: '#78716C', marginBottom: 28 }}>1page.my Affiliate Portal</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              padding: '12px 24px', background: '#F97316', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
              fontFamily: 'DM Sans, sans-serif', marginTop: 4,
            }}
          >
            {loading ? 'Sedang masuk...' : 'Log Masuk'}
          </button>

          <p style={{ fontSize: 13, color: '#78716C', textAlign: 'center' }}>
            Belum ada akaun?{' '}
            <a href="/affiliate/register" style={{ color: '#F97316', fontWeight: 600 }}>Daftar sekarang</a>
          </p>
        </form>
      </div>
    </div>
  )
}
