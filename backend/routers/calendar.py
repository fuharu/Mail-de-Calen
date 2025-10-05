from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sys
import os

# プロジェクトルートをPythonパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService

router = APIRouter()

class CalendarEvent(BaseModel):
    id: str
    title: str
    start: datetime
    end: datetime
    description: Optional[str] = None

@router.get("/events")
async def get_events():
    """カレンダーイベントを取得"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # Firebaseからデータを取得
        firebase_service = FirebaseService()
        events = firebase_service.get_user_events(user_email)
        
        # データ形式を統一
        formatted_events = []
        for event in events:
            formatted_event = {
                "id": event.get("id", ""),
                "title": event.get("title", ""),
                "start": event.get("start", ""),
                "end": event.get("end", ""),
                "description": event.get("description", ""),
                "location": event.get("location", ""),
                "status": event.get("status", "pending")
            }
            formatted_events.append(formatted_event)
        
        return {"events": formatted_events}
        
    except Exception as e:
        print(f"イベント取得エラー: {e}")
        # エラー時は空のリストを返す
        return {"events": []}

@router.post("/events")
async def create_event(event: CalendarEvent):
    """新しいイベントを作成"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # Firebaseにデータを保存
        firebase_service = FirebaseService()
        event_data = {
            "title": event.title,
            "start": event.start.isoformat(),
            "end": event.end.isoformat(),
            "description": event.description or "",
            "location": "",
            "status": "pending"
        }
        
        event_id = firebase_service.create_event(user_email, event_data)
        
        if event_id:
            return {"message": "Event created successfully", "event_id": event_id, "event": event}
        else:
            raise HTTPException(status_code=500, detail="イベントの作成に失敗しました")
            
    except Exception as e:
        print(f"イベント作成エラー: {e}")
        raise HTTPException(status_code=500, detail=f"イベント作成中にエラーが発生しました: {str(e)}")
