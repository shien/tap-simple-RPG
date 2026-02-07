# モンスター・武器設定ファイル導入

## 目的
モンスターと武器の名前・説明・出現場所・ボスフラグを外部設定ファイルで管理する。
今後の追加を容易にし、ゲームロジックとコンテンツデータを分離する。

## 依存
- フェーズ1（型定義・エリアデータ）
- フェーズ3（weapon.ts）

## 実装ファイル
- `src/lib/data/monsters.ts` — モンスター設定データ
- `src/lib/data/weapons.ts` — 武器設定データ
- `src/lib/types.ts` — MonsterConfig / WeaponConfig 型追加
- `src/lib/weapon.ts` — 設定ファイルベースに書き換え
- `src/lib/data/monsters.test.ts` — モンスター設定テスト
- `src/lib/data/weapons.test.ts` — 武器設定テスト

## 型設計

### MonsterConfig
```ts
type MonsterConfig = {
  id: string;
  name: string;
  description: string;
  areaIds: AreaId[];     // 出現エリア（複数可）
  element: Element;
  isBoss: boolean;
};
```

### WeaponConfig
```ts
type WeaponConfig = {
  id: string;
  name: string;
  description: string;
  areaIds: AreaId[];     // ドロップするエリア（複数可）
  element: Element;
};
```

## 暫定データ（各5件）

### モンスター
| id | name | element | areaIds | isBoss | description |
|----|------|---------|---------|--------|-------------|
| slime | スライム | ice | [1] | false | 草原に生息する青い軟体生物 |
| goblin | ゴブリン | fire | [1,2] | false | 粗末な武器を振り回す小鬼 |
| golem | ゴーレム | thunder | [2,3] | false | 岩石で構成された魔法人形 |
| dragon_pup | ドラゴンパピー | fire | [3,4] | false | まだ幼い火竜の子供 |
| grassland_king | 草原の王 | thunder | [1] | true | 草原エリアを支配するボス |

### 武器
| id | name | element | areaIds | description |
|----|------|---------|---------|-------------|
| wooden_sword | 木の剣 | fire | [1] | 枝を削って作った粗末な剣 |
| stone_axe | 石の斧 | thunder | [1] | 石を研いで作った原始的な斧 |
| iron_sword | 鉄の剣 | fire | [2] | 鍛冶屋で打たれた標準的な剣 |
| ice_staff | 氷の杖 | ice | [2,3] | 冷気を纏った魔法の杖 |
| steel_blade | 鋼の刃 | thunder | [3] | 良質な鋼で鍛えられた刃 |

## 既存コード修正方針
- `weapon.ts` の `WEAPON_NAMES` ハードコードを設定ファイル参照に変更
- `generateWeaponDrop` がエリアIDで設定ファイルから候補を絞り、名前と属性を使用
- 設定にない属性の武器は従来通りランダム属性フォールバック

## テスト計画
- モンスター設定が5件以上あること
- 武器設定が5件以上あること
- 全設定に必須フィールドが存在すること
- areaIdsが1〜8の範囲内であること
- idが重複しないこと
- ボスモンスターが少なくとも1体いること
- generateWeaponDropが設定ファイルの武器名を返すこと

## 完了条件
- 全テスト通過
- `pnpm run build` 成功
- 設定ファイルに5件ずつデータが入っている
- 武器・敵の名前が設定ファイルから参照されている
