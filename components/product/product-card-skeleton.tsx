'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader para ProductCard
 * 
 * Microinteracciones incluidas:
 * - Shimmer animation en todos los elementos
 * - Aparición sutil con fade
 * 
 * Usado en: Grid de productos mientras carga
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-100">
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-3 md:p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
