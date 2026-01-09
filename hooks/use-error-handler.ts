'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook para manejar errores de forma consistente en la aplicación
 * Muestra notificaciones amigables al usuario
 */
export function useErrorHandler() {
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    let message = customMessage || 'Ha ocurrido un error. Por favor, intenta nuevamente.';

    if (error instanceof Error) {
      // Errores de API
      if ('status' in error) {
        const apiError = error as { status?: number; message?: string };
        
        switch (apiError.status) {
          case 401:
            message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
            // Redirigir al login si es necesario
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/login';
            }
            break;
          case 403:
            message = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            message = 'El recurso que buscas no existe.';
            break;
          case 429:
            message = 'Has realizado demasiadas solicitudes. Por favor, espera un momento.';
            break;
          case 500:
            message = 'Error del servidor. Por favor, intenta más tarde.';
            break;
          default:
            message = apiError.message || message;
        }
      } else {
        message = error.message || message;
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    // Mostrar notificación
    toast.error(message, {
      duration: 5000,
    });

    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error manejado:', error);
    }

    return message;
  }, []);

  return { handleError };
}
