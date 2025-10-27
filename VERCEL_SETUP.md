# Vercelデプロイメントガイド

このガイドでは、https://file-to-frame-craft.vercel.app/ でアプリケーションを動作させる手順を説明します。

## アーキテクチャ概要

```
┌─────────────────┐
│   Vercel        │
│  (フロントエンド)  │
│                 │
│  React + Vite   │
└────────┬────────┘
         │
         │ API呼び出し
         │
┌────────▼────────┐
│   Supabase      │
│  (バックエンド)   │
│                 │
│  - Database     │
│  - Auth         │
│  - Edge Funcs   │
└────────┬────────┘
         │
         │ AI呼び出し
         │
┌────────▼────────┐
│  Anthropic      │
│  Claude API     │
└─────────────────┘
```

フロントエンドはVercelでホスティング、バックエンドAPIはSupabase Edge Functionsで動作します。

## 前提条件

- Vercelアカウント（プロジェクトは既にデプロイ済み）
- Supabaseアカウント
- Anthropic APIアカウント
- ローカル環境にSupabase CLIがインストール済み

## ステップ1: Anthropic APIキーの取得

1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. ログインまたはアカウント作成
3. 「API Keys」セクションへ移動
4. 「Create Key」をクリック
5. APIキーをコピー（例: `sk-ant-api03-...`）

## ステップ2: Supabase Edge Functionsのデプロイ

### 2-1. Supabase CLIのインストール

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
# 最新バージョンをダウンロード
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

**Windows:**
```bash
scoop install supabase
```

### 2-2. Supabaseにログイン

```bash
supabase login
```

ブラウザが開き、認証を求められます。

### 2-3. プロジェクトをリンク

```bash
supabase link --project-ref rmyvlbedxurypaujbspq
```

データベースパスワードの入力を求められます。

### 2-4. Anthropic APIキーを設定

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

設定した環境変数を確認：
```bash
supabase secrets list
```

### 2-5. Edge Functionsをデプロイ

**オプション1: デプロイスクリプトを使用（推奨）**

```bash
./scripts/deploy-functions.sh
```

**オプション2: 手動でデプロイ**

```bash
# 各関数を個別にデプロイ
npx supabase functions deploy generate-media-recommendations --no-verify-jwt
npx supabase functions deploy generate-ad-copy --no-verify-jwt
npx supabase functions deploy generate-insights --no-verify-jwt
```

### 2-6. デプロイ確認

Supabase Dashboardで確認：
1. https://app.supabase.com/project/rmyvlbedxurypaujbspq にアクセス
2. 左メニューから「Edge Functions」を選択
3. 3つの関数がデプロイされていることを確認

各関数のURL:
```
https://rmyvlbedxurypaujbspq.supabase.co/functions/v1/generate-media-recommendations
https://rmyvlbedxurypaujbspq.supabase.co/functions/v1/generate-ad-copy
https://rmyvlbedxurypaujbspq.supabase.co/functions/v1/generate-insights
```

## ステップ3: Vercel環境変数の設定

### 3-1. Vercel Dashboardにアクセス

1. https://vercel.com/dashboard にアクセス
2. `file-to-frame-craft` プロジェクトを選択
3. 「Settings」タブをクリック
4. 左メニューから「Environment Variables」を選択

### 3-2. 必要な環境変数を追加

以下の環境変数を設定します：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://rmyvlbedxurypaujbspq.supabase.co` | Supabase プロジェクトURL |
| `VITE_SUPABASE_PROJECT_ID` | `rmyvlbedxurypaujbspq` | Supabase プロジェクトID |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGc...` | Supabase Anon/Public キー |

### 3-3. Supabase Anon Keyの取得方法

1. https://app.supabase.com/project/rmyvlbedxurypaujbspq/settings/api にアクセス
2. 「Project API keys」セクションを探す
3. 「anon public」キーをコピー

### 3-4. 環境変数の追加手順

各環境変数について：
1. 「Add New」ボタンをクリック
2. 「Key」に変数名を入力（例: `VITE_SUPABASE_URL`）
3. 「Value」に値を入力
4. Environment: **Production**, **Preview**, **Development** すべてにチェック
5. 「Save」をクリック

すべての環境変数を追加したら、「Save」をクリックします。

## ステップ4: Vercelで再デプロイ

環境変数を設定した後、アプリケーションを再デプロイする必要があります。

### 方法1: Deployments タブから

1. Vercelダッシュボードの「Deployments」タブに移動
2. 最新のデプロイメントの右側にある「...」メニューをクリック
3. 「Redeploy」を選択
4. 「Redeploy」を確認

### 方法2: GitHubにプッシュ

```bash
# 何か変更をコミット（例: README更新）
git add .
git commit -m "Update environment variables"
git push
```

Vercelは自動的に新しいデプロイメントを開始します。

## ステップ5: 動作確認

### 5-1. デプロイメントの完了を待つ

Vercelダッシュボードの「Deployments」タブで、デプロイメントのステータスが「Ready」になるまで待ちます（通常1-2分）。

### 5-2. アプリケーションにアクセス

1. https://file-to-frame-craft.vercel.app/ にアクセス
2. AI機能をテスト: https://file-to-frame-craft.vercel.app/ai-demo

### 5-3. AI機能のテスト

AI Demoページで以下をテスト：

1. **メディア推薦を生成**
   - 「推薦を生成」ボタンをクリック
   - 3-5件のメディア推薦が表示されることを確認

2. **広告コピーを生成**
   - 「コピーを生成」ボタンをクリック
   - 3件の広告コピーバリエーションが表示されることを確認

3. **インサイトを生成**
   - 「インサイトを生成」ボタンをクリック
   - データ分析結果とインサイトが表示されることを確認

### 5-4. ブラウザの開発者ツールで確認

1. F12キーを押して開発者ツールを開く
2. 「Network」タブを選択
3. AI機能を実行
4. Supabase Edge Functionsへのリクエストが成功（200 OK）していることを確認

## トラブルシューティング

### エラー: "ANTHROPIC_API_KEY is not set"

**原因:** Supabaseの環境変数が設定されていない

**解決策:**
```bash
supabase secrets set ANTHROPIC_API_KEY=your-key-here
# Edge Functionsを再デプロイ
npx supabase functions deploy
```

### エラー: "Failed to fetch"

**原因:** 環境変数が正しく設定されていない、またはCORSエラー

**解決策:**
1. Vercelの環境変数を確認
2. ブラウザのコンソールでエラー詳細を確認
3. Supabase Dashboard > Edge Functions > Logs でエラーを確認

### エラー: "Unauthorized"

**原因:** Supabase Anon Keyが間違っているか、認証エラー

**解決策:**
1. `VITE_SUPABASE_PUBLISHABLE_KEY` が正しいか確認
2. Supabase Dashboardで正しいAnon Keyを取得
3. Vercelの環境変数を更新して再デプロイ

### AI機能が動作しない

**確認項目:**
1. Edge Functionsが正しくデプロイされているか
   ```bash
   npx supabase functions list
   ```

2. Supabaseの環境変数が設定されているか
   ```bash
   supabase secrets list
   ```

3. Vercelの環境変数が正しく設定されているか
   - Vercel Dashboard > Settings > Environment Variables

4. Edge Functionsのログを確認
   - Supabase Dashboard > Edge Functions > 各関数 > Logs

## ログの確認

### Supabase Edge Functionsのログ

**リアルタイムログ:**
```bash
npx supabase functions logs generate-media-recommendations --tail
```

**Supabase Dashboard:**
1. https://app.supabase.com/project/rmyvlbedxurypaujbspq にアクセス
2. Edge Functions > 関数名 > Logs

### Vercelのログ

1. Vercel Dashboard > Deployments
2. デプロイメントをクリック
3. 「Functions」タブまたは「Runtime Logs」タブ

## 本番環境の監視

### Supabaseの使用量

https://app.supabase.com/project/rmyvlbedxurypaujbspq/settings/billing

- Edge Functions実行回数
- データベース使用量
- 帯域幅

### Anthropic APIの使用量

https://console.anthropic.com/settings/usage

- トークン使用量
- リクエスト数
- コスト

### Vercelの使用量

https://vercel.com/dashboard/usage

- ビルド時間
- 帯域幅
- Edge Functions実行時間

## セキュリティのベストプラクティス

1. **APIキーの管理**
   - `.env` ファイルは絶対にGitにコミットしない
   - APIキーを定期的にローテーション

2. **Supabase RLS（Row Level Security）**
   - すべてのテーブルでRLSが有効になっていることを確認
   - ユーザーは自分のデータのみアクセス可能

3. **環境変数**
   - `VITE_` プレフィックスの変数はクライアント側で公開される
   - サーバーサイドのシークレット（Anthropic API Key）はSupabaseで管理

## 継続的デプロイメント

Vercelは自動的にGitHubと連携しています：

1. `main` ブランチへのプッシュ → 本番環境への自動デプロイ
2. その他のブランチへのプッシュ → プレビュー環境への自動デプロイ

Edge Functionsの更新：
```bash
# コードを更新
git add .
git commit -m "Update Edge Functions"
git push

# Edge Functionsを再デプロイ
./scripts/deploy-functions.sh
```

## サポート

問題が発生した場合：
1. このドキュメントのトラブルシューティングセクションを確認
2. BACKEND_README.md の詳細ドキュメントを確認
3. Supabase/Vercelのログを確認
4. GitHub Issuesで報告

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Project Dashboard](https://lovable.dev/projects/a01ccc5d-48cc-4c95-9aa7-4d9a5a8867d6)

## チェックリスト

デプロイ完了後、以下を確認してください：

- [ ] Anthropic APIキーを取得済み
- [ ] Supabase CLIをインストール済み
- [ ] Supabaseにログイン済み
- [ ] プロジェクトをリンク済み
- [ ] Anthropic APIキーをSupabaseに設定済み
- [ ] Edge Functionsをデプロイ済み（3つすべて）
- [ ] VercelにSupabase環境変数を設定済み（3つすべて）
- [ ] Vercelで再デプロイ済み
- [ ] https://file-to-frame-craft.vercel.app/ が正常に表示される
- [ ] https://file-to-frame-craft.vercel.app/ai-demo で全AI機能が動作する
- [ ] ブラウザのコンソールにエラーが表示されない
- [ ] Supabase Edge Functionsのログにエラーがない

すべてのチェックが完了したら、デプロイ成功です！🎉
