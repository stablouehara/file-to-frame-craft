# デプロイメントガイド

このガイドでは、File-to-Frame-Craftアプリケーションのバックエンド（Supabase Edge Functions）をデプロイする手順を説明します。

## 前提条件

- Node.js 18以上がインストールされている
- npmまたはbunがインストールされている
- Supabaseアカウントを持っている
- Anthropic APIアカウントを持っている

## ステップ1: Supabase CLIのインストール

```bash
npm install -g supabase
```

バージョン確認：
```bash
supabase --version
```

## ステップ2: Supabaseプロジェクトへのログイン

```bash
supabase login
```

ブラウザが開き、Supabaseにログインします。

## ステップ3: プロジェクトのリンク

```bash
supabase link --project-ref rmyvlbedxurypaujbspq
```

プロンプトが表示されたら、データベースパスワードを入力してください。

## ステップ4: Anthropic APIキーの取得

1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. ログインまたはアカウント作成
3. 「API Keys」セクションへ移動
4. 「Create Key」をクリック
5. APIキーをコピー（後で使用）

## ステップ5: 環境変数の設定

### ローカル環境（.envファイル）

`.env`ファイルを編集：
```bash
ANTHROPIC_API_KEY="sk-ant-api03-xxxxxxxxxxxxxxxxxx"
```

### Supabase環境（本番用）

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxx
```

設定した環境変数の確認：
```bash
supabase secrets list
```

## ステップ6: Edge Functionsのデプロイ

### すべての関数を一括デプロイ

```bash
supabase functions deploy
```

### 個別の関数をデプロイ

```bash
# メディア推薦生成
supabase functions deploy generate-media-recommendations

# 広告コピー生成
supabase functions deploy generate-ad-copy

# インサイト生成
supabase functions deploy generate-insights
```

### デプロイ時の確認

デプロイが成功すると、以下のような出力が表示されます：
```
Deploying function generate-media-recommendations...
Function URL: https://rmyvlbedxurypaujbspq.supabase.co/functions/v1/generate-media-recommendations
```

## ステップ7: デプロイの確認

### Supabase Dashboardで確認

1. [Supabase Dashboard](https://app.supabase.com/project/rmyvlbedxurypaujbspq)にアクセス
2. 左メニューから「Edge Functions」を選択
3. デプロイされた関数が表示されることを確認
4. 各関数をクリックしてログを確認

### curlでテスト

```bash
# Supabase Anonキーを環境変数に設定
export SUPABASE_ANON_KEY="your-supabase-anon-key"

# メディア推薦のテスト
curl -i --location --request POST \
  'https://rmyvlbedxurypaujbspq.supabase.co/functions/v1/generate-media-recommendations' \
  --header "Authorization: Bearer $SUPABASE_ANON_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"job_posting_id":"test-uuid"}'
```

## ステップ8: フロントエンドのテスト

1. アプリケーションを起動：
```bash
npm run dev
```

2. ブラウザで http://localhost:8080/ai-demo にアクセス

3. 各AI機能をテスト：
   - メディア推薦を生成
   - 広告コピーを生成
   - インサイトを生成

## トラブルシューティング

### エラー: "ANTHROPIC_API_KEY is not set"

**原因:** 環境変数が設定されていない

**解決策:**
```bash
# 環境変数を設定
supabase secrets set ANTHROPIC_API_KEY=your-key-here

# 関数を再デプロイ
supabase functions deploy
```

### エラー: "Failed to fetch"

**原因:** CORSエラーまたはネットワークエラー

**解決策:**
1. ブラウザの開発者ツールでエラー詳細を確認
2. Supabase DashboardでEdge Functionsのログを確認
3. CORSヘッダーが正しく設定されているか確認

### エラー: "Unauthorized"

**原因:** 認証トークンが無効

**解決策:**
1. フロントエンドで再ログイン
2. Supabase Authが正しく設定されているか確認
3. RLSポリシーが正しく設定されているか確認

### Edge Functionsのログ確認

```bash
# リアルタイムログの監視
supabase functions logs generate-media-recommendations --tail

# 過去のログの確認
supabase functions logs generate-media-recommendations
```

## ローカル開発環境

本番環境にデプロイする前に、ローカルでテストすることをお勧めします。

### ローカルSupabaseの起動

```bash
supabase start
```

### Edge Functionsをローカルで実行

```bash
# 特定の関数を実行
supabase functions serve generate-media-recommendations --env-file .env

# すべての関数を実行
supabase functions serve --env-file .env
```

ローカルのエンドポイント：
```
http://localhost:54321/functions/v1/generate-media-recommendations
http://localhost:54321/functions/v1/generate-ad-copy
http://localhost:54321/functions/v1/generate-insights
```

### ローカル環境でのテスト

```bash
# ローカルSupabaseのAnonキーを取得
supabase status

# テストリクエスト送信
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/generate-media-recommendations' \
  --header 'Authorization: Bearer YOUR_LOCAL_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"job_posting_id":"test-uuid"}'
```

## 継続的デプロイメント

### GitHub Actionsの設定（オプション）

`.github/workflows/deploy-functions.yml`を作成：

```yaml
name: Deploy Edge Functions

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Deploy Functions
        run: supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: rmyvlbedxurypaujbspq
```

GitHub Secretsに設定：
- `SUPABASE_ACCESS_TOKEN`: Supabaseアクセストークン

## 監視とメンテナンス

### ログの確認

定期的にEdge Functionsのログを確認：
```bash
supabase functions logs generate-media-recommendations --tail
```

### パフォーマンスモニタリング

Supabase Dashboardで以下を監視：
- 関数の実行回数
- レスポンスタイム
- エラー率

### APIキーのローテーション

セキュリティのため、定期的にAPIキーをローテーション：
1. Anthropic Consoleで新しいAPIキーを作成
2. Supabaseの環境変数を更新
3. 古いAPIキーを削除

```bash
supabase secrets set ANTHROPIC_API_KEY=new-key-here
```

## コスト管理

### Anthropic APIの使用量確認

[Anthropic Console](https://console.anthropic.com/)で使用量を確認

### Supabaseの使用量確認

[Supabase Dashboard](https://app.supabase.com/project/rmyvlbedxurypaujbspq/settings/billing)で確認

## サポート

問題が発生した場合：
1. BACKEND_README.mdのトラブルシューティングセクションを確認
2. Supabase Dashboardのログを確認
3. GitHub Issuesで報告

## 参考リンク

- [Supabase Edge Functions公式ドキュメント](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Deno Deploy Documentation](https://deno.com/deploy/docs)
