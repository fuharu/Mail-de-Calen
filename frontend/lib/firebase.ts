import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// 設定確認用（開発時のみ）
console.log('Firebase設定確認:', firebaseConfig);

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firebaseサービスを初期化
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google認証プロバイダー
export const googleProvider = new GoogleAuthProvider();

export default app;