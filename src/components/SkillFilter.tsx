import type { TagOption } from '../lib/filter'

type Props = {
  options: TagOption[]
  selected: string[]
  onToggle: (tag: string) => void
  onClear: () => void
}

export default function SkillFilter({ options, selected, onToggle, onClear }: Props) {
  if (options.length === 0) return null

  return (
    <section className="mt-14" aria-labelledby="filter-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="filter-heading" className="text-xl font-bold text-ink">
          技術で絞り込む
        </h2>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-sm text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            絞り込みを解除
          </button>
        )}
      </div>

      <p className="mt-2 text-sm text-muted">
        複数選ぶと、そのすべてを含む経歴だけが表示されます。
      </p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.tag)
          return (
            <li key={option.tag}>
              <button
                type="button"
                onClick={() => onToggle(option.tag)}
                disabled={option.disabled}
                aria-pressed={isSelected}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isSelected
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-surface text-ink hover:border-accent'
                } disabled:cursor-not-allowed disabled:border-line disabled:bg-transparent disabled:text-muted disabled:opacity-50 disabled:hover:border-line`}
              >
                {option.tag}
                <span className="ml-1.5 text-xs tabular-nums opacity-70">
                  {option.count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
