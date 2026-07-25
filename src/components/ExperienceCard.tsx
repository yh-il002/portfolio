import { formatPeriod } from '../lib/format'
import type { Experience } from '../types/resume'
import Reveal from './Reveal'

type Props = {
  experience: Experience
  selected: string[]
}

export default function ExperienceCard({ experience, selected }: Props) {
  return (
    <Reveal>
      <article className="experience-card">
        <div className="experience-period">
          <p>{formatPeriod(experience.period)}</p>
        </div>

        <div className="experience-body">
          <div className="experience-title">
            <h3>{experience.project}</h3>
            <p>{experience.company}</p>
          </div>
          <p className="experience-role">{experience.role}</p>
          <p className="experience-meta">
            {experience.teamSize !== null && <span>{experience.teamSize}名</span>}
            <span>{experience.employment}</span>
          </p>
          <p className="experience-duties">{experience.duties}</p>

          {experience.practices.length > 0 && (
            <ul className="experience-practices" role="list">
              {experience.practices.map((practice) => (
                <li key={practice}>{practice}</li>
              ))}
            </ul>
          )}

          {experience.tags.length > 0 && (
            <ul className="experience-tags" role="list">
              {experience.tags.map((tag) => (
                <li key={tag} data-selected={selected.includes(tag)}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </Reveal>
  )
}
