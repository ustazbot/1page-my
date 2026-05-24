export function generateSlugVariants(businessName: string): string[] {
  const base = businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const words = base.split('-').filter(Boolean)

  return [
    base,
    words.join(''),
    words.slice(0, 2).join('-'),
    words.slice(0, 2).join(''),
    words.length > 2 ? words.slice(0, 3).join('-') : `${base}-my`,
  ].filter((s, i, arr) => s && arr.indexOf(s) === i).slice(0, 5)
}
