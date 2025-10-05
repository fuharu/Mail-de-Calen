import os
import base64
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import email
from email.mime.text import MIMEText
import re

class GmailService:
    def __init__(self, user_email: str):
        self.user_email = user_email
        self.SCOPES = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify'
        ]
        self.service = None
        self.credentials = None
        
    def authenticate(self) -> bool:
        """Gmail API認証を実行"""
        try:
            # トークンファイルのパス
            token_path = f"tokens/{self.user_email.replace('@', '_').replace('.', '_')}_token.json"
            credentials_path = "credentials.json"
            
            # 既存のトークンを確認
            if os.path.exists(token_path):
                self.credentials = Credentials.from_authorized_user_file(token_path, self.SCOPES)
            
            # トークンが無効または存在しない場合
            if not self.credentials or not self.credentials.valid:
                if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                    # トークンをリフレッシュ
                    try:
                        self.credentials.refresh(Request())
                    except Exception as refresh_error:
                        print(f"トークンリフレッシュエラー: {refresh_error}")
                        # リフレッシュに失敗した場合は新しい認証が必要
                        self.credentials = None
                
                if not self.credentials:
                    # 新しい認証フローを開始
                    if not os.path.exists(credentials_path):
                        print(f"❌ Gmail API認証情報が見つかりません: {os.path.abspath(credentials_path)}")
                        print("📋 Gmail APIを設定するには以下の手順を実行してください:")
                        print("   1. Google Cloud Console でプロジェクトを作成")
                        print("   2. Gmail API を有効化")
                        print("   3. OAuth 2.0 クライアント ID を作成")
                        print("   4. 認証情報を credentials.json として保存")
                        print(f"   5. ファイルを {os.path.abspath(credentials_path)} に配置")
                        print("   6. backend/GMAIL_API_SETUP.md を参照してください")
                        return False
                    
                    try:
                        print("🔐 Gmail API認証を開始します...")
                        print("🌐 ブラウザが開きますので、Googleアカウントでログインしてください")
                        flow = InstalledAppFlow.from_client_secrets_file(credentials_path, self.SCOPES)
                        self.credentials = flow.run_local_server(port=8080)
                        print("✅ Gmail API認証が完了しました")
                    except Exception as flow_error:
                        print(f"❌ 認証フローエラー: {flow_error}")
                        print("💡 認証情報ファイルの形式を確認してください")
                        return False
                
                # トークンを保存
                if self.credentials:
                    os.makedirs(os.path.dirname(token_path), exist_ok=True)
                    with open(token_path, 'w') as token:
                        token.write(self.credentials.to_json())
            
            # Gmail APIサービスを構築
            if self.credentials:
                self.service = build('gmail', 'v1', credentials=self.credentials)
                return True
            else:
                return False
            
        except Exception as e:
            print(f"Gmail認証エラー: {e}")
            return False
    
    def get_recent_emails(self, limit: int = 10) -> List[Dict[str, Any]]:
        """最近のメールを取得"""
        if not self.service:
            if not self.authenticate():
                return []
        
        try:
            print(f"📧 受信箱から最新 {limit} 件のメールを取得中...")
            
            # メールリストを取得
            results = self.service.users().messages().list(
                userId='me',
                maxResults=limit,
                q='in:inbox'
            ).execute()
            
            messages = results.get('messages', [])
            print(f"📬 メールリスト取得成功: {len(messages)} 件")
            
            emails = []
            
            # 順次処理でメールを取得（SSLエラー回避のため並列処理を無効化）
            import time
            for i, message in enumerate(messages, 1):
                try:
                    print(f"📄 メール詳細取得中 ({i}/{len(messages)}): {message['id']}")
                    
                    # メール詳細を取得
                    msg = self.service.users().messages().get(
                        userId='me',
                        id=message['id'],
                        format='full'
                    ).execute()
                    
                    # メール情報を解析
                    email_data = self._parse_email_message(msg)
                    if email_data:
                        print(f"✅ メール解析完了: {email_data.get('subject', '件名なし')}")
                        emails.append(email_data)
                    else:
                        print(f"⚠️ メール解析失敗: {message['id']}")
                    
                    # API制限回避のため少し待機
                    if i < len(messages):
                        time.sleep(0.1)
                        
                except Exception as e:
                    print(f"❌ メール解析エラー (ID: {message['id']}): {e}")
                    continue
            
            print(f"🎉 メール取得完了: {len(emails)} 件")
            return emails
            
        except HttpError as error:
            print(f"❌ Gmail API エラー: {error}")
            return []
        except Exception as e:
            print(f"❌ メール取得エラー: {e}")
            return []
    
    def _parse_email_message(self, msg: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """メールメッセージを解析"""
        try:
            headers = msg['payload'].get('headers', [])
            
            # ヘッダー情報を取得
            subject = ""
            sender = ""
            sender_name = ""
            sender_email = ""
            date = ""
            to_addresses = []
            
            for header in headers:
                name = header['name'].lower()
                value = header['value']
                
                if name == 'subject':
                    subject = value
                elif name == 'from':
                    sender = value
                    # 送信者名とメールアドレスを分離
                    if '<' in value and '>' in value:
                        sender_name = value.split('<')[0].strip().strip('"')
                        sender_email = value.split('<')[1].split('>')[0]
                    else:
                        sender_email = value
                        sender_name = value
                elif name == 'date':
                    date = value
                elif name == 'to':
                    to_addresses.append(value)
            
            # メール本文を取得
            body = self._extract_email_body(msg['payload'])
            
            # 日付をISO形式に変換
            try:
                if date:
                    # より堅牢な日付パース
                    from email.utils import parsedate_to_datetime
                    date_obj = parsedate_to_datetime(date)
                    date = date_obj.isoformat()
                else:
                    date = datetime.now().isoformat()
            except Exception as date_error:
                print(f"日付解析エラー: {date_error}")
                date = datetime.now().isoformat()
            
            # ラベル情報を取得
            labels = msg.get('labelIds', [])
            is_read = 'UNREAD' not in labels
            is_starred = 'STARRED' in labels
            
            return {
                'id': msg['id'],
                'subject': subject,
                'sender': sender,
                'sender_name': sender_name,
                'sender_email': sender_email,
                'to': to_addresses,
                'date': date,
                'body': body,
                'snippet': msg.get('snippet', ''),
                'is_read': is_read,
                'is_starred': is_starred,
                'labels': labels,
                'thread_id': msg.get('threadId', '')
            }
            
        except Exception as e:
            print(f"❌ メール解析エラー: {e}")
            return None
    
    def _extract_email_body(self, payload: Dict[str, Any]) -> str:
        """メール本文を抽出"""
        try:
            body = ""
            
            def extract_from_parts(parts):
                """再帰的にパーツから本文を抽出"""
                for part in parts:
                    mime_type = part.get('mimeType', '')
                    
                    if mime_type == 'text/plain':
                        if 'data' in part.get('body', {}):
                            data = part['body']['data']
                            return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                    elif mime_type == 'text/html':
                        if 'data' in part.get('body', {}):
                            data = part['body']['data']
                            html_body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                            # HTMLタグを除去
                            plain_body = re.sub(r'<[^>]+>', '', html_body)
                            # 改行を正規化
                            plain_body = re.sub(r'\n\s*\n', '\n\n', plain_body)
                            return plain_body.strip()
                    elif 'parts' in part:
                        # ネストしたパーツを再帰的に処理
                        nested_body = extract_from_parts(part['parts'])
                        if nested_body:
                            return nested_body
                return ""
            
            if 'parts' in payload:
                # マルチパートメッセージ
                body = extract_from_parts(payload['parts'])
            else:
                # シンプルメッセージ
                mime_type = payload.get('mimeType', '')
                if mime_type == 'text/plain':
                    if 'data' in payload.get('body', {}):
                        data = payload['body']['data']
                        body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                elif mime_type == 'text/html':
                    if 'data' in payload.get('body', {}):
                        data = payload['body']['data']
                        html_body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                        # HTMLタグを除去
                        body = re.sub(r'<[^>]+>', '', html_body)
                        # 改行を正規化
                        body = re.sub(r'\n\s*\n', '\n\n', body)
                        body = body.strip()
            
            # 本文を適切な長さに制限
            if len(body) > 2000:
                body = body[:2000] + "..."
            
            return body
            
        except Exception as e:
            print(f"❌ 本文抽出エラー: {e}")
            return ""
    
    def search_emails(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """メールを検索"""
        if not self.service:
            if not self.authenticate():
                return []
        
        try:
            results = self.service.users().messages().list(
                userId='me',
                maxResults=limit,
                q=query
            ).execute()
            
            messages = results.get('messages', [])
            emails = []
            
            for message in messages:
                try:
                    msg = self.service.users().messages().get(
                        userId='me',
                        id=message['id'],
                        format='full'
                    ).execute()
                    
                    email_data = self._parse_email_message(msg)
                    if email_data:
                        emails.append(email_data)
                        
                except Exception as e:
                    print(f"メール解析エラー (ID: {message['id']}): {e}")
                    continue
            
            return emails
            
        except HttpError as error:
            print(f"Gmail API エラー: {error}")
            return []
        except Exception as e:
            print(f"メール検索エラー: {e}")
            return []
