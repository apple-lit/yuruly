# Yuru-Plan 完全版セットアップガイド

## 🎉 実装完了した機能

✅ **イベント作成** - 候補日の選択とURL発行  
✅ **回答画面** - 参加者が◯△✕で回答  
✅ **結果表示** - 出欠表とおすすめ日程  
✅ **管理画面** - イベントの管理と削除  

すべての主要機能が実装されました！

## 🚀 既存プロジェクトの更新方法

デスクトップにあるプロジェクトを更新します。

### 方法1: ファイルを手動でコピー（推奨）

```bash
cd ~/Desktop

# 新しいファイルをダウンロードして解凍
# yuru-plan-complete.zip を解凍

# 新しいファイルをコピー
cp -r yuru-plan-complete/lib/event-api.ts yuru-plan/lib/
cp -r yuru-plan-complete/components/response-form.tsx yuru-plan/components/
cp -r yuru-plan-complete/components/results-view.tsx yuru-plan/components/
cp -r yuru-plan-complete/components/admin-view.tsx yuru-plan/components/

# ページファイルをコピー
cp -r yuru-plan-complete/app/event yuru-plan/app/

# 依存関係を更新（変更なし）
cd yuru-plan
npm install
```

### 方法2: プロジェクト全体を置き換え

```bash
cd ~/Desktop

# 既存をバックアップ
mv yuru-plan yuru-plan-backup

# 新しいプロジェクトを配置
# yuru-plan-complete.zip を解凍してyuru-planにリネーム

cd yuru-plan
npm install
```

環境変数（`.env.local`）の設定を忘れずに：

```env
NEXT_PUBLIC_SUPABASE_URL=あなたのProject URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのanon public key
```

## 🧪 動作確認

### 1. イベント作成のテスト

```bash
cd ~/Desktop/yuru-plan
npm run dev
```

1. `http://localhost:3000/create` を開く
2. イベント情報を入力
3. 候補日を選択
4. 「イベントを作成」をクリック
5. URLが発行される

### 2. 回答画面のテスト

1. 発行された**回答用URL**をコピー
2. 新しいタブで開く
3. 候補日をタップして◯△✕を切り替え
4. 名前を入力して「回答を送信」
5. 自動的に結果画面にリダイレクト

### 3. 結果表示のテスト

結果画面で以下を確認：
- 回答者数が表示される
- おすすめ日程（◯が多い順）
- 出欠表で誰がどの日に◯を出したか確認

### 4. 管理画面のテスト

1. 発行された**管理用URL**をコピー
2. 新しいタブで開く
3. イベント情報と統計が表示される
4. 「イベントを削除」で削除できる（テスト後に実行）

## 📂 新しいファイル構成

```
yuru-plan/
├── app/
│   ├── event/
│   │   └── [id]/
│   │       ├── page.tsx              # 回答画面
│   │       ├── results/
│   │       │   └── page.tsx          # 結果表示画面
│   │       └── admin/
│   │           └── [token]/
│   │               └── page.tsx      # 管理画面
│   ├── create/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── event-creator.tsx
│   ├── event-created-dialog.tsx
│   ├── response-form.tsx             # 新規
│   ├── results-view.tsx              # 新規
│   ├── admin-view.tsx                # 新規
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       └── badge.tsx
├── lib/
│   ├── supabase.ts
│   ├── api.ts
│   ├── event-api.ts                  # 新規
│   └── utils.ts
└── types/
    └── event.ts
```

## 🎨 UI/UX の特徴

### 回答画面
- **タップで切り替え**: ◯→△→✕の直感的な操作
- **視覚的フィードバック**: 選択状態に応じた色分け
- **送信完了アニメーション**: 回答後の心地よいフィードバック

### 結果表示画面
- **おすすめ日程**: ◯が多い順に自動表示（🏆1位、🥈2位、🥉3位）
- **出欠表**: 全回答者の一覧をマトリックス形式で表示
- **URLコピー**: ワンクリックで共有URL をコピー

### 管理画面
- **統計情報**: 回答者数、候補日数を一目で確認
- **安全な削除**: 確認ダイアログで誤操作を防止
- **認証保護**: 管理用トークンによる保護

## 🔒 セキュリティについて

### 管理用URLの取り扱い
- 管理用URLは**絶対に他人に共有しない**
- URLを紛失すると、イベントの管理ができなくなる
- ブックマークやメモアプリに保存することを推奨

### データの保護
- Supabaseの Row Level Security (RLS) は現在無効
- 本番環境では RLS を有効にすることを推奨
- 管理用トークンは UUID v4 で生成（推測困難）

## 🐛 トラブルシューティング

### 404エラーが表示される

**原因**: ファイルが正しくコピーされていない

**解決方法**:
```bash
cd ~/Desktop/yuru-plan
ls -la app/event/[id]/page.tsx
# ファイルが存在することを確認

# 開発サーバーを再起動
npm run dev
```

### 「イベントが見つかりません」と表示される

**原因**: データベースに接続できていない、またはイベントIDが間違っている

**解決方法**:
1. `.env.local`ファイルの内容を確認
2. SupabaseのダッシュボードでURLとキーを再確認
3. 開発サーバーを再起動

### 回答を送信しても結果画面に表示されない

**原因**: キャッシュの問題、またはデータベースエラー

**解決方法**:
1. ブラウザをリロード（Command + R）
2. ブラウザのコンソール（F12）でエラーを確認
3. Supabaseのダッシュボードで `responses` テーブルを確認

### 管理画面で「アクセスが拒否されました」

**原因**: 管理用トークンが正しくない

**解決方法**:
1. 発行された管理用URLを正確にコピー
2. URLに余計なスペースや改行が入っていないか確認
3. トークン部分（最後の長い文字列）が完全であることを確認

## 📊 データベースの確認方法

Supabaseダッシュボードで以下を確認できます：

1. **Table Editor** > `events` - 作成したイベント
2. **Table Editor** > `event_dates` - 候補日
3. **Table Editor** > `responses` - 回答者情報
4. **Table Editor** > `response_answers` - 各日付への回答

## 🚀 次のステップ

すべての主要機能が完成したので、次は：

1. **テスト**: 実際に友人とテストしてみる
2. **デプロイ**: Vercelにデプロイして本番環境で使ってみる
3. **フィードバック**: 実際に使ってみて改善点を見つける
4. **拡張機能**: メール通知、カレンダー連携などを追加

## 🎓 学んだこと

このプロジェクトで学んだ技術：
- Next.js App Router
- Supabase (PostgreSQL)
- TypeScript
- Tailwind CSS
- shadcn/ui
- 動的ルーティング
- クライアントコンポーネント

おめでとうございます！完全に動作する日程調整アプリが完成しました！🎉
