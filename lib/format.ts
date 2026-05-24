// Client-safe utility functions (no Node.js dependencies)

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function reductionPercent(original: number, processed: number): number {
  return Math.round((1 - processed / original) * 100)
}
