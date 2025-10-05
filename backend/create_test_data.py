#!/usr/bin/env python3
"""
Firebase Firestore にテストデータを作成するスクリプト
uyuyu.0301@gmail.com 用のタスクと予定データを追加
"""

import os
import sys
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore

# プロジェクトルートをPythonパスに追加
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def initialize_firebase():
    """Firebase Admin SDKを初期化"""
    try:
        # サービスアカウントキーのパス
        cred_path = "credentials/firebase-service-account.json"
        
        if not os.path.exists(cred_path):
            print(f"エラー: サービスアカウントキーが見つかりません: {cred_path}")
            return None
        
        # Firebase Admin SDKを初期化
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        
        # Firestoreクライアントを取得
        db = firestore.client()
        print("Firebase初期化成功")
        return db
        
    except Exception as e:
        print(f"Firebase初期化エラー: {e}")
        return None

def create_test_data(db, user_email="uyuyu.0301@gmail.com"):
    """テストデータを作成"""
    try:
        # ユーザーID（メールアドレスから生成）
        user_id = user_email.replace('@', '_').replace('.', '_')
        
        print(f"ユーザーID: {user_id}")
        
        # 1. ユーザーデータを作成
        user_data = {
            'email': user_email,
            'name': 'テストユーザー',
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'settings': {
                'calendarIntegration': True,
                'emailIntegration': True,
                'notificationEnabled': True,
                'autoSaveEnabled': True,
                'timezone': 'Asia/Tokyo',
                'language': 'ja',
                'dateFormat': 'YYYY/MM/DD',
                'recentDays': 7
            }
        }
        
        # ユーザーデータを保存
        user_ref = db.collection('users').document(user_id)
        user_ref.set(user_data)
        print(f"✅ ユーザーデータを作成: {user_id}")
        
        # 2. タスクデータを作成
        todos_data = [
            {
                'user_id': user_id,
                'title': 'プロジェクト資料の作成',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=2)).isoformat(),
                'description': '来週の会議用の資料を作成する',
                'priority': 'high',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'メールの返信',
                'completed': False,
                'due_date': (datetime.now() + timedelta(hours=3)).isoformat(),
                'description': 'クライアントからのメールに返信する',
                'priority': 'medium',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': '会議室の予約',
                'completed': True,
                'due_date': (datetime.now() - timedelta(days=1)).isoformat(),
                'description': '来週のチーム会議用の会議室を予約',
                'priority': 'low',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'レポートの提出',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=5)).isoformat(),
                'description': '月次レポートを上司に提出する',
                'priority': 'high',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': '買い物リストの作成',
                'completed': False,
                'due_date': (datetime.now() + timedelta(hours=6)).isoformat(),
                'description': '週末の買い物用のリストを作成',
                'priority': 'low',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            }
        ]
        
        # タスクデータを保存
        todos_ref = db.collection('todos')
        for i, todo_data in enumerate(todos_data):
            todo_id = f"todo_{user_id}_{i+1}"
            todos_ref.document(todo_id).set(todo_data)
            print(f"✅ タスクを作成: {todo_data['title']}")
        
        # 3. イベントデータを作成
        events_data = [
            {
                'user_id': user_id,
                'title': 'チーム会議',
                'start': (datetime.now() + timedelta(days=1, hours=10)).isoformat(),
                'end': (datetime.now() + timedelta(days=1, hours=11)).isoformat(),
                'description': '週次のチーム会議。プロジェクトの進捗を確認',
                'location': '会議室A',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'クライアントとの打ち合わせ',
                'start': (datetime.now() + timedelta(days=2, hours=14)).isoformat(),
                'end': (datetime.now() + timedelta(days=2, hours=15, minutes=30)).isoformat(),
                'description': '新規プロジェクトについての打ち合わせ',
                'location': 'クライアントオフィス',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': '研修セミナー',
                'start': (datetime.now() + timedelta(days=3, hours=9)).isoformat(),
                'end': (datetime.now() + timedelta(days=3, hours=17)).isoformat(),
                'description': '新技術に関する研修セミナーに参加',
                'location': 'セミナールーム',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'ランチミーティング',
                'start': (datetime.now() + timedelta(days=4, hours=12)).isoformat(),
                'end': (datetime.now() + timedelta(days=4, hours=13)).isoformat(),
                'description': '同僚とのランチミーティング',
                'location': 'レストラン',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'プロジェクトレビュー',
                'start': (datetime.now() + timedelta(days=5, hours=15)).isoformat(),
                'end': (datetime.now() + timedelta(days=5, hours=16)).isoformat(),
                'description': 'プロジェクトの中間レビュー会議',
                'location': '会議室B',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            }
        ]
        
        # イベントデータを保存
        events_ref = db.collection('events')
        for i, event_data in enumerate(events_data):
            event_id = f"event_{user_id}_{i+1}"
            events_ref.document(event_id).set(event_data)
            print(f"✅ イベントを作成: {event_data['title']}")
        
        # 4. タスク候補データを作成
        todo_candidates_data = [
            {
                'user_id': user_id,
                'title': '新しいタスクの検討',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=3)).isoformat(),
                'description': 'メールから抽出されたタスク候補',
                'priority': 'medium',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'user_id': user_id,
                'title': '会議の準備',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=1)).isoformat(),
                'description': '明日の会議の準備作業',
                'priority': 'high',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
        ]
        
        # タスク候補データを保存
        todo_candidates_ref = db.collection('todo_candidates')
        for i, candidate_data in enumerate(todo_candidates_data):
            candidate_id = f"todo_candidate_{user_id}_{i+1}"
            todo_candidates_ref.document(candidate_id).set(candidate_data)
            print(f"✅ タスク候補を作成: {candidate_data['title']}")
        
        # 5. イベント候補データを作成
        event_candidates_data = [
            {
                'user_id': user_id,
                'title': '打ち合わせの予定',
                'start': (datetime.now() + timedelta(days=2, hours=16)).isoformat(),
                'end': (datetime.now() + timedelta(days=2, hours=17)).isoformat(),
                'description': 'メールから抽出されたイベント候補',
                'location': '未定',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'user_id': user_id,
                'title': 'セミナー参加',
                'start': (datetime.now() + timedelta(days=7, hours=10)).isoformat(),
                'end': (datetime.now() + timedelta(days=7, hours=12)).isoformat(),
                'description': '技術セミナーの参加',
                'location': 'オンライン',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
        ]
        
        # イベント候補データを保存
        event_candidates_ref = db.collection('event_candidates')
        for i, candidate_data in enumerate(event_candidates_data):
            candidate_id = f"event_candidate_{user_id}_{i+1}"
            event_candidates_ref.document(candidate_id).set(candidate_data)
            print(f"✅ イベント候補を作成: {candidate_data['title']}")
        
        print(f"\n🎉 テストデータの作成が完了しました！")
        print(f"ユーザー: {user_email}")
        print(f"作成されたデータ:")
        print(f"  - ユーザー情報: 1件")
        print(f"  - タスク: {len(todos_data)}件")
        print(f"  - イベント: {len(events_data)}件")
        print(f"  - タスク候補: {len(todo_candidates_data)}件")
        print(f"  - イベント候補: {len(event_candidates_data)}件")
        
        return True
        
    except Exception as e:
        print(f"データ作成エラー: {e}")
        return False

def main():
    """メイン関数"""
    print("Firebase Firestore テストデータ作成スクリプト")
    print("=" * 50)
    
    # Firebase初期化
    db = initialize_firebase()
    if not db:
        return
    
    # テストデータ作成
    success = create_test_data(db)
    
    if success:
        print("\n✅ すべてのデータが正常に作成されました！")
    else:
        print("\n❌ データ作成中にエラーが発生しました")

if __name__ == "__main__":
    main()
