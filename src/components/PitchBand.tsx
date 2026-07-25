import type { Experience } from '../types/resume'

const AI_TECHNOLOGIES = new Set([
  'ClaudeCode',
  'Codex',
  'Gemini CLI',
  'GitHub Copilot',
])

const NON_AI_PRACTICES = new Set(['要件定義', '進行管理'])

type Props = {
  pitch: string
  latestExperience: Experience
}

export default function PitchBand({ pitch, latestExperience }: Props) {
  const aiSkills = [
    ...latestExperience.tags.filter((tag) => AI_TECHNOLOGIES.has(tag)),
    ...latestExperience.practices.filter(
      (practice) => !NON_AI_PRACTICES.has(practice),
    ),
  ]

  return (
    <section className="pitch-band" aria-labelledby="pitch-heading">
      <div className="page-shell pitch-grid">
        <div>
          <p className="eyebrow">SELF PITCH</p>
          <h2 id="pitch-heading">実装領域を広げ続ける</h2>
          <p className="pitch-copy">{pitch}</p>
        </div>
        <div>
          <p className="pitch-label">LATEST / AI-RELATED SKILLS</p>
          <ul className="pitch-tags" role="list">
            {aiSkills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
