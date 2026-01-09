"use client"

import Link from "next/link"
import { useState } from "react"
import { HeartIcon } from "@/components/icons/streamline-icons"
import { toNumber } from "@/lib/money"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { useWishlistStore } from "@/lib/store/wishlist-store"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    images?: string[]
    priceUSD?: number
    priceMNs?: number
    comparePriceUSD?: number
    comparePriceMNs?: number
    variants?: Array<{
      id?: string
      name?: string
      priceUSD?: number
      priceMNs?: number
      comparePriceUSD?: number
      comparePriceMNs?: number
    }>
  }
  badge?: string
  badgeColor?: "coral" | "blue" | "mint"
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"

export function ProductCard({ product, badge, badgeColor = "coral" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { toast } = useToast()
  const addToCart = useCartStore((s) => s.addToCart)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id))

  const price = toNumber(product.variants?.[0]?.priceUSD ?? product.priceUSD) ?? 0
  const comparePrice = toNumber(product.variants?.[0]?.comparePriceUSD ?? product.comparePriceUSD)
  const hasDiscount = comparePrice !== null && comparePrice > price

  const firstImage = product.images?.[0] || DEFAULT_IMAGE
  const secondImage = product.images?.[1] || firstImage
  const currentImage = isHovered && product.images?.[1] ? secondImage : firstImage

  const badgeColors = {
    coral: "bg-gradient-to-r from-orange-400 to-red-400 text-white",
    blue: "bg-gradient-to-r from-sky-400 to-blue-500 text-white",
    mint: "bg-gradient-to-r from-teal-400 to-cyan-400 text-white",
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative bg-white rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 p-4 md:p-6">
              <div className="text-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-400">Imagen no disponible</p>
              </div>
            </div>
          ) : (
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover p-4 md:p-6 transition-all duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          )}

          {badge && (
            <span
              className={`absolute top-2 left-2 md:top-3 md:left-3 px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold uppercase rounded-full shadow-lg ${badgeColors[badgeColor]}`}
            >
              {badge}
            </span>
          )}

          <button
            onClick={(e) => {
              e.preventDefault()
              if (!isAuthenticated()) {
                toast({ title: "Inicia sesión", description: "Para guardar productos en tu wishlist.", variant: "destructive" })
                return
              }
              toggleWishlist(product.id).catch((err: any) => {
                toast({
                  title: "Error",
                  description: err?.response?.data?.message || err?.message || "No se pudo actualizar la wishlist.",
                  variant: "destructive",
                })
              })
            }}
            className={`absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all duration-300 ${
              isInWishlist
                ? "bg-red-500 text-white scale-110"
                : "bg-white/90 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 hover:bg-white"
            }`}
          >
            <HeartIcon className="w-4 h-4 md:w-5 md:h-5" filled={isInWishlist} />
          </button>

          {/* Add to cart quick action */}
          <button
            onClick={async (e) => {
              e.preventDefault()
              e.stopPropagation()
              try {
                await addToCart({
                  product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    priceUSD: product.priceUSD ?? product.variants?.[0]?.priceUSD ?? null,
                    priceMNs: product.priceMNs ?? product.variants?.[0]?.priceMNs ?? null,
                    images: product.images || [],
                  },
                  productVariant: product.variants?.[0]?.id
                    ? {
                        id: product.variants?.[0]?.id as string,
                        name: (product.variants?.[0] as any)?.name || "Variante",
                        priceUSD: (product.variants?.[0] as any)?.priceUSD ?? null,
                        priceMNs: (product.variants?.[0] as any)?.priceMNs ?? null,
                      }
                    : null,
                  quantity: 1,
                })
                toast({ title: "Añadido al carrito" })
              } catch (err: any) {
                toast({
                  title: "No se pudo añadir",
                  description: err?.response?.data?.message || err?.message || "Intenta nuevamente.",
                  variant: "destructive",
                })
              }
            }}
            className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-foreground text-background text-xs md:text-sm font-semibold py-2.5 rounded-xl hover:bg-foreground/90"
            type="button"
          >
            Añadir al carrito
          </button>
        </div>

        <div className="p-3 md:p-4">
          <h3 className="text-xs md:text-sm font-medium text-foreground line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] group-hover:text-sky-600 transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 md:mt-3 flex items-center gap-1.5 md:gap-2">
            <span className="text-sm md:text-lg font-bold text-foreground">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-[10px] md:text-sm text-muted-foreground line-through">
                ${comparePrice!.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
