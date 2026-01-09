'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormErrorProps {
  /**
   * Mensaje de error a mostrar
   */
  message?: ReactNode;
  /**
   * Si es false, desactiva las animaciones
   * Por defecto: true
   */
  enableAnimations?: boolean;
  className?: string;
}

/**
 * Componente para mensajes de error en formularios con microinteracciones
 * 
 * Microinteracciones incluidas:
 * - Aparición animada: fade + slide desde arriba
 * - Shake sutil al aparecer
 * - Desaparición suave al ocultar
 * 
 * Uso:
 * <FormError message={errors.email?.message} />
 * 
 * Para desactivar animaciones: <FormError enableAnimations={false} message="Error" />
 */
export function FormError({ message, enableAnimations = true, className }: FormErrorProps) {
  if (!message) return null;

  if (!enableAnimations) {
    return (
      <p className={cn('text-sm text-destructive', className)}>
        {message}
      </p>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={String(message)}
        initial={{ opacity: 0, y: -10, x: 0 }}
        animate={{ opacity: 1, y: 0, x: [0, -4, 4, -4, 4, 0] }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.3,
          ease: 'easeOut',
          x: {
            duration: 0.4,
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          },
        }}
        className={cn('text-sm text-destructive', className)}
      >
        {message}
      </motion.p>
    </AnimatePresence>
  );
}
