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
    # モックデータ
    mock_todos = [
        {
            "id": "todo_1",
            "title": "レポート作成",
            "completed": False,
            "due_date": "2024-10-05T17:00:00Z"
        },
        {
            "id": "todo_2",
            "title": "資料レビュー",
            "completed": True,
            "due_date": "2024-10-04T12:00:00Z"
        }
    ]
    return {"todos": mock_todos}

@router.post("/")
async def create_todo(todo: Todo):
    """新しいToDoを作成"""
    return {"message": "Todo created", "todo": todo}
