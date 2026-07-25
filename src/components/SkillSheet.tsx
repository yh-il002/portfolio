import { LEVEL_LABELS, MAX_LEVEL, clampLevel } from '../lib/format'
import type { SkillCategory } from '../types/resume'

function LevelBar({ level }: { level: number }) {
  const value = clampLevel(level)
  return (
    <span
      className="flex gap-1"
      role="img"
      aria-label={`${LEVEL_LABELS[value]}（レベル${value}）`}
    >
      {Array.from({ length: MAX_LEVEL }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 w-5 rounded-full ${
            index < value ? 'bg-accent' : 'bg-line'
          }`}
        />
      ))}
    </span>
  )
}

export default function SkillSheet({ skills }: { skills: SkillCategory[] }) {
  if (skills.length === 0) return null

  return (
    <section className="mt-14" aria-labelledby="skills-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="skills-heading" className="text-xl font-bold text-ink">
          スキル
        </h2>
        <p className="text-xs text-muted">
          {Object.entries(LEVEL_LABELS)
            .map(([level, label]) => `${level}: ${label}`)
            .join(' / ')}
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((category) => (
          <div
            key={category.category}
            className="rounded-xl border border-line bg-surface p-5"
          >
            <h3 className="text-sm font-semibold tracking-wide text-muted">
              {category.category}
            </h3>
            <ul className="mt-4 space-y-3">
              {category.items.map((skill) => (
                <li key={skill.name} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-ink">{skill.name}</span>
                  {skill.years !== undefined && (
                    <span className="text-xs text-muted">{skill.years}年</span>
                  )}
                  <LevelBar level={skill.level} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
