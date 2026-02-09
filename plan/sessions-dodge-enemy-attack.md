# セッション: 敵攻撃回避機能

## 概要

戦闘中に「回避」ボタンを追加し、敵の攻撃前に押すことでダメージを無効化できる機能を実装。
回避は使用回数制限なくいつでも使用可能。

## 変更内容

### 型定義 (types.ts)
- `BattleState` に `isDodging: boolean` フィールドを追加

### 戦闘ロジック (battle.ts)
- `createBattleState()`: `isDodging: false` で初期化
- `activateDodge()`: 新規関数。回避ボタン押下時に `isDodging: true` に変更
- `enemyAttack()`: `isDodging=true` の場合ダメージ無効化し `isDodging: false` にリセット

### 状態管理 (useGameState.ts)
- `activateDodge` をインポート
- 新コールバック `dodge()`: `activateDodge` を呼び出す

### UI (BattleView.tsx)
- `onDodge` props を追加
- 攻撃ボタンの横に回避ボタンを配置（flexレイアウト）
- 回避準備中: 青色ボタン + 「回避準備中!」テキスト
- 通常時: 「回避」テキスト
- 回避準備中は disabled で二重発動防止

### page.tsx
- `dodge` を `BattleView` に `onDodge` として接続

### テスト (battle.test.ts)
- `createBattleState`: `isDodging=false` 初期化テスト追加
- `activateDodge`: 正常発動、二重発動防止、戦闘終了時ガードのテスト3件追加
- `enemyAttack`: 回避時ダメージ無効、回避後 `isDodging` リセットのテスト2件追加
- 回避サイクル統合テスト: 連続回避が正常動作するテスト1件追加
- 既存テスト全ての BattleState リテラルに `isDodging: false` を追加

## 変更ファイル

- `src/lib/types.ts` — BattleState に isDodging 追加
- `src/lib/battle.ts` — activateDodge 新規、enemyAttack に回避分岐追加
- `src/lib/battle.test.ts` — 回避テスト6件追加、既存テスト修正
- `src/hooks/useGameState.ts` — dodge コールバック追加
- `src/components/BattleView.tsx` — 回避ボタン UI 追加
- `src/app/page.tsx` — dodge 接続

## テスト結果

全12ファイル、214テストがパス。
