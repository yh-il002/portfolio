# プロジェクトガイド

## コマンド

`AGENTS.md` の `## コマンド` と同じものを使う。片方だけを更新しない。

- Install: `npm install`
- Dev: `npm run dev`
- Format: `Not configured`
- Lint: `Not configured`
- Typecheck: `Not configured`
- Unit test: `npm run test:run`
- Integration test: `Not configured`
- E2E: `Not configured`
- Build: `npm run build`

## 必須チェック

- `npm run test:run`
- `npm run build`

## Claude Code の役割

**Claude Code はこのリポジトリでは独立した調査担当・レビュー担当**。
ユーザーから明示的に実装を委任された場合を除き、実装は行わない。

- レビュー中に production ファイルを編集しない。
- 実装者の説明文ではなく、要件・計画・検証記録と `git diff` を根拠にする。
- 要件充足、設計整合性、実行時の不具合、回帰リスク、テスト不足を優先する。
- 無関係なリファクタリング提案とスタイルの好みは書かない。
- 指摘は `docs/tasks/<task-slug>/` へ保存する。

## フロントエンド要件

- セマンティック HTML とキーボード操作性を維持する。
- 該当する場合、loading / empty / error / disabled の各状態を確認する。
- プロジェクトが対応するブレークポイントでレスポンシブ挙動を確認する。
- 既存のコンポーネントと設計トークンを再利用してから、新規作成を検討する。

## 引き継ぎ

ツール間の引き継ぎは `docs/tasks/<task-slug>/` のファイルと `git diff` だけで完結させる。
会話履歴の共有を前提にしない。
