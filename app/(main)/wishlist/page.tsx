"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { HeartIcon, CartIcon } from "@/components/icons/streamline-icons"
import { useAuthStore } from "@/lib/store/auth-store"
import { useWishlistStore } from "@/lib/store/wishlist-store"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { api, type BackendProduct } from "@/lib/api"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { AnimatedList } from "@/components/ui/animated-list"
import { WishlistItemSkeleton } from "@/components/wishlist/wishlist-item-skeleton"

function normalizeImageUrl(imagePath: string): string {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api\/?$/, "")
  if (imagePath.startsWith("/")) return `${base}${imagePath}`
  return `${base}/uploads/${imagePath}`
}



export default function WishlistPage() {
  const { toast } = useToast()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { items, fetchWishlist, remove } = useWishlistStore()
  const addToCart = useCartStore((s) => s.addToCart)
  const [trendingScroll, setTrendingScroll] = useState(0)
  const [bestSellers, setBestSellers] = useState<BackendProduct[]>([])
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true)

  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated()) {
        setIsLoadingWishlist(true)
        try {
          await fetchWishlist()
        } finally {
          setIsLoadingWishlist(false)
        }
      } else {
        setIsLoadingWishlist(false)
      }
    }
    loadWishlist()
  }, [fetchWishlist, isAuthenticated])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getBestSellers(8)
        const list = Array.isArray(data) ? data : []
        if (list.length > 0) {
          setBestSellers(list)
          return
        }
        // Fallback adicional: si el backend devuelve vacío, mostrar productos en oferta
        const res = await api.getProducts({ page: 1, limit: 40 })
        const products = res?.data || []
        const offers = products.filter((p: any) => {
          const price = typeof p.priceUSD === "number" ? p.priceUSD : Number(p.priceUSD || 0)
          const compare = p.comparePriceUSD !== null && p.comparePriceUSD !== undefined ? Number(p.comparePriceUSD) : null
          return compare !== null && compare > price
        })
        setBestSellers(offers.slice(0, 8))
      } catch {
        setBestSellers([])
      }
    }
    load()
  }, [])

  const scrollTrending = (direction: "left" | "right") => {
    const container = document.getElementById("trending-container")
    if (container) {
      const scrollAmount = 280
      if (direction === "left") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Página de inicio
          </Link>
          <span>{">"}</span>
          <span className="text-gray-400">Lista de deseos</span>
        </nav>

        {/* Title with count */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Lista de deseos</h1>
          <span className="text-sm sm:text-base text-gray-500">{items.length} productos</span>
        </div>

        {/* Loading state */}
        {isLoadingWishlist ? (
          <AnimatedList
            staggerDelay={0.04}
            enableAnimations={true}
            animateOnViewport={false}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <WishlistItemSkeleton key={index} />
            ))}
          </AnimatedList>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Heart className="h-20 w-20 text-gray-300" strokeWidth={1} />}
            title="Tu lista de deseos está vacía"
            description="Con la lista de deseos puedes marcar los productos para que sea más fácil 1) volver a encontrarlos en cualquier momento y 2) añadirlos a tu cesta de la compra con un solo clic. Sólo tienes que pinchar en el corazoncito de la parte superior derecha de la imagen del producto. A menos que ya seas feliz como una perdiz. Pero un regalito ayudaría a estar mejor ¿no?"
            action={
              !isAuthenticated() ? (
                <Button asChild variant="default">
                  <Link href="/auth/login">Iniciar sesión</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/products">Explorar Productos</Link>
                </Button>
              )
            }
            className="bg-gray-50 rounded-lg p-6 sm:p-8 mb-10 sm:mb-16"
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16">
            {items.map((wi) => {
              const p: any = wi.product || {}
              const price = typeof p.priceUSD === "number" ? p.priceUSD : Number(p.priceUSD || 0)
              const compare = p.comparePriceUSD !== null && p.comparePriceUSD !== undefined ? Number(p.comparePriceUSD) : null
              const hasDiscount = compare !== null && compare > price
              const img = Array.isArray(p.images) && p.images.length ? normalizeImageUrl(p.images[0]) : "/placeholder.svg"
              return (
              <div key={wi.id} className="group">
                {/* Product Image */}
                <Link
                  href={`/products/${p.slug}`}
                  className="block relative aspect-square rounded-lg overflow-hidden mb-3"
                >
                  <Image
                    src={img}
                    alt={p.name || "Producto"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Heart button - filled red because it's in wishlist */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      remove(p.id).catch((err: any) => {
                        toast({
                          title: "Error",
                          description: err?.response?.data?.message || err?.message || "No se pudo eliminar de la wishlist.",
                          variant: "destructive",
                        })
                      })
                    }}
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 bg-rose-500 rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors z-10"
                  >
                    <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                  </button>
                </Link>

                {/* Product Info */}
                <Link href={`/products/${p.slug}`}>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">
                    {p.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base sm:text-lg font-bold text-rose-500">
                    {price.toFixed(2).replace(".", ",")} €
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      {compare!.toFixed(2).replace(".", ",")} €
                    </span>
                  )}
                </div>

                {/* Add to cart button */}
                <button
                  onClick={() => {
                    addToCart({
                      product: {
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        priceUSD: p.priceUSD ?? null,
                        priceMNs: p.priceMNs ?? null,
                        images: Array.isArray(p.images) ? p.images : [],
                      },
                      productVariant: null,
                      quantity: 1,
                    }).then(() => toast({ title: "Añadido al carrito" }))
                      .catch((err: any) =>
                        toast({
                          title: "No se pudo añadir",
                          description: err?.response?.data?.message || err?.message || "Intenta nuevamente.",
                          variant: "destructive",
                        }),
                      )
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
                >
                  <CartIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Añadir al carrito de la compra</span>
                  <span className="sm:hidden">Añadir al carrito</span>
                </button>
              </div>
            )})}
          </div>
        )}

        {/* Trending Section */}
        <section className="mb-10 sm:mb-16">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tendencia Ahora</h2>
              <p className="text-sm text-gray-500 mt-1">Estos productos seguro te interesan</p>
            </div>
            {/* Navigation arrows - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollTrending("left")}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollTrending("right")}
                className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trending Products Carousel */}
          <div
            id="trending-container"
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {bestSellers.map((product) => {
              const img = Array.isArray(product.images) && product.images.length ? normalizeImageUrl(product.images[0]) : "/placeholder.svg"
              const price = typeof product.priceUSD === "number" ? product.priceUSD : Number(product.priceUSD || 0)
              return (
              <div key={product.id} className="flex-shrink-0 w-[160px] sm:w-[220px] group">
                <Link
                  href={`/products/${product.slug}`}
                  className="block relative aspect-square rounded-lg overflow-hidden mb-3"
                >
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 45vw, 220px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Heart button */}
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sky-100"
                  >
                    <HeartIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </Link>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  {price.toFixed(2).replace(".", ",")} €
                </span>
              </div>
            )})}
          </div>
        </section>

      </div>
    </div>
  )
}
