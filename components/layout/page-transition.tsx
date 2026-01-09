'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Componente para transiciones de página globales (estilo SSGOI)
 * 
 * Comportamiento exacto:
 * - La página actual anima su SALIDA primero (opacity 1→0, translateY 0→-8px)
 * - La nueva página entra DESPUÉS (opacity 0→1, translateY 8px→0)
 * - Sin parpadeos, doble render, ni saltos visuales
 * - Transición fluida, elegante y rápida (tipo apps modernas)
 * 
 * Animaciones:
 * - Entrada: opacity 0 → 1, translateY 8px → 0
 * - Salida: opacity 1 → 0, translateY 0 → -8px
 * - Duración: 0.3s (300ms)
 * - Easing: easeInOut
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // Variantes de animación estilo SSGOI
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 8, // Entrada desde 8px abajo
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3, // 300ms - dentro del rango 0.25s-0.35s
        ease: 'easeInOut', // easing suave tipo SSGOI
      },
    },
    exit: {
      opacity: 0,
      y: -8, // Salida hacia -8px arriba
      transition: {
        duration: 0.3, // Misma duración para mantener sincronización
        ease: 'easeInOut', // easing consistente
      },
    },
  };

  // Si el usuario prefiere movimiento reducido, desactivar animaciones
  if (prefersReducedMotion) {
    return <div style={{ width: '100%', minHeight: '100%' }}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        style={{
          width: '100%',
          minHeight: '100%',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
