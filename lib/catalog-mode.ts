/**
 * Utilidad para verificar si la aplicación está en modo catálogo
 * En modo catálogo:
 * - Los precios se ocultan
 * - No se pueden añadir productos al carrito
 * - No se puede proceder al checkout
 */
export function isCatalogMode(): boolean {
  return process.env.NEXT_PUBLIC_CATALOG_MODE === 'true';
}

