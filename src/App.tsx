import ExperienceList from './components/ExperienceList'
import Header from './components/Header'
import SkillFilter from './components/SkillFilter'
import SkillSheet from './components/SkillSheet'
import resumeJson from './data/resume.json'
import { useSkillFilter } from './hooks/useSkillFilter'
import type { Resume } from './types/resume'

const resume: Resume = resumeJson

export default function App() {
  const { selected, tagOptions, filtered, toggleTag, clear } = useSkillFilter(
    resume.experiences,
  )

  return (
    <div className="min-h-screen bg-canvas">
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <Header profile={resume.profile} />
        <SkillSheet skills={resume.skills} />
        <SkillFilter
          options={tagOptions}
          selected={selected}
          onToggle={toggleTag}
          onClear={clear}
        />
        <ExperienceList experiences={filtered} selected={selected} />
        <footer className="mt-20 border-t border-line pt-6 text-xs text-muted">
          このページは静的サイトです。掲載内容は {resume.profile.name} 本人が管理しています。
        </footer>
      </main>
    </div>
  )
}
