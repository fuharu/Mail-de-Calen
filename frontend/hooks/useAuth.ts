'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        error: null
      });
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Firebase APIキーが無効な場合の処理
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "demo-api-key") {
        throw new Error('Firebase APIキーが設定されていません。Firebase Consoleから正しいAPIキーを取得してください。');
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google認証成功:', user);
      return user;
    } catch (error: any) {
      console.error('Google認証エラー詳細:', error);
      
      let errorMessage = 'Google認証に失敗しました';
      
      // エラーコードに基づいて適切なメッセージを設定
      switch (error.code) {
        case 'auth/api-key-not-valid':
          errorMessage = 'Firebase APIキーが無効です。Firebase Consoleから正しいAPIキーを取得してください。';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'ログインがキャンセルされました。再度お試しください。';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'ポップアップがブロックされました。ブラウザの設定を確認してください。';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = '認証がキャンセルされました。';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'リクエストが多すぎます。しばらく待ってから再度お試しください。';
          break;
        default:
          errorMessage = error.message || 'Google認証に失敗しました';
      }
      
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signOut(auth);
      console.log('ログアウト成功');
    } catch (error: any) {
      const errorMessage = error.message || 'ログアウトに失敗しました';
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  };

  const getIdToken = async () => {
    if (!authState.user) {
      throw new Error('ユーザーがログインしていません');
    }
    return await authState.user.getIdToken();
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle,
    logout,
    getIdToken,
    isAuthenticated: !!authState.user
  };
}
