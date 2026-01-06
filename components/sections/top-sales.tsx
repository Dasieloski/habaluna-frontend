"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { HeartIcon } from "@/components/icons/streamline-icons"
import { toNumber } from "@/lib/money"

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

interface TopSalesProps {
  products: Product[]
}

export function TopSales({ products }: TopSalesProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }

  if (!products || products.length === 0) return null

  const featuredProduct = products[0]
  const otherProducts = products.slice(1, 5)

  const getPrice = (product: Product) => toNumber(product.variants?.[0]?.priceUSD ?? product.priceUSD) ?? 0
  const getComparePrice = (product: Product) => toNumber(product.variants?.[0]?.comparePriceUSD ?? product.comparePriceUSD)

  return (
    <section ref={sectionRef} className="py-10 md:py-16 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div
          className={`flex items-center justify-between mb-6 md:mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h2 className="text-xl md:text-3xl font-bold text-foreground">Top Ventas</h2>
          <Link
            href="/products?filter=top"
            className="px-4 md:px-5 py-2 md:py-2.5 bg-sky-500 text-white text-xs md:text-sm font-semibold rounded-xl hover:bg-sky-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-sky-200"
          >
            Ver todo
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
          {/* Featured product */}
          <Link
            href={`/products/${featuredProduct.slug}`}
            className={`col-span-2 lg:row-span-2 group transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative h-full bg-white rounded-xl md:rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
                <img
                  src={featuredProduct.images?.[0] || "/placeholder.svg?height=600&width=600&query=featured product"}
                  alt={featuredProduct.name}
                  className="w-full h-full object-cover lg:object-contain p-4 md:p-8 group-hover:scale-110 transition-transform duration-700"
                />
                <button
                  onClick={(e) => toggleFavorite(featuredProduct.id, e)}
                  className={`absolute top-3 right-3 p-2 md:p-3 rounded-xl transition-all duration-300 ${
                    favorites.has(featuredProduct.id)
                      ? "bg-red-500 text-white scale-110"
                      : "bg-white/90 backdrop-blur-sm text-foreground hover:bg-white"
                  }`}
                >
                  <HeartIcon className="w-5 h-5 md:w-6 md:h-6" filled={favorites.has(featuredProduct.id)} />
                </button>
                <span className="absolute top-3 left-3 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white text-[10px] md:text-xs font-bold uppercase rounded-full shadow-lg">
                  #1 Top
                </span>
              </div>
              <div className="p-4 md:p-5">
                <h3 className="text-sm md:text-xl font-semibold text-foreground line-clamp-2 group-hover:text-sky-600 transition-colors">
                  {featuredProduct.name}
                </h3>
                <p className="text-base md:text-2xl font-bold text-foreground mt-2 md:mt-3">
                  ${getPrice(featuredProduct).toFixed(2)}
                </p>
              </div>
            </div>
          </Link>

          {/* Other products - 2 columnas en móvil debajo del destacado */}
          {otherProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={`group transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${(index + 1) * 0.1}s` }}
            >
              <div className="relative bg-white rounded-xl md:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.images?.[0] || "/placeholder.svg?height=300&width=300&query=product"}
                    alt={product.name}
                    className="w-full h-full object-cover p-3 md:p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className={`absolute top-2 right-2 p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                      favorites.has(product.id)
                        ? "bg-red-500 text-white opacity-100 scale-110"
                        : "bg-white/90 backdrop-blur-sm text-foreground hover:bg-white"
                    }`}
                  >
                    <HeartIcon className="w-4 h-4 md:w-5 md:h-5" filled={favorites.has(product.id)} />
                  </button>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-xs md:text-sm font-medium text-foreground line-clamp-2 group-hover:text-sky-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 md:gap-2 mt-1.5 md:mt-2">
                    <span className="text-sm md:text-base font-bold text-foreground">
                      ${getPrice(product).toFixed(2)}
                    </span>
                    {getComparePrice(product) !== null && getComparePrice(product)! > getPrice(product) && (
                      <span className="text-[10px] md:text-xs text-muted-foreground line-through">
                        ${getComparePrice(product)!.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
