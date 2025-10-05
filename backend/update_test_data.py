#!/usr/bin/env python3
"""
既存のテストデータをメールアドレスベースのuser_idに更新するスクリプト
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

def update_user_ids(db, user_email="uyuyu.0301@gmail.com"):
    """user_idをメールアドレスベースに更新"""
    try:
        old_user_id = user_email.replace('@', '_').replace('.', '_')
        new_user_id = user_email  # メールアドレスを直接使用
        
        print(f"古いuser_id: {old_user_id}")
        print(f"新しいuser_id: {new_user_id}")
        
        # 更新対象のコレクション
        collections_to_update = [
            'users',
            'todos', 
            'events',
            'todo_candidates',
            'event_candidates'
        ]
        
        total_updated = 0
        
        for collection_name in collections_to_update:
            print(f"\n📁 {collection_name} コレクションを更新中...")
            
            # 古いuser_idでフィルタしてドキュメントを取得
            docs = db.collection(collection_name).where('user_id', '==', old_user_id).stream()
            
            updated_count = 0
            for doc in docs:
                try:
                    # user_idを更新
                    doc.reference.update({'user_id': new_user_id})
                    updated_count += 1
                    print(f"  ✅ 更新: {doc.id}")
                except Exception as e:
                    print(f"  ❌ エラー ({doc.id}): {e}")
            
            print(f"  📊 {collection_name}: {updated_count}件更新")
            total_updated += updated_count
        
        # ユーザードキュメントのIDも更新（必要に応じて）
        try:
            old_user_doc = db.collection('users').document(old_user_id)
            old_user_data = old_user_doc.get()
            
            if old_user_data.exists:
                # 新しいドキュメントを作成
                new_user_doc = db.collection('users').document(new_user_id)
                new_user_doc.set(old_user_data.to_dict())
                
                # 古いドキュメントを削除
                old_user_doc.delete()
                print(f"✅ ユーザードキュメントIDを更新: {old_user_id} → {new_user_id}")
        except Exception as e:
            print(f"⚠️ ユーザードキュメントID更新エラー: {e}")
        
        print(f"\n🎉 更新完了！")
        print(f"総更新件数: {total_updated}件")
        print(f"新しいuser_id: {new_user_id}")
        
        return True
        
    except Exception as e:
        print(f"更新エラー: {e}")
        return False

def main():
    """メイン関数"""
    print("Firebase Firestore user_id 更新スクリプト")
    print("=" * 50)
    
    # Firebase初期化
    db = initialize_firebase()
    if not db:
        return
    
    # user_id更新
    success = update_user_ids(db)
    
    if success:
        print("\n✅ user_idの更新が正常に完了しました！")
        print("フロントエンドでデータが正しく表示されるはずです。")
    else:
        print("\n❌ user_id更新中にエラーが発生しました")

if __name__ == "__main__":
    main()
