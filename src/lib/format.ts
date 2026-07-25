import type { Period } from '../types/resume'

export const LEVEL_LABELS: Record<number, string> = {
  1: '学習中',
  2: '実務あり',
  3: '主戦力',
  4: '指導可',
}

export const MAX_LEVEL = 4

/** "YYYY-MM" を年と月に分解する */
function parseMonth(value: string): { year: number; month: number } {
  const [year, month] = value.split('-')
  return { year: Number(year), month: Number(month) }
}

function formatMonth(value: string): string {
  const { year, month } = parseMonth(value)
  return `${year}年${month}月`
}

export function formatPeriod(period: Period): string {
  const end = period.end === null ? '現在' : formatMonth(period.end)
  return `${formatMonth(period.start)} 〜 ${end}`
}

/** 開始月と終了月を両端含めて数えた在籍期間 */
export function formatDuration(period: Period, now: Date = new Date()): string {
  const start = parseMonth(period.start)
  const end =
    period.end === null
      ? { year: now.getFullYear(), month: now.getMonth() + 1 }
      : parseMonth(period.end)

  const months =
    (end.year - start.year) * 12 + (end.month - start.month) + 1
  if (months <= 0) return '1か月未満'

  const years = Math.floor(months / 12)
  const remainder = months % 12
  if (years === 0) return `${remainder}か月`
  if (remainder === 0) return `${years}年`
  return `${years}年${remainder}か月`
}

export function clampLevel(level: number): number {
  return Math.min(MAX_LEVEL, Math.max(1, Math.round(level)))
}
