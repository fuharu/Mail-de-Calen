import os
import base64
import json
from typing import List, Dict, Optional
from datetime import datetime
import re

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Gmail API スコープ
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class GmailService:
    def __init__(self):
        self.service = None
        self.credentials = None
        
    def authenticate(self, user_id: str) -> bool:
        """Gmail API認証を実行"""
        try:
            # ユーザー固有のトークンファイル
            token_file = f'tokens/token_{user_id}.json'
            
            # 既存のトークンを確認
            if os.path.exists(token_file):
                self.credentials = Credentials.from_authorized_user_file(token_file, SCOPES)
            
            # トークンが無効または存在しない場合
            if not self.credentials or not self.credentials.valid:
                if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                    # トークンを更新
                    self.credentials.refresh(Request())
                else:
                    # 新しい認証フローを開始
                    flow = InstalledAppFlow.from_client_secrets_file(
                        'credentials/gmail_credentials.json', SCOPES)
                    self.credentials = flow.run_local_server(port=0)
                
                # トークンを保存
                os.makedirs('tokens', exist_ok=True)
                with open(token_file, 'w') as token:
                    token.write(self.credentials.to_json())
            
            # Gmail API サービスを構築
            self.service = build('gmail', 'v1', credentials=self.credentials)
            return True
            
        except Exception as e:
            print(f"Gmail認証エラー: {e}")
            return False
    
    def get_recent_emails(self, limit: int = 10) -> List[Dict]:
        """最近のメールを取得"""
        if not self.service:
            raise Exception("Gmail API サービスが初期化されていません")
        
        try:
            # メールリストを取得
            results = self.service.users().messages().list(
                userId='me', 
                maxResults=limit,
                q='in:inbox'
            ).execute()
            
            messages = results.get('messages', [])
            emails = []
            
            for message in messages:
                # メールの詳細を取得
                msg = self.service.users().messages().get(
                    userId='me', 
                    id=message['id'],
                    format='full'
                ).execute()
                
                # メール情報を抽出
                email_data = self._extract_email_data(msg)
                if email_data:
                    emails.append(email_data)
            
            return emails
            
        except HttpError as error:
            print(f"Gmail API エラー: {error}")
            raise Exception(f"Gmail API エラー: {error}")
    
    def _extract_email_data(self, message: Dict) -> Optional[Dict]:
        """メールデータを抽出"""
        try:
            headers = message['payload'].get('headers', [])
            
            # ヘッダー情報を抽出
            subject = self._get_header_value(headers, 'Subject')
            sender = self._get_header_value(headers, 'From')
            date = self._get_header_value(headers, 'Date')
            
            # メール本文を抽出
            body = self._extract_body(message['payload'])
            
            # 日付をパース
            parsed_date = self._parse_date(date)
            
            return {
                'id': message['id'],
                'subject': subject or '件名なし',
                'sender': sender or '送信者不明',
                'date': parsed_date,
                'body': body[:500] + '...' if len(body) > 500 else body,  # 本文を500文字に制限
                'snippet': message.get('snippet', ''),
                'thread_id': message.get('threadId', ''),
                'labels': message.get('labelIds', [])
            }
            
        except Exception as e:
            print(f"メールデータ抽出エラー: {e}")
            return None
    
    def _get_header_value(self, headers: List[Dict], name: str) -> Optional[str]:
        """ヘッダーから値を取得"""
        for header in headers:
            if header['name'].lower() == name.lower():
                return header['value']
        return None
    
    def _extract_body(self, payload: Dict) -> str:
        """メール本文を抽出"""
        body = ""
        
        if 'parts' in payload:
            # マルチパートメッセージ
            for part in payload['parts']:
                if part['mimeType'] == 'text/plain':
                    data = part['body'].get('data')
                    if data:
                        body += base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                elif part['mimeType'] == 'text/html':
                    data = part['body'].get('data')
                    if data:
                        html_body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                        # HTMLタグを除去
                        body += re.sub(r'<[^>]+>', '', html_body)
        else:
            # シンプルメッセージ
            if payload['mimeType'] == 'text/plain':
                data = payload['body'].get('data')
                if data:
                    body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
            elif payload['mimeType'] == 'text/html':
                data = payload['body'].get('data')
                if data:
                    html_body = base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
                    body = re.sub(r'<[^>]+>', '', html_body)
        
        return body.strip()
    
    def _parse_date(self, date_str: str) -> str:
        """日付文字列をパース"""
        try:
            # RFC 2822形式の日付をパース
            from email.utils import parsedate_to_datetime
            dt = parsedate_to_datetime(date_str)
            return dt.isoformat()
        except:
            try:
                # ISO形式の日付をパース
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                return dt.isoformat()
            except:
                return date_str
    
    def search_emails(self, query: str, limit: int = 10) -> List[Dict]:
        """メールを検索"""
        if not self.service:
            raise Exception("Gmail API サービスが初期化されていません")
        
        try:
            # 検索クエリを実行
            results = self.service.users().messages().list(
                userId='me',
                maxResults=limit,
                q=query
            ).execute()
            
            messages = results.get('messages', [])
            emails = []
            
            for message in messages:
                # メールの詳細を取得
                msg = self.service.users().messages().get(
                    userId='me',
                    id=message['id'],
                    format='full'
                ).execute()
                
                # メール情報を抽出
                email_data = self._extract_email_data(msg)
                if email_data:
                    emails.append(email_data)
            
            return emails
            
        except HttpError as error:
            print(f"Gmail検索エラー: {error}")
            raise Exception(f"Gmail検索エラー: {error}")
    
    def get_email_by_id(self, email_id: str) -> Optional[Dict]:
        """IDでメールを取得"""
        if not self.service:
            raise Exception("Gmail API サービスが初期化されていません")
        
        try:
            msg = self.service.users().messages().get(
                userId='me',
                id=email_id,
                format='full'
            ).execute()
            
            return self._extract_email_data(msg)
            
        except HttpError as error:
            print(f"メール取得エラー: {error}")
            return None
