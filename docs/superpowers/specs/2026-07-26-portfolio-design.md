# 静的ポートフォリオサイト 設計

作成日: 2026-07-26

## 目的

転職・案件獲得に使うスキルシートを1ページの静的サイトとして公開する。読み手は採用担当やエージェント。経歴データは JSON で管理し、サイトはそれを描画するだけの薄い層に保つ。

## 要件

- 1ページ構成（プロフィール / スキル一覧 / 職務経歴）
- JSON から経歴・スキルを読み込んで描画する
- 技術タグによる経歴の絞り込み
- ダークモード（OS設定連動＋手動切替、選択は永続化）
- GitHub Pages で静的ホスティング

対象外（今回は作らない）:

- 印刷・PDF出力専用レイアウト
- 日英切り替え
- ブログ・記事投稿
- 作品ギャラリーの詳細ページ

## 技術スタック

| 領域 | 選定 | 理由 |
| --- | --- | --- |
| ビルド | Vite | 静的出力が素の HTML/JS/CSS。`base` 一行で GitHub Pages のサブパスに対応 |
| UI | React + TypeScript | 利用者の慣れ。絞り込みの状態管理を標準機能だけで賄える |
| スタイル | Tailwind CSS | ダークモードと配色を CSS 変数＋ユーティリティで完結できる |
| テスト | Vitest | Vite と設定を共有できる |
| CI/CD | GitHub Actions（公式 Pages アーティファクト） | ブランチを増やさず、リポジトリ設定も1箇所で済む |

Next.js と Astro を検討したが採用しなかった。Next.js は静的1ページでは App Router も Server Components も活きず、`basePath` / `assetPrefix` / `images.unoptimized` の設定だけが増える。Astro は JS 配信量で優位だが、絞り込み対象が経歴リスト本体であるため結局リスト全体が island になり、利点が薄まる。

## アーキテクチャ

```
portfolio/
├─ index.html
├─ vite.config.ts          # base: '/<repo名>/'
├─ tsconfig.json
├─ package.json
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx              # ページ全体の組み立て・絞り込み状態の保持
│  ├─ index.css            # Tailwind 読み込み + CSS 変数（テーマ）
│  ├─ data/
│  │  └─ resume.json       # 経歴データの実体
│  ├─ types/
│  │  └─ resume.ts         # JSON の型定義
│  ├─ hooks/
│  │  ├─ useTheme.ts       # ダーク/ライト切替 + localStorage 永続化
│  │  └─ useSkillFilter.ts # タグ選択状態と絞り込みロジック
│  └─ components/
│     ├─ Header.tsx        # 氏名・肩書き・連絡先・テーマトグル
│     ├─ SkillFilter.tsx   # タグのトグル UI
│     ├─ ExperienceList.tsx
│     ├─ ExperienceCard.tsx
│     └─ SkillSheet.tsx    # スキル一覧（カテゴリ別・習熟度）
└─ .github/workflows/deploy.yml
```

責務の分離:

- `App.tsx` が絞り込み状態を持つ唯一の場所。表示コンポーネントは props を受け取って描画するだけで、内部状態を持たない。
- ロジックは `hooks/` の2ファイルに閉じる。UI を作り替えても絞り込みとテーマの挙動は壊れない。
- `useSkillFilter` は `Experience[]` を受け取り、絞り込み済みリスト・タグ一覧・タグごとの該当件数・トグル関数を返す。React への依存は `useState` のみで、絞り込みの計算は純関数として切り出しテスト対象にする。

## データの読み込み方式

`src/data/resume.json` を `import` してビルド時にバンドルする。ランタイム `fetch` は使わない。

理由:

1. TypeScript の型を JSON に効かせられ、データの記述ミスがビルド時に落ちる
2. ローディング状態・エラー状態という分岐が丸ごと不要になる
3. GitHub Pages のサブパス配信でパス解決を誤る事故を避けられる

トレードオフとして経歴の更新ごとに再ビルド（push）が必要になるが、JSON をリポジトリで管理する以上、手数は変わらない。

## JSON スキーマ

```ts
type Resume = {
  profile: Profile
  skills: SkillCategory[]
  experiences: Experience[]
}

type Profile = {
  name: string
  title: string          // 「バックエンドエンジニア」など
  summary: string        // 3〜4行の自己紹介
  location?: string
  links: { label: string; url: string }[]   // GitHub, X, メールなど
}

type SkillCategory = {
  category: string       // 「言語」「フレームワーク」「インフラ」
  items: { name: string; level: SkillLevel; years?: number }[]
}

type SkillLevel = 1 | 2 | 3 | 4

type Experience = {
  id: string
  company: string
  role: string
  period: { start: string; end: string | null }  // "YYYY-MM" 形式、null は現職
  summary: string
  scale?: string         // 「チーム6名 / MAU 20万」など
  highlights: string[]   // 箇条書きの実績
  tags: string[]         // 絞り込みのキー。技術名を入れる
}
```

`SkillLevel` の意味は 1: 学習中 / 2: 実務あり / 3: 主戦力 / 4: 指導可。凡例を画面に表示する。星やパーセント表記より読み違えが起きにくい。

`period.start` / `period.end` は `"YYYY-MM"` 形式の文字列とし、`Date` へのパースは表示時のフォーマット処理でのみ行う。

## 絞り込みの仕様

- タグの一覧は `experiences[].tags` を集約して自動生成する。タグの台帳を別に持たない。
- 複数タグ選択時は **AND**（選択した全タグを含む経歴のみ表示）。「React も AWS も経験した案件」を探せることを優先する。
- 各タグに、現在の選択状態でさらにそれを選んだ場合の該当件数をバッジ表示する。
- 該当件数が 0 になるタグは `disabled` にし、押しても空振りしないようにする。
- 選択が0件のときは全経歴を表示する。

## テーマ

`index.css` の CSS 変数で配色を定義し、`<html>` の `class="dark"` で切り替える（Tailwind の `darkMode: 'class'`）。

初期値は `localStorage` の保存値を優先し、なければ `prefers-color-scheme` に従う。FOUC（初回描画時に一瞬ライトテーマが見える現象）を避けるため、テーマ適用は `index.html` 内のインラインスクリプトで React のマウント前に行う。

## デプロイ

`.github/workflows/deploy.yml` で `main` への push をトリガーに実行する。

1. `actions/checkout`
2. `actions/setup-node`（Node LTS、npm キャッシュ有効）
3. `npm ci`
4. `npm run build`
5. `actions/configure-pages`
6. `actions/upload-pages-artifact`（`dist/`）
7. `actions/deploy-pages`

外部アクションや `gh-pages` ブランチは使わない。リポジトリ側は Settings → Pages のソースを「GitHub Actions」に設定するだけでよい。

`vite.config.ts` の `base` はプロジェクトページとして公開する場合 `'/<リポジトリ名>/'`、ユーザーページ（`<username>.github.io`）として公開する場合 `'/'` とする。公開先が確定した時点で値を決める。

## テスト

`useSkillFilter` の絞り込みロジックにのみ Vitest のユニットテストを置く。検証項目:

1. 複数タグ選択時に AND で絞り込まれること
2. 該当件数0のタグが無効として返ること
3. タグ一覧が `experiences` から重複なく集約されること

コンポーネントの描画テストは、この規模では維持コストに見合わないため作らない。

## エラー処理

ビルド時バンドルにより、実行時のデータ取得エラーは発生しない。JSON の構造不正は TypeScript の型チェック（`npm run build` 時の `tsc`）で検出する。

`profile.links` の URL やスキルの空配列など、型は通るが表示が崩れるケースは、該当セクションを描画しない（空配列なら見出しごと出さない）ことで対処する。
