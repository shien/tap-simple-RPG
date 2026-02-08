# フェーズ6: 戦闘システム

## 目的
タップ攻撃・敵自動攻撃・勝敗判定の戦闘ループを実装する。

## 依存
- フェーズ2（プレイヤー — addExp, takeDamage, isDead）
- フェーズ3（ダメージ計算 — calculatePlayerDamage）
- フェーズ4（敵生成 — generateEnemy, generateBoss）
- 武器ドロップ（weapon.ts — generateWeaponDrop）

## 実装ファイル
- `src/lib/battle.ts` — 戦闘ロジック
- `src/lib/battle.test.ts` — テスト

## 型定義

### BattleState（types.tsに追加）
```ts
export type BattleResult = "ongoing" | "victory" | "defeat";

export type BattleState = {
  player: Player;
  enemy: Enemy;
  result: BattleResult;
  turnCount: number;
};
```

## 関数設計

### battle.ts

#### createBattleState(player: Player, enemy: Enemy): BattleState
戦闘開始時の状態を生成する。
- result = "ongoing"
- turnCount = 0

#### playerAttack(state: BattleState): BattleState
プレイヤーが攻撃する（タップ時）。
- calculatePlayerDamage でダメージ計算
- enemy.hp を減少（0未満にならない）
- turnCount += 1
- result が "ongoing" でない場合はそのまま返す（二重攻撃防止）

#### enemyAttack(state: BattleState): BattleState
敵の自動攻撃。
- enemy.atk をそのままプレイヤーダメージとして適用（player.takeDamage使用）
- result が "ongoing" でない場合はそのまま返す

#### checkBattleResult(state: BattleState): BattleState
戦闘結果を判定する。
- enemy.hp <= 0n → result = "victory"
- player.hp <= 0n → result = "defeat"
- それ以外 → result = "ongoing"
- 優先: player死亡 > enemy死亡（相打ちは敗北扱い）

#### processBattleRewards(state: BattleState, areaId: AreaId): BattleState
勝利時の報酬を処理する。
- result !== "victory" の場合はそのまま返す
- EXP加算（異常個体なら expReward × ABNORMAL_EXP_MULTIPLIER）
- Gold加算
- 武器ドロップ → 即装備更新

## テスト計画

### battle.test.ts
- createBattleState: result="ongoing", turnCount=0
- playerAttack: 敵HPが正しく減少する
- playerAttack: 属性有利で2倍ダメージ
- playerAttack: 属性不利で1/10ダメージ（最低1保証）
- playerAttack: result!="ongoing" なら攻撃しない
- enemyAttack: プレイヤーHPが敵ATK分減少する
- enemyAttack: result!="ongoing" なら攻撃しない
- checkBattleResult: 敵HP0以下で "victory"
- checkBattleResult: プレイヤーHP0以下で "defeat"
- checkBattleResult: 相打ちは "defeat"（プレイヤー死亡優先）
- checkBattleResult: 両方HP残りで "ongoing"
- processBattleRewards: 勝利時にEXP/Gold加算
- processBattleRewards: 異常個体でEXP×100
- processBattleRewards: 武器が更新される
- processBattleRewards: result!="victory" なら何もしない

## 完了条件
- 全テスト通過
- `pnpm run build` 成功
