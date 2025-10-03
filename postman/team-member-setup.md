# チームメンバー向け Postman セットアップガイド

## 🚀 新メンバーのセットアップ手順

### **1. 前提条件**
- Postmanがインストール済み
- Mail de Calenアプリケーションにアクセス可能
- Googleアカウントでログイン済み

### **2. コレクションのインポート**

#### **Step 1: コレクションファイルの取得**
```bash
# Gitから最新のコレクションを取得
git pull origin main
```

#### **Step 2: Postmanにインポート**
1. **Postmanを開く**
2. **「Import」→「Upload Files」**
3. **`postman/Mail-de-Calen-API.postman_collection.json`を選択**
4. **「Import」をクリック**

### **3. 環境のセットアップ**

#### **Step 1: 環境テンプレートのインポート**
1. **Postmanで「Environments」タブを開く**
2. **「Import」→「Upload Files」**
3. **`postman/environment-template.json`を選択**
4. **「Import」をクリック**

#### **Step 2: 環境のカスタマイズ**
1. **インポートした環境をクリック**
2. **環境名を変更**（例：「Mail de Calen - 田中太郎」）
3. **以下の変数を設定**：

```json
{
  "user_email": "あなたのメールアドレス",
  "firebase_token": "YOUR_FIREBASE_TOKEN_HERE"
}
```

### **4. Firebase認証トークンの取得**

#### **Step 1: アプリケーションにログイン**
1. **ブラウザで http://localhost:3000 にアクセス**
2. **Googleアカウントでログイン**

#### **Step 2: トークンの取得**
1. **開発者ツールを開く**（F12）
2. **Consoleタブを選択**
3. **以下のコードを実行**：

```javascript
// Firebase認証トークンを取得
firebase.auth().currentUser.getIdToken().then(token => {
    console.log('Firebase Token:', token);
    // このトークンをコピーしてPostmanのfirebase_tokenに設定
});
```

#### **Step 3: Postmanにトークンを設定**
1. **Postmanで環境を開く**
2. **`firebase_token`の値を更新**
3. **「Save」をクリック**

### **5. 環境の選択**

#### **Step 1: 環境の選択**
1. **Postmanの右上角の環境ドロップダウンをクリック**
2. **作成した環境を選択**

### **6. 接続テスト**

#### **Step 1: バックエンドサーバーの確認**
```bash
# バックエンドサーバーが起動しているか確認
curl http://localhost:8000/
```

#### **Step 2: Postmanでテスト**
1. **「Health Check」→「Root Endpoint」を実行**
2. **レスポンスが正常に返ってくることを確認**

#### **Step 3: 認証テスト**
1. **「Authentication」→「Verify Token」を実行**
2. **認証が成功することを確認**

### **7. トラブルシューティング**

#### **よくある問題**

##### **1. 認証エラー（401 Unauthorized）**
**原因**: Firebaseトークンが無効または期限切れ
**解決方法**: 
1. トークンを再取得
2. Postmanの環境変数を更新

##### **2. 接続エラー（Could not get any response）**
**原因**: バックエンドサーバーが起動していない
**解決方法**: 
```bash
cd backend
python main.py
```

##### **3. CORSエラー**
**原因**: フロントエンドとバックエンドのポートが異なる
**解決方法**: バックエンドのCORS設定を確認

### **8. チームでの協力**

#### **コレクションの更新**
- コレクションに変更があった場合は `git pull` で最新版を取得
- 新しいエンドポイントが追加された場合は環境変数を確認

#### **環境の管理**
- 個人の環境ファイルはGitにコミットしない
- 機密情報（トークンなど）は環境変数で管理

#### **テストの実行**
- 新機能のテストは必ず実行
- エラーが発生した場合はチームに報告

### **9. セキュリティ注意事項**

#### **トークンの管理**
- Firebaseトークンは定期的に更新される
- トークンは他人と共有しない
- 不要になったトークンは無効化する

#### **環境ファイル**
- 個人の環境ファイルはGitにコミットしない
- 機密情報はPostmanの「Secret」タイプを使用

### **10. サポート**

問題が発生した場合は、以下の順序で確認してください：

1. **このドキュメントの確認**
2. **Postmanの公式ドキュメントの確認**
3. **チーム内での相談**
4. **開発者への連絡**

---

**Happy Testing! 🚀**
