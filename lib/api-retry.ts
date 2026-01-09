/**
 * Utilidad para reintentar requests fallidos
 * Implementa exponential backoff para reintentos
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryableStatuses?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos máximo
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, rate limit, server errors
};

/**
 * Retry logic con exponential backoff
 */
export async function retryFetch(
  fetchFn: () => Promise<Response>,
  options: RetryOptions = {}
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetchFn();

      // Si la respuesta es exitosa o no es retryable, retornarla
      if (response.ok || !opts.retryableStatuses.includes(response.status)) {
        return response;
      }

      // Si es el último intento, lanzar error
      if (attempt === opts.maxRetries) {
        return response;
      }

      // Calcular delay con exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(2, attempt),
        opts.maxDelay
      );

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si es el último intento, lanzar error
      if (attempt === opts.maxRetries) {
        throw lastError;
      }

      // Calcular delay con exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(2, attempt),
        opts.maxDelay
      );

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Unknown error in retry');
}
