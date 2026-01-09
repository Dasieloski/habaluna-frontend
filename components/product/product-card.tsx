"use client"

import Link from "next/link"
import { useState } from "react"
import { HeartIcon } from "@/components/icons/streamline-icons"
import { Star } from "lucide-react"
import { toNumber } from "@/lib/money"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { useWishlistStore } from "@/lib/store/wishlist-store"
import { OptimizedImage } from "@/components/ui/optimized-image"

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
    averageRating?: number | string | null
    reviewCount?: number
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
          <OptimizedImage
            src={currentImage}
            alt={product.name}
            fill
            className="p-4 md:p-6 transition-all duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            objectFit="cover"
            loading="lazy"
          />

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
          {product.averageRating && product.reviewCount && product.reviewCount > 0 && (
            <div className="mt-1.5 md:mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] md:text-xs font-semibold text-foreground">
                  {Number(product.averageRating).toFixed(1)}
                </span>
              </div>
              <span className="text-[9px] md:text-[10px] text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
          )}
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
