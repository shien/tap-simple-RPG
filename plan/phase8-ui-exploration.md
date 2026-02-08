# フェーズ8: UI — 探索画面

## 目的
探索画面のUIを実装する。モバイルファースト縦画面レイアウト。

## 依存
- フェーズ7（ゲーム全体フロー — createNewGame, processEvent, handleDeath）
- フェーズ5（マップ — advanceStep）
- フェーズ6（戦闘 — createBattleState）
- フェーズ4（敵生成 — generateEnemy, generateBoss）
- 定数（AREAS）

## 実装ファイル

### カスタムフック
- `src/hooks/useGameState.ts` — ゲーム状態管理フック

### コンポーネント
- `src/components/PlayerStatus.tsx` — プレイヤーステータス表示
- `src/components/AreaInfo.tsx` — エリア名 + マス進行表示
- `src/components/EventPreview.tsx` — 次3イベントプレビュー
- `src/components/ExplorationView.tsx` — 探索画面（統合）
- `src/components/EventResultMessage.tsx` — イベント結果メッセージ表示
- `src/components/GameOverView.tsx` — ゲームオーバー画面

### ページ
- `src/app/page.tsx` — メインページ（書き換え）

## コンポーネント設計

### useGameState
```ts
{
  gameState: GameState;
  battleState: BattleState | null;
  message: string | null;
  move(): void;        // 1マス進む → processEvent → phase分岐
  restart(): void;     // リスタート
}
```
- move: advanceStep → processEvent → battle/rest/treasure/trap/boss 処理
  - battle/boss: generateEnemy/generateBoss + createBattleState → phase="battle"
  - rest: HP回復メッセージ表示
  - treasure: EXP/Gold獲得メッセージ表示
  - trap: ダメージメッセージ表示（死亡時 gameover）

### PlayerStatus
Props: `{ player: Player }`
- Level / HP / MaxHP / ATK / Gold
- 武器名 + 属性アイコン
- HPバー（現在HP / MaxHP の割合）

### AreaInfo
Props: `{ areaId: AreaId; currentStep: number }`
- エリア名表示
- マス進行（1〜6 の丸表示、現在位置ハイライト）

### EventPreview
Props: `{ events: EventType[] }`
- 各イベントをラベル + 色で表示
- battle=赤, rest=緑, treasure=黄, trap=紫, boss=赤太字

### EventResultMessage
Props: `{ message: string | null }`
- rest/treasure/trap の結果を表示

### ExplorationView
Props: `{ gameState, message, onMove }`
- AreaInfo + EventPreview + PlayerStatus + EventResultMessage + 「進む」ボタン

### GameOverView
Props: `{ onRestart }`
- ゲームオーバーメッセージ + 「最初から」ボタン

## 表示要素（設計書準拠）
- 現在エリア名
- 現在マス（1〜6）の進行表示
- 次3イベントのラベル
- プレイヤーHP / ATK / Level / Gold
- 武器情報（名前・属性）
- 「進む」ボタン（Moveタップ）

## 属性表示
- fire → 「火」赤
- ice → 「氷」青
- thunder → 「雷」黄

## 実装方針
- モバイルファースト（max-w-md, 縦レイアウト）
- Tailwind CSS v4 でスタイリング
- "use client" でクライアントコンポーネント
- ゲーム状態は useGameState フック内の useState で管理
- phase が "battle" の場合は「戦闘中...」表示（Phase9で本実装）
- bigint は表示時に `.toString()` で文字列化

## 完了条件
- 探索画面が表示される
- 「進む」タップでマスが進む
- イベント結果（rest/treasure/trap）がメッセージ表示される
- battle/boss で phase が "battle" に変わる
- HP0で gameover 画面 → リスタート可能
- `pnpm run build` 成功
