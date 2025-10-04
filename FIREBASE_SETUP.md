# Firebase設定手順

## Firebase ConsoleからAPIキーを取得する手順

### 1. Firebase Consoleにアクセス
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. Googleアカウントでログイン

### 2. プロジェクトを選択
1. `mail-de-calen`プロジェクトを選択
2. プロジェクトが存在しない場合は、新規作成

### 3. プロジェクト設定を開く
1. 左側のメニューから「⚙️ プロジェクトの設定」をクリック
2. 「全般」タブを選択

### 4. アプリの設定を確認
1. 「アプリ」セクションでWebアプリを確認
2. アプリが存在しない場合は「</> Webアプリを追加」をクリック

### 5. 設定値を取得
以下の値をコピーしてください：

```
apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
authDomain: "mail-de-calen.firebaseapp.com"
projectId: "mail-de-calen"
storageBucket: "mail-de-calen.appspot.com"
messagingSenderId: "108356540856054342054"
appId: "1:108356540856054342054:web:XXXXXXXXXXXXXXXX"
```

### 6. 環境変数ファイルを更新
`frontend/.env.local`ファイルを以下のように更新：

```env
# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=取得したAPIキー
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mail-de-calen.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mail-de-calen
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mail-de-calen.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=108356540856054342054
NEXT_PUBLIC_FIREBASE_APP_ID=取得したアプリID

# API設定
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 7. 認証プロバイダーの設定
1. Firebase Consoleの左側メニューから「Authentication」を選択
2. 「Sign-in method」タブを選択
3. 「Google」プロバイダーを有効化
4. プロジェクトのサポートメールを設定
5. 「保存」をクリック

### 8. フロントエンドサーバーの再起動
```bash
cd frontend
npm run dev
```

## トラブルシューティング

### APIキーが無効なエラー
- Firebase Consoleから正しいAPIキーを取得しているか確認
- 環境変数ファイルが正しく保存されているか確認
- フロントエンドサーバーを再起動しているか確認

### 認証プロバイダーが無効
- Firebase ConsoleでGoogle認証が有効になっているか確認
- プロジェクトのサポートメールが設定されているか確認

### ドメインが許可されていない
- Firebase Consoleの「Authentication」>「Settings」>「Authorized domains」で`localhost`が追加されているか確認
