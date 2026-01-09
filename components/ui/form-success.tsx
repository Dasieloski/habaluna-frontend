'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormSuccessProps {
  /**
   * Mensaje de éxito a mostrar
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
 * Componente para mensajes de éxito en formularios con microinteracciones
 * 
 * Microinteracciones incluidas:
 * - Aparición animada: fade + scale con check icon
 * - Animación de check: scale bounce
 * - Desaparición suave al ocultar
 * 
 * Uso:
 * <FormSuccess message="¡Formulario enviado correctamente!" />
 * 
 * Para desactivar animaciones: <FormSuccess enableAnimations={false} message="Éxito" />
 */
export function FormSuccess({ message, enableAnimations = true, className }: FormSuccessProps) {
  if (!message) return null;

  if (!enableAnimations) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-green-600', className)}>
        <CheckCircle2 className="w-4 h-4" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={String(message)}
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn('flex items-center gap-2 text-sm text-green-600', className)}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <CheckCircle2 className="w-4 h-4" />
        </motion.div>
        <span>{message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
