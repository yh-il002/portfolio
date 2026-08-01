---
name: graph-feature-workflow
description: Codex を主実装、Claude Code を独立レビューとして、タスクをグラフとして実行する。Runs a task as a graph with Codex as implementer and Claude Code as independent reviewer.
---

# Graph Feature Workflow

## いつ使うか

- 機能追加
- 挙動の変更
- 影響範囲が自明でないバグ修正
- リファクタリング
- UI のアクセシビリティやパフォーマンスに影響する変更

単一ファイルの typo 修正など、影響範囲と期待結果が明白な変更には使わない。

## 作業ディレクトリ

`docs/tasks/<task-slug>/` を作り、次のファイルを置く。

- `requirements.md`
- `research.md`
- `claude-research.md`（任意・Node 2B を実行した場合）
- `plan.md`
- `verification.md`
- `claude-review.md`
- `claude-architecture-review.md`（該当時）
- `claude-accessibility-review.md`（該当時）
- `claude-performance-review.md`（該当時）
- `resolution.md`
- `claude-regression-review.md`（Node 8 を実行した場合）

`<task-slug>` はタスク内容を表す英小文字 kebab-case にする。

## Node 1: 要件

**入力**: ユーザーの依頼
**出力**: `requirements.md`
**終了条件**: 受け入れ基準が検証可能な形で書かれている

次を含める。

- 目的
- スコープ
- スコープ外
- 受け入れ基準（それぞれ検証方法を伴うこと）
- 該当する場合の UI 状態（loading / empty / error / disabled）
- 検証方法
- 未解決の疑問

このノードでプロダクションコードを変更しない。受け入れ基準が検証可能にならない場合は、ユーザーに確認してから次へ進む。

## Node 2: 調査

**入力**: `requirements.md`
**出力**: `research.md`
**終了条件**: 関連ファイル、再利用対象、影響範囲、リスクが特定されている

`codebase-explorer` サブエージェント（`.codex/agents/codebase-explorer.toml`）へ委譲する。
結果を `research.md` に保存する。

サブエージェントを呼ぶときは `codex exec --sandbox read-only` で実行し、production ファイルを編集させない。
このノードでプロダクションコードを変更しない。

## Node 2B: Claude Code による独立調査（任意）

次のいずれかに当てはまるときだけ実行する。

- 既存設計への適合判断が難しい
- 複数画面や共有コンポーネントへ影響する
- 状態管理・認証・データ取得に触れる
- Node 2 の調査に不確実性が残っている

**入力**: `requirements.md`
**出力**: `claude-research.md`
**終了条件**: 主調査と独立調査の食い違いが解消されている

```bash
REPO="$(git rev-parse --show-toplevel)"
TASK="docs/tasks/<task-slug>"

claude -p \
  --permission-mode acceptEdits \
  --disallowed-tools "Edit Write NotebookEdit" \
  "$TASK/requirements.md を読み、このタスクに関係する既存コードを独立に調査してください。関連ファイル、再利用できる実装、データフロー、既存テスト、影響範囲、リスクを、ファイルパスとシンボル名を伴う根拠付きで報告してください。ファイルは編集しないでください。" \
  > "$TASK/claude-research.md"
```

両方の調査結果を突き合わせ、食い違いを Node 3 の前に解消する。

## Node 3: 計画

**入力**: `requirements.md`, `research.md`（該当時 `claude-research.md`）
**出力**: `plan.md`
**終了条件**: 各ステップに検証方法があり、ユーザーの承認を得ている

各ステップに次を含める。

- 変更するファイル
- 変更内容
- 依存関係（先行するステップ）
- 検証方法
- 元に戻す方法

計画は最小限にする。無関係な整理を含めない。

## Node 4: 実装

**入力**: `requirements.md`, `research.md`, `plan.md`
**出力**: production ファイルの差分
**終了条件**: 計画の全ステップが実装されている

`implementer` サブエージェント（`.codex/agents/implementer.toml`）へ委譲する。
編集権限を持つのはこのエージェントだけ。

## Node 5: 決定的検証

**入力**: production ファイルの差分
**出力**: `verification.md`
**終了条件**: 必須チェックがすべて通る、または外部要因のブロッカーが記録されている

`AGENTS.md` に設定されている範囲で、次の順に実行する。

1. フォーマットチェック（Not configured）
2. Lint（Not configured）
3. Typecheck（独立コマンドは Not configured。`npm run build` に含まれる）
4. 変更箇所に対応する単体テスト: `npm run test:run`
5. 関連する結合テスト（Not configured）
6. ビルド: `npm run build`
7. ユーザー可視の挙動が変わる場合は E2E（Not configured）

実行したコマンド、終了コード、結果を `verification.md` に記録する。終了コードを確認せずに次へ進まない。
必須チェックが失敗したら Node 4 へ戻る。

## Node 6: Claude Code レビューハンドオフ

**入力**: `docs/tasks/<task-slug>/` の成果物と `git diff`
**出力**: `claude-review.md`、該当する専門レビュー成果物
**終了条件**: Claude Code のレビューが完了し、結果がファイルに保存されている

Claude Code にはタスク成果物ディレクトリと `git diff` だけを渡す。リポジトリ全体の不要な情報を渡さない。

```bash
REPO="$(git rev-parse --show-toplevel)"
TASK="docs/tasks/<task-slug>"

claude -p \
  --permission-mode acceptEdits \
  --disallowed-tools "Edit Write NotebookEdit" \
  "graph-secondary-review スキルに従ってレビューしてください。入力は $TASK/requirements.md、$TASK/plan.md、$TASK/verification.md と現在の git diff です。independent-reviewer の観点で、要件違反・実行時の不具合・状態とデータフローの誤り・回帰・テスト不足を、深刻度とファイル行と再現条件と修正案を伴って報告してください。" \
  > "$TASK/claude-review.md"
```

横断的・構造的な変更のときは、設計整合性レビューを依頼する。

```bash
claude -p \
  --permission-mode acceptEdits \
  --disallowed-tools "Edit Write NotebookEdit" \
  "graph-secondary-review スキルの architecture-reviewer の観点で、$TASK/plan.md と git diff を読み、既存のモジュール境界・状態の所有者・公開 API 互換性・不要な結合・計画を超えたスコープ拡大を確認してください。広範な再設計は提案しないでください。" \
  > "$TASK/claude-architecture-review.md"
```

UI の変更を含むときは、アクセシビリティとパフォーマンスのレビューを依頼する。これらは相互に依存しないため並列実行してよい。

```bash
claude -p \
  --permission-mode acceptEdits \
  --disallowed-tools "Edit Write NotebookEdit" \
  "graph-secondary-review スキルの accessibility-reviewer の観点で、$TASK/plan.md と git diff を読み、セマンティック HTML、キーボード操作、フォーカス、ARIA、状態変化を確認してください。ファイルは編集しないでください。" \
  > "$TASK/claude-accessibility-review.md"

claude -p \
  --permission-mode acceptEdits \
  --disallowed-tools "Edit Write NotebookEdit" \
  "graph-secondary-review スキルの performance-reviewer の観点で、$TASK/plan.md と git diff を読み、不要な再レンダリング、同期処理、バンドルサイズ、計算量を確認してください。計測できない推測は指摘しないでください。ファイルは編集しないでください。" \
  > "$TASK/claude-performance-review.md"
```

## Node 7: 指摘の採否判断

**入力**: `claude-review.md` と該当する専門レビュー成果物
**出力**: `resolution.md` と、Accepted 指摘に対する修正差分
**終了条件**: すべての指摘に Accepted / Rejected / Deferred の判断と根拠が付いている

Claude Code の指摘を無条件に適用しない。要件と実際のコードに照らして判断する。

| 判断と深刻度 | 行き先 |
|---|---|
| Accepted かつ Critical / High | Node 4 |
| Accepted かつ Medium（受け入れ基準に関わる） | Node 4 |
| Accepted かつ Medium（それ以外） | 人間の判断 |
| Accepted かつ Low | 記録のみ |
| Rejected / Deferred | `resolution.md` に根拠を記録 |

## Node 8: 再検証と最終回帰レビュー

**入力**: `resolution.md` と Accepted 指摘への修正差分
**出力**: `verification.md` の追記、`claude-regression-review.md`
**終了条件**: 修正後の必須チェックと、修正による新規回帰の確認が完了している

修正した場合のみ実行する。

1. Node 5 の必須チェックを再実行し、`verification.md` へ追記する
2. Claude Code へ、未解決のリスクと修正によって新たに入った回帰だけをレビューさせる

```bash
claude -p \
  --permission-mode acceptEdits \
  --disallowed-tools "Edit Write NotebookEdit" \
  "$TASK/resolution.md に記録された修正の差分だけを対象に、修正によって新たに入った回帰と、未解決のまま残っているリスクを報告してください。すでに Rejected と判断された指摘を蒸し返さないでください。" \
  > "$TASK/claude-regression-review.md"
```

初回レビューと同じ範囲を再度レビューさせない。

## Node 9: 人間確認

**入力**: すべての成果物、最終差分、検証結果、レビュー判断
**出力**: 人間の承認
**終了条件**: 人間が要件・差分・検証・レビュー対応を確認する

次を提示する。

- 要件の要約
- 変更したファイル
- 検証結果（コマンドと終了コード）
- レビュー指摘と、その対応
- Claude Code の指摘と、その採否判断（`resolution.md` の要約）
- Rejected とした指摘とその根拠
- 既知の制約

明示的な指示がない限り、commit / merge / push しない。

## 並列化

並列化してよい:

- コードベース調査と既存テスト調査
- 一般レビューと専門レビュー
- 相互に依存しないコンポーネントの調査

並列化しない:

- 同じファイルへの実装
- DOM 構造と密接に依存する CSS 変更
- 共有状態の同時変更
- 実装と、その実装の自己レビュー

## ツール間の制約

- Codex が主実装、Claude Code が副レビューを担う。
- Claude Code は production ファイルを編集しない。
- ハンドオフは成果物ディレクトリのファイルと `git diff` だけで行う。
- レビュー指摘を根拠確認なしで採用しない。
- 人間の承認前に commit / merge / push しない。
