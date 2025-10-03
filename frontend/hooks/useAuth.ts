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
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log('Google認証成功:', user);
      return user;
    } catch (error: any) {
      const errorMessage = error.message || 'Google認証に失敗しました';
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
