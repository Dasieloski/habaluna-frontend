'use client'

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

export default function ProductsClient() {
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

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setSortOpen(!sortOpen)
                setFilterOpen(false)
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-sky-300 transition-colors"
            >
              <span>Ordenar por</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            {sortOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-20">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                  Relevancia
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                  Precio: menor a mayor
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                  Precio: mayor a menor
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 hover:text-sky-600 transition-colors">
                  Novedades
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-600">Cargando productos...</div>
        ) : pagedProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-600">No se encontraron productos.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {pagedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden relative">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin imagen</div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        toggleFavorite(p.id)
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                    >
                      <HeartIcon className="w-4 h-4" filled={favorites.has(p.id)} />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{p.name}</h3>
                    <p className="mt-2 text-sm font-bold text-sky-700">
                      {(toNumber(p.variants?.[0]?.priceUSD ?? p.priceUSD) ?? 0).toFixed(2)} €
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

