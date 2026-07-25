import { describe, expect, it } from 'vitest'
import { clampLevel, formatDuration, formatPeriod } from './format'

describe('formatPeriod', () => {
  it('終了月がある期間を整形する', () => {
    expect(formatPeriod({ start: '2020-01', end: '2023-03' })).toBe(
      '2020年1月 〜 2023年3月',
    )
  })

  it('end が null なら現在と表示する', () => {
    expect(formatPeriod({ start: '2023-04', end: null })).toBe('2023年4月 〜 現在')
  })
})

describe('formatDuration', () => {
  it('年と月の両方がある場合は両方を出す', () => {
    expect(formatDuration({ start: '2020-01', end: '2023-03' })).toBe('3年3か月')
  })

  it('1年未満なら月だけを出す', () => {
    expect(formatDuration({ start: '2020-01', end: '2020-05' })).toBe('5か月')
  })

  it('ちょうど年単位なら月を出さない', () => {
    expect(formatDuration({ start: '2020-01', end: '2021-12' })).toBe('2年')
  })

  it('end が null なら基準日までで計算する', () => {
    expect(
      formatDuration({ start: '2023-04', end: null }, new Date('2026-07-15')),
    ).toBe('3年4か月')
  })
})

describe('clampLevel', () => {
  it('範囲内はそのまま返す', () => {
    expect(clampLevel(3)).toBe(3)
  })

  it('下限を下回る値は 1 に丸める', () => {
    expect(clampLevel(0)).toBe(1)
  })

  it('上限を超える値は 4 に丸める', () => {
    expect(clampLevel(9)).toBe(4)
  })

  it('小数は四捨五入する', () => {
    expect(clampLevel(2.6)).toBe(3)
  })
})
