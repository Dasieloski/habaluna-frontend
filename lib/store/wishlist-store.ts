import { create } from "zustand"
import { api, type BackendWishlistItem } from "@/lib/api"
import { useAuthStore } from "@/lib/store/auth-store"

interface WishlistState {
  items: BackendWishlistItem[]
  isLoading: boolean
  error: string | null
  fetchWishlist: () => Promise<void>
  isInWishlist: (productId: string) => boolean
  add: (productId: string) => Promise<void>
  remove: (productId: string) => Promise<void>
  toggle: (productId: string) => Promise<void>
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  fetchWishlist: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.getWishlist()
      set({ items: res.items || [], isLoading: false })
    } catch (e: any) {
      const status = e?.status
      if (status === 401) {
        try {
          useAuthStore.getState().logout()
        } catch {
          // ignore
        }
        set({ items: [], isLoading: false, error: null })
        return
      }
      set({
        isLoading: false,
        error: e?.response?.data?.message || e?.message || "No se pudo cargar la wishlist.",
      })
    }
  },
  isInWishlist: (productId: string) => {
    return get().items.some((i) => i.productId === productId || i.product?.id === productId)
  },
  add: async (productId: string) => {
    try {
      const created = await api.addToWishlist(productId)
      set((s) => ({ items: [created, ...s.items] }))
    } catch (e) {
      throw e
    }
  },
  remove: async (productId: string) => {
    try {
      await api.removeFromWishlist(productId)
      set((s) => ({ items: s.items.filter((i) => (i.productId || i.product?.id) !== productId) }))
    } catch (e) {
      throw e
    }
  },
  toggle: async (productId: string) => {
    if (get().isInWishlist(productId)) {
      await get().remove(productId)
    } else {
      await get().add(productId)
    }
  },
}))

