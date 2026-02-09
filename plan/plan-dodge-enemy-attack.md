# 実装計画: 敵攻撃回避機能

## 概要

戦闘中に「回避」ボタンを追加し、敵の攻撃を回避できる仕組みを導入する。
プレイヤーは敵の攻撃タイミングを予測して回避ボタンを事前に押すことで、次の敵攻撃のダメージを無効化できる。
回避はいつでも使用可能で、使用回数の制限はない。

## 仕様

### 回避の基本動作
- 戦闘中に「攻撃」ボタンに加えて「回避」ボタンを表示する
- 回避ボタンを押すと「回避準備中」状態になる
- 回避準備中に敵の攻撃が来ると、ダメージを完全に無効化する（0ダメージ）
- 回避成功後、回避準備状態がリセットされ、再度回避ボタンを押せる

### 回避準備中の制約
- 回避準備中でも攻撃ボタンは押せる（攻撃可能）
- 回避準備中は視覚的にフィードバックを表示する（ボタンの色変化、「回避準備中!」テキスト）
- 既に回避準備中の場合、回避ボタンは押せない（二重発動防止）

### 戦闘開始時
- 戦闘開始時は回避準備状態ではない（回避ボタンを押す必要がある）

### 状態遷移まとめ
```
戦闘開始
  → isDodging: false

回避ボタンを押す (isDodging=false の時のみ)
  → isDodging: true

回避成功（isDodging=true で敵攻撃を受ける）
  → isDodging: false, ダメージ無効化

回避せず被弾（isDodging=false で敵攻撃を受ける）
  → isDodging: false, ダメージ適用
```

## 変更ファイル一覧

| ファイル | 操作 | 変更内容 |
|----------|------|----------|
| `src/lib/types.ts` | 修正 | `BattleState` に `isDodging` フィールド追加 |
| `src/lib/battle.ts` | 修正 | `createBattleState`, `enemyAttack` に回避ロジック追加、`activateDodge` 関数新規追加 |
| `src/lib/battle.test.ts` | 修正 | 回避関連のテストケース追加、既存テストにフィールド追加 |
| `src/components/BattleView.tsx` | 修正 | 回避ボタンUI追加、回避状態の視覚フィードバック |
| `src/hooks/useGameState.ts` | 修正 | `dodge` アクション追加 |
| `src/app/page.tsx` | 修正 | `dodge` をBattleViewに渡す |

## 実装手順

### Step 1: 型定義の追加（`src/lib/types.ts`）

`BattleState` に回避準備フィールドを追加する。

```typescript
export type BattleState = {
  player: Player;
  enemy: Enemy;
  result: BattleResult;
  turnCount: number;
  droppedWeapon: Weapon | null;
  isDodging: boolean;  // 回避準備中か
};
```

### Step 2: 戦闘ロジックの変更（`src/lib/battle.ts`）

#### 2-1: `createBattleState` を修正

初期状態で `isDodging: false` を設定する。

```typescript
export function createBattleState(player: Player, enemy: Enemy): BattleState {
  return {
    player,
    enemy,
    result: "ongoing",
    turnCount: 0,
    droppedWeapon: null,
    isDodging: false,
  };
}
```

#### 2-2: `activateDodge` 関数を新規追加

回避ボタンが押された時に呼ぶ関数。

```typescript
/** 回避を発動する */
export function activateDodge(state: BattleState): BattleState {
  if (state.result !== "ongoing") return state;
  if (state.isDodging) return state;

  return {
    ...state,
    isDodging: true,
  };
}
```

#### 2-3: `enemyAttack` を修正

回避準備中かどうかで分岐する。

```typescript
export function enemyAttack(state: BattleState): BattleState {
  if (state.result !== "ongoing") return state;

  // 回避準備中 → ダメージ無効化
  if (state.isDodging) {
    return {
      ...state,
      isDodging: false,
    };
  }

  // 通常被弾
  const newPlayer = takeDamage(state.player, state.enemy.atk);

  return {
    ...state,
    player: newPlayer,
  };
}
```

### Step 3: テストの追加（`src/lib/battle.test.ts`）

既存の `enemyAttack` テストに加えて、回避関連のテストを追加する。（詳細はテスト方法セクション参照）

### Step 4: `useGameState` に回避アクション追加（`src/hooks/useGameState.ts`）

```typescript
/** 回避を発動 */
const dodge = useCallback(() => {
  setState((prev) => {
    if (!prev.battleState || prev.battleState.result !== "ongoing") return prev;
    return { ...prev, battleState: activateDodge(prev.battleState) };
  });
}, []);
```

`return` に `dodge` を追加する。

### Step 5: UIの変更（`src/components/BattleView.tsx`）

#### 5-1: propsに `onDodge` を追加

```typescript
export function BattleView({
  battleState,
  gameState,
  onAttack,
  onEnemyAttack,
  onDodge,         // 追加
  onChooseWeapon,
  onEndBattle,
}: {
  // ...既存props
  onDodge: () => void;  // 追加
}) {
```

#### 5-2: 回避ボタンを追加

攻撃ボタンの横に回避ボタンを配置する。

```tsx
{/* アクションボタン */}
<div className="flex gap-3">
  <button
    onClick={onAttack}
    className="flex-1 rounded-lg bg-red-600 py-5 text-xl font-bold text-white active:bg-red-700"
  >
    攻撃!
  </button>
  <button
    onClick={onDodge}
    disabled={battleState.isDodging}
    className={`flex-1 rounded-lg py-5 text-xl font-bold text-white ${
      battleState.isDodging
        ? "bg-blue-500"
        : "bg-blue-600 active:bg-blue-700"
    }`}
  >
    {battleState.isDodging ? "回避準備中!" : "回避"}
  </button>
</div>
```

### Step 6: `page.tsx` の修正

`BattleView` に `onDodge` を渡す。

```tsx
<BattleView
  battleState={battleState}
  gameState={gameState}
  onAttack={attack}
  onEnemyAttack={enemyAttack}
  onDodge={dodge}          // 追加
  onChooseWeapon={chooseWeapon}
  onEndBattle={endBattle}
/>
```

## テスト方法

### 自動テスト

**ファイル: `src/lib/battle.test.ts`**

以下のテストケースを追加する:

#### `createBattleState`
- `isDodging=false で初期化される`

#### `activateDodge`（新規 describe ブロック）
- `isDodging=false の時、isDodging=true になる`
- `既に isDodging=true の時、状態は変わらない`
- `result!='ongoing' の時、状態は変わらない`

#### `enemyAttack`（既存テストに追加）
- `isDodging=true の時、プレイヤーはダメージを受けない`
- `isDodging=true の時、回避後に isDodging=false になる`
- `isDodging=false の時、通常通りダメージを受ける`（既存テストで担保済み）

#### 回避サイクルの統合テスト（新規 describe ブロック）
- `回避 → 回避成功 → 再度回避 → 回避成功 のサイクルが正常に動作する`

### 手動テスト

- [ ] 戦闘開始時に「攻撃」と「回避」の2つのボタンが表示される
- [ ] 「回避」ボタンを押すとボタンが「回避準備中!」に変わり青くなる
- [ ] 回避準備中に敵の攻撃が来るとダメージが0になる
- [ ] 回避成功後、回避ボタンが通常状態に戻りすぐに再使用可能
- [ ] 回避準備中でも攻撃ボタンは正常に動作する
- [ ] 回避準備中に回避ボタンを連打しても問題が起きない
- [ ] 戦闘終了後の結果画面が正常に表示される

### 検証コマンド

- `pnpm vitest run` で全テストがパスすること
- `pnpm build` でビルドエラーがないこと

## 注意事項

- CLAUDE.md の設計書と既存の実装パターン（イミュータブルな状態管理、bigint使用）に従うこと
- `BattleState` 型にフィールドを追加するため、`createBattleState` 以外でBattleStateオブジェクトを直接構築しているテストコード全てに `isDodging` フィールドの追加が必要
- 既存の `enemyAttack` テストは、デフォルトが `isDodging: false` のため通常被弾パスを通り結果は変わらないが、明示的にフィールドを追加する修正が必要
- 既存テストへの影響: `battle.test.ts` 内でBattleStateリテラルを直接構築している箇所（`checkBattleResult`, `processBattleRewards` の各テスト）にも新フィールドを追加する必要がある
- 実装は行わず、計画の作成のみを行うこと
