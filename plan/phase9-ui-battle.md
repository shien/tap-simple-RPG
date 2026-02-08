# フェーズ9: UI — 戦闘画面

## 目的
戦闘画面のUIを実装する。タップ攻撃・敵自動攻撃・属性相性表示・勝敗結果画面。

## 依存
- フェーズ6（戦闘 — playerAttack, enemyAttack, checkBattleResult, processBattleRewards）
- フェーズ7（ゲームフロー — handleBattleVictory, handleDeath）
- フェーズ8（探索画面 — useGameState, page.tsx）
- 属性（element.ts — getElementAdvantage, getElementMultiplier）

## 実装ファイル

### 新規コンポーネント
- `src/components/ElementBadge.tsx` — 属性バッジ（火/氷/雷 + 色）
- `src/components/HpBar.tsx` — 汎用HPバー
- `src/components/BattleView.tsx` — 戦闘画面（敵情報 + 相性 + 攻撃ボタン + 敵自動攻撃）
- `src/components/BattleResultView.tsx` — 勝利報酬 / 敗北結果画面

### 変更ファイル
- `src/hooks/useGameState.ts` — attack(), endBattle() 追加
- `src/app/page.tsx` — プレースホルダ → BattleView 統合

## コンポーネント設計

### ElementBadge
Props: `{ element: Element }`
- fire → 「火」赤背景 / ice → 「氷」青背景 / thunder → 「雷」黄背景

### HpBar
Props: `{ current: bigint; max: bigint; label?: string; colorClass?: string }`
- 汎用HPバー（プレイヤー・敵共用）
- 割合 + 数値表示

### BattleView
Props: `{ battleState, gameState, onAttack, onEndBattle }`
- 敵情報: 名前 + 属性 + HPバー + 異常個体表示
- 相性: 武器属性 vs 敵属性 → 有利/不利/同属性 + 倍率
- プレイヤーHP
- 攻撃ボタン（大きくタップしやすい）
- 敵自動攻撃: useEffect + setInterval（1.5秒間隔）
- 戦闘終了後: BattleResultView 表示

### BattleResultView
Props: `{ battleState, onContinue }`
- 勝利: EXP/Gold表示 → 「続ける」ボタン
- 敗北: 「力尽きた...」→ 「最初から」ボタン
- 異常個体勝利: EXP×100 特別表示

### useGameState 追加メソッド
```ts
attack(): void     // playerAttack → checkBattleResult → 報酬処理
endBattle(): void  // handleBattleVictory or handleDeath
```

## 敵自動攻撃
- setInterval 1500ms
- result="ongoing" の間のみ攻撃
- enemyAttack → checkBattleResult
- 戦闘終了時に clearInterval

## 相性表示
| 相性 | 表示 | 色 |
|------|------|-----|
| advantage | 有利! ×2 | 緑 |
| disadvantage | 不利... ×0.1 | 赤 |
| neutral | 同属性 ×1 | 灰 |

## 異常個体表示
- 名前の隣に「異常個体」バッジ（赤太字）
- 撃破時: EXP×100 表示

## 完了条件
- 戦闘画面が表示される
- 攻撃タップで敵HPが減少する
- 敵の自動攻撃でプレイヤーHPが減少する
- 属性相性が正しく表示される
- 異常個体の特別表示が出る
- 勝利/敗北結果画面が表示される
- 結果画面から探索/リスタートに遷移する
- `pnpm run build` 成功
