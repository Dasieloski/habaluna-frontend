'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader para items del carrito
 * 
 * Microinteracciones incluidas:
 * - Shimmer animation en todos los elementos
 * 
 * Usado en: Cart page mientras carga
 */
export function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Imagen del producto */}
        <div className="flex-shrink-0">
          <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-lg" />
        </div>
        
        {/* Información del producto */}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        
        {/* Precio y controles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-4 sm:gap-6">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded" />
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-9 w-9 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
