import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página 404 personalizada
 * Se muestra cuando Next.js no encuentra una ruta
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">404</div>
          <CardTitle className="text-2xl">Página no encontrada</CardTitle>
          <CardDescription>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">
            Puede que hayas escrito mal la URL o que la página haya sido eliminada.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Ir al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/products">
              <Search className="mr-2 h-4 w-4" />
              Explorar productos
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
