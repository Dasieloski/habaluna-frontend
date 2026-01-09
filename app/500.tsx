import Link from 'next/link';
import { Home, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página de error 500 personalizada
 * Se muestra cuando hay un error del servidor
 */
export default function Error500() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <div className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">500</div>
          <CardTitle className="text-2xl">Error del servidor</CardTitle>
          <CardDescription>
            Lo sentimos, ha ocurrido un error interno en el servidor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Nuestro equipo ha sido notificado y está trabajando para solucionarlo.
            Por favor, intenta nuevamente en unos momentos.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.location.reload()}
          >
            <span>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recargar página
            </span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
