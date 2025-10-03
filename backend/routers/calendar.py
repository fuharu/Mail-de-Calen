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
    # モックデータ
    mock_events = [
        {
            "id": "event_1",
            "title": "会議",
            "start": "2024-10-03T10:00:00Z",
            "end": "2024-10-03T11:00:00Z",
            "description": "チーム会議"
        },
        {
            "id": "event_2",
            "title": "プロジェクトレビュー", 
            "start": "2024-10-03T14:00:00Z",
            "end": "2024-10-03T15:00:00Z",
            "description": "プロジェクト進捗のレビュー"
        }
    ]
    return {"events": mock_events}

@router.post("/events")
async def create_event(event: CalendarEvent):
    """新しいイベントを作成"""
    return {"message": "Event created", "event": event}
