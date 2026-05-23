import { redirect } from 'next/navigation'
import { createAffiliateServerClient } from '@/lib/affiliate-auth'

export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createAffiliateServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/affiliate/login')
  }

  const NAV_LINKS = [
    { href: '/affiliate/dashboard', label: 'Dashboard' },
    { href: '/affiliate/referrals', label: 'Referral' },
    { href: '/affiliate/payout', label: 'Payout' },
    { href: '/affiliate/kit', label: 'Kit' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F6F1',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e7e5e4',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontWeight: 700,
          fontSize: 16,
          color: '#1C1917',
        }}>
          1page.my
        </span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 13,
                color: '#78716C',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/api/affiliate/logout"
            style={{
              fontSize: 13,
              color: '#F97316',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Log Keluar
          </a>
        </div>
      </nav>

      <main style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '32px 24px',
      }}>
        {children}
      </main>
    </div>
  )
}
