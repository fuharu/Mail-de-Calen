from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

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
    return {"candidates": []}

@router.get("/todos")
async def get_todo_candidates():
    """ToDo候補を取得"""
    return {"candidates": []}

@router.post("/events/{candidate_id}/approve")
async def approve_event_candidate(candidate_id: str):
    """イベント候補を承認"""
    return {"message": f"Event candidate {candidate_id} approved"}

@router.post("/todos/{candidate_id}/approve")
async def approve_todo_candidate(candidate_id: str):
    """ToDo候補を承認"""
    return {"message": f"Todo candidate {candidate_id} approved"}
