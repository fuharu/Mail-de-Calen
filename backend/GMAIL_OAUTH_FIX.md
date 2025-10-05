# Gmail API OAuth エラー修正ガイド

## 🚨 エラー: redirect_uri_mismatch

### 問題の原因
Google Cloud Consoleで設定したOAuth クライアント IDのリダイレクトURIと、実際のアプリケーションが使用しているリダイレクトURIが一致していません。

### 解決方法

#### 1. Google Cloud Console での設定修正

1. **Google Cloud Console にアクセス**
   - [Google Cloud Console](https://console.cloud.google.com/) にログイン
   - 該当のプロジェクトを選択

2. **OAuth クライアント ID の編集**
   - 「APIとサービス」→「認証情報」に移動
   - 作成したOAuth クライアント ID をクリック
   - 「編集」ボタンをクリック

3. **リダイレクトURI の追加**
   - 「承認済みのリダイレクト URI」セクションに以下を追加：
   ```
   http://localhost:8080
   http://localhost:8080/
   http://127.0.0.1:8080
   http://127.0.0.1:8080/
   ```
   - **重要**: ポート8080が固定で使用されるようになりました

4. **設定を保存**
   - 「保存」ボタンをクリック

#### 2. 代替解決方法（推奨）

より確実な方法として、以下のリダイレクトURIを追加してください：

```
http://localhost:8080
http://localhost:8080/
http://127.0.0.1:8080
http://127.0.0.1:8080/
http://localhost
http://localhost/
```

#### 3. 認証情報ファイルの再ダウンロード

1. **新しい認証情報をダウンロード**
   - 修正したOAuth クライアント ID の右側にあるダウンロードボタンをクリック
   - 新しいJSONファイルをダウンロード

2. **ファイルの置き換え**
   - 古い `credentials.json` を削除
   - 新しいJSONファイルを `backend/credentials.json` として保存

#### 4. 古いトークンファイルの削除

```bash
# 古いトークンファイルを削除
rm backend/tokens/haruto7fujimoto_gmail_com_token.json
```

#### 5. 再認証の実行

1. **サーバーを再起動**
   ```bash
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **メール取得APIを呼び出し**
   ```bash
   curl -X GET "http://localhost:8000/api/email/recent?limit=3"
   ```

3. **ブラウザ認証**
   - ブラウザが開いたら、Googleアカウントでログイン
   - アプリケーションの権限を許可

### 🔧 トラブルシューティング

#### まだエラーが発生する場合

1. **すべてのリダイレクトURIを確認**
   - Google Cloud Consoleで設定したURIが正しいか確認
   - ポート番号が一致しているか確認

2. **認証情報ファイルの確認**
   - `credentials.json` の内容が正しいか確認
   - ファイルの場所が `backend/credentials.json` であることを確認

3. **キャッシュのクリア**
   - ブラウザのキャッシュをクリア
   - プライベート/シークレットモードで試行

#### よくあるリダイレクトURI

デスクトップアプリケーションでよく使用されるリダイレクトURI：

```
http://localhost:8080
http://localhost:8080/
http://127.0.0.1:8080
http://127.0.0.1:8080/
http://localhost
http://localhost/
```

### 📝 注意事項

- リダイレクトURIは完全に一致する必要があります
- ポート番号も正確に設定してください
- 設定変更後は数分待ってから再試行してください
- 本番環境では適切なドメインを設定してください

### 🎯 成功の確認

認証が成功すると、以下のようなログが表示されます：

```
🔐 Gmail API認証を開始します...
🌐 ブラウザが開きますので、Googleアカウントでログインしてください
✅ Gmail API認証が完了しました
📧 受信箱から最新 3 件のメールを取得中...
📬 メールリスト取得成功: 3 件
🎉 メール取得完了: 3 件
```
