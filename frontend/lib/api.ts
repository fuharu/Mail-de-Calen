import { getAuth } from "firebase/auth";

// API クライアント設定
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://100.122.163.76:8000/";

// エラーハンドリング用のカスタムエラー
export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

// Firebase認証トークンを取得する関数
async function getAuthToken(): Promise<string | null> {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            return null;
        }
        return await user.getIdToken();
    } catch (error) {
        console.error("認証トークンの取得に失敗しました:", error);
        return null;
    }
}

// 共通のfetch関数
async function apiRequest<T>(
    url: string,
    options?: RequestInit,
    requireAuth = false
): Promise<T> {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...((options?.headers as Record<string, string>) || {}),
        };

        // 認証が必要な場合、Firebaseトークンを追加
        if (requireAuth) {
            const token = await getAuthToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new ApiError(
                response.status,
                `API Error: ${response.statusText}`
            );
        }

        return response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            0,
            `Network Error: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

export interface Email {
    id: string;
    subject: string;
    sender: string;
    date: string;
    body: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
}

export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    due_date?: string;
}

// API クライアント関数
export const apiClient = {
    // ヘルスチェック
    async healthCheck() {
        return apiRequest<{ status: string }>(`${API_BASE_URL}/health`);
    },

    // メール関連
    async getRecentEmails(limit = 10): Promise<{ emails: Email[] }> {
        return apiRequest<{ emails: Email[] }>(
            `${API_BASE_URL}/api/email/recent?limit=${limit}`,
            undefined,
            true
        );
    },

    // カレンダー関連
    async getEvents(): Promise<{ events: CalendarEvent[] }> {
        return apiRequest<{ events: CalendarEvent[] }>(
            `${API_BASE_URL}/api/calendar/events`,
            undefined,
            true
        );
    },

    async createEvent(event: Omit<CalendarEvent, "id">) {
        return apiRequest(
            `${API_BASE_URL}/api/calendar/events`,
            {
                method: "POST",
                body: JSON.stringify(event),
            },
            true
        );
    },

    // ToDo関連
    async getTodos(): Promise<{ todos: Todo[] }> {
        return apiRequest<{ todos: Todo[] }>(
            `${API_BASE_URL}/api/todos/`,
            undefined,
            true
        );
    },

    async createTodo(todo: Omit<Todo, "id">) {
        return apiRequest(
            `${API_BASE_URL}/api/todos/`,
            {
                method: "POST",
                body: JSON.stringify(todo),
            },
            true
        );
    },
};
