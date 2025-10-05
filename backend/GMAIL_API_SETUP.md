# Gmail API セットアップガイド

## 1. Google Cloud Console での設定

### 1.1 プロジェクトの作成
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択

### 1.2 Gmail API の有効化
1. 「APIとサービス」→「ライブラリ」に移動
2. "Gmail API" を検索
3. Gmail API を選択して「有効にする」をクリック

### 1.3 認証情報の作成
1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「OAuth クライアント ID」を選択
3. アプリケーションの種類: 「デスクトップアプリケーション」を選択
4. 名前を入力（例: "Mail de Calen Gmail API"）
5. 「作成」をクリック

### 1.4 認証情報ファイルのダウンロード
1. 作成されたOAuth クライアント ID の右側にあるダウンロードボタンをクリック
2. ダウンロードされたJSONファイルを `backend/credentials.json` として保存

## 2. 認証情報ファイルの配置

```
backend/
├── credentials/
│   └── firebase-service-account.json  (既存)
├── credentials.json                   (新規追加)
└── tokens/
    └── haruto7fujimoto_gmail_com_token.json  (認証後に自動生成)
```

## 3. 初回認証

### 3.1 サーバー起動
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3.2 メール取得API呼び出し
```bash
curl -X GET "http://localhost:8000/api/email/recent?limit=5"
```

### 3.3 ブラウザ認証
1. 初回呼び出し時にブラウザが自動的に開きます
2. Googleアカウントでログイン
3. アプリケーションの権限を許可
4. 認証完了後、トークンファイルが自動生成されます

## 4. 認証スコープ

以下のスコープが使用されます：
- `https://www.googleapis.com/auth/gmail.readonly` - メールの読み取り
- `https://www.googleapis.com/auth/gmail.modify` - メールの変更（将来の機能用）

## 5. トラブルシューティング

### 5.1 認証エラー
- `credentials.json` ファイルが正しい場所にあるか確認
- Google Cloud Console でGmail APIが有効になっているか確認
- OAuth クライアント ID が正しく作成されているか確認

### 5.2 トークンエラー
- `tokens/` ディレクトリの権限を確認
- 古いトークンファイルを削除して再認証

### 5.3 API制限
- Gmail API には1日あたりのリクエスト制限があります
- 大量のメール取得時は注意が必要です

## 6. セキュリティ注意事項

- `credentials.json` と `tokens/` ディレクトリは `.gitignore` に追加してください
- 本番環境では適切な認証情報管理を行ってください
