# 静的ポートフォリオサイト Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** JSON で管理した職務経歴とスキルを、タグで絞り込める1ページの静的サイトとして GitHub Pages に公開する。

**Architecture:** Vite が `src/data/resume.json` をビルド時にバンドルし、React が1ページを描画する。絞り込みとテーマの状態は `src/hooks/` の2つのフックに閉じ、`App.tsx` がそれらを保持して、表示コンポーネントには props だけを渡す。サーバーもデータ取得もない。

**Tech Stack:** Vite 8 / React 19 / TypeScript 5.9 / Tailwind CSS 4 / Vitest 4 / GitHub Actions

**Spec:** `docs/superpowers/specs/2026-07-26-portfolio-design.md`

## Global Constraints

- Node.js は 22.12 以上（Vite 8 の要求は `^20.19.0 || >=22.12.0`）。CI では 24 を使う。
- Tailwind CSS は v4 系。`tailwind.config.js` は作らない。設定はすべて `src/index.css` の CSS ディレクティブで行う。
- ダークモードは `@custom-variant dark (&:where(.dark, .dark *));` によるクラス方式。`<html>` の `class="dark"` で切り替える。
- Vite の `base` は `'/portfolio/'` 固定。公開 URL は `https://yh-il002.github.io/portfolio/`。
- 経歴データは `import` でビルド時に取り込む。`fetch` は使わない。
- テストは純関数のみを対象とし、DOM 環境（jsdom）とコンポーネントテストは導入しない。
- UI の文言はすべて日本語。

### 仕様からの変更点（1件）

設計書の `SkillLevel = 1 | 2 | 3 | 4` を **`number`** に変更する。TypeScript は JSON import 内の数値を `number` としか推論しないため、リテラルユニオン型への代入がビルドエラーになる。`as` によるキャストで回避すると、JSON 全体の型チェックが緩んで設計意図（構造ミスをビルド時に落とす）が損なわれる。`number` を採り、1〜4 の範囲外は表示時にクランプする。

---

## File Structure

| ファイル | 責務 |
| --- | --- |
| `package.json` | 依存とスクリプト |
| `tsconfig.json` | TypeScript 設定（単一ファイル） |
| `vite.config.ts` | Vite + Tailwind プラグイン + `base` + Vitest 設定 |
| `index.html` | エントリ HTML。テーマ初期適用のインラインスクリプトを含む |
| `src/main.tsx` | React のマウント |
| `src/index.css` | Tailwind 読み込み・dark variant 定義・カラートークン |
| `src/types/resume.ts` | JSON の型定義 |
| `src/data/resume.json` | 経歴データの実体 |
| `src/lib/filter.ts` | 絞り込みの純関数（`filterExperiences` / `buildTagOptions`） |
| `src/lib/filter.test.ts` | 上記のユニットテスト |
| `src/lib/format.ts` | 期間表示とレベル表示のフォーマット純関数 |
| `src/hooks/useSkillFilter.ts` | タグ選択状態を持ち、純関数を組み合わせて返す |
| `src/hooks/useTheme.ts` | テーマ状態と `localStorage` 永続化 |
| `src/components/Header.tsx` | 氏名・肩書き・自己紹介・リンク・テーマトグル |
| `src/components/SkillSheet.tsx` | スキル一覧（カテゴリ別・レベル凡例つき） |
| `src/components/SkillFilter.tsx` | タグのトグル UI（件数バッジ・0件無効化） |
| `src/components/ExperienceCard.tsx` | 経歴1件の表示 |
| `src/components/ExperienceList.tsx` | 経歴カードの並べ替えと空状態 |
| `src/App.tsx` | 全体の組み立てと状態の保持 |
| `.github/workflows/deploy.yml` | GitHub Pages への自動デプロイ |
| `README.md` | 使い方（データ更新手順・ローカル起動） |

---

## Task 1: プロジェクト基盤の構築

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `.gitignore`
- Test: `src/lib/smoke.test.ts`（このタスクの最後に削除する）

**Interfaces:**
- Consumes: なし
- Produces: `npm run dev` / `npm run build` / `npm run test:run` が動く状態。以降の全タスクがこれに乗る。

**注意:** `npm create vite` は使わない。このディレクトリには既に `.git` / `README.md` / `docs/` があり、対話プロンプトで既存ファイルの扱いを尋ねられるため。すべて手で作る。

- [ ] **Step 1: `package.json` を作る**

```json
{
  "name": "portfolio",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^6.0.4",
    "tailwindcss": "^4.3.3",
    "typescript": "^5.9.0",
    "vite": "^8.1.5",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 2: 依存をインストールする**

Run: `npm install`
Expected: `node_modules/` が作られ、エラーなく完了する。`@types/react` の実際のバージョンが `^19.2.0` で解決しない場合は、`npm view @types/react version` で確認して package.json を合わせる。

- [ ] **Step 3: `tsconfig.json` を作る**

`vite.config.ts` と `src/` の両方を1ファイルでカバーする。設定ファイルを分割しない。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["vite/client"],
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 4: `vite.config.ts` を作る**

`defineConfig` は `vitest/config` から import する。`vite` から import すると `test` プロパティで型エラーになる。

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/portfolio/',
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 5: `.gitignore` を作る**

```
node_modules/
dist/
.DS_Store
*.local
```

- [ ] **Step 6: `src/index.css` を作る**

カラートークンを CSS 変数で定義し、`@theme inline` で Tailwind のユーティリティ名（`bg-surface`、`text-ink` など）に結びつける。ライトとダークで変数の値だけが入れ替わる。

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-canvas: var(--app-canvas);
  --color-surface: var(--app-surface);
  --color-line: var(--app-line);
  --color-ink: var(--app-ink);
  --color-muted: var(--app-muted);
  --color-accent: var(--app-accent);
  --color-accent-soft: var(--app-accent-soft);
}

:root {
  --app-canvas: oklch(0.985 0.003 250);
  --app-surface: oklch(1 0 0);
  --app-line: oklch(0.9 0.006 250);
  --app-ink: oklch(0.25 0.02 260);
  --app-muted: oklch(0.53 0.016 260);
  --app-accent: oklch(0.53 0.15 255);
  --app-accent-soft: oklch(0.94 0.03 255);
}

:root.dark {
  --app-canvas: oklch(0.19 0.014 260);
  --app-surface: oklch(0.235 0.016 260);
  --app-line: oklch(0.33 0.016 260);
  --app-ink: oklch(0.95 0.005 260);
  --app-muted: oklch(0.72 0.013 260);
  --app-accent: oklch(0.74 0.13 255);
  --app-accent-soft: oklch(0.3 0.05 255);
}

html {
  color-scheme: light;
}

html.dark {
  color-scheme: dark;
}

body {
  background-color: var(--app-canvas);
  color: var(--app-ink);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 7: `index.html` を作る**

テーマ適用のインラインスクリプトは、`<body>` より前・React のマウント前に実行させる。ここで `class` を付けておかないと、初回描画で一瞬ライトテーマが見える。

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ポートフォリオ</title>
    <script>
      (function () {
        try {
          var saved = localStorage.getItem('theme')
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (saved === 'dark' || (saved === null && prefersDark)) {
            document.documentElement.classList.add('dark')
          }
        } catch (e) {
          /* localStorage が使えない環境ではライトテーマのまま */
        }
      })()
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: `src/main.tsx` と仮の `src/App.tsx` を作る**

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root が見つかりません')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.tsx`（Task 6 で中身を置き換える仮実装）:

```tsx
export default function App() {
  return <main className="p-8 text-ink">セットアップ完了</main>
}
```

- [ ] **Step 9: Vitest が動くことを確認するスモークテストを書く**

`src/lib/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

describe('セットアップ', () => {
  it('Vitest が実行できる', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 10: テストを実行する**

Run: `npm run test:run`
Expected: PASS（1 passed）

- [ ] **Step 11: ビルドを実行する**

Run: `npm run build`
Expected: 型エラーなく完了し、`dist/index.html` と `dist/assets/` が生成される。
`dist/index.html` 内のアセットパスが `/portfolio/assets/...` になっていることを確認する（`base` 設定が効いている証拠）。

- [ ] **Step 12: 開発サーバーで表示を確認する**

Run: `npm run dev`
Expected: 表示された URL を開くと「セットアップ完了」が表示され、コンソールにエラーが出ない。確認できたらサーバーを停止する。

- [ ] **Step 13: スモークテストを削除する**

Run: `rm src/lib/smoke.test.ts`
役目を終えたので残さない。Task 3 で本物のテストが入る。

- [ ] **Step 14: コミット**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts index.html .gitignore src/
git commit -m "$(cat <<'EOF'
Set up Vite React TypeScript project

Vite 8 + React 19 + TypeScript + Tailwind CSS v4 + Vitest のプロジェクト基盤を構築。GitHub Pages 用に base を '/portfolio/' に設定し、ダークモードのカラートークンと FOUC 回避のインラインスクリプトを用意した。
EOF
)"
```

---

## Task 2: 型定義とサンプルデータ

**Files:**
- Create: `src/types/resume.ts`
- Create: `src/data/resume.json`

**Interfaces:**
- Consumes: Task 1 の tsconfig（`resolveJsonModule: true`）
- Produces:
  - `type Resume = { profile: Profile; skills: SkillCategory[]; experiences: Experience[] }`
  - `type Profile = { name: string; title: string; summary: string; location?: string; links: ProfileLink[] }`
  - `type ProfileLink = { label: string; url: string }`
  - `type SkillCategory = { category: string; items: Skill[] }`
  - `type Skill = { name: string; level: number; years?: number }`
  - `type Experience = { id: string; company: string; role: string; period: Period; summary: string; scale?: string; highlights: string[]; tags: string[] }`
  - `type Period = { start: string; end: string | null }`

- [ ] **Step 1: `src/types/resume.ts` を作る**

```ts
export type ProfileLink = {
  label: string
  url: string
}

export type Profile = {
  name: string
  title: string
  summary: string
  location?: string
  links: ProfileLink[]
}

/** 1: 学習中 / 2: 実務あり / 3: 主戦力 / 4: 指導可。範囲外の値は表示時にクランプする */
export type Skill = {
  name: string
  level: number
  years?: number
}

export type SkillCategory = {
  category: string
  items: Skill[]
}

/** "YYYY-MM" 形式。end が null なら現職 */
export type Period = {
  start: string
  end: string | null
}

export type Experience = {
  id: string
  company: string
  role: string
  period: Period
  summary: string
  scale?: string
  highlights: string[]
  tags: string[]
}

export type Resume = {
  profile: Profile
  skills: SkillCategory[]
  experiences: Experience[]
}
```

- [ ] **Step 2: `src/data/resume.json` にサンプルデータを作る**

利用者が後で自分の経歴に書き換える雛形。構造がひと目で分かるよう、経歴3件・スキル3カテゴリを入れる。タグは経歴をまたいで重複させ、AND 絞り込みが意味を持つようにする。

```json
{
  "profile": {
    "name": "山田 太郎",
    "title": "バックエンドエンジニア",
    "summary": "Web アプリケーションのサーバーサイド開発を中心に8年間従事してきました。設計から運用まで一貫して担当し、直近ではチームのテックリードとして技術選定と若手の育成にも関わっています。可用性とコストの両立を意識した基盤づくりを得意としています。",
    "location": "東京都",
    "links": [
      { "label": "GitHub", "url": "https://github.com/yh-il002" },
      { "label": "Email", "url": "mailto:example@example.com" }
    ]
  },
  "skills": [
    {
      "category": "言語",
      "items": [
        { "name": "TypeScript", "level": 4, "years": 6 },
        { "name": "Go", "level": 3, "years": 4 },
        { "name": "Python", "level": 2, "years": 2 }
      ]
    },
    {
      "category": "フレームワーク",
      "items": [
        { "name": "React", "level": 3, "years": 5 },
        { "name": "NestJS", "level": 3, "years": 3 }
      ]
    },
    {
      "category": "インフラ",
      "items": [
        { "name": "AWS", "level": 3, "years": 5 },
        { "name": "Terraform", "level": 3, "years": 3 },
        { "name": "Kubernetes", "level": 2, "years": 2 }
      ]
    }
  ],
  "experiences": [
    {
      "id": "acme-2023",
      "company": "株式会社アクメ",
      "role": "テックリード",
      "period": { "start": "2023-04", "end": null },
      "summary": "BtoB SaaS の基盤刷新を主導。モノリスからの段階的な分割と、デプロイ基盤の再構築を担当しています。",
      "scale": "チーム6名 / MAU 20万",
      "highlights": [
        "デプロイ頻度を週1回から日次へ引き上げ、リードタイムを5日から半日に短縮した",
        "Terraform による構成管理を導入し、環境構築の手順書を廃止した",
        "オンボーディング資料を整備し、新規参画者の立ち上がりを3週間から1週間に縮めた"
      ],
      "tags": ["TypeScript", "AWS", "Terraform", "NestJS", "Kubernetes"]
    },
    {
      "id": "beta-2020",
      "company": "ベータ株式会社",
      "role": "サーバーサイドエンジニア",
      "period": { "start": "2020-01", "end": "2023-03" },
      "summary": "toC 向けメディアサービスの API 開発と、検索基盤のリプレースを担当しました。",
      "scale": "チーム10名 / MAU 80万",
      "highlights": [
        "検索基盤を刷新し、レスポンスタイムの p95 を 1.2 秒から 180 ミリ秒に改善した",
        "負荷試験を CI に組み込み、性能劣化をリリース前に検知できるようにした"
      ],
      "tags": ["Go", "AWS", "React"]
    },
    {
      "id": "gamma-2018",
      "company": "ガンマ合同会社",
      "role": "Web エンジニア",
      "period": { "start": "2018-04", "end": "2019-12" },
      "summary": "受託開発でコーポレートサイトと業務システムを制作。要件定義から実装、保守までを担当しました。",
      "highlights": [
        "年間12件のプロジェクトを納品し、うち5件で継続保守契約につなげた",
        "社内で使い回せるコンポーネント集を整備し、実装工数を平均2割削減した"
      ],
      "tags": ["TypeScript", "React", "Python"]
    }
  ]
}
```

- [ ] **Step 3: 型が JSON に適合することを確認する**

`src/App.tsx` を一時的に次の内容にする。

```tsx
import resumeJson from './data/resume.json'
import type { Resume } from './types/resume'

const resume: Resume = resumeJson

export default function App() {
  return <main className="p-8 text-ink">{resume.profile.name}</main>
}
```

Run: `npm run build`
Expected: 型エラーなく完了する。エラーが出た場合は JSON 側ではなく型定義側の誤りを疑う（`end: null` を許すため `string | null` になっているか、任意プロパティに `?` が付いているか）。

- [ ] **Step 4: コミット**

```bash
git add src/types/ src/data/ src/App.tsx
git commit -m "$(cat <<'EOF'
Add resume type definitions and sample data

経歴データの型定義とサンプル JSON を追加。JSON import の推論と両立させるため、SkillLevel はリテラルユニオンではなく number とした。
EOF
)"
```

---

## Task 3: 絞り込みロジック（TDD）

**Files:**
- Create: `src/lib/filter.ts`
- Test: `src/lib/filter.test.ts`

**Interfaces:**
- Consumes: `Experience` 型（Task 2）
- Produces:
  - `type TagOption = { tag: string; count: number; disabled: boolean }`
  - `function filterExperiences(experiences: Experience[], selected: string[]): Experience[]`
  - `function buildTagOptions(experiences: Experience[], selected: string[]): TagOption[]`

**仕様（設計書より）:**
- 複数タグ選択時は AND。選択が空なら全件返す。
- タグ一覧は `experiences[].tags` から重複なく集約する。
- 並び順は「全経歴での出現件数の降順、同数ならタグ名の昇順」。選択状態に依存しないため、選択のたびに並びが飛ばない。
- `count` は「そのタグをさらに選択した場合の該当件数」。選択済みタグでは現在の絞り込み結果の件数と一致する。
- `disabled` は `count === 0`。選択済みタグは必ず1件以上残るので、自動的に `false` になる。

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/filter.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildTagOptions, filterExperiences } from './filter'
import type { Experience } from '../types/resume'

function makeExperience(id: string, tags: string[]): Experience {
  return {
    id,
    company: `${id} 社`,
    role: 'エンジニア',
    period: { start: '2020-01', end: null },
    summary: '',
    highlights: [],
    tags,
  }
}

const experiences: Experience[] = [
  makeExperience('a', ['React', 'AWS', 'TypeScript']),
  makeExperience('b', ['React', 'Go']),
  makeExperience('c', ['AWS', 'Terraform']),
]

describe('filterExperiences', () => {
  it('選択が空なら全件を返す', () => {
    expect(filterExperiences(experiences, [])).toHaveLength(3)
  })

  it('1つ選択するとそのタグを含む経歴だけを返す', () => {
    const result = filterExperiences(experiences, ['React'])
    expect(result.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('複数選択すると AND で絞り込む', () => {
    const result = filterExperiences(experiences, ['React', 'AWS'])
    expect(result.map((e) => e.id)).toEqual(['a'])
  })

  it('どの経歴も満たさない組み合わせでは空を返す', () => {
    expect(filterExperiences(experiences, ['Go', 'Terraform'])).toEqual([])
  })
})

describe('buildTagOptions', () => {
  it('タグを重複なく集約する', () => {
    const tags = buildTagOptions(experiences, []).map((o) => o.tag)
    expect(tags).toHaveLength(5)
    expect(new Set(tags).size).toBe(5)
  })

  it('出現件数の降順、同数ならタグ名の昇順で並べる', () => {
    const tags = buildTagOptions(experiences, []).map((o) => o.tag)
    expect(tags).toEqual(['AWS', 'React', 'Go', 'Terraform', 'TypeScript'])
  })

  it('未選択時の count はそのタグ単独での該当件数になる', () => {
    const options = buildTagOptions(experiences, [])
    expect(options.find((o) => o.tag === 'React')?.count).toBe(2)
    expect(options.find((o) => o.tag === 'Go')?.count).toBe(1)
  })

  it('選択済みタグと併せて 0 件になるタグを disabled にする', () => {
    const options = buildTagOptions(experiences, ['React'])
    expect(options.find((o) => o.tag === 'Terraform')).toEqual({
      tag: 'Terraform',
      count: 0,
      disabled: true,
    })
    expect(options.find((o) => o.tag === 'AWS')).toEqual({
      tag: 'AWS',
      count: 1,
      disabled: false,
    })
  })

  it('選択済みのタグは disabled にならない', () => {
    const options = buildTagOptions(experiences, ['Go'])
    expect(options.find((o) => o.tag === 'Go')).toEqual({
      tag: 'Go',
      count: 1,
      disabled: false,
    })
  })
})
```

- [ ] **Step 2: テストを実行して失敗を確認する**

Run: `npm run test:run`
Expected: FAIL。`Failed to resolve import "./filter"` または「filter モジュールが見つからない」旨のエラー。

- [ ] **Step 3: `src/lib/filter.ts` を実装する**

```ts
import type { Experience } from '../types/resume'

export type TagOption = {
  tag: string
  count: number
  disabled: boolean
}

/** 選択したタグをすべて含む経歴だけを返す（AND 条件）。選択が空なら全件 */
export function filterExperiences(
  experiences: Experience[],
  selected: string[],
): Experience[] {
  if (selected.length === 0) return experiences
  return experiences.filter((experience) =>
    selected.every((tag) => experience.tags.includes(tag)),
  )
}

/** 全経歴からタグを集約し、出現件数の降順・タグ名の昇順で並べる */
function collectTags(experiences: Experience[]): string[] {
  const counts = new Map<string, number>()
  for (const experience of experiences) {
    for (const tag of new Set(experience.tags)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort(([tagA, countA], [tagB, countB]) =>
      countB - countA || tagA.localeCompare(tagB, 'ja'),
    )
    .map(([tag]) => tag)
}

/** 各タグについて「さらにそれを選んだ場合の該当件数」を計算する */
export function buildTagOptions(
  experiences: Experience[],
  selected: string[],
): TagOption[] {
  return collectTags(experiences).map((tag) => {
    const count = filterExperiences(experiences, [
      ...new Set([...selected, tag]),
    ]).length
    return { tag, count, disabled: count === 0 }
  })
}
```

- [ ] **Step 4: テストを実行して成功を確認する**

Run: `npm run test:run`
Expected: PASS（10 passed）

- [ ] **Step 5: コミット**

```bash
git add src/lib/
git commit -m "$(cat <<'EOF'
Add experience filtering logic

タグの AND 絞り込みとタグ一覧の集約を純関数として実装。各タグには追加選択時の該当件数を持たせ、0 件になるタグは disabled として返す。
EOF
)"
```

---

## Task 4: フックとフォーマッタ

**Files:**
- Create: `src/hooks/useSkillFilter.ts`
- Create: `src/hooks/useTheme.ts`
- Create: `src/lib/format.ts`
- Test: `src/lib/format.test.ts`

**Interfaces:**
- Consumes: `filterExperiences` / `buildTagOptions` / `TagOption`（Task 3）、`Experience`（Task 2）
- Produces:
  - `function useSkillFilter(experiences: Experience[]): { selected: string[]; tagOptions: TagOption[]; filtered: Experience[]; toggleTag: (tag: string) => void; clear: () => void }`
  - `type Theme = 'light' | 'dark'`
  - `function useTheme(): { theme: Theme; toggle: () => void }`
  - `function formatPeriod(period: Period): string` — 例: `"2023年4月 〜 現在"`
  - `function formatDuration(period: Period, now?: Date): string` — 例: `"3年4か月"`
  - `function clampLevel(level: number): number` — 1〜4 に丸める
  - `const LEVEL_LABELS: Record<number, string>` — `{1: '学習中', 2: '実務あり', 3: '主戦力', 4: '指導可'}`

- [ ] **Step 1: `src/lib/format.ts` の失敗するテストを書く**

`src/lib/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { clampLevel, formatDuration, formatPeriod } from './format'

describe('formatPeriod', () => {
  it('終了月がある期間を整形する', () => {
    expect(formatPeriod({ start: '2020-01', end: '2023-03' })).toBe(
      '2020年1月 〜 2023年3月',
    )
  })

  it('end が null なら現在と表示する', () => {
    expect(formatPeriod({ start: '2023-04', end: null })).toBe('2023年4月 〜 現在')
  })
})

describe('formatDuration', () => {
  it('年と月の両方がある場合は両方を出す', () => {
    expect(formatDuration({ start: '2020-01', end: '2023-03' })).toBe('3年3か月')
  })

  it('1年未満なら月だけを出す', () => {
    expect(formatDuration({ start: '2020-01', end: '2020-05' })).toBe('5か月')
  })

  it('ちょうど年単位なら月を出さない', () => {
    expect(formatDuration({ start: '2020-01', end: '2021-12' })).toBe('2年')
  })

  it('end が null なら基準日までで計算する', () => {
    expect(
      formatDuration({ start: '2023-04', end: null }, new Date('2026-07-15')),
    ).toBe('3年4か月')
  })
})

describe('clampLevel', () => {
  it('範囲内はそのまま返す', () => {
    expect(clampLevel(3)).toBe(3)
  })

  it('下限を下回る値は 1 に丸める', () => {
    expect(clampLevel(0)).toBe(1)
  })

  it('上限を超える値は 4 に丸める', () => {
    expect(clampLevel(9)).toBe(4)
  })

  it('小数は四捨五入する', () => {
    expect(clampLevel(2.6)).toBe(3)
  })
})
```

期間の計算は「開始月から終了月までを両端含む」で数える。2020-01 から 2023-03 は 39 か月 = 3年3か月。

- [ ] **Step 2: テストを実行して失敗を確認する**

Run: `npm run test:run`
Expected: FAIL。`./format` が解決できない旨のエラー。

- [ ] **Step 3: `src/lib/format.ts` を実装する**

```ts
import type { Period } from '../types/resume'

export const LEVEL_LABELS: Record<number, string> = {
  1: '学習中',
  2: '実務あり',
  3: '主戦力',
  4: '指導可',
}

export const MAX_LEVEL = 4

/** "YYYY-MM" を年と月に分解する */
function parseMonth(value: string): { year: number; month: number } {
  const [year, month] = value.split('-')
  return { year: Number(year), month: Number(month) }
}

function formatMonth(value: string): string {
  const { year, month } = parseMonth(value)
  return `${year}年${month}月`
}

export function formatPeriod(period: Period): string {
  const end = period.end === null ? '現在' : formatMonth(period.end)
  return `${formatMonth(period.start)} 〜 ${end}`
}

/** 開始月と終了月を両端含めて数えた在籍期間 */
export function formatDuration(period: Period, now: Date = new Date()): string {
  const start = parseMonth(period.start)
  const end =
    period.end === null
      ? { year: now.getFullYear(), month: now.getMonth() + 1 }
      : parseMonth(period.end)

  const months =
    (end.year - start.year) * 12 + (end.month - start.month) + 1
  if (months <= 0) return '1か月未満'

  const years = Math.floor(months / 12)
  const remainder = months % 12
  if (years === 0) return `${remainder}か月`
  if (remainder === 0) return `${years}年`
  return `${years}年${remainder}か月`
}

export function clampLevel(level: number): number {
  return Math.min(MAX_LEVEL, Math.max(1, Math.round(level)))
}
```

- [ ] **Step 4: テストを実行して成功を確認する**

Run: `npm run test:run`
Expected: PASS（19 passed。Task 3 の 10 件と合わせた合計）

- [ ] **Step 5: `src/hooks/useSkillFilter.ts` を実装する**

状態は選択タグの配列だけ。それ以外は Task 3 の純関数から導出する。導出値をわざわざ state に持たない。

```ts
import { useCallback, useMemo, useState } from 'react'
import { buildTagOptions, filterExperiences, type TagOption } from '../lib/filter'
import type { Experience } from '../types/resume'

export type SkillFilterResult = {
  selected: string[]
  tagOptions: TagOption[]
  filtered: Experience[]
  toggleTag: (tag: string) => void
  clear: () => void
}

export function useSkillFilter(experiences: Experience[]): SkillFilterResult {
  const [selected, setSelected] = useState<string[]>([])

  const toggleTag = useCallback((tag: string) => {
    setSelected((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    )
  }, [])

  const clear = useCallback(() => setSelected([]), [])

  const filtered = useMemo(
    () => filterExperiences(experiences, selected),
    [experiences, selected],
  )

  const tagOptions = useMemo(
    () => buildTagOptions(experiences, selected),
    [experiences, selected],
  )

  return { selected, tagOptions, filtered, toggleTag, clear }
}
```

- [ ] **Step 6: `src/hooks/useTheme.ts` を実装する**

初期値は `index.html` のインラインスクリプトが既に `<html>` に反映済みなので、DOM の状態を読むだけでよい。ここで `localStorage` を再読みすると、スクリプトと二重に判定ロジックを持つことになる。

```ts
import { useCallback, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* localStorage が使えない環境では永続化を諦める */
      }
      return next
    })
  }, [])

  return { theme, toggle }
}
```

- [ ] **Step 7: 型チェックを通す**

Run: `npm run build`
Expected: 型エラーなく完了する。

- [ ] **Step 8: コミット**

```bash
git add src/hooks/ src/lib/
git commit -m "$(cat <<'EOF'
Add filter and theme hooks with formatters

絞り込み状態を持つ useSkillFilter、テーマ切替の useTheme、期間とスキルレベルの表示用フォーマッタを追加。フォーマッタはユニットテストで在籍期間の計算を検証している。
EOF
)"
```

---

## Task 5: ヘッダーとスキルシートの表示

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/SkillSheet.tsx`

**Interfaces:**
- Consumes: `Profile` / `SkillCategory`（Task 2）、`clampLevel` / `LEVEL_LABELS` / `MAX_LEVEL`（Task 4）、`useTheme`（Task 4）
- Produces:
  - `function Header(props: { profile: Profile }): JSX.Element`
  - `function SkillSheet(props: { skills: SkillCategory[] }): JSX.Element`

どちらも内部状態を持たない。テーマトグルだけは `Header` 内で `useTheme` を呼ぶ（この状態は他のどこからも参照されないため、上に持ち上げない）。

- [ ] **Step 1: `src/components/Header.tsx` を作る**

```tsx
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
```

- [ ] **Step 2: `src/components/SkillSheet.tsx` を作る**

レベルは4分割のバーで表す。数値の意味は凡例で示す。`skills` が空なら見出しごと出さない（設計書のエラー処理方針）。

```tsx
import { LEVEL_LABELS, MAX_LEVEL, clampLevel } from '../lib/format'
import type { SkillCategory } from '../types/resume'

function LevelBar({ level }: { level: number }) {
  const value = clampLevel(level)
  return (
    <span
      className="flex gap-1"
      role="img"
      aria-label={`${LEVEL_LABELS[value]}（レベル${value}）`}
    >
      {Array.from({ length: MAX_LEVEL }, (_, index) => (
        <span
          key={index}
          className={`h-1.5 w-5 rounded-full ${
            index < value ? 'bg-accent' : 'bg-line'
          }`}
        />
      ))}
    </span>
  )
}

export default function SkillSheet({ skills }: { skills: SkillCategory[] }) {
  if (skills.length === 0) return null

  return (
    <section className="mt-14" aria-labelledby="skills-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="skills-heading" className="text-xl font-bold text-ink">
          スキル
        </h2>
        <p className="text-xs text-muted">
          {Object.entries(LEVEL_LABELS)
            .map(([level, label]) => `${level}: ${label}`)
            .join(' / ')}
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((category) => (
          <div
            key={category.category}
            className="rounded-xl border border-line bg-surface p-5"
          >
            <h3 className="text-sm font-semibold tracking-wide text-muted">
              {category.category}
            </h3>
            <ul className="mt-4 space-y-3">
              {category.items.map((skill) => (
                <li key={skill.name} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-ink">{skill.name}</span>
                  {skill.years !== undefined && (
                    <span className="text-xs text-muted">{skill.years}年</span>
                  )}
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
```

- [ ] **Step 3: 型チェックを通す**

Run: `npm run build`
Expected: 型エラーなく完了する。

- [ ] **Step 4: コミット**

```bash
git add src/components/
git commit -m "$(cat <<'EOF'
Add header and skill sheet components

プロフィールとテーマトグルを持つヘッダー、カテゴリ別のスキル一覧を追加。スキルレベルは4分割バーで表示し、凡例を併記した。
EOF
)"
```

---

## Task 6: 絞り込み UI と経歴一覧、全体の組み立て

**Files:**
- Create: `src/components/SkillFilter.tsx`
- Create: `src/components/ExperienceCard.tsx`
- Create: `src/components/ExperienceList.tsx`
- Modify: `src/App.tsx`（Task 2 で書いた仮実装を置き換える）

**Interfaces:**
- Consumes: `TagOption`（Task 3）、`useSkillFilter`（Task 4）、`formatPeriod` / `formatDuration`（Task 4）、`Header` / `SkillSheet`（Task 5）、`Experience`（Task 2）
- Produces:
  - `function SkillFilter(props: { options: TagOption[]; selected: string[]; onToggle: (tag: string) => void; onClear: () => void }): JSX.Element | null`
  - `function ExperienceCard(props: { experience: Experience; selected: string[] }): JSX.Element`
  - `function ExperienceList(props: { experiences: Experience[]; selected: string[] }): JSX.Element`

- [ ] **Step 1: `src/components/SkillFilter.tsx` を作る**

各タグは `aria-pressed` を持つトグルボタン。件数が0のタグは `disabled`。選択中が1件以上あるときだけ解除ボタンを出す。

```tsx
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
```

- [ ] **Step 2: `src/components/ExperienceCard.tsx` を作る**

カード内のタグは、絞り込みで選択中のものだけ強調する。ここではクリックできるようにしない（絞り込みの入口は `SkillFilter` の1箇所に保つ）。

```tsx
import { formatDuration, formatPeriod } from '../lib/format'
import type { Experience } from '../types/resume'

type Props = {
  experience: Experience
  selected: string[]
}

export default function ExperienceCard({ experience, selected }: Props) {
  return (
    <article className="rounded-xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-lg font-bold text-ink">{experience.company}</h3>
        <p className="text-sm text-muted">
          {formatPeriod(experience.period)}
          <span className="ml-2 opacity-70">
            （{formatDuration(experience.period)}）
          </span>
        </p>
      </div>

      <p className="mt-1 text-sm font-medium text-accent">{experience.role}</p>
      {experience.scale && (
        <p className="mt-1 text-xs text-muted">{experience.scale}</p>
      )}

      <p className="mt-4 leading-relaxed text-ink">{experience.summary}</p>

      {experience.highlights.length > 0 && (
        <ul className="mt-4 space-y-2">
          {experience.highlights.map((highlight) => (
            <li
              key={highlight}
              className="relative pl-5 text-sm leading-relaxed text-muted before:absolute before:left-0 before:top-[0.6em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-accent"
            >
              {highlight}
            </li>
          ))}
        </ul>
      )}

      {experience.tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {experience.tags.map((tag) => (
            <li
              key={tag}
              className={`rounded px-2 py-0.5 text-xs ${
                selected.includes(tag)
                  ? 'bg-accent-soft font-medium text-accent'
                  : 'bg-canvas text-muted'
              }`}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
```

- [ ] **Step 3: `src/components/ExperienceList.tsx` を作る**

新しい経歴を上に並べる。並べ替えは `period.start` の文字列比較でよい（`"YYYY-MM"` は辞書順が時系列順と一致する）。

```tsx
import ExperienceCard from './ExperienceCard'
import type { Experience } from '../types/resume'

type Props = {
  experiences: Experience[]
  selected: string[]
}

export default function ExperienceList({ experiences, selected }: Props) {
  const sorted = [...experiences].sort((a, b) =>
    b.period.start.localeCompare(a.period.start),
  )

  return (
    <section className="mt-14" aria-labelledby="experience-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="experience-heading" className="text-xl font-bold text-ink">
          職務経歴
        </h2>
        <p className="text-sm text-muted" aria-live="polite">
          {sorted.length}件
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">
          条件に合う経歴がありません。絞り込みを減らしてください。
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {sorted.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              selected={selected}
            />
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 4: `src/App.tsx` を本実装に置き換える**

状態を持つのはここだけ。`resume.experiences` は module スコープの定数なので参照が安定し、`useSkillFilter` 内の `useMemo` が毎レンダリングで再計算されない。

```tsx
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
```

- [ ] **Step 5: テストとビルドを通す**

Run: `npm run test:run && npm run build`
Expected: どちらも PASS / 成功。

- [ ] **Step 6: 開発サーバーで動作を目視確認する**

Run: `npm run dev`

以下を順に確認する。

1. 経歴が3件、新しい順（アクメ → ベータ → ガンマ）で表示される
2. 「React」を押すと2件に絞られ、押したタグが強調される
3. さらに「AWS」を押すと1件（アクメ）になる
4. その状態で「Terraform」が灰色になり、押せない
5. 「絞り込みを解除」で3件に戻る
6. テーマトグルで配色が切り替わり、リロード後も選択が保たれる
7. ブラウザのコンソールにエラーや警告が出ていない

確認できたらサーバーを停止する。

- [ ] **Step 7: コミット**

```bash
git add src/
git commit -m "$(cat <<'EOF'
Add filter UI and experience list

技術タグの絞り込み UI、経歴カード、経歴一覧を追加し、App で全体を組み立てた。絞り込みは AND 条件で、0 件になるタグは押せないようにしている。
EOF
)"
```

---

## Task 7: GitHub Pages へのデプロイと README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: `npm run test:run` と `npm run build`（Task 1）、`dist/` 出力
- Produces: `main` への push で `https://yh-il002.github.io/portfolio/` が更新される状態

- [ ] **Step 1: 各アクションの最新メジャーバージョンを確認する**

Run:

```bash
for a in actions/checkout actions/setup-node actions/configure-pages actions/upload-pages-artifact actions/deploy-pages; do
  echo -n "$a: "
  curl -s "https://api.github.com/repos/$a/releases/latest" | grep '"tag_name"' | head -1
done
```

Expected: 各アクションの最新タグが表示される。次のステップの `@vN` を、ここで得たメジャーバージョンに合わせる。取得に失敗した場合は下記の値をそのまま使う。

- [ ] **Step 2: `.github/workflows/deploy.yml` を作る**

ビルド前にテストを走らせ、壊れたものが公開されないようにする。`permissions` と `concurrency` は Pages デプロイの必須設定。

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm

      - run: npm ci

      - run: npm run test:run

      - run: npm run build

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v4
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: `README.md` を書く**

````markdown
# ポートフォリオ

職務経歴とスキルを1ページにまとめた静的サイト。

公開先: https://yh-il002.github.io/portfolio/

## 経歴の更新

`src/data/resume.json` を編集して `main` に push すると、GitHub Actions が自動でビルドして公開します。

- `profile` — 氏名、肩書き、自己紹介、リンク
- `skills` — カテゴリ別のスキル。`level` は 1: 学習中 / 2: 実務あり / 3: 主戦力 / 4: 指導可
- `experiences` — 職務経歴。`tags` に書いた技術名がそのまま絞り込みの選択肢になります

`period.end` を `null` にすると「現在」と表示されます。型は `src/types/resume.ts` にあり、構造を間違えるとビルドが失敗するので、公開前に気づけます。

## ローカルでの作業

```bash
npm install
npm run dev      # 開発サーバー
npm run test:run # テスト
npm run build    # 本番ビルド（型チェック込み）
npm run preview  # ビルド結果の確認
```

`npm run preview` で開くパスは `/portfolio/` 配下になります。これは GitHub Pages のプロジェクトページに合わせた `base` 設定（`vite.config.ts`）によるものです。

## 技術構成

Vite / React / TypeScript / Tailwind CSS / Vitest。詳しい設計判断は `docs/superpowers/specs/2026-07-26-portfolio-design.md` を参照してください。
````

- [ ] **Step 4: ワークフローの YAML 構文を確認する**

Run: `npx --yes js-yaml .github/workflows/deploy.yml > /dev/null && echo OK`
Expected: `OK` と表示される。

- [ ] **Step 5: コミットして push する**

```bash
git add .github/ README.md
git commit -m "$(cat <<'EOF'
Add GitHub Pages deployment workflow

main への push でテスト、ビルド、Pages への公開を行うワークフローを追加。README にデータ更新手順とローカル開発手順を記載した。
EOF
)"
git push origin main
```

- [ ] **Step 6: リポジトリ側の設定を有効にする**

これは Web UI での操作。GitHub の該当リポジトリで Settings → Pages を開き、Build and deployment の Source を **GitHub Actions** に変更する。この設定をしないとワークフローが `deploy-pages` の段階で失敗する。

- [ ] **Step 7: デプロイの成功を確認する**

Run: `gh run watch`（または Actions タブを開く）
Expected: `build` と `deploy` の両ジョブが成功する。

その後 `https://yh-il002.github.io/portfolio/` を開き、以下を確認する。

1. ページが表示され、CSS が当たっている（アセットの 404 がない = `base` が正しい）
2. タグの絞り込みが動く
3. テーマトグルが動く

---

## Self-Review

**Spec coverage:**

| 仕様 | 対応タスク |
| --- | --- |
| 1ページ構成（プロフィール / スキル / 経歴） | Task 5, 6 |
| JSON からの読み込み（import 方式） | Task 2, 6 |
| 型定義 | Task 2 |
| タグの AND 絞り込み | Task 3, 4, 6 |
| 件数バッジ・0件タグの無効化 | Task 3, 6 |
| タグ一覧の自動集約 | Task 3 |
| ダークモード（OS連動・手動・永続化） | Task 1（インラインスクリプト）, 4（useTheme）, 5（トグル UI） |
| FOUC 回避 | Task 1 |
| `base: '/portfolio/'` | Task 1 |
| GitHub Actions デプロイ | Task 7 |
| `useSkillFilter` のロジックテスト | Task 3 |
| 空配列時にセクションを出さない | Task 5（SkillSheet）, 6（SkillFilter, ExperienceCard） |
| レベル凡例の表示 | Task 5 |

未対応の仕様はない。

**Type consistency:** `TagOption` は Task 3 で定義し、Task 4 と Task 6 で同じ名前と形（`tag` / `count` / `disabled`）で使っている。`filterExperiences` / `buildTagOptions` / `formatPeriod` / `formatDuration` / `clampLevel` / `LEVEL_LABELS` / `MAX_LEVEL` の名前は定義箇所と利用箇所で一致している。`SkillLevel` はグローバル制約の変更どおり型として定義せず、`Skill.level: number` に統一した。

**スコープ:** 単一のサイトで、タスクは順に積み上がる。分割の必要はない。
