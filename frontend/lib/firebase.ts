import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:demo"
};

// デバッグ用：環境変数の確認
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Firebase環境変数デバッグ:');
  console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ 設定済み' : '❌ 未設定');
  console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ 設定済み' : '❌ 未設定');
  console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ 設定済み' : '❌ 未設定');
}

// 環境変数の検証（開発環境でのみ）
if (process.env.NODE_ENV === 'development') {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.warn('Firebase設定警告: 以下の環境変数が設定されていません:', missingEnvVars);
    console.warn('フロントエンドの.env.localファイルを確認してください。');
  } else {
    console.log('✅ Firebase環境変数が正しく設定されています');
  }
}

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firebaseサービスを初期化
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google認証プロバイダー
export const googleProvider = new GoogleAuthProvider();

export default app;
