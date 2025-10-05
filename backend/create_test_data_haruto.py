#!/usr/bin/env python3
"""
Firebase Firestore に haruto7fujimoto@gmail.com 用のテストデータを作成するスクリプト
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

def create_test_data(db, user_email="haruto7fujimoto@gmail.com"):
    """テストデータを作成"""
    try:
        # ユーザーID（メールアドレスを直接使用）
        user_id = user_email
        
        print(f"ユーザーID: {user_id}")
        
        # 1. ユーザーデータを作成
        user_data = {
            'email': user_email,
            'name': '藤本 春人',
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
                'recentDays': 5
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
                'title': 'プレゼン資料の作成',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=3)).isoformat(),
                'description': '来週のクライアントプレゼン用の資料を作成する',
                'priority': 'high',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'コードレビューの実施',
                'completed': False,
                'due_date': (datetime.now() + timedelta(hours=2)).isoformat(),
                'description': 'チームメンバーのプルリクエストをレビューする',
                'priority': 'medium',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'データベースのバックアップ',
                'completed': True,
                'due_date': (datetime.now() - timedelta(days=1)).isoformat(),
                'description': '週次データベースバックアップの実行',
                'priority': 'high',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': '新機能の設計書作成',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=7)).isoformat(),
                'description': '次期リリース用の新機能設計書を作成',
                'priority': 'medium',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'チームミーティングの準備',
                'completed': False,
                'due_date': (datetime.now() + timedelta(hours=4)).isoformat(),
                'description': '明日のチームミーティングの議題を準備',
                'priority': 'low',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'API仕様書の更新',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=2)).isoformat(),
                'description': '新エンドポイントのAPI仕様書を更新',
                'priority': 'medium',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            }
        ]
        
        # タスクデータを保存
        todos_ref = db.collection('todos')
        for i, todo_data in enumerate(todos_data):
            todo_id = f"todo_{user_id.replace('@', '_').replace('.', '_')}_{i+1}"
            todos_ref.document(todo_id).set(todo_data)
            print(f"✅ タスクを作成: {todo_data['title']}")
        
        # 3. イベントデータを作成
        events_data = [
            {
                'user_id': user_id,
                'title': '開発チーム会議',
                'start': (datetime.now() + timedelta(days=1, hours=9)).isoformat(),
                'end': (datetime.now() + timedelta(days=1, hours=10, minutes=30)).isoformat(),
                'description': '週次の開発チーム会議。スプリントレビューと次回計画',
                'location': '会議室B',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'クライアントとの打ち合わせ',
                'start': (datetime.now() + timedelta(days=2, hours=14)).isoformat(),
                'end': (datetime.now() + timedelta(days=2, hours=16)).isoformat(),
                'description': '新プロジェクトの要件定義についての打ち合わせ',
                'location': 'クライアントオフィス',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': '技術勉強会',
                'start': (datetime.now() + timedelta(days=3, hours=18)).isoformat(),
                'end': (datetime.now() + timedelta(days=3, hours=20)).isoformat(),
                'description': 'React 18の新機能についての勉強会',
                'location': 'オンライン',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'プロジェクトデモ',
                'start': (datetime.now() + timedelta(days=4, hours=10)).isoformat(),
                'end': (datetime.now() + timedelta(days=4, hours=11)).isoformat(),
                'description': 'ステークホルダー向けのプロジェクトデモンストレーション',
                'location': 'プレゼンテーションルーム',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': 'コードレビュー会',
                'start': (datetime.now() + timedelta(days=5, hours=15)).isoformat(),
                'end': (datetime.now() + timedelta(days=5, hours=16)).isoformat(),
                'description': 'チーム全体でのコードレビュー会議',
                'location': '会議室A',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            },
            {
                'user_id': user_id,
                'title': '1on1ミーティング',
                'start': (datetime.now() + timedelta(days=6, hours=11)).isoformat(),
                'end': (datetime.now() + timedelta(days=6, hours=12)).isoformat(),
                'description': 'マネージャーとの1on1ミーティング',
                'location': 'マネージャーオフィス',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'approved'
            }
        ]
        
        # イベントデータを保存
        events_ref = db.collection('events')
        for i, event_data in enumerate(events_data):
            event_id = f"event_{user_id.replace('@', '_').replace('.', '_')}_{i+1}"
            events_ref.document(event_id).set(event_data)
            print(f"✅ イベントを作成: {event_data['title']}")
        
        # 4. タスク候補データを作成
        todo_candidates_data = [
            {
                'user_id': user_id,
                'title': 'セキュリティ監査の準備',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=4)).isoformat(),
                'description': 'メールから抽出されたタスク候補：セキュリティ監査の準備作業',
                'priority': 'high',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'user_id': user_id,
                'title': 'ドキュメントの整理',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=2)).isoformat(),
                'description': 'プロジェクトドキュメントの整理と更新',
                'priority': 'medium',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'user_id': user_id,
                'title': 'テストケースの作成',
                'completed': False,
                'due_date': (datetime.now() + timedelta(days=5)).isoformat(),
                'description': '新機能のテストケースを作成する',
                'priority': 'medium',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
        ]
        
        # タスク候補データを保存
        todo_candidates_ref = db.collection('todo_candidates')
        for i, candidate_data in enumerate(todo_candidates_data):
            candidate_id = f"todo_candidate_{user_id.replace('@', '_').replace('.', '_')}_{i+1}"
            todo_candidates_ref.document(candidate_id).set(candidate_data)
            print(f"✅ タスク候補を作成: {candidate_data['title']}")
        
        # 5. イベント候補データを作成
        event_candidates_data = [
            {
                'user_id': user_id,
                'title': 'システム移行会議',
                'start': (datetime.now() + timedelta(days=3, hours=13)).isoformat(),
                'end': (datetime.now() + timedelta(days=3, hours=14)).isoformat(),
                'description': 'メールから抽出されたイベント候補：システム移行についての会議',
                'location': '会議室C',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'user_id': user_id,
                'title': '技術セミナー参加',
                'start': (datetime.now() + timedelta(days=8, hours=9)).isoformat(),
                'end': (datetime.now() + timedelta(days=8, hours=17)).isoformat(),
                'description': '最新技術に関するセミナーへの参加',
                'location': 'コンベンションセンター',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'user_id': user_id,
                'title': 'プロジェクトキックオフ',
                'start': (datetime.now() + timedelta(days=10, hours=10)).isoformat(),
                'end': (datetime.now() + timedelta(days=10, hours=12)).isoformat(),
                'description': '新プロジェクトのキックオフミーティング',
                'location': '大会議室',
                'status': 'pending',
                'source': 'email',
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
        ]
        
        # イベント候補データを保存
        event_candidates_ref = db.collection('event_candidates')
        for i, candidate_data in enumerate(event_candidates_data):
            candidate_id = f"event_candidate_{user_id.replace('@', '_').replace('.', '_')}_{i+1}"
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
    print("Firebase Firestore haruto7fujimoto@gmail.com 用テストデータ作成スクリプト")
    print("=" * 70)
    
    # Firebase初期化
    db = initialize_firebase()
    if not db:
        return
    
    # テストデータ作成
    success = create_test_data(db)
    
    if success:
        print("\n✅ すべてのデータが正常に作成されました！")
        print("haruto7fujimoto@gmail.com でログインしてデータを確認してください。")
    else:
        print("\n❌ データ作成中にエラーが発生しました")

if __name__ == "__main__":
    main()
