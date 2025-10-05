from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sys
import os

# プロジェクトルートをPythonパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService

router = APIRouter()

class Todo(BaseModel):
    id: str
    title: str
    completed: bool = False
    due_date: Optional[datetime] = None

@router.get("/")
async def get_todos():
    """ToDoリストを取得"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # Firebaseからデータを取得
        firebase_service = FirebaseService()
        todos = firebase_service.get_user_todos(user_email)
        
        # データ形式を統一
        formatted_todos = []
        for todo in todos:
            formatted_todo = {
                "id": todo.get("id", ""),
                "title": todo.get("title", ""),
                "completed": todo.get("completed", False),
                "due_date": todo.get("due_date", ""),
                "description": todo.get("description", ""),
                "priority": todo.get("priority", "medium"),
                "status": todo.get("status", "pending")
            }
            formatted_todos.append(formatted_todo)
        
        return {"todos": formatted_todos}
        
    except Exception as e:
        print(f"ToDo取得エラー: {e}")
        # エラー時は空のリストを返す
        return {"todos": []}

@router.post("/")
async def create_todo(todo: Todo):
    """新しいToDoを作成"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # Firebaseにデータを保存
        firebase_service = FirebaseService()
        todo_data = {
            "title": todo.title,
            "completed": todo.completed,
            "due_date": todo.due_date.isoformat() if todo.due_date else None,
            "description": getattr(todo, 'description', ''),
            "priority": "medium",
            "status": "pending"
        }
        
        todo_id = firebase_service.create_todo(user_email, todo_data)
        
        if todo_id:
            return {"message": "Todo created successfully", "todo_id": todo_id, "todo": todo}
        else:
            raise HTTPException(status_code=500, detail="ToDoの作成に失敗しました")
            
    except Exception as e:
        print(f"ToDo作成エラー: {e}")
        raise HTTPException(status_code=500, detail=f"ToDo作成中にエラーが発生しました: {str(e)}")
