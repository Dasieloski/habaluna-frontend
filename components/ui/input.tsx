'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface InputProps extends React.ComponentProps<'input'> {
  /**
   * Si es false, desactiva las animaciones de microinteracción
   * Por defecto: true
   */
  enableAnimations?: boolean;
}

/**
 * Input component con microinteracciones profesionales
 * 
 * Microinteracciones incluidas:
 * - Focus: animación suave del ring y border
 * - Hover: ligero cambio de sombra
 * - Error: shake animation sutil cuando hay error
 * 
 * Para desactivar animaciones: <Input enableAnimations={false} />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, enableAnimations = true, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = enableAnimations && !prefersReducedMotion;
    
    const combinedRef = React.useMemo(() => {
      return (node: HTMLInputElement | null) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
        inputRef.current = node;
      };
    }, [ref]);

    // Animación de shake cuando hay error (solo si no prefiere movimiento reducido)
    React.useEffect(() => {
      if (props['aria-invalid'] === 'true' && shouldAnimate && inputRef.current) {
        inputRef.current.classList.add('animate-shake');
        const timer = setTimeout(() => {
          inputRef.current?.classList.remove('animate-shake');
        }, 500);
        return () => clearTimeout(timer);
      }
    }, [props['aria-invalid'], shouldAnimate]);

    const baseClasses = cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'transition-all duration-200 ease-out',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:shadow-md',
      'hover:shadow-sm hover:border-ring/50',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      className,
    );

    if (!shouldAnimate) {
      return (
        <input
          ref={combinedRef}
          type={type}
          data-slot="input"
          className={baseClasses}
          {...props}
        />
      );
    }

    return (
      <motion.input
        ref={combinedRef}
        type={type}
        data-slot="input"
        className={baseClasses}
        initial={false}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        {...(props as any)}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
