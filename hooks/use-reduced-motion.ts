'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para detectar si el usuario prefiere movimiento reducido
 * 
 * Útil para desactivar animaciones en usuarios sensibles al movimiento
 * 
 * Uso:
 * const prefersReducedMotion = useReducedMotion();
 * 
 * if (!prefersReducedMotion) {
 *   // Aplicar animaciones
 * }
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Verificar preferencia del usuario
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Establecer valor inicial
    setPrefersReducedMotion(mediaQuery.matches);

    // Escuchar cambios en la preferencia
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Usar addEventListener si está disponible (navegadores modernos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}
