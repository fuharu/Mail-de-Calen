# Mail de Calen API - Postman Collection

このディレクトリには、Mail de Calen APIのPostmanコレクションと環境設定が含まれています。

## 📁 ファイル構成

- `Mail-de-Calen-API.postman_collection.json` - APIエンドポイントのコレクション
- `Mail-de-Calen-Environment.postman_environment.json` - 環境変数の設定
- `test-scripts.js` - テストスクリプト
- `README.md` - このファイル

## 🚀 セットアップ手順

### 1. Postmanのインストール
[Postman公式サイト](https://www.postman.com/downloads/)からPostmanをダウンロード・インストール

### 2. コレクションのインポート
1. Postmanを開く
2. 「Import」ボタンをクリック
3. `Mail-de-Calen-API.postman_collection.json`を選択してインポート

### 3. 環境のインポート
1. Postmanで「Environments」タブを開く
2. 「Import」ボタンをクリック
3. `Mail-de-Calen-Environment.postman_environment.json`を選択してインポート

### 4. 環境の選択
1. 右上の環境ドロップダウンから「Mail de Calen Environment」を選択

## 🔧 環境変数の設定

### 必須設定
- `firebase_token`: Firebase認証トークン（Firebase Consoleで取得）
- `user_email`: テスト用のユーザーメールアドレス

### オプション設定
- `base_url`: APIのベースURL（デフォルト: http://localhost:8000）
- `auth_code`: OAuth認証コード（OAuthフローで使用）

## 📋 APIエンドポイント一覧

### Health Check
- `GET /` - ルートエンドポイント
- `GET /health` - ヘルスチェック

### Authentication
- `GET /api/auth/verify` - トークン検証

### OAuth
- `GET /oauth/auth` - OAuth認証開始
- `GET /oauth/callback` - OAuth認証コールバック
- `GET /oauth/user-info/{user_email}` - ユーザー情報取得
- `GET /oauth/test-apis/{user_email}` - API接続テスト

### Email
- `GET /api/email/recent` - 最近のメール取得
- `POST /api/email/analyze` - メール解析
- `GET /api/email/analysis/{email_id}` - 解析結果取得
- `POST /api/email/process-all` - 全メール処理
- `POST /api/email/process-single` - 単一メール処理
- `POST /api/email/check-new` - 新着メールチェック
- `POST /api/email/save-candidates` - 候補保存

### Calendar
- `GET /api/calendar/events` - イベント取得
- `POST /api/calendar/events` - イベント作成
- `PUT /api/calendar/events/{event_id}` - イベント更新
- `DELETE /api/calendar/events/{event_id}` - イベント削除

### Todos
- `GET /api/todos/` - ToDo取得
- `POST /api/todos/` - ToDo作成
- `PUT /api/todos/{todo_id}` - ToDo更新
- `DELETE /api/todos/{todo_id}` - ToDo削除

### Candidates
- `GET /api/candidates/events` - イベント候補取得
- `POST /api/candidates/events/approve` - イベント候補承認
- `DELETE /api/candidates/events/{candidate_id}` - イベント候補却下
- `GET /api/candidates/todos` - ToDo候補取得
- `POST /api/candidates/todos/approve` - ToDo候補承認
- `DELETE /api/candidates/todos/{candidate_id}` - ToDo候補却下

### Polling
- `POST /api/polling/start` - ポーリング開始
- `POST /api/polling/stop` - ポーリング停止
- `GET /api/polling/status` - ポーリングステータス

## 🧪 テストの実行

### 1. 個別テスト
各リクエストの「Tests」タブでテストスクリプトが自動実行されます。

### 2. コレクション全体のテスト
1. コレクションを右クリック
2. 「Run collection」を選択
3. テストを実行

### 3. テストスクリプトの内容
- レスポンス時間の検証（5秒以内）
- ステータスコードの検証（200）
- レスポンス形式の検証（JSON）
- 認証エラーの検証
- 成功レスポンスの検証
- エラーハンドリングの検証

## 🔄 チームでの使用方法

### 1. バージョン管理
- コレクションファイルをGitで管理
- 変更時はコミット・プッシュしてチームと共有

### 2. 環境の共有
- 本番環境用の環境ファイルを作成
- 開発環境と本番環境を分けて管理

### 3. ドキュメント更新
- APIに変更があった場合はコレクションを更新
- READMEファイルも併せて更新

## 📊 モニタリング

### 1. レスポンス時間の監視
- 各リクエストのレスポンス時間を記録
- 5秒を超える場合は要調査

### 2. エラー率の監視
- 4xx、5xxエラーの発生率を監視
- エラーが多発する場合はAPIの確認が必要

### 3. ログの確認
- テストスクリプトでコンソールログを出力
- 問題発生時はログを確認

## 🚨 トラブルシューティング

### 認証エラー
- `firebase_token`が正しく設定されているか確認
- トークンの有効期限を確認

### 接続エラー
- `base_url`が正しく設定されているか確認
- バックエンドサーバーが起動しているか確認

### データエラー
- リクエストボディの形式が正しいか確認
- 必須パラメータが含まれているか確認

## 📝 更新履歴

- v1.0.0 (2024-01-15) - 初回リリース
  - 全APIエンドポイントのコレクション作成
  - 環境変数設定
  - テストスクリプト実装
