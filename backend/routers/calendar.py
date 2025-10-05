from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from database import get_db, create_tables
from models import CalendarEvent as CalendarEventModel

router = APIRouter()

# データベーステーブルを作成
create_tables()

class CalendarEventCreate(BaseModel):
    title: str
    start: datetime
    end: datetime
    description: Optional[str] = None
    completed: bool = False

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class CalendarEventResponse(BaseModel):
    id: int
    title: str
    start: datetime
    end: datetime
    description: Optional[str] = None
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("/events")
async def get_events(db: Session = Depends(get_db)):
    """カレンダーイベントを取得"""
    events = db.query(CalendarEventModel).all()
    
    # データベースが空の場合は初期データを作成
    if not events:
        from datetime import datetime, timedelta
        today = datetime.now()
        
        initial_events = [
            CalendarEventModel(
                title="会議",
                start=today.replace(hour=9, minute=0, second=0, microsecond=0),
                end=today.replace(hour=11, minute=0, second=0, microsecond=0),
                description="チーム会議",
                completed=False
            ),
            CalendarEventModel(
                title="プロジェクトレビュー",
                start=(today + timedelta(days=1)).replace(hour=14, minute=0, second=0, microsecond=0),
                end=(today + timedelta(days=1)).replace(hour=16, minute=0, second=0, microsecond=0),
                description="プロジェクト進捗のレビュー",
                completed=True
            ),
            CalendarEventModel(
                title="打ち合わせ",
                start=(today + timedelta(days=2)).replace(hour=10, minute=0, second=0, microsecond=0),
                end=(today + timedelta(days=2)).replace(hour=12, minute=0, second=0, microsecond=0),
                description="クライアントとの打ち合わせ",
                completed=False
            )
        ]
        
        for event in initial_events:
            db.add(event)
        db.commit()
        
        # 再取得
        events = db.query(CalendarEventModel).all()
    
    # イベントデータを手動でUTC時間として処理
    processed_events = []
    for event in events:
        event_dict = {
            "id": event.id,
            "title": event.title,
            "start": event.start.isoformat() + 'Z' if event.start.tzinfo is None else event.start.isoformat(),
            "end": event.end.isoformat() + 'Z' if event.end.tzinfo is None else event.end.isoformat(),
            "description": event.description,
            "completed": event.completed,
            "created_at": event.created_at.isoformat() + 'Z' if event.created_at.tzinfo is None else event.created_at.isoformat(),
            "updated_at": event.updated_at.isoformat() + 'Z' if event.updated_at.tzinfo is None else event.updated_at.isoformat(),
        }
        processed_events.append(event_dict)
    
    return {"events": processed_events}

@router.post("/events", response_model=CalendarEventResponse)
async def create_event(event: CalendarEventCreate, db: Session = Depends(get_db)):
    """新しいイベントを作成"""
    db_event = CalendarEventModel(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.put("/events/{event_id}", response_model=CalendarEventResponse)
async def update_event(event_id: int, event: CalendarEventUpdate, db: Session = Depends(get_db)):
    """イベントを更新"""
    db_event = db.query(CalendarEventModel).filter(CalendarEventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.patch("/events/{event_id}/toggle", response_model=CalendarEventResponse)
async def toggle_event_completion(event_id: int, db: Session = Depends(get_db)):
    """イベントの完了状態を切り替え"""
    db_event = db.query(CalendarEventModel).filter(CalendarEventModel.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db_event.completed = not db_event.completed
    db.commit()
    db.refresh(db_event)
    return db_event
