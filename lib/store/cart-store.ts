import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';

export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    priceUSD?: number | string | null;
    priceMNs?: number | string | null;
    images: string[];
  };
  productVariant?: {
    id: string;
    name: string;
    priceUSD?: number | string | null;
    priceMNs?: number | string | null;
  } | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  total: number;
  setCart: (items: CartItem[], subtotal: number, total: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  fetchCart: () => Promise<void>;
  addToCart: (data: { product: CartItem['product']; productVariant?: CartItem['productVariant'] | null; quantity?: number }) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

function toNumber(value: any): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function computeSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const price = item.productVariant ? toNumber(item.productVariant.priceUSD ?? item.productVariant.priceMNs) : toNumber(item.product.priceUSD ?? item.product.priceMNs);
    return sum + price * item.quantity;
  }, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      total: 0,
      setCart: (items, subtotal, total) => {
        set({ items, subtotal, total });
      },
      clearCart: () => {
        set({ items: [], subtotal: 0, total: 0 });
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      fetchCart: async () => {
        try {
          const response = await api.get('/cart');
          const cart = response.data;
          set({
            items: cart.items || [],
            subtotal: cart.subtotal || 0,
            total: cart.total || 0,
          });
        } catch (error) {
          const status = (error as any)?.status
          // 401: token inválido/expirado o no hay sesión -> limpiar estado y evitar spam
          if (status === 401) {
            try {
              useAuthStore.getState().logout()
            } catch {
              // ignore
            }
            set({ items: [], subtotal: 0, total: 0 })
            return
          }
          // eslint-disable-next-line no-console
          console.warn('Cart fetch skipped/failed:', error);
        }
      },
      addToCart: async ({ product, productVariant, quantity = 1 }) => {
        // Intentar backend (si hay token); si falla, fallback a carrito local.
        try {
          await api.post('/cart', {
            productId: product.id,
            productVariantId: productVariant?.id,
            quantity,
          });
          await get().fetchCart();
          return;
        } catch (e: any) {
          // Si es un error de stock, lanzarlo para que el componente pueda manejarlo
          if (e.response?.data?.message && (
            e.response.data.message.includes('stock') || 
            e.response.data.message.includes('disponible') ||
            e.response.data.message.includes('Stock')
          )) {
            throw e;
          }
          // Para otros errores, fallback local solo si no hay autenticación
          const authStore = useAuthStore.getState();
          if (authStore.isAuthenticated()) {
            throw e;
          }
        }

        // Solo usar fallback local si no hay autenticación
        const authStore = useAuthStore.getState();
        if (authStore.isAuthenticated()) {
          return; // No debería llegar aquí si está autenticado
        }

        const key = `local-${product.id}-${productVariant?.id || 'default'}`;
        const prev = get().items;
        const existing = prev.find((i) => i.id === key);
        let nextItems: CartItem[];
        if (existing) {
          nextItems = prev.map((i) => (i.id === key ? { ...i, quantity: i.quantity + quantity } : i));
        } else {
          nextItems = [
            { id: key, product, productVariant: productVariant || null, quantity },
            ...prev,
          ];
        }
        const subtotal = computeSubtotal(nextItems);
        set({ items: nextItems, subtotal, total: subtotal });
      },
      updateItemQuantity: async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        if (!itemId.startsWith('local-')) {
          try {
            await api.patch(`/cart/${itemId}`, { quantity });
            await get().fetchCart();
            return;
          } catch (e: any) {
            // Si es un error de stock, lanzarlo para que el componente pueda manejarlo
            if (e.response?.data?.message && (
              e.response.data.message.includes('stock') || 
              e.response.data.message.includes('disponible') ||
              e.response.data.message.includes('Stock')
            )) {
              throw e;
            }
            // Para otros errores, fallback local solo si no hay autenticación
            const authStore = useAuthStore.getState();
            if (authStore.isAuthenticated()) {
              throw e;
            }
          }
        }
        
        // Solo usar fallback local si no hay autenticación
        const authStore = useAuthStore.getState();
        if (authStore.isAuthenticated() && !itemId.startsWith('local-')) {
          return; // No debería llegar aquí si está autenticado
        }
        
        const nextItems = get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
        const subtotal = computeSubtotal(nextItems);
        set({ items: nextItems, subtotal, total: subtotal });
      },
      removeItem: async (itemId: string) => {
        if (!itemId.startsWith('local-')) {
          try {
            await api.delete(`/cart/${itemId}`);
            await get().fetchCart();
            return;
          } catch (e) {
            // fallback local remove
          }
        }
        const nextItems = get().items.filter((i) => i.id !== itemId);
        const subtotal = computeSubtotal(nextItems);
        set({ items: nextItems, subtotal, total: subtotal });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

