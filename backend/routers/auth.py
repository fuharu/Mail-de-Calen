from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    """ユーザーログイン"""
    return {"message": "Login endpoint", "email": request.email}

@router.post("/logout")
async def logout():
    """ユーザーログアウト"""
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_current_user():
    """現在のユーザー情報取得"""
    return {"message": "Current user endpoint"}
