"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"

interface Category {
  id: string
  name: string
  image?: string
  slug?: string
}

interface CategoryGridProps {
  categories: Category[]
  variant?: "cards" | "circles" | "banners"
  title?: string
}

const DEFAULT_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=500&fit=crop",
]

const DEFAULT_CIRCLE_IMAGES = [
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&h=120&fit=crop",
]

export function CategoryGrid({ categories, variant = "cards", title }: CategoryGridProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
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

  if (!categories || categories.length === 0) return null

  if (variant === "circles") {
    return (
      <section ref={sectionRef} className="py-10 md:py-16 bg-gradient-to-b from-white to-sky-50/30">
        <div className="container mx-auto px-4">
          {title && (
            <h2
              className={`text-xl md:text-3xl font-bold text-foreground text-center mb-8 md:mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              {title}
            </h2>
          )}
          <div className="grid grid-cols-3 md:flex md:flex-wrap md:justify-center gap-4 md:gap-12">
            {categories.slice(0, 6).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className={`group flex flex-col items-center transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 md:w-28 md:h-28 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 mb-2 md:mb-4 ring-2 md:ring-4 ring-transparent group-hover:ring-sky-300 transition-all duration-300 group-hover:scale-110 shadow-lg">
                  {!imageErrors.has(category.id) ? (
                    <img
                      src={category.image || DEFAULT_CIRCLE_IMAGES[index % DEFAULT_CIRCLE_IMAGES.length]}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      onError={() => setImageErrors(prev => new Set(prev).add(category.id))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-100">
                      <span className="text-xs font-semibold text-sky-600">{category.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs md:text-sm font-semibold text-foreground text-center group-hover:text-sky-600 transition-colors line-clamp-1">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === "banners") {
    const colors = ["#e0f2fe", "#ecfeff", "#f0f9ff", "#e0f7fa"]
    return (
      <section ref={sectionRef} className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {categories.slice(0, 4).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className={`group relative aspect-[3/4] md:aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  backgroundColor: colors[index % colors.length],
                  transitionDelay: `${index * 0.1}s`,
                }}
              >
                {!imageErrors.has(category.id) ? (
                  <img
                    src={category.image || DEFAULT_CATEGORY_IMAGES[index % DEFAULT_CATEGORY_IMAGES.length]}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    onError={() => setImageErrors(prev => new Set(prev).add(category.id))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-100">
                    <span className="text-2xl font-bold text-sky-600">{category.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 md:bottom-5 left-3 md:left-5 right-3 md:right-5">
                  <h3 className="text-white text-sm md:text-xl font-bold mb-0.5 md:mb-1">{category.name}</h3>
                  <span className="text-white/90 text-[10px] md:text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver más →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default cards variant
  return (
    <section ref={sectionRef} className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {categories.slice(0, 4).map((category, index) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              className={`group relative aspect-[4/5] md:aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              {!imageErrors.has(category.id) ? (
                <img
                  src={category.image || DEFAULT_CATEGORY_IMAGES[index % DEFAULT_CATEGORY_IMAGES.length]}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  decoding="async"
                  onError={() => setImageErrors(prev => new Set(prev).add(category.id))}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-100">
                  <span className="text-2xl font-bold text-sky-600">{category.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-3 md:bottom-5 left-3 md:left-5 right-3 md:right-5">
                <h3 className="text-white text-base md:text-2xl font-bold mb-0.5 md:mb-1">{category.name}</h3>
                <span className="text-white/90 text-[10px] md:text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explorar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
