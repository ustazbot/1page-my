const NAV = [
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/affiliates', label: 'Affiliates' },
  { href: '/admin/payouts', label: 'Payouts' },
  { href: '/admin/settings', label: 'Settings' },
]

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F1', fontFamily: 'DM Sans, sans-serif' }}>
      <nav style={{
        background: '#1C1917',
        padding: '0 24px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <a href="/admin/orders" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff', textDecoration: 'none' }}>
          1page.my Admin
        </a>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500 }}>
              {n.label}
            </a>
          ))}
          <a href="/api/admin/logout" style={{ fontSize: 13, color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>
            Log Keluar
          </a>
        </div>
      </nav>
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}
