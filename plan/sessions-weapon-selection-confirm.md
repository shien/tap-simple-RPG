# セッション: 武器選択に確認ステップを追加

## 概要

攻撃連打中に戦闘が終了すると、タップが武器選択カードに当たり意図しない武器が選ばれてしまうバグを修正。武器選択を2ステップ（選択→決定）に変更。

## 問題

- 攻撃ボタンを連打していると、敵撃破直後のタップが WeaponCard に伝わる
- `onChooseWeapon` が即座に呼ばれ、意図しない武器が装備される

## 修正内容

`src/components/BattleResultView.tsx` を変更:

1. `WeaponCard` クリックで即確定せず、ローカル state (`selectedWeapon`) にどちらを選んだか記録するだけにする
2. 選択中の武器カードはハイライト表示（青ボーダー）
3. 「決定」ボタンを追加。武器が選択されるまで無効化（グレーアウト）
4. 「決定」ボタン押下で初めて `onChooseWeapon` が呼ばれる

## 変更ファイル

- `src/components/BattleResultView.tsx` — WeaponCard に `selected` プロップ追加、useState で選択状態管理、決定ボタン追加

## テスト結果

全12ファイル、196テストがパス。
