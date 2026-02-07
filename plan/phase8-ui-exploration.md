# フェーズ8: UI — 探索画面

## 目的
探索画面のUIを実装する。

## 依存
- フェーズ7（ゲーム全体フロー）

## 実装ファイル
- `src/app/page.tsx` — メイン画面
- `src/components/ExplorationView.tsx` — 探索画面コンポーネント
- `src/components/AreaInfo.tsx` — エリア情報表示
- `src/components/EventPreview.tsx` — 次3イベントプレビュー
- `src/components/PlayerStatus.tsx` — プレイヤーステータス表示

## 表示要素
- 現在エリア名
- 現在マス（1〜6）の進行表示
- 次3イベントのアイコン/ラベル
- プレイヤーHP / ATK / Level / Gold
- 武器情報（名前・属性）
- 「進む」ボタン（Moveタップ）

## 実装方針
- モバイルファースト（縦画面レイアウト）
- Tailwind CSSでスタイリング
- ゲーム状態はReact useStateで管理

## 完了条件
- 探索画面が表示される
- 「進む」タップでイベントが進行する
- 次3イベントが正しく表示される
