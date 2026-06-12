'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

export function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState<string | null>(null);
  const pathRef = useRef(path);
  pathRef.current = path;

  const refetch = useCallback(async (p?: string) => {
    const target = p ?? pathRef.current;
    if (!target) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<T>(target);
      setData(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (path) refetch(path);
    else setLoading(false);
  }, [path, refetch]);

  return { data, loading, error, refetch };
}

export function useApiMutation<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (
      method: 'post' | 'put' | 'patch' | 'delete',
      path: string,
      body?: unknown,
      onCompleted?: (data: T) => void,
      onError?: (msg: string) => void
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = method === 'delete'
          ? await api.delete<T>(path)
          : await api[method]<T>(path, body);
        onCompleted?.(res);
        return res;
      } catch (e: any) {
        setError(e.message);
        onError?.(e.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { mutate, loading, error };
}
