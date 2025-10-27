# クイックスタートガイド

https://file-to-frame-craft.vercel.app/ でAI機能を動作させるための最短手順です。

## 🚀 5ステップで完了

### 1️⃣ Anthropic APIキーを取得（5分）

1. https://console.anthropic.com/ にアクセス
2. アカウント作成/ログイン
3. API Keysセクションで新しいキーを作成
4. キーをコピー（`sk-ant-api03-...`）

### 2️⃣ Supabase Edge Functionsをデプロイ（5分）

```bash
# Supabase CLIをインストール（macOS）
brew install supabase/tap/supabase

# または Linux/Windows: https://github.com/supabase/cli#install-the-cli

# ログイン
npx supabase login

# プロジェクトをリンク
npm run supabase:link

# APIキーを設定
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# デプロイ
npm run deploy:functions
```

### 3️⃣ Supabase Anon Keyを取得（1分）

1. https://app.supabase.com/project/rmyvlbedxurypaujbspq/settings/api にアクセス
2. 「anon public」キーをコピー

### 4️⃣ Vercel環境変数を設定（3分）

1. https://vercel.com/dashboard にアクセス
2. `file-to-frame-craft` プロジェクト → Settings → Environment Variables
3. 以下を追加：

```
VITE_SUPABASE_URL = https://rmyvlbedxurypaujbspq.supabase.co
VITE_SUPABASE_PROJECT_ID = rmyvlbedxurypaujbspq
VITE_SUPABASE_PUBLISHABLE_KEY = [ステップ3でコピーしたキー]
```

4. すべての環境（Production, Preview, Development）を選択
5. Save

### 5️⃣ Vercelで再デプロイ（2分）

1. Vercel Dashboard → Deployments
2. 最新のデプロイ → 「...」メニュー → Redeploy
3. 完了を待つ（1-2分）

## ✅ 動作確認

https://file-to-frame-craft.vercel.app/ai-demo にアクセスして、各AI機能をテスト：

- ✨ メディア推薦を生成
- 📝 広告コピーを生成
- 📊 インサイトを生成

## ❓ トラブルシューティング

### エラーが出る場合

1. **ブラウザのコンソールを確認** (F12)
2. **Supabaseのログを確認**: https://app.supabase.com/project/rmyvlbedxurypaujbspq/logs
3. **環境変数を再確認**: Vercel Settings → Environment Variables

### よくあるエラー

**"ANTHROPIC_API_KEY is not set"**
```bash
npx supabase secrets set ANTHROPIC_API_KEY=your-key
npm run supabase:deploy
```

**"Failed to fetch"**
- Vercelの環境変数を確認
- ブラウザのコンソールでエラー詳細を確認

**"Unauthorized"**
- `VITE_SUPABASE_PUBLISHABLE_KEY` が正しいか確認

## 📚 詳細ドキュメント

- **詳細なセットアップ手順**: [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- **バックエンドAPI仕様**: [BACKEND_README.md](./BACKEND_README.md)
- **デプロイメント詳細**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 💡 ヒント

- Anthropic APIキーは定期的にローテーションしましょう
- 本番環境の使用量をモニタリングしましょう：
  - Anthropic: https://console.anthropic.com/settings/usage
  - Supabase: https://app.supabase.com/project/rmyvlbedxurypaujbspq/settings/billing
  - Vercel: https://vercel.com/dashboard/usage

---

**所要時間**: 合計約16分

何か問題がある場合は、[VERCEL_SETUP.md](./VERCEL_SETUP.md) の詳細なトラブルシューティングセクションを参照してください。
