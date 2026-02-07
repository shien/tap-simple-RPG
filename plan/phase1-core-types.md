# フェーズ1: コアデータ型

## 目的
ゲーム全体で使う型定義・定数・エリアデータを定義する。

## 実装ファイル
- `src/lib/types.ts` — 全型定義
- `src/lib/constants.ts` — 定数・エリアデータ

## 型定義

### Element（属性）
```ts
type Element = "fire" | "ice" | "thunder"
```

### Weapon（武器）
```ts
type Weapon = {
  name: string
  element: Element
  attackBonus: bigint
}
```

### Player（プレイヤー）
```ts
type Player = {
  level: number
  exp: bigint
  hp: bigint
  maxHp: bigint
  atk: bigint
  gold: bigint
  weapon: Weapon
}
```

### Enemy（敵）
```ts
type Enemy = {
  name: string
  element: Element
  hp: bigint
  maxHp: bigint
  atk: bigint
  expReward: bigint
  goldReward: bigint
  isAbnormal: boolean
  abnormalTier: number | null
}
```

### EventType（イベント種別）
```ts
type EventType = "battle" | "rest" | "treasure" | "trap" | "boss"
```

### AreaId（エリアID）
```ts
type AreaId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
```

### AreaConfig（エリア設定）
```ts
type AreaConfig = {
  id: AreaId
  name: string
  enemyLevelOffset: number
  enemyHpMultiplier: number
  enemyAtkMultiplier: number
  rewardMultiplier: number
  elementDistribution: Record<Element, number>
  abnormalRate: number
  bossMultiplier: number
  individualVariation: { min: number; max: number }
}
```

### GameState（ゲーム状態）
```ts
type GameState = {
  player: Player
  currentArea: AreaId
  currentStep: number  // 1〜6
  upcomingEvents: EventType[]
  phase: "exploration" | "battle" | "event" | "gameover"
}
```

## 定数
- 8エリア分の `AreaConfig` データ
- 異常個体の倍率Tier: `[8, 20, 60, 150]`
- 属性相性マップ

## テスト
- 全エリアデータが8つ存在すること
- 各エリアの必須フィールドが正しく定義されていること
- 属性相性マップが正しいこと（火＞氷＞雷＞火）

## 完了条件
- 型定義がコンパイルを通る
- 定数データのテストが全て通る
