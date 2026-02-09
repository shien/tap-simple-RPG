# フェーズ7: ゲーム全体フロー

## 目的
死亡リスタート・エリア遷移・クリア判定など、ゲーム全体の進行を管理する。

## 依存
- フェーズ2（プレイヤー — createInitialPlayer, heal, takeDamage, addExp, isDead）
- フェーズ4（敵生成 — generateEnemy, generateBoss）
- フェーズ5（マップ・イベント — advanceStep, advanceArea, getCurrentEvent, generateUpcomingEvents）
- フェーズ6（戦闘 — createBattleState, processBattleRewards）

## 実装ファイル
- `src/lib/game.ts` — ゲーム全体フロー
- `src/lib/game.test.ts` — テスト

## 関数設計

### game.ts

#### createNewGame(): GameState
新しいゲームを初期化する。
- createInitialPlayer() でプレイヤー生成
- currentArea = 1（草原）
- currentStep = 1
- upcomingEvents = generateUpcomingEvents(1, 1)
- phase = "exploration"

#### processEvent(state: GameState): GameState
現在マスのイベントを処理する。getCurrentEvent で種別を取得。
- **battle**: phase を "battle" に変更
- **boss**: phase を "battle" に変更
- **rest**: HP を maxHP の 30% 回復、phase は "exploration" のまま
- **treasure**: EXP と Gold をエリアのrewardMultiplierに応じて獲得
- **trap**: maxHP の 20% ダメージ。死亡したら phase = "gameover"

#### handleBattleVictory(state: GameState): GameState
戦闘勝利後の処理。
- 現在マスが boss（step=8）なら handleBossClear を呼ぶ
- 通常戦闘なら phase を "exploration" に戻す

#### handleBossClear(state: GameState): GameState
ボス撃破後の処理。
- currentArea < 8: advanceArea で次エリアへ、phase = "exploration"
- currentArea === 8: クリア → createNewGame()（最初から）

#### handleDeath(state: GameState): GameState
死亡時のリスタート処理。
- createNewGame() と同等の初期化を返す

#### isGameClear(state: GameState): boolean
魔王城（エリア8）のボス撃破判定。
- currentArea === 8 かつ currentStep === 8（STEPS_PER_AREA）

## 定数
- REST_HEAL_RATIO = 0.3 （回復量 = maxHP × 30%）
- TRAP_DAMAGE_RATIO = 0.2 （罠ダメージ = maxHP × 20%）
- TREASURE_BASE_EXP = 5n （宝箱基礎EXP）
- TREASURE_BASE_GOLD = 10n （宝箱基礎Gold）

## テスト計画

### game.test.ts
- createNewGame: 初期状態の全フィールド検証（Lv1, area=1, step=1, exploration）
- createNewGame: upcomingEvents が3件存在する
- processEvent(battle): phase が "battle" になる
- processEvent(boss): phase が "battle" になる
- processEvent(rest): HP が回復する（maxHPの30%、上限超えない）
- processEvent(treasure): EXP と Gold が増加する
- processEvent(trap): HP が減少する（maxHPの20%）
- processEvent(trap): HPが0になったら phase = "gameover"
- handleBattleVictory: 通常戦闘後 phase = "exploration"
- handleBattleVictory: ボス（step=8）後に次エリアへ遷移
- handleBattleVictory: エリア8ボス撃破でリスタート（クリア）
- handleDeath: 全進行リセット（Lv1, area=1, step=1）
- isGameClear: エリア8 step=8 で true
- isGameClear: エリア8 以外で false
- イミュータブル: 元の state が変更されない

## 完了条件
- 全テスト通過
- `pnpm run build` 成功
