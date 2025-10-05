"""
Firebase Firestore からデータを取得するサービス
"""

import firebase_admin
from firebase_admin import firestore
from typing import List, Dict, Optional, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class FirebaseService:
    """Firebase Firestore データベース操作サービス"""
    
    def __init__(self):
        """Firebaseサービスを初期化"""
        try:
            if not firebase_admin._apps:
                raise Exception("Firebase Admin SDK が初期化されていません")
            self.db = firestore.client()
        except Exception as e:
            logger.error(f"Firebase初期化エラー: {e}")
            raise
    
    def get_user_todos(self, user_email: str, limit: int = 50) -> List[Dict[str, Any]]:
        """ユーザーのToDoリストを取得"""
        try:
            todos_ref = self.db.collection('todos')
            query = todos_ref.where('user_id', '==', user_email).limit(limit)
            docs = query.stream()
            
            todos = []
            for doc in docs:
                todo_data = doc.to_dict()
                todo_data['id'] = doc.id
                todos.append(todo_data)
            
            logger.info(f"ToDo取得完了: {len(todos)}件")
            return todos
            
        except Exception as e:
            logger.error(f"ToDo取得エラー: {e}")
            return []
    
    def get_user_events(self, user_email: str, limit: int = 50) -> List[Dict[str, Any]]:
        """ユーザーのイベントを取得"""
        try:
            events_ref = self.db.collection('events')
            query = events_ref.where('user_id', '==', user_email).limit(limit)
            docs = query.stream()
            
            events = []
            for doc in docs:
                event_data = doc.to_dict()
                event_data['id'] = doc.id
                events.append(event_data)
            
            logger.info(f"イベント取得完了: {len(events)}件")
            return events
            
        except Exception as e:
            logger.error(f"イベント取得エラー: {e}")
            return []
    
    def get_user_todo_candidates(self, user_email: str, limit: int = 50) -> List[Dict[str, Any]]:
        """ユーザーのタスク候補を取得"""
        try:
            candidates_ref = self.db.collection('todo_candidates')
            query = candidates_ref.where('user_id', '==', user_email).limit(limit)
            docs = query.stream()
            
            candidates = []
            for doc in docs:
                candidate_data = doc.to_dict()
                candidate_data['id'] = doc.id
                candidates.append(candidate_data)
            
            logger.info(f"タスク候補取得完了: {len(candidates)}件")
            return candidates
            
        except Exception as e:
            logger.error(f"タスク候補取得エラー: {e}")
            return []
    
    def get_user_event_candidates(self, user_email: str, limit: int = 50) -> List[Dict[str, Any]]:
        """ユーザーのイベント候補を取得"""
        try:
            candidates_ref = self.db.collection('event_candidates')
            query = candidates_ref.where('user_id', '==', user_email).limit(limit)
            docs = query.stream()
            
            candidates = []
            for doc in docs:
                candidate_data = doc.to_dict()
                candidate_data['id'] = doc.id
                candidates.append(candidate_data)
            
            logger.info(f"イベント候補取得完了: {len(candidates)}件")
            return candidates
            
        except Exception as e:
            logger.error(f"イベント候補取得エラー: {e}")
            return []
    
    def get_user_analysis_history(self, user_email: str, limit: int = 20) -> List[Dict[str, Any]]:
        """ユーザーの解析履歴を取得"""
        try:
            # 解析履歴は email_analysis コレクションに保存されていると仮定
            history_ref = self.db.collection('email_analysis')
            query = history_ref.where('user_id', '==', user_email).order_by('analysis_date', direction=firestore.Query.DESCENDING).limit(limit)
            docs = query.stream()
            
            history = []
            for doc in docs:
                history_data = doc.to_dict()
                history_data['id'] = doc.id
                history.append(history_data)
            
            logger.info(f"解析履歴取得完了: {len(history)}件")
            return history
            
        except Exception as e:
            logger.error(f"解析履歴取得エラー: {e}")
            return []
    
    def create_todo(self, user_email: str, todo_data: Dict[str, Any]) -> Optional[str]:
        """新しいToDoを作成"""
        try:
            todo_data['user_id'] = user_email
            todo_data['created_at'] = firestore.SERVER_TIMESTAMP
            todo_data['updated_at'] = firestore.SERVER_TIMESTAMP
            
            doc_ref = self.db.collection('todos').add(todo_data)
            logger.info(f"ToDo作成完了: {doc_ref[1].id}")
            return doc_ref[1].id
            
        except Exception as e:
            logger.error(f"ToDo作成エラー: {e}")
            return None
    
    def create_event(self, user_email: str, event_data: Dict[str, Any]) -> Optional[str]:
        """新しいイベントを作成"""
        try:
            event_data['user_id'] = user_email
            event_data['created_at'] = firestore.SERVER_TIMESTAMP
            event_data['updated_at'] = firestore.SERVER_TIMESTAMP
            
            doc_ref = self.db.collection('events').add(event_data)
            logger.info(f"イベント作成完了: {doc_ref[1].id}")
            return doc_ref[1].id
            
        except Exception as e:
            logger.error(f"イベント作成エラー: {e}")
            return None
    
    def update_todo(self, todo_id: str, update_data: Dict[str, Any]) -> bool:
        """ToDoを更新"""
        try:
            update_data['updated_at'] = firestore.SERVER_TIMESTAMP
            self.db.collection('todos').document(todo_id).update(update_data)
            logger.info(f"ToDo更新完了: {todo_id}")
            return True
            
        except Exception as e:
            logger.error(f"ToDo更新エラー: {e}")
            return False
    
    def delete_todo(self, todo_id: str) -> bool:
        """ToDoを削除"""
        try:
            self.db.collection('todos').document(todo_id).delete()
            logger.info(f"ToDo削除完了: {todo_id}")
            return True
            
        except Exception as e:
            logger.error(f"ToDo削除エラー: {e}")
            return False
    
    def delete_event(self, event_id: str) -> bool:
        """イベントを削除"""
        try:
            self.db.collection('events').document(event_id).delete()
            logger.info(f"イベント削除完了: {event_id}")
            return True
            
        except Exception as e:
            logger.error(f"イベント削除エラー: {e}")
            return False
