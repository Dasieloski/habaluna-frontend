'use client';

import { Loader2Icon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.ComponentProps<'svg'> {
  /**
   * Si es false, desactiva la animación de pulso
   * Por defecto: true
   */
  enablePulse?: boolean;
  /**
   * Tamaño del spinner
   * Por defecto: 'default' (16px)
   */
  size?: 'sm' | 'default' | 'lg';
}

/**
 * Spinner component con microinteracciones profesionales
 * 
 * Microinteracciones incluidas:
 * - Rotación suave: spin animation
 * - Pulse sutil: ligera variación de opacidad
 * 
 * Uso:
 * <Spinner />
 * <Spinner size="lg" />
 * 
 * Para desactivar pulse: <Spinner enablePulse={false} />
 */
function Spinner({ className, enablePulse = true, size = 'default', ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: 'size-3',
    default: 'size-4',
    lg: 'size-6',
  };

  const iconProps = {
    role: 'status' as const,
    'aria-label': 'Loading',
    className: cn(
      sizeClasses[size],
      'animate-spin',
      enablePulse && 'animate-pulse',
      className,
    ),
    ...props,
  };

  if (enablePulse) {
    return (
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Loader2Icon {...iconProps} />
      </motion.div>
    );
  }

  return <Loader2Icon {...iconProps} />;
}

export { Spinner };
