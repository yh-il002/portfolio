---
name: graph-secondary-review
description: 別ツールが実装した変更を、タスク成果物と git diff だけを根拠に独立した文脈でレビューする。Reviews another tool's implementation from file-based handoff artifacts and git diff.
---

# Claude Code 副レビュー

Codex が実装した変更を、独立した文脈でレビューする。
実装時の会話文脈は共有されていない。**それが目的**であり、欠点ではない。

## 入力

必須:

- `docs/tasks/<task-slug>/requirements.md`
- `docs/tasks/<task-slug>/plan.md`
- `docs/tasks/<task-slug>/verification.md`
- 現在の `git diff`

任意:

- `docs/tasks/<task-slug>/research.md`（リポジトリの制約を理解する必要がある場合）
- 規約を確認するために必要なソースファイル

## レビュー順序

1. 受け入れ基準を 1 つずつ、実装コードと検証記録に対応付ける
2. 実行時の挙動と状態遷移を確認する
3. 回帰リスクを確認する
4. 構造的な変更の場合、設計整合性を確認する
5. インタラクティブな UI の場合、アクセシビリティを確認する
6. テストが受け入れ基準を検証しているか確認する

## 委譲

- `independent-reviewer`: 常に実行する
- `architecture-reviewer`: 横断的・構造的な変更のとき
- `accessibility-reviewer`: UI の変更を含むとき
- `performance-reviewer`: UI の描画やバンドルに影響する変更のとき

一般レビューと専門レビューは並列実行してよい。

## 出力

- `docs/tasks/<task-slug>/claude-review.md`
- `docs/tasks/<task-slug>/claude-architecture-review.md`（該当時）
- `docs/tasks/<task-slug>/claude-accessibility-review.md`（該当時）
- `docs/tasks/<task-slug>/claude-performance-review.md`（該当時）

## 制約

- **production ファイルを編集しない**
- コマンド出力の根拠なしに、実装の完了報告を信用しない
- スタイルの好みを不具合として扱わない
- タスク範囲を超えた再設計を提案しない
- ブロッキングとする指摘には、深刻度・ファイルと行・発生条件・影響・修正案を必ず付ける
- 指摘が無い場合は、その旨と実施したチェック内容を書く
