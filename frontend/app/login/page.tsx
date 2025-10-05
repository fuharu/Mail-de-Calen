'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { LoginButton } from '@/components/Auth/LoginButton';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <div className="text-lg mt-4">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <div className="text-lg mt-4">ダッシュボードにリダイレクト中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo_main.png"
            alt="Mail de Calen"
            width={200}
            height={40}
            className="mx-auto mb-4"
            style={{ width: "auto", height: "auto" }}
            priority
          />
          <h1 className="text-2xl font-bold text-gray-800">
            メール解析とカレンダー管理
          </h1>
          <p className="text-gray-600 mt-2">
            Gmail と Google Calendar を連携して効率的にタスクを管理しましょう
          </p>
        </div>

        <LoginButton />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。</p>
        </div>
      </div>
    </div>
  );
}