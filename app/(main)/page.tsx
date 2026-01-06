import { api, mapBackendProductToFrontend } from "@/lib/api"
import { HeroBanner } from "@/components/sections/hero-banner"
import { ProductCarousel } from "@/components/sections/product-carousel"
import { CategoryGrid } from "@/components/sections/category-grid"
import { TopSales } from "@/components/sections/top-sales"
import { BenefitsBar } from "@/components/sections/benefits-bar"

// Evita que Vercel intente prerenderizar esta página en build (puede colgarse si el backend tarda/no responde).
export const dynamic = "force-dynamic"

async function getBanners() {
  try {
    const banners = await api.getBanners()
    const raw = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").trim()
    const apiBase = (raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw).replace(/\/api\/?$/, "")
    const normalize = (img: string) => {
      if (!img) return "/placeholder.svg"
      if (img.startsWith("http://") || img.startsWith("https://")) return img
      if (img.startsWith("/")) return `${apiBase}${img}`
      return `${apiBase}/uploads/${img}`
    }
    // Mapear a formato que usa HeroBanner
    return (Array.isArray(banners) ? banners : []).map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.description || undefined,
      image: normalize(b.image),
      link: b.link || undefined,
      buttonText: b.link ? "Ver más" : undefined,
      backgroundColor: "#e0f2fe",
    }))
  } catch (error) {
    return []
  }
}

async function getAllProducts() {
  try {
    const params = new URLSearchParams({
      limit: "100",
      page: "1",
    })
    const response = await api.get(`/products?${params.toString()}`)
    const productsResponse = response.data as any
    const rawProducts = Array.isArray(productsResponse?.data)
      ? productsResponse.data
      : Array.isArray(productsResponse?.data?.data)
        ? productsResponse.data.data
        : []
    const meta = productsResponse?.meta ?? productsResponse?.data?.meta
    return {
      ...productsResponse,
      data: rawProducts.map(mapBackendProductToFrontend),
      ...(meta ? { meta } : {}),
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { data: [], meta: { total: 0 } }
  }
}

async function getCategories() {
  try {
    const response = await api.get("/categories")
    return response.data || []
  } catch (error) {
    return []
  }
}

export default async function Home() {
  const [banners, productsData, categories] = await Promise.all([getBanners(), getAllProducts(), getCategories()])

  const products = productsData.data || []

  // Normalizar categorías desde BD (mantener diseño actual: solo cambia fuente de datos)
  const homeCategories = (Array.isArray(categories) ? categories : []).map((c: any) => ({
    id: String(c.id),
    name: String(c.name),
    slug: c.slug ? String(c.slug) : undefined,
    image: c.image ? String(c.image) : undefined,
  }))

  // Reutilizar las categorías de BD en todas las secciones (cards / circles / banners)
  // Mantener el layout actual: diferentes secciones pueden mostrar distintos subconjuntos.
  const displayCategories = homeCategories.slice(0, 8)
  const circleCategories = homeCategories.slice(0, 12)
  const bannerCategories = homeCategories.slice(4, 12).length > 0 ? homeCategories.slice(4, 12) : homeCategories

  const sampleProducts =
    products.length > 0
      ? products
      : Array.from({ length: 12 }, (_, i) => {
          const productNames = [
            "Spaghetti Premium 500g",
            "Coditos Artesanales",
            "Pasta de Tomate Casera",
            "Cerveza Artesanal IPA",
            "Cemento Portland 50kg",
            "Arena Fina Construcción",
            "Cigarros Habanos",
            "Macarrones Integrales",
            "Cerveza Lager Premium",
            "Mortero Especial",
            "Tabaco Selección",
            "Lasaña Fresca",
          ]
          return {
            id: `sample-${i}`,
            slug: `product-${i}`,
            name: productNames[i] || `Producto ${i + 1}`,
            images: [`/placeholder.svg?height=300&width=300&query=${productNames[i] || `product ${i + 1}`}`],
            priceUSD: 9.99 + i * 3,
            comparePriceUSD: i % 3 === 0 ? 14.99 + i * 3 : undefined,
          }
        })

  // Ofertas del día: solo productos con descuento (comparePrice > price)
  const offersOfDay = sampleProducts.filter((p: any) => {
    const price = typeof p.priceUSD === "number" ? p.priceUSD : 0
    const compare = typeof p.comparePriceUSD === "number" ? p.comparePriceUSD : undefined
    return compare !== undefined && compare > price
  })

  // Productos destacados: solo productos marcados como isFeatured (desde admin)
  const featuredProducts = sampleProducts.filter((p: any) => !!p?.isFeatured)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <HeroBanner banners={banners} />

      <ProductCarousel
        title="Ofertas del Día"
        products={offersOfDay.slice(0, 8)}
        viewAllLink="/products?filter=offers"
        badgeType="sale"
        autoSlide={true}
      />

      {/* Category Cards */}
      <CategoryGrid categories={displayCategories} variant="cards" />

      {/* Top Sales */}
      <TopSales products={sampleProducts.slice(0, 5)} />

      {/* More Products */}
      <ProductCarousel
        title="Productos Destacados"
        products={(featuredProducts.length > 0 ? featuredProducts : sampleProducts).slice(0, 8)}
        viewAllLink="/products?filter=top"
        badgeType="personalized"
      />

      {/* Circle Categories */}
      <CategoryGrid categories={circleCategories} variant="circles" title="Explora por Categoría" />

      {/* Banner Categories */}
      <CategoryGrid categories={bannerCategories} variant="banners" />

      {/* Benefits */}
      <BenefitsBar />
    </div>
  )
}
