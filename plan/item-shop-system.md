# アイテム＆ショップシステム 実装計画

## 概要

ゴールドの用途としてショップイベントを追加し、戦闘中に使えるアイテム3種を導入する。

### アイテム一覧

| # | アイテム名 | 効果 | 使用タイミング |
|---|-----------|------|--------------|
| 1 | 武器の塗料 | 武器の属性を選択した属性に変更（戦闘終了まで一時的） | 戦闘中 |
| 2 | 古びた鋼鉄の盾 | 次の敵攻撃のダメージを完全に0にする | 戦闘中 |
| 3 | 回復の薬 | MaxHPの40%を回復 | 戦闘中 |

### ショップイベント

- 新イベントタイプ `"shop"` を追加
- 出現確率は宝箱（treasure）より低い
- 3アイテムすべてが陳列され、ゴールドで購入できる
- 価格はエリアの `rewardMultiplier` に比例してスケール

---

## 設計詳細

### 1. アイテム仕様

#### 武器の塗料
- 使用すると水/土/雷の3択UIが出る
- 選択した属性に武器の属性を**一時的に**変更（その戦闘中のみ）
- 戦闘終了後は元の属性に戻る
- 1回使用で消費

#### 古びた鋼鉄の盾
- 使用すると `perfectGuard` フラグがONになる
- 次の敵攻撃のダメージが完全に0になる（通常ガードの1/10ではなく完全0）
- ガードボタンを押す必要なし（自動で適用される）
- 敵攻撃を1回受けるとフラグ解除
- 完全防御成功後、ガードカウンターも発動する
- 1回使用で消費

#### 回復の薬
- MaxHPの40%を即座に回復
- HP上限は超えない
- 1回使用で消費

### 2. インベントリ仕様

- プレイヤーはアイテムを複数所持可能（上限なし）
- 同じアイテムを複数持てる
- 死亡時にすべてリセット（ローグライク設計）

### 3. ショップイベント仕様

#### 出現確率

| エリア | battle | treasure | shop |
|--------|--------|----------|------|
| 1〜4   | 0.80   | 0.12     | 0.08 |
| 5〜8   | 0.85   | 0.09     | 0.06 |

（宝箱から一部確率をショップに分配。宝箱より低い確率）

#### 価格スケーリング

各アイテムの価格 = ベース倍率 × エリアの `rewardMultiplier`

| アイテム | ベース倍率 | エリア1価格例 | エリア8価格例 |
|---------|-----------|-------------|-------------|
| 武器の塗料 | ×3 | 90G | 12,000,000,000G |
| 古びた鋼鉄の盾 | ×5 | 150G | 20,000,000,000G |
| 回復の薬 | ×2 | 60G | 8,000,000,000G |

（敵を3〜5体倒せば買える程度のバランス）

### 4. UI仕様

#### ショップ画面 (`ShopView`)
- エリア名 + 「ショップ」表示
- 3アイテムのリスト表示（名前・効果・価格）
- ゴールド不足のアイテムはグレーアウト
- 購入ボタンでゴールド消費＆アイテム追加
- 「立ち去る」ボタンで探索に戻る

#### 戦闘画面のアイテムボタン
- 攻撃・ガードボタンの下にアイテムスロットを表示
- 所持アイテムがあれば各アイテムのアイコン/名前と個数を表示
- タップで使用（武器の塗料は属性選択UIが出る）
- アイテム0個なら非表示

---

## 実装ステップ

### Step 1: 型定義の追加（`src/lib/types.ts`）

```typescript
// アイテム種別
export type ItemType = "elementChange" | "perfectGuard" | "heal40";

// アイテム
export type Item = {
  type: ItemType;
  name: string;
};

// ショップ商品
export type ShopItem = {
  item: Item;
  price: bigint;
};
```

変更する型:
- `Player` に `items: Item[]` を追加
- `EventType` に `"shop"` を追加
- `GameState.phase` に `"shop"` を追加
- `BattleState` に `perfectGuard: boolean` と `originalWeaponElement: Element | null` を追加

### Step 2: 定数追加（`src/lib/constants.ts`）

- `EVENT_PROBABILITY_TABLE` を `{ battle, treasure, shop }` に拡張
- `ITEM_DEFINITIONS`: 3アイテムの定義
- `ITEM_PRICE_MULTIPLIERS`: アイテムごとの価格ベース倍率
- `HEAL_ITEM_RATIO = 0.4`

### Step 3: アイテムロジック（`src/lib/item.ts` 新規作成）

- `createItem(type: ItemType): Item`
- `generateShopItems(areaId: AreaId): ShopItem[]`
- `removeItem(items: Item[], type: ItemType): Item[]` （1個消費）
- `hasItem(items: Item[], type: ItemType): boolean`

テスト: `src/lib/item.test.ts`

### Step 4: イベント生成の更新（`src/lib/event.ts`）

- `rollEvent` にショップ確率を追加
- `generateAreaEvents` でショップイベント生成を追加

テスト: `src/lib/event.test.ts` の更新

### Step 5: 戦闘ロジックの更新（`src/lib/battle.ts`）

- `createBattleState` に `perfectGuard: false` と `originalWeaponElement: null` を追加
- `useElementChangeItem(state, element): BattleState` — 属性変更アイテム使用
- `usePerfectGuardItem(state): BattleState` — 完全防御アイテム使用
- `useHealItem(state): BattleState` — 回復アイテム使用
- `enemyAttack` を更新: `perfectGuard` フラグ時はダメージ0＆ガードカウンター発動
- `processBattleRewards` 後に `originalWeaponElement` があれば武器属性を復元

テスト: `src/lib/battle.test.ts` の更新

### Step 6: ゲームロジックの更新（`src/lib/game.ts`）

- `processEvent` に `"shop"` ケース追加
- `processShopPurchase(state, itemType): GameState` — ショップ購入処理
- `processShopLeave(state): GameState` — ショップ退出
- `createInitialPlayer` の初期状態に `items: []` を追加

テスト: `src/lib/game.test.ts` の更新

### Step 7: プレイヤーの更新（`src/lib/player.ts`）

- `createInitialPlayer` に `items: []` を追加

テスト: `src/lib/player.test.ts` の更新

### Step 8: ショップUI（`src/components/ShopView.tsx` 新規作成）

- アイテム一覧と価格表示
- 購入ボタン（ゴールド足りない場合はdisabled）
- プレイヤーの所持ゴールド表示
- 「立ち去る」ボタン

### Step 9: 戦闘UIの更新（`src/components/BattleView.tsx`）

- アイテムボタンエリアを追加
- 属性変更アイテム使用時の属性選択モーダル
- 完全防御中の視覚フィードバック（シールドアイコンなど）
- 回復アイテム使用ボタン

### Step 10: useGameState更新（`src/hooks/useGameState.ts`）

- ショップ関連アクション追加: `purchaseItem`, `leaveShop`
- 戦闘中アイテム使用アクション追加: `useItem`
- `CombinedState` に `shopItems: ShopItem[] | null` 追加

### Step 11: page.tsx更新（`src/app/page.tsx`）

- `ShopView` コンポーネントの組み込み
- ショップフェーズの表示条件追加

### Step 12: 探索画面の更新（`src/components/ExplorationView.tsx`）

- プレイヤーの所持アイテム表示を追加

### Step 13: EventPreviewの更新

- ショップイベントのプレビュー表示対応（アイコンや色）

---

## ファイル変更一覧

| ファイル | 変更内容 |
|---------|---------|
| `src/lib/types.ts` | ItemType, Item, ShopItem 型追加、Player/EventType/GameState/BattleState 拡張 |
| `src/lib/constants.ts` | EVENT_PROBABILITY_TABLE 拡張、アイテム定数追加 |
| `src/lib/item.ts` | **新規** アイテム生成・管理ロジック |
| `src/lib/item.test.ts` | **新規** アイテムテスト |
| `src/lib/event.ts` | rollEvent にショップ追加 |
| `src/lib/event.test.ts` | ショップイベントテスト追加 |
| `src/lib/battle.ts` | アイテム使用関数・完全防御・属性復元 |
| `src/lib/battle.test.ts` | アイテム使用テスト追加 |
| `src/lib/game.ts` | ショップ処理関数追加 |
| `src/lib/game.test.ts` | ショップテスト追加 |
| `src/lib/player.ts` | items初期化 |
| `src/lib/player.test.ts` | items初期化テスト |
| `src/components/ShopView.tsx` | **新規** ショップUI |
| `src/components/BattleView.tsx` | アイテム使用UI追加 |
| `src/components/ExplorationView.tsx` | 所持アイテム表示 |
| `src/components/EventPreview.tsx` | ショップイベント表示対応 |
| `src/hooks/useGameState.ts` | ショップ・アイテム使用アクション追加 |
| `src/app/page.tsx` | ShopView組み込み |
