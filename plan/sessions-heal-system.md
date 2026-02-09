# セッション: 休息イベント削除 + 戦闘準備画面に回復メニュー追加

## 概要

休息イベントを廃止し、戦闘前の「戦闘準備」画面でプレイヤーが任意に回復できるシステムに変更した。回復は回数制限付きの戦略リソースとなり、ボス撃破で補充される。

## 変更内容

### 新機能: 戦闘準備画面 (battlePrep)
- 戦闘/ボス遭遇時に「戦闘準備」画面を挟む新フェーズを追加
- 敵情報（名前・属性・異常個体）、属性相性、プレイヤーHP を表示
- 回復ボタン（HP 70%回復、残回数表示、0回で無効化）
- 「戦闘開始!」ボタンで実際の戦闘へ遷移

### 回復システム仕様
- 初期回数: 3回
- 回復量: 最大HPの70%（上限はmaxHP）
- ボス撃破: 回復回数 +1
- 死亡/ゲームクリア: 回復回数 3 にリセット

### 休息イベント削除
- `EventType` から `"rest"` を削除
- イベント確率テーブルから rest を削除、その確率を battle に全加算
- 確率テーブル: エリア1-4 → battle 80% / treasure 20%、エリア5-8 → battle 85% / treasure 15%

## 変更ファイル

### 型・定数
- `src/lib/types.ts` — `EventType` から "rest" 削除、`GameState` に `healCount` と `"battlePrep"` フェーズ追加
- `src/lib/constants.ts` — `EVENT_PROBABILITY_TABLE` 変更、`INITIAL_HEAL_COUNT`・`BATTLE_PREP_HEAL_RATIO` 追加

### ロジック
- `src/lib/event.ts` — `rollEvent()` から rest 分岐削除
- `src/lib/game.ts` — rest 処理削除、`healInPrep()`・`startBattle()` 追加、`handleBossClear()` で healCount+1、`createNewGame()` に healCount 初期値
- `src/hooks/useGameState.ts` — `heal()`・`confirmBattle()` コールバック追加、`move()` で battlePrep フェーズ対応

### UI
- `src/components/BattlePrepView.tsx` — 新規作成（戦闘準備画面）
- `src/components/EventPreview.tsx` — rest バッジ削除
- `src/components/ExplorationView.tsx` — 回復残回数表示を追加
- `src/app/page.tsx` — battlePrep フェーズの描画追加

### テスト
- `src/lib/game.test.ts` — rest テスト削除、`healInPrep`・`startBattle` テスト追加、healCount 検証追加
- `src/lib/event.test.ts` — rest 参照を全削除、フィクスチャ更新
- `src/lib/constants.test.ts` — 確率テーブルテスト更新
- `src/lib/map.test.ts` — フィクスチャ更新、healCount 追加

## テスト結果

全12ファイル、194テストがパス。
