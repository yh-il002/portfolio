import { describe, expect, it } from 'vitest'
import resume from './resume.json'
import indexHtml from '../../index.html?raw'

const sourceFiles = import.meta.glob('../**/*', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('resume.json', () => {
  it('実データの経歴30件を新しい順で保持する', () => {
    expect(resume.experiences).toHaveLength(30)
    const starts = resume.experiences.map(({ period }) => period.start)
    expect(starts).toEqual([...starts].sort((a, b) => b.localeCompare(a)))
  })

  it('すべての期間が正しい年月形式と順序を持つ', () => {
    for (const { period } of resume.experiences) {
      expect(period.start).toMatch(/^\d{4}-\d{2}$/)
      if (period.end !== null) {
        expect(period.end).toMatch(/^\d{4}-\d{2}$/)
        expect(period.start <= period.end).toBe(true)
      }
    }
  })

  it('現在進行中の直近案件は end が null である', () => {
    expect(resume.experiences[0]).toMatchObject({
      company: 'N社',
      period: { start: '2025-06', end: null },
    })
  })

  it('経歴IDが一意である', () => {
    const ids = resume.experiences.map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('スキルレベルが1〜3の範囲に収まる', () => {
    const levels = resume.skills.flatMap(({ items }) =>
      items.map(({ level }) => level),
    )
    expect(levels.length).toBeGreaterThan(0)
    expect(levels.every((level) => level >= 1 && level <= 3)).toBe(true)
  })

  it('すべての技術タグを16文字以下に保つ', () => {
    const tags = resume.experiences.flatMap(({ tags }) => tags)
    expect(tags.filter((tag) => tag.length > 16)).toEqual([])
  })

  it('文字数制約のために技術名を省略・分割しない', () => {
    const latestTags = resume.experiences.find(
      ({ id }) => id === 'n-2025-06',
    )?.tags
    const serverTags = resume.experiences
      .filter(({ id }) => id.startsWith('u-'))
      .flatMap(({ tags }) => tags)
    const linuxTags = resume.experiences.find(
      ({ id }) => id === 'f-2011-04',
    )?.tags

    expect(latestTags).toContain('GitHub Copilot')
    expect(latestTags).not.toContain('Copilot')
    expect(serverTags).toContain('Windows Server')
    expect(serverTags).not.toContain('Win Server')
    expect(linuxTags).toContain('Linux(CentOS)')
    expect(linuxTags).not.toContain('Linux')
    expect(linuxTags).not.toContain('CentOS')
  })

  it('技術タグに表記ゆれや括弧付きの重複タグを含めない', () => {
    const tags = resume.experiences.flatMap(({ tags }) => tags)
    const forbidden = [
      'Typescript',
      'Actionscript',
      'Boobstrap',
      'CI/CD（Bitbucket Pipelines）',
      'Next.js（SSR、SSG）',
      'ヘッドレスCMS(microCMS)',
      'JavaScript(ES6)',
    ]
    expect(tags.filter((tag) => forbidden.includes(tag))).toEqual([])
  })

  it('すべての経歴にフィルタ対象外の practices 配列を持つ', () => {
    expect(
      resume.experiences.every(
        (experience) =>
          'practices' in experience && Array.isArray(experience.practices),
      ),
    ).toBe(true)
  })

  it('スキル名の TypeScript・ActionScript・Bootstrap 表記を統一する', () => {
    const skillNames = resume.skills.flatMap(({ items }) =>
      items.map(({ name }) => name),
    )
    expect(skillNames).toContain('TypeScript')
    expect(skillNames).toContain('ActionScript')
    expect(skillNames).toContain('Bootstrap')
    expect(skillNames).not.toContain('Typescript')
    expect(skillNames).not.toContain('Actionscript')
    expect(skillNames).not.toContain('Boobstrap')
    expect(JSON.stringify(resume)).not.toContain('Typescript')
  })
})

describe('掲載禁止情報', () => {
  it('src配下とindex.htmlに氏名を含めない', () => {
    const source = `${Object.values(sourceFiles).join('\n')}\n${indexHtml}`
    expect(source).not.toContain(['平', '松'].join(''))
    expect(source).not.toContain(['泰', '明'].join(''))
  })
})
