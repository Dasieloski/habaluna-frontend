'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary para capturar errores de React y mostrar una UI amigable
 * Previene que errores rompan toda la aplicación
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualizar el estado para que la próxima renderización muestre la UI de error
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error para debugging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    
    // Aquí podrías enviar el error a un servicio de monitoreo (Sentry, etc.)
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de error por defecto
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Algo salió mal</CardTitle>
              </div>
              <CardDescription>
                Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono overflow-auto max-h-40">
                  <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
                        Stack trace
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={this.handleReset} variant="outline" className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Button>
              <Button onClick={this.handleReload} variant="outline" className="w-full sm:w-auto">
                Recargar página
              </Button>
              <Button onClick={this.handleGoHome} className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Ir al inicio
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar Error Boundary en componentes funcionales
 * Útil para manejar errores asíncronos que no son capturados por Error Boundaries
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error manejado por useErrorHandler:', error, errorInfo);
    // Aquí podrías enviar el error a un servicio de monitoreo
    // logErrorToService(error, errorInfo);
    
    // Opcional: mostrar notificación al usuario
    // toast.error('Ha ocurrido un error. Por favor, intenta nuevamente.');
  };
}
