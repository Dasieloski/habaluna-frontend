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
          <div className="py-16 text-center text-sm text-gray-600">Cargando productos...</div>
        ) : pagedProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-600 mb-4">No se encontraron productos.</p>
            <p className="text-xs text-gray-500">
              Intenta ajustar los filtros o realizar una búsqueda diferente.
            </p>
          </div>
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
                      <OptimizedImage
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        className="transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        objectFit="cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs">Sin imagen</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(p.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                    >
                      <HeartIcon className="w-4 h-4" filled={favorites.has(p.id)} />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{p.name}</h3>
                    <p className="mt-2 text-sm font-bold text-sky-700">
                      ${(toNumber(p.variants?.[0]?.priceUSD ?? p.priceUSD) ?? 0).toFixed(2)}
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
  );
}
