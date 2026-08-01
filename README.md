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

## 開発ワークフロー

機能追加、画面の挙動変更、影響範囲がすぐには分からないバグ修正やリファクタリングでは、Graph Engineering の `graph-feature-workflow` を使います。Codex が実装し、Claude Code が別の文脈で読み取り専用のレビューを行います。

Codex に次のように依頼してください。

```text
このタスクを graph-feature-workflow で進めてください。
タスク: スキル絞り込みにキーボード操作を追加する
```

タスクごとの引き継ぎ資料は `docs/tasks/<task-slug>/` に保存します。会話の要約ではなく、ここにあるファイルと `git diff` を使って次の担当へ渡します。

### 進み方

1. 要件を `requirements.md` に書き、検証できる受け入れ基準を決める
2. `research.md` に関連ファイル、再利用できる実装、影響範囲、リスクを整理する
3. `plan.md` に変更内容と各ステップの検証方法を書く
4. Codex が計画に沿って実装する
5. `npm run test:run` と `npm run build` を実行し、`verification.md` に結果を記録する
6. Claude Code が `git diff` と成果物を読み、要件・設計・アクセシビリティ・性能をレビューする
7. Codex が指摘ごとに Accepted / Rejected / Deferred を判断し、`resolution.md` に理由を書く
8. 修正した場合は必須チェックを再実行し、必要なら Claude Code に回帰レビューを依頼する
9. 最後に人間が要件、差分、検証結果、レビュー対応を確認する

調査とレビューは読み取り専用です。Claude Code に本番ファイルを編集させず、レビュー指摘を確認せずにそのまま採用しないでください。人間の確認が終わるまで、commit・merge・push は行いません。

影響範囲が明白な単一ファイルの typo 修正など、この手順が重い変更には通常の編集と検証を使います。詳しいルールは `.agents/skills/graph-feature-workflow/SKILL.md` と `AGENTS.md` を参照してください。

## 技術構成

Vite / React / TypeScript / Tailwind CSS / Vitest。詳しい設計判断は `docs/superpowers/specs/2026-07-26-portfolio-design.md` を参照してください。
