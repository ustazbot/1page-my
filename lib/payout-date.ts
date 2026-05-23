// lib/payout-date.ts
// Malaysian public holidays (statutory) — update annually
const MY_HOLIDAYS_2025 = [
  '2025-01-01', '2025-01-29', '2025-01-30',
  '2025-02-01', '2025-03-31', '2025-04-18',
  '2025-05-01', '2025-05-12', '2025-06-02',
  '2025-07-31', '2025-08-31', '2025-09-16',
  '2025-10-20', '2025-10-21', '2025-11-03',
  '2025-12-25',
]

const MY_HOLIDAYS_2026 = [
  '2026-01-01', '2026-01-28', '2026-01-29',
  '2026-03-20', '2026-04-03', '2026-05-01',
  '2026-05-20', '2026-06-01', '2026-07-20',
  '2026-08-31', '2026-09-16', '2026-10-09',
  '2026-10-10', '2026-11-23', '2026-12-25',
]

const ALL_HOLIDAYS = new Set([...MY_HOLIDAYS_2025, ...MY_HOLIDAYS_2026])

function pad(n: number) { return String(n).padStart(2, '0') }
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function isWeekend(d: Date) {
  const day = d.getDay()
  return day === 0 || day === 6
}

function isHoliday(d: Date) {
  return ALL_HOLIDAYS.has(toDateStr(d))
}

function isWorkday(d: Date) {
  return !isWeekend(d) && !isHoliday(d)
}

function nextWorkday(d: Date): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + 1)
  while (!isWorkday(next)) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

/**
 * Returns the payout date for a given earned month.
 * Default: 7th of the following month.
 * If 7th is weekend or public holiday, advances to next workday.
 *
 * @param earnedMonth - format 'YYYY-MM', e.g. '2026-05'
 */
export function getPayoutDate(earnedMonth: string): Date {
  const [year, month] = earnedMonth.split('-').map(Number)
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const seventh = new Date(nextYear, nextMonth - 1, 7)

  if (isWorkday(seventh)) return seventh
  return nextWorkday(seventh)
}

/**
 * Formats a Date as Malaysian locale string, e.g. "7 Jun 2026"
 */
export function formatMYDate(d: Date): string {
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Returns current month as 'YYYY-MM'
 */
export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
}
