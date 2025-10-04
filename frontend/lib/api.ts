// Development stub for auth token. Returns null if backend doesn't require auth.
export async function getAuthToken(): Promise<string | null> {
    // Return null to indicate no token (backend should allow unauthenticated requests
    // for development), or return a mock string if you want to simulate auth.
    console.log("Using stub getAuthToken(): returning null (no auth) in development");
    return null;
}
// // API クライアント設定
// const API_BASE_URL =
//     process.env.NEXT_PUBLIC_API_URL || "http://100.122.163.76:8000/";

// // エラーハンドリング用のカスタムエラー
// export class ApiError extends Error {
//     constructor(public status: number, message: string) {
//         super(message);
//         this.name = "ApiError";
//     }
// }

// // Firebase認証トークンを取得する関数
// async function getAuthToken(): Promise<string | null> {
//     try {
//         const auth = getAuth();
//         const user = auth.currentUser;
//         if (!user) {
//             return null;
//         }
//         return await user.getIdToken();
//     } catch (error) {
//         console.error("認証トークンの取得に失敗しました:", error);
//         return null;
//     }
// }

// // 共通のfetch関数
// async function apiRequest<T>(
//     url: string,
//     options?: RequestInit,
//     requireAuth = false
// ): Promise<T> {
//     try {
//         const headers: Record<string, string> = {
//             "Content-Type": "application/json",
//             ...((options?.headers as Record<string, string>) || {}),
//         };

//         // 認証が必要な場合、Firebaseトークンを追加
//         if (requireAuth) {
//             const token = await getAuthToken();
//             if (token) {
//                 headers["Authorization"] = `Bearer ${token}`;
//             }
//         }

//         const response = await fetch(url, {
//             ...options,
//             headers,
//         });

//         if (!response.ok) {
//             throw new ApiError(
//                 response.status,
//                 `API Error: ${response.statusText}`
//             );
//         }

//         return response.json();
//     } catch (error) {
//         if (error instanceof ApiError) {
//             throw error;
//         }
//         throw new ApiError(
//             0,
//             `Network Error: ${
//                 error instanceof Error ? error.message : "Unknown error"
//             }`
//         );
//     }
// }

// export interface Email {
//     id: string;
//     subject: string;
//     sender: string;
//     date: string;
//     body: string;
// }

// export interface CalendarEvent {
//     id: string;
//     title: string;
//     start: string;
//     end: string;
//     description?: string;
// }

// export interface Todo {
//     id: string;
//     title: string;
//     completed: boolean;
//     due_date?: string;
// }

// // API クライアント関数
// Minimal apiClient stub that does simple fetches without injecting Firebase tokens.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK || "false").toLowerCase() === "true";

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options?.headers as Record<string, string>) || {}),
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) throw new ApiError(res.status, res.statusText);
    return res.json();
}

export const apiClient = {
    async healthCheck() {
        if (USE_MOCK) return { status: "healthy" };
        return apiRequest<{ status: string }>(`${API_BASE_URL}/health`);
    },
    async getRecentEmails(limit = 10) {
        if (USE_MOCK) {
            return {
                emails: [
                    { id: "email_1", subject: "会議の件", sender: "a@b.com", date: new Date().toISOString(), body: "明日の会議について" },
                ].slice(0, limit),
            } as any;
        }
        return apiRequest<{ emails: any[] }>(`${API_BASE_URL}/api/email/recent?limit=${limit}`);
    },
    async getEvents() {
        if (USE_MOCK) {
            return { events: [
                { id: "event_1", title: "会議", start: "2024-10-03T10:00:00Z", end: "2024-10-03T11:00:00Z", description: "チーム会議" }
            ] } as any;
        }
        return apiRequest<{ events: any[] }>(`${API_BASE_URL}/api/calendar/events`);
    },
    async createEvent(event: any) {
        if (USE_MOCK) return { message: "Event created", event } as any;
        return apiRequest(`${API_BASE_URL}/api/calendar/events`, { method: "POST", body: JSON.stringify(event) });
    },
    async getTodos() {
        if (USE_MOCK) return { todos: [ { id: "todo_1", title: "レポート作成", completed: false } ] } as any;
        return apiRequest<{ todos: any[] }>(`${API_BASE_URL}/api/todos/`);
    },
    async createTodo(todo: any) {
        if (USE_MOCK) return { message: "Todo created", todo } as any;
        return apiRequest(`${API_BASE_URL}/api/todos/`, { method: "POST", body: JSON.stringify(todo) });
    },
};
