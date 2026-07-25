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
