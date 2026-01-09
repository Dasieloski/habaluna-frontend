'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página de error global de Next.js
 * Se muestra cuando hay un error no capturado en el layout o página
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log del error para debugging
    console.error('Error global:', error);
    
    // Aquí podrías enviar el error a un servicio de monitoreo
    // logErrorToService(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle>Error en la aplicación</CardTitle>
          </div>
          <CardDescription>
            Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono overflow-auto max-h-40">
              <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
                {error.name}: {error.message}
              </div>
              {error.digest && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Error ID: {error.digest}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={reset} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
          <Button onClick={() => window.location.href = '/'} className="w-full sm:w-auto">
            <Home className="mr-2 h-4 w-4" />
            Ir al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
