'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader para items de wishlist
 * 
 * Microinteracciones incluidas:
 * - Shimmer animation en todos los elementos
 * 
 * Usado en: Wishlist page mientras carga
 */
export function WishlistItemSkeleton() {
  return (
    <div className="group">
      {/* Imagen del producto */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
        <Skeleton className="w-full h-full" />
      </div>
      
      {/* Información del producto */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}
