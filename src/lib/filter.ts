import type { Experience } from '../types/resume'

export type TagOption = {
  tag: string
  count: number
  disabled: boolean
}

/** 選択したタグをすべて含む経歴だけを返す（AND 条件）。選択が空なら全件 */
export function filterExperiences(
  experiences: Experience[],
  selected: string[],
): Experience[] {
  if (selected.length === 0) return experiences
  return experiences.filter((experience) =>
    selected.every((tag) => experience.tags.includes(tag)),
  )
}

/** 全経歴からタグを集約し、出現件数の降順・タグ名の昇順で並べる */
function collectTags(experiences: Experience[]): string[] {
  const counts = new Map<string, number>()
  for (const experience of experiences) {
    for (const tag of new Set(experience.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort(([tagA, countA], [tagB, countB]) =>
      countB - countA || tagA.localeCompare(tagB, 'ja'),
    )
    .map(([tag]) => tag)
}

/** 各タグについて「さらにそれを選んだ場合の該当件数」を計算する */
export function buildTagOptions(
  experiences: Experience[],
  selected: string[],
): TagOption[] {
  return collectTags(experiences).map((tag) => {
    const count = filterExperiences(experiences, [
      ...new Set([...selected, tag]),
    ]).length
    return { tag, count, disabled: count === 0 }
  })
}
