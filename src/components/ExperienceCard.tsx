import { formatDuration, formatPeriod } from '../lib/format'
import type { Experience } from '../types/resume'

type Props = {
  experience: Experience
  selected: string[]
}

export default function ExperienceCard({ experience, selected }: Props) {
  return (
    <article className="rounded-xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-lg font-bold text-ink">{experience.company}</h3>
        <p className="text-sm text-muted">
          {formatPeriod(experience.period)}
          <span className="ml-2 opacity-70">
            （{formatDuration(experience.period)}）
          </span>
        </p>
      </div>

      <p className="mt-1 text-sm font-medium text-accent">{experience.role}</p>
      {experience.scale && (
        <p className="mt-1 text-xs text-muted">{experience.scale}</p>
      )}

      <p className="mt-4 leading-relaxed text-ink">{experience.summary}</p>

      {experience.highlights.length > 0 && (
        <ul className="mt-4 space-y-2">
          {experience.highlights.map((highlight) => (
            <li
              key={highlight}
              className="relative pl-5 text-sm leading-relaxed text-muted before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent"
            >
              {highlight}
            </li>
          ))}
        </ul>
      )}

      {experience.tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {experience.tags.map((tag) => (
            <li
              key={tag}
              className={`rounded px-2 py-0.5 text-xs ${
                selected.includes(tag)
                  ? 'bg-accent-soft font-medium text-accent'
                  : 'bg-canvas text-muted'
              }`}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
