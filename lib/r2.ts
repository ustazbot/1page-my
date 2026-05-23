import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? '').replace(/\/$/, '')

export async function uploadToR2(
  key: string,
  buffer: ArrayBuffer,
  contentType: string,
): Promise<string> {
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: contentType,
  }))
  return `${PUBLIC_BASE}/${key}`
}

export async function deleteFromR2(url: string): Promise<void> {
  try {
    if (!PUBLIC_BASE || !url.startsWith(PUBLIC_BASE)) return
    const key = url.slice(PUBLIC_BASE.length + 1) // strip base + leading slash
    if (!key) return
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
  } catch {
    // fail silently — orphaned file acceptable, must not block UI
  }
}
