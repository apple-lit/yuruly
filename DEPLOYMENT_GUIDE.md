# Yuru-Plan を一般公開する手順（Vercel + Supabase）

このガイドでは、ローカルで動作しているYuru-Planを、誰でもアクセスできる本番環境にデプロイする手順を説明します。

## 📋 必要なもの

- GitHubアカウント（無料）
- Vercelアカウント（無料）
- Supabaseアカウント（既に作成済み）

## 🚀 デプロイ手順（所要時間: 約15分）

### ステップ1: GitHubにプロジェクトをプッシュ

#### 1-1. GitHubで新しいリポジトリを作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例: `yuru-plan`）
4. 「Public」または「Private」を選択（どちらでもOK）
5. 「Create repository」をクリック

#### 1-2. ローカルプロジェクトをGitに登録

```bash
cd ~/Desktop/yuru-plan

# Gitリポジトリを初期化
git init

# .gitignoreファイルを確認（既に存在する場合はスキップ）
cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

# 全てのファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: Yuru-Plan MVP"
```

#### 1-3. GitHubにプッシュ

GitHubのリポジトリページに表示される手順に従います：

```bash
# リモートリポジトリを追加（URLは自分のリポジトリのURLに置き換え）
git remote add origin https://github.com/YOUR_USERNAME/yuru-plan.git

# メインブランチの名前を確認・変更
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

**認証エラーが出た場合**：
- Personal Access Token (PAT) を作成する必要があります
- GitHub Settings → Developer settings → Personal access tokens → Generate new token
- `repo` にチェックを入れてトークンを生成
- パスワードの代わりにトークンを使用

### ステップ2: Vercelにデプロイ

#### 2-1. Vercelアカウントを作成

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択（GitHubアカウントで登録）
4. Vercelが必要な権限をリクエストするので「Authorize」

#### 2-2. プロジェクトをインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリの一覧から `yuru-plan` を探す
3. 「Import」をクリック

#### 2-3. 環境変数を設定

**重要**: デプロイ前に環境変数を設定します。

1. 「Environment Variables」セクションを展開
2. 以下の環境変数を追加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabaseのプロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseの anon public key |

**Supabaseの値を確認する方法**：
- Supabaseダッシュボード → Project Settings → API
- `Project URL` と `anon public` をコピー

3. 「Deploy」をクリック

#### 2-4. デプロイ完了を待つ

- デプロイには2-3分かかります
- 画面にログが表示され、進捗を確認できます
- 「Congratulations!」と表示されたら完了

### ステップ3: 本番環境にアクセス

#### 3-1. URLを確認

デプロイ完了後、以下のようなURLが発行されます：
```
https://yuru-plan-xxxxx.vercel.app
```

#### 3-2. 動作確認

1. 発行されたURLをブラウザで開く
2. イベント作成画面が表示されることを確認
3. テストイベントを作成してみる
4. 回答画面・結果画面が正常に動作することを確認

## 🔧 トラブルシューティング

### デプロイが失敗する

**エラー: "Build failed"**

**原因**: 環境変数が設定されていない、またはビルドエラー

**解決方法**:
1. Vercelダッシュボード → プロジェクト → Settings → Environment Variables
2. 環境変数が正しく設定されているか確認
3. 「Deployments」タブ → 最新のデプロイ → 「Redeploy」

### 環境変数を後から追加・変更した場合

```bash
# 環境変数を変更した後は、再デプロイが必要
# Vercelダッシュボード → Deployments → 最新のデプロイ → Redeploy
```

または、ローカルで変更をコミットしてプッシュ：
```bash
git add .
git commit -m "Update configuration"
git push
```

### データベースに接続できない

**症状**: イベントが作成できない、404エラーが出る

**原因**: Supabaseの環境変数が間違っている

**解決方法**:
1. Vercel → Settings → Environment Variables で値を確認
2. Supabaseダッシュボードで正しい値を再度コピー
3. Vercelで環境変数を更新
4. 「Redeploy」を実行

## 🎯 カスタムドメインの設定（任意）

無料でカスタムドメインを使いたい場合：

### オプション1: Vercelのサブドメイン

1. Vercel → Settings → Domains
2. 「Edit」をクリック
3. 好きな名前に変更（例: `yuru-plan.vercel.app`）

### オプション2: 独自ドメイン

1. ドメインを購入（Google Domains、Namecheapなど）
2. Vercel → Settings → Domains → 「Add」
3. 購入したドメインを入力
4. DNSレコードを設定（Vercelが指示を表示）

## 📊 本番環境での管理

### アクセス解析

Vercelは自動的にアクセス解析を提供：
- Analytics タブでページビュー、訪問者数を確認
- 無料プランでも基本的な分析が利用可能

### データベースの確認

Supabaseダッシュボードで：
- Table Editor → イベント一覧を確認
- Logs → エラーログを確認

### バックアップ

Supabaseは自動的にバックアップを作成：
- Settings → Backups で確認
- 手動バックアップも可能

## 🔄 更新手順

ローカルで変更した内容を本番環境に反映する：

```bash
cd ~/Desktop/yuru-plan

# 変更をコミット
git add .
git commit -m "説明的なコミットメッセージ"

# GitHubにプッシュ
git push

# Vercelが自動的にデプロイを開始（約2-3分）
```

## 💰 料金について

### 無料プランで使える範囲

**Vercel**:
- 無制限のデプロイ
- 月100GBの帯域幅
- 個人プロジェクトには十分

**Supabase**:
- 500MBのデータベース
- 月50,000回のリクエスト
- 小〜中規模のイベントには十分

### 有料プランが必要になるケース

- 月間1000人以上の利用者
- 大量のイベント（数百件以上）
- 高頻度のアクセス

## 🔒 セキュリティ設定（推奨）

### Row Level Security (RLS) の有効化

本番環境では、Supabaseの RLS を有効にすることを強く推奨：

1. Supabaseダッシュボード → Authentication → Policies
2. 各テーブルに対してポリシーを設定

**例: events テーブル**
```sql
-- 誰でも読み取り可能
CREATE POLICY "Anyone can read events"
ON events FOR SELECT
USING (true);

-- 誰でも作成可能
CREATE POLICY "Anyone can create events"
ON events FOR INSERT
WITH CHECK (true);

-- 管理者トークンを持つ人のみ削除可能
CREATE POLICY "Admin token required for delete"
ON events FOR DELETE
USING (
  admin_token = current_setting('request.jwt.claims', true)::json->>'admin_token'
);
```

## 📱 公開後の使い方

### URLの共有

発行されたURL（例: `https://yuru-plan-xxxxx.vercel.app`）を：
- LINEグループで共有
- メールで送信
- SNSに投稿

### イベント作成

1. `https://your-domain.vercel.app/create` にアクセス
2. イベント情報を入力
3. URLが発行される
4. 参加者に共有

## 🎓 次のステップ

デプロイが完了したら：

1. **友人とテスト**: 実際に使ってフィードバックをもらう
2. **機能追加**: 必要な機能を追加実装
3. **デザイン改善**: ブランディングを強化
4. **SNS投稿**: サービスを宣伝

## 🆘 サポート

問題が発生した場合：

1. Vercelの「Logs」タブでエラーログを確認
2. Supabaseの「Logs」でデータベースエラーを確認
3. ブラウザのコンソール（F12）でフロントエンドエラーを確認

それでも解決しない場合は、エラーメッセージと一緒に質問してください！

---

おめでとうございます！🎉
Yuru-Planが全世界に公開されました！
