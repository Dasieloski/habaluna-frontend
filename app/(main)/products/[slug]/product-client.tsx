'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product/product-card"
import { ProductPrice } from "@/components/product/product-price"
import { toNumber } from "@/lib/money"
import { useToast } from "@/hooks/use-toast"
import { showSuccess, showError } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { useCartStore } from "@/lib/store/cart-store"
import {
  HeartIcon,
  ShareIcon,
  TruckIcon,
  ReturnIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons/streamline-icons"
import { OptimizedImage } from "@/components/ui/optimized-image"

interface ProductClientProps {
  product: any
  relatedProducts?: any[]
  reviews?: any[]
}

function normalizeImageUrl(imagePath: string): string {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api\/?$/, "")
  if (imagePath.startsWith("/")) return `${base}${imagePath}`
  return `${base}/uploads/${imagePath}`
}

export function ProductClient({ product, relatedProducts = [], reviews = [] }: ProductClientProps) {
  const { toast } = useToast()
  const addToCart = useCartStore((s) => s.addToCart)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => product?.variants?.[0]?.id || "")
  const relatedScrollRef = useRef<HTMLDivElement>(null)
  const isCombo = Boolean(product?.isCombo)

  // Form reseña
  const [reviewName, setReviewName] = useState("")
  const [reviewEmail, setReviewEmail] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewContent, setReviewContent] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [displayReviews, setDisplayReviews] = useState<any[]>(() => (Array.isArray(reviews) ? reviews : []))

  useEffect(() => {
    setDisplayReviews(Array.isArray(reviews) ? reviews : [])
  }, [reviews])

  const images = useMemo(() => {
    const raw: string[] = Array.isArray(product?.images) ? product.images : []
    const combined: string[] = raw.map(normalizeImageUrl).filter(Boolean)

    // Si es combo, meter también imágenes de los productos incluidos para verlas en el carrusel
    if (isCombo) {
      const items = Array.isArray(product?.comboItems) ? product.comboItems : []
      for (const ci of items) {
        const p = ci?.product || ci?.item || ci?.includedProduct || null
        const imgs: string[] = Array.isArray(p?.images) ? p.images : []
        for (const img of imgs) {
          const u = normalizeImageUrl(img || "")
          if (u) combined.push(u)
        }
      }
    }

    const deduped = Array.from(new Set(combined))
    return deduped.length > 0 ? deduped : ["/placeholder.svg"]
  }, [isCombo, product?.comboItems, product?.images])

  useEffect(() => {
    if (selectedImage >= images.length) setSelectedImage(0)
  }, [images.length, selectedImage])

  const comboItems = useMemo(() => {
    const raw = Array.isArray(product?.comboItems) ? product.comboItems : []
    return raw
      .map((ci: any) => {
        const p = ci?.product || ci?.item || ci?.includedProduct || null
        const rawImages: string[] = Array.isArray(p?.images) ? p.images : []
        const image = normalizeImageUrl(rawImages[0] || "")
        const name = p?.name || "Producto"
        const slug = p?.slug || ""
        const id = ci?.id || `${ci?.comboId || product?.id || "combo"}-${p?.id || slug || name}`
        const quantity = Math.max(1, Number(ci?.quantity ?? 1) || 1)

        return { id, name, slug, image, quantity }
      })
      .filter((x: any) => Boolean(x?.name))
  }, [product?.comboItems, product?.id])

  const variants = Array.isArray(product?.variants) ? product.variants : []
  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) || null

  const priceUSD = toNumber(selectedVariant?.priceUSD ?? product?.priceUSD) ?? 0
  const comparePriceUSD = toNumber(selectedVariant?.comparePriceUSD ?? product?.comparePriceUSD)
  const hasDiscount = comparePriceUSD !== null && comparePriceUSD > priceUSD
  const salePercentage =
    hasDiscount && comparePriceUSD
      ? Math.round(((comparePriceUSD - priceUSD) / comparePriceUSD) * 100)
      : null

  const stock = selectedVariant ? Number(selectedVariant.stock ?? 0) : Number(product?.stock ?? 0)

  const shareProduct = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : ""
      const title = product?.name || "Producto"
      const text = product?.shortDescription || ""

      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }

      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url)
        toast({
          title: "Enlace copiado",
          description: "Copiamos el enlace del producto al portapapeles.",
        })
        return
      }

      toast({
        title: "No se pudo compartir",
        description: "Tu navegador no soporta compartir o copiar el enlace.",
        variant: "destructive",
      })
    } catch (e: any) {
      // Si el usuario cancela el share, no es error real
      if (e?.name === "AbortError") return
      toast({
        title: "No se pudo compartir",
        description: "Ocurrió un error al intentar compartir este producto.",
        variant: "destructive",
      })
    }
  }

  const submitReview = async () => {
    if (!product?.id) return
    if (!reviewName.trim()) {
      toast({ title: "Falta tu nombre", description: "Escribe tu nombre para publicar la reseña.", variant: "destructive" })
      return
    }
    if (!reviewContent.trim()) {
      toast({ title: "Falta el comentario", description: "Escribe el contenido de tu reseña.", variant: "destructive" })
      return
    }

    setIsSubmittingReview(true)
    try {
      const created = await api.createProductReview(product.id, {
        authorName: reviewName.trim(),
        authorEmail: reviewEmail.trim() ? reviewEmail.trim() : undefined,
        rating: Math.max(1, Math.min(5, Math.round(Number(reviewRating) || 5))),
        title: reviewTitle.trim() ? reviewTitle.trim() : undefined,
        content: reviewContent.trim(),
      })
      // Mostrarla inmediatamente (si no está aprobada, se verá como "pendiente")
      setDisplayReviews((prev) => [created as any, ...(Array.isArray(prev) ? prev : [])])
      setReviewTitle("")
      setReviewContent("")
      toast({
        title: "Reseña enviada",
        description: created?.isApproved ? "Gracias. Ya está publicada." : "Gracias. Quedará visible cuando sea aprobada.",
      })
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.response?.data?.message || e?.message || "No se pudo enviar la reseña.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const scrollRelated = (direction: "left" | "right") => {
    if (!relatedScrollRef.current) return
    const scrollAmount = 280
    relatedScrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-sky-600 transition-colors">
            Productos
          </Link>
          {product?.categoryId && (
            <>
              <span>/</span>
              <Link
                href={`/products?categoryId=${encodeURIComponent(product.categoryId)}`}
                className="hover:text-sky-600 transition-colors"
              >
                {product?.category?.name || "Categoría"}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product?.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 pb-8 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Left - Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? "border-sky-500 ring-2 ring-sky-200"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <OptimizedImage
                    src={img || "/placeholder.svg"}
                    alt={`Vista ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                    objectFit="cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative bg-linear-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl overflow-hidden aspect-square">
              <OptimizedImage
                src={images[selectedImage] || "/placeholder.svg"}
                alt={product?.name || "Producto"}
                fill
                className="p-4 md:p-8"
                sizes="(max-width: 768px) 100vw, 50vw"
                objectFit="contain"
                loading="eager"
                priority
              />
              {/* Navigation arrows */}
              <button
                onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="flex flex-col">
            {/* Category */}
            {product?.category?.name && (
              <span className="text-xs md:text-sm text-sky-600 font-medium mb-1 md:mb-2">{product.category.name}</span>
            )}

            {/* Title */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1 md:mb-2">{product?.name}</h1>
                {isCombo && (
                  <div className="mb-2 md:mb-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-xs font-bold tracking-wide uppercase bg-sky-600 text-white px-3 py-1 rounded-full">
                        Combo
                      </span>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        Incluye varios productos seleccionados
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            {product?.shortDescription && (
              <p className="text-sm md:text-base text-muted-foreground mb-2 md:mb-3">{product.shortDescription}</p>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <ProductPrice priceUSD={priceUSD} comparePriceUSD={comparePriceUSD ?? undefined} variant="large" />
              {salePercentage !== null && (
                <span className="text-xs md:text-sm font-semibold text-white bg-linear-to-r from-orange-400 to-red-500 px-3 py-1 rounded-full">
                  -{salePercentage}%
                </span>
              )}
            </div>

            {/* Combo contents */}
            {isCombo && comboItems.length > 0 && (
              <div className="mb-4 md:mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm md:text-base font-semibold text-foreground">Este combo incluye</h3>
                  <span className="text-xs text-muted-foreground">{comboItems.length} productos</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {comboItems.map((item: any) => {
                    const card = (
                      <>
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                          <OptimizedImage
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                            objectFit="cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                      </>
                    )

                    if (item.slug) {
                      return (
                        <Link
                          key={item.id}
                          href={`/products/${encodeURIComponent(item.slug)}`}
                          className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:bg-muted/40 transition-colors"
                        >
                          {card}
                        </Link>
                      )
                    }

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 opacity-80"
                      >
                        {card}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Elige una opción</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full md:w-auto px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-sky-300 bg-background"
                >
                  {variants.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>

            {/* Add to cart (UI) */}
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <button
                disabled={stock <= 0}
                onClick={async () => {
                  try {
                    await addToCart({
                      product: {
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        priceUSD: product.priceUSD ?? null,
                        priceMNs: product.priceMNs ?? null,
                        images: Array.isArray(product.images) ? product.images : [],
                      },
                      productVariant: selectedVariant
                        ? {
                            id: selectedVariant.id,
                            name: selectedVariant.name,
                            priceUSD: selectedVariant.priceUSD ?? null,
                            priceMNs: selectedVariant.priceMNs ?? null,
                          }
                        : null,
                      quantity,
                    })
                    showSuccess(
                      "Producto agregado",
                      `${product.name}${selectedVariant ? ` - ${selectedVariant.name}` : ''} se agregó al carrito`
                    )
                  } catch (err: any) {
                    const errorMessage = err.response?.data?.message || err.message || "No se pudo añadir al carrito"
                    showError(
                      "Error al agregar",
                      errorMessage
                    )
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-3.5 md:py-4 px-6 rounded-xl font-semibold hover:bg-foreground/90 transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Añadir al carrito
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3.5 md:p-4 rounded-xl border transition-all ${
                  isFavorite ? "bg-red-50 border-red-200 text-red-500" : "border-border hover:bg-muted"
                }`}
              >
                <HeartIcon className="w-5 h-5 md:w-6 md:h-6" filled={isFavorite} />
              </button>
              <button
                onClick={shareProduct}
                className="p-3.5 md:p-4 rounded-xl border border-border hover:bg-muted transition-all"
                aria-label="Compartir"
                type="button"
              >
                <ShareIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
              <span className="flex items-center gap-1.5">
                <ReturnIcon className="w-4 h-4 md:w-5 md:h-5" />
                Devoluciones gratuitas
              </span>
              <span className="flex items-center gap-1.5">
                <TruckIcon className="w-4 h-4 md:w-5 md:h-5" />
                Entrega rápida
              </span>
            </div>

            {/* Delivery info */}
            <div className="bg-sky-50 rounded-xl p-4 mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entrega prevista:</p>
                  <p className="text-sm font-medium text-foreground">24–72h (estimado)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-sky-600 font-medium">Envío gratis desde 100 €</p>
                <Link href="/shipping" className="text-xs text-sky-500 hover:underline">
                  Saber más
                </Link>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-border">
              {[
                { id: "brief", title: "Breve descripción", content: product?.shortDescription || "" },
                { id: "desc", title: "Descripción", content: product?.description || "" },
                {
                  id: "details",
                  title: "Detalles",
                  content: [
                    product?.sku ? `SKU: ${product.sku}` : null,
                    product?.weight ? `Peso: ${product.weight}` : null,
                    Array.isArray(product?.allergens) && product.allergens.length > 0
                      ? `Alérgenos: ${product.allergens.join(", ")}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join("\n"),
                },
              ].filter((x) => x.id !== "brief" || x.content).map((item) => (
                <div key={item.id} className="border-b border-border">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}
                    className="w-full py-4 flex items-center justify-between text-sm md:text-base font-medium text-foreground hover:text-sky-600 transition-colors"
                  >
                    {item.title}
                    <ChevronRightIcon
                      className={`w-5 h-5 transition-transform ${openAccordion === item.id ? "rotate-90" : ""}`}
                    />
                  </button>
                  {openAccordion === item.id && (
                    <div className="pb-4 text-sm text-muted-foreground whitespace-pre-wrap">{item.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-10 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-xl md:text-3xl font-bold text-foreground">También te puede interesar</h2>
                <p className="text-sm text-muted-foreground mt-1">Más productos de la misma categoría</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => scrollRelated("left")}
                  className="p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollRelated("right")}
                  className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div ref={relatedScrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2">
              {relatedProducts.map((p: any) => (
                <div key={p.id} className="shrink-0 w-[160px] md:w-[240px]">
                  <ProductCard
                    product={{
                      id: p.id,
                      slug: p.slug,
                      name: p.name,
                      images: p.images?.map(normalizeImageUrl),
                      priceUSD: toNumber(p.priceUSD) ?? undefined,
                      comparePriceUSD: toNumber(p.comparePriceUSD) ?? undefined,
                      variants: p.variants,
                    }}
                    badge={undefined}
              />
                </div>
              ))}
            </div>
          </div>
        </section>
          )}

      {/* Reviews Section (placeholder) */}
      <section className="py-10 md:py-16 bg-sky-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-6 text-center">Reseñas</h2>

            {/* Dejar reseña */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Dejar una reseña</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nombre *</label>
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-sky-300 bg-background"
                    placeholder="Tu nombre"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email (opcional)</label>
                  <input
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-sky-300 bg-background"
                    placeholder="tu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rating</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-sky-300 bg-background"
                    >
                      {[5, 4, 3, 2, 1].map((v) => (
                        <option key={v} value={v}>
                          {v} / 5
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i}>{i < (Number(reviewRating) || 0) ? "★" : "☆"}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Título (opcional)</label>
                  <input
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:ring-2 focus:ring-sky-300 bg-background"
                    placeholder="Resumen"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Comentario *</label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="w-full p-4 border border-border rounded-xl text-sm resize-none h-28 focus:ring-2 focus:ring-sky-300"
                    placeholder="Escribe tu reseña..."
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={submitReview}
                  disabled={isSubmittingReview}
                  className="px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? "Enviando..." : "Enviar reseña"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Nota: tu reseña quedará <strong>pendiente</strong> hasta que sea aprobada.
              </p>
            </div>

            {displayReviews.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-sm text-muted-foreground">Aún no hay reseñas para este producto.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayReviews.map((r: any) => (
                  <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border border-border/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{r.authorName || "Cliente"}</p>
                          {r.isApproved === false && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 mt-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i}>{i < (Number(r.rating) || 0) ? "★" : "☆"}</span>
                          ))}
                          <span className="text-xs text-muted-foreground ml-2">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-ES") : ""}
                          </span>
                        </div>
                        {r.title && <p className="text-sm font-medium text-foreground mt-2">{r.title}</p>}
        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
      </div>
    </div>
      </section>
    </>
  )
}

