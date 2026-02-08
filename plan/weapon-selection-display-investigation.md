# 武器選択画面が表示されない — 調査結果

## 結論

武器選択画面は **まだ実装されていない**。設計書（`plan/weapon-choice-event-element.md`）は存在するが、コードへの反映が一切行われていない。

---

## 現状の動作

戦闘に勝利すると、武器は **自動的に上書き装備** される。プレイヤーに選択の余地はない。

### 処理の流れ

1. プレイヤーが攻撃タップ → `playerAttack()` → `checkBattleResult()`
2. 敵HP 0 → `result: "victory"` に遷移
3. `processBattleRewards()` が呼ばれる（`useGameState.ts:67`）
4. **ここで `player.weapon = generateWeaponDrop(areaId)` により即装備**（`battle.ts:73`）
5. `BattleResultView` が表示される → EXPとGoldのみ表示、武器情報なし
6. 「続ける」タップ → `endBattle()` → 探索画面に戻る

### 該当コード

```
// battle.ts:70-74（現在の実装）
player = {
  ...player,
  gold: player.gold + state.enemy.goldReward,
  weapon: generateWeaponDrop(areaId),  // ← 即装備。選択UIなし
};
```

---

## 設計書との差分

`plan/weapon-choice-event-element.md` には以下の変更が計画されている。いずれも **未実装** である。

| 変更箇所 | 設計書の計画 | 現状 |
|----------|-------------|------|
| `types.ts` — `BattleState` | `droppedWeapon: Weapon \| null` を追加 | **未追加** — `BattleState` に `droppedWeapon` フィールドなし |
| `battle.ts` — `processBattleRewards` | 武器を `droppedWeapon` に保持し、プレイヤー武器は変えない | **未変更** — `player.weapon` に即装備 |
| `useGameState.ts` | `chooseWeapon(weapon: Weapon)` を追加 | **未追加** — `chooseWeapon` 関数なし |
| `BattleResultView.tsx` | 手持ち vs ドロップの比較UI・選択ボタン | **未追加** — EXP/Gold表示のみ |
| `battle.test.ts` | `droppedWeapon` 生成テスト追加 | **未追加** |

---

## 未実装箇所の詳細

### 1. `types.ts` — BattleState に droppedWeapon がない

```typescript
// 現在（types.ts:81-86）
export type BattleState = {
  player: Player;
  enemy: Enemy;
  result: BattleResult;
  turnCount: number;
  // droppedWeapon がない
};
```

設計では `droppedWeapon: Weapon | null` を追加する予定。

### 2. `battle.ts` — processBattleRewards が即装備している

```typescript
// 現在（battle.ts:70-74）
player = {
  ...player,
  gold: player.gold + state.enemy.goldReward,
  weapon: generateWeaponDrop(areaId),  // 即装備
};
```

設計では武器を `droppedWeapon` に保持し、プレイヤーの武器は変更しない予定。

### 3. `BattleResultView.tsx` — 武器選択UIがない

現在の勝利画面（`BattleResultView.tsx:18-41`）は以下のみ表示:
- 「勝利!」テキスト
- 敵名
- 異常個体ボーナス（該当時）
- EXP / Gold 報酬
- 「続ける」ボタン

武器の比較表示・選択ボタンが存在しない。

### 4. `useGameState.ts` — chooseWeapon 関数がない

現在のhookが公開する関数:
- `move` / `attack` / `enemyAttack` / `endBattle` / `restart`

`chooseWeapon` は未実装。

---

## 実装に必要な作業

`plan/weapon-choice-event-element.md` の「機能A: 武器選択」セクションに記載の手順に従い、以下を実装する必要がある:

1. **`types.ts`**: `BattleState` に `droppedWeapon: Weapon | null` を追加
2. **`battle.ts`**: `processBattleRewards` を変更 — 武器を `droppedWeapon` に保持、プレイヤー武器は変更しない
3. **`useGameState.ts`**: `chooseWeapon(weapon: Weapon)` 関数を追加、`endBattle` を修正
4. **`BattleResultView.tsx`**: 手持ち武器 vs ドロップ武器の比較UI・選択ボタンを追加
5. **テスト更新**: `battle.test.ts` で `droppedWeapon` の生成・プレイヤー武器未変更を検証
6. **ビルド確認**: `pnpm run build` 成功を確認
