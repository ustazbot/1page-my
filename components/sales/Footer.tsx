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
            alignItems: 'center',
            gap: 20,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          {/* Facebook icon */}
          <a
            href="https://www.facebook.com/profile.php?id=61590152770680"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook 1page.my"
            style={{
              color: '#78716C',
              transition: 'color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#D6D3D1' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#78716C' }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

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
