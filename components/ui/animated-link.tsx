'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /**
   * Si es false, desactiva las animaciones de hover
   * Por defecto: true
   */
  enableAnimations?: boolean;
  /**
   * Variante de animación:
   * - 'underline': subrayado animado
   * - 'scale': scale sutil al hover
   * - 'lift': lift ligero al hover
   * Por defecto: 'underline'
   */
  variant?: 'underline' | 'scale' | 'lift';
  [key: string]: any;
}

/**
 * Link component con microinteracciones profesionales
 * 
 * Microinteracciones incluidas:
 * - Hover: animación suave según la variante
 * - Underline: subrayado animado
 * - Scale: ligero scale al hover
 * - Lift: lift sutil al hover
 * 
 * Uso:
 * <AnimatedLink href="/products">Productos</AnimatedLink>
 * <AnimatedLink href="/about" variant="scale">Sobre nosotros</AnimatedLink>
 * 
 * Para desactivar animaciones: <AnimatedLink enableAnimations={false} href="/">Link</AnimatedLink>
 */
export function AnimatedLink({
  href,
  children,
  className,
  enableAnimations = true,
  variant = 'underline',
  ...props
}: AnimatedLinkProps) {
  if (!enableAnimations) {
    return (
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    );
  }

  const baseClasses = cn('transition-colors duration-200', className);

  if (variant === 'scale') {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.15 }}>
        <Link href={href} className={baseClasses} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }

  if (variant === 'lift') {
    return (
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
        <Link href={href} className={baseClasses} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }

  // Variante underline por defecto
  return (
    <Link href={href} className={cn(baseClasses, 'relative group')} {...props}>
      {children}
      <motion.span
        className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-colors"
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </Link>
  );
}
