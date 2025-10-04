"use client";

import { useState, useEffect, useCallback } from "react";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface EventCandidate {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    status: "pending" | "approved" | "rejected";
    created_at: Timestamp;
    user_id: string;
}

export interface TodoCandidate {
    id: string;
    title: string;
    completed: boolean;
    due_date?: string;
    status: "pending" | "approved" | "rejected";
    created_at: Timestamp;
    user_id: string;
}

export interface UserData {
    id: string;
    email: string;
    name: string;
    created_at: Timestamp;
    last_login: Timestamp;
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
            const collectionRef = collection(db, collectionName);
            const q = queryConstraints
                ? query(collectionRef, ...queryConstraints)
                : collectionRef;

            const querySnapshot = await getDocs(q);
            const docs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as T[];

            // クライアント側でソート（created_atで降順）
            const sortedDocs = docs.sort((a, b) => {
                const aTime = (a as any).created_at?.toDate
                    ? (a as any).created_at.toDate().getTime()
                    : 0;
                const bTime = (b as any).created_at?.toDate
                    ? (b as any).created_at.toDate().getTime()
                    : 0;
                return bTime - aTime;
            });

            setData(sortedDocs);
        } catch (err) {
            console.error(`Firestore error (${collectionName}):`, err);
            setError(
                err instanceof Error ? err.message : "Unknown error occurred"
            );
        } finally {
            setLoading(false);
        }
    }, [collectionName]); // queryConstraintsを削除

    useEffect(() => {
        // 一度だけ実行
        let isMounted = true;

        const executeFetch = async () => {
            if (isMounted) {
                setLoading(true);
                setError(null);
                try {
                    const collectionRef = collection(db, collectionName);
                    const q = queryConstraints
                        ? query(collectionRef, ...queryConstraints)
                        : collectionRef;

                    const querySnapshot = await getDocs(q);
                    const docs = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as T[];

                    // クライアント側でソート（created_atで降順）
                    const sortedDocs = docs.sort((a, b) => {
                        const aTime = (a as any).created_at?.toDate
                            ? (a as any).created_at.toDate().getTime()
                            : 0;
                        const bTime = (b as any).created_at?.toDate
                            ? (b as any).created_at.toDate().getTime()
                            : 0;
                        return bTime - aTime;
                    });

                    if (isMounted) {
                        setData(sortedDocs);
                    }
                } catch (err) {
                    if (isMounted) {
                        console.error(
                            `Firestore error (${collectionName}):`,
                            err
                        );
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
            const docRef = doc(db, collectionName, docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setData({ id: docSnap.id, ...docSnap.data() } as T);
            } else {
                setData(null);
            }
        } catch (err) {
            console.error(`Firestore error (${collectionName}/${docId}):`, err);
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
    const queryConstraints = userId ? [where("user_id", "==", userId)] : [];

    return useFirestore<EventCandidate>("event_candidates", queryConstraints);
}

// ToDo候補を取得するフック
export function useTodoCandidates(userId?: string) {
    // user_idでのフィルタのみ、created_atでのソートはクライアント側で実施
    const queryConstraints = userId ? [where("user_id", "==", userId)] : [];

    return useFirestore<TodoCandidate>("todo_candidates", queryConstraints);
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
    const queryConstraints = userId
        ? [where("user_id", "==", userId), where("status", "==", "approved")]
        : [where("status", "==", "approved")];

    return useFirestore<EventCandidate>("event_candidates", queryConstraints);
}

// 承認済みToDoを取得するフック
export function useApprovedTodos(userId?: string) {
    // user_idとstatusでのフィルタのみ、created_atでのソートはクライアント側で実施
    const queryConstraints = userId
        ? [where("user_id", "==", userId), where("status", "==", "approved")]
        : [where("status", "==", "approved")];

    return useFirestore<TodoCandidate>("todo_candidates", queryConstraints);
}
