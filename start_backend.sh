#!/bin/bash

# バックエンドサーバー起動スクリプト

echo "🚀 Mail de Calen バックエンドサーバーを起動しています..."

# バックエンドディレクトリに移動
cd "$(dirname "$0")/backend"

# 既存のプロセスを停止
echo "📋 既存のプロセスを停止中..."
pkill -f "uvicorn main:app" || true
pkill -f "python.*main.py" || true

# 少し待機
sleep 2

# 必要な依存関係を確認
echo "📦 依存関係を確認中..."
python3 -c "import fastapi, uvicorn, firebase_admin; print('✅ 必要な依存関係がインストールされています')" || {
    echo "❌ 依存関係が不足しています。requirements.txtからインストールしてください。"
    exit 1
}

# 環境変数を確認
if [ ! -f ".env" ]; then
    echo "⚠️  .envファイルが見つかりません。"
fi

# サーバーを起動
echo "🌐 サーバーを起動中..."
echo "📍 URL: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/health"
echo ""
echo "サーバーを停止するには Ctrl+C を押してください"
echo ""

# uvicornでサーバーを起動
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
