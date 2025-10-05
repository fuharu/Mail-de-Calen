'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<User | null>; 
  logout: () => Promise<void>;
  getIdToken: () => Promise<string>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const mockUser: User = {
    uid: 'mock-user-id-123',
    displayName: 'テストユーザー',
    email: 'test@example.com',
  };

  // コンテキストに渡すための仮の値
  const value: AuthContextType = {
    user: mockUser, // 常にこのユーザーがログインしていることにする
    loading: false, // ローディングは完了
    error: null,
    isAuthenticated: true, // 常に認証済み
    // 他のコンポーネントでエラーが出ないように、何もしない仮の関数を用意
    signInWithGoogle: async () => mockUser,
    logout: async () => { console.log('logout called'); },
    getIdToken: async () => 'mock-jwt-token',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
