'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ReactNode, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface AnimatedListProps {
  children: ReactNode;
  /**
   * Delay entre cada elemento (stagger) en segundos
   * Por defecto: 0.05 (50ms)
   */
  staggerDelay?: number;
  /**
   * Si es false, desactiva las animaciones de aparición
   * Por defecto: true
   */
  enableAnimations?: boolean;
  /**
   * Si es true, anima solo cuando los elementos entran al viewport
   * Por defecto: true
   */
  animateOnViewport?: boolean;
  className?: string;
}

/**
 * Componente para listas con animación de aparición progresiva (stagger)
 * 
 * Microinteracciones incluidas:
 * - Aparición progresiva: cada elemento aparece con un ligero delay
 * - Entrada suave: fade + slide desde abajo
 * - Solo anima cuando los elementos entran al viewport (performance)
 * 
 * Uso:
 * <AnimatedList staggerDelay={0.08}>
 *   {items.map(item => <div key={item.id}>{item.name}</div>)}
 * </AnimatedList>
 * 
 * Para desactivar animaciones: <AnimatedList enableAnimations={false} />
 */
export function AnimatedList({
  children,
  staggerDelay = 0.05,
  enableAnimations = true,
  animateOnViewport = true,
  className,
}: AnimatedListProps) {
  const [isVisible, setIsVisible] = useState(!animateOnViewport);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !prefersReducedMotion;

  useEffect(() => {
    if (!animateOnViewport || !shouldAnimate || !containerRef.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Desconectar después de la primera animación para mejor performance
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Trigger cuando 10% es visible
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [animateOnViewport, shouldAnimate]);

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  // Convertir children a array para manejar el stagger
  const childrenArray = React.Children.toArray(children);

  return (
    <div ref={containerRef} className={className}>
      {childrenArray.map((child, index) => {
        if (!React.isValidElement(child)) return child;

        return (
          <motion.div
            key={child.key || index}
            initial={isVisible ? false : { opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{
              duration: 0.3,
              delay: isVisible ? index * staggerDelay : 0,
              ease: 'easeOut',
            }}
          >
            {child}
          </motion.div>
        );
      })}
    </div>
  );
}

