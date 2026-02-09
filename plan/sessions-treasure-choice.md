# セッション: 宝箱リワーク（回復アイテム or 武器選択）

## 概要

宝箱の中身をゴールド＋EXPから、「回復アイテム」または「武器」の選択制に変更。
選択後に決定ボタンを押すことで確定する（誤選択防止）。

## 変更内容

### 宝箱イベントの選択制化 (game.ts)
- `processEvent()` の treasure ケース: EXP/Gold 即付与 → `treasureSelect` フェーズへ遷移
- `TREASURE_BASE_EXP`, `TREASURE_BASE_GOLD` 定数を削除
- 新関数 `processTreasureHeal()`: MaxHP の 70% を回復
- 新関数 `processTreasureWeapon()`: 指定武器を装備

### 型定義 (types.ts)
- `GameState.phase` に `"treasureSelect"` を追加

### 状態管理 (useGameState.ts)
- `CombinedState` に `treasureWeapon: Weapon | null` を追加
- `move()`: treasureSelect フェーズ検出時に `generateWeaponDrop()` で武器を生成
- 新コールバック `chooseTreasureHeal()`: 回復アイテム選択
- 新コールバック `chooseTreasureWeapon()`: 武器選択

### UI (TreasureSelectView.tsx — 新規)
- 「宝箱を発見!」画面
- プレイヤー状態（HP、武器）表示
- 回復アイテムカード: 回復量・回復後HPを表示
- 武器カード: 名前・属性・攻撃補正を表示
- 選択→決定ボタン（未選択時は無効化）の2段階UI

### page.tsx
- `treasureSelect` フェーズの描画を追加

### テスト (game.test.ts)
- 旧テスト: EXP/Gold 加算テストを削除
- 新テスト: treasure → `treasureSelect` フェーズ遷移
- 新テスト: `processTreasureHeal` (70%回復、上限、フェーズガード)
- 新テスト: `processTreasureWeapon` (武器装備、フェーズガード)

## 変更ファイル

- `src/lib/types.ts` — phase に treasureSelect 追加
- `src/lib/game.ts` — treasure ロジック全面変更
- `src/hooks/useGameState.ts` — treasureWeapon 状態、選択コールバック追加
- `src/components/TreasureSelectView.tsx` — 新規コンポーネント
- `src/app/page.tsx` — treasureSelect フェーズ描画追加
- `src/lib/game.test.ts` — treasure テスト更新

## テスト結果

全12ファイル、204テストがパス。
