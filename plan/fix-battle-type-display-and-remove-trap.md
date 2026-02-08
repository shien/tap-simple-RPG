# 戦闘属性表示不一致の修正 & 罠イベント削除

## 問題1: 戦闘属性表示の不一致

### 原因

イベントプレビュー（次の3マス表示）と実際の戦闘で、敵の属性が異なる。

属性の生成が2箇所で独立して行われている:

1. **プレビュー用**: `event.ts` の `generateAreaEvents()` で `rollElement()` → `areaEvents[step].enemyElement` に保存
2. **戦闘開始時**: `useGameState.ts` の `move()` → `generateEnemy()` / `generateBoss()` で再度ランダム生成

`generateEnemy()` は `areaEvents` の `enemyElement` を参照せず、独自にモンスター候補からランダムピックまたは `rollElement()` で属性を決定する。

### 修正方針

`generateEnemy()` と `generateBoss()` に事前生成済み属性を渡すオプションを追加し、`useGameState.ts` の `move()` で `areaEvents` から属性を取得して渡す。

#### 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/lib/enemy.ts` | `generateEnemy(areaId, element?)` に `element` パラメータ追加。指定時はそれを使用 |
| `src/hooks/useGameState.ts` | `move()` で `areaEvents[currentStep-1].enemyElement` を取得し `generateEnemy` / `generateBoss` に渡す |
| `src/lib/enemy.test.ts` | 属性指定時のテスト追加 |

## 問題2: 罠イベントの削除

### 変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/lib/types.ts` | `EventType` から `"trap"` を削除 |
| `src/lib/constants.ts` | `EVENT_PROBABILITY_TABLE` から `trap` を削除し、確率を再配分 |
| `src/lib/event.ts` | `rollEvent()` のフォールバックを `"rest"` に変更 |
| `src/lib/game.ts` | `processEvent()` から `case "trap"` 削除、`TRAP_DAMAGE_RATIO` 定数削除 |
| `src/hooks/useGameState.ts` | 罠関連のメッセージ処理を削除 |
| `src/components/EventPreview.tsx` | `EVENT_CONFIG` から `trap` 削除 |
| テストファイル群 | trap に関するテストケース修正・削除 |

### 確率再配分

罠の確率を戦闘・休息・宝箱に按分する（戦闘を増やしすぎないよう注意）。

例: エリア1 `{ battle: 0.5, rest: 0.2, treasure: 0.2, trap: 0.1 }` → `{ battle: 0.55, rest: 0.25, treasure: 0.2 }`
