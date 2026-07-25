import { describe, expect, it } from 'vitest'
import { buildTagOptions, filterExperiences } from './filter'
import type { Experience } from '../types/resume'

function makeExperience(id: string, tags: string[]): Experience {
  return {
    id,
    company: `${id} 社`,
    role: 'エンジニア',
    period: { start: '2020-01', end: null },
    summary: '',
    highlights: [],
    tags,
  }
}

const experiences: Experience[] = [
  makeExperience('a', ['React', 'AWS', 'TypeScript']),
  makeExperience('b', ['React', 'Go']),
  makeExperience('c', ['AWS', 'Terraform']),
]

describe('filterExperiences', () => {
  it('選択が空なら全件を返す', () => {
    expect(filterExperiences(experiences, [])).toHaveLength(3)
  })

  it('1つ選択するとそのタグを含む経歴だけを返す', () => {
    const result = filterExperiences(experiences, ['React'])
    expect(result.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('複数選択すると AND で絞り込む', () => {
    const result = filterExperiences(experiences, ['React', 'AWS'])
    expect(result.map((e) => e.id)).toEqual(['a'])
  })

  it('どの経歴も満たさない組み合わせでは空を返す', () => {
    expect(filterExperiences(experiences, ['Go', 'Terraform'])).toEqual([])
  })
})

describe('buildTagOptions', () => {
  it('タグを重複なく集約する', () => {
    const tags = buildTagOptions(experiences, []).map((o) => o.tag)
    expect(tags).toHaveLength(5)
    expect(new Set(tags).size).toBe(5)
  })

  it('出現件数の降順、同数ならタグ名の昇順で並べる', () => {
    const tags = buildTagOptions(experiences, []).map((o) => o.tag)
    expect(tags).toEqual(['AWS', 'React', 'Go', 'Terraform', 'TypeScript'])
  })

  it('未選択時の count はそのタグ単独での該当件数になる', () => {
    const options = buildTagOptions(experiences, [])
    expect(options.find((o) => o.tag === 'React')?.count).toBe(2)
    expect(options.find((o) => o.tag === 'Go')?.count).toBe(1)
  })

  it('選択済みタグと併せて 0 件になるタグを disabled にする', () => {
    const options = buildTagOptions(experiences, ['React'])
    expect(options.find((o) => o.tag === 'Terraform')).toEqual({
      tag: 'Terraform',
      count: 0,
      disabled: true,
    })
    expect(options.find((o) => o.tag === 'AWS')).toEqual({
      tag: 'AWS',
      count: 1,
      disabled: false,
    })
  })

  it('選択済みのタグは disabled にならない', () => {
    const options = buildTagOptions(experiences, ['Go'])
    expect(options.find((o) => o.tag === 'Go')).toEqual({
      tag: 'Go',
      count: 1,
      disabled: false,
    })
  })
})
