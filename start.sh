#!/bin/bash

echo "Starting Mail de Calen..."

# バックエンドサーバーを起動
echo "Starting backend server..."
cd backend
python main.py &
BACKEND_PID=$!

# バックエンドの起動を待つ
echo "Waiting for backend to start..."
sleep 5

# フロントエンドサーバーを起動
echo "Starting frontend server..."
cd ..
npm start &
FRONTEND_PID=$!

echo "Both servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"

# プロセスの終了を待つ
wait $BACKEND_PID $FRONTEND_PID
