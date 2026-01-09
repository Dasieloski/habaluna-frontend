'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeartIcon } from '@/components/icons/streamline-icons';
import { ChevronRight, Home } from 'lucide-react';
import { api, mapBackendProductToFrontend } from '@/lib/api';
import { toNumber } from '@/lib/money';
import { ProductFilters, SearchFilters } from '@/components/product/product-filters';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { AnimatedList } from '@/components/ui/animated-list';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton } from '@/components/product/product-card-skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

type UIProduct = {
  id: string;
  name: string;
  slug: string;
  priceUSD?: number;
  comparePriceUSD?: number;
  images?: string[];
  variants?: Array<{ priceUSD?: number; comparePriceUSD?: number }>;
};

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Cargar categorías
  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
    }).catch(() => {
      // Ignorar errores
    });
  }, []);

  // Cargar productos cuando cambian los filtros
  const loadProducts = useCallback(async () => {
    let cancelled = false;

    try {
      setLoading(true);

      const filters: any = {
        page: currentPage,
        limit: productsPerPage,
      };

      // Aplicar filtros de la URL
      if (searchParams.get('search')) filters.search = searchParams.get('search');
      if (searchParams.get('categoryId')) filters.categoryId = searchParams.get('categoryId');
      if (searchParams.get('minPrice')) filters.minPrice = Number(searchParams.get('minPrice'));
      if (searchParams.get('maxPrice')) filters.maxPrice = Number(searchParams.get('maxPrice'));
      if (searchParams.get('inStock') === 'true') filters.inStock = true;
      if (searchParams.get('isFeatured') === 'true') filters.isFeatured = true;
      if (searchParams.get('sortBy')) filters.sortBy = searchParams.get('sortBy');

      const response = await api.getProducts(filters);
      const mapped = response.data.map(mapBackendProductToFrontend) as any[];

      const next: UIProduct[] = mapped.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        priceUSD: p.priceUSD,
        comparePriceUSD: p.comparePriceUSD,
        images: p.images,
        variants: p.variants,
      }));

      if (!cancelled) {
        setProducts(next);
        setTotalResults(response.meta?.total || 0);
      }
    } catch (e) {
      console.error('Error al cargar productos:', e);
      if (!cancelled) {
        setProducts([]);
        setTotalResults(0);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }, [searchParams.toString(), currentPage]);

  // Resetear página cuando cambian los filtros (pero no la página misma)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (!pageParam || pageParam === '1') {
      setCurrentPage(1);
    }
  }, [
    searchParams.get('search'),
    searchParams.get('categoryId'),
    searchParams.get('minPrice'),
    searchParams.get('maxPrice'),
    searchParams.get('inStock'),
    searchParams.get('isFeatured'),
    searchParams.get('sortBy'),
  ]);

  // Cargar productos cuando cambian los filtros o la página
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const totalPages = Math.ceil(totalResults / productsPerPage);
  const pagedProducts = products;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/"
              className="hover:text-sky-600 transition-colors flex items-center gap-1"
            >
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
          Productos
        </h1>

        {/* Filtros */}
        <ProductFilters categories={categories} />

        {/* Contador de resultados */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            {totalResults === 0
              ? 'No se encontraron productos'
              : totalResults === 1
                ? '1 producto encontrado'
                : `${totalResults} productos encontrados`}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <AnimatedList
            staggerDelay={0.03}
            enableAnimations={true}
            animateOnViewport={false}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </AnimatedList>
        ) : pagedProducts.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className="w-16 h-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
            title="No se encontraron productos"
            description="Intenta ajustar los filtros o realizar una búsqueda diferente."
            className="py-16"
          />
        ) : (
          <>
            <AnimatedList
              staggerDelay={0.05}
              enableAnimations={true}
              animateOnViewport={true}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {pagedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    images: p.images,
                    priceUSD: toNumber(p.variants?.[0]?.priceUSD ?? p.priceUSD) ?? undefined,
                    comparePriceUSD: toNumber(p.variants?.[0]?.comparePriceUSD ?? p.comparePriceUSD) ?? undefined,
                    variants: p.variants?.map((v: any) => ({
                      id: v.id,
                      name: v.name,
                      priceUSD: v.priceUSD,
                      comparePriceUSD: v.comparePriceUSD,
                    })),
                  }}
                />
              ))}
            </AnimatedList>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
