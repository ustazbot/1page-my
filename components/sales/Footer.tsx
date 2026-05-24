'use client'
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: '#1C1917',
        padding: 'clamp(36px, 5vw, 56px) clamp(20px, 5vw, 60px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: '#F8F6F1',
            letterSpacing: '-0.04em',
            textDecoration: 'none',
          }}
        >
          1page<span style={{ color: '#F97316' }}>.my</span>
        </a>

        {/* Copyright */}
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: '#78716C',
            textAlign: 'center',
            margin: 0,
          }}
        >
          © {year} 1page.my
        </p>

        {/* Links */}
        <nav
          aria-label="Footer links"
          style={{
            display: 'flex',
            gap: 20,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Home', href: '/' },
            { label: 'Jadi Affiliate', href: '/affiliate' },
            { label: 'T&C', href: '/terms' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: '#78716C',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#D6D3D1' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#78716C' }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
