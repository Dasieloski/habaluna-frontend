'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface EmptyStateProps {
  /**
   * Icono o elemento visual principal
   */
  icon?: ReactNode;
  /**
   * Título del empty state
   */
  title: string;
  /**
   * Descripción o mensaje adicional
   */
  description?: string;
  /**
   * Acción principal (botón o link)
   */
  action?: ReactNode;
  /**
   * Si es false, desactiva las animaciones
   * Por defecto: true
   */
  enableAnimations?: boolean;
  className?: string;
}

/**
 * Componente para empty states con microinteracciones profesionales
 * 
 * Microinteracciones incluidas:
 * - Aparición animada: fade + scale + slide desde abajo
 * - Icono con bounce sutil
 * - Texto con stagger animation
 * 
 * Uso:
 * <EmptyState
 *   icon={<ShoppingBag className="h-24 w-24" />}
 *   title="Tu carrito está vacío"
 *   description="Añade algunos productos para empezar"
 *   action={<Button href="/products">Explorar Productos</Button>}
 * />
 * 
 * Para desactivar animaciones: <EmptyState enableAnimations={false} />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  enableAnimations = true,
  className,
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !prefersReducedMotion;

  if (!shouldAnimate) {
    return (
      <div className={cn('flex flex-col items-center justify-center px-4 py-12 text-center', className)}>
        {icon && <div className="mb-6 text-gray-300">{icon}</div>}
        <h2 className={cn('text-2xl font-semibold text-gray-800 mb-2')}>{title}</h2>
        {description && <p className="text-gray-500 mb-6 max-w-md">{description}</p>}
        {action && <div>{action}</div>}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('flex flex-col items-center justify-center px-4 py-12 text-center', className)}
    >
      {icon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-6 text-gray-300"
        >
          {icon}
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={cn('text-2xl font-semibold text-gray-800 mb-2')}
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-gray-500 mb-6 max-w-md"
        >
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
