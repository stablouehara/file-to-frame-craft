# File-to-Frame-Craft

AI駆動型の採用ダッシュボード - 日本の採用担当者向けに最適化された求人管理・分析ツール

## プロジェクト概要

File-to-Frame-Craftは、日本の採用担当者やHR部門向けのAIパワードダッシュボードです。求人の作成から最適な媒体への掲載、パフォーマンスの追跡まで、採用活動全体をサポートします。

### 主な機能

- **AI求人媒体推薦** - Indeed、Wantedly、ビズリーチなど、求人に最適な媒体を自動推薦
- **AI広告コピー生成** - 各媒体向けに最適化された広告文を自動生成
- **採用パフォーマンス分析** - 応募数、採用数、CPA等の指標を可視化
- **AIインサイト** - データを分析して改善提案を自動生成
- **ナレッジベース** - 成功事例やテンプレートを蓄積・活用

## Project info

**URL**: https://lovable.dev/projects/a01ccc5d-48cc-4c95-9aa7-4d9a5a8867d6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a01ccc5d-48cc-4c95-9aa7-4d9a5a8867d6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

### フロントエンド
- **Vite** - ビルドツール
- **TypeScript** - 型安全なJavaScript
- **React 18** - UIライブラリ
- **shadcn-ui** - UIコンポーネント
- **Tailwind CSS** - スタイリング
- **Recharts** - データ可視化
- **React Query** - データフェッチング

### バックエンド
- **Supabase** - データベース、認証、Edge Functions
- **PostgreSQL** - リレーショナルデータベース
- **Supabase Edge Functions** - サーバーレスAPI（Deno）
- **Anthropic Claude API** - AI推薦・生成機能

## バックエンドAPIのセットアップ

このプロジェクトには、AI機能を提供するバックエンドAPIが含まれています。

### クイックスタート

1. **Anthropic APIキーを取得**
   ```bash
   # https://console.anthropic.com/ でAPIキーを取得
   ```

2. **環境変数を設定**
   ```bash
   # .envファイルに追加
   ANTHROPIC_API_KEY="your-api-key-here"
   ```

3. **Supabase CLIをインストール**
   ```bash
   npm install -g supabase
   ```

4. **Edge Functionsをデプロイ**
   ```bash
   supabase link --project-ref rmyvlbedxurypaujbspq
   supabase secrets set ANTHROPIC_API_KEY=your-api-key-here
   supabase functions deploy
   ```

### AI機能のテスト

AI機能をテストするには：
```bash
npm run dev
```

ブラウザで `http://localhost:8080/ai-demo` にアクセス

詳細なセットアップ手順は以下を参照：
- [バックエンドAPI ドキュメント](./BACKEND_README.md)
- [デプロイメントガイド](./DEPLOYMENT.md)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a01ccc5d-48cc-4c95-9aa7-4d9a5a8867d6) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
