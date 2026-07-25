import ExperienceCard from './ExperienceCard'
import type { Experience } from '../types/resume'

type Props = {
  experiences: Experience[]
  selected: string[]
}

export default function ExperienceList({ experiences, selected }: Props) {
  if (experiences.length === 0) {
    return (
      <p className="experience-empty">
        条件に合う経歴がありません。選択中のタグを減らしてください。
      </p>
    )
  }

  return (
    <div className="experience-list">
      {experiences.map((experience) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          selected={selected}
        />
      ))}
    </div>
  )
}
