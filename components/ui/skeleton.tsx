'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface SkeletonProps extends React.ComponentProps<'div'> {
  /**
   * Si es false, desactiva la animación shimmer
   * Por defecto: true
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
function Skeleton({ className, enableShimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-accent rounded-md relative overflow-hidden',
        enableShimmer && 'animate-pulse',
        className,
      )}
      {...props}
    >
      {enableShimmer && (
        <div
          className={cn(
            'absolute inset-0 -translate-x-full animate-shimmer',
            'bg-gradient-to-r from-transparent via-white/20 to-transparent',
          )}
        />
      )}
    </div>
  );
}

export { Skeleton };
