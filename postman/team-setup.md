# チーム用 Postman セットアップガイド

## 🎯 チームでのAPI管理のベストプラクティス

### 1. ワークスペースの設定

#### 個人ワークスペース
- 開発中のテスト用
- 実験的なリクエスト用

#### チームワークスペース
- 公式なAPIテスト用
- チーム全体で共有するコレクション用

### 2. 環境の分離

#### 開発環境
```json
{
  "base_url": "http://localhost:8000",
  "firebase_token": "dev_token_here"
}
```

#### ステージング環境
```json
{
  "base_url": "https://staging-api.mail-de-calen.com",
  "firebase_token": "staging_token_here"
}
```

#### 本番環境
```json
{
  "base_url": "https://api.mail-de-calen.com",
  "firebase_token": "prod_token_here"
}
```

### 3. コレクションの構造

```
Mail de Calen API/
├── Health Check/
├── Authentication/
├── OAuth/
├── Email/
├── Calendar/
├── Todos/
├── Candidates/
└── Polling/
```

### 4. テスト戦略

#### 単体テスト
- 各エンドポイントの個別テスト
- レスポンス形式の検証
- エラーハンドリングの検証

#### 統合テスト
- エンドポイント間の連携テスト
- データフローの検証
- 認証フローの検証

#### パフォーマンステスト
- レスポンス時間の測定
- 同時接続数のテスト
- 負荷テスト

### 5. ドキュメント管理

#### API仕様書
- Postmanの「Documentation」機能を使用
- 各エンドポイントの説明を記載
- リクエスト・レスポンス例を記載

#### 変更履歴
- コレクションのバージョン管理
- 変更内容の記録
- 影響範囲の分析

### 6. チーム内での役割分担

#### 開発者
- 新機能のAPIテスト
- バグ修正の検証
- パフォーマンステスト

#### QAエンジニア
- 統合テストの実行
- エッジケースのテスト
- 回帰テストの実行

#### DevOpsエンジニア
- 本番環境でのテスト
- 監視・アラートの設定
- パフォーマンス監視

### 7. 自動化の設定

#### Newman（CLI）
```bash
# コレクション全体のテスト実行
newman run Mail-de-Calen-API.postman_collection.json -e Mail-de-Calen-Environment.postman_environment.json

# レポート生成
newman run Mail-de-Calen-API.postman_collection.json -e Mail-de-Calen-Environment.postman_environment.json --reporters cli,html --reporter-html-export report.html
```

#### CI/CD統合
```yaml
# GitHub Actions例
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install Newman
        run: npm install -g newman
      - name: Run API Tests
        run: newman run postman/Mail-de-Calen-API.postman_collection.json -e postman/Mail-de-Calen-Environment.postman_environment.json
```

### 8. セキュリティ考慮事項

#### 認証情報の管理
- 環境変数でトークンを管理
- 機密情報はPostmanの「Secret」タイプを使用
- 定期的なトークンの更新

#### アクセス制御
- チームメンバーの権限設定
- 本番環境へのアクセス制限
- 監査ログの記録

### 9. メンテナンス

#### 定期的な更新
- コレクションの更新
- 環境変数の更新
- テストスクリプトの更新

#### 監視・アラート
- APIの可用性監視
- レスポンス時間の監視
- エラー率の監視

### 10. トラブルシューティング

#### よくある問題
1. **認証エラー**: トークンの有効期限切れ
2. **接続エラー**: サーバーの起動状況確認
3. **データエラー**: リクエスト形式の確認

#### 解決方法
1. ログの確認
2. 環境変数の確認
3. ネットワーク接続の確認
4. サーバー状態の確認

## 📞 サポート

問題が発生した場合は、以下の順序で確認してください：

1. このドキュメントの確認
2. Postmanの公式ドキュメントの確認
3. チーム内での相談
4. 開発者への連絡
