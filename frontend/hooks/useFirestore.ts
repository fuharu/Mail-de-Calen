"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";


export interface EventCandidate {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    status: "pending" | "approved" | "rejected";
    created_at: string; // ISO date string in mock
    user_id: string;
}

export interface TodoCandidate {
    id: string;
    title: string;
    completed: boolean;
    due_date?: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    user_id: string;
}

export interface UserData {
    id: string;
    email: string;
    name: string;
    created_at: string;
    last_login: string;
    settings?: {
        email_notifications: boolean;
        calendar_integration: boolean;
    };
}

interface UseFirestoreResponse<T> {
    data: T[] | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

function useFirestore<T>(
    collectionName: string,
    queryConstraints?: any[]
): UseFirestoreResponse<T> {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // For now, call backend API endpoints as replacement for Firestore
            if (collectionName === "event_candidates") {
                const res = await apiClient.getEvents();
                setData(res.events as unknown as T[]);
            } else if (collectionName === "todo_candidates") {
                const res = await apiClient.getTodos();
                setData(res.todos as unknown as T[]);
            } else {
                // fallback: empty
                setData([] as unknown as T[]);
            }
        } catch (err) {
            console.error(`API error (${collectionName}):`, err);
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [collectionName]);

    useEffect(() => {
        // 一度だけ実行
        let isMounted = true;

        const executeFetch = async () => {
            if (isMounted) {
                setLoading(true);
                setError(null);
                    try {
                        await fetchData();
                    } catch (err) {
                        if (isMounted) {
                            console.error(`API error (${collectionName}):`, err);
                            setError(
                                err instanceof Error
                                    ? err.message
                                    : "Unknown error occurred"
                            );
                        }
                    } finally {
                        if (isMounted) {
                            setLoading(false);
                        }
                    }
            }
        };

        executeFetch();

        return () => {
            isMounted = false;
        };
    }, [collectionName]); // collectionNameのみを依存配列に含める

    return { data, loading, error, refetch: fetchData };
}

// 特定のドキュメントを取得するフック
export function useFirestoreDoc<T>(
    collectionName: string,
    docId: string
): {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
} {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Backend user endpoint is not implemented in apiClient; return null for now.
            setData(null);
        } catch (err) {
            console.error(`API error (${collectionName}/${docId}):`, err);
            setError(
                err instanceof Error ? err.message : "Unknown error occurred"
            );
        } finally {
            setLoading(false);
        }
    }, [collectionName, docId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

// イベント候補を取得するフック
export function useEventCandidates(userId?: string) {
    // user_idでのフィルタのみ、created_atでのソートはクライアント側で実施
    // Filtering by userId should be implemented server-side; for now, fetch all and client-filter.
    return useFirestore<EventCandidate>("event_candidates", []);
}

// ToDo候補を取得するフック
export function useTodoCandidates(userId?: string) {
    // user_idでのフィルタのみ、created_atでのソートはクライアント側で実施
    return useFirestore<TodoCandidate>("todo_candidates", []);
}

// ユーザーデータを取得するフック
export function useUserData(userId: string) {
    return useFirestoreDoc<UserData>("users", userId);
}

// 全ユーザーを取得するフック（削除済み）
// export function useAllUsers() {
//   return useFirestore<UserData>('users');
// }

// 承認済みイベントを取得するフック
export function useApprovedEvents(userId?: string) {
    // user_idとstatusでのフィルタのみ、created_atでのソートはクライアント側で実施
    return useFirestore<EventCandidate>("event_candidates", []);
}

// 承認済みToDoを取得するフック
export function useApprovedTodos(userId?: string) {
    // user_idとstatusでのフィルタのみ、created_atでのソートはクライアント側で実施
    return useFirestore<TodoCandidate>("todo_candidates", []);
}
