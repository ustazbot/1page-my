import fs from 'fs/promises'
import path from 'path'
export { generateSlugVariants } from './slug'

const CF_API = 'https://api.cloudflare.com/client/v4'

function headers() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function deployToPreview(slug: string): Promise<string> {
  const project = process.env.CF_PAGES_PROJECT_PREVIEW!
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!

  const htmlPath = path.join(process.cwd(), 'public', 'clients', slug, 'index.html')
  const htmlContent = await fs.readFile(htmlPath, 'utf-8')

  const form = new FormData()
  form.append('manifest', JSON.stringify({ [`/${slug}/index.html`]: 'index.html' }))
  form.append('index.html', new Blob([htmlContent], { type: 'text/html' }), 'index.html')

  const res = await fetch(
    `${CF_API}/accounts/${accountId}/pages/projects/${project}/deployments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
      body: form,
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cloudflare preview deploy failed: ${err}`)
  }

  return `https://${process.env.NEXT_PUBLIC_PREVIEW_DOMAIN}/${slug}`
}

export async function deployToLive(slug: string): Promise<string> {
  const project = process.env.CF_PAGES_PROJECT_LIVE!
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!

  const clientDir = path.join(process.cwd(), 'public', 'clients', slug)
  const files = await collectFiles(clientDir)

  const form = new FormData()
  const manifest: Record<string, string> = {}

  for (const [relativePath, content] of files) {
    const key = relativePath.replace(/\\/g, '/')
    manifest[`/${key}`] = key
    form.append(key, new Blob([content.buffer as ArrayBuffer]), key)
  }

  form.append('manifest', JSON.stringify(manifest))

  const res = await fetch(
    `${CF_API}/accounts/${accountId}/pages/projects/${project}/deployments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
      body: form,
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cloudflare live deploy failed: ${err}`)
  }

  return `https://${slug}.${process.env.NEXT_PUBLIC_LIVE_DOMAIN}`
}

async function collectFiles(
  dir: string,
  base = dir
): Promise<Array<[string, Buffer]>> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const results: Array<[string, Buffer]> = []

  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(full, base)))
    } else {
      const content = await fs.readFile(full)
      results.push([path.relative(base, full), content])
    }
  }

  return results
}

export async function listDeployedSlugs(): Promise<string[]> {
  const clientsDir = path.join(process.cwd(), 'public', 'clients')
  try {
    const entries = await fs.readdir(clientsDir, { withFileTypes: true })
    return entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    return []
  }
}

