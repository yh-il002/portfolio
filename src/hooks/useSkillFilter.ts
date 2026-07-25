import { useCallback, useMemo, useState } from 'react'
import { buildTagOptions, filterExperiences, type TagOption } from '../lib/filter'
import type { Experience } from '../types/resume'

export type SkillFilterResult = {
  selected: string[]
  tagOptions: TagOption[]
  filtered: Experience[]
  toggleTag: (tag: string) => void
  clear: () => void
}

export function useSkillFilter(experiences: Experience[]): SkillFilterResult {
  const [selected, setSelected] = useState<string[]>([])

  const toggleTag = useCallback((tag: string) => {
    setSelected((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    )
  }, [])

  const clear = useCallback(() => setSelected([]), [])

  const filtered = useMemo(
    () => filterExperiences(experiences, selected),
    [experiences, selected],
  )

  const tagOptions = useMemo(
    () => buildTagOptions(experiences, selected),
    [experiences, selected],
  )

  return { selected, tagOptions, filtered, toggleTag, clear }
}
