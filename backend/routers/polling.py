from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

@router.post("/start")
async def start_polling():
    """メールポーリング開始"""
    return {"message": "Polling started"}

@router.post("/stop")
async def stop_polling():
    """メールポーリング停止"""
    return {"message": "Polling stopped"}

@router.get("/status")
async def get_polling_status():
    """ポーリング状態取得"""
    return {"status": "stopped", "message": "Polling is not active"}
