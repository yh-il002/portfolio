import { useTheme } from '../hooks/useTheme'
import type { Profile } from '../types/resume'

export default function Header({ profile }: { profile: Profile }) {
  const { theme, toggle } = useTheme()

  return (
    <header className="border-b border-line pb-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-medium tracking-wide text-accent">
            {profile.title}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {profile.name}
          </h1>
          {profile.location && (
            <p className="mt-2 text-sm text-muted">{profile.location}</p>
          )}
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={
            theme === 'dark' ? 'ライトテーマに切り替える' : 'ダークテーマに切り替える'
          }
          className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {theme === 'dark' ? 'ライト' : 'ダーク'}
        </button>
      </div>

      <p className="mt-6 max-w-2xl leading-relaxed text-muted">{profile.summary}</p>

      {profile.links.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {profile.links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
