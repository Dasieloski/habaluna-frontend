'use client';

import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  onRetry?: (attempt: number) => void;
}

/**
 * Hook para reintentar operaciones fallidas
 * Útil para requests de API que pueden fallar temporalmente
 */
export function useRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): [T, { isLoading: boolean; error: Error | null; retryCount: number }] {
  const { maxRetries = 3, delay = 1000, onRetry } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      setIsLoading(true);
      setError(null);
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          setRetryCount(attempt);
          if (attempt > 0 && onRetry) {
            onRetry(attempt);
          }

          const result = await fn(...args);
          setIsLoading(false);
          setRetryCount(0);
          return result;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          
          // Si es el último intento, lanzar el error
          if (attempt === maxRetries) {
            setError(lastError);
            setIsLoading(false);
            throw lastError;
          }

          // Esperar antes del siguiente intento (exponential backoff)
          const waitTime = delay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      setIsLoading(false);
      throw lastError || new Error('Unknown error');
    },
    [fn, maxRetries, delay, onRetry]
  ) as T;

  return [retry, { isLoading, error, retryCount }];
}
