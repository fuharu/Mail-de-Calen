from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from database import get_db, create_tables
from models import Todo as TodoModel

router = APIRouter()

# データベーステーブルを作成
create_tables()

class TodoCreate(BaseModel):
    title: str
    completed: bool = False
    due_date: Optional[datetime] = None
    memo: Optional[str] = None

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None
    memo: Optional[str] = None

class TodoResponse(BaseModel):
    id: int
    title: str
    completed: bool
    due_date: Optional[datetime] = None
    memo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("/")
async def get_todos(db: Session = Depends(get_db)):
    """ToDoリストを取得"""
    todos = db.query(TodoModel).all()
    
    # データベースが空の場合は初期データを作成
    if not todos:
        from datetime import datetime, timedelta
        today = datetime.now()
        
        initial_todos = [
            TodoModel(
                title="レポート作成",
                completed=False,
                due_date=today + timedelta(days=1),
                memo="月次レポートの作成が必要"
            ),
            TodoModel(
                title="資料レビュー",
                completed=True,
                due_date=today + timedelta(days=2),
                memo="プロジェクト資料の最終確認"
            ),
            TodoModel(
                title="プレゼン準備",
                completed=False,
                due_date=today + timedelta(days=4),
                memo="来週の会議用プレゼン資料"
            ),
            TodoModel(
                title="会議資料作成",
                completed=False,
                due_date=today + timedelta(days=5),
                memo="チーム会議のアジェンダ作成"
            )
        ]
        
        for todo in initial_todos:
            db.add(todo)
        db.commit()
        
        # 再取得
        todos = db.query(TodoModel).all()
    
    return {"todos": todos}

@router.post("/", response_model=TodoResponse)
async def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    """新しいToDoを作成"""
    db_todo = TodoModel(**todo.dict())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    """ToDoを更新"""
    db_todo = db.query(TodoModel).filter(TodoModel.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    update_data = todo.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_todo, field, value)
    
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.delete("/{todo_id}")
async def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """ToDoを削除"""
    db_todo = db.query(TodoModel).filter(TodoModel.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted", "todo_id": todo_id}

@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
async def toggle_todo_completion(todo_id: int, db: Session = Depends(get_db)):
    """ToDoの完了状態を切り替え"""
    db_todo = db.query(TodoModel).filter(TodoModel.id == todo_id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    db_todo.completed = not db_todo.completed
    db.commit()
    db.refresh(db_todo)
    return db_todo
