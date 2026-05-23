'use client'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {})
  }
  return (
    <button
      onClick={copy}
      style={{
        padding: '8px 16px',
        background: '#F97316',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        flexShrink: 0,
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {label}
    </button>
  )
}
