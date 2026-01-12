'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface SkeletonProps extends React.ComponentProps<'div'> {
  /**
   * Si es true, activa una animación (pulso suave)
   * Por defecto: false (más fino y discreto)
   */
  enableShimmer?: boolean;
}

/**
 * Skeleton component con animación shimmer profesional
 * 
 * Microinteracciones incluidas:
 * - Shimmer animation: efecto de brillo deslizante
 * - Pulse animation: pulso sutil de opacidad
 * 
 * Uso:
 * <Skeleton className="h-4 w-full" />
 * <Skeleton className="h-32 w-32 rounded-full" />
 * 
 * Para desactivar shimmer: <Skeleton enableShimmer={false} />
 */
function Skeleton({ className, enableShimmer = false, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Estilo más sutil y consistente en todo el sitio
        'rounded-md bg-muted/60',
        enableShimmer && 'animate-pulse',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
