import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'
import { supabaseServer } from '@/lib/supabase'
import { CopyButton } from '@/components/affiliate/CopyButton'

export default async function KitPage() {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/affiliate/login')

  const sb = supabaseServer()
  const { data: affiliate } = await sb
    .from('affiliates')
    .select('ref_code, nama')
    .eq('id', session.user.id)
    .single()

  const refCode = affiliate?.ref_code ?? ''
  const refLink = `${process.env.NEXT_PUBLIC_BASE_URL}/?ref=${refCode}`
  const caption = `Nak landing page untuk bisnes anda?\nProfessional. Siap dalam 24 jam. RM150.\nTengok preview dulu, bayar lepas setuju.\n→ ${refLink}`

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>
        Kit Pemasaran
      </h1>
      <p style={{ fontSize: 13, color: '#78716C', marginBottom: 28 }}>
        Gunakan bahan-bahan ini untuk promosi
      </p>

      {/* Ref link */}
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Pautan Referral Anda
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <code style={{ flex: 1, fontSize: 13, color: '#F97316', background: '#FFF7ED', padding: '10px 14px', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {refLink}
          </code>
          <CopyButton text={refLink} />
        </div>
      </div>

      {/* Caption */}
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Caption Siap Pakai
          </p>
          <CopyButton text={caption} label="Copy Caption" />
        </div>
        <div style={{ background: '#F8F6F1', borderRadius: 8, padding: '16px 18px' }}>
          <pre style={{ fontSize: 13, color: '#1C1917', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif' }}>
            {caption}
          </pre>
        </div>
      </div>
    </div>
  )
}
