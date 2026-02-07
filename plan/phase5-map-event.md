# フェーズ5: マップ・イベント進行

## 目的
マップ移動とイベント発生の仕組みを実装する。

## 依存
- フェーズ1（型定義・エリアデータ — EVENT_PROBABILITY_TABLE, AREAS）

## 実装ファイル
- `src/lib/event.ts` — イベント生成
- `src/lib/map.ts` — マップ進行
- `src/lib/event.test.ts`
- `src/lib/map.test.ts`

## 関数設計

### event.ts

#### rollEvent(areaId: AreaId, step: number): EventType
エリアの確率テーブルに従ってイベントを決定する。
- step === 6 → 必ず `"boss"`
- step 1〜5 → EVENT_PROBABILITY_TABLE[areaId] で確率抽選
  - battle / rest / treasure / trap

#### generateUpcomingEvents(areaId: AreaId, currentStep: number): EventType[]
次の最大3マス分のイベントを先読み生成する。
- currentStep+1 ~ min(currentStep+3, 6) の分を生成
- 6マス目が含まれる場合は `"boss"` が入る
- すでに6マス目にいる場合は空配列

### map.ts

#### advanceStep(state: GameState): GameState
1マス進む（イミュータブル）。
- currentStep += 1
- upcomingEvents を再生成（新しい currentStep から先読み）
- step が 6 を超えたら呼ばない（ボス戦後は advanceArea を使う）

#### advanceArea(state: GameState): GameState
ボス撃破後、次のエリアへ移動する（イミュータブル）。
- currentArea += 1（AreaId の範囲内）
- currentStep = 1 にリセット
- upcomingEvents を新エリアで再生成
- エリア8クリア時 → currentArea = 1, currentStep = 1（最初から）

#### getCurrentEvent(state: GameState): EventType
現在マスのイベントを返す。
- step === 6 なら "boss"
- それ以外は upcomingEvents[0]（先頭が現在のイベント）

## テスト計画

### event.test.ts
- step=6 で必ず "boss" が返る（全8エリア）
- step=1〜5 で battle/rest/treasure/trap のいずれかが返る
- 確率テーブルに従う（battleが最も多い）— 統計的テスト 200回
- generateUpcomingEvents: step=1 で 3つ返る
- generateUpcomingEvents: step=4 で 2つ返る（step5,6）、最後が boss
- generateUpcomingEvents: step=5 で 1つ返る（boss）
- generateUpcomingEvents: step=6 で 空配列

### map.test.ts
- advanceStep: currentStep が +1 される
- advanceStep: upcomingEvents が再生成される
- advanceArea: currentArea +1, currentStep=1
- advanceArea: upcomingEvents が新エリアで再生成
- advanceArea: エリア8 → エリア1 に戻る
- getCurrentEvent: step=6 で "boss"

## 完了条件
- 全テスト通過
- `pnpm run build` 成功
