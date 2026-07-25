import ExperienceCard from './ExperienceCard'
import type { Experience } from '../types/resume'

type Props = {
  experiences: Experience[]
  selected: string[]
}

export default function ExperienceList({ experiences, selected }: Props) {
  const sorted = [...experiences].sort((a, b) =>
    b.period.start.localeCompare(a.period.start),
  )

  return (
    <section className="mt-14" aria-labelledby="experience-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="experience-heading" className="text-xl font-bold text-ink">
          職務経歴
        </h2>
        <p className="text-sm text-muted" aria-live="polite">
          {sorted.length}件
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
          条件に合う経歴がありません。絞り込みを減らしてください。
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {sorted.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              selected={selected}
            />
          ))}
        </div>
      )}
    </section>
  )
}
