# フェーズ3: 属性・武器・ダメージ計算

## 目的
属性相性判定、ダメージ計算、武器ドロップ生成を実装する。

## 依存
- フェーズ1（型定義・定数 — ELEMENT_ADVANTAGE_MAP, DAMAGE_MULTIPLIER, AREAS）

## 実装ファイル
- `src/lib/element.ts` — 属性相性判定
- `src/lib/damage.ts` — ダメージ計算
- `src/lib/weapon.ts` — 武器生成
- `src/lib/element.test.ts` — 属性テスト
- `src/lib/damage.test.ts` — ダメージテスト
- `src/lib/weapon.test.ts` — 武器テスト

## 関数設計

### element.ts

#### getElementAdvantage(attacker: Element, defender: Element): ElementAdvantage
ELEMENT_ADVANTAGE_MAP を参照して相性を返す。
- fire vs ice → "advantage"
- fire vs thunder → "disadvantage"
- fire vs fire → "neutral"

#### getElementMultiplier(attacker: Element, defender: Element): number
相性からDAMAGE_MULTIPLIERを引いて倍率を返す。
- advantage → 2
- disadvantage → 0.1
- neutral → 1

### damage.ts

#### calculatePlayerDamage(player: Player, enemy: Enemy): bigint
プレイヤー→敵へのダメージを計算する。
- baseDamage = player.atk + player.weapon.attackBonus
- multiplier = getElementMultiplier(player.weapon.element, enemy.element)
- damage = bigint(baseDamage * multiplier)
- 最低1ダメージ保証

bigintとnumber（倍率）の混合計算:
- multiplier が 2 → baseDamage * 2n
- multiplier が 0.1 → baseDamage / 10n（切り捨て、最低1n）
- multiplier が 1 → baseDamage

### weapon.ts

#### generateWeaponDrop(areaId: AreaId): Weapon
敵撃破時にドロップする武器を生成する。
- name: エリアに応じた武器名テーブルから選択
- element: ランダム（fire/ice/thunder 均等）
- attackBonus: `BigInt(Math.floor(areaConfig.rewardMultiplier * 5 * (0.8 + Math.random() * 0.4)))`
  - エリアのrewardMultiplierに比例
  - ±20%のランダム幅

武器名テーブル:
| エリア | 武器名候補 |
|--------|-----------|
| 1 草原 | 木の剣, 石の斧 |
| 2 山間部 | 鉄の剣, 戦斧 |
| 3 洞窟 | 鋼の剣, つるはし |
| 4 呪われた森 | 呪剣, 妖刀 |
| 5 亡者の湿地 | 怨嗟の刃, 骸骨の杖 |
| 6 黒曜の火山 | 溶岩の剣, 炎の槍 |
| 7 魔界の門前 | 魔剣, 闇の大鎌 |
| 8 魔王城 | 聖剣, 伝説の杖 |

## テスト計画

### element.test.ts
- 火→氷: advantage
- 氷→雷: advantage
- 雷→火: advantage
- 火→雷: disadvantage
- 氷→火: disadvantage
- 雷→氷: disadvantage
- 同属性3パターン: neutral
- 有利倍率 = 2
- 不利倍率 = 0.1
- 同属性倍率 = 1

### damage.test.ts
- 同属性: ATK=100n, bonus=50n → damage=150n
- 有利: ATK=100n, bonus=50n → damage=300n
- 不利: ATK=100n, bonus=50n → damage=15n (150/10)
- 不利で極小: ATK=5n, bonus=0n → damage=1n（最低保証）
- bonus=0n のとき ATK のみで計算される

### weapon.test.ts
- 生成された武器がname, element, attackBonusを持つ
- elementがfire/ice/thunderのいずれか
- attackBonusが0n以上
- エリア1よりエリア8の方がattackBonusが大きい（統計的に）
- 武器名がエリアに対応するテーブルに含まれる

## 完了条件
- 全テスト通過
- `pnpm run build` 成功
