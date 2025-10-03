from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

@router.get("/user-info/{email}")
async def get_user_info(email: str):
    """OAuthユーザー情報取得"""
    return {"email": email, "name": "Test User"}

@router.get("/callback")
async def oauth_callback(code: str = None):
    """OAuthコールバック"""
    return {"message": "OAuth callback", "code": code}
