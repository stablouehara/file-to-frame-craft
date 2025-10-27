# バックエンドAPI ドキュメント

このドキュメントでは、File-to-Frame-CraftのバックエンドAPIについて説明します。

## 概要

バックエンドは**Supabase Edge Functions**を使用して実装されており、以下のAI機能を提供します：

1. **メディア推薦生成** - 求人に最適な求人媒体を推薦
2. **広告コピー生成** - 各媒体向けの最適化された広告文を生成
3. **最適化インサイト生成** - パフォーマンスデータを分析して改善提案を提供

## セットアップ

### 1. Anthropic APIキーの取得

1. [Anthropic Console](https://console.anthropic.com/)にアクセス
2. アカウントを作成またはログイン
3. API Keysセクションで新しいAPIキーを作成
4. APIキーをコピー

### 2. 環境変数の設定

`.env`ファイルに以下を設定：

```bash
ANTHROPIC_API_KEY="your-actual-anthropic-api-key-here"
```

### 3. Supabase CLIのインストール

```bash
npm install -g supabase
```

### 4. Supabaseプロジェクトのリンク

```bash
supabase link --project-ref rmyvlbedxurypaujbspq
```

### 5. Edge Functionsのデプロイ

```bash
# すべての関数をデプロイ
supabase functions deploy generate-media-recommendations
supabase functions deploy generate-ad-copy
supabase functions deploy generate-insights

# または、一括デプロイ
supabase functions deploy
```

### 6. Supabaseに環境変数を設定

```bash
supabase secrets set ANTHROPIC_API_KEY=your-actual-anthropic-api-key-here
```

## API エンドポイント

### 1. メディア推薦生成

**エンドポイント:** `POST /functions/v1/generate-media-recommendations`

**説明:** 求人情報を分析し、最適な求人媒体（Indeed、Wantedly、ビズリーチなど）を推薦します。

**リクエスト:**
```json
{
  "job_posting_id": "uuid-of-job-posting"
}
```

**レスポンス:**
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "uuid",
      "job_posting_id": "uuid",
      "media_name": "Indeed",
      "ranking": 1,
      "reason": "幅広い職種をカバーし、応募者数が多い傾向",
      "estimated_reach": 5000,
      "estimated_applications": 50,
      "estimated_cost": 100000,
      "estimated_cpa": 2000
    }
  ]
}
```

**使用例（React）:**
```typescript
import { useMediaRecommendations } from '@/hooks/useAIRecommendations';

function MyComponent() {
  const { generateRecommendations, loading } = useMediaRecommendations();

  const handleGenerate = async () => {
    const recommendations = await generateRecommendations('job-posting-id');
    console.log(recommendations);
  };
}
```

---

### 2. 広告コピー生成

**エンドポイント:** `POST /functions/v1/generate-ad-copy`

**説明:** 指定された求人媒体向けに最適化された広告コピーを複数バリエーション生成します。

**リクエスト:**
```json
{
  "job_posting_id": "uuid-of-job-posting",
  "media_name": "Indeed",
  "num_variants": 3
}
```

**レスポンス:**
```json
{
  "success": true,
  "ad_copies": [
    {
      "id": "uuid",
      "job_posting_id": "uuid",
      "media_name": "Indeed",
      "title": "【未経験歓迎】Webエンジニア募集 | 年収500万〜",
      "body": "成長中のITベンチャーでWebエンジニアを募集...",
      "keywords": ["未経験歓迎", "Web開発", "リモート可"],
      "version": 1,
      "is_selected": false
    }
  ]
}
```

**使用例（React）:**
```typescript
import { useAdCopyGeneration } from '@/hooks/useAIRecommendations';

function MyComponent() {
  const { generateAdCopy, loading } = useAdCopyGeneration();

  const handleGenerate = async () => {
    const adCopies = await generateAdCopy('job-posting-id', 'Indeed', 3);
    console.log(adCopies);
  };
}
```

---

### 3. 最適化インサイト生成

**エンドポイント:** `POST /functions/v1/generate-insights`

**説明:** ユーザーの採用データ全体を分析し、改善提案やアラートを生成します。

**リクエスト:**
```json
{}
```

**レスポンス:**
```json
{
  "success": true,
  "insights": [
    {
      "type": "success",
      "title": "Wantedlyの応募率が向上中",
      "description": "先月比+25%の応募数を記録しています",
      "action": "成功パターンを他の媒体にも適用しましょう",
      "priority": 8
    },
    {
      "type": "warning",
      "title": "営業職の応募率が低下",
      "description": "過去30日で応募率が12%から8%に低下",
      "action": "求人内容の見直しや待遇改善を検討してください",
      "priority": 7
    }
  ],
  "stats": {
    "total_job_postings": 12,
    "active_job_postings": 8,
    "total_applications": 148,
    "total_hires": 9,
    "total_cost": 720000,
    "avg_cpa": 4865,
    "conversion_rate": "6.1"
  },
  "media_performance": {
    "Indeed": {
      "applications": 65,
      "cost": 300000,
      "hires": 4,
      "impressions": 12000,
      "cpa": 4615,
      "ctr": "0.54"
    }
  }
}
```

**使用例（React）:**
```typescript
import { useInsights } from '@/hooks/useAIRecommendations';

function MyComponent() {
  const { generateInsights, loading } = useInsights();

  const handleGenerate = async () => {
    const result = await generateInsights();
    console.log(result.insights);
    console.log(result.stats);
  };
}
```

## データベーススキーマ

### media_recommendations テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | 主キー |
| job_posting_id | uuid | 求人ID（外部キー） |
| media_name | varchar | 媒体名 |
| ranking | integer | ランキング順位 |
| reason | text | 推薦理由 |
| estimated_reach | integer | 推定リーチ数 |
| estimated_cost | integer | 推定コスト（円） |
| estimated_applications | integer | 推定応募数 |
| estimated_cpa | integer | 推定CPA（円） |

### ad_copies テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | 主キー |
| job_posting_id | uuid | 求人ID（外部キー） |
| media_name | varchar | 媒体名 |
| title | varchar | 広告タイトル |
| body | text | 広告本文 |
| keywords | varchar[] | キーワード配列 |
| version | integer | バージョン番号 |
| is_selected | boolean | 選択済みフラグ |

## トラブルシューティング

### エラー: "ANTHROPIC_API_KEY is not set"

**原因:** Anthropic APIキーが設定されていない

**解決方法:**
```bash
supabase secrets set ANTHROPIC_API_KEY=your-actual-key
```

### エラー: "Unauthorized"

**原因:** 認証トークンが無効またはセッションが切れている

**解決方法:**
- フロントエンドで再ログイン
- Authorizationヘッダーが正しく送信されているか確認

### エラー: "Failed to parse AI response"

**原因:** Claude APIからのレスポンスがJSON形式でない

**解決方法:**
- APIキーが有効か確認
- Claude APIのステータスを確認
- エラーログを確認してレスポンス内容を確認

## パフォーマンス最適化

### レート制限

Anthropic Claude APIには以下のレート制限があります：
- RPM (Requests Per Minute): プランによる
- TPM (Tokens Per Minute): プランによる

大量のリクエストを送信する場合は、適切なレート制限とリトライロジックを実装してください。

### キャッシング

頻繁に使用される推薦結果は、データベースに保存され、再利用できます：

```typescript
// 既存の推薦を取得
const { getRecommendations } = useMediaRecommendations();
const existingRecs = await getRecommendations(jobPostingId);

// 推薦が存在しない場合のみ生成
if (existingRecs.length === 0) {
  await generateRecommendations(jobPostingId);
}
```

## セキュリティ

### Row Level Security (RLS)

すべてのテーブルにRLSポリシーが適用されており、ユーザーは自分のデータにのみアクセスできます。

### APIキーの管理

- `.env`ファイルは`.gitignore`に含めてください
- 本番環境ではSupabaseのSecretsを使用
- APIキーを定期的にローテーション

## ローカル開発

```bash
# Supabaseをローカルで起動
supabase start

# Edge Functionsをローカルで実行
supabase functions serve generate-media-recommendations --env-file .env

# テストリクエストを送信
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-media-recommendations' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"job_posting_id":"test-uuid"}'
```

## デプロイメント

### 本番環境へのデプロイ

```bash
# 1. 関数をデプロイ
supabase functions deploy

# 2. 環境変数を設定
supabase secrets set ANTHROPIC_API_KEY=your-production-key

# 3. 動作確認
# Supabase Dashboardでログを確認
```

## サポート

問題が発生した場合は、以下を確認してください：

1. Supabase Dashboard > Edge Functions > Logs
2. ブラウザの開発者ツール > Network タブ
3. `console.log`の出力

## 参考リンク

- [Supabase Edge Functions ドキュメント](https://supabase.com/docs/guides/functions)
- [Anthropic API ドキュメント](https://docs.anthropic.com/)
- [Deno ドキュメント](https://deno.land/manual)
