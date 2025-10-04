'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

export default function AccountPage() {
    const { user, loading: authLoading } = useAuthContext();
    const router = useRouter();
    const [profile, setProfile] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        timezone: 'Asia/Tokyo',
        language: 'ja',
        dateFormat: 'YYYY/MM/DD'
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleSaveProfile = () => {
        // プロフィールを保存する処理（実際の実装ではFirebaseに保存）
        console.log('プロフィールを保存:', profile);
        alert('プロフィールを更新しました');
        setIsEditing(false);
    };

    const handleLogout = () => {
        // ログアウト処理
        if (confirm('ログアウトしますか？')) {
            // 実際のログアウト処理をここに実装
            router.push('/login');
        }
    };

    const handleDeleteAccount = () => {
        const confirmation = prompt('アカウントを削除しますか？この操作は取り消せません。\n削除する場合は「DELETE」と入力してください。');
        if (confirmation === 'DELETE') {
            // アカウント削除処理をここに実装
            alert('アカウントを削除しました');
            router.push('/login');
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <div className="text-lg mt-4">読み込み中...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">アカウント</h1>

                {/* プロフィール情報 */}
                <div className="bg-base-100 rounded-box shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">プロフィール情報</h2>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="btn btn-sm btn-outline"
                        >
                            {isEditing ? 'キャンセル' : '編集'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* プロフィール画像 */}
                        <div className="flex items-center gap-4">
                            <div className="avatar">
                                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="プロフィール" className="w-16 h-16 rounded-full" />
                                    ) : (
                                        <span className="text-white text-xl font-bold">
                                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{user.displayName || 'ユーザー'}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                        </div>

                        {/* 名前 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                名前
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                    className="input input-bordered w-full"
                                    placeholder="名前を入力"
                                />
                            ) : (
                                <p className="text-gray-800">{profile.name || '未設定'}</p>
                            )}
                        </div>

                        {/* メールアドレス */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                メールアドレス
                            </label>
                            <p className="text-gray-800">{profile.email}</p>
                            <p className="text-xs text-gray-500 mt-1">メールアドレスは変更できません</p>
                        </div>

                        {/* タイムゾーン */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                タイムゾーン
                            </label>
                            {isEditing ? (
                                <select
                                    value={profile.timezone}
                                    onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                                    className="select select-bordered w-full"
                                >
                                    <option value="Asia/Tokyo">Asia/Tokyo (日本標準時)</option>
                                    <option value="UTC">UTC (協定世界時)</option>
                                    <option value="America/New_York">America/New_York (東部標準時)</option>
                                    <option value="Europe/London">Europe/London (グリニッジ標準時)</option>
                                </select>
                            ) : (
                                <p className="text-gray-800">{profile.timezone}</p>
                            )}
                        </div>

                        {/* 言語 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                言語
                            </label>
                            {isEditing ? (
                                <select
                                    value={profile.language}
                                    onChange={(e) => setProfile(prev => ({ ...prev, language: e.target.value }))}
                                    className="select select-bordered w-full"
                                >
                                    <option value="ja">日本語</option>
                                    <option value="en">English</option>
                                </select>
                            ) : (
                                <p className="text-gray-800">{profile.language === 'ja' ? '日本語' : 'English'}</p>
                            )}
                        </div>

                        {/* 日付形式 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                日付形式
                            </label>
                            {isEditing ? (
                                <select
                                    value={profile.dateFormat}
                                    onChange={(e) => setProfile(prev => ({ ...prev, dateFormat: e.target.value }))}
                                    className="select select-bordered w-full"
                                >
                                    <option value="YYYY/MM/DD">YYYY/MM/DD</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                </select>
                            ) : (
                                <p className="text-gray-800">{profile.dateFormat}</p>
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="btn btn-outline btn-sm"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="btn btn-primary btn-sm"
                            >
                                保存
                            </button>
                        </div>
                    )}
                </div>

                {/* セキュリティ設定 */}
                <div className="bg-base-100 rounded-box shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">セキュリティ設定</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">2段階認証</h3>
                                <p className="text-sm text-gray-600">アカウントのセキュリティを強化します</p>
                            </div>
                            <button className="btn btn-sm btn-outline">
                                設定
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">パスワード変更</h3>
                                <p className="text-sm text-gray-600">Googleアカウントのパスワードを変更</p>
                            </div>
                            <button className="btn btn-sm btn-outline">
                                変更
                            </button>
                        </div>
                    </div>
                </div>

                {/* データ管理 */}
                <div className="bg-base-100 rounded-box shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">データ管理</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">データエクスポート</h3>
                                <p className="text-sm text-gray-600">アカウントデータをダウンロード</p>
                            </div>
                            <button className="btn btn-sm btn-outline">
                                エクスポート
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">データ削除</h3>
                                <p className="text-sm text-gray-600">アカウントに関連するすべてのデータを削除</p>
                            </div>
                            <button 
                                onClick={handleDeleteAccount}
                                className="btn btn-sm btn-error"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>

                {/* ログアウト */}
                <div className="bg-base-100 rounded-box shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">ログアウト</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">アカウントからログアウト</h3>
                            <p className="text-sm text-gray-600">現在のセッションを終了します</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="btn btn-sm btn-outline"
                        >
                            ログアウト
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
