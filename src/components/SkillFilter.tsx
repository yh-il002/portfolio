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
    <section className="filter-panel" aria-labelledby="filter-heading">
      <div className="filter-heading">
        <div>
          <h3 id="filter-heading">技術タグで絞り込む</h3>
          <p>複数選択時は、すべてを含む経歴を表示します。</p>
        </div>
        <button type="button" className="clear-filter" onClick={onClear}>
          すべて解除
          {selected.length > 0 && (
            <span className="visually-hidden">（{selected.length}件選択中）</span>
          )}
        </button>
      </div>

      <ul className="filter-list" role="list">
        {options.map((option) => {
          const isSelected = selected.includes(option.tag)
          return (
            <li key={option.tag}>
              <button
                type="button"
                onClick={() => onToggle(option.tag)}
                disabled={option.disabled}
                aria-pressed={isSelected}
                className="filter-chip"
                title={option.tag}
              >
                <span>{option.tag}</span>
                <span aria-hidden="true">{option.count}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
