'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchAutocomplete } from './search-autocomplete';

interface ProductFiltersProps {
  categories?: Array<{ id: string; name: string; slug: string }>;
}

export interface SearchFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'created-desc';
}

export function ProductFilters({ categories = [] }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Sincronizar searchTerm con la URL cuando cambia externamente (no cuando estamos escribiendo)
  // IMPORTANTE: El navbar tiene prioridad, así que solo sincronizamos si NO viene del navbar
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    // Solo sincronizar si el cambio viene de fuera y NO estamos escribiendo en el buscador de productos
    const isProductInputFocused = document.activeElement?.closest('[data-product-search]');
    const isNavbarInputFocused = document.activeElement?.closest('[data-navbar-search]');
    
    // Si el navbar está enfocado, no sincronizar (el navbar tiene prioridad)
    if (isNavbarInputFocused) {
      return;
    }
    
    if (urlSearch !== searchTerm && urlSearch !== debouncedSearch && !isProductInputFocused) {
      setSearchTerm(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('search')]);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Actualizar URL solo cuando cambia debouncedSearch (no cuando cambian otros searchParams)
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    
    // Solo actualizar si el valor realmente cambió
    if (debouncedSearch === currentSearch) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '/products';
    router.replace(newUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]); // Solo dependemos de debouncedSearch, no de searchParams

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearchTerm('');
    router.replace('/products', { scroll: false });
  };

  const hasActiveFilters = 
    searchParams.get('search') ||
    searchParams.get('categoryId') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    searchParams.get('inStock') === 'true' ||
    searchParams.get('isFeatured') === 'true' ||
    searchParams.get('sortBy');

  return (
    <div className="mb-6">
      {/* Barra de búsqueda y filtros principales */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Búsqueda con autocompletado */}
        <div data-product-search="true">
          <SearchAutocomplete
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar productos..."
          />
        </div>

        {/* Botón de filtros avanzados */}
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-sky-500 text-white rounded-full">
              {Array.from(searchParams.entries()).filter(([k]) => k !== 'page').length}
            </span>
          )}
        </Button>

        {/* Ordenar */}
        <Select
          value={searchParams.get('sortBy') || 'created-desc'}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created-desc">Novedades</SelectItem>
            <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
            <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
            <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
            <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Panel de filtros avanzados */}
      {isOpen && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Filtros avanzados</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                <X className="w-4 h-4 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categoría */}
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={searchParams.get('categoryId') || ''}
                onValueChange={(value) => updateFilter('categoryId', value || null)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Precio mínimo */}
            <div>
              <Label htmlFor="minPrice">Precio mínimo (USD)</Label>
              <Input
                id="minPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={searchParams.get('minPrice') || ''}
                onChange={(e) => updateFilter('minPrice', e.target.value || null)}
              />
            </div>

            {/* Precio máximo */}
            <div>
              <Label htmlFor="maxPrice">Precio máximo (USD)</Label>
              <Input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="999.99"
                value={searchParams.get('maxPrice') || ''}
                onChange={(e) => updateFilter('maxPrice', e.target.value || null)}
              />
            </div>

            {/* Disponibilidad */}
            <div className="flex flex-col">
              <Label className="mb-2">Disponibilidad</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={searchParams.get('inStock') === 'true'}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <Label htmlFor="inStock" className="font-normal cursor-pointer">
                  Solo con stock
                </Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={searchParams.get('isFeatured') === 'true'}
                  onChange={(e) => updateFilter('isFeatured', e.target.checked ? 'true' : null)}
                  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <Label htmlFor="isFeatured" className="font-normal cursor-pointer">
                  Solo destacados
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros activos (chips) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {searchParams.get('search') && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
              Búsqueda: {searchParams.get('search')}
              <button
                onClick={() => {
                  setSearchTerm('');
                  updateFilter('search', null);
                }}
                className="hover:text-sky-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchParams.get('categoryId') && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
              Categoría: {categories.find(c => c.id === searchParams.get('categoryId'))?.name || 'Seleccionada'}
              <button
                onClick={() => updateFilter('categoryId', null)}
                className="hover:text-sky-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchParams.get('minPrice') && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
              Min: ${searchParams.get('minPrice')}
              <button
                onClick={() => updateFilter('minPrice', null)}
                className="hover:text-sky-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchParams.get('maxPrice') && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
              Max: ${searchParams.get('maxPrice')}
              <button
                onClick={() => updateFilter('maxPrice', null)}
                className="hover:text-sky-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchParams.get('inStock') === 'true' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
              Con stock
              <button
                onClick={() => updateFilter('inStock', null)}
                className="hover:text-sky-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchParams.get('isFeatured') === 'true' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
              Destacados
              <button
                onClick={() => updateFilter('isFeatured', null)}
                className="hover:text-sky-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
