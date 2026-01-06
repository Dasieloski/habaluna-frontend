"use client"

import { useRef, useState, useEffect } from "react"
import { ProductCard } from "@/components/product/product-card"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons/streamline-icons"

interface Product {
  id: string
  slug: string
  name: string
  images?: string[]
  priceUSD?: number
  comparePriceUSD?: number
  variants?: Array<{
    priceUSD?: number
    comparePriceUSD?: number
  }>
}

interface ProductCarouselProps {
  title: string
  products: Product[]
  viewAllLink?: string
  badgeType?: "bestseller" | "new" | "sale" | "personalized"
  autoSlide?: boolean
}

const DEFAULT_CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop",
]

export function ProductCarousel({ title, products, viewAllLink, badgeType, autoSlide = false }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (scrollRef.current) {
      observer.observe(scrollRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (autoSlide && scrollRef.current) {
      const interval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
          } else {
            scrollRef.current.scrollBy({ left: 200, behavior: "smooth" })
          }
        }
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [autoSlide])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 250
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const getBadge = (index: number) => {
    if (badgeType === "bestseller" && index < 3) return { text: "TOP VENTA", color: "blue" as const }
    if (badgeType === "new") return { text: "NUEVO", color: "coral" as const }
    if (badgeType === "sale") return { text: "OFERTA", color: "coral" as const }
    if (badgeType === "personalized") return { text: "DESTACADO", color: "mint" as const }
    return null
  }

  if (!products || products.length === 0) return null

  // Asegurar que cada producto tenga imagen
  const productsWithImages = products.map((product, index) => ({
    ...product,
    images: product.images?.length ? product.images : [DEFAULT_CAROUSEL_IMAGES[index % DEFAULT_CAROUSEL_IMAGES.length]],
  }))

  return (
    <section
      className={`py-8 md:py-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-3xl font-bold text-foreground">{title}</h2>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-xs md:text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1 group"
            >
              Ver todo
              <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <div className="relative group">
          <button
            onClick={() => scroll("left")}
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white shadow-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 -translate-x-2 group-hover:translate-x-0"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white shadow-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 translate-x-2 group-hover:translate-x-0"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-2 px-2"
          >
            {productsWithImages.map((product, index) => {
              const badge = getBadge(index)
              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[160px] md:w-[240px] transition-all duration-500"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  }}
                >
                  <ProductCard product={product} badge={badge?.text} badgeColor={badge?.color} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
