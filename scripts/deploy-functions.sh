#!/bin/bash

# Edge Functions デプロイスクリプト
# このスクリプトは、Supabase Edge Functionsをデプロイします

set -e

echo "🚀 Supabase Edge Functions デプロイスクリプト"
echo "=============================================="

# Supabase CLIがインストールされているか確認
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLIがインストールされていません"
    echo ""
    echo "インストール手順:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  Linux: https://github.com/supabase/cli#install-the-cli"
    echo "  Windows: scoop install supabase"
    exit 1
fi

echo "✅ Supabase CLI が見つかりました"
echo ""

# プロジェクトIDの確認
PROJECT_ID="rmyvlbedxurypaujbspq"
echo "📋 プロジェクトID: $PROJECT_ID"
echo ""

# ログイン状態の確認
echo "🔐 Supabaseログイン状態を確認中..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Supabaseにログインしていません"
    echo ""
    echo "以下のコマンドでログインしてください:"
    echo "  supabase login"
    exit 1
fi

echo "✅ ログイン済み"
echo ""

# プロジェクトのリンク状態を確認
if [ ! -f ".git/supabase-project-ref" ]; then
    echo "🔗 プロジェクトをリンク中..."
    supabase link --project-ref $PROJECT_ID
fi

# 環境変数の確認
echo "🔍 環境変数を確認中..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY が設定されていません"
    echo ""
    read -p "Anthropic API Key を入力してください: " ANTHROPIC_API_KEY

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo "❌ APIキーが入力されませんでした"
        exit 1
    fi

    echo "📝 Supabaseに環境変数を設定中..."
    supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
fi

echo "✅ 環境変数の確認完了"
echo ""

# Edge Functionsのデプロイ
echo "📦 Edge Functions をデプロイ中..."
echo ""

FUNCTIONS=(
    "generate-media-recommendations"
    "generate-ad-copy"
    "generate-insights"
)

for func in "${FUNCTIONS[@]}"; do
    echo "  → $func をデプロイ中..."
    if npx supabase functions deploy "$func" --no-verify-jwt; then
        echo "  ✅ $func デプロイ完了"
    else
        echo "  ❌ $func のデプロイに失敗しました"
        exit 1
    fi
    echo ""
done

echo "=============================================="
echo "✨ すべてのEdge Functionsのデプロイが完了しました！"
echo ""
echo "次のステップ:"
echo "1. Vercelの環境変数を設定"
echo "2. https://file-to-frame-craft.vercel.app/ にアクセスして動作確認"
echo ""
echo "詳細は VERCEL_SETUP.md を参照してください"
