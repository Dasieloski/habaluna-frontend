import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';

export interface CartValidationItem {
  itemId: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  requestedQuantity: number;
  availableStock: number;
  isAvailable: boolean;
  isActive: boolean;
  issue: 'out_of_stock' | 'insufficient_stock' | 'unavailable' | null;
}

export interface CartValidationResult {
  isValid: boolean;
  hasIssues: boolean;
  items: CartValidationItem[];
  summary: {
    total: number;
    valid: number;
    outOfStock: number;
    insufficientStock: number;
    unavailable: number;
  };
}

export function useCartValidation() {
  const [validation, setValidation] = useState<CartValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { items, fetchCart } = useCartStore();

  const validateCart = useCallback(async () => {
    if (!isAuthenticated() || items.length === 0) {
      setValidation(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<CartValidationResult>('/cart/validate');
      setValidation(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al validar el carrito';
      setError(errorMessage);
      setValidation(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, items.length]);

  // Validar automáticamente cuando cambian los items del carrito
  useEffect(() => {
    if (isAuthenticated() && items.length > 0) {
      // Debounce para evitar demasiadas llamadas
      const timeoutId = setTimeout(() => {
        validateCart();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setValidation(null);
    }
  }, [items, isAuthenticated, validateCart]);

  // Función para obtener el mensaje de error para un item específico
  const getItemErrorMessage = useCallback((itemId: string): string | null => {
    if (!validation) return null;
    
    const item = validation.items.find((i) => i.itemId === itemId);
    if (!item || !item.issue) return null;

    const variantText = item.variantName ? ` (${item.variantName})` : '';
    
    switch (item.issue) {
      case 'out_of_stock':
        return `"${item.productName}${variantText}" ya no está disponible`;
      case 'insufficient_stock':
        return `Solo ${item.availableStock} disponible${item.availableStock > 1 ? 's' : ''} de "${item.productName}${variantText}"`;
      case 'unavailable':
        return `"${item.productName}${variantText}" ya no está disponible`;
      default:
        return null;
    }
  }, [validation]);

  // Función para verificar si un item tiene problemas
  const hasItemIssue = useCallback((itemId: string): boolean => {
    if (!validation) return false;
    const item = validation.items.find((i) => i.itemId === itemId);
    return item ? item.issue !== null : false;
  }, [validation]);

  // Función para obtener el stock disponible de un item
  const getItemAvailableStock = useCallback((itemId: string): number | null => {
    if (!validation) return null;
    const item = validation.items.find((i) => i.itemId === itemId);
    return item ? item.availableStock : null;
  }, [validation]);

  return {
    validation,
    loading,
    error,
    validateCart,
    getItemErrorMessage,
    hasItemIssue,
    getItemAvailableStock,
    isValid: validation?.isValid ?? true,
    hasIssues: validation?.hasIssues ?? false,
  };
}
