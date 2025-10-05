import os
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from datetime import datetime, timedelta
import re

class GeminiService:
    def __init__(self):
        """Gemini API サービスを初期化"""
        self.api_key = os.getenv('GEMINI_API_KEY')
        print(f"🔍 Gemini API キー確認: {'SET' if self.api_key else 'NOT SET'}")
        print(f"🔍 API キー長: {len(self.api_key) if self.api_key else 0}")
        
        if not self.api_key or self.api_key == 'your_gemini_api_key_here':
            print("⚠️ GEMINI_API_KEY が設定されていません。モック解析を実行します。")
            self.model = None
            return
        
        try:
            print("🔧 Gemini API を設定中...")
            # Gemini API を設定
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            print("✅ Gemini API 初期化成功")
        except Exception as e:
            print(f"❌ Gemini API 初期化エラー: {e}")
            print(f"❌ エラー詳細: {type(e).__name__}: {str(e)}")
            self.model = None
        
    def analyze_email_content(self, email_content: str, sender: str, subject: str) -> Dict[str, Any]:
        """メール内容を解析してタスクとイベントを抽出"""
        print(f"🔍 メール解析開始: {subject}")
        print(f"🔍 Gemini API モデル状態: {'利用可能' if self.model else '利用不可'}")
        
        # Gemini APIが利用できない場合はモック解析を実行
        if not self.model:
            print("⚠️ Gemini API モデルが利用できないため、モック解析を実行します")
            return self._mock_analysis(email_content, sender, subject)
        
        try:
            print("🔧 Gemini API プロンプトを作成中...")
            # プロンプトを作成
            prompt = self._create_analysis_prompt(email_content, sender, subject)
            
            print("🚀 Gemini API にリクエスト送信中...")
            # Gemini API に送信
            response = self.model.generate_content(prompt)
            
            print("📝 Gemini API レスポンスを解析中...")
            print(f"🔍 Gemini API レスポンス: {response.text[:200]}...")  # 最初の200文字を表示
            
            # レスポンスを解析
            analysis_result = self._parse_gemini_response(response.text)
            
            print(f"🔍 解析結果: tasks={len(analysis_result.get('tasks', []))}件, events={len(analysis_result.get('events', []))}件")
            print("✅ Gemini API 解析完了")
            return analysis_result
            
        except Exception as e:
            print(f"Gemini API エラー: {e}")
            # エラー時はモック解析にフォールバック
            return self._mock_analysis(email_content, sender, subject)
    
    def _mock_analysis(self, email_content: str, sender: str, subject: str) -> Dict[str, Any]:
        """モック解析（Gemini APIが利用できない場合）"""
        print(f"🤖 モック解析を実行: {subject}")
        
        # 件名から簡単な解析を実行
        tasks = []
        events = []
        
        # 件名に「会議」「ミーティング」が含まれる場合
        if any(keyword in subject.lower() for keyword in ['会議', 'ミーティング', 'meeting']):
            events.append({
                'title': f'{subject}への参加',
                'date': '2024-01-15T10:00:00',
                'location': '未定',
                'description': f'{sender}からの会議招待',
                'confidence': 0.8
            })
        
        # 件名に「タスク」「TODO」「依頼」が含まれる場合
        if any(keyword in subject.lower() for keyword in ['タスク', 'todo', '依頼', 'お願い']):
            tasks.append({
                'title': f'{subject}の対応',
                'description': f'{sender}からの依頼事項',
                'priority': 'medium',
                'due_date': '2024-01-20T23:59:59',
                'confidence': 0.7
            })
        
        return {
            'tasks': tasks,
            'events': events,
            'confidence': 0.6,
            'summary': f'{subject}の解析結果（モック）'
        }
    
    def _create_analysis_prompt(self, email_content: str, sender: str, subject: str) -> str:
        """メール解析用のプロンプトを作成"""
        prompt = f"""
以下のメール内容を分析して、タスク（ToDo）とイベント（予定）を抽出してください。

【メール情報】
送信者: {sender}
件名: {subject}
内容: {email_content}

【抽出ルール】
1. タスク（ToDo）: 実行すべき作業、期限があるもの、完了が必要なもの
2. イベント（予定）: 会議、打ち合わせ、セミナー、イベントなど、特定の日時に発生するもの

【出力形式】
以下のJSON形式で回答してください：

{{
  "tasks": [
    {{
      "title": "タスクのタイトル",
      "description": "タスクの詳細説明",
      "due_date": "YYYY-MM-DDTHH:MM:SS" (期限がある場合のみ、ISO形式),
      "priority": "high|medium|low",
      "confidence": 0.0-1.0
    }}
  ],
  "events": [
    {{
      "title": "イベントのタイトル",
      "description": "イベントの詳細説明",
      "start": "YYYY-MM-DDTHH:MM:SS" (ISO形式),
      "end": "YYYY-MM-DDTHH:MM:SS" (ISO形式),
      "location": "場所（分かる場合のみ）",
      "confidence": 0.0-1.0
    }}
  ],
  "overall_confidence": 0.0-1.0
}}

【注意事項】
- 日時が不明確な場合は、現在時刻を基準に推測してください
- 信頼度（confidence）は抽出の確実性を0.0-1.0で表してください
- タスクやイベントが見つからない場合は空の配列を返してください
- JSON以外のテキストは含めないでください
"""
        return prompt
    
    def _parse_gemini_response(self, response_text: str) -> Dict[str, Any]:
        """Gemini API のレスポンスを解析"""
        try:
            # JSON部分を抽出
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if not json_match:
                raise ValueError("JSON形式のレスポンスが見つかりません")
            
            json_str = json_match.group()
            result = json.loads(json_str)
            
            # 結果を検証・正規化
            normalized_result = self._normalize_analysis_result(result)
            
            return normalized_result
            
        except json.JSONDecodeError as e:
            print(f"JSON解析エラー: {e}")
            return {
                'tasks': [],
                'events': [],
                'confidence': 0.0,
                'error': f"JSON解析エラー: {e}"
            }
        except Exception as e:
            print(f"レスポンス解析エラー: {e}")
            return {
                'tasks': [],
                'events': [],
                'confidence': 0.0,
                'error': f"レスポンス解析エラー: {e}"
            }
    
    def _normalize_analysis_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """解析結果を正規化"""
        normalized = {
            'tasks': [],
            'events': [],
            'confidence': result.get('overall_confidence', 0.0)
        }
        
        # タスクを正規化
        for task in result.get('tasks', []):
            normalized_task = {
                'title': task.get('title', ''),
                'description': task.get('description', ''),
                'due_date': self._normalize_datetime(task.get('due_date')),
                'priority': task.get('priority', 'medium'),
                'confidence': float(task.get('confidence', 0.0))
            }
            if normalized_task['title']:
                normalized['tasks'].append(normalized_task)
        
        # イベントを正規化
        for event in result.get('events', []):
            normalized_event = {
                'title': event.get('title', ''),
                'description': event.get('description', ''),
                'start': self._normalize_datetime(event.get('start')),
                'end': self._normalize_datetime(event.get('end')),
                'location': event.get('location', ''),
                'confidence': float(event.get('confidence', 0.0))
            }
            if normalized_event['title'] and normalized_event['start']:
                # 終了時刻がない場合は開始時刻から1時間後を設定
                if not normalized_event['end']:
                    start_time = datetime.fromisoformat(normalized_event['start'].replace('Z', '+00:00'))
                    end_time = start_time + timedelta(hours=1)
                    normalized_event['end'] = end_time.isoformat()
                
                normalized['events'].append(normalized_event)
        
        return normalized
    
    def _normalize_datetime(self, datetime_str: Optional[str]) -> Optional[str]:
        """日時文字列を正規化"""
        if not datetime_str:
            return None
        
        try:
            # 様々な日時形式を解析
            formats = [
                '%Y-%m-%dT%H:%M:%S',
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%dT%H:%M',
                '%Y-%m-%d %H:%M',
                '%Y-%m-%d',
                '%m/%d/%Y %H:%M',
                '%m/%d/%Y',
                '%d/%m/%Y %H:%M',
                '%d/%m/%Y'
            ]
            
            for fmt in formats:
                try:
                    dt = datetime.strptime(datetime_str, fmt)
                    # 時刻が指定されていない場合は9:00をデフォルトとする
                    if fmt.endswith('%Y'):
                        dt = dt.replace(hour=9, minute=0, second=0)
                    return dt.isoformat()
                except ValueError:
                    continue
            
            # パースできない場合は現在時刻を返す
            return datetime.now().isoformat()
            
        except Exception as e:
            print(f"日時正規化エラー: {e}")
            return datetime.now().isoformat()
    
    def extract_keywords(self, text: str) -> List[str]:
        """テキストからキーワードを抽出"""
        try:
            prompt = f"""
以下のテキストから重要なキーワードを抽出してください。
ビジネス、プロジェクト、会議、タスクに関連する重要な単語やフレーズを抽出してください。

テキスト: {text}

出力形式: カンマ区切りのキーワードリスト
例: 会議, プロジェクト, デッドライン, プレゼン, レビュー
"""
            
            response = self.model.generate_content(prompt)
            keywords = [kw.strip() for kw in response.text.split(',')]
            
            return keywords[:10]  # 最大10個のキーワード
            
        except Exception as e:
            print(f"キーワード抽出エラー: {e}")
            return []
    
    def summarize_email(self, email_content: str) -> str:
        """メール内容を要約"""
        try:
            prompt = f"""
以下のメール内容を簡潔に要約してください。
重要なポイント、アクションアイテム、期限などを含めてください。

メール内容: {email_content}

要約（100文字以内）:
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"メール要約エラー: {e}")
            return "要約できませんでした"
