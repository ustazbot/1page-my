// Track processed submissions in localStorage — single operator, local tool

const STORAGE_KEY = '1page_processed_jobs'

export type JobStatus = 'draft' | 'in_progress' | 'complete' | 'live'

export interface JobRecord {
  key: string          // timestamp|business_name
  business_name: string
  slug: string
  status: JobStatus
  processed_at: string
}

function load(): Record<string, JobRecord> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(jobs: Record<string, JobRecord>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  } catch {}
}

export function markProcessed(key: string, business_name: string, slug: string): void {
  const jobs = load()
  if (!jobs[key]) {
    jobs[key] = {
      key,
      business_name,
      slug,
      status: 'draft',
      processed_at: new Date().toISOString(),
    }
    save(jobs)
  }
}

export function updateJobStatus(key: string, status: JobStatus): void {
  const jobs = load()
  if (jobs[key]) {
    jobs[key].status = status
    save(jobs)
  }
}

export function isProcessed(key: string): boolean {
  const jobs = load()
  return !!jobs[key]
}

export function getJobStatus(key: string): JobStatus | null {
  const jobs = load()
  return jobs[key]?.status ?? null
}

export function getAllJobs(): JobRecord[] {
  return Object.values(load()).sort(
    (a, b) => new Date(b.processed_at).getTime() - new Date(a.processed_at).getTime()
  )
}

export function clearJob(key: string): void {
  const jobs = load()
  delete jobs[key]
  save(jobs)
}
