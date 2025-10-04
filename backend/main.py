from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

# ルーターのインポート（パッケージ相対インポート）
from routers import auth, email, calendar, todos, candidates, oauth, polling

app = FastAPI(
    title="Mail de Calen API",
    description="メール解析とカレンダー管理API",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React開発サーバー
        "http://localhost:3001",  # Next.js開発サーバー（ポート3001）
        "http://localhost:3002",  # Next.js開発サーバー（ポート3002）
        "https://localhost:3000",  # HTTPS開発サーバー
        "https://localhost:3001",  # HTTPS開発サーバー（ポート3001）
        "https://localhost:3002",  # HTTPS開発サーバー（ポート3002）
        "http://100.122.163.76:3000",  # Tailscale経由アクセス
        "http://100.122.163.76:3001",  # Tailscale経由アクセス（ポート3001）
        "http://100.122.163.76:3002",  # Tailscale経由アクセス（ポート3002）
        "https://100.122.163.76:3000",  # Tailscale経由HTTPSアクセス
        "https://100.122.163.76:3001",  # Tailscale経由HTTPSアクセス（ポート3001）
        "https://100.122.163.76:3002",  # Tailscale経由HTTPSアクセス（ポート3002）
        "http://127.0.0.1:3000",  # ローカルアクセス
        "http://127.0.0.1:3001",  # ローカルアクセス（ポート3001）
        "http://127.0.0.1:3002",  # ローカルアクセス（ポート3002）
        "https://127.0.0.1:3000",  # ローカルHTTPSアクセス
        "https://127.0.0.1:3001",  # ローカルHTTPSアクセス（ポート3001）
        "https://127.0.0.1:3002",  # ローカルHTTPSアクセス（ポート3002）
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# セキュリティ設定
security = HTTPBearer()

# ルーターの登録
app.include_router(auth.router, prefix="/api/auth", tags=["認証"])
app.include_router(email.router, prefix="/api/email", tags=["メール"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["カレンダー"])
app.include_router(todos.router, prefix="/api/todos", tags=["ToDo"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["候補"])
app.include_router(oauth.router, prefix="/api/oauth", tags=["OAuth"])
app.include_router(polling.router, prefix="/api/polling", tags=["ポーリング"])

@app.get("/")
async def root():
    return {"message": "Mail de Calen API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
