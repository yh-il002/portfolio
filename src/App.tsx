import { useEffect, useRef, useState } from 'react'
import CommandPalette from './components/CommandPalette'
import ExperienceList from './components/ExperienceList'
import Header from './components/Header'
import Hero from './components/Hero'
import PitchBand from './components/PitchBand'
import SkillFilter from './components/SkillFilter'
import SkillSheet from './components/SkillSheet'
import resumeJson from './data/resume.json'
import { useSkillFilter } from './hooks/useSkillFilter'
import type { Resume } from './types/resume'

const resume = resumeJson as Resume

export default function App() {
  const { selected, tagOptions, filtered, toggleTag, clear } = useSkillFilter(
    resume.experiences,
  )
  const [paletteOpen, setPaletteOpen] = useState(false)
  const commandButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const openPalette = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', openPalette)
    return () => window.removeEventListener('keydown', openPalette)
  }, [])

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a className="skip-link" href="#content">
        本文へ移動
      </a>
      <Header
        commandButtonRef={commandButtonRef}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <main id="content" tabIndex={-1}>
        <Hero profile={resume.profile} projectCount={resume.experiences.length} />
        <SkillSheet skills={resume.skills} />
        <PitchBand
          pitch={resume.profile.pitch}
          latestExperience={resume.experiences[0]}
        />

        <section
          id="experience"
          className="page-shell section-space scroll-mt-24"
          aria-labelledby="experience-heading"
        >
          <div className="section-heading">
            <h2 id="experience-heading">職務経歴</h2>
            <p className="mono-label" aria-live="polite">
              {filtered.length} / {resume.experiences.length} 件
            </p>
          </div>
          <SkillFilter
            options={tagOptions}
            selected={selected}
            onToggle={toggleTag}
            onClear={clear}
          />
          <ExperienceList experiences={filtered} selected={selected} />
        </section>
      </main>

      <footer className="page-shell footer-line">
        <p>
          このページは静的サイトです。掲載内容は本人が管理しています。
          <span aria-hidden="true"> · </span>
          <span className="footer-year">2026</span>
        </p>
      </footer>

      <CommandPalette
        open={paletteOpen}
        options={tagOptions}
        selected={selected}
        triggerRef={commandButtonRef}
        onOpenChange={setPaletteOpen}
        onSelect={toggleTag}
      />
    </div>
  )
}
