"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";

interface Settings {
    keywords: string[];
    emailIntegration: boolean;
    calendarIntegration: boolean;
    notificationEnabled: boolean;
    autoSave: boolean;
    recentDays: number;
}

const defaultSettings: Settings = {
    keywords: ["会議", "ミーティング", "打ち合わせ", "予定", "イベント"],
    emailIntegration: true,
    calendarIntegration: true,
    notificationEnabled: true,
    autoSave: true,
    recentDays: 7,
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

            // Try fetching user settings from backend API if available
            try {
                const res = await apiClient.getTodos(); // placeholder endpoint
                // No real settings endpoint yet; just use defaults
                setSettings(defaultSettings);
            } catch (err) {
                // Fallback to defaults
                setSettings(defaultSettings);
            }
        } catch (err) {
            console.error("設定の読み込みに失敗しました:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "設定の読み込みに失敗しました"
            );
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    };

    // 設定を保存する
    const saveSettings = async (newSettings: Settings) => {
        if (!user) return;
        // TODO: implement backend settings save endpoint
        setSettings(newSettings);
        setError(null);
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
        refetch: loadSettings,
    };
}
