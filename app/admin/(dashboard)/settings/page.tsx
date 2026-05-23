export default function SettingsPage() {
  const settings = [
    ['Kadar Komisyen', '40% (RM60 per order)'],
    ['Harga Asas', 'RM150'],
    ['Jadual Payout', '7hb bulan berikutnya (anjak jika cuti/weekend)'],
    ['Pengecualian Komisyen', 'Revision fee (RM50), Domain fee (RM30), Domain tahunan (RM120)'],
    ['Cookie Tracking', '30 hari (sameSite: lax)'],
    ['Admin Session', '24 jam (HMAC-signed cookie)'],
  ]

  return (
    <div>
      <h1 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', marginBottom: 20 }}>
        Tetapan Sistem
      </h1>
      <div style={{ background: '#fff', border: '1px solid #e7e5e4', borderRadius: 10, padding: '4px 24px' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {settings.map(([label, value]) => (
              <tr key={label} style={{ borderBottom: '1px solid #f5f5f4' }}>
                <td style={{ padding: '14px 0', fontSize: 13, fontWeight: 600, color: '#44403C', width: 220, verticalAlign: 'top' }}>{label}</td>
                <td style={{ padding: '14px 0', fontSize: 13, color: '#78716C' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
