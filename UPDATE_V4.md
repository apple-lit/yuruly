# yuruly v4 アップデート 🎨

## 🎨 ブランディング変更

### サービス名を「yuruly」に変更

**Yuru-Plan → yuruly**

- より覚えやすく、親しみやすい名前に
- 小文字で統一してモダンな印象に
- 国際的にも発音しやすい

### ロゴデザインの刷新

**イタリック体を採用**

- フォントスタイルを`italic`に変更
- より洗練された印象に
- 動きのあるデザインで「ゆるさ」を表現

## 🐛 バグ修正

### 重複日程の追加を防止

**問題**: 管理画面で同じ日付を複数回追加できてしまう

**修正内容**:
- 既存の日付と重複する場合、エラーメッセージを表示
- 「この日付は既に追加されています」と警告
- 追加ボタンが押せないように制御

## 🔄 更新手順

### オプション1: ファイルを個別にコピー

```bash
cd ~/Desktop

# ダウンロードしたzipを解凍
cd ~/Downloads
unzip yuruly-v4-branded.zip

# 更新ファイルをコピー
cp yuru-plan/app/page.tsx ~/Desktop/yuru-plan/app/
cp yuru-plan/app/layout.tsx ~/Desktop/yuru-plan/app/
cp yuru-plan/components/event-creator.tsx ~/Desktop/yuru-plan/components/
cp yuru-plan/components/response-form.tsx ~/Desktop/yuru-plan/components/
cp yuru-plan/components/results-view.tsx ~/Desktop/yuru-plan/components/
cp yuru-plan/components/admin-view.tsx ~/Desktop/yuru-plan/components/
cp yuru-plan/components/add-date-dialog.tsx ~/Desktop/yuru-plan/components/
cp yuru-plan/package.json ~/Desktop/yuru-plan/

# 開発サーバーを再起動
cd ~/Desktop/yuru-plan
npm run dev
```

### オプション2: プロジェクトフォルダをリネーム（推奨）

```bash
cd ~/Desktop

# 既存フォルダをリネーム
mv yuru-plan yuruly

# プロジェクトフォルダに移動
cd yuruly

# 上記のファイルをコピー（パスをyurulyに変更）
# 開発サーバーを起動
npm run dev
```

## 📋 変更されたファイル

### UI関連
- ✅ `app/page.tsx` - ランディングページのロゴ
- ✅ `app/layout.tsx` - ページタイトル
- ✅ `components/event-creator.tsx` - イベント作成画面のロゴ
- ✅ `components/response-form.tsx` - 回答画面のロゴ
- ✅ `components/results-view.tsx` - 結果表示画面のロゴ

### 機能追加
- ✅ `components/add-date-dialog.tsx` - 重複チェック機能
- ✅ `components/admin-view.tsx` - 既存日付リストの受け渡し

### メタデータ
- ✅ `package.json` - プロジェクト名

## 🎯 動作確認

### ロゴの確認

すべての画面で「**yuruly**」がイタリック体で表示されることを確認：

1. ランディングページ（`/`）
2. イベント作成画面（`/create`）
3. 回答画面（`/event/[id]`）
4. 結果表示画面（`/event/[id]/results`）

### 重複防止の確認

1. 管理画面を開く
2. 「候補日を追加」をクリック
3. 既に存在する日付を選択
4. 「追加」をクリック
5. ❌ エラーメッセージが表示される
   - 「⚠️ この日付は既に追加されています」

### 正常な追加の確認

1. 管理画面で「候補日を追加」
2. 新しい日付を選択
3. 「追加」をクリック
4. ✅ ページがリロードされ、新しい候補日が表示される

## 🎨 デザイン詳細

### ロゴのスタイル

```tsx
<h1 className="... italic">
  yuruly
</h1>
```

**Before (Yuru-Plan)**:
```
Yuru-Plan
```

**After (yuruly)**:
```
yuruly  ← イタリック体で傾いている
```

### エラーメッセージのデザイン

```tsx
<div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
  ⚠️ この日付は既に追加されています
</div>
```

赤い背景で目立つように表示されます。

## 📱 Vercelでのデプロイ

プロジェクト名を変更した場合、Vercelでも更新が必要です：

### 既にデプロイ済みの場合

1. **オプション1**: プロジェクト名はそのまま
   - Vercelのプロジェクト名は変更不要
   - サイト名だけ変わればOK

2. **オプション2**: Vercelのプロジェクトも新規作成
   - 新しいリポジトリ「yuruly」を作成
   - Vercelで新規プロジェクトとしてインポート
   - 環境変数を再設定

### カスタムドメインの設定

yurulyに合わせたドメインを検討：
- `yuruly.app`
- `yuruly.io`
- `yuruly.com`

## 🌟 ブランディングガイドライン

### ロゴの使用方法

**正しい表記**:
- ✅ yuruly（小文字、イタリック）
- ❌ Yuruly（大文字始まり）
- ❌ YURULY（全て大文字）
- ❌ yuruly（イタリックなし）

### カラーパレット

グラデーション:
```css
background: linear-gradient(to right, 
  #c084fc,  /* purple-400 */
  #60a5fa,  /* blue-400 */
  #4ade80   /* green-400 */
)
```

### トーン＆マナー

- **親しみやすさ**: ゆるく、カジュアルに
- **信頼性**: シンプルで分かりやすく
- **遊び心**: パステルカラーとアニメーション

## 🎓 今後の展開

ブランド確立後の施策：
1. ✅ ロゴ・ブランディングの統一
2. ⬜ OGP画像の作成（SNSシェア用）
3. ⬜ ファビコンの設定
4. ⬜ 独自ドメインの取得
5. ⬜ SNSアカウントの開設

## 💡 ネーミングの意図

**yuruly** = ゆるり + ly

- **ゆるり**: ゆったり、リラックスした雰囲気
- **ly**: 英語の副詞的な語尾で、親しみやすさを表現
- 小文字: モダンなサービスらしい柔らかさ
- イタリック: 動きのある、軽やかな印象

---

これでyurulyとして新しいスタートです！🎉
