# 武器選択 & イベント先読み敵属性表示

## 目的
2つの機能を追加する。

### 機能A: 武器ドロップ時の選択
勝利報酬でドロップした武器を **即装備ではなく**、手持ち武器とドロップ武器を比較して好きな方を選べるようにする。

### 機能B: イベント先読みに敵属性を表示
先読みイベントが battle / boss の場合、出現する敵の属性を事前に表示する。
プレイヤーが武器選択の判断材料にできる。

## 依存
- battle.ts（processBattleRewards — 武器即装備の変更）
- event.ts / types.ts（先読みイベントに属性情報追加）
- BattleResultView（武器選択UI追加）
- EventPreview（属性バッジ追加）
- useGameState（武器選択フロー追加）

---

## 機能A: 武器選択

### 設計方針
- `processBattleRewards` を変更し、ドロップ武器をプレイヤーに即装備せず `BattleState.droppedWeapon` に保持する
- 勝利結果画面で2つの武器を比較表示し、タップで選択する
- 選択後に `endBattle` で確定する

### 変更箇所

#### types.ts
- `BattleState` に `droppedWeapon: Weapon | null` を追加

#### battle.ts — processBattleRewards
- 変更前: `weapon: generateWeaponDrop(areaId)` でプレイヤーに即装備
- 変更後: `droppedWeapon: generateWeaponDrop(areaId)` に保持し、プレイヤーの武器は変更しない

#### useGameState.ts
- `chooseWeapon(weapon: Weapon)`: 武器を選択してプレイヤーに装備
- `endBattle` を修正: 武器選択済みの状態で呼ぶ

#### BattleResultView.tsx
- 勝利時: 手持ち武器 vs ドロップ武器の比較表示
- 属性バッジ・attackBonus を並列表示
- 各武器にタップ可能な「選択」ボタン

### テスト変更

#### battle.test.ts
- processBattleRewards: `droppedWeapon` が生成されること
- processBattleRewards: プレイヤーの武器が変更されないこと（即装備しない）

---

## 機能B: イベント先読み敵属性表示

### 設計方針
- 先読みイベントの型を `EventType` から、属性情報を含むオブジェクト型に拡張する
- battle / boss イベントは敵の属性を事前決定して保持する
- rest / treasure / trap は属性なし

### 変更箇所

#### types.ts
- `UpcomingEvent` 型を新規追加:
  ```ts
  export type UpcomingEvent = {
    type: EventType;
    enemyElement?: Element;  // battle/boss のみ
  };
  ```
- `GameState.upcomingEvents` の型を `EventType[]` → `UpcomingEvent[]` に変更

#### event.ts — generateUpcomingEvents
- battle/boss イベントの場合、エリアの `elementDistribution` に従って属性を事前決定
- `UpcomingEvent[]` を返すように変更

#### map.ts — advanceStep, advanceArea
- 既に `generateUpcomingEvents` を呼んでいるので型変更のみ

#### EventPreview.tsx
- `UpcomingEvent[]` を受け取るように変更
- battle/boss の場合、ラベル横に `ElementBadge` を表示

### テスト変更

#### event.test.ts
- generateUpcomingEvents: 返り値が `UpcomingEvent[]` であること
- battle/boss イベントに `enemyElement` が含まれること
- rest/treasure/trap に `enemyElement` が含まれないこと

---

## 実装順序
1. types.ts: `UpcomingEvent` 型追加、`GameState.upcomingEvents` 型変更、`BattleState.droppedWeapon` 追加
2. event.ts: `generateUpcomingEvents` を `UpcomingEvent[]` 返却に変更
3. battle.ts: `processBattleRewards` でドロップ武器を `droppedWeapon` に保持
4. テスト更新: event.test.ts, battle.test.ts, map.test.ts, game.test.ts
5. EventPreview.tsx: 属性バッジ表示
6. BattleResultView.tsx: 武器選択UI
7. useGameState.ts: `chooseWeapon` 追加
8. ビルド確認

## 完了条件
- 全テスト通過
- `pnpm run build` 成功
- 勝利時にドロップ武器と手持ち武器を比較して選択できる
- 先読みイベントの battle/boss に敵属性が表示される
