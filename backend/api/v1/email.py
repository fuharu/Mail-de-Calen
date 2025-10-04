from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.firebase_email_service import FirebaseEmailService

router = APIRouter(
    prefix="/api/v1/email",
    tags=["email"],
    responses={404: {"description": "Not found"}},
)


class Email(BaseModel):
    id: str
    subject: str
    sender: str
    date: str
    body: str


@router.get("/recent")
async def get_recent_emails(limit: int = 10):
    """最近のメールを取得"""
    # モックデータ
    mock_emails = [
        {
            "id": "email_1",
            "subject": "会議の件",
            "sender": "manager@company.com",
            "date": "2024-10-03T10:00:00Z",
            "body": "明日の会議についてお知らせします。",
        },
        {
            "id": "email_2",
            "subject": "プロジェクト報告",
            "sender": "teammate@company.com",
            "date": "2024-10-03T09:30:00Z",
            "body": "プロジェクトの進捗報告です。",
        },
    ]
    email_service = FirebaseEmailService()
    emails = email_service.get_recent_emails(user_id="test_user", limit=limit)

    return {"emails": mock_emails[:limit]}


@router.post("/analyze")
async def analyze_email(email_id: str):
    """メールを解析"""
    return {"message": f"Analyzing email {email_id}"}
