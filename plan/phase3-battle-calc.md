# フェーズ3: 属性・武器・ダメージ計算

## 目的
属性相性判定とダメージ計算ロジックを実装する。

## 依存
- フェーズ1（型定義・属性相性マップ）

## 実装ファイル
- `src/lib/element.ts` — 属性相性判定
- `src/lib/damage.ts` — ダメージ計算
- `src/lib/weapon.ts` — 武器生成

## 関数

### getElementAdvantage
武器属性と敵属性を比較し、相性を返す。
- `"advantage"` — 有利（×2）
- `"disadvantage"` — 不利（×0.1）
- `"neutral"` — 同属性（×1）

### getElementMultiplier
相性に応じた倍率を返す。

### calculatePlayerDamage
プレイヤーの攻撃ダメージを計算する。
- `(ATK + 武器攻撃補正) × 属性倍率`
- bigintで計算

### generateWeaponDrop
敵撃破時にドロップする武器を生成する。
- エリアに応じた攻撃補正値
- ランダム属性

## テスト
- 火＞氷、氷＞雷、雷＞火が正しく判定されること
- 同属性でneutralが返ること
- 有利で×2、不利で×0.1、同属性で×1のダメージ倍率
- ダメージ計算がbigintで正しく動作すること
- 武器生成が正しい属性・補正値を持つこと

## 完了条件
- 全テストが通る
