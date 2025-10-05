# Gemini API セットアップガイド

## 🔑 Gemini APIキーの取得方法

### 1. Google AI Studio にアクセス
1. [Google AI Studio](https://aistudio.google.com/) にアクセス
2. Googleアカウントでログイン

### 2. APIキーを生成
1. 左側のメニューから「Get API key」をクリック
2. 「Create API key」をクリック
3. プロジェクトを選択（または新規作成）
4. APIキーが生成される

### 3. 環境変数の設定
1. 生成されたAPIキーをコピー
2. `backend/.env` ファイルを開く
3. 以下のように設定：
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 4. サーバーの再起動
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 📋 注意事項
- APIキーは機密情報です。Gitにコミットしないでください
- `.env` ファイルは `.gitignore` に追加することを推奨
- APIキーには使用制限があります

## 🧪 テスト方法
1. フロントエンドで「最近のメールを一括解析」ボタンをクリック
2. ターミナルでGemini APIの解析ログを確認
3. 解析結果が表示されることを確認
