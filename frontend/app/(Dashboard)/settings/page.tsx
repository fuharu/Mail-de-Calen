'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
    const { user, loading: authLoading } = useAuthContext();
    const { settings, loading: settingsLoading, error: settingsError, updateSettings } = useSettings();
    const router = useRouter();
    const [newKeyword, setNewKeyword] = useState('');

    const handleAddKeyword = () => {
        if (newKeyword.trim() && !settings.keywords.includes(newKeyword.trim())) {
            updateSettings({
                keywords: [...settings.keywords, newKeyword.trim()]
            });
            setNewKeyword('');
        }
    };

    const handleRemoveKeyword = (keyword: string) => {
        updateSettings({
            keywords: settings.keywords.filter(k => k !== keyword)
        });
    };

    const handleSaveSettings = () => {
        // 設定は自動的に保存されるため、成功メッセージのみ表示
        alert('設定を保存しました');
    };

    if (authLoading || settingsLoading) {
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
                <h1 className="text-2xl font-bold text-gray-800 mb-6">設定</h1>

                {/* キーワード設定 */}
                <div className="bg-base-100 rounded-box shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">キーワード設定</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        メール解析でイベントやタスクを検出するためのキーワードを設定できます。
                    </p>
                    
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            placeholder="新しいキーワードを入力"
                            className="input input-bordered flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                        />
                        <button
                            onClick={handleAddKeyword}
                            className="btn btn-primary"
                        >
                            追加
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {settings.keywords.map((keyword, index) => (
                            <div
                                key={index}
                                className="badge badge-outline flex items-center gap-2"
                            >
                                {keyword}
                                <button
                                    onClick={() => handleRemoveKeyword(keyword)}
                                    className="text-xs hover:text-red-500"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 外部カレンダー連携 */}
                <div className="bg-base-100 rounded-box shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">外部カレンダー連携</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Google Calendar</h3>
                                <p className="text-sm text-gray-600">Google Calendarと連携して予定を同期します</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.calendarIntegration}
                                onChange={(e) => updateSettings({
                                    calendarIntegration: e.target.checked
                                })}
                                className="toggle toggle-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* メール連携 */}
                <div className="bg-base-100 rounded-box shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">メール連携</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Gmail連携</h3>
                                <p className="text-sm text-gray-600">Gmailからメールを自動取得して解析します</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.emailIntegration}
                                onChange={(e) => updateSettings({
                                    emailIntegration: e.target.checked
                                })}
                                className="toggle toggle-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* 通知設定 */}
                <div className="bg-base-100 rounded-box shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">通知設定</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">通知を有効にする</h3>
                                <p className="text-sm text-gray-600">新しいイベントやタスクが見つかった時に通知します</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.notificationEnabled}
                                onChange={(e) => updateSettings({
                                    notificationEnabled: e.target.checked
                                })}
                                className="toggle toggle-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* 自動保存設定 */}
                <div className="bg-base-100 rounded-box shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">自動保存設定</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">自動保存を有効にする</h3>
                                <p className="text-sm text-gray-600">解析結果を自動的に候補として保存します</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.autoSave}
                                onChange={(e) => updateSettings({
                                    autoSave: e.target.checked
                                })}
                                className="toggle toggle-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* 表示設定 */}
                <div className="bg-base-100 rounded-box shadow-md p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">表示設定</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                直近のタスク・予定の表示日数
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="3"
                                    max="30"
                                    value={settings.recentDays}
                                    onChange={(e) => updateSettings({
                                        recentDays: parseInt(e.target.value)
                                    })}
                                    className="range range-primary flex-1"
                                />
                                <div className="text-lg font-semibold min-w-[3rem] text-center">
                                    {settings.recentDays}日
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                ダッシュボードの「直近のタスク」「直近の予定」で表示する日数を設定できます
                            </p>
                        </div>
                    </div>
                </div>

                {/* 保存ボタン */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => router.back()}
                        className="btn btn-outline"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSaveSettings}
                        className="btn btn-primary"
                    >
                        設定を保存
                    </button>
                </div>
            </div>
        </div>
    );
}
