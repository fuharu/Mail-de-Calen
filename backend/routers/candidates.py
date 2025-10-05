from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# プロジェクトルートをPythonパスに追加
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService

router = APIRouter()

class Candidate(BaseModel):
    id: str
    type: str  # "event" or "todo"
    title: str
    description: str
    status: str = "pending"  # "pending", "approved", "rejected"

@router.get("/events")
async def get_event_candidates():
    """イベント候補を取得"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # Firebaseからデータを取得
        firebase_service = FirebaseService()
        candidates = firebase_service.get_user_event_candidates(user_email)
        
        # データ形式を統一
        formatted_candidates = []
        for candidate in candidates:
            formatted_candidate = {
                "id": candidate.get("id", ""),
                "type": "event",
                "title": candidate.get("title", ""),
                "description": candidate.get("description", ""),
                "status": candidate.get("status", "pending"),
                "start": candidate.get("start", ""),
                "end": candidate.get("end", ""),
                "location": candidate.get("location", ""),
                "source": candidate.get("source", "email")
            }
            formatted_candidates.append(formatted_candidate)
        
        return {"candidates": formatted_candidates}
        
    except Exception as e:
        print(f"イベント候補取得エラー: {e}")
        return {"candidates": []}

@router.get("/todos")
async def get_todo_candidates():
    """ToDo候補を取得"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # Firebaseからデータを取得
        firebase_service = FirebaseService()
        candidates = firebase_service.get_user_todo_candidates(user_email)
        
        # データ形式を統一
        formatted_candidates = []
        for candidate in candidates:
            formatted_candidate = {
                "id": candidate.get("id", ""),
                "type": "todo",
                "title": candidate.get("title", ""),
                "description": candidate.get("description", ""),
                "status": candidate.get("status", "pending"),
                "due_date": candidate.get("due_date", ""),
                "priority": candidate.get("priority", "medium"),
                "source": candidate.get("source", "email")
            }
            formatted_candidates.append(formatted_candidate)
        
        return {"candidates": formatted_candidates}
        
    except Exception as e:
        print(f"ToDo候補取得エラー: {e}")
        return {"candidates": []}

@router.post("/events/{candidate_id}/approve")
async def approve_event_candidate(candidate_id: str):
    """イベント候補を承認"""
    return {"message": f"Event candidate {candidate_id} approved"}

@router.post("/todos/{candidate_id}/approve")
async def approve_todo_candidate(candidate_id: str):
    """ToDo候補を承認"""
    return {"message": f"Todo candidate {candidate_id} approved"}
