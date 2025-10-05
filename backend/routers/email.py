from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import firebase_admin
from firebase_admin import auth, firestore
from services.email_analyzer import EmailAnalyzer
from services.gmail_service import GmailService

router = APIRouter()
security = HTTPBearer()

# 解析履歴をメモリ内で管理（実際のアプリではデータベースを使用）
analysis_history_store = []

# Firestoreデータベースの初期化
try:
    db = firestore.client()
    print("✅ Firestoreデータベース接続成功")
except Exception as e:
    print(f"❌ Firestoreデータベース接続エラー: {e}")
    db = None

def save_events_to_firebase(events: List[dict], user_email: str) -> int:
    """イベント候補をFirebaseに保存"""
    if not db:
        print("⚠️ Firestoreデータベースが利用できません")
        return 0
    
    saved_count = 0
    for event in events:
        try:
            doc_ref = db.collection('event_candidates').document()
            doc_ref.set({
                'title': event.get('title', ''),
                'description': event.get('description', ''),
                'start': event.get('start', ''),
                'end': event.get('end', ''),
                'location': event.get('location', ''),
                'confidence': event.get('confidence', 0.0),
                'user_id': user_email,
                'status': 'pending',
                'created_at': firestore.SERVER_TIMESTAMP
            })
            saved_count += 1
            print(f"✅ イベント候補をFirebaseに保存: {event.get('title', '')}")
        except Exception as e:
            print(f"❌ イベント候補保存エラー: {e}")
    
    return saved_count

def save_todos_to_firebase(todos: List[dict], user_email: str) -> int:
    """タスク候補をFirebaseに保存"""
    if not db:
        print("⚠️ Firestoreデータベースが利用できません")
        return 0
    
    saved_count = 0
    for todo in todos:
        try:
            doc_ref = db.collection('todo_candidates').document()
            doc_ref.set({
                'title': todo.get('title', ''),
                'description': todo.get('description', ''),
                'due_date': todo.get('due_date', ''),
                'priority': todo.get('priority', 'medium'),
                'confidence': todo.get('confidence', 0.0),
                'user_id': user_email,
                'status': 'pending',
                'completed': False,
                'created_at': firestore.SERVER_TIMESTAMP
            })
            saved_count += 1
            print(f"✅ タスク候補をFirebaseに保存: {todo.get('title', '')}")
        except Exception as e:
            print(f"❌ タスク候補保存エラー: {e}")
    
    return saved_count

class Email(BaseModel):
    id: str
    subject: str
    sender: str
    date: str
    body: str

class AnalyzeEmailRequest(BaseModel):
    email_id: str

class AnalyzeRecentEmailsRequest(BaseModel):
    limit: int = 10

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Firebase認証トークンからユーザー情報を取得"""
    try:
        # Firebase Admin SDK が初期化されているかチェック
        if not firebase_admin._apps:
            raise HTTPException(status_code=500, detail="Firebase Admin SDK が初期化されていません")
        
        decoded_token = auth.verify_id_token(credentials.credentials)
        return decoded_token
    except Exception as e:
        print(f"認証エラー: {e}")
        raise HTTPException(status_code=401, detail=f"認証に失敗しました: {str(e)}")

@router.get("/recent")
async def get_recent_emails(
    limit: int = 5,  # デフォルトを5件に減らす
    # user: dict = Depends(get_current_user)  # 一時的に無効化
):
    """最近のメールを取得"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # Gmail API でメールを取得
        try:
            gmail_service = GmailService(user_email)
            print(f"Gmail API認証を開始: {user_email}")
            
            if not gmail_service.authenticate():
                print("Gmail認証に失敗しました")
                raise HTTPException(
                    status_code=401, 
                    detail="Gmail API認証に失敗しました。認証情報を確認してください。"
                )
            
            print("Gmail API認証成功、メールを取得中...")
            emails = gmail_service.get_recent_emails(limit)
            
            if not emails:
                print("メールが見つかりませんでした")
                return {"emails": [], "message": "メールが見つかりませんでした"}
            
            print(f"メール取得成功: {len(emails)}件")
            return {"emails": emails}
            
        except HTTPException:
            raise
        except Exception as gmail_error:
            print(f"Gmail API エラー: {gmail_error}")
            raise HTTPException(
                status_code=500, 
                detail=f"Gmail API エラー: {str(gmail_error)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"メール取得中にエラーが発生しました: {str(e)}")

@router.post("/analyze")
async def analyze_email(
    request: AnalyzeEmailRequest,
    # user: dict = Depends(get_current_user)  # 一時的に無効化
):
    """単一のメールを解析"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # 実際のメール解析を実行（Firestore接続を回避）
        try:
            print(f"🔍 個別メール解析リクエスト受信: email_id={request.email_id}")
            
            # Gmail APIでメールを取得
            gmail_service = GmailService(user_email)
            if not gmail_service.authenticate():
                raise HTTPException(status_code=401, detail="Gmail API認証に失敗しました")
            
            # 特定のメールを取得（簡易実装）
            emails = gmail_service.get_recent_emails(10)  # 最新10件から検索
            target_email = None
            
            for email in emails:
                if email.get('id') == request.email_id:
                    target_email = email
                    break
            
            if not target_email:
                return {
                    'success': False,
                    'error': f'メールID {request.email_id} が見つかりませんでした'
                }
            
            # Gemini APIで解析
            from services.gemini_service import GeminiService
            gemini_service = GeminiService()
            
            print(f"メール解析中: {target_email.get('subject', '件名なし')}")
            analysis = gemini_service.analyze_email_content(
                target_email.get('body', ''),
                target_email.get('sender', ''),
                target_email.get('subject', '')
            )
            
            # Firebaseにイベントとタスクを保存
            events = analysis.get('events', [])
            tasks = analysis.get('tasks', [])
            
            events_saved = save_events_to_firebase(events, user_email)
            todos_saved = save_todos_to_firebase(tasks, user_email)
            
            # 個別解析結果を履歴に保存
            history_entry = {
                'id': f'individual_analysis_{len(analysis_history_store) + 1}',
                'timestamp': '2024-10-05T12:00:00Z',
                'total_emails': 1,
                'total_analyzed': 1,
                'status': 'completed',
                'analysis_results': [{
                    'email_id': request.email_id,
                    'subject': target_email.get('subject'),
                    'sender': target_email.get('sender'),
                    'analysis': analysis
                }],
                'user_email': user_email,
                'events_saved': events_saved,
                'todos_saved': todos_saved
            }
            analysis_history_store.append(history_entry)
            print(f"📝 個別解析履歴に保存: ID={history_entry['id']}, 履歴総数={len(analysis_history_store)}")
            print(f"🔍 保存された解析結果: tasks={len(tasks)}件, events={len(events)}件")
            print(f"📊 Firebase保存結果: イベント={events_saved}件, タスク={todos_saved}件")
            
            return {
                'success': True,
                'email_id': request.email_id,
                'subject': target_email.get('subject'),
                'sender': target_email.get('sender'),
                'analysis': analysis,
                'events': analysis.get('events', []),
                'tasks': analysis.get('tasks', []),
                'message': 'Gemini APIによる解析が完了しました'
            }
            
        except Exception as analyzer_error:
            print(f"個別メール解析エラー: {analyzer_error}")
            return {
                'success': False,
                'error': f'メール解析中にエラーが発生しました: {str(analyzer_error)}'
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"メール解析中にエラーが発生しました: {str(e)}")

@router.post("/analyze-recent")
async def analyze_recent_emails(
    request: AnalyzeRecentEmailsRequest,
    # user: dict = Depends(get_current_user)  # 一時的に無効化
):
    """最近のメールを一括解析"""
    try:
        print(f"🚀 一括メール解析リクエスト受信: limit={request.limit}")
        
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        print(f"ユーザー: {user_email}")
        
        # 実際のメール解析を実行（Firestore接続を回避）
        try:
            print(f"実際のメール解析を開始: limit={request.limit}")
            
            # Gmail APIでメールを取得
            gmail_service = GmailService(user_email)
            if not gmail_service.authenticate():
                raise HTTPException(status_code=401, detail="Gmail API認証に失敗しました")
            
            emails = gmail_service.get_recent_emails(request.limit)
            if not emails:
                return {
                    'success': True,
                    'total_emails': 0,
                    'total_analyzed': 0,
                    'total_saved': 0,
                    'errors': [],
                    'message': '解析対象のメールが見つかりませんでした'
                }
            
            # Gemini APIで解析（Firestore接続なし）
            from services.gemini_service import GeminiService
            gemini_service = GeminiService()
            
            analyzed_count = 0
            errors = []
            analysis_results = []
            
            for email in emails:
                try:
                    print(f"メール解析中: {email.get('subject', '件名なし')}")
                    
                    # メール内容を解析
                    analysis = gemini_service.analyze_email_content(
                        email.get('body', ''),
                        email.get('sender', ''),
                        email.get('subject', '')
                    )
                    
                    analysis_results.append({
                        'email_id': email.get('id'),
                        'subject': email.get('subject'),
                        'sender': email.get('sender'),
                        'analysis': analysis
                    })
                    
                    analyzed_count += 1
                    print(f"✅ メール解析完了: {email.get('subject', '件名なし')}")
                    
                except Exception as email_error:
                    error_msg = f"メール解析エラー (ID: {email.get('id')}): {str(email_error)}"
                    print(f"❌ {error_msg}")
                    errors.append(error_msg)
            
                # Firebaseにイベントとタスクを保存
                total_events_saved = 0
                total_todos_saved = 0
                
                for analysis_result in analysis_results:
                    analysis_data = analysis_result.get('analysis', {})
                    events = analysis_data.get('events', [])
                    tasks = analysis_data.get('tasks', [])
                    
                    # イベントをFirebaseに保存
                    events_saved = save_events_to_firebase(events, user_email)
                    total_events_saved += events_saved
                    
                    # タスクをFirebaseに保存
                    todos_saved = save_todos_to_firebase(tasks, user_email)
                    total_todos_saved += todos_saved
                
                # 解析履歴に保存
                print(f"🔍 解析履歴保存チェック: analyzed_count={analyzed_count}, analysis_results={len(analysis_results)}")
                if analyzed_count > 0:
                    history_entry = {
                        'id': f'analysis_{len(analysis_history_store) + 1}',
                        'timestamp': '2024-10-05T12:00:00Z',  # 実際のタイムスタンプ
                        'total_emails': len(emails),
                        'total_analyzed': analyzed_count,
                        'status': 'completed',
                        'analysis_results': analysis_results,
                        'user_email': user_email,
                        'events_saved': total_events_saved,
                        'todos_saved': total_todos_saved
                    }
                    analysis_history_store.append(history_entry)
                    print(f"📝 解析履歴に保存完了: ID={history_entry['id']}, 履歴総数={len(analysis_history_store)}")
                    print(f"📊 Firebase保存結果: イベント={total_events_saved}件, タスク={total_todos_saved}件")
                else:
                    print("⚠️ 解析結果が0件のため、履歴に保存されませんでした")
            
            return {
                'success': True,
                'total_emails': len(emails),
                'total_analyzed': analyzed_count,
                'total_saved': analyzed_count,  # メモリに保存された件数
                'errors': errors,
                'analysis_results': analysis_results,
                'message': f'{analyzed_count}件のメールを解析しました'
            }
            
        except Exception as analyzer_error:
            print(f"メール解析サービスエラー: {analyzer_error}")
            return {
                'success': False,
                'total_emails': 0,
                'total_analyzed': 0,
                'total_saved': 0,
                'errors': [str(analyzer_error)],
                'message': f'メール解析中にエラーが発生しました: {str(analyzer_error)}'
            }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"一括メール解析中にエラーが発生しました: {str(e)}")

@router.get("/analysis-history")
async def get_analysis_history(
    limit: int = 20,
    # user: dict = Depends(get_current_user)  # 一時的に無効化
):
    """解析履歴を取得"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # メモリ内の解析履歴を取得
        print(f"🔍 解析履歴取得開始: 総履歴数={len(analysis_history_store)}件")
        
        # ユーザーに関連する履歴のみを返す
        user_history = [entry for entry in analysis_history_store if entry.get('user_email') == user_email]
        print(f"🔍 ユーザー別履歴: {len(user_history)}件 (user_email={user_email})")
        
        # 最新のlimit件のみを返す
        recent_history = user_history[-limit:] if user_history else []
        print(f"🔍 返却する履歴: {len(recent_history)}件")
        
        # 履歴の詳細をログ出力
        for i, entry in enumerate(recent_history):
            print(f"🔍 履歴{i+1}: ID={entry.get('id')}, 解析結果数={len(entry.get('analysis_results', []))}")
            for j, result in enumerate(entry.get('analysis_results', [])):
                analysis = result.get('analysis', {})
                print(f"  └─ 結果{j+1}: tasks={len(analysis.get('tasks', []))}件, events={len(analysis.get('events', []))}件")
        
        return {
            'history': recent_history
        }
        
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析履歴取得中にエラーが発生しました: {str(e)}")

@router.delete("/analysis-history/{email_id}")
async def delete_analysis_history(
    email_id: str,
    # user: dict = Depends(get_current_user)  # 一時的に無効化
):
    """解析履歴を削除"""
    try:
        # 一時的にテスト用のユーザーを設定
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        # テスト用のモック削除処理
        print(f"解析履歴削除: {email_id} を削除します")
        
        # 実際の削除処理は後で実装
        # analyzer = EmailAnalyzer()
        # success = analyzer.delete_analysis_history(user_email, email_id)
        
        return {"message": f"解析履歴 {email_id} を削除しました"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析履歴削除中にエラーが発生しました: {str(e)}")

class ApproveEventRequest(BaseModel):
    event_id: str

class ApproveTodoRequest(BaseModel):
    todo_id: str

class RejectEventRequest(BaseModel):
    event_id: str

class RejectTodoRequest(BaseModel):
    todo_id: str

@router.post("/approve-event")
async def approve_event(
    request: ApproveEventRequest,
    # user: dict = Depends(get_current_user)  # 一時的に無効化
):
    """イベント候補を承認してeventsコレクションに移動"""
    try:
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        if not db:
            raise HTTPException(status_code=500, detail="Firestoreデータベースが利用できません")
        
        # イベント候補を取得
        event_ref = db.collection('event_candidates').document(request.event_id)
        event_doc = event_ref.get()
        
        if not event_doc.exists:
            raise HTTPException(status_code=404, detail="イベント候補が見つかりません")
        
        event_data = event_doc.to_dict()
        
        # eventsコレクションに移動
        events_ref = db.collection('events').document()
        events_ref.set({
            **event_data,
            'status': 'approved',
            'approved_at': firestore.SERVER_TIMESTAMP
        })
        
        # event_candidatesから削除
        event_ref.delete()
        
        print(f"✅ イベント候補を承認: {event_data.get('title', '')}")
        
        return {"message": "イベントを承認しました", "event_id": events_ref.id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"イベント承認中にエラーが発生しました: {str(e)}")

@router.post("/approve-todo")
async def approve_todo(
    request: ApproveTodoRequest,
    # user: dict = Depends(get_current_user)  # 一時的に無効化
):
    """ToDo候補を承認してtodosコレクションに移動"""
    try:
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        if not db:
            raise HTTPException(status_code=500, detail="Firestoreデータベースが利用できません")
        
        # ToDo候補を取得
        todo_ref = db.collection('todo_candidates').document(request.todo_id)
        todo_doc = todo_ref.get()
        
        if not todo_doc.exists:
            raise HTTPException(status_code=404, detail="ToDo候補が見つかりません")
        
        todo_data = todo_doc.to_dict()
        
        # todosコレクションに移動
        todos_ref = db.collection('todos').document()
        todos_ref.set({
            **todo_data,
            'status': 'approved',
            'approved_at': firestore.SERVER_TIMESTAMP
        })
        
        # todo_candidatesから削除
        todo_ref.delete()
        
        print(f"✅ ToDo候補を承認: {todo_data.get('title', '')}")
        
        return {"message": "ToDoを承認しました", "todo_id": todos_ref.id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ToDo承認中にエラーが発生しました: {str(e)}")

@router.post("/reject-event")
async def reject_event(
    request: RejectEventRequest,
    # user: dict = Depends(get_current_user)  # 一時的に無効化
):
    """イベント候補を却下してevent_candidatesから削除"""
    try:
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        if not db:
            raise HTTPException(status_code=500, detail="Firestoreデータベースが利用できません")
        
        # event_candidatesから削除
        event_ref = db.collection('event_candidates').document(request.event_id)
        event_doc = event_ref.get()
        
        if not event_doc.exists:
            raise HTTPException(status_code=404, detail="イベント候補が見つかりません")
        
        event_data = event_doc.to_dict()
        event_ref.delete()
        
        print(f"❌ イベント候補を却下: {event_data.get('title', '')}")
        
        return {"message": "イベントを却下しました"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"イベント却下中にエラーが発生しました: {str(e)}")

@router.post("/reject-todo")
async def reject_todo(
    request: RejectTodoRequest,
    # user: dict = Depends(get_current_user)  # 一時的に無効化
):
    """ToDo候補を却下してtodo_candidatesから削除"""
    try:
        user_email = "haruto7fujimoto@gmail.com"  # テスト用
        
        if not db:
            raise HTTPException(status_code=500, detail="Firestoreデータベースが利用できません")
        
        # todo_candidatesから削除
        todo_ref = db.collection('todo_candidates').document(request.todo_id)
        todo_doc = todo_ref.get()
        
        if not todo_doc.exists:
            raise HTTPException(status_code=404, detail="ToDo候補が見つかりません")
        
        todo_data = todo_doc.to_dict()
        todo_ref.delete()
        
        print(f"❌ ToDo候補を却下: {todo_data.get('title', '')}")
        
        return {"message": "ToDoを却下しました"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ToDo却下中にエラーが発生しました: {str(e)}")
