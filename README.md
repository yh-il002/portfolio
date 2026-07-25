# ポートフォリオ

匿名化した職務経歴30件とスキルを1ページにまとめた静的サイトです。実データは `docs/skill-sheet.html` を元にし、氏名と学歴は掲載しません。

公開先: https://yh-il002.github.io/portfolio/

## 経歴の更新

`src/data/resume.json` を編集して `main` に push すると、GitHub Actions が自動でビルドして公開します。

- `profile` — 肩書き、年齢、性別、業界経験年数、職務要約、自己PR、リンク
- `skills` — カテゴリ別のスキル。`level` は 1: 独学 / 2: 経験あり / 3: 得意
- `experiences` — 新しい順の職務経歴。`tags` が絞り込みとコマンドパレットの選択肢になります

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

クローラー対策は `index.html` の meta robots を主指定としています。GitHub Pages のプロジェクトページでは `robots.txt` はドメイン直下しか参照されないため、実効的な指定は meta robots 側です。

## 技術構成

Vite / React / TypeScript / Tailwind CSS / Vitest。詳しい設計判断は `docs/superpowers/specs/2026-07-26-portfolio-design.md` を参照してください。
