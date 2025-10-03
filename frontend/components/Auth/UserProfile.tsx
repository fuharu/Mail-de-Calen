'use client';

import { useAuthContext } from '@/contexts/AuthContext';

export function UserProfile() {
  const { user, logout, loading } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4 px-5 py-10 pb-5">
      <div className="avatar">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-xl font-semibold">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-lg font-semibold">
          {user.displayName || 'ユーザー'}
        </div>
        <div className="text-sm text-gray-500">
          {user.email}
        </div>
        <div className="text-xs text-green-500">
          ✓ ログイン済み
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`btn btn-sm btn-outline ${loading ? 'loading' : ''}`}
        >
          {loading ? '' : 'ログアウト'}
        </button>
      </div>
    </div>
  );
}
