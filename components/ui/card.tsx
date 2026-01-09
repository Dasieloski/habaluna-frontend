'use client';

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends React.ComponentProps<'div'> {
  /**
   * Si es false, desactiva las animaciones de hover
   * Por defecto: true
   */
  enableAnimations?: boolean;
}

/**
 * Card component con microinteracciones profesionales
 * 
 * Microinteracciones incluidas:
 * - Hover: ligero lift y sombra más pronunciada
 * - Transición suave al hacer hover
 * 
 * Para desactivar animaciones: <Card enableAnimations={false} />
 */
function Card({ className, enableAnimations = true, ...props }: CardProps) {
  const baseClasses = cn(
    'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm transition-shadow duration-300',
    enableAnimations && 'hover:shadow-md',
    className,
  );

  if (!enableAnimations) {
    return (
      <div
        data-slot="card"
        className={baseClasses}
        {...props}
      />
    );
  }

  return (
    <motion.div
      data-slot="card"
      className={baseClasses}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...(props as any)}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
