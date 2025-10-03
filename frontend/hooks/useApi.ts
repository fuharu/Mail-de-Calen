'use client';

import { useState, useEffect } from 'react';
import { apiClient, ApiError } from '@/lib/api';
import type { Email, CalendarEvent, Todo } from '@/lib/api';

// 汎用的なAPIフック
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError('不明なエラーが発生しました');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('不明なエラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// メール取得用フック
export function useEmails(limit = 10) {
  return useApi(() => apiClient.getRecentEmails(limit), [limit]);
}

// カレンダーイベント取得用フック
export function useEvents() {
  return useApi(() => apiClient.getEvents(), []);
}

// ToDo取得用フック
export function useTodos() {
  return useApi(() => apiClient.getTodos(), []);
}

// ヘルスチェック用フック
export function useHealthCheck() {
  return useApi(() => apiClient.healthCheck(), []);
}
