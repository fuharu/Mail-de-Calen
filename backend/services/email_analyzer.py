import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from .gemini_service import GeminiService
from .gmail_service import GmailService

class EmailAnalyzer:
    def __init__(self):
        """メール解析サービスを初期化"""
        self.gemini_service = GeminiService()
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Firebase Admin SDKを初期化"""
        try:
            if not firebase_admin._apps:
                cred_path = "credentials/firebase-service-account.json"
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                    firebase_admin.initialize_app(cred)
                else:
                    print("警告: Firebase サービスアカウントキーが見つかりません")
            
            self.db = firestore.client()
            
        except Exception as e:
            print(f"Firebase初期化エラー: {e}")
            self.db = None
    
    def analyze_email(self, user_email: str, email_id: str) -> Dict[str, Any]:
        """単一のメールを解析"""
        try:
            # Gmail API でメールを取得
            gmail_service = GmailService(user_email)
            if not gmail_service.authenticate():
                return {'error': 'Gmail認証に失敗しました'}
            
            # メール詳細を取得
            emails = gmail_service.search_emails(f"rfc822msgid:{email_id}", limit=1)
            if not emails:
                return {'error': 'メールが見つかりませんでした'}
            
            email_data = emails[0]
            
            # Gemini でメール内容を解析
            analysis_result = self.gemini_service.analyze_email_content(
                email_data['body'],
                email_data['sender'],
                email_data['subject']
            )
            
            # 解析結果をFirebaseに保存
            saved_items = self._save_analysis_results(user_email, analysis_result, email_data)
            
            return {
                'success': True,
                'analysis': analysis_result,
                'saved_items': saved_items,
                'email_info': {
                    'id': email_data['id'],
                    'subject': email_data['subject'],
                    'sender': email_data['sender'],
                    'date': email_data['date']
                }
            }
            
        except Exception as e:
            print(f"メール解析エラー: {e}")
            return {'error': f'メール解析中にエラーが発生しました: {str(e)}'}
    
    def analyze_recent_emails(self, user_email: str, limit: int = 10) -> Dict[str, Any]:
        """最近のメールを一括解析"""
        try:
            # Gmail API で最近のメールを取得
            gmail_service = GmailService(user_email)
            if not gmail_service.authenticate():
                return {'error': 'Gmail認証に失敗しました'}
            
            emails = gmail_service.get_recent_emails(limit)
            if not emails:
                return {'error': 'メールが見つかりませんでした'}
            
            total_analyzed = 0
            total_saved = 0
            errors = []
            
            for email_data in emails:
                try:
                    # 既に解析済みかチェック
                    if self._is_email_analyzed(user_email, email_data['id']):
                        continue
                    
                    # Gemini でメール内容を解析
                    analysis_result = self.gemini_service.analyze_email_content(
                        email_data['body'],
                        email_data['sender'],
                        email_data['subject']
                    )
                    
                    # 解析結果をFirebaseに保存
                    saved_items = self._save_analysis_results(user_email, analysis_result, email_data)
                    
                    total_analyzed += 1
                    total_saved += len(saved_items.get('tasks', [])) + len(saved_items.get('events', []))
                    
                except Exception as e:
                    error_msg = f"メール {email_data['id']} の解析エラー: {str(e)}"
                    errors.append(error_msg)
                    print(error_msg)
            
            return {
                'success': True,
                'total_emails': len(emails),
                'total_analyzed': total_analyzed,
                'total_saved': total_saved,
                'errors': errors
            }
            
        except Exception as e:
            print(f"一括メール解析エラー: {e}")
            return {'error': f'一括メール解析中にエラーが発生しました: {str(e)}'}
    
    def _is_email_analyzed(self, user_email: str, email_id: str) -> bool:
        """メールが既に解析済みかチェック"""
        if not self.db:
            return False
        
        try:
            # 解析履歴をチェック
            doc_ref = self.db.collection('email_analysis_history').document(f"{user_email}_{email_id}")
            doc = doc_ref.get()
            return doc.exists
            
        except Exception as e:
            print(f"解析履歴チェックエラー: {e}")
            return False
    
    def _save_analysis_results(self, user_email: str, analysis_result: Dict[str, Any], email_data: Dict[str, Any]) -> Dict[str, Any]:
        """解析結果をFirebase Firestoreに保存"""
        if not self.db:
            return {'tasks': [], 'events': []}
        
        saved_tasks = []
        saved_events = []
        
        try:
            # タスク候補を保存
            for task in analysis_result.get('tasks', []):
                if task.get('confidence', 0) < 0.5:  # 信頼度が低い場合はスキップ
                    continue
                
                task_doc = {
                    'user_id': user_email,
                    'title': task['title'],
                    'description': task['description'],
                    'due_date': task.get('due_date'),
                    'priority': task.get('priority', 'medium'),
                    'completed': False,
                    'status': 'pending',
                    'source': 'email',
                    'source_email_id': email_data['id'],
                    'source_email_subject': email_data['subject'],
                    'source_email_sender': email_data['sender'],
                    'confidence': task.get('confidence', 0.0),
                    'created_at': firestore.SERVER_TIMESTAMP,
                    'updated_at': firestore.SERVER_TIMESTAMP
                }
                
                doc_ref = self.db.collection('todo_candidates').add(task_doc)
                saved_tasks.append({
                    'id': doc_ref[1].id,
                    'title': task['title']
                })
            
            # イベント候補を保存
            for event in analysis_result.get('events', []):
                if event.get('confidence', 0) < 0.5:  # 信頼度が低い場合はスキップ
                    continue
                
                event_doc = {
                    'user_id': user_email,
                    'title': event['title'],
                    'description': event['description'],
                    'start': event['start'],
                    'end': event['end'],
                    'location': event.get('location', ''),
                    'status': 'pending',
                    'source': 'email',
                    'source_email_id': email_data['id'],
                    'source_email_subject': email_data['subject'],
                    'source_email_sender': email_data['sender'],
                    'confidence': event.get('confidence', 0.0),
                    'created_at': firestore.SERVER_TIMESTAMP,
                    'updated_at': firestore.SERVER_TIMESTAMP
                }
                
                doc_ref = self.db.collection('event_candidates').add(event_doc)
                saved_events.append({
                    'id': doc_ref[1].id,
                    'title': event['title']
                })
            
            # 解析履歴を保存
            history_doc = {
                'user_id': user_email,
                'email_id': email_data['id'],
                'email_subject': email_data['subject'],
                'email_sender': email_data['sender'],
                'analysis_result': analysis_result,
                'saved_tasks_count': len(saved_tasks),
                'saved_events_count': len(saved_events),
                'analyzed_at': firestore.SERVER_TIMESTAMP
            }
            
            self.db.collection('email_analysis_history').document(f"{user_email}_{email_data['id']}").set(history_doc)
            
            return {
                'tasks': saved_tasks,
                'events': saved_events
            }
            
        except Exception as e:
            print(f"Firebase保存エラー: {e}")
            return {'tasks': [], 'events': []}
    
    def get_analysis_history(self, user_email: str, limit: int = 20) -> List[Dict[str, Any]]:
        """解析履歴を取得"""
        if not self.db:
            return []
        
        try:
            docs = self.db.collection('email_analysis_history')\
                .where('user_id', '==', user_email)\
                .order_by('analyzed_at', direction=firestore.Query.DESCENDING)\
                .limit(limit)\
                .stream()
            
            history = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                history.append(data)
            
            return history
            
        except Exception as e:
            print(f"解析履歴取得エラー: {e}")
            return []
    
    def delete_analysis_history(self, user_email: str, email_id: str) -> bool:
        """解析履歴を削除"""
        if not self.db:
            return False
        
        try:
            self.db.collection('email_analysis_history').document(f"{user_email}_{email_id}").delete()
            return True
            
        except Exception as e:
            print(f"解析履歴削除エラー: {e}")
            return False
