"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { HeartIcon, ChevronDownIcon } from "@/components/icons/streamline-icons"
import { ChevronRight, Home } from "lucide-react"
import { api, mapBackendProductToFrontend } from "@/lib/api"
import { toNumber } from "@/lib/money"

const filterTags = [
  "Novedades",
  "Exclusivos",
  "Nuevo",
  "Personalizable",
  "Materiales",
  "Bebidas",
  "Alimentos",
  "Construcción",
]

type UIProduct = {
  id: string
  name: string
  slug: string
  priceUSD?: number
  comparePriceUSD?: number
  images?: string[]
  variants?: Array<{ priceUSD?: number; comparePriceUSD?: number }>
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const filterParam = (searchParams.get("filter") || "").toLowerCase()
  const categoryIdParam = searchParams.get("categoryId") || ""
  const searchParam = searchParams.get("search") || ""

  const [products, setProducts] = useState<UIProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortOpen, setSortOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        setLoading(true)
        setCurrentPage(1)

        const shouldFilterFeatured = filterParam === "top" || filterParam === "featured"
        const shouldFilterCombos = filterParam === "combos" || filterParam === "combo"

        const response = await api.getProducts({
          page: 1,
          limit: 200,
          ...(categoryIdParam ? { categoryId: categoryIdParam } : {}),
          ...(searchParam ? { search: searchParam } : {}),
          ...(shouldFilterFeatured ? { isFeatured: true } : {}),
          ...(shouldFilterCombos ? { isCombo: true } : {}),
        })
        const mapped = response.data.map(mapBackendProductToFrontend) as any[]

        let next: UIProduct[] = mapped.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          priceUSD: p.priceUSD,
          comparePriceUSD: p.comparePriceUSD,
          images: p.images,
          variants: p.variants,
        }))

        if (filterParam === "offers") {
          next = next.filter((p) => {
            const price = toNumber(p.variants?.[0]?.priceUSD ?? p.priceUSD) ?? 0
            const compare = toNumber(p.variants?.[0]?.comparePriceUSD ?? p.comparePriceUSD)
            return compare !== null && compare > price
          })
        }

        if (!cancelled) setProducts(next)
      } catch (e) {
        console.error("Error al cargar productos:", e)
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [filterParam, categoryIdParam, searchParam])

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const toggleFavorite = (id: string) => {
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

  const totalPages = Math.ceil(products.length / productsPerPage)
  const pagedProducts = products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-sky-600 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Página de inicio</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-400">Productos</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Todos los productos</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 md:mb-8">
          {filterParam === "offers"
            ? "Ofertas"
            : filterParam === "top" || filterParam === "featured"
              ? "Productos destacados"
              : categoryIdParam
                ? "Productos"
                : "Todos los productos"}
        </h1>

        {/* Filter Tags - Horizontal scrollable chips */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border ${
                  activeFilters.includes(tag)
                    ? "bg-sky-100 text-sky-700 border-sky-300"
                    : "bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:text-sky-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setFilterOpen(!filterOpen)
                  setSortOpen(false)
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-medium hover:border-sky-300 transition-colors"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="hidden xs:inline">Filtro</span>
                <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              {filterOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-20">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                    Por precio
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                    Por categoría
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                    Más vendidos
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                    Personalizable
                  </button>
                </div>
              )}
            </div>

            {/* Additional filter dropdowns */}
            <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-sky-300 transition-colors">
              Por categoría
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-sky-300 transition-colors">
              Personalizable
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setSortOpen(!sortOpen)
                  setFilterOpen(false)
                }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-medium hover:border-sky-300 transition-colors"
              >
                Ordenar
                <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              {sortOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-20">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                    Más recientes
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                    Precio: menor a mayor
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                    Precio: mayor a menor
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                    Más vendidos
                  </button>
                </div>
              )}
            </div>

            {/* Product count */}
            <span className="text-xs sm:text-sm text-gray-500">{products.length} productos</span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
              {pagedProducts.map((product) => {
                const price = toNumber(product.variants?.[0]?.priceUSD ?? product.priceUSD) ?? 0
                const comparePrice = toNumber(product.variants?.[0]?.comparePriceUSD ?? product.comparePriceUSD)
                const hasDiscount = comparePrice !== null && comparePrice > price
                const isFavorite = favorites.has(product.id)
                const image = product.images?.[0] || "/placeholder.svg"

                return (
                  <div key={product.id} className="group">
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
                        {/* Product Image */}
                        <div className="aspect-square relative overflow-hidden bg-gray-50">
                          <img
                            src={image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            crossOrigin="anonymous"
                          />

                          {/* Favorite Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              toggleFavorite(product.id)
                            }}
                            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
                              isFavorite
                                ? "bg-sky-500 text-white"
                                : "bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-sky-500 shadow-sm"
                            }`}
                          >
                            <HeartIcon className="w-4 h-4" filled={isFavorite} />
                          </button>

                          {/* Discount Badge */}
                          {hasDiscount && (
                            <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase">
                              Oferta
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="pt-3 px-1">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] hover:text-sky-600 transition-colors cursor-pointer leading-tight">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-foreground">{price.toFixed(2)} €</span>
                        {hasDiscount && (
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            {comparePrice!.toFixed(2)} €
                          </span>
                        )}
                      </div>
                      {product.variants && product.variants.length > 1 && (
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                          {product.variants.length} opciones
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Empty State */}
            {products.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sky-50 flex items-center justify-center">
                  <svg className="w-10 h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
                <p className="text-gray-500 mb-6">No encontramos productos con los filtros seleccionados</p>
                <button
                  onClick={() => setActiveFilters([])}
                  className="px-6 py-2.5 bg-sky-500 text-white rounded-full font-medium hover:bg-sky-600 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 sm:px-4 py-2 rounded-lg border text-sm transition-colors ${
                    currentPage === 1
                      ? "border-gray-100 text-gray-300 cursor-not-allowed"
                      : "border-gray-200 hover:border-sky-300 hover:text-sky-600"
                  }`}
                >
                  Anterior
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-sky-500 text-white"
                          : "border border-gray-200 hover:border-sky-300 hover:text-sky-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 sm:px-4 py-2 rounded-lg border text-sm transition-colors ${
                    currentPage === totalPages
                      ? "border-gray-100 text-gray-300 cursor-not-allowed"
                      : "border-gray-200 hover:border-sky-300 hover:text-sky-600"
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Close dropdowns on click outside */}
      {(filterOpen || sortOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setFilterOpen(false)
            setSortOpen(false)
          }}
        />
      )}
    </div>
  )
}
