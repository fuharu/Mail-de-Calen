from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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
    # モックデータ（現在の日付に合わせて更新）
    from datetime import datetime, timedelta
    today = datetime.now()
    
    mock_events = [
        {
            "id": "event_1",
            "title": "会議",
            "start": (today + timedelta(days=1)).strftime("%Y-%m-%dT10:00:00Z"),
            "end": (today + timedelta(days=1)).strftime("%Y-%m-%dT11:00:00Z"),
            "description": "チーム会議"
        },
        {
            "id": "event_2",
            "title": "プロジェクトレビュー", 
            "start": (today + timedelta(days=2)).strftime("%Y-%m-%dT14:00:00Z"),
            "end": (today + timedelta(days=2)).strftime("%Y-%m-%dT15:00:00Z"),
            "description": "プロジェクト進捗のレビュー"
        },
        {
            "id": "event_3",
            "title": "打ち合わせ",
            "start": (today + timedelta(days=3)).strftime("%Y-%m-%dT09:00:00Z"),
            "end": (today + timedelta(days=3)).strftime("%Y-%m-%dT10:00:00Z"),
            "description": "クライアントとの打ち合わせ"
        }
    ]
    return {"events": mock_events}

@router.post("/events")
async def create_event(event: CalendarEvent):
    """新しいイベントを作成"""
    return {"message": "Event created", "event": event}
