import { useEffect, useState, type RefObject } from 'react'
import { useTheme } from '../hooks/useTheme'

type Props = {
  commandButtonRef: RefObject<HTMLButtonElement | null>
  onOpenPalette: () => void
}

export default function Header({ commandButtonRef, onOpenPalette }: Props) {
  const { theme, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame: number | null = null
    const updateScrolled = () => {
      frame = null
      setScrolled(window.scrollY > 8)
    }
    const handleScroll = () => {
      if (frame === null) frame = requestAnimationFrame(updateScrolled)
    }

    updateScrolled()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <nav className="nav-shell" aria-label="主要ナビゲーション">
        <a className="wordmark" href="#content">
          <span className="wordmark-wide">PORTFOLIO / FE</span>
          <span className="wordmark-narrow" aria-hidden="true">
            P / FE
          </span>
        </a>
        <div className="nav-actions">
          <a className="nav-link" href="#skills">
            スキル
          </a>
          <a className="nav-link" href="#experience">
            経歴
          </a>
          <button
            ref={commandButtonRef}
            type="button"
            className="nav-command"
            onClick={onOpenPalette}
            aria-label="技術タグ検索を開く"
          >
            <span aria-hidden="true">⌘K</span>
          </button>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={
              theme === 'dark'
                ? 'ライトテーマに切り替える'
                : 'ダークテーマに切り替える'
            }
          >
            <span aria-hidden="true">{theme === 'dark' ? '☼' : '◐'}</span>
          </button>
        </div>
      </nav>
    </header>
  )
}
