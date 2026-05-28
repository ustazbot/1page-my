export default function ComingSoonPage({ bisnesName }: { bisnesName: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8F6F1',
      fontFamily: 'DM Sans, sans-serif',
      padding: '24px',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F97316', marginBottom: 16 }}>
        1page.my
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1C1917', marginBottom: 12, fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: 1.2 }}>
        {bisnesName}
      </h1>
      <p style={{ fontSize: 16, color: '#78716C', maxWidth: 340 }}>
        Halaman ini akan datang tidak lama lagi.
      </p>
    </div>
  )
}
