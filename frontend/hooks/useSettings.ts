'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/contexts/AuthContext';

interface Settings {
    keywords: string[];
    emailIntegration: boolean;
    calendarIntegration: boolean;
    notificationEnabled: boolean;
    autoSave: boolean;
    recentDays: number;
}

const defaultSettings: Settings = {
    keywords: ['会議', 'ミーティング', '打ち合わせ', '予定', 'イベント'],
    emailIntegration: true,
    calendarIntegration: true,
    notificationEnabled: true,
    autoSave: true,
    recentDays: 7
};

export function useSettings() {
    const { user } = useAuthContext();
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 設定を読み込む
    const loadSettings = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const settingsRef = doc(db, 'user_settings', user.uid);
            const settingsSnap = await getDoc(settingsRef);
            
            if (settingsSnap.exists()) {
                const userSettings = settingsSnap.data() as Settings;
                setSettings({ ...defaultSettings, ...userSettings });
            } else {
                // 初回アクセス時はデフォルト設定を保存
                await saveSettings(defaultSettings);
                setSettings(defaultSettings);
            }
        } catch (err) {
            console.error('設定の読み込みに失敗しました:', err);
            setError(err instanceof Error ? err.message : '設定の読み込みに失敗しました');
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    };

    // 設定を保存する
    const saveSettings = async (newSettings: Settings) => {
        if (!user) return;

        try {
            const settingsRef = doc(db, 'user_settings', user.uid);
            await setDoc(settingsRef, newSettings, { merge: true });
            setSettings(newSettings);
            setError(null);
        } catch (err) {
            console.error('設定の保存に失敗しました:', err);
            setError(err instanceof Error ? err.message : '設定の保存に失敗しました');
        }
    };

    // 設定を更新する
    const updateSettings = async (updates: Partial<Settings>) => {
        const newSettings = { ...settings, ...updates };
        await saveSettings(newSettings);
    };

    useEffect(() => {
        loadSettings();
    }, [user]);

    return {
        settings,
        loading,
        error,
        updateSettings,
        refetch: loadSettings
    };
}
