import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { TagOption } from '../lib/filter'

type Props = {
  open: boolean
  options: TagOption[]
  selected: string[]
  triggerRef: RefObject<HTMLButtonElement | null>
  onOpenChange: (open: boolean) => void
  onSelect: (tag: string) => void
}

export default function CommandPalette({
  open,
  options,
  selected,
  triggerRef,
  onOpenChange,
  onSelect,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ja')
    if (!normalized) return options
    return options.filter(({ tag }) =>
      tag.toLocaleLowerCase('ja').includes(normalized),
    )
  }, [options, query])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      setQuery('')
      setActiveIndex(0)
      dialog.showModal()
      requestAnimationFrame(() => inputRef.current?.focus())
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (activeIndex >= results.length) setActiveIndex(Math.max(0, results.length - 1))
  }, [activeIndex, results.length])

  const close = () => onOpenChange(false)
  const select = (tag: string) => {
    onSelect(tag)
    close()
  }

  return (
    <dialog
      ref={dialogRef}
      className="command-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-heading"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClose={() => {
        onOpenChange(false)
        const previousFocus = previousFocusRef.current
        previousFocusRef.current = null
        if (previousFocus?.isConnected) {
          previousFocus.focus()
        } else {
          triggerRef.current?.focus()
        }
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div className="command-surface">
        <div className="command-heading">
          <div>
            <p className="eyebrow">COMMAND / FILTER</p>
            <h2 id="command-heading">技術タグを選択</h2>
          </div>
          <button type="button" className="command-close" onClick={close}>
            閉じる
            <span aria-hidden="true"> ESC</span>
          </button>
        </div>

        <label className="command-label" htmlFor="command-search">
          タグ名
        </label>
        <input
          ref={inputRef}
          id="command-search"
          className="command-input"
          type="search"
          value={query}
          placeholder="React、TypeScript、AWS…"
          autoComplete="off"
          role="combobox"
          aria-controls="command-results"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-activedescendant={
            results.length > 0 ? `command-option-${activeIndex}` : undefined
          }
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActiveIndex((index) =>
                results.length === 0 ? 0 : (index + 1) % results.length,
              )
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActiveIndex((index) =>
                results.length === 0
                  ? 0
                  : (index - 1 + results.length) % results.length,
              )
            } else if (event.key === 'Enter' && results[activeIndex]) {
              event.preventDefault()
              select(results[activeIndex].tag)
            } else if (event.key === 'Escape') {
              event.preventDefault()
              close()
            }
          }}
        />

        <div className="command-count" aria-live="polite">
          {results.length}件
        </div>
        {results.length === 0 ? (
          <p className="command-empty">一致する技術タグがありません。</p>
        ) : (
          <ul id="command-results" className="command-results" role="listbox">
            {results.map((option, index) => (
              <li key={option.tag} role="presentation">
                <button
                  id={`command-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  aria-label={`${option.tag}（${
                    selected.includes(option.tag) ? '選択中、' : ''
                  }該当${option.count}件）`}
                  tabIndex={-1}
                  data-active={index === activeIndex}
                  disabled={option.disabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(option.tag)}
                >
                  <span>{option.tag}</span>
                  <span>
                    {selected.includes(option.tag) ? '選択中 · ' : ''}
                    {option.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  )
}
