# フェーズ2: プレイヤーロジック

## 目的
プレイヤーの生成・レベルアップ・成長曲線を実装する。

## 依存
- フェーズ1（型定義）

## 実装ファイル
- `src/lib/player.ts`
- `src/lib/player.test.ts`

## 関数設計

### createInitialPlayer(): Player
初期プレイヤーを生成する。
- Level: 1
- EXP: 0n
- HP / MaxHP: 50n
- ATK: 10n
- Gold: 0n
- Weapon: 属性ランダムの「棒」（attackBonus: 0n）

### getRequiredExp(level: number): bigint
次のレベルに必要な累計EXPを返す。
- Lv1〜10（序盤）: `10 * level^2` — 二次関数的な緩やか成長
- Lv11以降（中盤〜）: `10 * level^2 + 2^(level - 10)` — 指数要素で加速
- bigintで返す

### levelUp(player: Player): Player
1回分のレベルアップを適用する（イミュータブル）。
- level += 1
- maxHp += 成長量（後述）
- hp += 同量（レベルアップ分だけ回復）
- atk += 成長量
- exp はそのまま（addExpで管理）

成長量の段階:
| レベル帯 | MaxHP成長 | ATK成長 |
|---------|-----------|---------|
| 1〜10 | +8 | +3 |
| 11〜25 | +20 | +8 |
| 26〜50 | +60 | +25 |
| 51〜 | +200 | +80 |

### addExp(player: Player, exp: bigint): Player
経験値を加算し、足りていれば繰り返しlevelUpする。
- player.exp += exp
- while (player.exp >= getRequiredExp(player.level)) { levelUp }

### heal(player: Player, amount: bigint): Player
HP回復。MaxHPを超えない。
- hp = min(hp + amount, maxHp)

### takeDamage(player: Player, damage: bigint): Player
ダメージ適用。
- hp = max(hp - damage, 0n)

### isDead(player: Player): boolean
HP ≤ 0 かどうか。

## テスト計画

### createInitialPlayer
- Lv1、HP=50n、ATK=10n、Gold=0n、EXP=0n であること
- weaponが「棒」で attackBonus=0n であること
- weapon.element が fire/ice/thunder のいずれかであること

### getRequiredExp
- Lv1: 10n
- Lv5: 250n
- Lv10: 1000n
- Lv11以降は指数的に増加すること（Lv20 >> Lv10 の数倍以上）

### levelUp
- レベルが1上がること
- Lv1→2 で MaxHP +8、ATK +3
- Lv11→12 で MaxHP +20、ATK +8
- hpも成長量分だけ増加すること

### addExp
- 足りなければレベルは変わらない
- ちょうどで1回レベルアップ
- 大量EXPで複数回レベルアップ

### heal
- HP回復すること
- MaxHPを超えないこと

### takeDamage / isDead
- ダメージでHPが減ること
- HP0以下で isDead が true
- HP残っていれば false

## 完了条件
- 全テスト通過
- 成長曲線が序盤緩やか→後半インフレに沿っている
