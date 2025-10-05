# Gmail API セットアップ手順

## 🚀 クイックスタート

### 1. Google Cloud Console での設定

1. **プロジェクト作成**
   - [Google Cloud Console](https://console.cloud.google.com/) にアクセス
   - 新しいプロジェクトを作成または既存プロジェクトを選択

2. **Gmail API 有効化**
   - 「APIとサービス」→「ライブラリ」
   - "Gmail API" を検索して有効化

3. **認証情報作成**
   - 「APIとサービス」→「認証情報」
   - 「認証情報を作成」→「OAuth クライアント ID」
   - アプリケーションの種類: 「デスクトップアプリケーション」
   - 名前: "Mail de Calen Gmail API"

4. **認証情報ダウンロード**
   - 作成されたOAuth クライアント ID のダウンロードボタンをクリック
   - ダウンロードしたJSONファイルを `backend/credentials.json` として保存

### 2. 認証情報ファイルの配置

```
backend/
├── credentials/
│   └── firebase-service-account.json  (既存)
├── credentials.json                   (新規追加) ← ここに配置
└── tokens/
    └── haruto7fujimoto_gmail_com_token.json  (認証後に自動生成)
```

### 3. 初回認証

1. **サーバー起動**
   ```bash
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **メール取得API呼び出し**
   ```bash
   curl -X GET "http://localhost:8000/api/email/recent?limit=5"
   ```

3. **ブラウザ認証**
   - 初回呼び出し時にブラウザが自動的に開きます
   - Googleアカウントでログイン
   - アプリケーションの権限を許可
   - 認証完了後、トークンファイルが自動生成されます

## 📧 メール取得機能

### API エンドポイント

```http
GET /api/email/recent?limit=10
```

### レスポンス例

```json
{
  "emails": [
    {
      "id": "18c5f8a1b2c3d4e5",
      "subject": "会議の件",
      "sender": "manager@company.com",
      "sender_name": "田中 太郎",
      "sender_email": "manager@company.com",
      "to": ["haruto7fujimoto@gmail.com"],
      "date": "2024-10-08T10:30:00+09:00",
      "body": "明日の会議についてお知らせします。\n\n時間: 14:00-15:00\n場所: 会議室A",
      "snippet": "明日の会議についてお知らせします。",
      "is_read": true,
      "is_starred": false,
      "labels": ["INBOX", "IMPORTANT"],
      "thread_id": "18c5f8a1b2c3d4e5"
    }
  ]
}
```

## 🔧 トラブルシューティング

### 認証エラー
- `credentials.json` ファイルが正しい場所にあるか確認
- Google Cloud Console でGmail APIが有効になっているか確認
- OAuth クライアント ID が正しく作成されているか確認

### トークンエラー
- `tokens/` ディレクトリの権限を確認
- 古いトークンファイルを削除して再認証

### API制限
- Gmail API には1日あたりのリクエスト制限があります
- 大量のメール取得時は注意が必要です

## 🔒 セキュリティ

- `credentials.json` と `tokens/` ディレクトリは `.gitignore` に追加してください
- 本番環境では適切な認証情報管理を行ってください

## 📝 ログ

Gmail APIの動作状況はサーバーログで確認できます：

```
🔐 Gmail API認証を開始します...
🌐 ブラウザが開きますので、Googleアカウントでログインしてください
✅ Gmail API認証が完了しました
📧 受信箱から最新 5 件のメールを取得中...
📬 メールリスト取得成功: 5 件
📄 メール詳細取得中 (1/5): 18c5f8a1b2c3d4e5
✅ メール解析完了: 会議の件
🎉 メール取得完了: 5 件
```
