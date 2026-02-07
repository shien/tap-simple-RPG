# セッション変更履歴

## フェーズ1: コアデータ型（2026-02-07）

### ブランチ
`claude/phase1-core-types-D1kkn`

### 追加ファイル

| ファイル | 内容 |
|---------|------|
| `src/lib/types.ts` | 全型定義 |
| `src/lib/constants.ts` | 定数・エリアデータ |
| `src/lib/constants.test.ts` | 定数テスト（25件） |

### 削除ファイル
| ファイル | 理由 |
|---------|------|
| `src/lib/sample.test.ts` | 初期セットアップ用のため不要 |

### 型定義一覧（types.ts）
- `Element` — 属性（fire / ice / thunder）
- `ElementAdvantage` — 相性結果（advantage / disadvantage / neutral）
- `Weapon` — 武器（name, element, attackBonus）
- `Player` — プレイヤー（level, exp, hp, maxHp, atk, gold, weapon）
- `Enemy` — 敵（name, element, hp, maxHp, atk, expReward, goldReward, isAbnormal, abnormalTier）
- `EventType` — イベント種別（battle / rest / treasure / trap / boss）
- `AreaId` — エリアID（1〜8）
- `AreaConfig` — エリア設定（倍率、属性分布、個体差範囲など）
- `GameState` — ゲーム状態（player, currentArea, currentStep, upcomingEvents, phase）

### 定数一覧（constants.ts）
- `ELEMENT_ADVANTAGE_MAP` — 属性相性マップ（火＞氷＞雷＞火）
- `DAMAGE_MULTIPLIER` — ダメージ倍率（有利×2, 不利×0.1, 同属性×1）
- `ABNORMAL_TIERS` — 異常個体倍率Tier（×8, ×20, ×60, ×150）
- `ABNORMAL_EXP_MULTIPLIER` — 異常個体撃破時EXP倍率（100）
- `AREAS` — 8エリア分の設定データ
- `EVENT_PROBABILITY_TABLE` — エリアごとのイベント出現確率

### テスト結果
```
25 passed
```

### テスト内容
- エリアデータの件数・ID連番
- 必須フィールドの存在確認
- 属性分布合計が1
- 後半エリアほど敵HP倍率・個体差幅が増加
- 草原/魔王城の個体差・異常個体出現率が設計値と一致
- 属性相性の有利/不利/同属性が全パターン正しい
- ダメージ倍率の値
- 異常個体Tierの値
- イベント確率テーブルの合計が1

---

## フェーズ2: プレイヤーロジック（2026-02-07）

### ブランチ
`claude/phase2-player-D1kkn`

### 追加ファイル

| ファイル | 内容 |
|---------|------|
| `src/lib/player.ts` | プレイヤー関連関数 |
| `src/lib/player.test.ts` | プレイヤーテスト（27件） |

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `plan/phase2-player.md` | 詳細な関数設計・テスト計画を追記 |

### 関数一覧（player.ts）
- `createInitialPlayer()` — Lv1プレイヤー生成（HP=50, ATK=10, 属性ランダムの「棒」装備）
- `getRequiredExp(level)` — 必要EXP計算（序盤: `10*level^2`, Lv11〜: `+2^(level-10)` 指数追加）
- `levelUp(player)` — 1回レベルアップ（イミュータブル、段階的成長量）
- `addExp(player, exp)` — EXP加算＋複数回レベルアップ
- `heal(player, amount)` — HP回復（MaxHP上限）
- `takeDamage(player, damage)` — ダメージ適用（HP0下限）
- `isDead(player)` — 死亡判定

### 成長量テーブル
| レベル帯 | MaxHP成長 | ATK成長 |
|---------|-----------|---------|
| 1〜10 | +8 | +3 |
| 11〜25 | +20 | +8 |
| 26〜50 | +60 | +25 |
| 51〜 | +200 | +80 |

### テスト結果
```
52 passed (constants: 25, player: 27)
```

### テスト内容
- 初期プレイヤーの全初期値検証
- 武器「棒」の名前・属性・補正値
- EXP要求値の具体値（Lv1=10, Lv5=250, Lv10=1000, Lv11=1212）
- 後半の指数的増加の検証
- 各レベル帯での成長量（Lv1→2, Lv11→12, Lv26→27, Lv51→52）
- HPも成長量分増加することの検証
- イミュータブル性の検証
- EXP不足時のレベル据え置き
- ちょうど/大量EXPでのレベルアップ
- 余りEXPの保持
- HP回復とMaxHP上限
- ダメージとHP0下限
- isDead判定

---

## フェーズ3: 属性・武器・ダメージ計算（2026-02-07）

### ブランチ
`claude/phase3-battle-calc-D1kkn`

### 追加ファイル

| ファイル | 内容 |
|---------|------|
| `src/lib/element.ts` | 属性相性判定（2関数） |
| `src/lib/damage.ts` | ダメージ計算（1関数） |
| `src/lib/weapon.ts` | 武器ドロップ生成（1関数） |
| `src/lib/element.test.ts` | 属性テスト（12件） |
| `src/lib/damage.test.ts` | ダメージテスト（5件） |
| `src/lib/weapon.test.ts` | 武器テスト（6件） |

### 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `plan/phase3-battle-calc.md` | 詳細な関数設計・テスト計画に更新 |

### 関数一覧

#### element.ts
- `getElementAdvantage(attacker, defender)` — 属性相性判定（advantage/disadvantage/neutral）
- `getElementMultiplier(attacker, defender)` — 相性に応じた倍率（2/0.1/1）

#### damage.ts
- `calculatePlayerDamage(player, enemy)` — プレイヤー→敵ダメージ計算（bigint、最低1保証）

#### weapon.ts
- `generateWeaponDrop(areaId)` — エリアに応じた武器ドロップ生成（名前・属性・補正値）

### テスト結果
```
75 passed (constants: 25, player: 27, element: 12, damage: 5, weapon: 6)
```

### テスト内容
- 属性相性の全9パターン（有利3・不利3・同属性3）
- 倍率の正確な値（2, 0.1, 1）
- ダメージ計算（同属性・有利・不利）
- 不利時の最低1ダメージ保証
- bonus=0時のATKのみ計算
- 武器の必須フィールド存在確認
- 属性がfire/ice/thunderのいずれか
- attackBonusが0以上
- 武器名がエリア対応テーブルに含まれる
- エリア8 > エリア1のattackBonus（統計的検証）
- 全8エリアでの武器生成確認
