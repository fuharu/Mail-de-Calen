from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class Todo(BaseModel):
    id: str
    title: str
    completed: bool = False
    due_date: Optional[datetime] = None

@router.get("/")
async def get_todos():
    """ToDoリストを取得"""
    # モックデータ（現在の日付に合わせて更新）
    from datetime import datetime, timedelta
    today = datetime.now()
    
    mock_todos = [
        {
            "id": "todo_1",
            "title": "レポート作成",
            "completed": False,
            "due_date": (today + timedelta(days=1)).strftime("%Y-%m-%dT17:00:00Z")
        },
        {
            "id": "todo_2",
            "title": "資料レビュー",
            "completed": True,
            "due_date": (today + timedelta(days=2)).strftime("%Y-%m-%dT12:00:00Z")
        },
        {
            "id": "todo_3",
            "title": "プレゼン準備",
            "completed": False,
            "due_date": (today + timedelta(days=4)).strftime("%Y-%m-%dT15:00:00Z")
        },
        {
            "id": "todo_4",
            "title": "会議資料作成",
            "completed": False,
            "due_date": (today + timedelta(days=5)).strftime("%Y-%m-%dT10:00:00Z")
        }
    ]
    return {"todos": mock_todos}

@router.post("/")
async def create_todo(todo: Todo):
    """新しいToDoを作成"""
    return {"message": "Todo created", "todo": todo}
