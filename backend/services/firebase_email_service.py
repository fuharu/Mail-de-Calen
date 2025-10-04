import os
from firebase_admin import firestore
from typing import List, Dict, Optional
from datetime import datetime, timedelta

class FirebaseEmailService:
    def __init__(self):
        self.db = firestore.client()
        self.emails_collection = "emails"
    
    def get_recent_emails(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Firebaseから最近のメールを取得"""
        try:
            # ユーザーのメールコレクションから取得
            emails_ref = self.db.collection(self.emails_collection)
            query = emails_ref.where('user_id', '==', user_id).order_by('date', direction=firestore.Query.DESCENDING).limit(limit)
            
            docs = query.stream()
            emails = []
            
            for doc in docs:
                email_data = doc.to_dict()
                email_data['id'] = doc.id
                emails.append(email_data)
            
            return emails
            
        except Exception as e:
            print(f"Firebase email fetch error: {e}")
            # エラー時はサンプルデータを返す
            return self._get_sample_emails()
    
    def search_emails(self, user_id: str, query: str, limit: int = 10) -> List[Dict]:
        """Firebaseからメールを検索"""
        try:
            emails_ref = self.db.collection(self.emails_collection)
            # 簡単な検索（件名と送信者で検索）
            emails = []
            
            # 件名で検索
            subject_query = emails_ref.where('user_id', '==', user_id).where('subject', '>=', query).where('subject', '<=', query + '\uf8ff').limit(limit)
            for doc in subject_query.stream():
                email_data = doc.to_dict()
                email_data['id'] = doc.id
                emails.append(email_data)
            
            # 送信者で検索
            sender_query = emails_ref.where('user_id', '==', user_id).where('sender', '>=', query).where('sender', '<=', query + '\uf8ff').limit(limit)
            for doc in sender_query.stream():
                email_data = doc.to_dict()
                email_data['id'] = doc.id
                if not any(e['id'] == doc.id for e in emails):  # 重複を避ける
                    emails.append(email_data)
            
            return emails[:limit]
            
        except Exception as e:
            print(f"Firebase email search error: {e}")
            return self._get_sample_emails()
    
    def get_email_by_id(self, user_id: str, email_id: str) -> Optional[Dict]:
        """IDでメールを取得"""
        try:
            doc_ref = self.db.collection(self.emails_collection).document(email_id)
            doc = doc_ref.get()
            
            if doc.exists:
                email_data = doc.to_dict()
                if email_data.get('user_id') == user_id:
                    email_data['id'] = doc.id
                    return email_data
            
            return None
            
        except Exception as e:
            print(f"Firebase email fetch by ID error: {e}")
            return None
    
    def add_sample_emails(self, user_id: str):
        """サンプルメールをFirebaseに追加"""
        try:
            sample_emails = self._get_sample_emails()
            
            for email in sample_emails:
                email['user_id'] = user_id
                email['created_at'] = firestore.SERVER_TIMESTAMP
                self.db.collection(self.emails_collection).add(email)
            
            print(f"✅ Added {len(sample_emails)} sample emails for user {user_id}")
            
        except Exception as e:
            print(f"Error adding sample emails: {e}")
    
    def _get_sample_emails(self) -> List[Dict]:
        """サンプルメールデータを返す"""
        return [
            {
                "subject": "会議の件",
                "sender": "manager@company.com",
                "date": "2024-10-03T10:00:00Z",
                "body": "明日の会議についてお知らせします。時間は午前10時からです。",
                "snippet": "明日の会議についてお知らせします。",
                "thread_id": "thread_1",
                "labels": ["INBOX", "IMPORTANT"]
            },
            {
                "subject": "プロジェクト報告",
                "sender": "teammate@company.com",
                "date": "2024-10-03T09:30:00Z",
                "body": "プロジェクトの進捗報告です。現在80%完了しています。",
                "snippet": "プロジェクトの進捗報告です。",
                "thread_id": "thread_2",
                "labels": ["INBOX"]
            },
            {
                "subject": "資料の確認依頼",
                "sender": "client@example.com",
                "date": "2024-10-03T08:15:00Z",
                "body": "先日お送りした資料の確認をお願いします。",
                "snippet": "先日お送りした資料の確認をお願いします。",
                "thread_id": "thread_3",
                "labels": ["INBOX", "UNREAD"]
            },
            {
                "subject": "システムメンテナンスのお知らせ",
                "sender": "system@company.com",
                "date": "2024-10-02T18:00:00Z",
                "body": "明日の夜間メンテナンスについてお知らせします。",
                "snippet": "明日の夜間メンテナンスについてお知らせします。",
                "thread_id": "thread_4",
                "labels": ["INBOX", "SYSTEM"]
            },
            {
                "subject": "週次レポート",
                "sender": "analytics@company.com",
                "date": "2024-10-02T17:30:00Z",
                "body": "今週の週次レポートをお送りします。",
                "snippet": "今週の週次レポートをお送りします。",
                "thread_id": "thread_5",
                "labels": ["INBOX", "REPORTS"]
            }
        ]
