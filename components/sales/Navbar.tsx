'use client'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 64,
        padding: '0 clamp(20px, 5vw, 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(248, 246, 241, 0.88)' : '#F8F6F1',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? '#E7E5E4' : 'transparent'}`,
        transition: 'border-color 0.3s ease, backdrop-filter 0.3s ease, background 0.3s ease',
      }}
    >
      <style>{`
        @media (max-width: 640px) { .nav-text-links { display: none !important; } }
      `}</style>

      <a
        href="/"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: '#1C1917',
          letterSpacing: '-0.04em',
          textDecoration: 'none',
          lineHeight: 1,
        }}
      >
        1page<span style={{ color: '#F97316' }}>.my</span>
      </a>

      <a
        href="/order"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          padding: '10px 22px',
          background: '#F97316',
          color: '#FFFFFF',
          borderRadius: 8,
          textDecoration: 'none',
          letterSpacing: '-0.01em',
          transition: 'background 0.2s ease, transform 0.15s ease',
          display: 'inline-block',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#EA6A0A'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#F97316'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        Mulakan Sekarang
      </a>
    </nav>
  )
}
