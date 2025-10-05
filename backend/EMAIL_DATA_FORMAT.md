# メールデータ形式

## 📧 メールオブジェクト構造

Gmail APIから取得されるメールデータの形式：

```typescript
interface EmailData {
  id: string;                    // GmailメッセージID
  subject: string;               // 件名
  sender: string;                // 送信者（表示名 <email@domain.com>）
  sender_name: string;           // 送信者名のみ
  sender_email: string;          // 送信者メールアドレスのみ
  to: string[];                  // 宛先メールアドレス配列
  date: string;                  // ISO形式の日付
  body: string;                  // メール本文（プレーンテキスト、最大2000文字）
  snippet: string;               // Gmailのスニペット
  is_read: boolean;              // 既読/未読状態
  is_starred: boolean;           // スター付きかどうか
  labels: string[];              // Gmailラベル配列
  thread_id: string;             // スレッドID
}
```

## 🔄 フロントエンド対応

### React/TypeScript での使用例

```typescript
interface Email {
  id: string;
  subject: string;
  sender: string;
  sender_name: string;
  sender_email: string;
  to: string[];
  date: string;
  body: string;
  snippet: string;
  is_read: boolean;
  is_starred: boolean;
  labels: string[];
  thread_id: string;
}

// API呼び出し
const fetchEmails = async (limit: number = 10): Promise<Email[]> => {
  const response = await fetch(`/api/email/recent?limit=${limit}`);
  const data = await response.json();
  return data.emails;
};

// コンポーネントでの使用
const EmailList: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    fetchEmails(10).then(setEmails);
  }, []);

  return (
    <div>
      {emails.map((email) => (
        <div key={email.id} className={`email-item ${email.is_read ? 'read' : 'unread'}`}>
          <h3>{email.subject}</h3>
          <p>From: {email.sender_name} ({email.sender_email})</p>
          <p>Date: {new Date(email.date).toLocaleString()}</p>
          <p>{email.snippet}</p>
          {email.is_starred && <span>⭐</span>}
        </div>
      ))}
    </div>
  );
};
```

## 📊 データ変換例

### 日付フォーマット

```typescript
// ISO形式から表示用に変換
const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

### 送信者表示

```typescript
// 送信者名とメールアドレスを適切に表示
const formatSender = (email: Email): string => {
  if (email.sender_name && email.sender_name !== email.sender_email) {
    return `${email.sender_name} <${email.sender_email}>`;
  }
  return email.sender_email;
};
```

### ラベル表示

```typescript
// 重要なラベルのみ表示
const getImportantLabels = (labels: string[]): string[] => {
  const importantLabels = ['IMPORTANT', 'STARRED', 'SENT', 'DRAFT'];
  return labels.filter(label => importantLabels.includes(label));
};
```

## 🎨 UI表示の推奨事項

### メールリスト表示

- **未読メール**: 太字または背景色で強調
- **スター付きメール**: 星アイコンを表示
- **重要メール**: ラベルに応じたアイコン表示
- **送信者**: 名前がある場合は名前を優先表示
- **日付**: 相対時間（例: "2時間前"）と絶対時間の両方を考慮

### メール詳細表示

- **件名**: 大きく表示
- **送信者情報**: 名前、メールアドレス、送信日時
- **本文**: 適切な改行とフォーマット
- **ラベル**: タグ形式で表示

## 🔍 検索・フィルタリング

### フロントエンドでの検索

```typescript
const searchEmails = (emails: Email[], query: string): Email[] => {
  const lowerQuery = query.toLowerCase();
  return emails.filter(email => 
    email.subject.toLowerCase().includes(lowerQuery) ||
    email.sender_name.toLowerCase().includes(lowerQuery) ||
    email.sender_email.toLowerCase().includes(lowerQuery) ||
    email.body.toLowerCase().includes(lowerQuery)
  );
};
```

### フィルタリング

```typescript
const filterEmails = (emails: Email[], filter: string): Email[] => {
  switch (filter) {
    case 'unread':
      return emails.filter(email => !email.is_read);
    case 'starred':
      return emails.filter(email => email.is_starred);
    case 'important':
      return emails.filter(email => email.labels.includes('IMPORTANT'));
    default:
      return emails;
  }
};
```
