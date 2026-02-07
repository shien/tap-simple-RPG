# フェーズ4: 敵生成

## 目的
エリアに応じた敵生成、個体差、異常個体の仕組みを実装する。
モンスター設定ファイル（`src/lib/data/monsters.ts`）を参照して名前・属性を決定する。

## 依存
- フェーズ1（型定義・エリアデータ — AREAS, ABNORMAL_TIERS）
- モンスター設定ファイル（getMonstersForArea, getBossForArea）

## 実装ファイル
- `src/lib/enemy.ts`
- `src/lib/enemy.test.ts`

## 基礎ステータス定数
敵の基礎値（Lv1相当）:
- BASE_HP = 30n
- BASE_ATK = 5n
- BASE_EXP = 8n
- BASE_GOLD = 3n

## 関数設計

### rollIndividualVariation(areaConfig: AreaConfig): number
通常個体の個体補正を算出する。
- エリアの `individualVariation.min` 〜 `max` の範囲
- 分布は弱め寄り: `min + (max - min) * random^2`

### rollAbnormal(areaConfig: AreaConfig): { isAbnormal: boolean; tier: number | null }
異常個体の判定と倍率Tier決定。
- `Math.random() < areaConfig.abnormalRate` で判定
- Tier選択: ABNORMAL_TIERS [8,20,60,150] から重み付き抽選
  - 重み: [60, 25, 10, 5]（低Tierほど出やすい）

### generateEnemy(areaId: AreaId): Enemy
エリア設定とモンスター設定に基づいて通常敵を生成する。
1. getMonstersForArea で候補取得 → name, element
2. 候補なしならエリアのelementDistributionでランダム属性
3. 個体補正 × 異常個体判定でステータス算出
- hp = BASE_HP × enemyHpMultiplier × 個体補正 × (異常tier or 1)
- atk = BASE_ATK × enemyAtkMultiplier × 個体補正 × (異常tier or 1)
- expReward = BASE_EXP × rewardMultiplier × 個体補正
- goldReward = BASE_GOLD × rewardMultiplier × 個体補正

### generateBoss(areaId: AreaId): Enemy
ボス敵を生成する。
1. getBossForArea で名前・属性取得
2. 見つからなければ「エリア名のボス」
3. ステータス = 基礎 × エリア倍率 × bossMultiplier
4. isAbnormal = false

## テスト計画
- rollIndividualVariation: min〜max範囲内（草原・魔王城）
- rollAbnormal: rate=0→常にfalse、rate=1→常にtrue、tierが正しい値
- generateEnemy: 全フィールド存在、モンスター設定の名前使用、エリア8>>エリア1
- generateBoss: 設定からの名前取得、通常敵より強い、isAbnormal=false

## 完了条件
- 全テスト通過
- `pnpm run build` 成功
