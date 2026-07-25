import { useEffect, useState } from 'react'
import type { Profile } from '../types/resume'

type Props = {
  profile: Profile
  projectCount: number
}

function canAnimateCountUp(): boolean {
  return (
    typeof window !== 'undefined' &&
    'matchMedia' in window &&
    typeof requestAnimationFrame === 'function' &&
    typeof performance !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export default function Hero({ profile, projectCount }: Props) {
  const [years, setYears] = useState(() =>
    canAnimateCountUp() ? 0 : profile.experienceYears,
  )
  const titleSuffix = 'エンジニア'
  const titlePrefix = profile.title.endsWith(titleSuffix)
    ? profile.title.slice(0, -titleSuffix.length)
    : null

  useEffect(() => {
    if (!canAnimateCountUp()) {
      setYears(profile.experienceYears)
      return
    }

    let frame = 0
    const startedAt = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / 500, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setYears(Math.round(profile.experienceYears * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [profile.experienceYears])

  const stats = [
    { value: projectCount, unit: '', label: 'プロジェクト' },
    { value: 13, unit: '年', label: 'フロントエンド' },
    { value: 2, unit: '年', label: 'バックエンド' },
    { value: 1, unit: '年', label: 'PM' },
  ]

  return (
    <section className="page-shell hero" aria-labelledby="hero-heading">
      <div className="hero-grid">
        <p className="hero-number" aria-hidden="true">
          {years}
          <span>年</span>
        </p>
        <div className="hero-copy">
          <p className="eyebrow">CAREER PROFILE</p>
          <h1 id="hero-heading">
            {titlePrefix === null ? (
              profile.title
            ) : (
              <>
                <span>{titlePrefix}</span>
                <wbr />
                <span>{titleSuffix}</span>
              </>
            )}
          </h1>
          <p className="hero-qualifier">
            15年。バックエンド2年、フロントエンド13年。
          </p>
          <p className="hero-summary">{profile.summary}</p>
          <p className="profile-meta">
            <span>{profile.age}歳</span>
            <span>{profile.gender}</span>
          </p>
          <span className="visually-hidden">
            業界経験{profile.experienceYears}年
          </span>
        </div>
      </div>

      <dl className="supporting-stats">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>
              <span>{stat.value}</span>{stat.unit}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
