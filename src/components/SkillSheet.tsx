import { LEVEL_LABELS, MAX_LEVEL, clampLevel } from '../lib/format'
import type { SkillCategory } from '../types/resume'

function LevelBar({ level }: { level: number }) {
  const value = clampLevel(level)
  return (
    <span
      className="level-bar"
      role="img"
      aria-label={`${LEVEL_LABELS[value]}（レベル${value}）`}
    >
      {Array.from({ length: MAX_LEVEL }, (_, index) => (
        <span key={index} data-filled={index < value} />
      ))}
    </span>
  )
}

export default function SkillSheet({ skills }: { skills: SkillCategory[] }) {
  if (skills.length === 0) return null

  return (
    <section
      id="skills"
      className="page-shell section-space scroll-mt-24"
      aria-labelledby="skills-heading"
    >
      <div className="section-heading skills-heading">
        <div>
          <h2 id="skills-heading">スキル</h2>
          <p>業務経験と独学を、原文の3段階評価で示しています。</p>
        </div>
        <p className="skill-legend">
          {Object.entries(LEVEL_LABELS)
            .map(([level, label]) => `${level}: ${label}`)
            .join(' / ')}
        </p>
      </div>

      <div className="skill-grid">
        {skills.map((category) => (
          <div key={category.category} className="skill-block">
            <h3>{category.category}</h3>
            <ul>
              {category.items.map((skill) => (
                <li key={skill.name}>
                  <span>{skill.name}</span>
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
