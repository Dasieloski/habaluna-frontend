import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toNumber } from '@/lib/money'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea importes para UI.
 * - Si se proveen 2 valores, usa el primero disponible (prioriza `priceUSD` por compatibilidad histórica).
 * - Mantiene un formato simple y consistente en todo el sitio (`$12.34`).
 */
export function formatPrice(
  priceUSD?: number | string | null,
  priceMNs?: number | string | null,
): string {
  const n =
    toNumber(priceUSD) ??
    toNumber(priceMNs) ??
    0

  return `$${n.toFixed(2)}`
}
